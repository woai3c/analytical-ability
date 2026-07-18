from pathlib import Path

import fitz


pdf = next(Path.cwd().glob("*.pdf"))
out = Path("tmp/pdfs/rendered")
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
selected_pages = set(range(min(24, len(doc))))
selected_pages.update(
    page - 1
    for page in [
        34, 37, 44, 54,
        63, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82,
        83, 87, 95,
        105, 109, 115,
        127, 131, 135,
        145, 150, 157,
        161, 166, 173,
        181, 186, 191,
        197, 204, 208, 216,
    ]
)
for page_no in sorted(selected_pages):
    page = doc[page_no]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pix.save(out / f"page-{page_no + 1:03d}.png")
