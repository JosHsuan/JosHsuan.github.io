"""Read a user-selected 3dm; keep its full source audit in the ignored runtime."""
import sys, json, hashlib
from pathlib import Path
from collections import Counter
ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r
source = Path(sys.argv[1])
model = r.File3dm.Read(str(source))
if model is None:
    raise RuntimeError('Cannot read 3dm')
objects = []
for obj in model.Objects:
    g, a = obj.Geometry, obj.Attributes
    box = g.GetBoundingBox()
    record = {'id':str(a.Id), 'type':type(g).__name__, 'layer':a.LayerIndex,
              'visible':a.Visible, 'mode':str(a.Mode), 'name':a.Name,
              'min':[box.Min.X, box.Min.Y, box.Min.Z],
              'max':[box.Max.X, box.Max.Y, box.Max.Z]}
    if isinstance(g,r.Mesh):
        record.update(vertices=len(g.Vertices), faces=len(g.Faces))
    if isinstance(g,r.Brep):
        record['faceCount'] = len(g.Faces)
        record['renderMeshes'] = []
        for face in g.Faces:
            mesh = face.GetMesh(r.MeshType.Render)
            record['renderMeshes'].append(None if mesh is None else {'vertices':len(mesh.Vertices),'faces':len(mesh.Faces)})
    objects.append(record)
data = {'source':str(source), 'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'bytes':source.stat().st_size,'units':str(model.Settings.ModelUnitSystem),
        'types':dict(Counter(o['type'] for o in objects)),
        'layers':[{'index':l.Index,'name':l.Name,'visible':l.Visible,'parent':str(l.ParentLayerId),'id':str(l.Id)} for l in model.Layers],
        'objects':objects}
out = ROLE / '.runtime/model-inspection.json'
out.write_text(json.dumps(data,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in data.items() if k not in ('objects','source')},indent=2))
print('Brep faces:',sum(o.get('faceCount',0) for o in objects),'cached:',sum(sum(m is not None for m in o.get('renderMeshes',[])) for o in objects))
print('Audit:',out)
