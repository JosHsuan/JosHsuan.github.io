"""CPU contact sheet of explicitly selected original Rhino meshes for review."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROLE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROLE / '.runtime/python817'))
import rhino3dm as r
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--inventory', type=Path, required=True)
parser.add_argument('--ids', nargs='+', required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--azimuth', type=float, default=-45)
parser.add_argument('--elevation', type=float, default=25)
args = parser.parse_args()
allowed = Path('D:/JosHsuan_Website/_work/bending-active-thesis/round-06').resolve()
if allowed not in args.output.resolve().parents:
    raise ValueError('Contact sheets belong in the private Round 06 workspace.')
before = hashlib.sha256(args.source.read_bytes()).hexdigest()
inventory = json.loads(args.inventory.read_text(encoding='utf-8'))
if inventory['sourceSHA256'] != before:
    raise ValueError('The source no longer matches its inspection.')
model = r.File3dm.Read(str(args.source))
lookup = {str(obj.Attributes.Id): obj for obj in model.Objects}
columns = min(5, len(args.ids))
rows = (len(args.ids) + columns - 1) // columns
fig = plt.figure(figsize=(columns * 4.2, rows * 4.1), facecolor='#f4f4f2')
for index, object_id in enumerate(args.ids):
    obj = lookup[object_id]
    mesh = obj.Geometry
    if not isinstance(mesh, r.Mesh):
        raise TypeError('This bounded renderer only accepts inspected original meshes.')
    vertices = np.array([(v.X, v.Y, v.Z) for v in mesh.Vertices], dtype=np.float64)
    origin = (vertices.min(axis=0) + vertices.max(axis=0)) / 2
    vertices -= origin
    polygons = [[a, b, c] if c == d else [a, b, c, d] for a, b, c, d in mesh.Faces]
    faces = [vertices[polygon] for polygon in polygons]
    if len(mesh.VertexColors) == len(vertices):
        source_colors = np.array([list(mesh.VertexColors[i]) for i in range(len(vertices))]) / 255
        colors = np.array([source_colors[polygon].mean(axis=0) for polygon in polygons])
    else:
        normals = np.array([np.cross(face[1] - face[0], face[2] - face[0]) for face in faces])
        lengths = np.linalg.norm(normals, axis=1)
        normals /= np.maximum(lengths[:, None], 1e-15)
        light = np.array([.3, -.5, 1]); light /= np.linalg.norm(light)
        shade = .4 + .5 * np.abs(normals @ light)
        colors = np.stack([shade * .98, shade, shade, np.ones(len(shade))], axis=1)
    ax = fig.add_subplot(rows, columns, index + 1, projection='3d', facecolor='#f4f4f2')
    collection = Poly3DCollection(faces, facecolors=colors,
                                 edgecolors='#343939' if len(polygons) < 4000 else 'none',
                                 linewidths=.3 if len(polygons) < 4000 else 0)
    ax.add_collection3d(collection)
    low, high = vertices.min(axis=0), vertices.max(axis=0)
    extents = np.maximum(high - low, 1)
    ax.set_xlim(low[0], high[0]); ax.set_ylim(low[1], high[1]); ax.set_zlim(low[2], high[2] if high[2] > low[2] else low[2] + 1)
    ax.set_box_aspect(extents)
    ax.view_init(elev=args.elevation, azim=args.azimuth)
    ax.set_proj_type('ortho'); ax.set_axis_off()
    ax.set_title(f'{object_id[:8]} / {obj.Attributes.Name}\n{len(vertices):,} vertices; {len(polygons):,} faces\nOriginal vertex colors: {len(mesh.VertexColors)}', fontsize=9, pad=0)
fig.subplots_adjust(left=0, right=1, top=.89, bottom=.02, wspace=0, hspace=.18)
args.output.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(args.output, dpi=135)
plt.close(fig)
after = hashlib.sha256(args.source.read_bytes()).hexdigest()
if before != after:
    raise RuntimeError('Source changed during read-only rendering.')
print(json.dumps({'output': str(args.output), 'sourceSHA256': before, 'sourceUnchanged': True, 'objects': args.ids,
                  'method': 'Original source polygons and original authored vertex colors where present; neutral CPU face lighting otherwise. No export, remesh or inferred topology.'}))
