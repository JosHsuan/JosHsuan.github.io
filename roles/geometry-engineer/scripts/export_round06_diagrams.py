"""Export explicitly reviewed original Rhino meshes from a private selection.

Selection/source IDs stay in the D-drive audit. Normal builds never execute
this script. No remeshing, source normal/color rewrite or shape scaling occurs.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r


def sha(value):
    return hashlib.sha256(value).hexdigest()


def floats(values):
    flat = [v for vector in values for v in vector]
    if not all(math.isfinite(v) for v in flat):
        raise ValueError('Non-finite source values')
    return struct.pack('<' + 'f' * len(flat), *flat)


def export(selection, output):
    sources = {}
    for name, record in selection['sources'].items():
        path = Path(record['path'])
        before = sha(path.read_bytes())
        if before != record['sha256']:
            raise ValueError('Explicitly reviewed source revision changed.')
        doc = r.File3dm.Read(str(path))
        if doc is None or doc.Settings.ModelUnitSystem != r.UnitSystem.Millimeters:
            raise ValueError('Expected reviewed millimetre Rhino geometry.')
        sources[name] = {'path': path, 'before': before, 'doc': doc,
                         'objects': {str(obj.Attributes.Id): obj for obj in doc.Objects}}
    binary = bytearray()
    views, accessors, nodes, meshes, public, audit = [], [], [], [], [], []
    shared_views = {}

    def accessor(data, component, count, kind, target=34962, low=None, high=None, normalized=False):
        key = (sha(data), len(data), target)
        if key in shared_views:
            view = shared_views[key]
        else:
            while len(binary) % 4:
                binary.append(0)
            view = len(views)
            views.append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data), 'target': target})
            binary.extend(data)
            shared_views[key] = view
        item = {'bufferView': view, 'componentType': component, 'count': count, 'type': kind}
        if low is not None:
            item.update(min=low, max=high)
        if normalized:
            item['normalized'] = True
        accessors.append(item)
        return len(accessors) - 1

    for item in selection['meshes']:
        source = sources[item['source']]
        obj = source['objects'][item['objectId']]
        mesh = obj.Geometry
        if not isinstance(mesh, r.Mesh) or not mesh.IsValid:
            raise ValueError('Reviewed selection must be a valid original mesh.')
        if len(mesh.Normals) != len(mesh.Vertices):
            raise ValueError('Missing original normals; do not invent a replacement.')
        translation = item['preTranslationMillimeters']
        anchor = item['pivotMillimeters']
        positions = [((p.X + translation[0] - anchor[0]) * .001,
                      (p.Z + translation[2] - anchor[2]) * .001,
                      -(p.Y + translation[1] - anchor[1]) * .001) for p in mesh.Vertices]
        normals = [(n.X, n.Z, -n.Y) for n in mesh.Normals]
        triangles, edges = [], set()
        for a, b, c, d in mesh.Faces:
            face = [a, b, c] if c == d else [a, b, c, d]
            if any(i < 0 or i >= len(positions) for i in face):
                raise ValueError('Source index is outside original vertex range.')
            triangles.extend([(a, b, c)] if c == d else [(a, b, c), (a, c, d)])
            for j in range(len(face)):
                edges.add(tuple(sorted((face[j], face[(j + 1) % len(face)]))))
        position_bytes = floats(positions)
        decoded = list(struct.iter_unpack('<fff', position_bytes))
        low = [min(p[i] for p in decoded) for i in range(3)]
        high = [max(p[i] for p in decoded) for i in range(3)]
        component, index_type = (5123, 'H') if len(positions) <= 65535 else (5125, 'I')
        indices = [index for face in triangles for index in face]
        attributes = {'POSITION': accessor(position_bytes, 5126, len(positions), 'VEC3', low=low, high=high),
                      'NORMAL': accessor(floats(normals), 5126, len(normals), 'VEC3')}
        colors = item.get('preserveVertexColors', False)
        if colors:
            if len(mesh.VertexColors) != len(positions):
                raise ValueError('Reviewed source colors must cover every original vertex.')
            color_bytes = bytes(channel for color in mesh.VertexColors for channel in color)
            attributes['COLOR_0'] = accessor(color_bytes, 5121, len(positions), 'VEC4', normalized=True)
        index = accessor(struct.pack('<' + index_type * len(indices), *indices), component, len(indices), 'SCALAR', target=34963)
        mesh_index = len(meshes)
        meshes.append({'name': item['id'], 'primitives': [{'attributes': attributes, 'indices': index, 'material': 1 if colors else 0}]})
        nodes.append({'name': item['id'], 'mesh': mesh_index, 'extras': {'representationId': item['id'], 'sourceGeometry': True, 'family': item['family']}})
        edge_count = 0
        if item.get('sourceFaceEdges'):
            # Includes only the original polygon edges; no diagonals introduced
            # by glTF triangulation, panel/crease classifications or smoothing.
            edge_indices = [index for edge in sorted(edges) for index in edge]
            edge_accessor = accessor(struct.pack('<' + index_type * len(edge_indices), *edge_indices), component, len(edge_indices), 'SCALAR', target=34963)
            edge_mesh = len(meshes)
            meshes.append({'name': item['id'] + '-source-edges', 'primitives': [{'attributes': {'POSITION': attributes['POSITION']}, 'indices': edge_accessor, 'material': 2, 'mode': 1}]})
            nodes.append({'name': item['id'] + '-source-edges', 'mesh': edge_mesh, 'extras': {'representationId': item['id'], 'sourceGeometry': False, 'sourceEdgeOverlay': True, 'family': item['family']}})
            edge_count = len(edges)
        rounding = max(abs(a - b) for p, q in zip(positions, decoded) for a, b in zip(p, q))
        record = {'id': item['id'], 'label': item['label'], 'family': item['family'], 'vertices': len(positions),
                  'sourceFaces': len(mesh.Faces), 'triangles': len(triangles), 'sourceEdgeSegments': edge_count,
                  'vertexColors': len(mesh.VertexColors) if colors else 0, 'bounds': {'min': low, 'max': high},
                  'dimensionsMeters': [b - a for a, b in zip(low, high)],
                  'maxPositionFloat32RoundingMeters': rounding, 'geometrySHA256': sha(position_bytes + floats(normals) + struct.pack('<' + index_type * len(indices), *indices)),
                  'displayGroup': item['displayGroup'], 'description': item['description']}
        public.append(record)
        audit.append({**record, 'source': item['source'], 'sourceObjectId': item['objectId'], 'sourceName': obj.Attributes.Name,
                      'sourceVisible': obj.Attributes.Visible, 'sourceLayer': obj.Attributes.LayerIndex,
                      'sourceGroups': list(obj.Attributes.GetGroupList()), 'preTranslationMillimeters': translation,
                      'pivotMillimeters': anchor, 'associationEvidence': item['associationEvidence']})
    while len(binary) % 4:
        binary.append(0)
    gltf = {'asset': {'version': '2.0', 'generator': 'Geometry Engineer / original source diagrams'},
            'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': meshes,
            'materials': [
                {'name': 'Neutral source form', 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': [.68, .7, .68, 1], 'metallicFactor': 0, 'roughnessFactor': .8}},
                {'name': 'Original authored vertex colors', 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 1}},
                {'name': 'Original polygon edges', 'pbrMetallicRoughness': {'baseColorFactor': [.025, .035, .03, 1], 'metallicFactor': 0, 'roughnessFactor': 1}},
            ], 'buffers': [{'byteLength': len(binary)}], 'bufferViews': views, 'accessors': accessors}
    encoded = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    encoded += b' ' * ((-len(encoded)) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(encoded) + 8 + len(binary)) + struct.pack('<I4s', len(encoded), b'JSON') + encoded + struct.pack('<I4s', len(binary), b'BIN\0') + binary
    metadata = {'schemaVersion': 1, 'revision': sha(glb), 'viewerUnits': 'meters', 'upAxis': 'Y', 'bytes': len(glb),
                'geometryTreatment': 'Original positions, normals and indices; rigid CAD display-row translations removed, millimetres to metres and positive-determinant Z-up to Y-up rotation applied once. No decimation, remeshing, surface simulation or new curvature calculation.',
                'axisMapping': '(x,y,z) -> (x,z,-y)', 'unitScale': .001,
                'representations': public,
                'limits': ['The authored color view preserves source vertex colors; the scalar field, units and legend are unavailable.',
                           'Experiments A/B/C are selected original studies; correspondence to named artwork TYPE rows is not established.',
                           'Source face edges are polygon edges, not inferred fabrication seams or crease labels.']}
    for record in sources.values():
        if sha(record['path'].read_bytes()) != record['before']:
            raise RuntimeError('Original source changed during the export.')
    output.mkdir(parents=True, exist_ok=True)
    (output / 'source-diagrams.glb').write_bytes(glb)
    (output / 'source-diagrams.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    private_audit = {'sourceUnchanged': True, 'sources': selection['sources'], 'assetSHA256': sha(glb), 'selections': audit}
    (output.parent / 'geometry-inspection' / 'diagram-export-audit.json').write_text(json.dumps(private_audit, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'revision': sha(glb), 'bytes': len(glb), 'nodes': [node['name'] for node in nodes],
                      'sourceVertices': sum(item['vertices'] for item in public), 'trianglesIfAllVisible': sum(item['triangles'] for item in public),
                      'output': str(output), 'sourceUnchanged': True}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--selection', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    allowed = Path('D:/JosHsuan_Website/_work/bending-active-thesis/round-06').resolve()
    if allowed not in args.output.resolve().parents or allowed not in args.selection.resolve().parents:
        raise ValueError('Selection and prepared handoff must stay within the private D-first Round 06 workspace.')
    export(json.loads(args.selection.read_text(encoding='utf-8')), args.output)
