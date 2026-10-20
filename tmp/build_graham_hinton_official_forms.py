from pathlib import Path
from io import BytesIO
from textwrap import wrap

from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject, BooleanObject, DecodedStreamObject, DictionaryObject,
    FloatObject, NameObject, TextStringObject, NumberObject,
)
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3")
SRC = ROOT / "tmp" / "pdfs"
OUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Graham\Completed Forms - Sign and Serve")
OUT.mkdir(parents=True, exist_ok=True)

ACCENT = HexColor("#333333")
DARK = HexColor("#1F1F1F")
MID = HexColor("#666666")
LIGHT = HexColor("#F2F2F2")

CLAIMANTS = "Graham Stanley Hinton and Elaine Randall"
DEFENDANT = "Sara Gomes"
PROPERTY_1 = "19 Swallow Close"
PROPERTY_2 = ""
PROPERTY_TOWN = "Staines-upon-Thames"
PROPERTY_COUNTY = "Middlesex"
PROPERTY_POSTCODE = "TW18 4RS"
PROPERTY_FULL = "19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS"
LANDLORD_ADDRESS_1 = "1 Silverdale Drive"
LANDLORD_ADDRESS_2 = ""
LANDLORD_TOWN = "Sunbury-on-Thames"
LANDLORD_COUNTY = "Middlesex"
LANDLORD_POSTCODE = "TW16 6HE"
LANDLORD_PHONE = "07771 864825"
LANDLORD_EMAIL = "grahamhinton@yahoo.co.uk"
COURT = "Staines County Court and Family Court"


GROUND_1A_WORDING = (
    "Ground 1A - Sale of dwelling house\n\n"
    "The following conditions are met -\n"
    "(a) the landlord who is seeking possession intends to sell a freehold or "
    "leasehold interest in the dwelling-house or to grant a lease of the dwelling-house "
    "for a term certain of more than 21 years which is not terminable before the end of "
    "that term by notice given by or to the landlord;\n"
    "(b) the assured tenancy on which the dwelling-house is let did not come into being "
    "by virtue of any provision of Schedule 1 to the Rent Act 1977 or section 4 of the "
    "Rent (Agriculture) Act 1976;\n"
    "(c) either -\n"
    "(i) the current tenancy began at least 1 year before the relevant date, or\n"
    "(ii) at the relevant date, notice of a compulsory acquisition in relation to the "
    "dwelling-house has been given, the landlord intends to sell their interest in the "
    "dwelling-house to the acquiring authority and the acquiring authority intends to "
    "acquire it;\n"
    "(d) the landlord seeking possession is not -\n"
    "(i) a non-profit registered provider of social housing,\n"
    "(ii) a body registered as a social landlord in the register maintained under "
    "section 1 of the Housing Act 1996,\n"
    "(iii) a body registered as a social landlord in the register kept under section "
    "20(1) of the Housing (Scotland) Act 2010,\n"
    "(iv) a housing trust, within the meaning of the Housing Associations Act 1985, "
    "which is a charity, or\n"
    "(v) where the dwelling-house is social housing within the meaning of Part 2 of the "
    "Housing and Regeneration Act 2008, a profit-making registered provider of social housing.\n\n"
    "In paragraph (c)(ii), 'sell' includes transfer.\n\n"
    "When calculating whether the current tenancy began at least 1 year before the "
    "relevant date, both (a) the day when the current tenancy began, and (b) the relevant "
    "date, must be included in the calculation."
)

FORM3A_PARTIES_AND_TENANCY = (
    "The property is 19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS. "
    "The official Land Registry title is SY435530 and records the property as leasehold. "
    "Graham Stanley Hinton and Elaine Randall are the joint registered proprietors and "
    "joint landlords. Sara Gomes is the tenant.\n\n"
    "The current tenancy commenced on 1 November 2025 and is an assured periodic tenancy. "
    "The current contractual rent is GBP 1,350 per calendar month. The tenancy agreement "
    "and the official title documents identify the parties and the property."
)

FORM3A_APPLICATION = (
    "Condition (a): both landlords genuinely intend to sell their leasehold interest in "
    "the dwelling-house with vacant possession.\n\n"
    "Condition (b): the tenancy did not arise by virtue of Schedule 1 to the Rent Act "
    "1977 or section 4 of the Rent (Agriculture) Act 1976.\n\n"
    "Condition (c)(i): the current tenancy began on 1 November 2025. The intended service "
    "date is 2 November 2026, more than one year after the tenancy began. The landlords "
    "do not rely on the compulsory-acquisition alternative in condition (c)(ii).\n\n"
    "Condition (d): neither landlord is a social housing provider, registered social "
    "landlord, charitable housing trust or other excluded body described in Ground 1A."
)

FORM3A_NOTICE_AND_SALE = (
    "The notice is intended to be signed and served on 2 November 2026. Section 2.1 "
    "states 3 March 2027 as the earliest date on which possession proceedings may begin. "
    "This gives no less than the four-month notice period required for Ground 1A and the "
    "date falls after the first twelve months of the tenancy.\n\n"
    "On 19 August 2026 Graham Hinton entered into a sole agency agreement with Gregory "
    "Brown Estate Agents to market the property at an initial asking price of GBP 270,000. "
    "Elaine Randall confirms and shares the intention to sell. Both landlords will retain "
    "the agency agreement and updated evidence of marketing, viewings, offers or "
    "conveyancing steps for any later court proceedings."
)

FORM3A_DOCUMENTS = (
    "A. Official Land Registry title register for title SY435530.\n\n"
    "B. Tenancy agreement commencing 1 November 2025.\n\n"
    "C. Gregory Brown sole agency agreement dated 19 August 2026.\n\n"
    "D. Joint landlords' signed statement confirming their intention to sell.\n\n"
    "E. Updated marketing or sale evidence available when proceedings are issued.\n\n"
    "The landlords understand that statutory restrictions apply to re-letting and "
    "marketing for re-letting after reliance on Ground 1A, subject to any applicable "
    "statutory exception."
)

N119_CLAIM_BASIS = (
    "The Claimants, Graham Stanley Hinton and Elaine Randall, are the joint registered "
    "proprietors and joint landlords of 19 Swallow Close, Staines-upon-Thames, Middlesex, "
    "TW18 4RS. The property is registered under title SY435530 and the registered estate "
    "is leasehold. The Defendant is Sara Gomes, who remains in possession.\n\n"
    "The Defendant occupies under an assured periodic tenancy commencing on 1 November "
    "2025 at a rent of GBP 1,350 per calendar month. This is not a rent-arrears claim and "
    "the Claimants do not seek a money judgment for rent arrears.\n\n"
    "Possession is claimed under mandatory Ground 1A in Schedule 2 to the Housing Act "
    "1988, as amended. The Claimants genuinely intend to sell their leasehold interest in "
    "the Property with vacant possession."
)

N119_NOTICE_AND_GROUND = (
    "On 2 November 2026 the Claimants served the prescribed Form 3A and its signed "
    "continuation on the Defendant by personal delivery at the Property. The certificate "
    "of service records the actual service details. The notice stated that proceedings "
    "could not begin earlier than 3 March 2027 and therefore allowed no less than the "
    "required four months. The Defendant remained in possession after expiry.\n\n"
    "Ground 1A(a) is met because the Claimants intend to sell their leasehold interest. "
    "Ground 1A(b) is met because the tenancy did not arise under Schedule 1 to the Rent "
    "Act 1977 or section 4 of the Rent (Agriculture) Act 1976. Ground 1A(c)(i) is met "
    "because the tenancy began on 1 November 2025 and the relevant date was more than one "
    "year later. The Claimants do not rely on Ground 1A(c)(ii). Ground 1A(d) is met "
    "because neither Claimant is a social housing provider or other excluded body."
)

N119_SALE_EVIDENCE = (
    "The genuine intention to sell is evidenced by the official title documents; the "
    "Gregory Brown sole agency agreement dated 19 August 2026, recording an initial "
    "asking price of GBP 270,000; the joint landlords' signed statement of intention; and "
    "updated evidence of marketing, viewings, offers or conveyancing steps available at "
    "the date of issue or hearing."
)

N119_EVIDENCE_AND_RELIEF = (
    "A. Official Land Registry title register for title SY435530.\n\n"
    "B. Tenancy agreement commencing 1 November 2025 at GBP 1,350 per calendar month.\n\n"
    "C. Signed Form 3A and its Ground 1A continuation, served on 2 November 2026.\n\n"
    "D. Completed Form N215 recording service of the notice.\n\n"
    "E. Gregory Brown sole agency agreement dated 19 August 2026.\n\n"
    "F. Joint landlords' signed statement of intention to sell and updated sale evidence.\n\n"
    "The Claimants ask for possession of the Property, the issue fee and such recoverable "
    "costs as the court considers appropriate. This continuation forms part of Form N119 "
    "and is verified by the statement of truth on that form."
)


def _set_field_font_sizes(writer: PdfWriter, sizes: dict[str, int]):
    fields = writer.get_fields() or {}
    for name, size in sizes.items():
        field = fields.get(name)
        if field is not None:
            field[NameObject("/DA")] = TextStringObject(f"/Helv {size} Tf 0 g")
    # Some current HMCTS forms keep a widget-level or parent-level default
    # appearance that overrides the canonical field entry. Update every layer
    # so appearances remain portable when the source's Minion font is absent.
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
        field = fields.get(name)
        if field is not None:
            field[NameObject("/Ff")] = NumberObject(int(field.get("/Ff", 0)) | 4096)
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
            if name in checks:
                state = NameObject(checks[name])
                widget[NameObject("/AS")] = state
                (parent if parent is not None else widget)[NameObject("/V")] = state

                # Some HMCTS checkbox appearances depend on a Symbol font that
                # does not render consistently. Install a self-contained selected
                # appearance so the saved value and the visible X always agree.
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
    """Paint a durable X in selected boxes while retaining the interactive field value."""
    for page in writer.pages:
        selected = []
        for ref in page.get("/Annots") or []:
            widget = ref.get_object()
            parent_ref = widget.get("/Parent")
            parent = parent_ref.get_object() if parent_ref else None
            name = widget.get("/T") or (parent.get("/T") if parent else None)
            if name in checks:
                rect = [float(v) for v in widget["/Rect"]]
                selected.append(rect)
        if not selected:
            continue
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=(width, height))
        c.setStrokeColor(colors.black)
        c.setLineWidth(1.35)
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


def court_continuation(path: Path, title: str, subtitle: str, sections, signatures=False):
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="LHTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=18, leading=22, textColor=DARK, spaceAfter=6*mm
    ))
    styles.add(ParagraphStyle(
        name="LHSub", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=9.8, leading=12.5, textColor=MID, spaceAfter=5*mm
    ))
    styles.add(ParagraphStyle(
        name="LHHead", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=12, leading=15, textColor=DARK, spaceBefore=3*mm, spaceAfter=2.2*mm
    ))
    styles.add(ParagraphStyle(
        name="LHBody", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=10.2, leading=14.2, textColor=DARK, spaceAfter=3.5*mm
    ))
    styles.add(ParagraphStyle(
        name="LHSmall", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=8.5, leading=10.5, textColor=DARK
    ))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(MID)
        canvas.setLineWidth(0.6)
        canvas.line(18*mm, 14*mm, 192*mm, 14*mm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(DARK)
        canvas.drawString(18*mm, 9*mm, "Graham Stanley Hinton and Elaine Randall v Sara Gomes")
        canvas.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
        canvas.restoreState()

    story = [
        Paragraph(title, styles["LHTitle"]),
        Paragraph(subtitle, styles["LHSub"]),
    ]
    for heading, body in sections:
        if heading == "__PAGEBREAK__":
            story.extend([
                PageBreak(),
                Paragraph(title, styles["LHTitle"]),
                Paragraph(subtitle, styles["LHSub"]),
            ])
            continue
        story.append(Paragraph(heading, styles["LHHead"]))
        for para in body.split("\n\n"):
            safe = para.replace("\n", "<br/>")
            story.append(Paragraph(safe, styles["LHBody"]))
    if signatures:
        story.extend([
            Spacer(1, 6*mm),
            Table([
                ["Graham Stanley Hinton", "Elaine Randall"],
                ["Signature: __________________________", "Signature: __________________________"],
                ["Date: 2 November 2026", "Date: 2 November 2026"],
            ], colWidths=[82*mm, 82*mm], style=TableStyle([
                ("FONT", (0,0), (-1,-1), "Helvetica", 9.2),
                ("FONT", (0,0), (-1,0), "Helvetica-Bold", 9.8),
                ("TEXTCOLOR", (0,0), (-1,-1), DARK),
                ("BACKGROUND", (0,0), (-1,0), LIGHT),
                ("BOX", (0,0), (-1,-1), 0.7, ACCENT),
                ("INNERGRID", (0,0), (-1,-1), 0.3, colors.lightgrey),
                ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
                ("TOPPADDING", (0,0), (-1,-1), 8),
                ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ]))
        ])
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=18*mm,
                            leftMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def append_pdf(base: Path, extras: list[Path], output: Path):
    writer = PdfWriter()
    writer.append(str(base))
    for extra in extras:
        writer.append(str(extra))
    with output.open("wb") as f:
        writer.write(f)


def build_form3a():
    temp = SRC / "Form_3A_filled_temp.pdf"
    cont = SRC / "Form_3A_continuation.pdf"
    values = {
        "Text Field 132": DEFENDANT,
        "Text Field 116": PROPERTY_1,
        "Text Field 115": PROPERTY_2,
        "Text Field 114": PROPERTY_TOWN,
        "Text Field 113": PROPERTY_COUNTY,
        "Text Field 112": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 117": "03032027",
        "Text Field 133": "Ground 1A - sale. See the attached continuation sheet, which forms part of this notice.",
        "Text Field 134": "See attached continuation: Ground 1A explanation.",
        "Text Field 130": "02112026",
        "Text Field 135": "Graham Stanley Hinton",
        "Text Field 103": LANDLORD_ADDRESS_1,
        "Text Field 102": LANDLORD_ADDRESS_2,
        "Text Field 101": LANDLORD_TOWN,
        "Text Field 100": LANDLORD_COUNTY,
        "Text Field 99": LANDLORD_POSTCODE.replace(" ", ""),
        "Text Field 120": LANDLORD_PHONE,
        "Text Field 104": LANDLORD_EMAIL,
        "Text Field 1024": f"Elaine Randall\n{LANDLORD_ADDRESS_1}\n{LANDLORD_TOWN}, {LANDLORD_POSTCODE}\nJoint landlord\nSignature: __________________________",
        "Text Field 128": "",
        "Text Field 136": "See attached signed continuation sheet for Questions 4.2 and 4.3.",
        "Text Field 129": "02112026",
    }
    checks = {"Check Box 71": "/Yes", "Check Box 42": "/Landlord"}
    fill_pdf(SRC / "Form_3A_official.pdf", temp, values, checks,
             {"Text Field 133": 7, "Text Field 134": 7, "Text Field 1024": 8,
              "Text Field 128": 8, "Text Field 136": 8},
             multiline={"Text Field 1024", "Text Field 128"})
    court_continuation(
        cont,
        "Form 3A continuation sheet",
        "Questions 4.2 and 4.3 | Ground 1A | 19 Swallow Close",
        [
            ("Question 4.2 - full legal wording", GROUND_1A_WORDING),
            ("__PAGEBREAK__", ""),
            ("Question 4.3 - parties, property and tenancy", FORM3A_PARTIES_AND_TENANCY),
            ("How each Ground 1A condition applies", FORM3A_APPLICATION),
            ("__PAGEBREAK__", ""),
            ("Notice period and genuine intention to sell", FORM3A_NOTICE_AND_SALE),
            ("Documents relied upon", FORM3A_DOCUMENTS),
        ],
        signatures=True,
    )
    out = OUT / "01-Form-3A-Section-8-Ground-1A-sign-and-serve-02-November-2026.pdf"
    append_pdf(temp, [cont], out)
    return out


def build_n5():
    values = {
        "Text Field 161": COURT,
        "Text Field 154": DEFENDANT,
        "Text Field 153": "19 Swallow Close\nStaines-upon-Thames\nMiddlesex, TW18 4RS",
        "Text Field 155": "19 Swallow Close\nStaines-upon-Thames\nMiddlesex, TW18 4RS",
        "Text Field 158": "415.00",
        "Text Field 157": "0.00",
        "Text Field 156": "415.00",
        "Text Field 105": "Graham Stanley",
        "Text Field 104": "Hinton",
        "Text Field 103": LANDLORD_ADDRESS_1,
        "Text Field 102": LANDLORD_ADDRESS_2,
        "Text Field 101": LANDLORD_TOWN,
        "Text Field 100": LANDLORD_COUNTY,
        "Text1": LANDLORD_POSTCODE.replace(" ", ""),
        "Text Field 99": "Elaine",
        "Text Field 98": "Randall",
        "Text Field 97": LANDLORD_ADDRESS_1,
        "Text Field 96": LANDLORD_ADDRESS_2,
        "Text Field 95": LANDLORD_TOWN,
        "Text Field 94": LANDLORD_COUNTY,
        "Text2": LANDLORD_POSTCODE.replace(" ", ""),
        "Text Field 87": "Sara",
        "Text Field 86": "Gomes",
        "Text Field 85": PROPERTY_1,
        "Text Field 84": PROPERTY_2,
        "Text Field 83": PROPERTY_TOWN,
        "Text Field 82": PROPERTY_COUNTY,
        "Text4": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 142": "415.00",
        "Text Field 167": "Graham Stanley Hinton",
        "Text Field 172": LANDLORD_EMAIL,
        "Text Field 110": LANDLORD_PHONE,
        "Text Field 139": LANDLORD_EMAIL,
    }
    checks = {
        "Check Box 45": "/Yes",  # includes residential property
        "Check Box 47": "/Yes",  # particulars attached
        "Check Box 58": "/Yes",  # landlord wants to sell
        "Check Box 64": "/Yes",  # no demotion
        "Check Box 66": "/Yes",  # no right-to-buy suspension
        "Check Box 68": "/Yes",  # no HRA issue presently identified
        "Check Box 73": "/Yes",  # debit or credit card payment
        "Check Box 75": "/Yes",  # email payment instructions
        "Check Box 79": "/Yes",  # statement of truth by claimant
        "Check Box 81": "/Yes",  # claimant capacity
    }
    out = OUT / "03-N5-claim-form-completed-for-issue-after-notice-expiry.pdf"
    fill_pdf(SRC / "N5_official.pdf", out, values, checks,
             multiline={"Text Field 153", "Text Field 155"})
    return out


def build_n119():
    temp = SRC / "N119_filled_temp.pdf"
    cont = SRC / "N119_continuation.pdf"
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
        "Text Field 109": "Assured periodic tenancy",
        "Text Field 102": "01112025",
        "Text Field 110": "1350.00",
        "Text Field 112": "0.00",
        "Text Field 113": "Ground 1A (sale).",
        "Text Field 114": "Not applicable - no rent-arrears ground is relied upon.",
        "Text Field 103a": "02112026",
        "Text Field 116": "None known to the Claimants.",
        "Text Field 117": "Ground 1A is mandatory. See attached continuation.",
        "Text Field 123": "Graham Stanley Hinton",
    }
    checks = {
        "Check Box 27": "/Yes",  # monthly rent
        "Check Box 51": "/Yes",  # notice seeking possession
        "Check Box 29": "/Yes",  # no alternative demotion/suspension
        "Check Box 59": "/Yes",  # claimant statement of truth
        "Check Box 61": "/Yes",  # claimant capacity
    }
    fill_pdf(SRC / "N119_official.pdf", temp, values, checks,
             {"Text Field 108": 10, "Text Field 109": 10, "Text Field 110": 10,
              "Text Field 112": 10, "Text Field 113": 9, "Text Field 114": 9,
              "Text Field 116": 9, "Text Field 117": 9, "Text Field 123": 10},
             multiline={"Text Field 113", "Text Field 116", "Text Field 117"})
    court_continuation(
        cont,
        "Continuation sheet to Form N119",
        "Graham Stanley Hinton and Elaine Randall v Sara Gomes | Ground 1A",
        [
            ("Paragraph 4.1 - parties, tenancy and statutory basis", N119_CLAIM_BASIS),
            ("Notice, expiry and application of Ground 1A", N119_NOTICE_AND_GROUND),
            ("__PAGEBREAK__", ""),
            ("Evidence of the genuine intention to sell", N119_SALE_EVIDENCE),
            ("Evidence relied upon and relief sought", N119_EVIDENCE_AND_RELIEF),
        ],
        signatures=False,
    )
    out = OUT / "04-N119-particulars-completed-for-issue-after-notice-expiry.pdf"
    append_pdf(temp, [cont], out)
    return out


def build_n215():
    values = {
        "Text Field 1": COURT,
        "Text Field 3": CLAIMANTS,
        "Text Field 4": DEFENDANT,
        "Text Field 93": "",
        "Text Field 94": "",
        "Text1": "Form 3A relying on Ground 1A, with its signed three-page continuation sheet.",
        "Text2": DEFENDANT,
        "Text6": DEFENDANT,
        "Text Field 102": PROPERTY_1,
        "Text Field 101": PROPERTY_2,
        "Text Field 100": PROPERTY_TOWN,
        "Text Field 99": PROPERTY_COUNTY,
        "Text16": PROPERTY_POSTCODE.replace(" ", ""),
        "Text Field 90": "",
        "Text Field 89": "",
        "Text Field 88": "",
        "Text Field 87": "Graham Stanley Hinton",
    }
    checks = {
        "Check Box5": "/Yes",   # intended personal service; confirm after service
        "Check Box22": "/Yes",  # defendant's
        "Check Box25": "/Yes",  # usual residence
        "Check Box37": "/Yes",  # statement of truth
        "Check Box40": "/Yes",  # claimant
    }
    out = OUT / "02-N215-certificate-of-service-complete-after-serving.pdf"
    fill_pdf(SRC / "N215_official.pdf", out, values, checks,
             {"Text1": 8, "Text2": 9}, multiline={"Text1", "Text2"})
    return out


def validate(paths):
    for path in paths:
        reader = PdfReader(str(path))
        if len(reader.pages) < 5:
            raise RuntimeError(f"Unexpectedly short PDF: {path}")
        if path.stat().st_size < 50_000:
            raise RuntimeError(f"Unexpectedly small PDF: {path}")
        print(f"{path} | pages={len(reader.pages)} | bytes={path.stat().st_size} | fields={len(reader.get_fields() or {})}")


if __name__ == "__main__":
    outputs = [build_form3a(), build_n215(), build_n5(), build_n119()]
    validate(outputs)
