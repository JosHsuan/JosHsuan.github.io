"""Prepare the local OCR B webfont; never runs in the website build.

Requires fontTools 4.25.0 and brotlipy 0.7.0. Original source and the exact
upstream package are identified in OCR_TYPOGRAPHY_INTEGRATION.md. The script preserves all
original glyph programs and metrics and adds only missing editorial symbols.
"""

from hashlib import sha256
from importlib.metadata import version
from io import BytesIO
from math import cos, pi, sin
from pathlib import Path

from fontTools import __version__
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "assets/fonts/ocr-b-original.otf"
DESTINATION = Path(__file__).resolve().parents[1] / "release/public/assets/fonts/portfolio-ocr-b.woff2"
SOURCE_SHA256 = "87c8d5bfd541d28023d2ba3383169c49f565e10d487ebb027ea0d735ef558707"
NOTICE = Path(__file__).resolve().parents[1] / "release/public/licenses/ocr-b-NOTICE.txt"
NOTICE_SHA256 = "4aa5a5712130c58178b00d518d422ccb96845ed59cd09b1155a7087acebd7ebc"

LINE_METRICS = {
    "head": ("unitsPerEm",),
    "hhea": ("ascent", "descent", "lineGap", "caretSlopeRise", "caretSlopeRun", "caretOffset"),
    "OS/2": ("sTypoAscender", "sTypoDescender", "sTypoLineGap", "usWinAscent", "usWinDescent", "sxHeight", "sCapHeight", "fsType"),
    "post": ("underlinePosition", "underlineThickness"),
}


def snapshot(font):
    glyphs = font.getGlyphSet()
    outlines, programs = {}, {}
    for name in font.getGlyphOrder():
        pen = RecordingPen()
        glyphs[name].draw(pen)
        outlines[name] = pen.value
        charstring = font["CFF "].cff.topDictIndex[0].CharStrings[name]
        charstring.decompile()
        programs[name] = charstring.program.copy()
    return {
        "order": font.getGlyphOrder().copy(),
        "metrics": font["hmtx"].metrics.copy(),
        "outlines": outlines,
        "programs": programs,
        "cmaps": {(table.platformID, table.platEncID, table.language, table.format): table.cmap.copy()
                  for table in font["cmap"].tables if table.isUnicode()},
        "line_metrics": {table: {key: getattr(font[table], key) for key in keys}
                         for table, keys in LINE_METRICS.items()},
    }


def assert_preserved(previous, result):
    current = snapshot(result)
    assert current["order"][:len(previous["order"])] == previous["order"], "Existing glyph IDs changed"
    for name in previous["order"]:
        for kind in ("metrics", "outlines", "programs"):
            assert current[kind][name] == previous[kind][name], f"Existing {kind} changed: {name}"
    for identity, mapping in previous["cmaps"].items():
        assert identity in current["cmaps"], "Existing Unicode cmap table removed"
        assert all(current["cmaps"][identity].get(codepoint) == name for codepoint, name in mapping.items()), "Existing character mapping changed"
    assert current["line_metrics"] == previous["line_metrics"], "Existing line metrics changed"


def prepare_notice(path=NOTICE):
    # Canonical bytes must match Git's text/eol=lf representation even when
    # preparing on Windows. Never regenerate or silently change licence text.
    source = path.read_bytes()
    canonical = source.replace(b"\r\n", b"\n")
    assert b"\r" not in canonical, "The notice must use LF line endings"
    assert sha256(canonical).hexdigest() == NOTICE_SHA256, "Original OCR notice text changed"
    if source != canonical:
        path.write_bytes(canonical)


def prepare():
    assert __version__ == "4.25.0", "Use the recorded fontTools version"
    assert version("brotlipy") == "0.7.0", "Use the recorded brotlipy version"
    assert sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA256
    prepare_notice()
    previous = snapshot(TTFont(DESTINATION, recalcTimestamp=False)) if DESTINATION.exists() else None
    font = TTFont(SOURCE, recalcTimestamp=False)
    glyph_set = font.getGlyphSet()
    original_order = font.getGlyphOrder()
    original_metrics = font["hmtx"].metrics.copy()
    original_outlines = {}
    for name in original_order:
        pen = RecordingPen()
        glyph_set[name].draw(pen)
        original_outlines[name] = pen.value
    top = font["CFF "].cff.topDictIndex[0]
    charstrings = top.CharStrings
    programs = {name: charstrings[name] for name in original_order}
    original_programs = {}
    for name, charstring in programs.items():
        charstring.decompile()
        original_programs[name] = charstring.program.copy()
    # Keep the original charstrings themselves, rather than retracing outlines.
    charstrings.charStrings = programs
    charstrings.charStringsAreIndexed = False
    del charstrings.charStringsIndex
    cmap = font.getBestCmap().copy()
    added = []

    def bounds(name):
        pen = BoundsPen(glyph_set)
        glyph_set[name].draw(pen)
        return pen.bounds

    def around_center(name, angle=0, scale_x=1, scale_y=1, center=(361.5, 320)):
        x0, y0, x1, y1 = bounds(name)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        c, s = cos(angle), sin(angle)
        a, b, d, e = c * scale_x, s * scale_x, -s * scale_y, c * scale_y
        return Transform(a, b, d, e, center[0] - a * cx - d * cy, center[1] - b * cx - e * cy)

    def add(codepoint, parts):
        name = f"uni{codepoint:04X}"
        pen = T2CharStringPen(723, glyph_set)
        for source_name, transform in parts:
            glyph_set[source_name].draw(TransformPen(pen, transform))
        charstrings.charStrings[name] = pen.getCharString(private=top.Private, globalSubrs=font["CFF "].cff.GlobalSubrs)
        metric_pen = BoundsPen(None)
        charstrings.charStrings[name].draw(metric_pen)
        font["hmtx"].metrics[name] = (723, round(metric_pen.bounds[0]))
        cmap[codepoint] = name
        added.append(name)

    add(0x00B7, [("period", around_center("period"))])
    add(0x00B0, [("o", around_center("o", scale_x=.35, scale_y=.35, center=(361.5, 690)))])
    add(0x00D7, [("plus", around_center("plus", pi / 4))])
    add(0x2013, [("hyphen", around_center("hyphen", scale_x=1.1))])
    add(0x2014, [("hyphen", around_center("hyphen", scale_x=1.3))])
    add(0x2212, [("hyphen", around_center("hyphen", scale_x=1.1))])
    add(0x2026, [("period", around_center("period", scale_x=.6, scale_y=.6, center=(160, 35))),
                 ("period", around_center("period", scale_x=.6, scale_y=.6, center=(361.5, 35))),
                 ("period", around_center("period", scale_x=.6, scale_y=.6, center=(563, 35)))])
    for codepoint, angle in [(0x2190, pi / 2), (0x2192, -pi / 2), (0x2197, -pi / 4), (0x2198, -3 * pi / 4)]:
        add(codepoint, [("arrowup", around_center("arrowup", angle, .8, .8))])
    add(0x2194, [("arrowup", around_center("arrowup", pi / 2, .65, .65, (286, 320))),
                 ("arrowup", around_center("arrowup", -pi / 2, .65, .65, (437, 320)))])
    # Preserve the photographer's actual credited name, Jan Kyselý, without a
    # fallback font. Existing y is unchanged; the original acute sits 15 units
    # above its 536-unit top, centred on y's 363-unit outline centre.
    add(0x00FD, [("y", Transform()), ("acute", Transform(1, 0, 0, 1, -27, 50))])
    # Preserve the actual Caschlatsch place/author names: Disentis/Mustér and
    # Aurèle Gheyselinck. e's original top is 544; both original accents start
    # at 559 (15 units clear) and share its 363-unit outline centre. Existing
    # e, acute and grave outlines and every preceding derived glyph stay exact.
    add(0x00E9, [("e", Transform()), ("acute", Transform(1, 0, 0, 1, -27, 58))])
    add(0x00E8, [("e", Transform()), ("grave", Transform(1, 0, 0, 1, 27, -25))])
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap.update(cmap)
    font.setGlyphOrder(original_order + added)
    top.charset = original_order + added
    font["maxp"].numGlyphs = len(original_order) + len(added)
    family = "Portfolio OCR B"
    for platform, encoding, language in [(1, 0, 0), (3, 1, 0x409)]:
        for name_id, value in {
            1: family, 2: "Regular", 3: "PortfolioOCRB-20261018", 4: family + " Regular",
            5: "Version 2.003; credited proper-name coverage 2026-10-18", 6: "PortfolioOCRB-Regular",
            13: "Norbert Schwarz: freely use, modify and/or distribute without limitation. Matthew Skala: no copyright claim. See bundled ocr-b-NOTICE.txt.",
            14: "https://tsukurimashou.org/ocr.php.en",
        }.items():
            font["name"].setName(value, name_id, platform, encoding, language)
    top.FamilyName = family
    top.FullName = family + " Regular"
    top.version = "2.003"
    font["head"].fontRevision = 2.003
    font["CFF "].cff.fontNames = ["PortfolioOCRB-Regular"]
    assert all(font["hmtx"].metrics[name] == metric for name, metric in original_metrics.items())
    font.flavor = "woff2"
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    encoded = BytesIO()
    font.save(encoded)
    result = TTFont(BytesIO(encoded.getvalue()), recalcTimestamp=False)
    assert all(result["hmtx"].metrics[name] == metric for name, metric in original_metrics.items())
    assert set(cmap) == set(result.getBestCmap())
    for name, original_outline in original_outlines.items():
        pen = RecordingPen()
        result.getGlyphSet()[name].draw(pen)
        assert pen.value == original_outline, f"Original outline changed: {name}"
        result_charstring = result["CFF "].cff.topDictIndex[0].CharStrings[name]
        result_charstring.decompile()
        assert result_charstring.program == original_programs[name], f"Original program changed: {name}"
    if previous:
        assert_preserved(previous, result)
    # Publish only after all original and previously released glyph checks pass.
    DESTINATION.write_bytes(encoded.getvalue())
    print(f"{DESTINATION.name}: {len(DESTINATION.read_bytes())} bytes; sha256 {sha256(DESTINATION.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    prepare()
