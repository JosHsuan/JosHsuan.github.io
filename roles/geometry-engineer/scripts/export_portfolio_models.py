"""Export two reviewed source assemblies from their stored Rhino render meshes.

Explicit CLI sources only; this is never part of the website build. Original
files stay read-only. Complete cached source geometry is merged without vertex
reordering, quantization, decimation or reconstructed parts. Private selection
receipts stay in the explicitly supplied audit directory.
"""
import argparse
import array
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r

SOURCES = {
    'machine': {
        'sha256': '07ea02951b22cf27ddee407211592b70fb64ad8fa24bc503fe9be1f83a752b2a',
        'objects': 1515, 'vertices': 503822,
        'projectId': 'mode-s-of-making', 'filename': 'machine.glb',
        'color': [.58, .60, .62, 1], 'metalness': .65, 'roughness': .38,
        'selection': 'All 1500 visible normal-mode Breps and 15 extrusions in the clean assembled machine drawing source. Standalone 2D curves are excluded. No spatial crop, inferred component, remeshing or reconstruction.',
        'credit': 'Machine design and development: Chia-Hsuan Chao / National Cheng Kung University. Arduino and Marlin retain their third-party credit in the project narrative.',
        'representation': 'Original assembled rotary heat-cutting machine study, with the source frame, carriage, guides, motors, bearings and tool holder.',
    },
    'caschlatsch': {
        'sha256': 'f488dfa8981d12c65fe604b0c04259cfd923485b5854f8bad9b5dd7e6ed9a414',
        'objects': 2433, 'vertices': 61362,
        'projectId': 'project-caschlatsch', 'filename': 'model.glb',
        'color': [.49, .34, .20, 1], 'metalness': 0, 'roughness': .76,
        'selection': 'All 2433 visible normal-mode Breps in the finalized structure-only CAD source; five reference points are excluded. Every stored render-mesh face is retained. This source contains the timber structure, not a reconstructed site or terrain.',
        'credit': 'MAS DFAB 2023–24 cohort / ETH Zurich. Project Caschlatsch is a collective project; JosHsuan Chao contributed to the COMPAS XR module workflow and assembly-data preparation.',
        'representation': 'Original full-size CAD structure of Project Caschlatsch, including the complete timber assembly in its source relative arrangement.',
    },
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def stored_meshes(geometry):
    if isinstance(geometry, r.Mesh):
        return [geometry]
    if isinstance(geometry, r.Brep):
        return [face.GetMesh(r.MeshType.Render) for face in geometry.Faces]
    if isinstance(geometry, r.Extrusion):
        return [geometry.GetMesh(r.MeshType.Render)]
    return []


def export(kind, source, destination, audit):
    spec = SOURCES[kind]
    source_bytes = source.read_bytes()
    if digest(source_bytes) != spec['sha256']:
        raise ValueError('Source revision changed; inspect before exporting.')
    doc = r.File3dm.Read(str(source))
    assert doc and doc.Settings.ModelUnitSystem == r.UnitSystem.Millimeters
    selected = []
    excluded = []
    for obj in doc.Objects:
        geometry, attributes = obj.Geometry, obj.Attributes
        layer = doc.Layers.FindIndex(attributes.LayerIndex)
        eligible = (attributes.Visible and layer.Visible and
                    attributes.Mode == r.ObjectMode.Normal and
                    isinstance(geometry, (r.Brep, r.Extrusion)))
        if not eligible:
            excluded.append({'id': str(attributes.Id), 'type': type(geometry).__name__})
            continue
        meshes = stored_meshes(geometry)
        assert meshes and all(mesh is not None for mesh in meshes), 'Incomplete source mesh cache'
        for mesh in meshes:
            assert len(mesh.Vertices) == len(mesh.Normals), 'Source normals must exist'
            assert len(mesh.Vertices) == len(mesh.TextureCoordinates), 'Complete original UVs required'
        selected.append((obj, meshes))
    assert len(selected) == spec['objects']
    vertices = [vertex for _, meshes in selected for mesh in meshes for vertex in mesh.Vertices]
    assert len(vertices) == spec['vertices']
    lo = [min(getattr(v, axis) for v in vertices) for axis in ('X', 'Y', 'Z')]
    hi = [max(getattr(v, axis) for v in vertices) for axis in ('X', 'Y', 'Z')]
    center_x, center_y, base_z = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]
    positions, normals, indices, uv = array.array('f'), array.array('f'), array.array('I'), array.array('f')
    source_ranges = []
    max_error = 0
    for obj, meshes in selected:
        start_vertex, start_index = len(positions) // 3, len(indices)
        for mesh in meshes:
            offset = len(positions) // 3
            for v in mesh.Vertices:
                p = ((v.X - center_x) * .001, (v.Z - base_z) * .001, -(v.Y - center_y) * .001)
                assert all(math.isfinite(x) for x in p)
                positions.extend(p)
                max_error = max(max_error, *(abs(p[i] - positions[-3 + i]) for i in range(3)))
            for n in mesh.Normals:
                normals.extend((n.X, n.Z, -n.Y))
            for coordinate in mesh.TextureCoordinates:
                uv.extend((coordinate.X, coordinate.Y))
            for a, b, c, d in mesh.Faces:
                assert all(0 <= i < len(mesh.Vertices) for i in (a, b, c, d))
                indices.extend((offset + a, offset + b, offset + c))
                if c != d:
                    indices.extend((offset + a, offset + c, offset + d))
        source_ranges.append({'id': str(obj.Attributes.Id), 'layer': obj.Attributes.LayerIndex,
                              'vertices': [start_vertex, len(positions) // 3],
                              'indices': [start_index, len(indices)]})
    assert sys.byteorder == 'little'
    chunks = [positions.tobytes(), normals.tobytes(), indices.tobytes(), uv.tobytes()]
    binary = b''.join(chunks)
    views = []
    offset = 0
    for i, chunk in enumerate(chunks):
        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(chunk), 'target': 34963 if i == 2 else 34962})
        offset += len(chunk)
    bounds = {'min': [min(positions[i::3]) for i in range(3)], 'max': [max(positions[i::3]) for i in range(3)]}
    gltf = {
        'asset': {'version': '2.0', 'generator': 'Geometry Engineer / rhino3dm 8.17.0'},
        'scene': 0, 'scenes': [{'nodes': [0]}],
        'nodes': [{'name': spec['projectId'] + '-' + kind, 'mesh': 0}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 3}, 'indices': 2, 'material': 0}]}],
        'materials': [{'name': 'Neutral editorial display material', 'doubleSided': True,
                       'pbrMetallicRoughness': {'baseColorFactor': spec['color'], 'metallicFactor': spec['metalness'], 'roughnessFactor': spec['roughness']}}],
        'buffers': [{'byteLength': len(binary)}], 'bufferViews': views,
        'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(positions) // 3, 'type': 'VEC3', **bounds},
                      {'bufferView': 1, 'componentType': 5126, 'count': len(normals) // 3, 'type': 'VEC3'},
                      {'bufferView': 2, 'componentType': 5125, 'count': len(indices), 'type': 'SCALAR'},
                      {'bufferView': 3, 'componentType': 5126, 'count': len(uv) // 2, 'type': 'VEC2'}],
    }
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode()
    json_bytes += b' ' * (-len(json_bytes) % 4)
    binary += b'\0' * (-len(binary) % 4)
    glb = (struct.pack('<III', 0x46546c67, 2, 28 + len(json_bytes) + len(binary)) +
           struct.pack('<I4s', len(json_bytes), b'JSON') + json_bytes +
           struct.pack('<I4s', len(binary), b'BIN\0') + binary)
    destination.mkdir(parents=True, exist_ok=True)
    asset = destination / spec['filename']
    asset.write_bytes(glb)
    # Independently parse the serialized container and compare all raw streams.
    decoded_json = json.loads(glb[20:20 + len(json_bytes)])
    decoded_binary = glb[28 + len(json_bytes):]
    for i, chunk in enumerate(chunks):
        view = decoded_json['bufferViews'][i]
        assert decoded_binary[view['byteOffset']:view['byteOffset'] + view['byteLength']] == chunk
    assert digest(source.read_bytes()) == spec['sha256'], 'Original source changed'
    metadata = {
        'projectId': spec['projectId'], 'src': '/assets/projects/' + spec['projectId'] + '/' + spec['filename'],
        'bytes': len(glb), 'sha256': digest(glb),
        'source': {'file': source.name, 'bytes': len(source_bytes), 'sha256': spec['sha256']},
        'selection': spec['selection'], 'credit': spec['credit'], 'representation': spec['representation'],
        'geometry': {'vertices': len(positions) // 3, 'triangles': len(indices) // 3, 'renderables': 1,
                     'primitive': 'triangles', 'bounds': bounds, 'sourceUnits': 'millimeters', 'webUnits': 'meters', 'upAxis': 'Y'},
        'processing': {'decimation': False, 'deformation': False, 'maxFloat32PositionErrorMeters': max_error,
                       'compression': {'encoding': 'none', 'decodedByteExact': True, 'quantization': False, 'reorder': False},
                       'method': 'Complete original cached render meshes, positions, normals, UVs and face order. One translation to horizontal centre and lowest source vertex, mm-to-m conversion, positive-determinant (x,z,-y) axis mapping. No source mesh editing, procedural replacement or smoothing.'},
    }
    audit.mkdir(parents=True, exist_ok=True)
    (audit / (kind + '-metadata.json')).write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    receipt = {'passed': True, 'source': str(source), 'sourceUnchanged': True,
               'sourceSHA256': spec['sha256'], 'assetSHA256': digest(glb),
               'translationSource': [-center_x, -center_y, -base_z], 'scale': .001,
               'axisMapping': '(x,y,z) -> (x,z,-y)', 'axisDeterminant': 1,
               'selectedObjects': source_ranges, 'excludedObjects': excluded,
               'bufferSHA256': [digest(chunk) for chunk in chunks],
               'allSerializedPositionNormalIndexBytesExact': True,
               'maxFloat32PositionErrorMeters': max_error,
               'limits': 'CAD geometry only; no final-built or hardware performance certification. Source CAD materials were not calibrated; neutral display finish is editorial.'}
    (audit / (kind + '-source-receipt.json')).write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(metadata, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('kind', choices=SOURCES)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('audit', type=Path)
    args = parser.parse_args()
    export(args.kind, args.source, args.destination, args.audit)
