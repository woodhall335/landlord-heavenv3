from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader


forms = sorted(Path("output/pdf/england-possession-questionnaire-library").glob("*.pdf"))
invalid = []
total_widgets = 0

for form_path in forms:
    reader = PdfReader(str(form_path))
    fields = reader.get_fields() or {}
    widgets = sum(
        1
        for page in reader.pages
        for reference in page.get("/Annots", [])
        if reference.get_object().get("/Subtype") == "/Widget"
    )
    total_widgets += widgets
    if len(reader.pages) != 2 or len(fields) < 20 or widgets != len(fields):
        invalid.append((form_path.name, len(reader.pages), len(fields), widgets))

with ZipFile("output/pdf/landlord-heaven-england-possession-questionnaire-library.zip") as archive:
    zip_entries = len(archive.namelist())

print(f"forms={len(forms)} widgets={total_widgets} invalid={invalid} zip_entries={zip_entries}")
