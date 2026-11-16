from __future__ import annotations

from io import BytesIO
from pathlib import Path
import hashlib
import shutil
import zipfile

import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject,
    BooleanObject,
    DecodedStreamObject,
    DictionaryObject,
    FloatObject,
    NameObject,
    NumberObject,
    TextStringObject,
)
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


REPO = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3")
CASE = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\From Repository\wm\p")
CLEAN = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\From Repository\mumford-clean-bundle")
OUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\Updated Court Pack - 09 Nov 2026")
WORK = REPO / "tmp" / "will_mumford_nov2026_build"
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)

N5_SRC = CASE / "06_AUGUST_2026_CASE_UPDATE_AND_NEW_EVIDENCE" / "05_current-official-court-forms" / "01-current-blank-n5-england-05-26.pdf"
N119_SRC = CASE / "06_AUGUST_2026_CASE_UPDATE_AND_NEW_EVIDENCE" / "05_current-official-court-forms" / "02-current-blank-n119-england-05-26.pdf"
N215_SRC = REPO / "tmp" / "pdfs" / "N215_official.pdf"
NOTICE_SRC = CASE / "01_SERVE_ON_MONDAY_22_JUNE_2026" / "01-form-3a-corrected-joint-landlords-serve-22-06-2026.pdf"

CLAIMANTS = "William Mumford and Leanne Mumford"
DEFENDANT = "Rebecca Mumford"
PROPERTY_1 = "Flat 7 Machin Mews"
PROPERTY_2 = "Standfast Road, Henbury"
PROPERTY_TOWN = "Bristol"
PROPERTY_COUNTY = ""
PROPERTY_POSTCODE = "BS10 7HJ"
PROPERTY_FULL = "Flat 7 Machin Mews, Standfast Road, Henbury, Bristol, BS10 7HJ"
CLAIMANT_1_FIRST = "William"
CLAIMANT_1_LAST = "Mumford"
CLAIMANT_2_FIRST = "Leanne"
CLAIMANT_2_LAST = "Mumford"
CLAIMANT_ADDRESS_1 = "39 Boundary Close"
CLAIMANT_ADDRESS_2 = ""
CLAIMANT_TOWN = "Kingswood"
CLAIMANT_COUNTY = "Gloucestershire"
CLAIMANT_POSTCODE = "GL12 8EN"
CLAIMANT_EMAIL = "will1883@hotmail.co.uk"
CLAIMANT_PHONE = "07878 789367"
COURT = "Bristol County Court and Family Court"
COURT_ADDRESS = "Bristol Civil and Family Justice Centre, 2 Redcliff Street, Bristol, BS1 6GR"

DARK = HexColor("#202020")
MID = HexColor("#5A5A5A")
LIGHT = HexColor("#F2F2F2")
PURPLE = HexColor("#4F2A96")
PALE_PURPLE = HexColor("#F4F0FA")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _set_field_font_sizes(writer: PdfWriter, sizes: dict[str, float]):
    if "/AcroForm" in writer.root_object:
        acro = writer.root_object["/AcroForm"].get_object()
        resources = acro.get("/DR")
        if resources is None:
            resources = DictionaryObject()
            acro[NameObject("/DR")] = resources
        else:
            resources = resources.get_object()
        fonts = resources.get("/Font")
        if fonts is None:
            fonts = DictionaryObject()
            resources[NameObject("/Font")] = fonts
        else:
            fonts = fonts.get_object()
        if NameObject("/Helv") not in fonts:
            font = DictionaryObject({
                NameObject("/Type"): NameObject("/Font"),
                NameObject("/Subtype"): NameObject("/Type1"),
                NameObject("/BaseFont"): NameObject("/Helvetica"),
                NameObject("/Encoding"): NameObject("/WinAnsiEncoding"),
            })
            fonts[NameObject("/Helv")] = writer._add_object(font)

    fields = writer.get_fields() or {}
    for name, size in sizes.items():
        if name in fields:
            fields[name][NameObject("/DA")] = TextStringObject(f"/Helv {size} Tf 0 g")
    for page in writer.pages:
        for ref in page.get("/Annots") or []:
            widget = ref.get_object()
            parent_ref = widget.get("/Parent")
            parent = parent_ref.get_object() if parent_ref else None
            name = widget.get("/T") or (parent.get("/T") if parent else None)
            if name in sizes:
                da = TextStringObject(f"/Helv {sizes[name]} Tf 0 g")
                widget[NameObject("/DA")] = da
                if parent is not None:
                    parent[NameObject("/DA")] = da


def _set_multiline(writer: PdfWriter, names: set[str]):
    fields = writer.get_fields() or {}
    for name in names:
        if name in fields:
            fields[name][NameObject("/Ff")] = NumberObject(int(fields[name].get("/Ff", 0)) | 4096)
    for page in writer.pages:
        for ref in page.get("/Annots") or []:
            widget = ref.get_object()
            parent_ref = widget.get("/Parent")
            parent = parent_ref.get_object() if parent_ref else None
            name = widget.get("/T") or (parent.get("/T") if parent else None)
            if name in names:
                target = parent if parent is not None else widget
                target[NameObject("/Ff")] = NumberObject(int(target.get("/Ff", 0)) | 4096)


def _force_checkbox_appearances(writer: PdfWriter, checks: dict[str, str]):
    fields = writer.get_fields() or {}
    for name, state in checks.items():
        if name in fields:
            fields[name][NameObject("/V")] = NameObject(state)
    for page in writer.pages:
        for ref in page.get("/Annots") or []:
            widget = ref.get_object()
            parent_ref = widget.get("/Parent")
            parent = parent_ref.get_object() if parent_ref else None
            name = widget.get("/T") or (parent.get("/T") if parent else None)
            if name not in checks:
                continue
            state = NameObject(checks[name])
            widget[NameObject("/AS")] = state
            (parent if parent is not None else widget)[NameObject("/V")] = state
            rect = [float(v) for v in widget["/Rect"]]
            width, height = rect[2] - rect[0], rect[3] - rect[1]
            pad = min(width, height) * 0.24
            appearance = DecodedStreamObject()
            appearance.set_data(
                (
                    f"q 1 w 0 0 0 RG 0 0 {width:.3f} {height:.3f} re S "
                    f"{pad:.3f} {pad:.3f} m {width-pad:.3f} {height-pad:.3f} l S "
                    f"{pad:.3f} {height-pad:.3f} m {width-pad:.3f} {pad:.3f} l S Q"
                ).encode("ascii")
            )
            appearance[NameObject("/Type")] = NameObject("/XObject")
            appearance[NameObject("/Subtype")] = NameObject("/Form")
            appearance[NameObject("/FormType")] = NumberObject(1)
            appearance[NameObject("/BBox")] = ArrayObject([
                FloatObject(0), FloatObject(0), FloatObject(width), FloatObject(height)
            ])
            appearance[NameObject("/Resources")] = DictionaryObject()
            appearance_ref = writer._add_object(appearance)
            ap = widget.get("/AP")
            ap = ap.get_object() if ap else DictionaryObject()
            normal = ap.get("/N")
            normal = normal.get_object() if normal else DictionaryObject()
            if not isinstance(normal, DictionaryObject):
                normal = DictionaryObject()
            normal[state] = appearance_ref
            ap[NameObject("/N")] = normal
            widget[NameObject("/AP")] = ap


def _paint_selected_checkboxes(writer: PdfWriter, checks: dict[str, str]):
    for page in writer.pages:
        selected = []
        for ref in page.get("/Annots") or []:
            widget = ref.get_object()
            parent_ref = widget.get("/Parent")
            parent = parent_ref.get_object() if parent_ref else None
            name = widget.get("/T") or (parent.get("/T") if parent else None)
            if name in checks:
                selected.append([float(v) for v in widget["/Rect"]])
        if not selected:
            continue
        width, height = float(page.mediabox.width), float(page.mediabox.height)
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=(width, height))
        c.setStrokeColor(colors.black)
        c.setLineWidth(1.25)
        for x0, y0, x1, y1 in selected:
            pad = min(x1 - x0, y1 - y0) * 0.24
            c.line(x0 + pad, y0 + pad, x1 - pad, y1 - pad)
            c.line(x0 + pad, y1 - pad, x1 - pad, y0 + pad)
        c.save()
        packet.seek(0)
        page.merge_page(PdfReader(packet).pages[0], over=True)


def fill_pdf(src: Path, dst: Path, values: dict[str, str], checks: dict[str, str], sizes=None, multiline=None):
    reader = PdfReader(str(src))
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    if "/AcroForm" in writer.root_object:
        writer.root_object["/AcroForm"][NameObject("/NeedAppearances")] = BooleanObject(False)
    if sizes:
        _set_field_font_sizes(writer, sizes)
    if multiline:
        _set_multiline(writer, set(multiline))
    payload = dict(values)
    payload.update(checks)
    writer.update_page_form_field_values(None, payload, auto_regenerate=False)
    _force_checkbox_appearances(writer, checks)
    _paint_selected_checkboxes(writer, checks)
    with dst.open("wb") as f:
        writer.write(f)


def refresh_existing_form_appearances(src: Path, dst: Path):
    reader = PdfReader(str(src))
    fields = reader.get_fields() or {}
    values: dict[str, str] = {}
    checks: dict[str, str] = {}
    for name, field in fields.items():
        value = field.get("/V")
        if value in (None, "", "/Off"):
            continue
        if field.get("/FT") == "/Btn":
            checks[name] = str(value)
        else:
            values[name] = str(value)
    text_sizes = {name: 8.5 for name in values}
    text_sizes.update({"Text Field 133": 7, "Text Field 134": 7, "Text Field 1024": 7.5, "Text Field 128": 7.5, "Text Field 136": 7.5})
    fill_pdf(src, dst, values, checks, sizes=text_sizes,
             multiline={"Text Field 133", "Text Field 134", "Text Field 1024", "Text Field 128", "Text Field 136"})


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name="DocTitle", parent=s["Title"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=DARK, spaceAfter=7*mm))
    s.add(ParagraphStyle(name="DocSub", parent=s["Normal"], fontName="Helvetica", fontSize=9.5, leading=12.5, textColor=MID, spaceAfter=5*mm))
    s.add(ParagraphStyle(name="Heading", parent=s["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=DARK, spaceBefore=4*mm, spaceAfter=2.5*mm))
    s.add(ParagraphStyle(name="Body", parent=s["BodyText"], fontName="Helvetica", fontSize=10, leading=14, textColor=DARK, spaceAfter=3.5*mm))
    s.add(ParagraphStyle(name="Small", parent=s["BodyText"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=DARK, spaceAfter=2.5*mm))
    s.add(ParagraphStyle(name="Table", parent=s["BodyText"], fontName="Helvetica", fontSize=8.4, leading=10.5, textColor=DARK))
    s.add(ParagraphStyle(name="Centred", parent=s["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=13, alignment=TA_CENTER, textColor=DARK))
    return s


def footer_neutral(c: canvas.Canvas, doc):
    c.saveState()
    c.setStrokeColor(HexColor("#BDBDBD"))
    c.line(18*mm, 14*mm, 192*mm, 14*mm)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK)
    c.drawString(18*mm, 9*mm, "Mumford v Mumford | Flat 7 Machin Mews")
    c.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
    c.restoreState()


def footer_client(c: canvas.Canvas, doc):
    c.saveState()
    c.setStrokeColor(PURPLE)
    c.line(18*mm, 14*mm, 192*mm, 14*mm)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK)
    c.drawString(18*mm, 9*mm, "Landlord Heaven | Assisted preparation")
    c.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
    c.restoreState()


def build_text_pdf(path: Path, title: str, subtitle: str, sections: list[tuple[str, str]], client=False, sign_block=None):
    s = styles()
    story = [Paragraph(title, s["DocTitle"]), Paragraph(subtitle, s["DocSub"])]
    for heading, body in sections:
        if heading == "__PAGEBREAK__":
            story.extend([PageBreak(), Paragraph(title, s["DocTitle"]), Paragraph(subtitle, s["DocSub"])])
            continue
        story.append(Paragraph(heading, s["Heading"]))
        for para in body.split("\n\n"):
            story.append(Paragraph(para.replace("\n", "<br/>"), s["Body"]))
    if sign_block:
        story.extend([Spacer(1, 5*mm), sign_block(s)])
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    foot = footer_client if client else footer_neutral
    doc.build(story, onFirstPage=foot, onLaterPages=foot)


def claimant_signature_table(s):
    data = [
        ["Signed", "Date"],
        ["________________________________________", "____________________"],
        ["William Mumford, Claimant", ""],
    ]
    return Table(data, colWidths=[115*mm, 45*mm], style=TableStyle([
        ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))


def witness_signature_table(s):
    data = [
        ["Signed", "Date"],
        ["________________________________________", "____________________"],
        ["Leanne Mumford", ""],
    ]
    return Table(data, colWidths=[115*mm, 45*mm], style=TableStyle([
        ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))


N119_SECTIONS = [
    (
        "Parties tenancy and notice",
        "1. The Claimants are the joint landlords of the Property. The Defendant occupies the Property under a written tenancy agreement made on 1 April 2024. The agreement provided for a 12 month fixed term and for the tenancy to continue periodically if the Defendant remained in possession. The current rent is GBP 850 per calendar month. The agreement states that no deposit was taken.\n\n"
        "2. On 22 June 2026 the Claimants served a Form 3A notice seeking possession. The notice relied on Grounds 13 and 14 of Schedule 2 to the Housing Act 1988. The Claimants preserve that notice unchanged. This claim relies on Ground 14 only. A copy of the notice served is included in the evidence bundle. The person who effected service must complete and sign Form N215 using the actual method of service."
    ),
    (
        "Ground 14",
        "3. The Claimants rely on the limb of Ground 14 concerning conduct by the tenant, a person residing in the dwelling-house or a visitor which has caused, or is likely to cause, nuisance or annoyance to persons residing in, visiting or otherwise lawfully engaging in activity in the locality, and to persons employed in connection with housing-management functions.\n\n"
        "4. The claim is not based merely on the keeping of a cat or on an alleged blanket prohibition against pets. It is based on the reported persistent odour, fouling and hygiene impact in the common parts, the reported behaviour towards cleaning staff, the impact on a neighbouring occupier and visitors, and the reported obstruction of communal electrical remedial work."
    ),
    (
        "Managing agent and contractor records",
        "5. A managing-agent email addressed to Mr and Mrs W Mumford and referring specifically to Machin Mews Flat 7 records an ongoing issue reported by residents and building staff. It reports that a cat had been observed defecating in common areas, creating a health risk and an unpleasant environment, and that the cat had been reported as acting aggressively towards cleaning staff, including scratching and attempting to bite. The email requested immediate steps to prevent roaming in shared areas, maintain a clean litter box and address aggressive behaviour.\n\n"
        "6. An email supplied to Leanne Mumford concerning an electrician's attempted communal remedial work refers to a visit on 23 March 2026 and a second visit when the smell was said to be worse. It states that communal remedial work could not be completed until the area was cleaned.\n\n"
        "7. A BNS maintenance portal record dated 23 March 2026 scheduled a further attendance for 10 April 2026. The record refers to a smell coming from Flat 7, a foul smell around the area, and the need for cleaning before testing could be completed."
    ),
    (
        "Neighbour complaint",
        "8. The supplied Flat 8 complaint records that its author owned Flat 8 and had a family member living there. The author reports personally experiencing a strong and unpleasant odour of cat faeces on repeated visits, seeing cat faeces in the communal hallway, flies in the hallway and near the French doors of Flat 7, and smell permeating into Flat 8. The complaint describes a resulting effect on the occupier's wellbeing and contact with his children and states that Environmental Health would be contacted if the issue continued. The screenshot does not display the author's identity or date and is relied on as hearsay with that limitation made explicit."
    ),
    (
        "Evidence status and reasonableness",
        "9. The Claimants have not obtained a signed witness statement from the managing agent, the electrician, the cleaner or the Flat 8 complainant. They therefore rely on the retained communications and records as hearsay and serve a notice identifying that evidence. The Claimants do not represent that the makers will attend the hearing unless they later agree or are directed to do so.\n\n"
        "10. The Claimants say that possession is reasonable because the reported conduct affected several categories of person, concerned sanitation in shared residential space, was reported to have continued after intervention, affected a neighbouring home and children visiting it, and interfered with communal electrical remedial work. The Defendant had been warned and asked to take immediate remedial steps.\n\n"
        "11. The Claimants ask for possession of the Property, the court fee and such costs as the Court considers appropriate. No rent arrears or separate money judgment are claimed."
    ),
]


def build_n5(path: Path):
    values = {
        "Text Field 161": COURT,
        "Text Field 154": DEFENDANT,
        "Text Field 153": PROPERTY_FULL,
        "Text Field 155": PROPERTY_FULL,
        "Text Field 158": "415.00",
        "Text Field 157": "0.00",
        "Text Field 156": "415.00",
        "Text Field 105": CLAIMANT_1_FIRST,
        "Text Field 104": CLAIMANT_1_LAST,
        "Text Field 103": CLAIMANT_ADDRESS_1,
        "Text Field 102": CLAIMANT_ADDRESS_2,
        "Text Field 101": CLAIMANT_TOWN,
        "Text Field 100": CLAIMANT_COUNTY,
        "Text1": CLAIMANT_POSTCODE.replace(" ", ""),
        "Text Field 99": CLAIMANT_2_FIRST,
        "Text Field 98": CLAIMANT_2_LAST,
        "Text Field 97": CLAIMANT_ADDRESS_1,
        "Text Field 96": CLAIMANT_ADDRESS_2,
        "Text Field 95": CLAIMANT_TOWN,
        "Text Field 94": CLAIMANT_COUNTY,
        "Text2": CLAIMANT_POSTCODE.replace(" ", ""),
        "Text Field 87": "Rebecca",
        "Text Field 86": "Mumford",
        "Text Field 85": PROPERTY_1,
        "Text Field 84": PROPERTY_2,
        "Text Field 83": PROPERTY_TOWN,
        "Text Field 82": PROPERTY_COUNTY,
        "Text4": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 165": "Housing Act 1988, Schedule 2, Ground 14. See attached N119 particulars.",
        "Text Field 142": "415.00",
        "Text Field 167": "William Mumford",
        "Text Field 114": CLAIMANT_ADDRESS_1,
        "Text Field 113": CLAIMANT_ADDRESS_2,
        "Text Field 112": CLAIMANT_TOWN,
        "Text Field 111": CLAIMANT_COUNTY,
        "Text13": CLAIMANT_POSTCODE.replace(" ", ""),
        "Text Field 172": CLAIMANT_EMAIL,
        "Text Field 110": CLAIMANT_PHONE,
        "Text Field 139": CLAIMANT_EMAIL,
    }
    checks = {
        "Check Box 45": "/Yes",
        "Check Box 47": "/Yes",
        "Check Box 60": "/Yes",
        "Check Box 61": "/Yes",
        "Check Box 64": "/Yes",
        "Check Box 66": "/Yes",
        "Check Box 68": "/Yes",
        "Check Box 73": "/Yes",
        "Check Box 75": "/Yes",
        "Check Box 79": "/Yes",
        "Check Box 81": "/Yes",
    }
    fill_pdf(N5_SRC, path, values, checks,
             sizes={"Text Field 154": 9, "Text Field 153": 8.5, "Text Field 155": 8.5, "Text Field 165": 8, "Text Field 167": 10},
             multiline={"Text Field 153", "Text Field 155", "Text Field 165"})


def build_n119(path: Path):
    temp = WORK / "n119_filled.pdf"
    continuation = WORK / "n119_continuation.pdf"
    values = {
        "Text Field 1": COURT,
        "Text Field 3": CLAIMANTS,
        "Text Field 4": DEFENDANT,
        "Text Field 100": PROPERTY_1,
        "Text Field 99": PROPERTY_2,
        "Text Field 98": PROPERTY_TOWN,
        "Text Field 97": PROPERTY_COUNTY,
        "Text Field 96": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 108": DEFENDANT,
        "Text Field 109": "Assured periodic tenancy (formerly an assured shorthold tenancy)",
        "Text Field 102": "01042024",
        "Text Field 110": "850.00",
        "Text Field 112": "0.00",
        "Text Field 113": "Ground 14, Schedule 2, Housing Act 1988. The claim concerns reported nuisance, odour, fouling, hygiene impact in common parts, impact on neighbouring occupiers and interference with communal remedial work. Full particulars are attached.",
        "Text Field 114": "Not applicable. No rent arrears or money judgment are claimed.",
        "Text Field 103a": "22062026",
        "Text Field 116": "No disability, vulnerability, safeguarding issue or disrepair counterclaim is presently known to the Claimants. This must be updated if circumstances change.",
        "Text Field 117": "Ground 14 is discretionary. The Claimants rely on the seriousness, repeated nature and effect of the reported conduct. See attached continuation and evidence bundle.",
        "Text Field 123": "William Mumford",
    }
    checks = {
        "Check Box 27": "/Yes",
        "Check Box 51": "/Yes",
        "Check Box 55": "/Yes",
        "Check Box 29": "/Yes",
        "Check Box 59": "/Yes",
        "Check Box 61": "/Yes",
    }
    fill_pdf(N119_SRC, temp, values, checks,
             sizes={"Text Field 108": 9, "Text Field 109": 8.5, "Text Field 110": 9, "Text Field 112": 9,
                    "Text Field 113": 8, "Text Field 114": 8.5, "Text Field 116": 8, "Text Field 117": 8, "Text Field 123": 10},
             multiline={"Text Field 109", "Text Field 113", "Text Field 114", "Text Field 116", "Text Field 117"})
    build_text_pdf(
        continuation,
        "Continuation sheet to Form N119",
        f"{CLAIMANTS} v {DEFENDANT} | Ground 14 | {PROPERTY_FULL}",
        N119_SECTIONS,
        client=False,
    )
    writer = PdfWriter()
    writer.append(str(temp))
    writer.append(str(continuation))
    with path.open("wb") as f:
        writer.write(f)


def build_n215(path: Path):
    values = {
        "Text Field 1": COURT,
        "Text Field 3": CLAIMANTS,
        "Text Field 4": DEFENDANT,
        "Text1": "Form 3A notice seeking possession dated 22 June 2026, including its continuation sheets relying on Grounds 13 and 14.",
        "Text2": DEFENDANT,
        "Text6": DEFENDANT,
        "Text Field 102": PROPERTY_1,
        "Text Field 101": PROPERTY_2,
        "Text Field 100": PROPERTY_TOWN,
        "Text Field 99": PROPERTY_COUNTY,
        "Text16": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 87": "",
    }
    fill_pdf(N215_SRC, path, values, {}, sizes={"Text1": 8, "Text2": 9, "Text6": 9}, multiline={"Text1", "Text2"})


def build_client_guide(path: Path):
    s = styles()
    story = [
        Paragraph("Updated possession case filing guide", s["DocTitle"]),
        Paragraph("William Mumford and Leanne Mumford v Rebecca Mumford | Updated 9 November 2026", s["DocSub"]),
        Paragraph("What has changed", s["Heading"]),
        Paragraph("The case has been rebuilt around the evidence actually available. The Form 3A served on 22 June 2026 is preserved unchanged. The court claim now relies on Ground 14 only. It does not say that a management-company witness statement exists, and it does not rely on the weaker Ground 13 allegation as a separate basis for possession.", s["Body"]),
        Paragraph("Documents included", s["Heading"]),
    ]
    rows = [
        ["Document", "What Will and Leanne must do"],
        ["Served Form 3A", "Keep the unchanged original. Do not re-serve it. A second court-copy PDF renders the same stored field values visibly for the court bundle."],
        ["N5 and N119", "Check every fact. William signs and dates each statement of truth only if he honestly believes it is correct."],
        ["N215", "The person who actually served the notice completes the date, time, method and service details, then signs and dates it."],
        ["William's witness statement", "William completes the editable statement in his own words, removes every grey instruction, checks every paragraph, and signs and dates it only when it is true. The signed statement is filed and served as his evidence in accordance with the court's directions."],
        ["Leanne's witness statement", "Leanne checks it against her own knowledge, corrects anything inaccurate, and signs and dates it."],
        ["Hearsay and photograph notice", "William signs and dates it. Serve it by any witness-statement deadline or earlier if directed by the court."],
        ["Exhibit WM1", "William signs and dates the exhibit cover. File and serve the paginated composite exhibit with his signed witness statement in accordance with the court's directions. Keep the original source files."],
    ]
    table = Table([[Paragraph(c, s["Table"]) for c in row] for row in rows], colWidths=[48*mm, 118*mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8.5),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#D9D9D9")),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE_PURPLE]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([
        table,
        Paragraph("William's witness statement and exhibit WM1", s["Heading"]),
        Paragraph("The editable Word document is William's court-facing witness statement, not a questionnaire. William must replace or delete every grey instruction, use his own words, distinguish personal knowledge from information supplied by others, and check every paragraph before signing the statement of truth. Once completed and signed, it is filed and served as his evidence in accordance with the court's directions; it is not returned to Landlord Heaven for conversion into another document.", s["Body"]),
        Paragraph("The supporting documents remain separate from the witness statement in the paginated composite exhibit marked WM1. William should sign and date the WM1 cover. Each document referred to in his statement must be identifiable from the WM1 index and final page number. The witness statement itself is evidence and must not be labelled as an exhibit.", s["Body"]),
        KeepTogether([
            Paragraph("The letters A to H2 are internal tabs within exhibit WM1. If William adds a new document or first-hand incident before signing, update the statement, WM1 index, final pagination, N119 continuation and hearsay position as necessary. After issue, comply with the court's directions and obtain permission where required before relying on late evidence.", s["Body"]),
            Paragraph("Before the claim is filed", s["Heading"]),
        ]),
        Paragraph("1. William completes the editable witness statement directly. Replace or delete every grey instruction and placeholder, insert the claim number once issued, and do not sign until the final wording is complete and true.", s["Body"]),
        Paragraph("2. Confirm Rebecca Mumford still occupies the Property and that no new disability, vulnerability, safeguarding, disrepair, harassment or counterclaim issue has arisen.", s["Body"]),
        Paragraph("3. Complete the N215 from what actually happened on 22 June 2026. Do not guess the method of service. Attach any contemporaneous proof such as a posting certificate, delivery record, photograph, email or statement from the server.", s["Body"]),
        Paragraph("4. Check that the copy of the notice placed before the court is the notice actually served, including both continuation sheets. The unchanged digital original is included separately.", s["Body"]),
        Paragraph("5. Check every WM1 page reference against the final exhibit. William signs and dates the witness statement and the WM1 cover. File and serve both documents by the applicable witness-evidence deadline or as otherwise directed by the court.", s["Body"]),
        Paragraph("6. Check compliance with every legal requirement that applied when proceedings are issued. The tenancy agreement says no deposit was taken, so deposit protection is not relied upon. Confirm any other duties referred to in Form 3A have been met.", s["Body"]),
        Paragraph("7. Sign the N5 and N119 only after the N215 and evidence are complete. William and Leanne must sign only documents they have checked and honestly believe to be true. Pay the current county-court possession fee of GBP 415 or provide a valid Help with Fees reference. Recheck the fee immediately before filing.", s["Body"]),
        Paragraph("8. File at Bristol Civil and Family Justice Centre, 2 Redcliff Street, Bristol, BS1 6GR, or use the filing method confirmed by the court. The civil possessions enquiry email is BristolPossessions@justice.gov.uk. Ask the court how it wants payment and how many paper copies if filing by post or at the counter.", s["Body"]),
        Paragraph("9. The Form 3A states that proceedings must be started within 12 months of service. Do not leave filing until the final day. On the stated service date, the practical deadline is before 22 June 2027, subject to any lawful extension such as a relevant breathing-space period.", s["Body"]),
        Paragraph("Evidence limitations", s["Heading"]),
        Paragraph("The management, contractor and resident materials are useful contemporaneous records but the makers are not presently giving signed witness evidence. The hearsay notice addresses that procedural position; it does not remove the court's ability to give the material less weight. The strongest improvement would still be a signed statement or original unredacted email from any maker, but the claim can be presented honestly without pretending that evidence exists.", s["Body"]),
        Paragraph("The court decides whether Ground 14 is proved and whether possession is reasonable. This pack prepares the documents; it does not guarantee an order or replace representation at a contested hearing.", s["Body"]),
    ])
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=footer_client, onLaterPages=footer_client)


def build_will_completion_instructions(path: Path):
    sections = [
        ("Purpose of the document", "The Word document is William Mumford's first witness statement for use as evidence in the possession proceedings. It is not a questionnaire and does not need to be returned to Landlord Heaven. Once fully completed, checked, signed and dated, it should be filed and served in accordance with the court's directions."),
        ("How William should complete it", "Open the Word document and replace or delete every grey italic instruction and every placeholder, including the address, occupation, preparation method, incident details, service evidence, claim number and dates. Use William's own words. Record what he personally saw, heard, smelled, did or received. If another person supplied information, identify the person and state when and how it was supplied. If a date or time is approximate, say so. Do not guess or present another person's allegation as a personal observation."),
        ("Incidents after 22 June 2026", "Prioritise the clearest first-hand incidents after the notice was served and the most recent incidents. Give one incident per incident page. State the date, approximate time, exact location, who was present, what William personally observed, how he linked it to Flat 7, the effect and the supporting record. Add a separate incident sheet or dated diary if there are more than six incidents."),
        ("Supporting documents", "Keep the supporting documents separate in the paginated composite exhibit marked WM1. The internal tabs A to H2 identify the documents. If any new email, complete message thread, photograph, video, diary entry, contractor record, council reference or proof of service is added, update the WM1 index and pagination and then correct every affected page reference in William's statement. Keep the original source files and avoid cropped screenshots that omit the date, sender or recipient."),
        ("Filing and service", "William's signed witness statement is the evidence. Exhibit WM1 supports it and remains a separate document. William should sign and date the WM1 cover as well as the statement. File and serve both by the deadline in the court's directions, or with the claim only if the court's filing process requires it. Keep identical copies of everything filed and served and retain proof of service."),
        ("Existing court papers", "Do not alter or re-serve the Form 3A notice. Do not sign the N5, N119, N215, hearsay notice or a witness statement until the relevant factual blanks are completed and the signer has checked the document. The person who actually served the notice must complete the N215 from what happened and must not guess the method or time of service."),
        ("Final signing check", "Before signing, confirm that no grey instruction or placeholder remains; William has separated personal knowledge from information received from others; every hearsay source is identified; dates are included or marked approximate; all WM1 page references are correct; the vulnerability and tenant-complaint paragraphs are answered; and the document explains any typing or drafting help. William must sign the statement of truth only when every factual statement is true to the best of his knowledge and belief."),
    ]
    build_text_pdf(
        path,
        "William Mumford witness statement completion and filing instructions",
        "Flat 7 Machin Mews | Complete, sign, file and serve with exhibit WM1",
        sections,
        client=True,
    )


def build_witness_statement(path: Path):
    sections = [
        ("Introduction", "1. I am Leanne Mumford, one of the joint Claimants and joint landlords of the Property. I make this statement from matters within my own knowledge except where I identify information supplied by another person or contained in a document. Where I refer to those documents, I do not claim personal knowledge of every underlying observation."),
        ("Tenancy and notice", "2. The Defendant is Rebecca Mumford. She entered into a written tenancy agreement for the Property dated 1 April 2024 at a rent of GBP 850 per calendar month. The agreement records that no deposit was taken. The fixed term ended on 31 March 2025 and the tenancy continued periodically.\n\n3. A Form 3A notice dated 22 June 2026 was served on the Defendant with continuation sheets. The notice referred to Grounds 13 and 14. The present claim relies on Ground 14 only. The unchanged notice is at pages 4 to 15 of the Updated Evidence Bundle. The service method must be proved by the completed N215 and any contemporaneous supporting record."),
        ("Communications received and retained", "4. A management email addressed to Mr and Mrs W Mumford and referring to Machin Mews Flat 7 is at page 20 of the bundle. It records reports from residents and building staff concerning cat fouling in common areas, a health and sanitation concern, and aggressive behaviour towards cleaning staff. It requested immediate steps.\n\n5. An email supplied to me concerning an electrician's attempted communal remedial work is at page 22. It refers to a visit on 23 March 2026 and a second visit, says the smell had worsened and says communal remedial work could not be completed until the area was cleaned.\n\n6. A BNS maintenance portal record dated 23 March 2026 is at page 24. It schedules a return visit for 10 April 2026 and refers to a smell from Flat 7 and the need to clean the area before testing could be completed."),
        ("Neighbour complaint and condition material", "7. The Flat 8 complaint screenshot is at page 26. It was provided to us as a complaint concerning Flat 7. The screenshot reports repeated strong odour of cat faeces, faeces in the communal hallway, flies, smell entering Flat 8 and an adverse effect on the person living there and visits from his children. The screenshot supplied to us does not display the author's identity or date.\n\n8. An undated property-condition photograph retained in our records is at page 28. I rely on it only as limited background because its date and maker are not established by the image itself."),
        ("Hearsay position", "9. We have not obtained a signed statement from BNS, the electrician, a cleaner or the Flat 8 complainant. The documents are therefore relied upon as hearsay and that limitation is expressly disclosed. A notice identifying the evidence and why the makers are not presently being called has been prepared. If any maker later provides a signed statement or agrees to attend, we will disclose and serve it in accordance with the court's directions."),
        ("Why possession is sought", "10. I ask the Court to consider the combined effect of the records. They concern hygiene in shared residential space, the impact on neighbouring occupiers and visitors, reported conduct towards cleaning staff, and the reported prevention of communal electrical remedial work. The management warning shows that steps were requested. The material indicates a repeated rather than isolated problem.\n\n11. I believe that the reported conduct has caused, or was likely to cause, nuisance or annoyance within Ground 14. I ask the Court to make a possession order and award the court fee and such costs as it considers appropriate."),
        ("Statement of truth", "I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth."),
    ]
    build_text_pdf(path, "Witness statement of Leanne Mumford", f"In {COURT} | Claim number: ____________________ | {CLAIMANTS} v {DEFENDANT}", sections, client=False, sign_block=witness_signature_table)


def build_hearsay_notice(path: Path):
    sections = [
        ("Notice", "The Claimants give notice under CPR 33.2(3) that they intend to rely on the hearsay evidence identified below. They also give notice under CPR 33.6 of their intention to rely on the identified photograph. This notice is to be served no later than the date directed for service of witness statements, or earlier if the Court directs."),
        ("Managing agent warning email", "A screenshot of a management email addressed to Mr and Mrs W Mumford concerning Flat 7. It records reports from residents and building staff of cat fouling in common areas, health and sanitation concerns and aggressive behaviour towards cleaning staff. The maker is not presently being called because the Claimants do not have a signed statement from the management company and no representative has agreed to attend."),
        ("Electrician and remedial-work email", "A screenshot of an email supplied to Leanne Mumford referring to attempted communal remedial work on 23 March 2026 and a second visit. It states that work could not be completed until the area was cleaned. The maker and underlying electrician are not presently being called because the Claimants have not obtained signed statements from them."),
        ("BNS maintenance portal record", "A screenshot of a BNS maintenance-system record dated 23 March 2026, scheduling attendance on 10 April 2026 and referring to smell from Flat 7 and cleaning required before testing. The author is not presently being called because the Claimants have not obtained a signed statement from the author or a BNS records witness."),
        ("Flat 8 complaint", "A supplied screenshot reporting the experience of the owner of Flat 8 and a family member residing there. The screenshot reports persistent cat-faeces odour, faeces in the communal hallway, flies and smell entering Flat 8. The screenshot supplied does not display the author's identity or date. The maker is not presently being called because the Claimants do not have the unredacted original or a signed statement and cannot identify the maker from the retained copy."),
        ("Property photograph", "The Claimants intend to rely on an undated photograph showing the condition of an internal window or bay area at the Property only as limited background material. The date and maker are not established by the image itself. It is not relied upon as an independent basis for Ground 13 in this claim."),
        ("Availability and copies", "Copies of all identified materials are included in the composite exhibit marked WM1 to the first witness statement of William Mumford. If a maker later agrees to give evidence, or the Court directs that a maker be called, the Claimants will comply with the Court's directions. The Claimants understand that the absence of a maker may affect the weight given to the evidence."),
    ]
    build_text_pdf(path, "Notice of intention to rely on hearsay and photographic evidence", f"CPR 33.2 and CPR 33.6 | {CLAIMANTS} v {DEFENDANT} | Claim number: ____________________", sections, client=False, sign_block=claimant_signature_table)


def make_exhibit_cover(path: Path, exhibit: str, title: str, note: str):
    s = styles()
    story = [Spacer(1, 28*mm), Paragraph(f"Exhibit {exhibit}", s["DocTitle"]), Paragraph(title, s["Centred"]), Spacer(1, 10*mm), Paragraph(note, s["Body"])]
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=25*mm, rightMargin=25*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=footer_neutral)


def remove_legacy_draft_footer(source: Path, target: Path):
    """Remove only the old presentation footer from evidence image sheets.

    The underlying exhibit image and its identifying heading are preserved.  The
    source wrapper's obsolete '(draft)' footer is not evidence and is replaced by
    the final bundle's own continuous pagination.
    """
    source_reader = PdfReader(str(source))
    source_render = pdfium.PdfDocument(str(source))
    c = None
    for index, page in enumerate(source_reader.pages):
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        if c is None:
            c = canvas.Canvas(str(target), pagesize=(w, h))
        else:
            c.setPageSize((w, h))
        bitmap = source_render[index].render(scale=2.5)
        image = bitmap.to_pil().convert("RGB")
        c.drawImage(ImageReader(image), 0, 0, width=w, height=h, preserveAspectRatio=False, mask="auto")
        c.setFillColor(colors.white)
        c.rect(0, 0, w, 16 * mm, fill=1, stroke=0)
        c.showPage()
    if c is not None:
        c.save()
    source_render.close()


def build_bundle(path: Path, rendered_notice: Path):
    exhibits = [
        ("A", "Form 3A notice dated 22 June 2026", "Court copy of the notice already served. The stored field values have been rendered visibly; the substantive content has not been changed.", rendered_notice),
        ("B", "Tenancy agreement", "Signed agreement pages identifying the parties, Property, rent, no-deposit term, obligations and periodic continuation.", CLEAN / "image-01-tenancy-agreement-parties-property-rent-deposit.pdf"),
        ("B2", "Tenancy agreement signatures and continuation", "Signature and periodic-continuation page.", CLEAN / "image-02-tenancy-agreement-signatures-and-periodic-continuation.pdf"),
        ("C", "Managing agent warning email", "Retained screenshot. Relied upon as hearsay; no management-company witness statement is available.", CLEAN / "image-03-management-company-cat-warning-email.pdf"),
        ("D", "Electrician and remedial-work email extract", "Retained screenshot supplied to Leanne Mumford. Relied upon as hearsay.", CLEAN / "image-02-electrician-remedial-email-extract.pdf"),
        ("E", "BNS maintenance portal record dated 23 March 2026", "Retained maintenance-system screenshot. Relied upon as hearsay.", CLEAN / "image-04-bns-maintenance-visit-and-cleanup-note.pdf"),
        ("F", "Flat 8 resident complaint", "Retained screenshot. The supplied copy does not display the author's identity or date and is relied upon as hearsay with that limitation.", CLEAN / "image-01-flat-8-resident-complaint-screenshot-source-provided.pdf"),
        ("G", "Property-condition photograph", "Undated retained photograph. Included as limited context only; not relied upon as an independent Ground 13 case.", CLEAN / "image-01-property-condition-photo.pdf"),
        ("H1", "Energy performance certificate", "Background compliance material. Not relied upon to prove Ground 14.", CLEAN / "image-01-epc-rating-c-screenshot.pdf"),
        ("H2", "Gas safety record dated 29 May 2026", "Background compliance material. Not relied upon to prove Ground 14.", CLEAN / "image-02-gas-safety-certificate-29-05-2026.pdf"),
    ]
    covers: list[Path] = []
    clean_sources: list[Path] = []
    page_cursor = 3  # front cover and index occupy pages 1-2
    index_rows = []
    for exhibit, title, note, source in exhibits:
        cover = WORK / f"cover-{exhibit}.pdf"
        make_exhibit_cover(cover, exhibit, title, note)
        covers.append(cover)
        if exhibit == "A":
            clean_source = source
        else:
            clean_source = WORK / f"clean-source-{exhibit}.pdf"
            remove_legacy_draft_footer(source, clean_source)
        clean_sources.append(clean_source)
        count = len(PdfReader(str(source)).pages)
        start = page_cursor
        end = page_cursor + count
        index_rows.append([exhibit, title, f"{start}-{end}"])
        page_cursor = end + 1

    s = styles()
    front = WORK / "bundle-front.pdf"
    story = [
        Spacer(1, 20*mm),
        Paragraph("Exhibit WM1", s["DocTitle"]),
        Paragraph(f"Composite exhibit to the first witness statement of William Mumford<br/>{COURT}<br/>{CLAIMANTS} v {DEFENDANT}<br/>Claim number: ____________________<br/>{PROPERTY_FULL}", s["Centred"]),
        Spacer(1, 12*mm),
        Paragraph("Identification", s["Heading"]),
        Paragraph("This is the exhibit marked WM1 referred to in the first witness statement of William Mumford.", s["Body"]),
        Paragraph("Signed by William Mumford: ____________________________________<br/><br/>Dated: ____________________", s["Body"]),
        Paragraph("Claim basis", s["Heading"]),
        Paragraph("Ground 14 of Schedule 2 to the Housing Act 1988. The Form 3A served on 22 June 2026 also identified Ground 13, but the present claim relies on Ground 14 only. The served notice is not replaced or re-served.", s["Body"]),
        Paragraph("Evidence status", s["Heading"]),
        Paragraph("The management, contractor and resident communications are included as contemporaneous documentary material and are relied upon as hearsay. No signed management-company statement is available. The separate hearsay notice and the witness statements should be signed and served in accordance with the court's directions.", s["Body"]),
        PageBreak(),
        Paragraph("Exhibit WM1 index", s["DocTitle"]),
    ]
    rows = [["Exhibit", "Document", "Bundle pages"]] + index_rows
    table = Table([[Paragraph(str(c), s["Table"]) for c in row] for row in rows], colWidths=[22*mm, 116*mm, 28*mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#333333")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8.5),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#D9D9D9")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),
        ("ALIGN", (2, 1), (2, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)
    doc = SimpleDocTemplate(str(front), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=footer_neutral, onLaterPages=footer_neutral)

    combined = WORK / "bundle-combined.pdf"
    writer = PdfWriter()
    writer.append(str(front))
    for cover, source in zip(covers, clean_sources):
        writer.append(str(cover))
        writer.append(str(source))
    with combined.open("wb") as f:
        writer.write(f)

    # Add durable bundle page numbers without changing the separate served-notice original.
    reader = PdfReader(str(combined))
    out = PdfWriter()
    total = len(reader.pages)
    for idx, page in enumerate(reader.pages, 1):
        packet = BytesIO()
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        c = canvas.Canvas(packet, pagesize=(w, h))
        c.setFont("Helvetica", 7)
        c.setFillColor(HexColor("#555555"))
        c.drawCentredString(w / 2, 5.5 * mm, f"Bundle page {idx} of {total}")
        c.save()
        packet.seek(0)
        page.merge_page(PdfReader(packet).pages[0], over=True)
        out.add_page(page)
    with path.open("wb") as f:
        out.write(f)


def build_zip(paths: list[Path], zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in paths:
            z.write(p, arcname=p.name)


def validate_pdf(path: Path, min_pages=1):
    reader = PdfReader(str(path))
    if len(reader.pages) < min_pages:
        raise RuntimeError(f"{path.name}: expected at least {min_pages} pages")
    if path.stat().st_size < 1500:
        raise RuntimeError(f"{path.name}: suspiciously small")
    return len(reader.pages)


def main():
    outputs: list[Path] = []

    original_notice = OUT / "01-SERVED-Form-3A-original-digital-copy-unchanged.pdf"
    shutil.copy2(NOTICE_SRC, original_notice)
    if sha256(original_notice) != sha256(NOTICE_SRC):
        raise RuntimeError("Served notice copy is not byte-for-byte identical")
    outputs.append(original_notice)

    rendered_notice = OUT / "02-SERVED-Form-3A-court-copy-values-rendered-do-not-re-serve.pdf"
    refresh_existing_form_appearances(NOTICE_SRC, rendered_notice)
    outputs.append(rendered_notice)

    guide = OUT / "03-client-start-here-and-filing-checklist.pdf"
    build_client_guide(guide)
    outputs.append(guide)

    n5 = OUT / "04-N5-claim-form-Ground-14-check-sign-and-file.pdf"
    build_n5(n5)
    outputs.append(n5)

    n119 = OUT / "05-N119-particulars-Ground-14-check-sign-and-file.pdf"
    build_n119(n119)
    outputs.append(n119)

    n215 = OUT / "06-N215-complete-from-actual-service-and-sign.pdf"
    build_n215(n215)
    outputs.append(n215)

    witness = OUT / "07-witness-statement-Leanne-Mumford-review-and-sign.pdf"
    build_witness_statement(witness)
    outputs.append(witness)

    hearsay = OUT / "08-hearsay-and-photographic-evidence-notice-sign.pdf"
    build_hearsay_notice(hearsay)
    outputs.append(hearsay)

    bundle = OUT / "09-updated-evidence-bundle-Ground-14.pdf"
    build_bundle(bundle, rendered_notice)
    outputs.append(bundle)

    page_counts = {p.name: validate_pdf(p) for p in outputs}
    zip_path = OUT.parent / "Will-Mumford-updated-court-case-09-Nov-2026.zip"
    build_zip(outputs, zip_path)

    print("OUTPUT_FOLDER", OUT)
    print("ZIP", zip_path)
    print("ZIP_SIZE", zip_path.stat().st_size)
    print("ORIGINAL_NOTICE_SHA256", sha256(NOTICE_SRC))
    print("OUTPUT_NOTICE_SHA256", sha256(original_notice))
    for name, pages in page_counts.items():
        print(f"{name}: {pages} pages")


if __name__ == "__main__":
    main()
