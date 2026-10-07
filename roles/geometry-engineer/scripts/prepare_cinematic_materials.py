"""Faithful page crops for the local cinematic review. Originals remain read-only.

All working copies, processing and audit are written under the owner-designated
D:\\JosHsuan_Website work area. --handoff explicitly copies prepared derivatives
to the isolated review app; a normal website build never opens the source drive.
"""
from pathlib import Path
import argparse,hashlib,json,shutil
from PIL import Image

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def prepare(work,source,handoff=None):
    allowed=Path('D:/JosHsuan_Website').resolve()
    work=work.resolve();source=source.resolve()
    if not work.is_relative_to(allowed) or work.is_relative_to(source) or source.is_relative_to(work):
        raise ValueError('Working copies must be separate from originals under D:/JosHsuan_Website')
    specs=[
        ('geometry-strip',24,(45,1110,1155,1410),'Fig. 3-04 workflow strip'),
        ('function-library',25,(35,30,745,695),'Fig. 3-05 function-library diagram; not a live predictor'),
        ('connection-detail',28,(624,494,1167,1602),'Fig. 3-13 panel-joint photograph'),
        ('built-prototype',29,(24,495,1134,1044),'Completed physical prototype photograph'),
        ('surface-detail',23,(0,235,1191,1610),'Photographed perforated metal surface'),
    ]
    copies=work/'source-copies';out=work/'prepared';copies.mkdir(parents=True,exist_ok=True);out.mkdir(parents=True,exist_ok=True)
    records=[]
    for name,page,box,description in specs:
        original=source/f'bending-active-metal-panel-folio-p{page:03}.webp'
        before=digest(original);working=copies/original.name;shutil.copy2(original,working)
        image=Image.open(working);assert image.size==(1191,1684)
        crop=image.crop(box);target=out/f'{name}.webp';crop.save(target,format='WEBP',lossless=True)
        full=out/f'source-p{page:03}.webp';shutil.copy2(working,full)
        after=digest(original);assert before==after
        records.append({'id':name,'description':description,'source':str(original),'sourceSHA256':before,'sourceUnchangedAfterProcessing':True,'cropPixels':list(box),'output':target.name,'outputSHA256':digest(target),'width':crop.width,'height':crop.height,'fullSourcePage':full.name,'operation':'Exact rectangular crop, lossless WebP; no repaint, retouch or generated content.','scope':'owner-authorized local review; public release pending'})
    manifest={'workingRoot':str(work),'sourceOriginalsModified':False,'assets':records}
    (work/'material-provenance.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    if handoff:
        destination=handoff.resolve();repo=Path(__file__).resolve().parents[3]
        expected=repo/'roles/uiux-designer/cases/bending-active-thesis/public/assets/cinematic'
        if destination!=expected.resolve():raise ValueError('Unexpected review handoff destination')
        destination.mkdir(parents=True,exist_ok=True)
        for p in out.iterdir():
            if p.suffix=='.webp':shutil.copy2(p,destination/p.name)
        sanitized={'scope':'local-review-only','assets':[{k:v for k,v in r.items() if k!='source'} for r in records]}
        (destination/'media.json').write_text(json.dumps(sanitized,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'workingRoot':str(work),'prepared':len(records),'originalsUnchanged':True,'handoff':str(handoff) if handoff else None},indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--work',type=Path,required=True);p.add_argument('--source',type=Path,required=True);p.add_argument('--handoff',type=Path)
    a=p.parse_args();prepare(a.work,a.source,a.handoff)
