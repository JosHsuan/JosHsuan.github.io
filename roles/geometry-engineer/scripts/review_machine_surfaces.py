"""Explicit, offline photo-reviewed family labels; original CAD stays read-only."""
import argparse
import array
import hashlib
import json
from pathlib import Path
from export_portfolio_models import SOURCES, stored_meshes, r

FAMILIES = ['aluminium', 'steel', 'blue-printed-polymer', 'black-motor',
            'rubber-belt', 'teal-tool-holder', 'bronze-bushing', 'heated-copper-tool', 'white-eps', 'heat-darkened-steel']

def label(source, output):
    pin = SOURCES['machine']['sha256']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == pin
    doc = r.File3dm.Read(str(source))
    labels = array.array('f')
    counts = [dict(objects=0, vertices=0) for _ in FAMILIES]
    for obj in doc.Objects:
        a, g = obj.Attributes, obj.Geometry
        layer = doc.Layers.FindIndex(a.LayerIndex)
        if not (a.Visible and layer.Visible and a.Mode == r.ObjectMode.Normal and isinstance(g, (r.Brep, r.Extrusion))):
            continue
        vertices = [v for mesh in stored_meshes(g) for v in mesh.Vertices]
        size = [max(getattr(v, axis) for v in vertices)-min(getattr(v, axis) for v in vertices) for axis in ('X','Y','Z')]
        # Layer identities are locked by the complete original file hash. CAD
        # layer display colors are deliberately not used as material evidence.
        family = {1:1, 2:2, 3:1, 4:0, 5:0, 6:6, 7:4, 8:1,
                  9:1, 10:1, 11:1, 12:1, 13:3, 14:0, 15:9,
                  16:5, 17:7, 18:0}[a.LayerIndex]
        # The sole large eight-corner rotary blank is the EPS workpiece shown
        # in cutting photos. The other printed-layer members stay blue.
        if a.LayerIndex == 2 and len(vertices) == 24 and min(size) > 100:
            family = 8
        # The long profiled foreground rail is grouped in the printed-part
        # layer, but the corresponding physical rail is silver aluminium.
        if a.LayerIndex == 2 and len(vertices) == 1156 and abs(size[0]-182)<.001:
            family = 0
        # Each stepper has a central 26.4mm body and separate metal endcaps/shaft.
        if a.LayerIndex == 9 and len(vertices) == 48 and 26 < min(size) < 27:
            family = 3
        labels.extend([family] * len(vertices))
        counts[family]['objects'] += 1
        counts[family]['vertices'] += len(vertices)
    assert len(labels) == 503822 and sum(c['objects'] for c in counts) == 1515
    assert counts[8] == dict(objects=1, vertices=24)
    assert counts[3]['objects'] == 12  # three motor bodies and nine mount parts
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(labels.tobytes())
    record = dict(sourceSHA256=pin, vertices=len(labels), families=[dict(id=i,name=name,**counts[i]) for i,name in enumerate(FAMILIES)],
                  limits='Photo-informed surface families, not measured optical coefficients. The long foreground rail overrides its broad printed-part layer using the photographed aluminium member; the solder shaft is heat-darkened steel and only the knife is copper. EPS blank association is inferred from its unique rotary-workpiece geometry and cutting photographs. The unexposed underbed plate remains a source-layer material inference. No CAD layer display colors were copied.')
    output.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    assert hashlib.sha256(source.read_bytes()).hexdigest() == pin
    print(json.dumps(record))

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('output',type=Path)
    args=parser.parse_args();label(args.source,args.output)
