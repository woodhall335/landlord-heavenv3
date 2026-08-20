from pathlib import Path
from shutil import copy2, copytree

from docx import Document
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, NumberObject, TextStringObject


SOURCE = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-client-pack-20-august-2026-final-v10")
ROOT = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-client-pack-20-august-2026-final-v11")
SHEET_SOURCE = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\tmp\The_Renters_Rights_Act_Information_Sheet_2026_official.pdf")

if ROOT.exists():
    raise SystemExit(f"Destination already exists: {ROOT}")
copytree(SOURCE, ROOT)

index = ROOT / "00_READ_FIRST_CASE_SUMMARY_AND_INDEX"
service = ROOT / "01_SERVE_ON_20_AUGUST_2026"
court = ROOT / "03_COURT_FORMS_FOR_ISSUE_AFTER_NOTICE_EXPIRES"
evidence = ROOT / "04_EVIDENCE_BUNDLE"

copy2(SHEET_SOURCE, service / "06-renters-rights-act-information-sheet-2026-official.pdf")


def replace_paragraph(path, old, new):
    document = Document(path)
    for paragraph in document.paragraphs:
        if old in paragraph.text:
            paragraph.text = paragraph.text.replace(old, new)
            document.save(path)
            return
    raise SystemExit(f"Text not found in {path.name}: {old[:80]}")


replace_paragraph(
    service / "02-service-instructions-and-checklist.docx",
    "Before leaving to serve, check that Suraraj has signed and dated the editable Form 3A and, if it was not previously served on every tenant, the formal GOA-revocation notice. Check that every continuation page is present, the tenant names are correct and the Form 3A states 20 December 2026 as the earliest date for proceedings.",
    "Before leaving to serve, check that Suraraj has signed and dated the editable Form 3A and, if it was not previously served on every tenant, the formal GOA-revocation notice. Check that every continuation page is present, the tenant names are correct and the Form 3A states 20 December 2026 as the earliest date for proceedings. The official Renters' Rights Act Information Sheet 2026 PDF is also enclosed. If it was not previously given to every tenant, give the exact PDF to each named tenant now as a separate document and keep proof. It does not form part of the Form 3A notice.",
)
replace_paragraph(
    service / "02-service-instructions-and-checklist.docx",
    "Serve one complete identical set addressed to Shellyann Roberts-Henry, Mignal Small and Taylor Goulbourne at 39 Upton Grove, Shenley Lodge, Milton Keynes, MK5 7GR. The set must include: (1) the signed Form 3A; (2) the Ground 1 continuation sheet; and (3) the signed GOA-revocation notice if it has not already been served on every tenant.",
    "Serve one complete identical set addressed to Shellyann Roberts-Henry, Mignal Small and Taylor Goulbourne at 39 Upton Grove, Shenley Lodge, Milton Keynes, MK5 7GR. The set must include: (1) the signed Form 3A; (2) the Ground 1 continuation sheet; (3) the signed GOA-revocation notice if it has not already been served on every tenant; and (4) the exact official Renters' Rights Act Information Sheet 2026 PDF if it was not previously given to every tenant.",
)
replace_paragraph(
    service / "04-service-record-for-deliverer-complete-immediately.docx",
    "Documents served: (1) complete Form 3A notice seeking possession (Ground 1); (2) Ground 1 continuation sheet; and (3) formal notice of revocation of GOA authority, if not already validly served on every tenant.",
    "Documents served: (1) complete Form 3A notice seeking possession (Ground 1); (2) Ground 1 continuation sheet; (3) formal notice of revocation of GOA authority, if not already validly served on every tenant; and (4) the exact official Renters' Rights Act Information Sheet 2026 PDF, if not already given to every tenant.",
)
replace_paragraph(
    index / "02-filing-status-and-next-steps.docx",
    "4. Confirm whether the required Renters' Rights Act information sheet was served by 31 May 2026, and retain the evidence or obtain legal advice about any non-compliance.",
    "4. The exact official Renters' Rights Act Information Sheet 2026 PDF is now enclosed. If it was not given to every named tenant by 31 May 2026, give the exact PDF to each tenant now and retain proof. Late service does not change the original deadline; obtain legal advice about the compliance risk before issue.",
)
replace_paragraph(
    index / "04-bundle-index-and-document-status.docx",
    "2. Serve on 20 August 2026: editable Form 3A, statutory continuation sheet, service instructions, service record, GOA-revocation notice and do-not-serve warning.",
    "2. Serve on 20 August 2026: editable Form 3A, statutory continuation sheet, service instructions, service record, GOA-revocation notice, exact official Renters' Rights Act Information Sheet 2026 PDF if previously unsent, and do-not-serve warning.",
)
replace_paragraph(
    index / "06-warm-client-email-to-suraraj.docx",
    "Please note that the pack includes the termination notice sent to GOA Property Solutions Ltd. If a formal notice confirming GOA's revoked authority was not previously served on all three tenants, we have also included a formal notice for you to sign and serve with the Section 8 notice. Please retain clear proof of service.",
    "Please note that the pack includes the termination notice sent to GOA Property Solutions Ltd. If a formal notice confirming GOA's revoked authority was not previously served on all three tenants, we have also included a formal notice for you to sign and serve with the Section 8 notice. The exact official Renters' Rights Act Information Sheet 2026 PDF is also enclosed. If it was not previously given to every named tenant, please give the exact PDF to each tenant now and retain clear proof of service.",
)
replace_paragraph(
    court / "01-court-issue-conditions-and-evidence-schedule.docx",
    "Compliance check: confirm whether the Renters' Rights Act information sheet was served by 31 May 2026 and retain service evidence or take legal advice about any failure.",
    "Compliance check: the exact official Renters' Rights Act Information Sheet 2026 PDF is enclosed. Confirm whether it was given to every named tenant by 31 May 2026. If not, give the exact PDF now and retain proof, but take legal advice before issue because late service does not change the original deadline and may expose the landlord to enforcement action.",
)
replace_paragraph(
    evidence / "00-exhibit-schedule-and-bundle-map.docx",
    "SP9 - Historic tenant-notification correspondence. Status: held for context only. It is not proof that a formal GOA-revocation notice was served on all three tenants.",
    "SP9 - Historic tenant-notification correspondence. Status: held for context only. It is not proof that a formal GOA-revocation notice was served on all three tenants.\nSP10 - Exact official Renters' Rights Act Information Sheet 2026 PDF and proof of service, if served. Status: official PDF enclosed. Confirm whether it was given to every named tenant by 31 May 2026; if not, record any late service and obtain legal advice before issue.",
)

(evidence / "00-evidence-index.txt").write_text(
    "EVIDENCE BUNDLE INDEX\n\n"
    "SP1 Standing and ownership: supplied HM Land Registry title-register summary dated 2 April 2026, title BM273247, and signed claimant's standing statement. The supplied summary is marked not an official copy; obtain an official copy before court issue. Independent standing advice remains required before issue.\n"
    "SP2 Current address: council-tax and utility evidence.\n"
    "SP3 Tenancy: written agreement dated 25 November 2025. It records the original AST terms; it became assured periodic on 1 May 2026.\n"
    "SP4 Management: GOA management agreement.\n"
    "SP5 GOA termination: termination notice to GOA.\n"
    "SP6 Service: signed Form 3A, continuation sheet, formal GOA-revocation notice if served, N215, service record and delivery proof.\n"
    "SP7 Ground 1 evidence: signed statement of intent, current witness statement and school-related evidence if available.\n"
    "SP8 Compliance: gas safety certificate, EICR and EPC. These are background/compliance evidence, not primary Ground 1 proof.\n"
    "SP9 Historic tenant-notification correspondence: context only, not proof of a formal notice served on all tenants.\n"
    "SP10 Renters' Rights Act Information Sheet 2026: exact official PDF enclosed in the service folder. Retain proof if served.\n\n"
    "Do not issue until the official title register, standing evidence/advice, actual service proof, signed witness evidence and Renters' Rights Act information-sheet compliance check have been completed.\n",
    encoding="utf-8",
)

(index / "00-IMPORTANT-READ-ME.txt").write_text(
    "GROUND 1 SERVICE PACK - REVISED FOR 20 AUGUST 2026\n\n"
    "Use the editable official Form 3A only after Suraraj has signed it on 20 August 2026. It relies on Ground 1 only. The earliest court date is 20 December 2026.\n\n"
    "The exact official Renters' Rights Act Information Sheet 2026 PDF is enclosed. If it was not previously given to every named tenant, give the exact PDF now and retain proof. Late service does not change the original 31 May 2026 deadline; obtain legal advice before court issue.\n\n"
    "This is a service pack, not a court-ready claim. The written tenancy agreement identifies GOA as landlord, so standing needs independent legal advice before issue. N5, N119 and N215 remain editable official forms; N5/N119 are pre-issue drafts and N215 must be signed only after actual service.\n",
    encoding="utf-8",
)

n215 = ROOT / "02_COMPLETE_AFTER_SERVICE" / "01-n215-ground-1-service-certificate-editable-complete-after-service.pdf"
reader = PdfReader(str(n215))
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.reattach_fields()
for page in writer.pages:
    for annotation in page.get("/Annots", []):
        widget = annotation.get_object()
        if widget.get("/T") == "Text1":
            widget[NameObject("/Ff")] = NumberObject(int(widget.get("/Ff", 0)) | 4096)
            widget[NameObject("/DA")] = TextStringObject("/ArialMT 8 Tf 0 g")
for page in writer.pages:
    writer.update_page_form_field_values(page, {
        "Text1": "Form 3A notice seeking possession (Ground 1), Ground 1 continuation sheet, formal GOA-revocation notice if served, and the Renters' Rights Act Information Sheet 2026 if served."
    }, auto_regenerate=True)
with open(n215, "wb") as output:
    writer.write(output)

print(ROOT)
