from pathlib import Path
import hashlib
import json
import zipfile

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader


OUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\Updated Court Pack - 09 Nov 2026")
RENDER = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\tmp\will_mumford_nov2026_render_v3")
ZIP = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\Will-Mumford-updated-court-case-09-Nov-2026.zip")
SOURCE_NOTICE = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\From Repository\wm\p\01_SERVE_ON_MONDAY_22_JUNE_2026\01-form-3a-corrected-joint-landlords-serve-22-06-2026.pdf")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def pdf_text(reader: PdfReader) -> str:
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def field_snapshot(path: Path):
    reader = PdfReader(str(path))
    fields = reader.get_fields() or {}
    return {
        name: str(data.get("/V", ""))
        for name, data in fields.items()
        if str(data.get("/V", "")) not in {"", "/Off"}
    }


def make_contact_sheets(folder: Path, per_sheet=12):
    pages = sorted(folder.glob("*.png"))
    font = ImageFont.load_default()
    sheets = []
    for sheet_no, start in enumerate(range(0, len(pages), per_sheet), 1):
        subset = pages[start : start + per_sheet]
        canvas = Image.new("RGB", (1800, 2400), "#d9d9d9")
        draw = ImageDraw.Draw(canvas)
        for i, page in enumerate(subset):
            img = Image.open(page).convert("RGB")
            img.thumbnail((550, 535))
            col = i % 3
            row = i // 3
            x = 25 + col * 590 + (550 - img.width) // 2
            y = 35 + row * 590
            canvas.paste(img, (x, y))
            draw.text((25 + col * 590, y + 540), page.stem, fill="black", font=font)
        out = folder / f"contact-{sheet_no:02d}.jpg"
        canvas.save(out, quality=88)
        sheets.append(str(out))
    return sheets


pdfs = sorted(OUT.glob("*.pdf"))
report = {
    "pdf_count": len(pdfs),
    "zip_members": [],
    "page_counts": {},
    "original_notice_hash_matches": False,
    "forbidden_mentions": {},
    "field_snapshots": {},
    "contact_sheets": [],
}

with zipfile.ZipFile(ZIP) as zf:
    report["zip_members"] = sorted(zf.namelist())

for pdf in pdfs:
    reader = PdfReader(str(pdf))
    report["page_counts"][pdf.name] = len(reader.pages)
    text = pdf_text(reader).lower()
    report["forbidden_mentions"][pdf.name] = {
        term: text.count(term.lower())
        for term in ["landlord heaven", "prepared by", "tariq", "draft"]
    }
    if pdf.name.startswith(("02-", "04-", "05-", "06-")):
        report["field_snapshots"][pdf.name] = field_snapshot(pdf)

report["original_notice_hash_matches"] = sha256(SOURCE_NOTICE) == sha256(
    OUT / "01-SERVED-Form-3A-original-digital-copy-unchanged.pdf"
)

for folder in sorted(p for p in RENDER.iterdir() if p.is_dir()):
    report["contact_sheets"].extend(make_contact_sheets(folder))

print(json.dumps(report, indent=2, ensure_ascii=False))
