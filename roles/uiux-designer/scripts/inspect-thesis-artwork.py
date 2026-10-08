"""Read-only inspection of selected thesis AI/PDF and PSD sources.
Writes private audit and rendered evidence to an explicit external preparation folder.
"""
import argparse, hashlib, json
from pathlib import Path
import pymupdf
from psd_tools import PSDImage

parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True)
parser.add_argument('--output',required=True)
args=parser.parse_args()
source=Path(args.source).resolve(); output=Path(args.output).resolve(); output.mkdir(parents=True,exist_ok=True)
names=['BendingActive_00.ai','BendingActive_01.ai','BendingActive_02.ai','BendingActive_03.ai','BendingActive_00.psd']
records=[]
def serial(v):
 if isinstance(v,(pymupdf.Point,pymupdf.Rect,pymupdf.Quad)):return [serial(x) for x in list(v)]
 if hasattr(v,'__iter__') and not isinstance(v,(str,bytes,dict)):return [serial(x) for x in v]
 return v
for name in names:
 path=source/name
 if not path.is_file():continue
 record={'name':name,'source':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
 if path.suffix=='.ai':
  doc=pymupdf.open(stream=path.read_bytes(),filetype='pdf'); record['pages']=[]
  record['ocgs']=doc.get_ocgs()
  for index,page in enumerate(doc):
   text=page.get_text('dict',flags=0); drawings=page.get_drawings(); images=page.get_images(full=True)
   page_record={'index':index,'size':list(page.rect),'drawingCount':len(drawings),'imageCount':len(images),'text':page.get_text(),'imageInfo':[{'xref':i[0],'width':i[2],'height':i[3]} for i in images]}
   record['pages'].append(page_record)
   prefix=path.stem+'-p'+str(index+1)
   scale=min(2,1600/max(page.rect.width,1))
   page.get_pixmap(matrix=pymupdf.Matrix(scale,scale)).save(output/(prefix+'.png'))
   (output/(prefix+'-text.json')).write_text(json.dumps(text,default=lambda v:serial(v),ensure_ascii=False),encoding='utf-8')
   clean=[]
   for drawing in drawings:
    clean.append({k:serial(v) for k,v in drawing.items()})
   (output/(prefix+'-paths.json')).write_text(json.dumps(clean,ensure_ascii=False),encoding='utf-8')
  doc.close()
 else:
  psd=PSDImage.open(path);record['size']=list(psd.size)
  record['layers']=[{'name':l.name,'kind':l.kind,'bbox':list(l.bbox),'visible':l.visible,'vectorMask':l.has_vector_mask(),'blend':str(l.blend_mode)} for l in psd.descendants()]
  preview=psd.topil()
  if preview:preview.thumbnail((1600,1600));preview.convert('RGB').save(output/(path.stem+'-psd.jpg'))
 records.append(record)
 print(json.dumps({k:v for k,v in record.items() if k not in ['source','pages','layers','ocgs']},ensure_ascii=False))
 if 'pages' in record:print(json.dumps([{'size':p['size'],'drawings':p['drawingCount'],'images':p['imageCount'],'text':p['text'][:900]} for p in record['pages']],ensure_ascii=False))
 else:print(json.dumps(record['layers'],ensure_ascii=False)[:4500])
(output/'artwork-inspection.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
