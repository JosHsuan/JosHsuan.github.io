"""Read explicitly selected Rhino sources; write a private, D-first inventory.

No source geometry is modified or exported. This is evidence for selecting
representations, not a claim that a named concept matches an unnamed object.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r


def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def color(value):
    try:
        return list(value)
    except TypeError:
        return str(value)


def mesh_record(mesh):
    if mesh is None:
        return None
    colors = mesh.VertexColors
    counts = Counter(tuple(color(colors[i])) for i in range(len(colors)))
    return {'vertices': len(mesh.Vertices), 'faces': len(mesh.Faces),
            'normals': len(mesh.Normals), 'vertexColors': len(colors),
            'uniqueColorCount': len(counts),
            'mostCommonColors': [[list(c), n] for c, n in counts.most_common(12)],
            'textureCoordinates': len(mesh.TextureCoordinates), 'valid': mesh.IsValid}


def inspect(label, source, output):
    before = digest(source)
    model = r.File3dm.Read(str(source))
    if model is None:
        raise RuntimeError(f'Cannot read explicitly selected source: {label}')
    layers = [{'index': layer.Index, 'name': layer.Name, 'visible': layer.Visible,
               'parent': str(layer.ParentLayerId), 'id': str(layer.Id),
               'color': color(layer.Color)} for layer in model.Layers]
    objects = []
    for obj in model.Objects:
        geometry, attributes = obj.Geometry, obj.Attributes
        box = geometry.GetBoundingBox()
        record = {'id': str(attributes.Id), 'type': type(geometry).__name__,
                  'layer': attributes.LayerIndex, 'visible': attributes.Visible,
                  'mode': str(attributes.Mode), 'name': attributes.Name,
                  'groups': list(attributes.GetGroupList()),
                  'min': [box.Min.X, box.Min.Y, box.Min.Z],
                  'max': [box.Max.X, box.Max.Y, box.Max.Z],
                  'materialIndex': attributes.MaterialIndex,
                  'materialSource': str(attributes.MaterialSource),
                  'colorSource': str(attributes.ColorSource), 'color': color(attributes.ObjectColor)}
        if isinstance(geometry, r.Mesh):
            record['mesh'] = mesh_record(geometry)
        if isinstance(geometry, r.Brep):
            record['brepFaces'] = len(geometry.Faces)
            record['renderMeshes'] = [mesh_record(face.GetMesh(r.MeshType.Render)) for face in geometry.Faces]
        if type(geometry).__name__ in ('Text', 'TextDot', 'TextEntity'):
            record['text'] = getattr(geometry, 'Text', getattr(geometry, 'PlainText', None))
        if hasattr(attributes, 'GetUserStrings'):
            record['attributeUserStrings'] = attributes.GetUserStrings()
        if hasattr(geometry, 'GetUserStrings'):
            record['geometryUserStrings'] = geometry.GetUserStrings()
        objects.append(record)
    grouped = defaultdict(list)
    for item in objects:
        grouped[item['layer']].append(item)
    summaries = []
    for layer in layers:
        records = grouped[layer['index']]
        meshes = [record['mesh'] for record in records if 'mesh' in record]
        cached = [mesh for record in records for mesh in record.get('renderMeshes', []) if mesh]
        summaries.append({**layer, 'objects': len(records), 'types': dict(Counter(item['type'] for item in records)),
                          'directMeshVertices': sum(mesh['vertices'] for mesh in meshes),
                          'coloredMeshes': sum(mesh['vertexColors'] > 0 for mesh in meshes),
                          'brepFaces': sum(item.get('brepFaces', 0) for item in records),
                          'cachedRenderMeshes': len(cached), 'cachedVertices': sum(mesh['vertices'] for mesh in cached)})
    after = digest(source)
    if before != after:
        raise RuntimeError('Source changed while the read-only audit ran.')
    record = {'schemaVersion': 1, 'label': label, 'source': str(source.resolve()),
              'sourceSHA256': before, 'sourceUnchanged': True, 'bytes': source.stat().st_size,
              'rhino3dmVersion': r.__version__, 'units': str(model.Settings.ModelUnitSystem),
              'objectCount': len(objects), 'types': dict(Counter(item['type'] for item in objects)),
              'layers': layers, 'layerSummary': summaries,
              'groups': [{'index': group.Index, 'name': group.Name} for group in model.Groups],
              'objects': objects,
              'limit': 'Names, colors and spatial coincidence are candidate evidence; no conceptual mapping is inferred automatically.'}
    path = output / f'{label}-inventory.json'
    path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({key: record[key] for key in ['label', 'sourceSHA256', 'sourceUnchanged', 'bytes', 'rhino3dmVersion', 'units', 'objectCount', 'types']}, ensure_ascii=False))
    print(json.dumps({'layerSummary': summaries, 'privateInventory': str(path)}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', nargs=2, action='append', metavar=('LABEL', 'PATH'), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    allowed = Path('D:/JosHsuan_Website/_work/bending-active-thesis/round-06').resolve()
    destination = args.output.resolve()
    if destination != allowed and allowed not in destination.parents:
        raise ValueError('Round 06 audit output must stay within the designated D-first workspace.')
    destination.mkdir(parents=True, exist_ok=True)
    for name, raw_source in args.source:
        if not name.replace('-', '').isalnum():
            raise ValueError('Use a simple non-path label.')
        inspect(name, Path(raw_source), destination)
