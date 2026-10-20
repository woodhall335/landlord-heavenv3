from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from pathlib import Path

OUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Graham\Graham Hinton 19 Swallow Close Case Preparation From 1 November 2026.docx")
LOGO = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\public\headerlogo.png")

PURPLE = "6B2BD9"
DARK = "24193A"
MID = "5D5672"
LIGHT = "F4F0FB"
PALE = "FAF8FD"
GREY = "D9D9D9"
RED = "9C2F2F"


def set_cell_fill(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tcPr.append(shd)
    shd.set(qn("w:fill"), color)


def set_cell_margins(cell, top=110, start=130, bottom=110, end=130):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = tcPr.first_child_found_in("w:tcMar")
    if tcMar is None:
        tcMar = OxmlElement("w:tcMar")
        tcPr.append(tcMar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tcMar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tcMar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=GREY, size="6"):
    tblPr = table._tbl.tblPr
    borders = tblPr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tblPr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)


def set_repeat_table_header(row):
    trPr = row._tr.get_or_add_trPr()
    tag = OxmlElement("w:tblHeader")
    tag.set(qn("w:val"), "true")
    trPr.append(tag)


def font(run, size=None, bold=None, color=None, italic=None):
    run.font.name = "Aptos"
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), "Aptos")
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), "Aptos")
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)
    if italic is not None:
        run.italic = italic
    return run


def add_para(doc, text="", bold_lead=None, style=None, before=0, after=7, keep=False):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.12
    p.paragraph_format.keep_with_next = keep
    if bold_lead and text.startswith(bold_lead):
        font(p.add_run(bold_lead), bold=True, color=DARK)
        font(p.add_run(text[len(bold_lead):]), color=DARK)
    else:
        font(p.add_run(text), color=DARK)
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.08
    font(p.add_run(text), color=DARK)
    return p


def heading(doc, text, level=1):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    return p


def add_table(doc, headers, rows, widths=None, font_size=8.8):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        c = hdr.cells[i]
        set_cell_fill(c, DARK)
        set_cell_margins(c)
        c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        font(p.add_run(h), size=font_size, bold=True, color="FFFFFF")
        if widths:
            c.width = Inches(widths[i])
    for r_i, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            c = cells[i]
            if r_i % 2:
                set_cell_fill(c, PALE)
            set_cell_margins(c)
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.02
            font(p.add_run(str(value)), size=font_size, color=DARK)
            if widths:
                c.width = Inches(widths[i])
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_signature_block(doc, names):
    for name in names:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(0)
        font(p.add_run("Signed  ____________________________________"), color=DARK)
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        font(p.add_run(f"{name}    Date  ____________________"), size=9.5, color=DARK)


doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(0.62)
sec.bottom_margin = Inches(0.62)
sec.left_margin = Inches(0.72)
sec.right_margin = Inches(0.72)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.2)
normal.font.color.rgb = RGBColor.from_string(DARK)

title = styles["Title"]
title.font.name = "Aptos Display"
title._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
title._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
title.font.size = Pt(26)
title.font.bold = True
title.font.color.rgb = RGBColor(0, 0, 0)
title.paragraph_format.space_after = Pt(7)

for i, size in [(1, 17), (2, 13), (3, 11)]:
    s = styles[f"Heading {i}"]
    s.font.name = "Aptos Display"
    s._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    s._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    s.font.size = Pt(size)
    s.font.bold = True
    s.font.color.rgb = RGBColor(0, 0, 0)
    s.paragraph_format.space_before = Pt(12 if i == 1 else 8)
    s.paragraph_format.space_after = Pt(5)
    s.paragraph_format.keep_with_next = True

# Header and footer
header = sec.header
hp = header.paragraphs[0]
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
if LOGO.exists():
    hp.add_run().add_picture(str(LOGO), width=Inches(2.25))

footer = sec.footer
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
font(fp.add_run("Landlord Heaven   |   Case preparation pack   |   19 Swallow Close"), size=8, color=MID)

# Cover
p = doc.add_paragraph(style="Title")
p.alignment = WD_ALIGN_PARAGRAPH.LEFT
font(p.add_run("19 Swallow Close Case Preparation"), size=26, bold=True, color="000000")
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(20)
font(p.add_run("Post 31 October 2026 action pack"), size=15, bold=True, color=PURPLE)

add_table(doc, ["Case detail", "Confirmed position"], [
    ("Property", "19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS"),
    ("Registered owners and landlords", "Graham Stanley Hinton and Elaine Randall"),
    ("Current named tenant", "Sara Gomes"),
    ("Current tenancy evidence", "Agreement commencing 1 November 2025 at £1,350 per calendar month with a £1,100 deposit"),
    ("Intended possession ground", "Ground 1A - genuine intention to sell"),
    ("Current instruction", "Prepare the active Ground 1A case for service after 31 October 2026"),
    ("Pack status", "Service-ready working pack. Date and sign the prescribed notice only when the actual service date is confirmed."),
], widths=[2.1, 4.75], font_size=9.2)

add_para(doc, "Purpose. This pack brings the correspondence and evidence into one working file and prepares an active Ground 1A possession case for service after 31 October 2026.", bold_lead="Purpose.")
add_para(doc, "Main conclusion. The documentary case supports Ground 1A based on the joint landlords' genuine intention to sell. The proposed service plan is personal service on Monday 2 November 2026, using the current Form 3A. A possession date of 3 March 2027 provides a one-day margin beyond four calendar months. The final form must be checked against the version then published by GOV.UK and must not be signed or dated before the actual service arrangements are confirmed.", bold_lead="Main conclusion.")
add_para(doc, "Prepared 16 October 2026. Legal forms and government guidance must be rechecked again on the actual service and issue dates.", bold_lead="Prepared 16 October 2026.")

doc.add_page_break()

heading(doc, "1 Current case status", 1)
add_para(doc, "The case is prepared as an active private-sector possession matter under Ground 1A. The landlords are joint registered owners, the later operative agreement names Sara Gomes as tenant, and the signed sole agency agreement is contemporaneous evidence of the intention to sell. The notice route is the current Form 3A, with a minimum four-month period.")

heading(doc, "Proposed service plan", 2)
add_table(doc, ["Step", "Planned action"], [
    ("Final form check", "Download the current Form 3A from GOV.UK on 2 November 2026 and compare every field and the full Ground 1A wording."),
    ("Signature", "Use both joint landlords' names. The person signing must have authority to sign for the joint landlords."),
    ("Service", "Personal hand delivery at the property on Monday 2 November 2026, preferably with an independent adult witness and a contemporaneous photograph or note."),
    ("Possession date", "3 March 2027, subject to final legal date check. This is one day beyond four calendar months from the proposed personal service date."),
    ("Court stage", "If possession has not been returned, prepare N5, N119 and N215 for issue on or after 4 March 2027, using the facts then existing."),
], widths=[1.55, 5.3], font_size=8.7)

heading(doc, "Control rule", 2)
add_para(doc, "The notice must record what actually happens. If personal service does not take place on 2 November, do not use the dates above. Recalculate the possession date from the actual service method and actual service date before serving.")

heading(doc, "2 Confirmed case facts", 1)
add_table(doc, ["Issue", "Evidence and present conclusion"], [
    ("Ownership", "Official title documents identify Graham Stanley Hinton and Elaine Randall as joint registered proprietors. The title address for service appears historic, but this does not displace the ownership evidence."),
    ("Landlord parties", "The Sara agreement names Graham Stanley Hinton and Elaine Randall. Any notice and later claim should be in both joint landlords' names."),
    ("Tenant", "The latest agreement supplied names Sara Gomes as tenant."),
    ("Property", "19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS."),
    ("Tenancy term", "Six months from 1 November 2025 to 30 April 2026. Following the 1 May 2026 reforms, the tenancy is treated as an assured periodic tenancy if it continued."),
    ("Rent", "£1,350 per calendar month, payable in advance on the first day of each month."),
    ("Deposit", "£1,100. The supplied DPS certificate refers to a 1 December 2019 tenancy and protection on 4 December 2019, not expressly to the November 2025 agreement."),
    ("Sale intention", "Sole agency agreement with Gregory Brown dated 19 August 2026, initial asking price £270,000, 20-week minimum sole agency and fee of 1.25% plus VAT."),
    ("Electrical safety", "EICR inspected on 31 August 2026, recorded as satisfactory, with the next inspection shown before 31 August 2030."),
    ("Case instruction", "Prepare the Ground 1A sale case for service after 31 October 2026."),
], widths=[1.65, 5.2], font_size=8.45)

heading(doc, "3 Evidence reconciliation", 1)
add_para(doc, "The client has confirmed that all evidence required for preparation has been supplied. The following points should be explained consistently in the witness evidence so that the court can follow the document history.")
add_bullet(doc, "Operative tenancy: an earlier agreement names Igor Henriques for a term from 1 August 2025 to 31 July 2026. The later agreement names Sara Gomes from 1 November 2025. The case position is that the later Sara agreement superseded the earlier arrangement and that Sara became the sole contractual tenant from 1 November 2025. Graham and Elaine should confirm this expressly in their signed statement.")
add_bullet(doc, "Complete agreement: the final court bundle should contain the complete Sara agreement in page order. The first and signature pages already confirm the parties, property, term, rent, deposit and execution details relied upon in this pack.")
add_bullet(doc, "Joint landlord authority: the agreement names both Graham and Elaine as landlords. Elaine's signed Ground 1A statement in this pack confirms the joint sale intention and Graham's authority to manage the case if that is accurate.")
add_bullet(doc, "Deposit evidence: the DPS certificate shows Deposit ID 21112774, Sara Gomes, the property and the matching £1,100 sum, with protection dating from the earlier tenancy history. Retain the scheme record showing that the same deposit remained protected when the later agreement was granted.")

doc.add_page_break()

heading(doc, "4 Correspondence chronology", 1)
add_para(doc, "The chronology below consolidates the Graham correspondence identified in the mailbox and the documents supplied with it. Quoted substance is limited to correspondence that has been directly reviewed or reproduced in the working history.")
chron = [
    ("14 Aug 2026", "Re Please find attached a case which we completed on behalf of a client", "Early correspondence in the assisted-preparation enquiry. Preserve the full message in the correspondence section."),
    ("20 Aug 2026", "Sole Agency Agreement", "Graham supplied the property sale agreement."),
    ("20 Aug 2026", "Fw EPC 19 Swallow Close", "Graham supplied or linked the EPC evidence."),
    ("20 Aug 2026", "Re Sole Agency Agreement", "Tenancy and deposit material was supplied in the chain."),
    ("20 Aug 2026", "Fw 19 Swallow Close", "Identity and right-to-rent material for Sara and other household members was supplied."),
    ("21 Aug 2026", "Re Sole Agency Agreement", "Further clarification and documents were supplied."),
    ("29 Aug 2026", "Re Sole Agency Agreement", "Further clarification in the same case thread."),
    ("3 Sep 2026", "Re Sole Agency Agreement", "Graham supplied official Land Registry documents and the DPS certificate, noting that the registered address was wrong and that he was seeking to update it."),
    ("3 Sep 2026", "Re Sole Agency Agreement", "Graham supplied electrical documents and explained that a current EICR was being arranged."),
    ("9 Sep 2026", "EICR", "Graham supplied the completed EICR."),
    ("13 Oct 2026", "19 Swallow Close", "Graham asked for a brief progress update and an indication of timescale."),
    ("13 Oct 2026", "Landlord Heaven reply", "Tariq confirmed that the notice and supporting papers were being prepared that week, that service instructions and evidence guidance would follow, and that the notice required four months."),
]
add_table(doc, ["Date", "Subject", "Case significance"], chron, widths=[1.05, 2.25, 3.55], font_size=7.9)

heading(doc, "5 Evidence schedule", 1)
evidence = [
    ("A1", "Official title register documents", "Received", "Shows joint proprietors. Use the official copies in the court bundle."),
    ("A2", "Title address update correspondence", "Pending or separate", "Useful administratively; ownership does not appear dependent on the address update."),
    ("B1", "Sara agreement page 1", "Received", "Names both landlords, Sara, property, term, rent and deposit."),
    ("B2", "Sara agreement page 10", "Received", "Signed by Graham on 11 Nov 2025 and Sara on 10 Nov 2025; Elaine signature not shown."),
    ("B3", "Complete Sara agreement", "Supplied", "Place the complete agreement in page order in the final bundle."),
    ("B4", "Earlier Igor agreements", "Received", "Explain as the superseded tenancy history in the landlords' statements."),
    ("C1", "DPS certificate", "Received", "Deposit ID 21112774, £1,100, Sara Gomes; dates refer to December 2019."),
    ("C2", "DPS scheme history and prescribed information", "Case evidence", "Use the scheme history to show continuity of protection for the £1,100 deposit."),
    ("D1", "EPC", "Link or copy referenced", "Place the actual certificate in the final bundle and record when it was given to the tenant."),
    ("D2", "EICR dated 31 Aug 2026", "Received", "Satisfactory; retain all seven photographed pages."),
    ("E1", "Gregory Brown agency agreement", "Received", "Evidence of genuine intention to sell; signed 19 Aug 2026 by Graham."),
    ("E2", "Elaine sale confirmation", "Draft prepared", "Both landlords sign the joint intention statement if accurate."),
    ("F1", "Graham and Landlord Heaven correspondence", "Mailbox", "Export or print the complete thread in date order."),
    ("G1", "Form 3A and service evidence", "Prepared for service", "Use the current prescribed form, retain the signed copy and complete proof of service."),
]
add_table(doc, ["Ref", "Document", "Status", "Use or issue"], evidence, widths=[0.55, 2.15, 1.15, 3.0], font_size=7.7)

doc.add_page_break()

heading(doc, "6 Legal route if Sara remains", 1)
add_para(doc, "From 1 May 2026, a private landlord in England seeking possession of an assured periodic tenancy must use the current Form 3A or a form substantially to the same effect. Ground 1A is the mandatory sale ground. It requires a genuine intention to sell, at least four months' notice, and the date for possession cannot fall within the first 12 months of a new tenancy.")
add_para(doc, "On the evidence currently supplied, the intended route is Ground 1A. The November 2025 agreement means the first 12 months end at the beginning of November 2026. A notice served after the post-31 October checks should therefore be capable of giving the ordinary four-month period, but the exact notice date and earliest court date must be calculated from the actual service method and date.")
add_para(doc, "A court claim cannot be issued merely because the notice has been prepared. It can be issued only after a valid notice has been served and its stated period has expired, if the tenant still has not left. The paper route uses Form N5 and Form N119. Proof of service can be recorded on Form N215. The court fee shown in government guidance on 16 October 2026 is £415, but it must be checked again before issue.")

heading(doc, "Current official sources", 2)
add_bullet(doc, "Assured tenancy forms and current Form 3A: https://www.gov.uk/guidance/assured-tenancy-forms")
add_bullet(doc, "Grounds for possession guidance: https://www.gov.uk/government/publications/grounds-for-possession-guidance-for-landlords-and-letting-agents")
add_bullet(doc, "Post-1 May 2026 possession process: https://www.gov.uk/guidance/repossessing-your-privately-rented-property-after-1-may-2026")
add_bullet(doc, "N5 claim form: https://www.gov.uk/government/publications/make-a-claim-for-possession-of-a-property-form-n5")
add_bullet(doc, "N119 particulars: https://www.gov.uk/government/publications/give-details-of-a-claim-for-possession-of-a-rented-residential-property-form-n119")

heading(doc, "Proposed timetable from 31 October", 2)
add_table(doc, ["When", "Action"], [
    ("31 Oct", "Complete the evidence and notice review. Do not sign or pre-date the prescribed notice."),
    ("1 Nov", "Both landlords confirm the intention to sell and the tenancy history statement."),
    ("2 Nov", "Download, complete, sign and personally serve the current Form 3A. Complete the service record immediately."),
    ("3 Mar 2027", "Proposed possession date stated in the notice, subject to final date verification before service."),
    ("4 Mar 2027 onward", "If possession has not been returned, update the evidence and complete N5, N119 and N215 for issue."),
], widths=[1.25, 5.6], font_size=8.4)

heading(doc, "7 Draft Form 3A completion sheet", 1)
add_para(doc, "This is a drafting sheet, not the prescribed notice. Transfer the verified information to the current government Form 3A only after the activation checklist has been completed.")
add_table(doc, ["Form field", "Draft entry"], [
    ("Landlords", "Graham Stanley Hinton and Elaine Randall"),
    ("Tenant", "Sara Gomes, subject to confirmation that no other person has tenant status"),
    ("Property", "19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS"),
    ("Ground", "Ground 1A - sale of dwelling-house"),
    ("Reason", "The joint landlords genuinely intend to sell their freehold interest in the dwelling-house. The property was placed with Gregory Brown under a sole agency agreement dated 19 August 2026 at an initial asking price of £270,000. Official title documents show the joint landlords as registered proprietors."),
    ("Notice served", "Proposed: 2 November 2026 by personal hand delivery"),
    ("Possession date", "Proposed: 3 March 2027, to be verified against the actual service date and current Form 3A instructions"),
    ("Landlord or authorised signatory", "[Confirm who signs and the authority relied upon]"),
    ("Service method", "[Personal service / first-class post / other method permitted by the agreement and law]"),
], widths=[1.65, 5.2], font_size=8.55)

doc.add_page_break()

heading(doc, "8 Draft joint landlord statement of intention to sell", 1)
add_para(doc, "Use this statement only if the Ground 1A route is activated. Both landlords should read it, correct it and sign only if it remains true at the date of signature.")
add_para(doc, "We, Graham Stanley Hinton and Elaine Randall, are the registered proprietors and joint landlords of 19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS.")
add_para(doc, "We genuinely intend to sell our interest in the property with vacant possession. Our intention is not a device to remove the tenant so that the property can be re-let.")
add_para(doc, "On 19 August 2026, Graham Hinton entered into a sole agency agreement with Gregory Brown in relation to the sale of the property. The initial asking price stated in that agreement was £270,000. Elaine Randall confirms that she authorised and supports the sale instruction and shares the intention to sell.")
add_para(doc, "The property remains intended for sale. We will retain the agency agreement, marketing records, communications with the agent and any valuation or viewing records as evidence of that intention.")
add_para(doc, "We understand that, after possession is obtained on Ground 1A, statutory restrictions may apply to re-letting or marketing the property for rent. We intend to comply with those restrictions.")
add_para(doc, "We believe that the facts stated in this statement are true.")
add_signature_block(doc, ["Graham Stanley Hinton", "Elaine Randall"])

heading(doc, "9 Landlord confirmation before service", 1)
add_para(doc, "Both landlords should review and sign this confirmation on 1 or 2 November 2026 before the prescribed notice is served.")
add_table(doc, ["Confirmation", "Landlord response"], [
    ("The property remains intended for sale", "Yes / No"),
    ("The Gregory Brown instruction remains genuine evidence of the sale plan", "Yes / No"),
    ("The Sara agreement is the operative tenancy from 1 November 2025", "Yes / No"),
    ("The earlier Igor agreement was superseded and Igor is not a current tenant", "Yes / No"),
    ("The £1,100 deposit remains protected under DPS Deposit ID 21112774", "Yes / No"),
    ("The current Form 3A and Ground 1A wording have been downloaded from GOV.UK", "Yes / No"),
    ("The intended personal service date is 2 November 2026", "Yes / No"),
    ("The proposed possession date of 3 March 2027 has been checked", "Yes / No"),
], widths=[5.25, 1.6], font_size=8.7)
add_para(doc, "We confirm that the answers above are accurate and that we authorise the Ground 1A notice to be completed and served on the stated basis.")
add_signature_block(doc, ["Graham Stanley Hinton", "Elaine Randall"])

doc.add_page_break()

heading(doc, "10 Draft evidence of service record", 1)
add_para(doc, "Complete immediately after service if a notice is required. Keep this record with the exact signed notice that was served.")
add_table(doc, ["Service detail", "Record"], [
    ("Document served", "Form 3A dated __________________"),
    ("Person served", "Sara Gomes [and any other confirmed tenant]"),
    ("Address", "19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS"),
    ("Method", "____________________________________________"),
    ("Date", "____________________________________________"),
    ("Time", "____________________________________________"),
    ("Person who served", "____________________________________________"),
    ("Witness", "____________________________________________"),
    ("Posting or delivery proof", "____________________________________________"),
    ("Photographs or contemporaneous note", "____________________________________________"),
], widths=[2.0, 4.85], font_size=8.7)
add_para(doc, "Service statement. I served the document identified above by the method and at the time recorded. The facts in this record are true to the best of my knowledge and belief.", bold_lead="Service statement.")
add_signature_block(doc, ["Person who served the notice"])

heading(doc, "11 Draft court case theory after notice expiry", 1)
add_para(doc, "This section is a pleading framework for later completion. It is not ready to file because no post-31 October facts, service date or notice expiry date presently exist.")
for text in [
    "The claimants are Graham Stanley Hinton and Elaine Randall, the joint registered proprietors and landlords of 19 Swallow Close, Staines-upon-Thames, Middlesex, TW18 4RS.",
    "The defendant is Sara Gomes, who occupies under the assured periodic tenancy evidenced by the agreement commencing 1 November 2025, subject to final confirmation of the correct tenant and occupier parties.",
    "The claimants genuinely intend to sell their interest in the dwelling-house. They rely on Ground 1A in Schedule 2 to the Housing Act 1988 as amended.",
    "On [date], the claimants served the current prescribed Form 3A on the defendant by [method]. The notice required possession after [date] and gave no less than the statutory minimum period.",
    "The notice period expired and the defendant remained in possession. The claimants therefore seek an order for possession and the court fee and such further costs as the court considers appropriate.",
    "The evidence includes the official title, tenancy agreement, Form 3A, proof of service, the joint landlords' statements, the sole agency agreement and updated sale evidence.",
]:
    add_para(doc, text)

heading(doc, "12 Activation checklist", 1)
checks = [
    "Confirm the complete Sara agreement is placed in the evidence bundle.",
    "Both landlords sign the statement explaining that the Sara agreement superseded the earlier Igor arrangement.",
    "Both landlords sign the joint intention-to-sell statement.",
    "Place the DPS certificate, scheme history and prescribed information in the bundle.",
    "Confirm the agency instruction remains live and retain current marketing evidence.",
    "Download the current Form 3A from GOV.UK on the day of preparation.",
    "Calculate the notice date and earliest possession date from the actual service method and build in a safe margin.",
    "Have both landlord names and the tenant name independently checked before signature.",
    "Serve by the agreed method and create contemporaneous evidence of service.",
    "Diary notice expiry and the 12-month claim deadline shown in current guidance.",
]
for item in checks:
    add_bullet(doc, "[  ] " + item)

heading(doc, "13 Final review notes", 1)
add_para(doc, "The evidence supports preparation of a Ground 1A sale case. The landlords' statements should explain the transition from the earlier Igor agreement to the later Sara agreement and the continuity of the DPS deposit record, so that the documentary history is transparent and consistent.")
add_para(doc, "The notice pack is planned around personal service on 2 November 2026 and a proposed possession date of 3 March 2027. If service occurs differently, amend every dependent date before service. Court forms should be completed only after notice expiry and from the facts then existing.")
add_para(doc, "Landlord Heaven provides document-preparation support. This pack is designed to organise the case and drafts; it is not a substitute for case-specific legal advice where the tenancy history, deposit compliance or occupier status is disputed.")

# Prevent table rows splitting and set document properties.
for table in doc.tables:
    for row in table.rows:
        trPr = row._tr.get_or_add_trPr()
        cant = OxmlElement("w:cantSplit")
        trPr.append(cant)

doc.core_properties.title = "19 Swallow Close Case Preparation From 1 November 2026"
doc.core_properties.subject = "Graham Hinton and Elaine Randall possession case preparation"
doc.core_properties.author = "Landlord Heaven"
doc.core_properties.keywords = "Ground 1A, Form 3A, possession, sale, 19 Swallow Close"

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(str(OUT))
