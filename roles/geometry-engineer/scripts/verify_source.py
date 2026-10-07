"""Compare the derivative against every selected source vertex, normal and face."""
import sys,json,struct,hashlib,math
from pathlib import Path
ROLE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROLE/'.runtime/python817'))
import rhino3dm as r
source=Path(sys.argv[1]);asset=Path(sys.argv[2]);meta=json.loads((asset.parent/'model.json').read_text())
assert hashlib.sha256(source.read_bytes()).hexdigest()==meta['sourceRevision']
doc=r.File3dm.Read(str(source));mesh=next(o.Geometry for o in doc.Objects if str(o.Attributes.Id)==meta['sourceObjectId'])
b=mesh.GetBoundingBox();cx=(b.Min.X+b.Max.X)/2;cy=(b.Min.Y+b.Max.Y)/2;z0=b.Min.Z
raw=asset.read_bytes();size=struct.unpack_from('<I',raw,12)[0];gltf=json.loads(raw[20:20+size]);binary=20+size+8
def unpack(view,code):
 v=gltf['bufferViews'][view];return struct.unpack_from('<'+code*(v['byteLength']//4),raw,binary+v['byteOffset'])
positions=unpack(0,'f');normals=unpack(1,'f');indices=unpack(2,'I');max_error=0;normal_error=0
for i,v in enumerate(mesh.Vertices):
 expected=((v.X-cx)*.001,(v.Z-z0)*.001,-(v.Y-cy)*.001)
 max_error=max(max_error,max(abs(a-b) for a,b in zip(expected,positions[i*3:i*3+3])))
for i,n in enumerate(mesh.Normals):
 normal_error=max(normal_error,max(abs(a-b) for a,b in zip((n.X,n.Z,-n.Y),normals[i*3:i*3+3])))
expected_indices=[]
for a,b,c,d in mesh.Faces:
 expected_indices.extend((a,b,c))
 if c!=d:expected_indices.extend((a,c,d))
assert tuple(expected_indices)==indices
assert max_error<2e-7 and normal_error<1e-7
assert len(positions)//3==len(mesh.Vertices)
report={'passed':True,'sourceSHA256':meta['sourceRevision'],'assetSHA256':hashlib.sha256(raw).hexdigest(),'verticesCompared':len(mesh.Vertices),'faceIndicesExact':True,'maximumPositionRoundingErrorMeters':max_error,'maximumNormalRoundingError':normal_error,'transform':'translate + mm-to-m + positive-determinant (x,z,-y) rotation','topologyChanged':False}
(ROLE/'verification').mkdir(exist_ok=True);(ROLE/'verification/source-fidelity.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report,indent=2))
