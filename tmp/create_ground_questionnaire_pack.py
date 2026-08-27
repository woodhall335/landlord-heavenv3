from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from pypdf import PdfReader
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3")
PACK_DIR = ROOT / "output" / "pdf" / "england-possession-ground-questionnaires"
ZIP_OUTPUT = ROOT / "output" / "pdf" / "landlord-heaven-england-possession-ground-questionnaires.zip"
LOGO = ROOT / "public" / "images" / "logo.png"
EXISTING = ROOT / "output" / "pdf" / "landlord-heaven-serious-antisocial-behaviour-questionnaire.pdf"

W, H = A4
M = 36
DARK = HexColor("#20103F")
PURPLE = HexColor("#6D28D9")
LAVENDER = HexColor("#F5F1FF")
LILAC = HexColor("#E8E1F8")
TEXT = HexColor("#3B3550")
MUTED = HexColor("#675F7D")


GROUND_FORMS = [
    ("01-ground-1-landlord-or-family-occupation", "Ground 1 - Occupation by landlord or family", "Mandatory", "4 months; cannot expire before the first 12 months of a new tenancy have ended", ["Who needs to occupy the property and what is their relationship to the landlord?", "Why is occupation needed as their only or main home?", "When do they need to move in and what evidence supports the timing?", "Was the required advance notice of possible reliance on Ground 1 given before the tenancy started, if applicable?"], ["Land Registry title / ownership evidence", "Signed statement of intention to occupy", "Proof of relationship", "Address / housing evidence", "Tenancy agreement", "Relevant correspondence"]),
    ("02-ground-1a-sale", "Ground 1A - Sale of dwelling-house", "Mandatory", "4 months; cannot expire before the first 12 months of a new tenancy have ended", ["Why is the property being sold and when was the decision made?", "Is the tenancy one to which Ground 1A may apply? Explain the tenancy start and prior status.", "What steps have been taken to market or sell the property?", "Was the required advance notice of possible reliance on Ground 1A given before the tenancy started, if applicable?"], ["Land Registry title", "Estate-agent instruction or valuation", "Sales particulars / marketing evidence", "Signed sale statement", "Tenancy agreement", "Tenant correspondence"]),
    ("03-ground-1b-rent-to-buy-sale", "Ground 1B - Rent to Buy sale", "Mandatory", "4 months", ["Confirm the landlord is a Private Registered Provider and the property forms part of a Rent to Buy scheme.", "When and how was the tenant offered the opportunity to buy the property?", "What was the outcome of that offer?", "What evidence shows the relevant Rent to Buy conditions and dates?"], ["PRP status evidence", "Rent to Buy scheme documents", "Offer to tenant", "Tenant response", "Tenancy agreement", "Property records"]),
    ("04-ground-2-mortgagee-sale", "Ground 2 - Sale by mortgagee", "Mandatory", "4 months", ["Who is the mortgagee or lender seeking possession?", "What mortgage default or enforcement action has occurred?", "Why is possession needed to sell the property?", "What authority and property evidence supports the lender's position?"], ["Mortgage / charge evidence", "Lender appointment or authority", "Default / enforcement correspondence", "Property title", "Tenancy agreement", "Court or lender notices"]),
    ("05-grounds-2za-to-2zd-superior-lease", "Grounds 2ZA to 2ZD - Superior lease ending", "Mandatory", "4 months", ["Which ground is being considered (2ZA, 2ZB, 2ZC or 2ZD) and why?", "Describe the superior lease, its term and its actual or expected end date.", "What type of landlord or provider is involved and why is the ground available to them?", "If relying on 2ZD, when did the lease revert and is the six-month application window relevant?"], ["Superior lease", "Title / landlord-chain evidence", "Lease termination or expiry notice", "Provider status evidence", "Tenancy agreement", "Relevant correspondence"]),
    ("06-ground-4-student-accommodation", "Ground 4 - Student accommodation", "Mandatory", "2 weeks", ["Confirm the landlord is a university or college and the property is student accommodation.", "When was the property last let to students and what evidence proves this?", "Why is the property now needed for student accommodation?", "List the tenancy dates and all relevant student-accommodation records."], ["University / college status evidence", "Previous student tenancy evidence", "Current tenancy agreement", "Accommodation allocation records", "Property records", "Tenant correspondence"]),
    ("07-ground-4a-new-students", "Ground 4A - HMO needed for new students", "Mandatory", "4 months", ["Confirm the property is an HMO occupied by full-time students and identify the shared facilities.", "When was the tenancy agreed and what evidence shows it was not agreed more than six months before it began?", "What incoming student group needs the property and for which academic period?", "Was the required advance notice about Ground 4A given before the tenancy started?"], ["HMO / occupancy evidence", "Student-status evidence", "Incoming student bookings", "Tenancy agreement", "Advance-notice evidence", "Academic-year records"]),
    ("08-grounds-5-to-5d-employment-purpose", "Grounds 5 to 5D - Employment or purpose accommodation", "Mandatory", "Usually 2 months; confirm the exact selected ground", ["Which ground is being considered (5, 5A, 5B, 5C or 5D) and why?", "Describe the employment, religious, agricultural or eligibility connection to the property.", "What change has occurred that means the property is needed now?", "Identify the landlord type and the documentary evidence of the relevant employment or eligibility requirement."], ["Employment contract / records", "Property-use evidence", "Landlord / provider status evidence", "Termination or change correspondence", "Tenancy agreement", "Supporting witness statement"]),
    ("09-grounds-5e-to-5h-and-18-supported-accommodation", "Grounds 5E to 5H and 18 - Supported accommodation", "Mandatory or discretionary depending on selected ground", "4 weeks for 5E, 5F, 5G and 18; 2 months for 5H", ["Which ground is being considered (5E, 5F, 5G, 5H or 18) and why?", "Describe the supported-accommodation or homelessness arrangement and the provider's status.", "What has changed: support ended, funding ended, eligibility changed, council notice or lack of cooperation?", "What definitions, notices, assessments and dates support the chosen route?"], ["Support agreement / care plan", "Provider or charity status", "Council notification", "Funding / eligibility records", "Tenancy agreement", "Support-provider chronology"]),
    ("10-ground-6-redevelopment", "Ground 6 - Redevelopment or demolition", "Mandatory", "4 months", ["Describe the proposed redevelopment or demolition and why the tenant cannot remain during the works.", "When were the works planned and what approvals, contracts or programme dates exist?", "Is alternative accommodation required or has advance notice of Ground 6 been given?", "Explain any six-month tenancy restriction or exception that may apply."], ["Planning permission / approvals", "Works contract or specification", "Programme and access plan", "Alternative-accommodation evidence", "Tenancy agreement", "Advance-notice evidence"]),
    ("11-ground-6a-decant", "Ground 6A - Decant accommodation", "Mandatory", "4 months", ["Confirm the landlord is a relevant social landlord and explain the original redevelopment arrangement.", "Where is the tenant's permanent or alternative accommodation and why is the current property no longer needed?", "How does the proposed accommodation meet security, affordability, location and overcrowding requirements?", "Provide all key dates and correspondence with the tenant."], ["Provider status evidence", "Redevelopment records", "Alternative-accommodation offer", "Affordability / suitability assessment", "Tenancy agreement", "Tenant correspondence"]),
    ("12-ground-6b-enforcement-action", "Ground 6B - Compliance with enforcement action", "Mandatory", "4 months", ["What legal enforcement action applies to the landlord or property?", "Why does that action require the landlord to recover possession?", "What dates, notices and compliance deadlines apply?", "Is compensation likely to be relevant and what evidence supports the position?"], ["Enforcement notice / decision", "Inspection or investigation records", "Compliance timetable", "Property title", "Tenancy agreement", "Professional reports"]),
    ("13-ground-7-death-of-tenant", "Ground 7 - Death of tenant", "Mandatory", "2 months", ["Who was the former tenant and when did they die?", "Who now occupies or inherited the tenancy, and did they live at the property immediately before the death?", "Why does succession not prevent reliance on Ground 7?", "Are any 12-month timing limits relevant?"], ["Death certificate", "Tenancy agreement", "Succession / probate correspondence", "Occupancy evidence", "Property records", "Tenant correspondence"]),
    ("14-ground-7b-right-to-rent", "Ground 7B - No right to rent", "Mandatory", "2 weeks", ["What notice has the Secretary of State given and when was it received?", "Which tenant is affected and how is their identity matched to the tenancy?", "What steps have been taken to check the notice is current and applies to this property?", "Record any response received from the tenant."], ["Secretary of State notice", "Right to Rent records", "Tenancy agreement", "Identity records held lawfully", "Tenant correspondence", "Service evidence"]),
    ("15-grounds-8-to-11-rent-arrears", "Grounds 8, 10 and 11 - Rent arrears", "Ground 8 mandatory; Grounds 10 and 11 discretionary", "4 weeks", ["What is the rent frequency, contractual rent and each due date?", "Provide the arrears at the notice date and current arrears, separating any disputed or benefit-related sums.", "For Ground 8, does the threshold appear met at both notice and hearing stages?", "For Ground 11, give a month-by-month history of persistent late payment."], ["Tenancy agreement", "Rent schedule", "Bank statements / payment ledger", "Tenant payment correspondence", "Benefit / UC information", "Previous arrears warnings"]),
    ("16-ground-9-alternative-accommodation", "Ground 9 - Suitable alternative accommodation", "Discretionary", "2 months", ["Describe the alternative accommodation offered, including address, rent, tenure and availability.", "Why is it suitable for the tenant's household and any relevant needs?", "When was the offer made and what response was received?", "What arrangements exist for moving costs or practical support?"], ["Alternative-accommodation offer", "Suitability assessment", "Household / needs evidence", "Rent and affordability comparison", "Tenant response", "Photographs / property details"]),
    ("17-grounds-13-and-15-deterioration", "Grounds 13 and 15 - Deterioration of property or furniture", "Discretionary", "2 weeks", ["Which ground is considered (13 property condition, 15 furniture condition, or both)?", "Describe each item, its previous condition, current condition and date discovered.", "What evidence identifies who is responsible and whether the deterioration was allowed to occur?", "What inspections, repair requests, warnings and opportunities to remedy have been given?"], ["Inventory / check-in report", "Photographs or video", "Inspection reports", "Repair estimates", "Tenancy agreement", "Warnings and tenant correspondence"]),
    ("18-ground-14a-domestic-abuse", "Ground 14A - Domestic abuse (social landlords only)", "Discretionary", "2 weeks", ["Confirm the landlord is a social landlord and identify the perpetrator and survivor without unnecessary sensitive detail.", "Who has left the property, why are they unlikely to return, and what evidence supports this?", "What safeguarding, support or confidentiality needs apply?", "What tenancy, occupancy and household facts are relevant to the request?"], ["Provider status evidence", "Safeguarding records", "Relevant court / police material", "Tenancy agreement", "Support-agency evidence", "Factual chronology"]),
    ("19-ground-14za-rioting", "Ground 14ZA - Rioting", "Discretionary", "2 weeks", ["Which adult tenant or occupier was convicted and for what riot-related offence?", "Give the conviction date, court and case reference.", "Explain the connection between the convicted person and the tenancy.", "What factors support the court finding possession reasonable?"], ["Conviction / court record", "Tenancy agreement", "Occupancy evidence", "Police material", "Witness statement", "Factual chronology"]),
    ("20-ground-17-false-statement", "Ground 17 - False statement", "Discretionary", "2 weeks", ["What information was false, who supplied it and when was it supplied?", "Why was the information material to granting the tenancy?", "When and how was the false statement discovered?", "What explanation or response has the tenant given?"], ["Application form", "Original supporting documents", "Verification records", "Tenancy agreement", "Tenant correspondence", "Witness statement"]),
]


def lines(text, font, size, width):
    words, result, current = text.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                result.append(current)
            current = word
    if current:
        result.append(current)
    return result


def draw_header(c, title, page):
    c.setStrokeColor(LILAC); c.line(M, H - 50, W - M, H - 50)
    c.drawImage(ImageReader(str(LOGO)), M, H - 39, width=178, height=26, preserveAspectRatio=True, mask="auto")
    c.setFillColor(PURPLE); c.setFont("Helvetica-Bold", 7.6); c.drawRightString(W - M, H - 25, "GROUND EVIDENCE QUESTIONNAIRE")
    c.setFillColor(MUTED); c.setFont("Helvetica", 7); c.drawRightString(W - M, H - 36, title)
    c.setStrokeColor(LILAC); c.line(M, 31, W - M, 31)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7); c.drawString(M, 18, "Landlord Heaven | Confidential document-preparation questionnaire")
    c.drawRightString(W - M, 18, f"Page {page} of 2")


def title_block(c, title, status, notice, y):
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 18)
    for idx, line in enumerate(lines(title, "Helvetica-Bold", 18, W - 2 * M)):
        c.drawString(M, y - idx * 21, line)
    y -= len(lines(title, "Helvetica-Bold", 18, W - 2 * M)) * 21 + 2
    c.setFillColor(PURPLE); c.setFont("Helvetica-Bold", 8.5)
    position = f"{status.upper()} GROUND | OFFICIAL NOTICE POSITION: {notice}"
    position_lines = lines(position, "Helvetica-Bold", 8.5, W - 2 * M)
    for index, line in enumerate(position_lines):
        c.drawString(M, y - index * 10, line)
    y -= len(position_lines) * 10 + 6
    body = "Use this editable form to gather the factual information and documents for the route named above. It does not confirm eligibility, decide which ground to use, replace legal advice or guarantee a court outcome."
    box_lines = lines(body, "Helvetica", 8.4, W - 2 * M - 20)
    height = 18 + len(box_lines) * 10
    c.setFillColor(LAVENDER); c.setStrokeColor(LILAC); c.roundRect(M, y - height, W - 2*M, height, 7, fill=1, stroke=1)
    c.setFillColor(TEXT); c.setFont("Helvetica", 8.4)
    for idx, line in enumerate(box_lines): c.drawString(M + 10, y - 13 - idx * 10, line)
    return y - height - 10


def section(c, y, number, title):
    c.setFillColor(PURPLE); c.roundRect(M, y - 22, 23, 22, 5, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10); c.drawCentredString(M + 11.5, y - 15, str(number))
    c.setFillColor(LAVENDER); c.roundRect(M + 28, y - 22, W - 2*M - 28, 22, 5, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 10.5); c.drawString(M + 38, y - 15, title)
    return y - 31


def text_field(c, name, label, y, height=19, multiline=False):
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 8.2); c.drawString(M, y, label)
    field_y = y - height - 4
    c.acroForm.textfield(name=name, tooltip=label, x=M, y=field_y, width=W - 2*M, height=height, borderStyle="solid", borderColor=LILAC, borderWidth=.8, fillColor=white, textColor=TEXT, forceBorder=True, fontName="Helvetica", fontSize=8, fieldFlags=4096 if multiline else 0)
    return field_y - 10


def pair(c, left, right, y):
    gap, width = 14, (W - 2*M - 14) / 2
    for idx, (name, label) in enumerate((left, right)):
        x = M + idx * (width + gap)
        c.setFillColor(DARK); c.setFont("Helvetica-Bold", 8.2); c.drawString(x, y, label)
        c.acroForm.textfield(name=name, tooltip=label, x=x, y=y - 23, width=width, height=19, borderStyle="solid", borderColor=LILAC, borderWidth=.8, fillColor=white, textColor=TEXT, forceBorder=True, fontName="Helvetica", fontSize=8)
    return y - 34


def check(c, name, label, x, y):
    c.acroForm.checkbox(name=name, tooltip=label, x=x, y=y - 3, size=10, buttonStyle="check", borderColor=PURPLE, fillColor=white, textColor=PURPLE, forceBorder=True)
    c.setFillColor(TEXT); c.setFont("Helvetica", 8); c.drawString(x + 15, y, label)


def check_row(c, prefix, labels, y):
    for idx, label in enumerate(labels):
        check(c, f"{prefix}_{idx + 1}", label, M + (idx % 3) * 170, y - (idx // 3) * 17)
    return y - ((len(labels) + 2) // 3) * 17 - 4


def evidence(c, evidence_items, y):
    c.setFillColor(PURPLE); c.rect(M, y - 19, W - 2*M, 19, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 4, y - 13, "Evidence / document")
    c.drawString(M + 235, y - 13, "Held")
    c.drawString(M + 280, y - 13, "Attached")
    c.drawString(M + 343, y - 13, "Reference, date or file name")
    y -= 19
    for idx, item in enumerate(evidence_items):
        row_h = 32
        c.setStrokeColor(LILAC); c.setFillColor(white); c.rect(M, y-row_h, W-2*M, row_h, fill=1, stroke=1)
        c.setFillColor(DARK); c.setFont("Helvetica", 7.5)
        for j, line in enumerate(lines(item, "Helvetica", 7.5, 212)[:2]): c.drawString(M+4, y-11-j*9, line)
        check(c, f"evidence_{idx+1}_held", "", M+241, y-16)
        check(c, f"evidence_{idx+1}_attached", "", M+292, y-16)
        c.acroForm.textfield(name=f"evidence_{idx+1}_reference", tooltip=f"{item} reference", x=M+337, y=y-row_h+4, width=185, height=row_h-8, borderStyle="underlined", borderColor=white, borderWidth=0, fillColor=white, textColor=TEXT, forceBorder=False, fontName="Helvetica", fontSize=7.5)
        y -= row_h
    return y


def create_form(config):
    slug, title, status, notice, prompts, evidence_items = config
    output = PACK_DIR / f"{slug}.pdf"
    c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
    draw_header(c, title, 1)
    y = title_block(c, title, status, notice, H-78)
    y = section(c, y, 1, "Landlord, property and tenancy")
    y = pair(c, ("landlord_name", "Landlord full name"), ("landlord_contact", "Email / telephone"), y)
    y = text_field(c, "property_address", "Rental property address", y)
    y = pair(c, ("tenancy_start", "Tenancy start date"), ("tenant_names", "All named tenants"), y)
    y = text_field(c, "case_summary", "Brief factual summary of why this ground may apply", y, height=48, multiline=True)
    y = section(c, y, 2, "Ground-specific eligibility questions")
    for index, prompt in enumerate(prompts):
        y = text_field(c, f"eligibility_{index+1}", prompt, y, height=37, multiline=True)
    c.showPage()
    draw_header(c, title, 2)
    y = H-78
    y = section(c, y, 3, "Evidence checklist")
    c.setFillColor(MUTED); c.setFont("Helvetica", 8.1); c.drawString(M, y, "Tick the material held and attached. Use the reference box to identify the actual file, date or document source.")
    y -= 11
    y = evidence(c, evidence_items, y)
    y = section(c, y-13, 4, "Timeline, notice facts and declaration")
    y = text_field(c, "timeline", "Key events and dates in chronological order", y, height=48, multiline=True)
    y = text_field(c, "tenant_response", "Tenant response, possible defence, safeguarding issue or other relevant information", y, height=38, multiline=True)
    y = pair(c, ("notice_served", "Has any notice already been served? Give date / method"), ("service_evidence", "Proof of service held"), y)
    y = check_row(c, "declaration", ["Facts are true to the best of my knowledge", "I have authority to share these documents", "I understand this is not legal advice or representation"], y)
    y = pair(c, ("signature", "Landlord signature (type full name)"), ("signature_date", "Date"), y)
    c.save()
    reader = PdfReader(str(output))
    fields = reader.get_fields() or {}
    if len(reader.pages) != 2:
        raise RuntimeError(f"Page verification failed for {output.name}: expected 2 pages")
    if not {"landlord_name", "case_summary", "eligibility_1", "timeline", "signature"}.issubset(fields):
        raise RuntimeError(f"Field verification failed for {output.name}")
    return output


def main():
    PACK_DIR.mkdir(parents=True, exist_ok=True)
    forms = [create_form(config) for config in GROUND_FORMS]
    if EXISTING.exists():
        target = PACK_DIR / "21-grounds-7a-12-and-14-serious-antisocial-behaviour.pdf"
        target.write_bytes(EXISTING.read_bytes())
        forms.append(target)
    readme = PACK_DIR / "00-READ-ME.txt"
    readme.write_text(
        "Landlord Heaven - England possession-ground evidence questionnaires\n\n"
        "This pack contains fillable evidence questionnaires covering the current England possession grounds.\n"
        "Closely related statutory routes are grouped only where their evidence collection overlaps.\n"
        "Each questionnaire is for fact-gathering and document preparation; it is not legal advice, does not select a ground and does not guarantee a court outcome.\n"
        "Check the current official form, notice rules and eligibility before service.\n",
        encoding="utf-8",
    )
    with ZipFile(ZIP_OUTPUT, "w", ZIP_DEFLATED) as archive:
        for path in sorted(PACK_DIR.iterdir()):
            archive.write(path, path.name)
    print(f"Created {len(forms)} editable PDFs plus read-me.")
    print(ZIP_OUTPUT)


if __name__ == "__main__":
    main()
