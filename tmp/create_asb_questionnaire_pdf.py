from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth
from pypdf import PdfReader


ROOT = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3")
OUTPUT = ROOT / "output" / "pdf" / "landlord-heaven-serious-antisocial-behaviour-questionnaire.pdf"
LOGO = ROOT / "public" / "images" / "logo.png"

PAGE_W, PAGE_H = A4
MARGIN = 36
DARK = HexColor("#20103F")
PURPLE = HexColor("#6D28D9")
LAVENDER = HexColor("#F5F1FF")
LILAC = HexColor("#E8E1F8")
TEXT = HexColor("#3B3550")
MUTED = HexColor("#675F7D")
RED = HexColor("#9F1239")
PALE_RED = HexColor("#FFF1F2")


def wrap_lines(text, font, size, width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


class FormBuilder:
    def __init__(self):
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        self.canvas = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
        self.page = 1
        self.total_pages = 4
        self.logo = ImageReader(str(LOGO)) if LOGO.exists() else None

    def header(self, label):
        c = self.canvas
        c.setStrokeColor(LILAC)
        c.setLineWidth(0.7)
        c.line(MARGIN, PAGE_H - 50, PAGE_W - MARGIN, PAGE_H - 50)
        if self.logo:
            c.drawImage(self.logo, MARGIN, PAGE_H - 39, width=178, height=26, preserveAspectRatio=True, mask="auto")
        else:
            c.setFillColor(PURPLE)
            c.setFont("Helvetica-Bold", 16)
            c.drawString(MARGIN, PAGE_H - 30, "LANDLORD HEAVEN")
        c.setFillColor(PURPLE)
        c.setFont("Helvetica-Bold", 7.7)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 25, label.upper())
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 36, "England possession evidence questionnaire")

    def footer(self):
        c = self.canvas
        c.setStrokeColor(LILAC)
        c.setLineWidth(0.7)
        c.line(MARGIN, 31, PAGE_W - MARGIN, 31)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(MARGIN, 18, "Landlord Heaven | Confidential document-preparation questionnaire")
        c.drawRightString(PAGE_W - MARGIN, 18, f"Page {self.page} of {self.total_pages}")

    def next_page(self, label):
        self.footer()
        self.canvas.showPage()
        self.page += 1
        self.header(label)

    def title(self, title, subtitle):
        c = self.canvas
        y = PAGE_H - 78
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 21)
        c.drawString(MARGIN, y, title)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9.5)
        for idx, line in enumerate(wrap_lines(subtitle, "Helvetica", 9.5, PAGE_W - 2 * MARGIN)):
            c.drawString(MARGIN, y - 18 - idx * 12, line)
        return y - 35

    def callout(self, y, heading, body, fill=LAVENDER, heading_color=PURPLE):
        c = self.canvas
        lines = wrap_lines(body, "Helvetica", 8.7, PAGE_W - 2 * MARGIN - 22)
        height = 22 + len(lines) * 11
        c.setFillColor(fill)
        c.setStrokeColor(LILAC)
        c.roundRect(MARGIN, y - height, PAGE_W - 2 * MARGIN, height, 7, fill=1, stroke=1)
        c.setFillColor(heading_color)
        c.setFont("Helvetica-Bold", 9.2)
        c.drawString(MARGIN + 11, y - 14, heading)
        c.setFillColor(TEXT)
        c.setFont("Helvetica", 8.7)
        for idx, line in enumerate(lines):
            c.drawString(MARGIN + 11, y - 27 - idx * 11, line)
        return y - height - 9

    def section_heading(self, y, number, text):
        c = self.canvas
        c.setFillColor(PURPLE)
        c.roundRect(MARGIN, y - 23, 24, 23, 5, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(MARGIN + 12, y - 15.5, str(number))
        c.setFillColor(LAVENDER)
        c.roundRect(MARGIN + 29, y - 23, PAGE_W - 2 * MARGIN - 29, 23, 5, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN + 39, y - 15.5, text)
        return y - 32

    def note(self, y, text):
        c = self.canvas
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8.4)
        for idx, line in enumerate(wrap_lines(text, "Helvetica", 8.4, PAGE_W - 2 * MARGIN)):
            c.drawString(MARGIN, y - idx * 10.5, line)
        return y - len(wrap_lines(text, "Helvetica", 8.4, PAGE_W - 2 * MARGIN)) * 10.5 - 5

    def field(self, name, label, y, width=None, value_hint="", multiline=False, height=19):
        c = self.canvas
        width = width or PAGE_W - 2 * MARGIN
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(MARGIN, y, label)
        field_y = y - height - 4
        flags = 4096 if multiline else 0
        c.acroForm.textfield(
            name=name,
            tooltip=label,
            x=MARGIN,
            y=field_y,
            width=width,
            height=height,
            borderStyle="solid",
            borderColor=LILAC,
            borderWidth=0.8,
            fillColor=white,
            textColor=TEXT,
            forceBorder=True,
            fontName="Helvetica",
            fontSize=8.5,
            fieldFlags=flags,
            value=value_hint,
        )
        return field_y - 12

    def two_fields(self, left_name, left_label, right_name, right_label, y, split=0.5):
        full = PAGE_W - 2 * MARGIN
        gap = 14
        left_width = (full - gap) * split
        right_width = full - gap - left_width
        c = self.canvas
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(MARGIN, y, left_label)
        c.drawString(MARGIN + left_width + gap, y, right_label)
        field_y = y - 23
        for name, label, x, width in ((left_name, left_label, MARGIN, left_width), (right_name, right_label, MARGIN + left_width + gap, right_width)):
            c.acroForm.textfield(
                name=name, tooltip=label, x=x, y=field_y, width=width, height=19,
                borderStyle="solid", borderColor=LILAC, borderWidth=0.8, fillColor=white,
                textColor=TEXT, forceBorder=True, fontName="Helvetica", fontSize=8.5,
            )
        return field_y - 12

    def checkboxes(self, prefix, label, options, y, columns=2):
        c = self.canvas
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(MARGIN, y, label)
        y -= 18
        column_width = (PAGE_W - 2 * MARGIN) / columns
        for idx, option in enumerate(options):
            col = idx % columns
            row = idx // columns
            x = MARGIN + col * column_width
            yy = y - row * 18
            c.acroForm.checkbox(
                name=f"{prefix}_{idx + 1}", tooltip=option, x=x, y=yy - 2,
                size=11, buttonStyle="check", borderColor=PURPLE, fillColor=white,
                textColor=PURPLE, forceBorder=True,
            )
            c.setFillColor(TEXT)
            c.setFont("Helvetica", 8.4)
            c.drawString(x + 16, yy + 1, option)
        rows = (len(options) + columns - 1) // columns
        return y - rows * 18 - 5

    def evidence_table(self, y):
        c = self.canvas
        columns = [
            ("Evidence / document", 140), ("Held", 38), ("Attached", 48),
            ("Reference / file name", 146), ("Notes", 151),
        ]
        x = MARGIN
        row_h = 35
        for header, width in columns:
            c.setFillColor(PURPLE)
            c.rect(x, y - 20, width, 20, fill=1, stroke=0)
            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 7.5)
            c.drawString(x + 4, y - 13, header)
            x += width
        items = [
            "Police crime reference / report", "Charge, conviction, bail or court document",
            "CBO, IPNA, closure order or other order", "Witness statement or incident diary",
            "CCTV, doorbell footage, photograph or video", "Tenant, neighbour or agent correspondence",
            "Tenancy agreement and relevant clause", "Previous warning or breach notice",
        ]
        y -= 20
        for index, item in enumerate(items):
            x = MARGIN
            for col_index, (_, width) in enumerate(columns):
                c.setStrokeColor(LILAC)
                c.setFillColor(white)
                c.rect(x, y - row_h, width, row_h, fill=1, stroke=1)
                if col_index == 0:
                    c.setFillColor(DARK)
                    c.setFont("Helvetica", 7.5)
                    lines = wrap_lines(item, "Helvetica", 7.5, width - 8)
                    for line_index, line in enumerate(lines[:3]):
                        c.drawString(x + 4, y - 11 - line_index * 9, line)
                elif col_index in (1, 2):
                    c.acroForm.checkbox(
                        name=f"evidence_{index + 1}_{'held' if col_index == 1 else 'attached'}",
                        tooltip=f"{item} - {'held' if col_index == 1 else 'attached'}",
                        x=x + (width - 11) / 2, y=y - 22, size=11, buttonStyle="check",
                        borderColor=PURPLE, fillColor=white, textColor=PURPLE, forceBorder=True,
                    )
                else:
                    c.acroForm.textfield(
                        name=f"evidence_{index + 1}_{'reference' if col_index == 3 else 'notes'}",
                        tooltip=f"{item} - {'reference / file name' if col_index == 3 else 'notes'}",
                        x=x + 3, y=y - row_h + 4, width=width - 6, height=row_h - 8,
                        borderStyle="underlined", borderColor=white, borderWidth=0,
                        fillColor=white, textColor=TEXT, forceBorder=False,
                        fontName="Helvetica", fontSize=7.5,
                    )
                x += width
            y -= row_h
        return y - 8

    def declaration(self, y, statement, number):
        c = self.canvas
        c.acroForm.checkbox(
            name=f"declaration_{number}", tooltip=statement, x=MARGIN, y=y - 7,
            size=12, buttonStyle="check", borderColor=PURPLE, fillColor=white,
            textColor=PURPLE, forceBorder=True,
        )
        c.setFillColor(TEXT)
        c.setFont("Helvetica", 8.7)
        lines = wrap_lines(statement, "Helvetica", 8.7, PAGE_W - 2 * MARGIN - 20)
        for idx, line in enumerate(lines):
            c.drawString(MARGIN + 18, y - idx * 11, line)
        return y - len(lines) * 11 - 8

    def build(self):
        self.header("Serious incident questionnaire")
        y = self.title(
            "Serious antisocial behaviour and violence",
            "Editable landlord questionnaire for fact-gathering before a potential Section 8 possession case in England.",
        )
        y = self.callout(
            y,
            "IMMEDIATE SAFETY",
            "If there is an immediate danger, call 999. Do not confront the tenant, change locks, remove belongings or take any self-help eviction step. A court decides whether possession is granted.",
            PALE_RED,
            RED,
        )
        y = self.callout(
            y,
            "HOW TO USE THIS FORM",
            "Complete the white fields, tick the applicable boxes and attach readable copies of the evidence. Give facts, identify the source of information, and do not alter original material. This is a document-preparation questionnaire, not legal advice.",
        )
        y = self.section_heading(y, 1, "Landlord, property and tenancy details")
        y = self.two_fields("landlord_name", "Landlord full name", "landlord_phone", "Telephone number", y)
        y = self.two_fields("landlord_email", "Email address", "managing_agent", "Letting / managing agent (if any)", y)
        y = self.field("property_address", "Rental property address", y)
        y = self.two_fields("tenancy_start", "Tenancy start date", "named_tenants", "All named tenants", y)
        y = self.field("current_occupants", "Who is currently living at or regularly staying at the property?", y, multiline=True, height=34)

        self.next_page("Incident details")
        y = PAGE_H - 78
        y = self.section_heading(y, 2, "Incident details")
        y = self.note(y, "Complete this section for the most serious incident. Add a separate continuation sheet for each further incident.")
        y = self.two_fields("incident_date", "Incident date", "incident_time", "Approximate time", y)
        y = self.field("incident_location", "Location (property address, nearby location or other place)", y)
        y = self.checkboxes("incident_source", "How did you learn about the incident?", ["I saw or heard it", "Police informed me", "Witness informed me", "Other source"], y)
        y = self.field("people_involved", "People involved (full names where known; otherwise explain how identified)", y, multiline=True, height=34)
        y = self.field("victim_affected", "Victim / affected person (only include necessary information)", y)
        y = self.field("chronology", "Factual chronology: what happened, who did what and what you personally observed", y, multiline=True, height=90)
        y = self.checkboxes("locality_connection", "How does the incident connect to the tenancy or locality?", ["At the property", "Affected a neighbour", "Affected the local area", "Connection unclear"], y)
        y = self.field("connection_explained", "Explain the effect on the property, people in the locality or management of the tenancy", y, multiline=True, height=44)

        self.next_page("Police and evidence")
        y = PAGE_H - 78
        y = self.section_heading(y, 3, "Police, criminal and court information")
        y = self.callout(y, "IMPORTANT", "A serious allegation alone does not establish Ground 7A. If there is a conviction, relevant order or closure order, attach a readable copy. If an investigation is ongoing, record that accurately rather than guessing the outcome.")
        y = self.two_fields("police_force", "Police force / station", "crime_reference", "Crime or incident reference", y)
        y = self.two_fields("officer_contact", "Officer name / contact (if known)", "reported_date", "Date reported to police", y)
        y = self.checkboxes("criminal_status", "Current criminal position", ["Arrest", "Charge", "Bail", "Conviction", "Ongoing / unknown"], y, columns=3)
        y = self.checkboxes("relevant_order", "Relevant order (if any)", ["Criminal behaviour order", "IPNA", "Closure order", "Other order", "None / unknown"], y, columns=3)
        y = self.field("criminal_details", "Offence, order, hearing date, outcome and any condition relating to the property", y, multiline=True, height=47)
        y = self.section_heading(y, 4, "Evidence checklist")
        y = self.note(y, "Tick what you hold and attach. Use the reference and notes boxes to identify the actual document, date, file name or source.")
        self.evidence_table(y)

        self.next_page("Case facts and declaration")
        y = PAGE_H - 78
        y = self.section_heading(y, 5, "Tenancy breach, warnings and current risk")
        y = self.checkboxes("breach_status", "Does the tenancy agreement prohibit the conduct or nuisance?", ["Yes", "No", "Not sure - attach agreement"], y, columns=3)
        y = self.checkboxes("warnings_status", "Have warnings or breach letters already been sent?", ["Yes - attach", "No", "Not sure"], y, columns=3)
        y = self.field("previous_history", "Earlier complaints, warnings, incidents and the tenant's response", y, multiline=True, height=58)
        y = self.field("current_risk", "Current safety or management risk, including any witness confidentiality concerns", y, multiline=True, height=45)
        y = self.section_heading(y, 6, "Notice and case-preparation facts")
        y = self.field("notice_address", "Address for serving any notice", y)
        y = self.field("notice_names", "All people to be named on a notice (use exact tenancy-agreement names)", y)
        y = self.checkboxes("served_notice", "Has a Section 8 notice already been served?", ["Yes - attach notice and service evidence", "No"], y)
        y = self.field("prior_service", "If served: date, method and proof of service", y)
        y = self.checkboxes("requested_route", "Documents you want considered for preparation", ["Ground 14 notice", "Ground 7A if qualification is evidenced", "Ground 12 breach ground", "Not sure"], y)
        y = self.field("possible_defence", "Tenant response, disrepair issue, safeguarding issue or other point that may be raised", y, multiline=True, height=42)
        y = self.section_heading(y, 7, "Landlord declaration")
        y = self.declaration(y, "I confirm that the facts given are true to the best of my knowledge and I have identified information reported by another person.", 1)
        y = self.declaration(y, "I have authority to provide the documents and contact details supplied with this questionnaire.", 2)
        y = self.declaration(y, "I understand this is document preparation, not legal advice or court representation, and a court determines any possession claim.", 3)
        y = self.declaration(y, "I understand that I must not use self-help eviction, including changing locks or removing a tenant without the lawful process.", 4)
        y = self.two_fields("signature", "Landlord signature (type full name)", "signature_date", "Date", y, split=0.7)
        self.footer()
        self.canvas.save()


def verify():
    reader = PdfReader(str(OUTPUT))
    fields = reader.get_fields() or {}
    widgets = []
    for page_number, page in enumerate(reader.pages, start=1):
        for annotation_ref in page.get("/Annots", []):
            annotation = annotation_ref.get_object()
            if annotation.get("/Subtype") == "/Widget":
                widgets.append((page_number, annotation.get("/T") or annotation.get("/Parent")))
    expected = {
        "landlord_name", "property_address", "incident_date", "chronology", "crime_reference",
        "evidence_1_held", "evidence_8_notes", "notice_address", "declaration_1", "signature",
    }
    missing = expected - set(fields)
    if missing:
        raise RuntimeError(f"Missing expected form fields: {sorted(missing)}")
    if len(reader.pages) != 4:
        raise RuntimeError(f"Unexpected page count: {len(reader.pages)}")
    if len(widgets) < 60:
        raise RuntimeError(f"Too few interactive widgets: {len(widgets)}")
    print(f"Verified {len(fields)} canonical fields and {len(widgets)} widgets across {len(reader.pages)} pages.")


if __name__ == "__main__":
    FormBuilder().build()
    verify()
    print(OUTPUT)
