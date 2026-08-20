from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from docx import Document
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, NumberObject, TextStringObject
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


SOURCE_ZIP = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-final-pack-20-august-2026-v3.zip")
ROOT = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-client-pack-20-august-2026-final-v6")

if ROOT.exists():
    raise SystemExit(f"Destination already exists: {ROOT}")

with ZipFile(SOURCE_ZIP) as archive:
    archive.extractall(ROOT)


def replace_in_docx(path, replacements):
    document = Document(path)
    for paragraph in document.paragraphs:
        for old, new in replacements.items():
            if old in paragraph.text:
                paragraph.text = paragraph.text.replace(old, new)
    document.save(path)


def configure_multiline_fields(writer, field_names, font_size=8):
    for page in writer.pages:
        for annotation in page.get("/Annots", []):
            widget = annotation.get_object()
            if widget.get("/T") in field_names:
                widget[NameObject("/Ff")] = NumberObject(int(widget.get("/Ff", 0)) | 4096)
                widget[NameObject("/DA")] = TextStringObject(f"/ArialMT {font_size} Tf 0 g")


replace_in_docx(
    ROOT / "00_READ_FIRST_CASE_SUMMARY_AND_INDEX" / "00-case-summary-and-merits-status.docx",
    {
        "Route: Ground 1, occupation by landlord or family. This is a Ground 1-only case. It does not rely on Ground 8, rent arrears or a money claim because the supplied material records tenant payments to GOA and Black & White and does not safely establish arrears owed by the tenants to Suraraj.":
        "Route: Ground 1, occupation by landlord or family. This is a Ground 1 possession claim. The claimant seeks possession only.",
    },
)
replace_in_docx(
    ROOT / "00_READ_FIRST_CASE_SUMMARY_AND_INDEX" / "05-merits-risks-and-response-plan.docx",
    {
        "; and Ground 8 is not pleaded on an unsafe payment theory.": ".",
    },
)
replace_in_docx(
    ROOT / "03_COURT_FORMS_FOR_ISSUE_AFTER_NOTICE_EXPIRES" / "04-litigant-in-person-hearing-guide.docx",
    {
        " I do not seek rent arrears or make a Ground 8 claim.": " I seek possession only.",
    },
)
replace_in_docx(
    ROOT / "05_WITNESS_STATEMENT_FOR_SIGNATURE" / "01-ground-1-witness-statement-for-review-and-signature.docx",
    {
        "9. This claim does not rely on Ground 8, rent arrears or any money claim against the Defendants.":
        "9. This is a Ground 1 possession claim only.",
    },
)

continuation = ROOT / "01_SERVE_ON_20_AUGUST_2026" / "02-form-3a-continuation-sheet-ground-1-serve-with-notice.pdf"
styles = getSampleStyleSheet()
ground_1_legal = (
    "Ground 1<br/>"
    "The current tenancy began at least 1 year before the relevant date and the landlord who is seeking possession "
    "requires the dwelling-house as the only or principal home of any of the following: (a) the landlord; (b) the "
    "landlord's spouse or civil partner or a person with whom the landlord lives as if they were married or in a civil "
    "partnership; (c) the landlord's parent, grandparent, sibling, child or grandchild; or (d) a child or grandchild "
    "of a person mentioned in paragraph (b). A relationship of the half-blood is to be treated as a relationship of "
    "the whole blood. In the case of joint landlords seeking possession, references to the landlord are to be read as "
    "references to at least one of those joint landlords. When calculating whether the current tenancy began at least "
    "1 year before the relevant date, both the day when the current tenancy began and the relevant date must be included."
)
reasons = (
    "Suraraj Pradhan requires the Property as his only or principal home. He currently lives at 26A Rhodes Place, "
    "Oldbrook, Milton Keynes, MK6 2LX. His son turns four in December 2026 and he intends to move to the Property "
    "to support the school application; the proposed school is about 200 metres away and the Property is in its catchment area. "
    "He intends to occupy the Property permanently as his sole and main home. The current tenancy began on 25 November 2025. "
    "The earliest date for proceedings in this notice is 20 December 2026, after the 12-month period. The claimant "
    "relies on title evidence, current-address evidence and his signed witness statement. No previous notice is relied upon."
)
story = [
    Paragraph("Continuation Sheet to Form 3A - Ground 1", styles["Title"]),
    Paragraph("Property: 39 Upton Grove, Shenley Lodge, Milton Keynes, MK5 7GR", styles["Normal"]),
    Paragraph("Landlord: Suraraj Pradhan. Tenants: Shellyann Roberts-Henry, Mignal Small and Taylor Goulbourne.", styles["Normal"]),
    Paragraph("Notice date: 20 August 2026. This continuation sheet forms part of the Form 3A notice and must be served with every copy of it.", styles["Normal"]),
    Spacer(1, 5 * mm),
    Paragraph("Question 4.2 - Full legal wording: Ground 1", styles["Heading2"]),
    Paragraph(ground_1_legal, styles["Normal"]),
    Spacer(1, 5 * mm),
    Paragraph("Question 4.3 - Why Ground 1 is used", styles["Heading2"]),
    Paragraph(reasons, styles["Normal"]),
]
SimpleDocTemplate(str(continuation), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=18 * mm, bottomMargin=18 * mm).build(story)

n119 = ROOT / "03_COURT_FORMS_FOR_ISSUE_AFTER_NOTICE_EXPIRES" / "03-draft-n119-ground-1-pre-issue-editable.pdf"
reader = PdfReader(str(n119))
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.reattach_fields()
configure_multiline_fields(writer, {"Text Field 113"}, 8)
values = {
    "Text Field 113": (
        "The claimant seeks possession under Ground 1 of Schedule 2 to the Housing Act 1988 only. "
        "He genuinely requires the Property as his only or principal home and intends to move there with "
        "his family. His son turns four in December 2026; the Property is about 200 metres from the school "
        "relevant to the planned application. The claimant relies on title/standing evidence, current-address "
        "evidence, a signed witness statement and service evidence. The written tenancy agreement identifies "
        "GOA Property Solutions Ltd as landlord; the claimant's standing case is set out in his signed statement "
        "and supporting documents. He does not contend that revocation of GOA's authority alone terminated or "
        "varied the tenancy. Form 3A and its continuation sheet were served on each defendant on 20 August 2026. "
        "The notice did not permit proceedings before 20 December 2026. The claimant seeks possession only."
    )
}
for page in writer.pages:
    writer.update_page_form_field_values(page, values, auto_regenerate=True)
with open(n119, "wb") as output:
    writer.write(output)

print(ROOT)
