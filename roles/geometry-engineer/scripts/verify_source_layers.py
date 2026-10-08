"""Independently compare the round-02 GLB to read-only Rhino source caches.

Does not import the exporter. Selection is reconstructed from source solid/group
identity, not the export's bounds filter. Working audit and geometry plots stay
under the explicitly authorized D-drive round-02 geometry folder.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import struct
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as rhino
import numpy as np

EXPECTED_SOURCE = 'c12ca628488a4449ea587965410d7df6baa815b36397c8344e2e14a3f533b14c'
SHELL_ID = '03aa204e-af4c-4e84-9007-ac16d19c1ecc'
WORK_ROOT = Path('D:/JosHsuan_Website/_work/bending-active-thesis/round-02/geometry')


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_glb(path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from('<III', data)
    require(magic == 0x46546c67 and version == 2 and length == len(data), 'Invalid GLB header')
    offset, chunks = 12, {}
    while offset < length:
        size, kind = struct.unpack_from('<I4s', data, offset)
        require(size % 4 == 0 and offset + 8 + size <= length and kind not in chunks, 'Invalid GLB chunk')
        chunks[kind] = data[offset + 8:offset + 8 + size]
        offset += 8 + size
    require(offset == length and set(chunks) == {b'JSON', b'BIN\0'}, 'Unexpected GLB chunks')
    document = json.loads(chunks[b'JSON'])
    binary = chunks[b'BIN\0']
    require(len(document['buffers']) == 1 and 'uri' not in document['buffers'][0], 'Unexpected external buffers')
    require(document['buffers'][0]['byteLength'] <= len(binary), 'Binary buffer truncated')

    def accessor(index):
        item = document['accessors'][index]
        require('sparse' not in item and not item.get('normalized', False), 'Unexpected accessor encoding')
        view = document['bufferViews'][item['bufferView']]
        require(view['buffer'] == 0, 'Unexpected buffer index')
        dtype = {5126: '<f4', 5125: '<u4'}.get(item['componentType'])
        width = {'VEC3': 3, 'SCALAR': 1}.get(item['type'])
        require(dtype is not None and width is not None and item['count'] > 0, 'Unexpected accessor type')
        stride = view.get('byteStride', width * 4)
        relative_offset = item.get('byteOffset', 0)
        total_offset = view.get('byteOffset', 0) + relative_offset
        require(stride >= width * 4 and relative_offset + (item['count'] - 1) * stride + width * 4 <= view['byteLength'], 'Accessor exceeds view')
        require(total_offset + (item['count'] - 1) * stride + width * 4 <= len(binary), 'Accessor exceeds binary')
        return np.ndarray((item['count'], width), dtype=dtype, buffer=binary, offset=total_offset, strides=(stride, 4)).copy()

    nodes = document['nodes']
    require(len(nodes) == 3 and set(document['scenes'][document['scene']]['nodes']) == set(range(3)), 'Expected exactly three root source layers')
    decoded = {}
    for node in nodes:
        require(not any(key in node for key in ['matrix', 'translation', 'rotation', 'scale', 'children']), 'Unexpected node transform')
        name = node['name']
        require(name not in decoded and name in ['shell', 'base-lower', 'base-upper'], 'Unexpected source layer')
        primitives = document['meshes'][node['mesh']]['primitives']
        require(len(primitives) == 1 and primitives[0].get('mode', 4) == 4, 'Expected triangle primitive')
        primitive = primitives[0]
        positions = accessor(primitive['attributes']['POSITION'])
        normals = accessor(primitive['attributes']['NORMAL'])
        indices = accessor(primitive['indices']).reshape(-1)
        require(len(indices) % 3 == 0 and normals.shape == positions.shape and np.isfinite(positions).all() and np.isfinite(normals).all(), 'Invalid mesh arrays')
        triangles = indices.reshape(-1, 3)
        require(triangles.max() < len(positions) and (np.diff(np.sort(triangles, axis=1), axis=1) > 0).all(), 'Invalid triangle indices')
        decoded[name] = {'positions': positions, 'normals': normals, 'triangles': triangles}
    return decoded


def reference_layer(objects, origin):
    positions, normals, triangles, records = [], [], [], []
    vertex_offset = 0
    for obj in objects:
        geometry = obj.Geometry
        meshes = [geometry] if isinstance(geometry, rhino.Mesh) else [face.GetMesh(rhino.MeshType.Render) for face in geometry.Faces]
        require(all(mesh is not None and mesh.IsValid for mesh in meshes), 'Missing or invalid source cached mesh')
        object_vertices = object_triangles = 0
        for mesh in meshes:
            xyz = np.asarray([(point.X, point.Y, point.Z) for point in mesh.Vertices], dtype=np.float64)
            source_normals = np.asarray([(normal.X, normal.Y, normal.Z) for normal in mesh.Normals], dtype=np.float64)
            require(source_normals.shape == xyz.shape, 'Source normal coverage differs')
            translated = (xyz - origin) / 1000.0
            positions.append(np.column_stack((translated[:, 0], translated[:, 2], -translated[:, 1])))
            normals.append(np.column_stack((source_normals[:, 0], source_normals[:, 2], -source_normals[:, 1])))
            faces = np.asarray([list(face) for face in mesh.Faces], dtype=np.uint32)
            # Preserve source face order; quads become ABC then ACD.
            expanded = []
            for a, b, c, d in faces:
                expanded.append((a, b, c))
                if c != d:
                    expanded.append((a, c, d))
            triangles.append(np.asarray(expanded, dtype=np.uint32) + vertex_offset)
            vertex_offset += len(xyz)
            object_vertices += len(xyz)
            object_triangles += len(expanded)
        records.append({'sourceObjectId': str(obj.Attributes.Id), 'sourceGroups': list(obj.Attributes.GetGroupList()), 'vertices': object_vertices, 'triangles': object_triangles,
                        'sourceSolid': bool(geometry.IsSolid) if isinstance(geometry, rhino.Brep) else None, 'cachedFaces': len(meshes)})
    return np.concatenate(positions), np.concatenate(normals), np.concatenate(triangles), records


def plot_geometry(decoded, output):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.collections import PolyCollection
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    colours = {'shell': '#9cacb5', 'base-lower': '#925830', 'base-upper': '#d6a46d'}
    fig = plt.figure(figsize=(16, 12), facecolor='#f5f3ed', layout='constrained')
    full = fig.add_subplot(221, projection='3d')
    base = fig.add_subplot(222, projection='3d')
    plan = fig.add_subplot(223)
    section = fig.add_subplot(224)
    all_points = np.concatenate([layer['positions'] for layer in decoded.values()])
    mins, maxs = all_points.min(axis=0), all_points.max(axis=0)
    full_faces, full_colours, base_faces, base_colours = [], [], [], []
    for name, layer in decoded.items():
        points, indices = layer['positions'], layer['triangles']
        faces = points[indices]
        # Matplotlib uses Z-up: display source viewer coordinates as (X, Z, Y).
        full_faces.append(faces[:, :, [0, 2, 1]])
        full_colours.extend([colours[name]] * len(faces))
        if name != 'shell':
            base_faces.append(faces[:, :, [0, 2, 1]])
            base_colours.extend([colours[name]] * len(faces))
            plan.add_collection(PolyCollection(faces[:, :, [0, 2]], facecolors=colours[name], linewidths=0))
            section.add_collection(PolyCollection(faces[:, :, [0, 1]] * [1, 1000], facecolors=colours[name], linewidths=0))
    # One collection depth-sorts individual faces across the three source layers;
    # separate collections would incorrectly paint a whole lower layer on top.
    full.add_collection3d(Poly3DCollection(np.concatenate(full_faces), facecolors=full_colours, linewidths=0))
    base.add_collection3d(Poly3DCollection(np.concatenate(base_faces), facecolors=base_colours, linewidths=0))
    for ax in [full, base]:
        ax.set_xlim(mins[0] - .05, maxs[0] + .05)
        ax.set_ylim(mins[2] - .05, maxs[2] + .05)
        ax.set_xlabel('Viewer X [m]'); ax.set_ylabel('Viewer Z [m]'); ax.set_zlabel('Viewer Y [m]')
        ax.view_init(elev=29, azim=-61)
    full.set_zlim(mins[1] - .03, maxs[1] + .03)
    full.set_box_aspect((maxs[0] - mins[0], maxs[2] - mins[2], maxs[1] - mins[1]))
    full.set_title('Actual shell + both source base layers | all 227,521 triangles')
    base_min = min(decoded[name]['positions'][:, 1].min() for name in ['base-lower', 'base-upper'])
    base_max = max(decoded[name]['positions'][:, 1].max() for name in ['base-lower', 'base-upper'])
    base.set_zlim(base_min - .004, base_max + .004)
    base.set_box_aspect((maxs[0] - mins[0], maxs[2] - mins[2], .028))
    base.set_zticks([]); base.set_zlabel('')
    base.text2D(.06, .88, 'Both real source layers: 20 mm combined thickness\nSee the expanded elevation below for the layer heights.', transform=base.transAxes, fontsize=9)
    base.set_title('Source base alone | true thickness, no added geometry')
    plan.autoscale(); plan.set_aspect('equal'); plan.set_xlabel('Viewer X [m]'); plan.set_ylabel('Viewer Z [m]')
    plan.set_title('Base plan | lower group 78 (dark) + upper group 77 (light)')
    section.autoscale(); section.set_ylim(base_min * 1000 - 2, base_max * 1000 + 2)
    section.set_xlabel('Viewer X [m]'); section.set_ylabel('Viewer Y [mm]')
    section.axhline(0, color='#234a62', linewidth=.8, linestyle='--', label='Original shell minimum Y = 0')
    section.legend(loc='upper right', fontsize=8)
    section.set_title('Base elevation | vertical scale expanded, source placement unchanged')
    fig.suptitle('Independent source-layer verification — real Rhino cached mesh geometry\nColours distinguish source layers; no claim of material identity or fabrication order.', fontsize=14)
    target = output / 'source-layers-independent-geometry.png'
    fig.savefig(target, dpi=160)
    plt.close(fig)
    return target


def verify(source, work):
    work = work.resolve()
    require(work == WORK_ROOT.resolve() or WORK_ROOT.resolve() in work.parents, 'Output must remain in the authorized round-02 geometry work folder')
    require(source.resolve() != work and work not in source.resolve().parents, 'Source must remain disjoint from working output')
    model, metadata_path = work / 'source-layers.glb', work / 'source-layers.json'
    source_before, glb_before = digest(source), digest(model)
    require(source_before == EXPECTED_SOURCE, 'Unexpected source revision')
    metadata = json.loads(metadata_path.read_text(encoding='utf-8'))
    require(metadata['sourceRevision'] == source_before and metadata['revision'] == glb_before and metadata['bytes'] == model.stat().st_size, 'Metadata hash/size mismatch')
    require(metadata['publishable'] is False and metadata['viewerUnits'] == 'meters' and metadata['upAxis'] == 'Y', 'Unexpected handoff state')
    document = rhino.File3dm.Read(str(source))
    require(document is not None and document.Settings.ModelUnitSystem == rhino.UnitSystem.Millimeters, 'Unexpected source units')
    shell = next(obj for obj in document.Objects if str(obj.Attributes.Id) == SHELL_ID)
    box = shell.Geometry.GetBoundingBox()
    origin = np.asarray([(box.Min.X + box.Max.X) / 2, (box.Min.Y + box.Max.Y) / 2, box.Min.Z])
    selection = {'shell': [shell], 'base-lower': [], 'base-upper': []}
    excluded = Counter()
    for obj in document.Objects:
        groups = tuple(obj.Attributes.GetGroupList())
        if groups not in [(77,), (78,)]:
            continue
        geometry, attrs = obj.Geometry, obj.Attributes
        if not isinstance(geometry, rhino.Brep) or not geometry.IsSolid:
            excluded[type(geometry).__name__] += 1
            continue
        require(attrs.Visible and str(attrs.Mode) == 'ObjectMode.Normal' and document.Layers[attrs.LayerIndex].Visible, 'Selected source solid is hidden')
        # Independently select all solid objects in each exact authored group.
        name = 'base-lower' if groups == (78,) else 'base-upper'
        bounds = geometry.GetBoundingBox()
        expected_z = (0, 10) if name == 'base-lower' else (10, 20)
        require(abs(bounds.Min.Z - expected_z[0]) < 1e-6 and abs(bounds.Max.Z - expected_z[1]) < 1e-6, 'Source group thickness differs')
        selection[name].append(obj)
    require([len(selection[name]) for name in selection] == [1, 13, 37], 'Independent source solid selection changed')
    decoded = read_glb(model)
    reports = []
    for name, objects in selection.items():
        expected_positions, expected_normals, expected_triangles, object_records = reference_layer(objects, origin)
        actual = decoded[name]
        require(actual['positions'].shape == expected_positions.shape and actual['triangles'].shape == expected_triangles.shape, 'Source geometry coverage differs')
        position_error = float(np.abs(actual['positions'].astype(np.float64) - expected_positions).max())
        normal_error = float(np.abs(actual['normals'].astype(np.float64) - expected_normals).max())
        require(position_error < 1e-6 and normal_error == 0, 'Position/normal comparison failed')
        require(np.array_equal(actual['triangles'], expected_triangles), 'Triangle winding/order/topology differs from source caches')
        meta = next(layer for layer in metadata['layers'] if layer['id'] == name)
        require(len(meta['sourceObjects']) == len(object_records), 'Source object count differs')
        for recorded, inspected in zip(meta['sourceObjects'], object_records):
            require(all(recorded[key] == inspected[key] for key in ['sourceObjectId', 'sourceGroups', 'vertices', 'triangles']), 'Source ID, group, order or object coverage differs')
        require(len({record['sourceObjectId'] for record in object_records}) == len(object_records), 'Duplicate source ID')
        require(meta['vertices'] == len(expected_positions) and meta['triangles'] == len(expected_triangles), 'Layer totals differ')
        require(np.allclose(expected_positions.min(axis=0), meta['bounds']['min'], atol=1e-12, rtol=0) and np.allclose(expected_positions.max(axis=0), meta['bounds']['max'], atol=1e-12, rtol=0), 'Layer placement/bounds mismatch')
        reports.append({'id': name, 'sourceObjects': object_records, 'vertices': len(expected_positions), 'triangles': len(expected_triangles), 'maximumPositionErrorMeters': position_error, 'maximumNormalError': normal_error, 'triangleIndicesAndOrderExact': True,
                        'decodedBounds': {'min': actual['positions'].min(axis=0).tolist(), 'max': actual['positions'].max(axis=0).tolist()}})
    vertices, triangles = sum(record['vertices'] for record in reports), sum(record['triangles'] for record in reports)
    require(vertices == metadata['vertices'] and triangles == metadata['triangles'], 'Combined totals differ')
    all_points = np.concatenate([layer['positions'] for layer in decoded.values()])
    require(np.allclose(all_points.min(axis=0), metadata['bounds']['min'], atol=1e-6, rtol=0) and np.allclose(all_points.max(axis=0), metadata['bounds']['max'], atol=1e-6, rtol=0), 'Combined bounds differ')
    plot = plot_geometry(decoded, work)
    source_after, glb_after = digest(source), digest(model)
    require(source_before == source_after and glb_before == glb_after, 'Input bytes changed during verification')
    report = {'status': 'passed-source-geometry-verification', 'method': 'Independent GLB binary/accessor decoder and source solid-group selection; no exporter import',
              'source': str(source), 'sourceHashBefore': source_before, 'sourceHashAfter': source_after, 'glbHashBefore': glb_before, 'glbHashAfter': glb_after,
              'originMillimetersIndependentlyDerived': origin.tolist(), 'axisTransform': '(x,y,z) -> (x,z,-y), positive determinant, scale 0.001',
              'vertices': vertices, 'triangles': triangles, 'bytes': model.stat().st_size, 'baseSourceObjectCount': 50, 'excludedGroupGeometryTypes': dict(excluded), 'layers': reports,
              'geometryPlot': str(plot), 'limits': ['Cached Brep render meshes are preserved; this is not a new exact surface tessellation.', 'Source shell/base intersections and relative placement are unchanged; no physical-fit or fabrication-order claim.', 'Plot colours are layer identifiers, not verified material appearance.'],
              'budgets': {'triangles': {'target': 150000, 'actual': triangles, 'passed': triangles <= 150000}, 'desktopSceneBytes': {'target': 5 * 1024**2, 'glbAlone': model.stat().st_size, 'passed': model.stat().st_size <= 5 * 1024**2}, 'mobileSceneBytes': {'target': 2 * 1024**2, 'glbAlone': model.stat().st_size, 'passed': model.stat().st_size <= 2 * 1024**2}, 'note': 'All budgets fail for the preserved full derivative; HDR and runtime overhead are additional. No decimation or budget waiver is implied.'}}
    (work / 'source-layers-independent-verification.private.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ['status', 'vertices', 'triangles', 'bytes', 'baseSourceObjectCount', 'excludedGroupGeometryTypes', 'budgets', 'geometryPlot']}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('work', type=Path)
    args = parser.parse_args()
    verify(args.source, args.work)
