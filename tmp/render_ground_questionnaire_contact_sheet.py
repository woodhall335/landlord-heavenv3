from pathlib import Path

import fitz
from PIL import Image, ImageDraw


forms = sorted(Path("output/pdf/england-possession-questionnaire-library").glob("*.pdf"))
output = Path("tmp/individual-ground-library-render")
output.mkdir(parents=True, exist_ok=True)
thumbnails = []

for form_path in forms:
    pdf = fitz.open(form_path)
    pixmap = pdf[0].get_pixmap(matrix=fitz.Matrix(0.32, 0.32), alpha=False)
    image_path = output / f"{form_path.stem}.png"
    pixmap.save(str(image_path))
    thumbnails.append((form_path.stem, Image.open(image_path).convert("RGB")))
    pdf.close()

tile_width, tile_height = 220, 330
columns = 4
rows = (len(thumbnails) + columns - 1) // columns
sheet = Image.new("RGB", (tile_width * columns, tile_height * rows), "white")
draw = ImageDraw.Draw(sheet)

for index, (name, image) in enumerate(thumbnails):
    left = (index % columns) * tile_width
    top = (index // columns) * tile_height
    sheet.paste(image.resize((200, 283)), (left + 10, top + 10))
    draw.text((left + 10, top + 297), name[:31], fill="black")

sheet.save(output / "contact-sheet.png")
print(f"Rendered {len(thumbnails)} first pages.")
