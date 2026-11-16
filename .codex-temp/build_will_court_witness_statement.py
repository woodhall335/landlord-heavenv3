from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


OUTPUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\Updated Court Pack - 09 Nov 2026\07A-witness-statement-William-Mumford-complete-sign-and-file.docx")


def set_cell_borders(cell, value="nil", color="FFFFFF", size="0"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.find(qn("w:tcBorders"))
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), value)
        el.set(qn("w:sz"), size)
        el.set(qn("w:color"), color)


def set_cell_margins(cell, top=45, start=45, bottom=45, end=45):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.find(qn("w:tcMar"))
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def add_sdt(paragraph, tag, prompt):
    sdt = OxmlElement("w:sdt")
    sdt_pr = OxmlElement("w:sdtPr")
    alias = OxmlElement("w:alias")
    alias.set(qn("w:val"), tag.replace("_", " ").title())
    tag_el = OxmlElement("w:tag")
    tag_el.set(qn("w:val"), tag)
    text_el = OxmlElement("w:text")
    sdt_pr.extend([alias, tag_el, text_el])
    content = OxmlElement("w:sdtContent")
    run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    colour = OxmlElement("w:color")
    colour.set(qn("w:val"), "6B6B6B")
    italic = OxmlElement("w:i")
    rpr.extend([colour, italic])
    text = OxmlElement("w:t")
    text.set(qn("xml:space"), "preserve")
    text.text = prompt
    run.extend([rpr, text])
    content.append(run)
    sdt.extend([sdt_pr, content])
    paragraph._p.append(sdt)


def add_page_field(paragraph):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, end])


def add_heading(doc, text):
    p = doc.add_paragraph(text, style="Heading 1")
    p.paragraph_format.keep_with_next = True
    return p


def add_numbered(doc, number, fixed_before="", tag=None, prompt=None, fixed_after=""):
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Cm(0.9)
    table.columns[1].width = Cm(13.7)
    tbl_pr = table._tbl.tblPr
    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")
    left, right = table.rows[0].cells
    left.width = Cm(0.9)
    right.width = Cm(13.7)
    for cell in (left, right):
        set_cell_borders(cell)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    lp = left.paragraphs[0]
    lp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    lp.paragraph_format.space_after = Pt(0)
    lp.add_run(f"{number}.")
    rp = right.paragraphs[0]
    rp.paragraph_format.space_after = Pt(7)
    if fixed_before:
        rp.add_run(fixed_before)
    if tag:
        add_sdt(rp, tag, prompt or "[type here]")
    if fixed_after:
        rp.add_run(fixed_after)
    return table


def add_incident(doc, incident_number, paragraph_number):
    add_heading(doc, f"Incident {incident_number}")
    add_numbered(
        doc,
        paragraph_number,
        "On ",
        f"incident_{incident_number}_date_time",
        "[date and approximate time]",
        ", I was at ",
    )
    # Add the location and persons to the same numbered paragraph as a continuation.
    p = doc.tables[-1].rows[0].cells[1].paragraphs[0]
    add_sdt(p, f"incident_{incident_number}_location", "[exact location]")
    p.add_run(". The other people present were ")
    add_sdt(p, f"incident_{incident_number}_present", "[names or state that nobody else was present]")
    p.add_run(".")
    paragraph_number += 1
    add_numbered(
        doc,
        paragraph_number,
        "What I personally saw, heard or smelled was: ",
        f"incident_{incident_number}_observation",
        "[describe the event fully in your own words]",
        ".",
    )
    paragraph_number += 1
    add_numbered(
        doc,
        paragraph_number,
        "I connect this incident to Flat 7, Rebecca Mumford, an occupant or an animal kept there because: ",
        f"incident_{incident_number}_link",
        "[give the factual basis and say if anything is uncertain]",
        ".",
    )
    paragraph_number += 1
    add_numbered(
        doc,
        paragraph_number,
        "The effect of the incident was: ",
        f"incident_{incident_number}_effect",
        "[describe the effect on you, neighbours, communal areas, repairs or safety]",
        ".",
    )
    paragraph_number += 1
    add_numbered(
        doc,
        paragraph_number,
        "The record or supporting material for this incident is ",
        f"incident_{incident_number}_record",
        "[identify the photograph, message, email, diary entry or witness]",
        ". I refer to it at exhibit WM1, page(s) ",
    )
    p = doc.tables[-1].rows[0].cells[1].paragraphs[0]
    add_sdt(p, f"incident_{incident_number}_wm1_pages", "[page number or state none]")
    p.add_run(".")
    return paragraph_number + 1


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(3.5)
    section.right_margin = Cm(2.0)

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.space_after = Pt(6)
    title = doc.styles["Title"]
    title.font.name = "Arial"
    title.font.size = Pt(15)
    title.font.bold = True
    title.font.color.rgb = RGBColor(0, 0, 0)
    title.paragraph_format.space_after = Pt(10)
    ppr = title._element.get_or_add_pPr()
    border = ppr.find(qn("w:pBdr"))
    if border is not None:
        ppr.remove(border)
    h1 = doc.styles["Heading 1"]
    h1.font.name = "Arial"
    h1.font.size = Pt(11)
    h1.font.bold = True
    h1.font.color.rgb = RGBColor(0, 0, 0)
    h1.paragraph_format.space_before = Pt(10)
    h1.paragraph_format.space_after = Pt(5)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fp.add_run("Claim no. ")
    add_sdt(fp, "footer_claim_number", "[insert when issued]")
    fp.add_run("   |   WM   |   Page ")
    add_page_field(fp)
    for r in fp.runs:
        r.font.size = Pt(8)

    meta = doc.add_table(rows=5, cols=2)
    meta.alignment = WD_TABLE_ALIGNMENT.RIGHT
    meta.autofit = False
    meta.columns[0].width = Cm(4.0)
    meta.columns[1].width = Cm(4.0)
    meta_data = [
        ("For", "Claimants"),
        ("Witness", "William Mumford"),
        ("Statement", "First"),
        ("Exhibit", "WM1"),
        ("Date made", None),
    ]
    for row, (label, value) in zip(meta.rows, meta_data):
        for cell in row.cells:
            set_cell_borders(cell)
            set_cell_margins(cell, top=20, bottom=20)
        row.cells[0].paragraphs[0].add_run(label).bold = True
        if value:
            row.cells[1].paragraphs[0].add_run(value)
        else:
            add_sdt(row.cells[1].paragraphs[0], "date_made", "[date signed]")

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("IN THE BRISTOL COUNTY COURT AND FAMILY COURT")
    r.bold = True
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p2.add_run("Claim number: ").bold = True
    add_sdt(p2, "claim_number", "[insert when issued]")

    parties = doc.add_table(rows=4, cols=2)
    parties.alignment = WD_TABLE_ALIGNMENT.CENTER
    parties.autofit = False
    parties.columns[0].width = Cm(11.5)
    parties.columns[1].width = Cm(3.0)
    party_rows = [
        ("BETWEEN", ""),
        ("WILLIAM MUMFORD AND LEANNE MUMFORD", "Claimants"),
        ("and", ""),
        ("REBECCA MUMFORD", "Defendant"),
    ]
    for idx, (left_text, right_text) in enumerate(party_rows):
        for cell in parties.rows[idx].cells:
            set_cell_borders(cell)
            set_cell_margins(cell, top=30, bottom=30)
        parties.cell(idx, 0).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = parties.cell(idx, 0).paragraphs[0].add_run(left_text)
        if idx in (1, 3):
            run.bold = True
        parties.cell(idx, 1).paragraphs[0].add_run(right_text)

    title_p = doc.add_paragraph("Witness Statement of William Mumford", style="Title")
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    n = 1
    add_numbered(doc, n, "I am William Mumford of ", "home_address", "[full home address]", ". My occupation is ")
    p = doc.tables[-1].rows[0].cells[1].paragraphs[0]
    add_sdt(p, "occupation", "[occupation or description]")
    p.add_run(". I am the First Claimant and one of the joint landlords of Flat 7 Machin Mews, Standfast Road, Henbury, Bristol, BS10 7HJ (the Property).")
    n += 1
    add_numbered(doc, n, "This statement was prepared ", "preparation_method", "[state whether completed personally, face to face, by telephone or with typing assistance]", ". The words and evidence are my own. Any typing or other assistance was provided by ")
    p = doc.tables[-1].rows[0].cells[1].paragraphs[0]
    add_sdt(p, "preparation_assistance", "[name and nature of assistance, or state none]")
    p.add_run(".")
    n += 1
    add_numbered(doc, n, "Except where I state otherwise, the facts in this statement are within my own knowledge. Where I refer to information or belief, I identify the source.")
    n += 1

    add_heading(doc, "Tenancy and notice")
    add_numbered(doc, n, "Rebecca Mumford entered into a written tenancy agreement for the Property dated 1 April 2024 at a rent of GBP 850 per calendar month. The agreement records that no deposit was taken. The fixed term ended on 31 March 2025 and the tenancy continued periodically. I refer to the tenancy agreement at exhibit WM1, pages 16 to 19.")
    n += 1
    add_numbered(doc, n, "A Form 3A notice dated 22 June 2026 was served on Rebecca Mumford with continuation sheets. The notice referred to Grounds 13 and 14. This claim relies on Ground 14 only. I refer to the notice at exhibit WM1, pages 3 to 15.")
    n += 1
    add_numbered(doc, n, "My personal involvement in service of the notice was: ", "service_personal_involvement", "[state exactly what you did, or state that you did not personally serve it]", ". The actual date, time and method of service were ")
    p = doc.tables[-1].rows[0].cells[1].paragraphs[0]
    add_sdt(p, "service_details", "[complete from personal knowledge and the N215; do not guess]")
    p.add_run(". The contemporaneous proof of service is ")
    add_sdt(p, "service_evidence", "[identify record and WM1 page, or state none]")
    p.add_run(".")
    n += 1
    add_numbered(doc, n, "I make this statement to describe the nuisance or annoyance I personally observed, the information and records received by the landlords, the steps taken to address the conduct, its continuing effect, and why I seek possession under Ground 14.")
    n += 1

    for incident in range(1, 7):
        if incident > 1:
            doc.add_page_break()
        n = add_incident(doc, incident, n)

    doc.add_page_break()
    add_heading(doc, "Continuing behaviour and warnings")
    add_numbered(doc, n, "The behaviour that has continued since 22 June 2026 is: ", "continuing_behaviour", "[summarise only what you personally know and refer to incident paragraph numbers]", ".")
    n += 1
    add_numbered(doc, n, "The most recent incident I personally witnessed was on ", "most_recent_incident", "[date, time, location and brief description]", ".")
    n += 1
    add_numbered(doc, n, "The warnings or requests I personally gave Rebecca Mumford were: ", "warnings", "[give dates, method, what you said, her response and what happened next]", ".")
    n += 1
    add_numbered(doc, n, "The managing agent's warning was communicated to Rebecca Mumford as follows: ", "agent_warning", "[state who sent it, when, how and the supporting record; if unknown, say so]", ". I refer to the managing-agent material at exhibit WM1, pages 20 to 21.")
    n += 1
    add_numbered(doc, n, "Other practical steps attempted before seeking possession were: ", "alternatives", "[access requests, cleaning proposals, repairs, meetings, mediation or relevant services]", ".")
    n += 1

    add_heading(doc, "Access repairs and contractors")
    add_numbered(doc, n, "The access requests within my personal knowledge were: ", "access_requests", "[dates, purpose, person making request, response and whether access occurred]", ".")
    n += 1
    add_numbered(doc, n, "During inspections or contractor visits I personally observed: ", "visit_observations", "[describe only what you personally observed]", ".")
    n += 1
    add_numbered(doc, n, "The information supplied to me by contractors or the managing agent was: ", "contractor_information", "[identify each person or organisation, date, method and substance]", ". I rely on that information as information supplied by those sources. The relevant records are at exhibit WM1, pages 20 to 25.")
    n += 1

    doc.add_page_break()
    add_heading(doc, "Complaints and documentary evidence")
    add_numbered(doc, n, "The complaints supplied to the landlords were: ", "complaints_received", "[identify each complainant if known, date, method and what was reported]", ". Where I did not witness the underlying event, I rely on the complaint as information supplied by that person.")
    n += 1
    add_numbered(doc, n, "The Flat 8 complaint reports persistent cat-faeces odour, faeces in the communal hallway, flies and smell entering Flat 8. The retained copy does not display the author's identity or date. I refer to it at exhibit WM1, pages 26 to 27 and rely on it subject to those limitations.")
    n += 1
    add_numbered(doc, n, "The undated property-condition photograph at exhibit WM1, pages 28 to 29 is relied on only as limited background because its date and maker are not established by the image itself.")
    n += 1
    add_numbered(doc, n, "The people who may be able to give direct evidence are: ", "possible_witnesses", "[names, contact details, what each witnessed and whether each has agreed to sign or attend]", ".")
    n += 1

    add_heading(doc, "Effect and reasonableness")
    add_numbered(doc, n, "The effect I personally observed on neighbours or the communal areas was: ", "effect_on_neighbours", "[describe personal observations and distinguish any reported effect]", ".")
    n += 1
    add_numbered(doc, n, "The hygiene, safety or property risks I personally observed were: ", "risks", "[describe the risk and when it was observed]", ".")
    n += 1
    add_numbered(doc, n, "The effect on management, repairs, cleaning or costs was: ", "management_effect", "[identify facts and supporting invoices or records]", ".")
    n += 1
    add_numbered(doc, n, "I believe the behaviour is likely to continue or be repeated because: ", "likely_to_continue", "[give facts, including repetition and response to warnings]", ".")
    n += 1
    add_numbered(doc, n, "I say that making a possession order is reasonable because: ", "reasonableness", "[explain the history, repetition, seriousness, effect, warnings and unsuccessful alternatives]", ".")
    n += 1

    doc.add_page_break()
    add_heading(doc, "Other matters relevant to the court")
    add_numbered(doc, n, "So far as I am aware, any disability, illness, vulnerability or support need affecting Rebecca Mumford or an occupant is: ", "vulnerability", "[state what you know, the source and steps taken; do not diagnose anyone]", ".")
    n += 1
    add_numbered(doc, n, "The disrepair, harassment, discrimination or other complaints raised by Rebecca Mumford are: ", "tenant_complaints", "[give dates, what was raised and the response or repair action; state none if none]", ".")
    n += 1
    add_numbered(doc, n, "The involvement of the council, police, environmental health, social services or another agency is: ", "agency_involvement", "[identify agency, reference number, dates, contact and outcome; state none if none]", ".")
    n += 1
    add_numbered(doc, n, "Any other fact that I ask the Court to take into account is: ", "other_relevant_facts", "[relevant facts only, with the source identified]", ".")
    n += 1

    add_heading(doc, "Exhibit WM1")
    add_numbered(doc, n, "I refer to the paginated composite exhibit marked WM1. It contains the notice, tenancy documents, management and contractor records, the Flat 8 complaint, the retained photograph and the compliance documents identified in its index. I identify the source and limitations of each document in this statement. Any additional document added before signature must be listed in the WM1 index and given a final page number.")
    n += 1

    add_heading(doc, "Statement of truth")
    truth = doc.add_paragraph()
    truth.paragraph_format.space_before = Pt(5)
    truth.paragraph_format.space_after = Pt(12)
    tr = truth.add_run(
        "I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth."
    )
    tr.bold = True

    sig = doc.add_table(rows=3, cols=2)
    sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig.autofit = False
    sig.columns[0].width = Cm(9.5)
    sig.columns[1].width = Cm(5.0)
    for row in sig.rows:
        for cell in row.cells:
            set_cell_borders(cell)
            set_cell_margins(cell, top=50, bottom=50)
    sig.cell(0, 0).paragraphs[0].add_run("Signed by William Mumford").bold = True
    sig.cell(0, 1).paragraphs[0].add_run("Date").bold = True
    add_sdt(sig.cell(1, 0).paragraphs[0], "signature", "[sign only after every placeholder has been replaced or deleted]")
    add_sdt(sig.cell(1, 1).paragraphs[0], "signature_date", "[date signed]")
    sig.cell(2, 0).paragraphs[0].add_run("William Mumford")

    props = doc.core_properties
    props.title = "Witness Statement of William Mumford"
    props.subject = "Ground 14 possession proceedings concerning Flat 7 Machin Mews"
    props.author = "William Mumford"
    props.last_modified_by = "William Mumford"
    props.comments = ""

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
