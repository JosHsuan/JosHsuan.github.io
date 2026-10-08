"""Independently compare prepared glTF buffers with the original selected meshes."""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r

parser = argparse.ArgumentParser()
parser.add_argument('--selection', type=Path, required=True)
parser.add_argument('--prepared', type=Path, required=True)
parser.add_argument('--report', type=Path, required=True)
args = parser.parse_args()
allowed = Path('D:/JosHsuan_Website/_work/bending-active-thesis/round-06').resolve()
if any(allowed not in path.resolve().parents for path in [args.selection, args.prepared, args.report]):
    raise ValueError('All verification inputs/outputs must belong to the private Round 06 workspace.')
selection = json.loads(args.selection.read_text(encoding='utf-8'))
metadata = json.loads((args.prepared / 'source-diagrams.json').read_text(encoding='utf-8'))
raw = (args.prepared / 'source-diagrams.glb').read_bytes()
revision = hashlib.sha256(raw).hexdigest()
assert revision == metadata['revision']
magic, version, length = struct.unpack_from('<III', raw)
assert magic == 0x46546C67 and version == 2 and length == len(raw)
json_length, tag = struct.unpack_from('<I4s', raw, 12)
assert tag == b'JSON'
gltf = json.loads(raw[20:20 + json_length])
bin_length, tag = struct.unpack_from('<I4s', raw, 20 + json_length)
assert tag == b'BIN\0'
binary = raw[28 + json_length:28 + json_length + bin_length]
components = {5121: ('B', 1), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
widths = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}


def read_accessor(index):
    accessor = gltf['accessors'][index]
    view = gltf['bufferViews'][accessor['bufferView']]
    code, size = components[accessor['componentType']]
    width = widths[accessor['type']]
    start = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    data = binary[start:start + accessor['count'] * width * size]
    return list(struct.iter_unpack('<' + code * width, data))


sources = {}
for label, record in selection['sources'].items():
    path = Path(record['path'])
    assert hashlib.sha256(path.read_bytes()).hexdigest() == record['sha256']
    doc = r.File3dm.Read(str(path))
    sources[label] = {str(obj.Attributes.Id): obj for obj in doc.Objects}
reports = []
for item in selection['meshes']:
    obj = sources[item['source']][item['objectId']]
    source = obj.Geometry
    node = next(node for node in gltf['nodes'] if node['name'] == item['id'])
    primitive = gltf['meshes'][node['mesh']]['primitives'][0]
    actual_positions = read_accessor(primitive['attributes']['POSITION'])
    actual_normals = read_accessor(primitive['attributes']['NORMAL'])
    actual_indices = [value[0] for value in read_accessor(primitive['indices'])]
    assert len(actual_positions) == len(source.Vertices)
    assert len(actual_normals) == len(source.Normals)
    shift, pivot = item['preTranslationMillimeters'], item['pivotMillimeters']
    errors, normal_errors = [], []
    for i, point in enumerate(source.Vertices):
        expected = ((point.X + shift[0] - pivot[0]) / 1000,
                    (point.Z + shift[2] - pivot[2]) / 1000,
                    -(point.Y + shift[1] - pivot[1]) / 1000)
        errors.append(max(abs(a - b) for a, b in zip(expected, actual_positions[i])))
        normal = source.Normals[i]
        normal_errors.append(max(abs(a - b) for a, b in zip((normal.X, normal.Z, -normal.Y), actual_normals[i])))
    expected_indices = []
    edges = set()
    for a, b, c, d in source.Faces:
        expected_indices.extend([a, b, c] if c == d else [a, b, c, a, c, d])
        face = [a, b, c] if c == d else [a, b, c, d]
        for i in range(len(face)):
            edges.add(tuple(sorted((face[i], face[(i + 1) % len(face)]))))
    assert expected_indices == actual_indices
    assert max(errors) < 2e-7 and max(normal_errors) < 1e-7
    if item.get('preserveVertexColors'):
        actual_colors = read_accessor(primitive['attributes']['COLOR_0'])
        assert actual_colors == [tuple(source.VertexColors[i]) for i in range(len(source.VertexColors))]
    if item.get('sourceFaceEdges'):
        edge_node = next(node for node in gltf['nodes'] if node['name'] == item['id'] + '-source-edges')
        edge_primitive = gltf['meshes'][edge_node['mesh']]['primitives'][0]
        assert edge_primitive['mode'] == 1
        edge_indices = [index[0] for index in read_accessor(edge_primitive['indices'])]
        assert edge_indices == [index for edge in sorted(edges) for index in edge]
    public = next(record for record in metadata['representations'] if record['id'] == item['id'])
    for axis in range(3):
        assert public['bounds']['min'][axis] == min(point[axis] for point in actual_positions)
        assert public['bounds']['max'][axis] == max(point[axis] for point in actual_positions)
    reports.append({'id': item['id'], 'sourceObjectId': item['objectId'], 'vertices': len(actual_positions),
                    'triangles': len(actual_indices) // 3, 'indicesPreserved': True,
                    'maxPositionRoundingMeters': max(errors), 'maxNormalRounding': max(normal_errors),
                    'authoredColorBytesPreserved': bool(item.get('preserveVertexColors')),
                    'boundsVerified': True})
public_text = json.dumps(gltf) + json.dumps(metadata)
for item in selection['meshes']:
    assert item['objectId'] not in public_text
for record in selection['sources'].values():
    assert record['path'] not in public_text
    assert hashlib.sha256(Path(record['path']).read_bytes()).hexdigest() == record['sha256']
report = {'status': 'pass', 'assetSHA256': revision, 'sourceUnchanged': True,
          'sourceVertexCount': sum(record['vertices'] for record in reports),
          'triangleCountIfAllVisible': sum(record['triangles'] for record in reports),
          'publicMetadataHasNoSourceIdsOrPaths': True, 'nodes': reports}
args.report.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({key: value for key, value in report.items() if key != 'nodes'}, indent=2))
