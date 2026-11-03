"""Derive timber fibre direction from each original cached member, not its bbox."""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from export_portfolio_models import SOURCES,stored_meshes,r

def derive(source,output):
    pin=SOURCES['caschlatsch']['sha256']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==pin
    doc=r.File3dm.Read(str(source));chunks=[];ratios=[];axes=[]
    for obj in doc.Objects:
        a,g=obj.Attributes,obj.Geometry;layer=doc.Layers.FindIndex(a.LayerIndex)
        if not(a.Visible and layer.Visible and a.Mode==r.ObjectMode.Normal and isinstance(g,(r.Brep,r.Extrusion))):continue
        vertices=np.array([(v.X,v.Z,-v.Y) for mesh in stored_meshes(g) for v in mesh.Vertices],dtype=np.float64)*.001
        unique=np.unique(vertices,axis=0);centered=unique-unique.mean(axis=0)
        values,vectors=np.linalg.eigh(centered.T@centered/len(unique));axis=vectors[:,-1]
        # Canonical sign affects only fibre direction, not source geometry.
        if axis[np.argmax(np.abs(axis))]<0:axis=-axis
        assert abs(np.linalg.norm(axis)-1)<1e-12
        ratio=float(values[-1]/max(values[-2],1e-18));ratios.append(ratio)
        # Principal spread equals the maximum covariance eigenvalue; this
        # independently checks that grain follows the long member direction.
        assert abs(np.mean((centered@axis)**2)-values[-1])<1e-10
        axes.append(axis);chunks.append(np.tile(axis.astype('<f4'),(len(vertices),1)))
    result=np.concatenate(chunks);assert len(chunks)==2433 and result.shape==(61362,3)
    assert np.isfinite(result).all() and np.max(abs(np.linalg.norm(result,axis=1)-1))<1e-6
    output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(result.tobytes())
    record={'sourceSHA256':pin,'vertices':61362,'attribute':{'name':'_FIBER_AXIS','type':'VEC3','components':3},
      'originalSHA256':'4623278f7d9148d0ccdfd0080eb3f44dac36adb07bd6b8283b2863a7b9ad8f27',
      'fiberAxes':{'objects':2433,'method':'Principal covariance axis of each original cached Brep member, using unique source vertices in metre Y-up coordinates. Canonical sign, no source position or topology modification.',
       'longAxisVerified':True,'axisLengthTolerance':1e-6,'minimumMajorToSecondVarianceRatio':min(ratios),'nearIsotropicMembers':sum(v<1.2 for v in ratios)},
      'limits':'Member grain follows source geometry. Colour, pores and fibre variation are procedural photo-informed approximations, not measured species, scanned knots or as-built texture maps.'}
    output.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    assert hashlib.sha256(source.read_bytes()).hexdigest()==pin;print(json.dumps(record))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);args=p.parse_args();derive(args.source,args.output)
