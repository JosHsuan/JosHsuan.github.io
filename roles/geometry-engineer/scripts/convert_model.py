"""Export the inspected assembly mesh, preserving source shape and winding.

The source stays read-only. Output is a local-review asset, not publication input.
No Brep remeshing, vertex deformation, decimation or fabricated grouping occurs.
"""
import argparse, sys, json, struct, hashlib, math
from pathlib import Path
ROLE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROLE/'.runtime/python817'))
import rhino3dm as r

def sha(data): return hashlib.sha256(data).hexdigest()
def export(source,out):
    expected='c12ca628488a4449ea587965410d7df6baa815b36397c8344e2e14a3f533b14c'
    source_hash=sha(source.read_bytes())
    if source_hash!=expected: raise ValueError('Source revision changed: inspect and review the selection again.')
    doc=r.File3dm.Read(str(source))
    if doc.Settings.ModelUnitSystem!=r.UnitSystem.Millimeters: raise ValueError('Unexpected source units')
    selected='03aa204e-af4c-4e84-9007-ac16d19c1ecc'
    obj=next(o for o in doc.Objects if str(o.Attributes.Id)==selected)
    mesh=obj.Geometry
    if not isinstance(mesh,r.Mesh) or not mesh.IsValid: raise ValueError('Selected mesh invalid')
    if not obj.Attributes.Visible: raise ValueError('Selected assembly is no longer visible')
    b=mesh.GetBoundingBox()
    cx=(b.Min.X+b.Max.X)/2;cy=(b.Min.Y+b.Max.Y)/2;z0=b.Min.Z
    positions=[((v.X-cx)*.001,(v.Z-z0)*.001,-(v.Y-cy)*.001) for v in mesh.Vertices]
    normals=[(n.X,n.Z,-n.Y) for n in mesh.Normals]
    if len(normals)!=len(positions): raise ValueError('Source normals missing; inspect before recomputing')
    triangles=[]; removed=0
    for a,b,c,d in mesh.Faces:
        for t in ([(a,b,c)] if c==d else [(a,b,c),(a,c,d)]):
            if len(set(t))!=3: removed+=1;continue
            if not all(0<=i<len(positions) for i in t): raise ValueError('Invalid index')
            triangles.append(t)
    if not all(math.isfinite(v) for p in positions+normals for v in p): raise ValueError('Non-finite geometry')
    low=[min(p[i] for p in positions) for i in range(3)]
    high=[max(p[i] for p in positions) for i in range(3)]
    buffers=[struct.pack('<'+'f'*len(positions)*3,*(v for p in positions for v in p)),
             struct.pack('<'+'f'*len(normals)*3,*(v for n in normals for v in n)),
             struct.pack('<'+'I'*len(triangles)*3,*(v for t in triangles for v in t))]
    views=[];binary=b''
    for i,buf in enumerate(buffers):
        views.append({'buffer':0,'byteOffset':len(binary),'byteLength':len(buf),'target':34963 if i==2 else 34962})
        binary+=buf
    gltf={'asset':{'version':'2.0','generator':'Geometry Engineer / rhino3dm 8.17.0'},
          'scene':0,'scenes':[{'nodes':[0]}],
          'nodes':[{'name':'assembly-03aa204e','mesh':0}],
          'meshes':[{'name':'Inspected assembled surface','primitives':[{'attributes':{'POSITION':0,'NORMAL':1},'indices':2,'material':0}]}],
          'materials':[{'name':'Neutral metal presentation','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[.63,.65,.66,1],'metallicFactor':.85,'roughnessFactor':.36}}],
          'buffers':[{'byteLength':len(binary)}],'bufferViews':views,
          'accessors':[{'bufferView':0,'componentType':5126,'count':len(positions),'type':'VEC3','min':low,'max':high},
                       {'bufferView':1,'componentType':5126,'count':len(normals),'type':'VEC3'},
                       {'bufferView':2,'componentType':5125,'count':len(triangles)*3,'type':'SCALAR'}]}
    jsonbytes=json.dumps(gltf,separators=(',',':')).encode();jsonbytes+=b' '*((-len(jsonbytes))%4)
    binary+=b'\0'*((-len(binary))%4)
    glb=struct.pack('<III',0x46546c67,2,12+8+len(jsonbytes)+8+len(binary))+struct.pack('<I4s',len(jsonbytes),b'JSON')+jsonbytes+struct.pack('<I4s',len(binary),b'BIN\0')+binary
    out.mkdir(parents=True,exist_ok=True)
    (out/'assembly.glb').write_bytes(glb)
    metadata={'schemaVersion':1,'status':'local-review-only','publishable':False,
              'revision':sha(glb),'sourceRevision':source_hash,'sourceObjectId':selected,
              'sourceUnits':'millimeters','viewerUnits':'meters','upAxis':'Y',
              'bounds':{'min':low,'max':high},'dimensionsMeters':[high[i]-low[i] for i in range(3)],
              'vertices':len(positions),'triangles':len(triangles),'sourceFaces':len(mesh.Faces),'removedDegenerateIndexFaces':removed,
              'bytes':len(glb),'geometryTreatment':'Source mesh positions and normals retained; translated, scaled mm to m, rotated Z-up to Y-up. No decimation or simulated deformation.',
              'selection':'Visible detailed assembly mesh. Separate flat layouts, hidden alternatives, duplicate assembly, analytical point markers, annotations and human scale figures excluded.',
              'limits':['One source mesh without named fabrication groups; no part-by-part assembly or stress result is inferred.','Neutral metal shading is a display choice, not a measured finish.','Model dimensions are measured from this CAD revision and are not the reported built prototype dimensions.']}
    (out/'model.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
    audit={'sourcePath':str(source),'sourceSHA256':source_hash,'export':metadata,'translationSource':[-cx,-cy,-z0],'axisMapping':'(x,y,z) -> (x,z,-y)','scale':.001}
    (ROLE/'.runtime/conversion-audit.json').write_text(json.dumps(audit,indent=2),encoding='utf-8')
    print(json.dumps(metadata,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('output',type=Path)
    args=parser.parse_args();export(args.source,args.output)
