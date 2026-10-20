from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas
from PIL import Image

ROOT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Graham\Completed Forms - Sign and Serve")
EVIDENCE = ROOT / "Evidence - Existing Source Documents"
OUT_STATEMENT = ROOT / "05-joint-landlords-statement-of-intention-to-sell-sign.pdf"
OUT_BUNDLE = ROOT / "06-indexed-evidence-pack-for-case-preparation.pdf"
OUT_CHECKLIST = ROOT / "07-court-filing-checklist-for-landlords.pdf"
TMP = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\tmp\pdfs\graham-pack-build")
TMP.mkdir(parents=True, exist_ok=True)

PURPLE = HexColor("#6B2BD9")
DARK = HexColor("#24193A")
LIGHT = HexColor("#F4F0FB")


def styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle(name="TitleLH", parent=ss["Title"], fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=DARK, alignment=TA_CENTER, spaceAfter=7*mm))
    ss.add(ParagraphStyle(name="SubLH", parent=ss["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=PURPLE, spaceAfter=4*mm))
    ss.add(ParagraphStyle(name="HeadLH", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=DARK, spaceBefore=3*mm, spaceAfter=2*mm))
    ss.add(ParagraphStyle(name="BodyLH", parent=ss["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13, textColor=DARK, spaceAfter=3*mm))
    ss.add(ParagraphStyle(name="SmallLH", parent=ss["BodyText"], fontName="Helvetica", fontSize=8, leading=10, textColor=DARK))
    return ss


def court_footer(c, doc):
    c.saveState()
    c.setStrokeColor(PURPLE)
    c.line(18*mm, 14*mm, 192*mm, 14*mm)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK)
    c.drawString(18*mm, 9*mm, "Graham Stanley Hinton and Elaine Randall v Sara Gomes")
    c.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
    c.restoreState()


def client_footer(c, doc):
    c.saveState()
    c.setStrokeColor(PURPLE)
    c.line(18*mm, 14*mm, 192*mm, 14*mm)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK)
    c.drawString(18*mm, 9*mm, "Landlord Heaven | Client instructions")
    c.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
    c.restoreState()


def build_statement():
    ss = styles()
    story = [
        Paragraph("Joint landlords' statement of intention to sell", ss["TitleLH"]),
        Paragraph("19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS | Title SY435530", ss["SubLH"]),
        Paragraph("Statement", ss["HeadLH"]),
        Paragraph("We, Graham Stanley Hinton and Elaine Randall, are the joint registered proprietors and joint landlords of 19 Swallow Close. The official register records the property as leasehold.", ss["BodyLH"]),
        Paragraph("We genuinely intend to sell our leasehold interest in the property with vacant possession. On 19 August 2026 Graham Hinton entered into a sole agency agreement with Gregory Brown Estate Agents at an initial asking price of GBP 270,000. Elaine Randall confirms that she authorised and shares that intention to sell.", ss["BodyLH"]),
        Paragraph("The purpose of seeking possession under Ground 1A is the genuine sale of our interest in the property. We understand that the court may require updated marketing evidence and oral evidence of that intention. We will retain the agency agreement, marketing particulars, correspondence with the agent and evidence of any viewings, offers or conveyancing steps.", ss["BodyLH"]),
        Paragraph("We understand that statutory restrictions apply after possession is obtained under Ground 1A and that the property must not be re-let or marketed for re-letting during the restricted period except where the law permits.", ss["BodyLH"]),
        Spacer(1, 4*mm),
        Paragraph("Statement of truth", ss["HeadLH"]),
        Paragraph("We believe that the facts stated in this joint statement are true. We understand that proceedings for contempt of court may be brought against a person who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.", ss["BodyLH"]),
        Spacer(1, 7*mm),
    ]
    data = [
        [Paragraph("<b>Graham Stanley Hinton</b>", ss["BodyLH"]), Paragraph("<b>Elaine Randall</b>", ss["BodyLH"])],
        [Paragraph("Signature: __________________________", ss["BodyLH"]), Paragraph("Signature: __________________________", ss["BodyLH"])],
        [Paragraph("Date: ______________________________", ss["BodyLH"]), Paragraph("Date: ______________________________", ss["BodyLH"])],
    ]
    table = Table(data, colWidths=[82*mm, 82*mm])
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.6, PURPLE),
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(table)
    doc = SimpleDocTemplate(str(OUT_STATEMENT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=court_footer, onLaterPages=court_footer)


def build_front_matter(path):
    ss = styles()
    rows = [
        ["Tab", "Document", "Bundle pages", "Status"],
        ["A", "Official Land Registry title register (3 pages)", "3-5", "Official copy"],
        ["B", "Tenancy agreement: principal terms and signature pages", "6-7", "Terms and signatures"],
        ["C", "Gregory Brown sole agency agreement", "8", "Signed 19 August 2026"],
        ["D", "Joint landlords' statement of intention to sell", "9", "Both landlords to sign"],
        ["E", "Current satisfactory EICR", "10-16", "Seven supplied report pages"],
    ]
    table = Table(rows, colWidths=[13*mm, 87*mm, 24*mm, 48*mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PURPLE), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), .35, colors.HexColor("#B8AEC8")),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("FONTSIZE", (0,0), (-1,-1), 7.6),
        ("LEADING", (0,0), (-1,-1), 9.5), ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5), ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story = [
        Paragraph("Indexed evidence pack", ss["TitleLH"]),
        Paragraph("Graham Stanley Hinton and Elaine Randall v Sara Gomes", ss["SubLH"]),
        Paragraph("19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS", ss["HeadLH"]),
        Paragraph("Ground 1A - genuine intention to sell the landlords' leasehold interest", ss["BodyLH"]),
        Spacer(1, 5*mm),
        Paragraph("Purpose of this bundle", ss["HeadLH"]),
        Paragraph("This indexed bundle presents the documentary evidence supporting the landlords' claim under Ground 1A. It should be used with the signed Form 3A, proof of service, Form N5 and Form N119 when the claim is issued after expiry of the notice.", ss["BodyLH"]),
        PageBreak(),
        Paragraph("Evidence index", ss["TitleLH"]), table,
        Spacer(1, 6*mm),
        Paragraph("Bundle use", ss["HeadLH"]),
        Paragraph("The signed joint statement should replace the unsigned version at Tab D. Page references should be checked after any later documents are added. Keep an identical copy of the filed bundle for the hearing.", ss["BodyLH"]),
    ]
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=court_footer, onLaterPages=court_footer)


def image_pdf(image_path, output_path):
    with Image.open(image_path) as im:
        iw, ih = im.size
    c = canvas.Canvas(str(output_path), pagesize=A4)
    margin = 12*mm
    aw, ah = A4[0]-2*margin, A4[1]-2*margin
    scale = min(aw/iw, ah/ih)
    w, h = iw*scale, ih*scale
    c.drawImage(str(image_path), (A4[0]-w)/2, (A4[1]-h)/2, width=w, height=h, preserveAspectRatio=True, mask="auto")
    c.showPage(); c.save()


def build_bundle():
    front = TMP / "front-matter.pdf"
    build_front_matter(front)
    writer = PdfWriter()
    writer.append(str(front))
    for name in ["LandReg1.pdf", "LandReg2.pdf", "LandReg3.pdf"]:
        writer.append(str(EVIDENCE / "A Title" / name))
    for name in ["SwallowAST1.pdf", "SwallowAST10.pdf"]:
        writer.append(str(EVIDENCE / "B Tenancy" / name))
    writer.append(str(EVIDENCE / "C Sale intention" / "Sole Agency Agreement - 19 Swallow Close.pdf"))
    writer.append(str(OUT_STATEMENT))
    for p in sorted((EVIDENCE / "D Compliance records").glob("IMG_*.png")):
        img_pdf = TMP / f"{p.stem}.pdf"
        image_pdf(p, img_pdf)
        writer.append(str(img_pdf))
    # A source exhibit contains an unused orphan form widget. The evidence
    # bundle is a static court document, so remove inherited form controls.
    writer.remove_annotations(subtypes="/Widget")
    writer.root_object.pop(NameObject("/AcroForm"), None)
    with OUT_BUNDLE.open("wb") as f:
        writer.write(f)


def build_checklist():
    ss = styles()
    raw_rows = [
        ["Item", "What Graham and Elaine should do"],
        ["1. Before service", "Confirm Sara Gomes remains in possession. Both landlords sign and date Form 3A and each continuation sheet."],
        ["2. Serve Form 3A", "Serve the complete notice and continuation sheets on 2 November 2026 using the method stated in the prepared N215. Keep an identical copy."],
        ["3. Record service", "Immediately after service, complete and sign Form N215 accurately. Do not sign it in advance."],
        ["4. Wait", "Do not issue the possession claim before 3 March 2027. If possession is returned earlier, do not issue a claim."],
        ["5. Recheck before issue", "Confirm the facts remain true, the property is still being marketed for sale, the correct court fee, and any registration duties applying at the issue date."],
        ["6. Sign claim forms", "Both claimants should check Form N5 and Form N119. A claimant should sign and date each statement of truth only when the claim is ready to issue."],
        ["7. Filing set", "File Form N5, Form N119 and its continuation sheet, the signed Form 3A and continuation sheets, Form N215, and the indexed evidence bundle. Include at least one extra copy of every document and keep a complete copy."],
        ["8. Fee and delivery", "Pay the applicable court fee and post, email or deliver the filing set to Staines County Court and Family Court in accordance with the court's current filing arrangements."],
        ["9. After issue", "Keep the notice of issue and claim number. Follow every court direction and send the complete hearing bundle to the court at least 14 days before the hearing."],
        ["10. Hearing", "Take the complete case file and evidence of the continuing intention to sell, including current marketing correspondence, viewing records and any offers."],
    ]
    header_style = ParagraphStyle(name="ChecklistHeader", parent=ss["SmallLH"], fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=colors.white)
    label_style = ParagraphStyle(name="ChecklistLabel", parent=ss["SmallLH"], fontName="Helvetica-Bold", fontSize=7.8, leading=10, textColor=DARK)
    cell_style = ParagraphStyle(name="ChecklistCell", parent=ss["SmallLH"], fontName="Helvetica", fontSize=7.8, leading=10, textColor=DARK)
    rows = [[Paragraph(raw_rows[0][0], header_style), Paragraph(raw_rows[0][1], header_style)]]
    rows.extend([[Paragraph(label, label_style), Paragraph(detail, cell_style)] for label, detail in raw_rows[1:]])
    table = Table(rows, colWidths=[34*mm, 138*mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PURPLE), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), .4, colors.HexColor("#B8AEC8")),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("FONTSIZE", (0,0), (-1,-1), 8.2),
        ("LEADING", (0,0), (-1,-1), 10.5), ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("BACKGROUND", (0,1), (-1,-1), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story = [
        Paragraph("LANDLORD HEAVEN", ss["SubLH"]),
        Paragraph("Court filing checklist for the landlords", ss["TitleLH"]),
        Paragraph("Graham Stanley Hinton and Elaine Randall v Sara Gomes", ss["SubLH"]),
        Paragraph("19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS", ss["HeadLH"]),
        Paragraph("Ground 1A - intention to sell", ss["BodyLH"]),
        Spacer(1, 3*mm), table, Spacer(1, 5*mm),
        Paragraph("Court details", ss["HeadLH"]),
        Paragraph("Staines County Court and Family Court, The Law Courts, Knowle Green, Staines, TW18 1XH. Civil enquiries: surreycivil@justice.gov.uk. Telephone: 0300 123 5577.", ss["BodyLH"]),
        Paragraph("Important", ss["HeadLH"]),
        Paragraph("The dates and facts on the forms must remain accurate when signed and filed. The court, not Landlord Heaven, issues the claim and inserts the claim number and hearing details.", ss["BodyLH"]),
    ]
    doc = SimpleDocTemplate(str(OUT_CHECKLIST), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm)
    doc.build(story, onFirstPage=client_footer, onLaterPages=client_footer)


if __name__ == "__main__":
    build_bundle()
    build_checklist()
    for p in [OUT_BUNDLE, OUT_CHECKLIST]:
        r = PdfReader(str(p))
        print(f"{p} | pages={len(r.pages)} | bytes={p.stat().st_size}")
