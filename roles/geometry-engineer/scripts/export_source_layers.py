"""Export the reviewed shell and authored base solids from the pinned Rhino source.

Source bytes stay read-only. All working data goes to the explicit output folder.
The three display layers preserve actual source geometry, not fabrication sequencing.
"""
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r

SOURCE_REVISION = 'c12ca628488a4449ea587965410d7df6baa815b36397c8344e2e14a3f533b14c'
SHELL_ID = '03aa204e-af4c-4e84-9007-ac16d19c1ecc'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export(source, output):
    if digest(source) != SOURCE_REVISION:
        raise ValueError('Source revision differs; a new selection review is required.')
    doc = r.File3dm.Read(str(source))
    if doc.Settings.ModelUnitSystem != r.UnitSystem.Millimeters:
        raise ValueError('Expected millimetres')
    shell = next(o for o in doc.Objects if str(o.Attributes.Id) == SHELL_ID)
    b = shell.Geometry.GetBoundingBox()
    origin = [(b.Min.X + b.Max.X) / 2, (b.Min.Y + b.Max.Y) / 2, b.Min.Z]
    layers = {'shell': [shell], 'base-lower': [], 'base-upper': []}
    for obj in doc.Objects:
        g, a = obj.Geometry, obj.Attributes
        if not isinstance(g, r.Brep) or not a.Visible or str(a.Mode) != 'ObjectMode.Normal':
            continue
        box = g.GetBoundingBox()
        groups = tuple(a.GetGroupList())
        # Source-authored solid groups, not a spatial crop. Coplanar construction
        # surfaces in the same groups are deliberately excluded from the solid handoff.
        if groups == (78,) and abs(box.Min.Z) < 1e-6 and abs(box.Max.Z - 10) < 1e-6:
            layers['base-lower'].append(obj)
        elif groups == (77,) and abs(box.Min.Z - 10) < 1e-6 and abs(box.Max.Z - 20) < 1e-6:
            layers['base-upper'].append(obj)
    if [len(layers[k]) for k in layers] != [1, 13, 37]:
        raise ValueError('Reviewed source solid selection changed')
    nodes, meshes, accessors, views, records = [], [], [], [], []
    binary = bytearray()
    max_error = 0

    def append_buffer(values, fmt, width, target, bounds=None):
        nonlocal max_error
        flat = [v for value in values for v in value]
        packed = struct.pack('<' + fmt * len(flat), *flat)
        if fmt == 'f':
            decoded = struct.unpack('<' + fmt * len(flat), packed)
            max_error = max(max_error, max(abs(x - y) for x, y in zip(flat, decoded)))
        view_index = len(views)
        views.append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(packed), 'target': target})
        binary.extend(packed)
        accessor = {'bufferView': view_index, 'componentType': 5126 if fmt == 'f' else 5125,
                    'count': len(values) if width == 3 else len(flat), 'type': 'VEC3' if width == 3 else 'SCALAR'}
        if bounds:
            accessor.update(bounds)
        accessors.append(accessor)
        return len(accessors) - 1

    for layer_name, objects in layers.items():
        positions, normals, triangles, source_faces, cached_faces = [], [], [], 0, 0
        object_records = []
        for obj in objects:
            geometry = obj.Geometry
            chunks = [geometry] if isinstance(geometry, r.Mesh) else [f.GetMesh(r.MeshType.Render) for f in geometry.Faces]
            if any(m is None for m in chunks):
                raise ValueError('Incomplete source cached mesh coverage')
            start_vertices, start_triangles = len(positions), len(triangles)
            for mesh in chunks:
                if len(mesh.Vertices) != len(mesh.Normals) or not mesh.IsValid:
                    raise ValueError('Invalid source mesh or missing normals')
                offset = len(positions)
                positions.extend(((p.X - origin[0]) * .001, (p.Z - origin[2]) * .001, -(p.Y - origin[1]) * .001) for p in mesh.Vertices)
                normals.extend((n.X, n.Z, -n.Y) for n in mesh.Normals)
                for a, b, c, d in mesh.Faces:
                    for tri in [(a, b, c)] if c == d else [(a, b, c), (a, c, d)]:
                        if len(set(tri)) != 3:
                            raise ValueError('Degenerate source face requires explicit review')
                        triangles.append(tuple(index + offset for index in tri))
                source_faces += len(mesh.Faces)
            if isinstance(geometry, r.Brep):
                cached_faces += len(geometry.Faces)
            object_records.append({'sourceObjectId': str(obj.Attributes.Id), 'sourceGroups': list(obj.Attributes.GetGroupList()),
                                   'vertices': len(positions) - start_vertices, 'triangles': len(triangles) - start_triangles})
        if not all(math.isfinite(v) for p in positions + normals for v in p):
            raise ValueError('Nonfinite geometry')
        bounds = {'min': [min(p[i] for p in positions) for i in range(3)], 'max': [max(p[i] for p in positions) for i in range(3)]}
        pa = append_buffer(positions, 'f', 3, 34962, bounds)
        na = append_buffer(normals, 'f', 3, 34962)
        ia = append_buffer(triangles, 'I', 1, 34963)
        index = len(nodes)
        nodes.append({'name': layer_name, 'mesh': index, 'extras': {'role': layer_name}})
        meshes.append({'name': layer_name, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na}, 'indices': ia, 'material': 0 if layer_name == 'shell' else 1}]})
        records.append({'id': layer_name, 'bounds': bounds, 'sourceObjects': object_records, 'vertices': len(positions),
                        'triangles': len(triangles), 'sourceFaces': source_faces, 'cachedBrepFaces': cached_faces})
    combined = {'min': [min(rec['bounds']['min'][i] for rec in records) for i in range(3)],
                'max': [max(rec['bounds']['max'][i] for rec in records) for i in range(3)]}
    materials = [{'name': 'Neutral shell presentation', 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': [.63,.65,.66,1], 'metallicFactor': .82, 'roughnessFactor': .39}},
                 {'name': 'Neutral warm base presentation', 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': [.28,.22,.15,1], 'metallicFactor': .05, 'roughnessFactor': .7}}]
    gltf = {'asset': {'version': '2.0', 'generator': 'Source layer handoff / rhino3dm 8.17.0'}, 'scene': 0,
            'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': meshes, 'materials': materials,
            'buffers': [{'byteLength': len(binary)}], 'bufferViews': views, 'accessors': accessors}
    packed_json = json.dumps(gltf, separators=(',', ':')).encode()
    packed_json += b' ' * (-len(packed_json) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    glb = struct.pack('<III', 0x46546c67, 2, 28 + len(packed_json) + len(binary)) + struct.pack('<I4s', len(packed_json), b'JSON') + packed_json + struct.pack('<I4s', len(binary), b'BIN\0') + binary
    output.mkdir(parents=True, exist_ok=True)
    model_path = output / 'source-layers.glb'
    model_path.write_bytes(glb)
    metadata = {'schemaVersion': 2, 'status': 'local-review-only', 'publishable': False, 'revision': digest(model_path),
                'sourceRevision': SOURCE_REVISION, 'viewerUnits': 'meters', 'upAxis': 'Y', 'bounds': combined, 'layers': records,
                'vertices': sum(rec['vertices'] for rec in records), 'triangles': sum(rec['triangles'] for rec in records),
                'bytes': len(glb), 'float32MaximumError': max_error,
                'selection': 'Existing shell plus 13 lower and 37 upper visible solid Breps in source groups 78 and 77; construction sheets, markers, people and other studies excluded.',
                'limits': ['Display layers follow source Z intervals and preserve original relative placement; they are not a claimed fabrication sequence.',
                           'Source base and shell retain their original intersections. No alignment correction, remeshing, decimation or simulated deformation.',
                           'Neutral surface finishes are presentation choices, not measured material properties.']}
    (output / 'source-layers.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    audit = {'source': str(source), 'sourceRevision': SOURCE_REVISION, 'originMillimeters': origin, 'axisMapping': '(x,y,z) -> (x,z,-y)',
             'scale': .001, 'export': metadata}
    (output / 'source-layers-audit.private.json').write_text(json.dumps(audit, indent=2) + '\n', encoding='utf-8')
    assert digest(source) == SOURCE_REVISION
    assert max_error < 1e-6
    print(json.dumps({k: metadata[k] for k in ['revision','vertices','triangles','bytes','float32MaximumError','bounds']}, indent=2))
    print('Source layers:', [(r['id'], len(r['sourceObjects']), r['triangles']) for r in records])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    export(args.source, args.output)
