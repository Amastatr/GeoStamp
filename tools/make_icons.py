#!/usr/bin/env python3
"""Generate the GeoStamp extension icons to match the AI Contextualizers family.

The product letter is detected from manifest.json (GeoStamp -> "G", UserStamp ->
"U", TimeStamp -> "T"). Each icon is rendered natively at its target size via
high-resolution supersampling and a LANCZOS downscale for antialiasing.

Geometry (all fractions of the icon's width/height, measured from the reference
set):
  - Rounded square filling the canvas, corner radius 12.5% of width, fill
    #1F2024, on a transparent background.
  - The product letter, heavy bold sans capital in #FFFFFF, cap height ~51% of
    icon height, optically centered.
  - A square-cut bracket pair in #F02F40 flanking the letter: vertical stems
    with short inward-turned arms top and bottom. Bracket height ~38% of icon
    height (top edge ~30.5%, bottom ~68.8%), left stem beginning ~16.4% in from
    the left edge, right bracket mirrored. Stroke ~5% of width, arms reaching
    inward ~5% again.
  - At 16px the brackets are omitted entirely (reference behavior): just the
    white letter on the graphite square.
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "icons"

GRAPHITE = (0x1F, 0x20, 0x24, 0xFF)   # #1F2024
WHITE = (0xFF, 0xFF, 0xFF, 0xFF)      # #FFFFFF
RED = (0xF0, 0x2F, 0x40, 0xFF)        # #F02F40

SIZES = (16, 32, 48, 128)
SS = 16  # supersampling factor for antialiasing

# Heavy bold sans candidates, in preference order.
FONT_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
)

# Geometry as fractions of the icon dimension.
CORNER_R = 0.125
CAP_H = 0.51
LETTER_MID = (0.305 + 0.688) / 2.0   # bracket midline; letter centers here
BR_TOP = 0.305
BR_BOTTOM = 0.688
BR_LEFT_OUTER = 0.164
STROKE = 0.05
ARM = 0.05


def detect_letter() -> str:
    name = json.loads((ROOT / "manifest.json").read_text())["name"]
    return name.strip()[0].upper()


def font_path() -> str:
    for c in FONT_CANDIDATES:
        if Path(c).exists():
            return c
    raise SystemExit("No bold sans font found among: " + ", ".join(FONT_CANDIDATES))


def fit_font(letter: str, target_cap_px: float, fpath: str) -> ImageFont.FreeTypeFont:
    """Size the font so the letter's ink (cap) height equals target_cap_px."""
    size = int(target_cap_px)
    for _ in range(6):
        font = ImageFont.truetype(fpath, size)
        l, t, r, b = font.getbbox(letter)
        cap = b - t
        if cap == 0:
            break
        if abs(cap - target_cap_px) <= 0.5:
            return font
        size = max(1, round(size * target_cap_px / cap))
    return ImageFont.truetype(fpath, size)


def draw_bracket(draw: ImageDraw.ImageDraw, hi: int, mirror: bool) -> None:
    w = STROKE * hi
    arm = ARM * hi
    top = BR_TOP * hi
    bottom = BR_BOTTOM * hi
    if not mirror:
        outer = BR_LEFT_OUTER * hi
        draw.rectangle([outer, top, outer + w, bottom], fill=RED)               # stem
        draw.rectangle([outer, top, outer + w + arm, top + w], fill=RED)        # top arm
        draw.rectangle([outer, bottom - w, outer + w + arm, bottom], fill=RED)  # bottom arm
    else:
        outer = hi - BR_LEFT_OUTER * hi
        draw.rectangle([outer - w, top, outer, bottom], fill=RED)
        draw.rectangle([outer - w - arm, top, outer, top + w], fill=RED)
        draw.rectangle([outer - w - arm, bottom - w, outer, bottom], fill=RED)


def render(size: int, letter: str, fpath: str) -> Image.Image:
    hi = size * SS
    img = Image.new("RGBA", (hi, hi), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([0, 0, hi - 1, hi - 1], radius=CORNER_R * hi, fill=GRAPHITE)

    # Brackets are omitted at the smallest size (reference behavior).
    if size != 16:
        draw_bracket(draw, hi, mirror=False)
        draw_bracket(draw, hi, mirror=True)

    font = fit_font(letter, CAP_H * hi, fpath)
    l, t, r, b = font.getbbox(letter)
    cx, cy = hi / 2.0, LETTER_MID * hi
    x = cx - l - (r - l) / 2.0
    y = cy - t - (b - t) / 2.0
    draw.text((x, y), letter, font=font, fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    letter = detect_letter()
    fpath = font_path()
    OUT_DIR.mkdir(exist_ok=True)
    print(f"letter={letter!r} font={fpath}")
    for size in SIZES:
        out = OUT_DIR / f"icon{size}.png"
        render(size, letter, fpath).save(out)
        print(f"wrote {out.relative_to(ROOT)} ({size}x{size})")


if __name__ == "__main__":
    main()
