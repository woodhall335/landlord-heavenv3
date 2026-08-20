from pathlib import Path

from docx import Document


path = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-client-pack-20-august-2026-final-v7\01_SERVE_ON_20_AUGUST_2026\02-service-instructions-and-checklist.docx")
document = Document(path)
old = "Serve one complete identical set addressed to all three tenants at 39 Upton Grove. The set must include: (1) the signed Form 3A; (2) the Ground 1 continuation sheet; and (3) the signed GOA-revocation notice if it has not already been served on every tenant."
new = "Serve one complete identical set addressed to Shellyann Roberts-Henry, Mignal Small and Taylor Goulbourne at 39 Upton Grove, Shenley Lodge, Milton Keynes, MK5 7GR. The set must include: (1) the signed Form 3A; (2) the Ground 1 continuation sheet; and (3) the signed GOA-revocation notice if it has not already been served on every tenant."
for paragraph in document.paragraphs:
    if paragraph.text == old:
        paragraph.text = new
        break
else:
    raise SystemExit("Target service instruction paragraph not found")
document.save(path)
