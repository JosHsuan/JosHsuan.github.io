"""Extract authored thesis vectors; prepare on D before explicit public handoff.

Run with the isolated source-tools Python. Original AI/PDF files are read-only.
This preserves PDF drawing commands, not a trace or a reconstructed predictor.
"""
import argparse
import base64
import hashlib
import html
import json
import math
import re
import shutil
from pathlib import Path

import pymupdf as fitz


SPECS = {
    "library": ("BendingActive_01.ai", [610, 18, 970, 344], 452),
    "miura": ("BendingActive_00.ai", [650, 270, 1140, 500], 387),
    "workflow": ("BendingActive_01.ai", [20, 18, 580, 542], 585),
}


def number(value):
    return f"{float(value):.9f}".rstrip("0").rstrip(".") or "0"


def coordinates(values):
    return " ".join(number(value) for value in values)


def colour(value):
    return "none" if value is None else "rgb(" + " ".join(number(v * 100) + "%" for v in value) + ")"


def contained(rect, clip):
    return rect[0] >= clip[0] and rect[1] >= clip[1] and rect[2] <= clip[2] and rect[3] <= clip[3]


def path_data(drawing):
    parts, previous, counts = [], None, {}
    for item in drawing["items"]:
        kind = item[0]
        counts[kind] = counts.get(kind, 0) + 1
        if kind in ("l", "c"):
            start = tuple(item[1])
            if previous != start:
                parts.append("M" + coordinates(start))
            parts.append(("L" if kind == "l" else "C") + " ".join(coordinates(point) for point in item[2:]))
            previous = tuple(item[-1])
        elif kind == "re":
            rect = item[1]
            points = [(rect.x0, rect.y0), (rect.x1, rect.y0), (rect.x1, rect.y1), (rect.x0, rect.y1)]
            if item[2] < 0:
                points.reverse()
            parts.append("M" + coordinates(points[0]) + " " + " ".join("L" + coordinates(p) for p in points[1:]) + "Z")
            previous = None
        elif kind == "qu":
            quad = item[1]
            points = [quad.ul, quad.ur, quad.lr, quad.ll]
            parts.append("M" + coordinates(points[0]) + " " + " ".join("L" + coordinates(p) for p in points[1:]) + "Z")
            previous = None
        else:
            raise ValueError(f"Unsupported source command: {kind}")
    if drawing.get("closePath") and previous is not None:
        parts.append("Z")
    return " ".join(parts), counts


def drawing_record(index, drawing):
    data, counts = path_data(drawing)
    dash = re.fullmatch(r"\[([^]]*)\]\s*([-+\d.eE]+)", drawing.get("dashes") or "[] 0")
    attrs = {
        "d": data, "fill": colour(drawing.get("fill")), "stroke": colour(drawing.get("color")),
        "strokeWidth": drawing.get("width") or 0, "fillOpacity": drawing.get("fill_opacity") if drawing.get("fill_opacity") is not None else 1,
        "strokeOpacity": drawing.get("stroke_opacity") if drawing.get("stroke_opacity") is not None else 1,
        "fillRule": "evenodd" if drawing.get("even_odd") else "nonzero",
        "strokeLinecap": ["butt", "round", "square"][max(drawing.get("lineCap") or (0, 0, 0))],
        "strokeLinejoin": ["miter", "round", "bevel"][int(drawing.get("lineJoin") or 0)],
    }
    if dash and dash[1].strip():
        attrs.update(strokeDasharray=dash[1].strip().replace(" ", ","), strokeDashoffset=float(dash[2]))
    return {"id": f"p{index}", "order": drawing["seqno"], "bounds": list(drawing["rect"]), "attrs": attrs}, counts


def native_context(page):
    """Recover group opacity and source clipping around omitted image operators."""
    stack, groups, windows, pending, alpha, previous = [], [], [], [], {}, -1
    for item in page.get_drawings(extended=True):
        level = item["level"]
        stack = [parent for parent in stack if parent["level"] < level]
        if item["type"] in ("clip", "group"):
            stack.append(item)
            if item["type"] == "group":
                groups.append(item)
            else:
                pending.append(item)
        else:
            order = item["seqno"]
            windows.extend({"before": previous, "after": order, "clip": clip} for clip in pending)
            pending = []
            alpha[order] = math.prod(parent.get("opacity", 1) for parent in stack if parent["type"] == "group")
            previous = order
    windows.extend({"before": previous, "after": float("inf"), "clip": clip} for clip in pending)
    return {"groups": groups, "windows": windows, "alpha": alpha}


def span_records(page, clip, context):
    result = []
    traces = page.get_texttrace()
    for block in page.get_text("dict", flags=0)["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if not contained(span["bbox"], clip):
                    continue
                x, y = span["origin"]
                dx, dy = line["dir"]
                width = (span["bbox"][2] - span["bbox"][0]) if abs(dx) > .5 else (span["bbox"][3] - span["bbox"][1])
                candidates = [trace for trace in traces if any(abs(char[2][0]-x) < .02 and abs(char[2][1]-y) < .02 for char in trace["chars"])]
                if not candidates:
                    raise ValueError(f"No native text paint-order match for {span['text']!r}")
                order = min(trace["seqno"] for trace in candidates)
                trace = min(candidates, key=lambda value: value["seqno"])
                group_opacity = math.prod(group["opacity"] for group in context["groups"] if group["opacity"] < 1 and contained(trace["bbox"], group["rect"]))
                result.append({"text": span["text"], "x": x, "y": y, "size": span["size"],
                               "width": width, "rotation": math.degrees(math.atan2(dy, dx)),
                               "fill": f'#{span["color"]:06x}', "opacity": span.get("alpha", 255) / 255 * group_opacity, "type": "text", "order": order})
    return result


def source_images(doc, page, clip, kind, output, context):
    result, private = [], []
    # AI01's native chart has no raster content. PDF image bounding boxes from
    # neighbouring art can overlap it while their actual source clipping is
    # elsewhere; importing those bounds would invent visible chart imagery.
    if kind == "library":
        return result, private
    masks = {record[0]: record[1] for record in page.get_images(full=True)}
    bboxlog = page.get_bboxlog()
    for info in page.get_image_info(xrefs=True):
        if not fitz.Rect(info["bbox"]).intersects(fitz.Rect(clip)):
            continue
        xref = info["xref"]
        if not xref:
            raise ValueError("Inline source image needs an explicit extraction route")
        name = f"{kind}-context-{xref}.png"
        if not (output / name).exists():
            pix = fitz.Pixmap(doc, xref)
            if pix.colorspace and pix.colorspace.n != 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            if masks.get(xref):
                pix = fitz.Pixmap(pix, fitz.Pixmap(doc, masks[xref]))
            # Embedded source thumbnails remain context, with no new rendering.
            scale = min(1, 768 / max(pix.width, pix.height))
            if scale < 1:
                pix = fitz.Pixmap(pix, round(pix.width * scale), round(pix.height * scale))
            pix.save(output / name)
        order = next((i for i, item in enumerate(bboxlog) if item[0] == "fill-image" and max(abs(a-b) for a,b in zip(item[1], info["bbox"])) < .01), -1)
        candidates = [window["clip"] for window in context["windows"] if window["before"] < order < window["after"] and fitz.Rect(window["clip"]["scissor"]).intersects(fitz.Rect(info["bbox"]))]
        native_clip = min(candidates, key=lambda value: fitz.Rect(value["scissor"]).get_area()) if candidates else None
        opacity = math.prod(group["opacity"] for group in context["groups"] if group["opacity"] < 1 and max(abs(a-b) for a,b in zip(group["rect"], info["bbox"])) < .02)
        result.append({"type": "image", "file": name, "matrix": list(info["transform"]), "order": order, "opacity": opacity,
                       "clip": path_data(native_clip)[0] if native_clip else None})
        private.append({"xref": xref, "softMask": masks.get(xref), "bbox": list(info["bbox"]), "sourcePixels": [info["width"], info["height"]]})
    return result, private


def selections(kind, paths):
    if kind == "library":
        by_id = {path["id"]: path for path in paths}
        groups = []
        for index in range(11):
            path = by_id[f"p{927 + index}"]
            groups.append({"id": f"trace-{index + 1}", "label": f"{160 - index * 10} mm", "description": "Authored length trace; select to follow its original curve.", "paths": [path["id"]], "bounds": path["bounds"]})
        return groups
    if kind == "miura":
        regions = [("net", "Net", [661, 275, 791, 498]), ("folds", "Fold lines", [803, 278, 880, 404]), ("form", "Folded form", [841, 331, 1129, 499])]
        return [{"id": key, "label": label, "description": "The authored Miura diagram, with its source geometry and notation.", "bounds": box,
                 "paths": [p["id"] for p in paths if contained(p["bounds"], box) and p["attrs"]["stroke"] != "none"]} for key, label, box in regions]
    # Exact source nodes; hit regions are interaction affordances, not geometry.
    return [
        {"id": "origami", "label": "Origami", "description": "Representation model (Origami Pattern).", "bounds": [224, 59, 311, 121], "paths": [], "representation": 0},
        {"id": "opening", "label": "Opening", "description": "Input the Length Value of Opening.", "bounds": [335, 59, 423, 121], "paths": [], "representation": 1},
        {"id": "bending", "label": "Bending", "description": "Bend-Active Simulation Model (With Material Character).", "bounds": [445, 441, 533, 503], "paths": [], "representation": 2},
        {"id": "colours", "label": "Source colours", "description": "Curvature Analysis of Simulation Model; original authored colours.", "bounds": [334, 441, 423, 503], "paths": [], "representation": 3},
    ]


XML_NAMES = {"strokeWidth": "stroke-width", "fillOpacity": "fill-opacity", "strokeOpacity": "stroke-opacity", "fillRule": "fill-rule", "strokeLinecap": "stroke-linecap", "strokeLinejoin": "stroke-linejoin", "strokeDasharray": "stroke-dasharray", "strokeDashoffset": "stroke-dashoffset"}


def svg_text(data, output_dir):
    box = data["viewBox"]
    output = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{box[2]}" height="{box[3]}" viewBox="{coordinates(box)}">', f'<title>{html.escape(data["title"])}</title>', f'<rect x="{box[0]}" y="{box[1]}" width="{box[2]}" height="{box[3]}" fill="#f8f8f9"/>']
    for index, item in enumerate(sorted(data["paths"] + data["images"] + data["labels"], key=lambda item: item["order"])):
        if item.get("type") == "image":
            embedded = base64.b64encode((output_dir / item["file"]).read_bytes()).decode("ascii")
            if item.get("clip"):
                output.append(f'<defs><clipPath id="context-{index}"><path d="{item["clip"]}"/></clipPath></defs><g clip-path="url(#context-{index})">')
            output.append(f'<image href="data:image/png;base64,{embedded}" opacity="{item["opacity"]}" width="1" height="1" preserveAspectRatio="none" transform="matrix({coordinates(item["matrix"])})"/>')
            if item.get("clip"):
                output.append('</g>')
        elif item.get("type") == "text":
            span = item
            output.append(f'<text x="{number(span["x"])}" y="{number(span["y"])}" fill="{span["fill"]}" opacity="{span["opacity"]}" font-family="Arial,sans-serif" font-size="{number(span["size"])}" textLength="{number(span["width"])}" lengthAdjust="spacingAndGlyphs" transform="rotate({number(span["rotation"])} {number(span["x"])} {number(span["y"])})">{html.escape(span["text"])}</text>')
        else:
            attrs = " ".join(f'{XML_NAMES.get(key,key)}="{html.escape(str(value), quote=True)}"' for key, value in item["attrs"].items())
            output.append(f'<path {attrs}/>')
    output.append('</svg>')
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--work-dir", required=True)
    parser.add_argument("--publish-dir", help="Explicit sanitized asset copy, after D-first preparation")
    args = parser.parse_args()
    source, output = Path(args.source_dir).resolve(), Path(args.work_dir).resolve()
    if output.drive.upper() != "D:":
        raise ValueError("Prepare derivatives in the designated D-drive workspace first")
    output.mkdir(parents=True, exist_ok=True)
    audit = {"method": "Native PDF/AI vectors and authored text; embedded context images only", "rights": "Owner-provided thesis artwork; selected derivatives authorized for this portfolio. No third-party licence is invented or granted.", "coordinateRoundingMax": 5e-10, "typography": "Positions, labels and authored widths retained; typeface adapted to available sans-serif, original fonts not redistributed.", "diagrams": []}
    titles = {"library": "Function library", "miura": "Miura fold anatomy", "workflow": "From geometry to fabrication"}
    public_names = set()
    for kind, (name, clip, expected) in SPECS.items():
        original = source / name
        before = hashlib.sha256(original.read_bytes()).hexdigest()
        with fitz.open(original) as doc:
            page = doc[0]
            raw = page.get_drawings()
            context = native_context(page)
            selected = [(i, drawing) for i, drawing in enumerate(raw) if contained(drawing["rect"], clip)]
            assert len(selected) == expected, (kind, len(selected), expected)
            paths, command_counts = [], {}
            for index, drawing in selected:
                record, counts = drawing_record(index, drawing)
                for property_name in ("fillOpacity", "strokeOpacity"):
                    record["attrs"][property_name] *= context["alpha"].get(drawing["seqno"], 1)
                paths.append(record)
                for command, count in counts.items():
                    command_counts[command] = command_counts.get(command, 0) + count
            images, image_audit = source_images(doc, page, clip, kind, output, context)
            labels = span_records(page, clip, context)
            groups = selections(kind, paths)
            if kind == "library":
                assert all(len(raw[index]["items"]) >= 100 and all(item[0] in ("c", "l") for item in raw[index]["items"]) for index in range(927, 938))
                assert sum(item[0] == "l" for index in range(927, 938) for item in raw[index]["items"]) == 1
                assert all(any(label["text"] == f"{value}mm" for label in labels) for value in range(60, 171, 10))
            data = {"version": 1, "kind": kind, "title": titles[kind], "viewBox": [clip[0], clip[1], clip[2]-clip[0], clip[3]-clip[1]],
                    "paths": paths, "labels": labels, "images": images, "groups": groups,
                    "provenance": {"source": name, "page": 1, "drawings": len(paths), "labels": len(labels), "contextImages": len(images), "interactiveGroups": len(groups), "method": "Authored vector paths and labels; source image contexts. No inferred measurement."}}
            (output / f"{kind}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
            (output / f"{kind}.svg").write_text(svg_text(data, output), encoding="utf-8")
            public_names.update([f"{kind}.json", f"{kind}.svg", *[image["file"] for image in images]])
            page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=fitz.Rect(clip)).save(output / f"{kind}-source-review.png")
        after = hashlib.sha256(original.read_bytes()).hexdigest()
        assert before == after, "Original source changed"
        record = {"kind": kind, "source": str(original), "sha256Before": before, "sha256After": after, "sourceUnchanged": True, "clip": clip, "sourceDrawingIndices": [index for index, _ in selected], "nativeCommands": command_counts, "sourceImages": image_audit, "public": data["provenance"]}
        if kind == "library":
            record["traceLabelRelation"] = "Source drawing 927..937 corresponds visually to original length-axis positions 160..60 mm (11 traces). 170 mm is an axis tick, not a twelfth long curve. No curve evaluation, interpolation or bending prediction is implemented."
        audit["diagrams"].append(record)
        print(json.dumps(data["provenance"]))
    (output / "source-diagrams-private-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.publish_dir:
        destination = Path(args.publish_dir).resolve()
        destination.mkdir(parents=True, exist_ok=True)
        for name in sorted(public_names):
            shutil.copy2(output / name, destination / name)
        # Remove only this extractor's obsolete, direct child context images.
        for file in destination.iterdir():
            if file.is_file() and file.resolve().parent == destination and re.fullmatch(r"(library|miura|workflow)-context-\d+\.png", file.name) and file.name not in public_names:
                file.unlink()
        print(f"Explicit handoff: {destination}")


if __name__ == "__main__":
    main()
