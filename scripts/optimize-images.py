"""Kalza image pipeline: raw AI dumps -> optimized WebP the app serves.

Usage:
    1. Drop raw images (jpg/jpeg/png/webp) into  images-raw/<brand>/
       named  <product-id>-<n>.<ext>   e.g.  images-raw/elite/e-01-1.png
    2. Run from the repo root:  python scripts/optimize-images.py
    3. Output lands in  public/images/products/<brand>/<product-id>-<n>.webp

Requires Pillow:  pip install Pillow

Already-optimized files are skipped unless the raw file is newer
(re-dropping an image re-optimizes it). Pass --force to redo everything.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is missing. Install it with:  pip install Pillow")

REPO = Path(__file__).resolve().parent.parent
RAW_DIR = REPO / "images-raw"
OUT_DIR = REPO / "public" / "images" / "products"

MAX_WIDTH = 1080          # plenty for a ~430px-wide phone at 2x DPR
WEBP_QUALITY = 80         # visually lossless for product photography
WEBP_METHOD = 6           # slowest/smallest encoding
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def optimize(raw: Path, out: Path) -> tuple[int, int]:
    with Image.open(raw) as im:
        im = im.convert("RGB")
        if im.width > MAX_WIDTH:
            ratio = MAX_WIDTH / im.width
            im = im.resize((MAX_WIDTH, round(im.height * ratio)), Image.LANCZOS)
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, "WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
    return raw.stat().st_size, out.stat().st_size


def main() -> None:
    force = "--force" in sys.argv

    if not RAW_DIR.is_dir():
        RAW_DIR.mkdir()
        for brand in ("kalza", "elite", "pasos"):
            (RAW_DIR / brand).mkdir()
        print(f"Created {RAW_DIR} (with kalza/ elite/ pasos/) — drop raw images there and rerun.")
        return

    raw_files = sorted(
        p for p in RAW_DIR.rglob("*") if p.suffix.lower() in EXTENSIONS and p.is_file()
    )
    if not raw_files:
        print(f"No images found in {RAW_DIR}.")
        return

    done = skipped = 0
    total_in = total_out = 0
    for raw in raw_files:
        rel = raw.relative_to(RAW_DIR)
        out = (OUT_DIR / rel).with_suffix(".webp")
        if not force and out.exists() and out.stat().st_mtime >= raw.stat().st_mtime:
            skipped += 1
            continue
        size_in, size_out = optimize(raw, out)
        total_in += size_in
        total_out += size_out
        done += 1
        print(f"  {rel}  {size_in / 1024:,.0f} KB -> {size_out / 1024:,.0f} KB")

    if done:
        saved = 100 * (1 - total_out / total_in)
        print(f"\n{done} optimized ({saved:.0f}% smaller), {skipped} already up to date.")
    else:
        print(f"All {skipped} images already up to date.")


if __name__ == "__main__":
    main()
