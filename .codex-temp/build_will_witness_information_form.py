from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


OUTPUT = Path(r"C:\Users\t_moh\OneDrive\Landlord Heaven Private Cases\Will\Updated Court Pack - 09 Nov 2026\Will Mumford witness statement information form 09 Nov 2026.docx")


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_borders(cell, color="D9D9D9", size="6"):
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
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), size)
        el.set(qn("w:color"), color)


def set_cell_margins(cell, top=110, start=140, bottom=110, end=140):
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


def keep_with_next(paragraph):
    paragraph.paragraph_format.keep_with_next = True


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Page ")
    run.font.size = Pt(8)
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char1, instr_text, fld_char2])


def add_inline_content_control(paragraph, tag, prompt="Click or tap here to enter text"):
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
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "767676")
    italic = OxmlElement("w:i")
    rpr.extend([color, italic])
    txt = OxmlElement("w:t")
    txt.text = prompt
    run.extend([rpr, txt])
    content.append(run)
    sdt.extend([sdt_pr, content])
    paragraph._p.append(sdt)


def add_field(doc, tag, lines=2, prompt="Click or tap here to enter text"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    cell = table.cell(0, 0)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    set_cell_shading(cell, "FAFAFA")
    set_cell_borders(cell)
    set_cell_margins(cell)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    add_inline_content_control(p, tag, prompt)
    for _ in range(max(0, lines - 1)):
        blank = cell.add_paragraph()
        blank.paragraph_format.space_after = Pt(0)
        blank.add_run(" ")
    after = doc.add_paragraph()
    after.paragraph_format.space_after = Pt(1)
    return table


def add_question(doc, question, tag, lines=2, guidance=None, prompt="Click or tap here to enter text"):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    keep_with_next(p)
    r = p.add_run(question)
    r.bold = True
    r.font.size = Pt(10.5)
    if guidance:
        g = doc.add_paragraph(guidance)
        g.paragraph_format.space_after = Pt(4)
        keep_with_next(g)
        for run in g.runs:
            run.italic = True
            run.font.color.rgb = RGBColor(89, 89, 89)
            run.font.size = Pt(9)
    add_field(doc, tag, lines, prompt)


def add_choice(doc, question, tag, options, guidance=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    keep_with_next(p)
    r = p.add_run(question)
    r.bold = True
    r.font.size = Pt(10.5)
    if guidance:
        g = doc.add_paragraph(guidance)
        g.paragraph_format.space_after = Pt(4)
        keep_with_next(g)
        for run in g.runs:
            run.italic = True
            run.font.color.rgb = RGBColor(89, 89, 89)
            run.font.size = Pt(9)
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, "FAFAFA")
    set_cell_borders(cell)
    set_cell_margins(cell)
    p2 = cell.paragraphs[0]
    p2.paragraph_format.space_after = Pt(0)
    p2.add_run("   ".join(f"[ ] {x}" for x in options))
    p2.add_run("    ")
    add_inline_content_control(p2, tag, "Add any explanation here")
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    keep_with_next(p)
    return p


def add_page_break(doc):
    doc.add_page_break()


def add_incident_record(doc, number):
    add_heading(doc, f"Incident {number}", 2)
    table = doc.add_table(rows=2, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    labels = (("Date", f"incident_{number}_date"), ("Approximate time", f"incident_{number}_time"),
              ("Exact location", f"incident_{number}_location"), ("Who else was present", f"incident_{number}_present"))
    for idx, (label, tag) in enumerate(labels):
        cell = table.cell(idx // 2, idx % 2)
        set_cell_borders(cell)
        set_cell_margins(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(label + "\n")
        r.bold = True
        add_inline_content_control(p, tag)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    add_question(doc, "What did you personally see, hear or smell", f"incident_{number}_observation", 4,
                 "Use your own words. Give concrete detail. Do not repeat another person's account here.")
    add_question(doc, "How do you know the incident was connected to Flat 7, Rebecca Mumford, an occupant or an animal kept there", f"incident_{number}_link", 2,
                 "Explain the factual basis. If you are not certain, say so.")
    add_question(doc, "What effect did the incident have at the time", f"incident_{number}_impact", 2)
    add_question(doc, "What record or supporting material exists", f"incident_{number}_evidence", 2,
                 "For example a photograph, video, message, email, diary entry or another person who witnessed it.")


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Cm(1.7)
    section.bottom_margin = Cm(1.6)
    section.left_margin = Cm(1.9)
    section.right_margin = Cm(1.9)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.space_after = Pt(5)
    normal.paragraph_format.line_spacing = 1.08
    title_style = styles["Title"]
    title_style.font.name = "Aptos Display"
    title_style.font.size = Pt(21)
    title_style.font.bold = True
    title_style.font.color.rgb = RGBColor(0, 0, 0)
    title_style.paragraph_format.space_after = Pt(6)
    title_ppr = title_style._element.get_or_add_pPr()
    title_border = title_ppr.find(qn("w:pBdr"))
    if title_border is not None:
        title_ppr.remove(title_border)
    for name, size in (("Heading 1", 14), ("Heading 2", 11.5)):
        st = styles[name]
        st.font.name = "Aptos"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor(0, 0, 0)

    footer = section.footer
    footer_p = footer.paragraphs[0]
    footer_p.text = "Witness statement information form   "
    footer_p.runs[0].font.size = Pt(8)
    footer_p.runs[0].font.color.rgb = RGBColor(89, 89, 89)
    add_page_number(footer_p)

    title = doc.add_paragraph("Will Mumford Witness Statement Information Form", style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    sub = doc.add_paragraph("Possession claim concerning Flat 7 Machin Mews Standfast Road Henbury Bristol BS10 7HJ")
    sub.paragraph_format.space_after = Pt(12)
    sr = sub.runs[0]
    sr.bold = True
    sr.font.size = Pt(11)

    intro = doc.add_paragraph(
        "This form is for Will Mumford to record the facts needed for his own witness statement. "
        "Answer in your own words and include only what you honestly remember. The completed form is not itself the court witness statement and does not contain a statement of truth."
    )
    intro.paragraph_format.space_after = Pt(8)

    add_heading(doc, "How to complete this form", 1)
    instructions = [
        "Record what you personally saw, heard, smelled, did or received.",
        "If an answer is based on something another person told you, name that person and state when and how they told you.",
        "Do not guess. If you cannot remember an exact date or time, say that it is approximate and explain how you estimated it.",
        "Keep original emails, messages, photographs and videos. Do not crop or edit them. Identify each item in the relevant answer.",
        "Describe events factually. Avoid exaggeration, legal conclusions or language you cannot personally support.",
        "If more space is needed, add a separate page and identify the question and incident number."
    ]
    for item in instructions:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(3)
        p.add_run(item)

    add_heading(doc, "Personal details", 1)
    add_question(doc, "Full name", "full_name", 1, prompt="William Mumford")
    add_question(doc, "Home address", "home_address", 2)
    add_question(doc, "Occupation", "occupation", 1)
    add_question(doc, "Telephone number and email address", "contact_details", 1)
    add_question(doc, "Your relationship to Flat 7 and to Rebecca Mumford", "relationship", 2,
                 "State that you are a joint landlord if correct and explain any family relationship only to the extent relevant.")

    add_page_break(doc)
    add_heading(doc, "The tenancy and your involvement", 1)
    add_question(doc, "When did you become an owner or landlord of Flat 7", "landlord_since", 2)
    add_question(doc, "What involvement have you personally had in managing the tenancy", "management_involvement", 4,
                 "Include visits, communications, repairs, complaints and contact with the managing agent.")
    add_question(doc, "Who else has dealt with the tenancy and what did each person do", "others_involved", 3)
    add_question(doc, "Who do you understand currently lives at Flat 7", "occupants", 3,
                 "For each person, state how you know. Separate personal knowledge from information received from someone else.")
    add_question(doc, "What animals do you understand are kept at Flat 7 and how do you know", "animals", 3)

    add_page_break(doc)
    add_heading(doc, "The notice served on 22 June 2026", 1)
    add_choice(doc, "Did you personally serve or take part in serving the Section 8 notice", "served_notice", ["Yes", "No", "Not sure"])
    add_question(doc, "Give the exact date, approximate time, address and method of service", "service_details", 4,
                 "Describe what you personally did. If someone else served it, identify that person and explain how you know what happened.")
    add_question(doc, "Describe every document included in the envelope or delivery", "service_documents", 3,
                 "State the number of pages if known and whether continuation sheets were included.")
    add_question(doc, "What proof of service exists", "service_proof", 2,
                 "For example a photograph, video, witness, delivery receipt, email, message or note made on the day.")

    for n in range(1, 7):
        add_page_break(doc)
        add_heading(doc, "Incidents personally witnessed", 1)
        p = doc.add_paragraph(
            "Use a separate record for each event. Focus especially on events after 22 June 2026 and the most recent events. "
            "If there are more than six incidents, copy an incident page or attach a dated incident diary."
        )
        p.paragraph_format.space_after = Pt(8)
        add_incident_record(doc, n)

    add_page_break(doc)
    add_heading(doc, "Continuing behaviour after 22 June 2026", 1)
    add_question(doc, "What behaviour has continued since the notice was served", "continuing_behaviour", 5,
                 "Summarise only what you personally know. Identify the dates or periods and refer to the incident numbers above.")
    add_question(doc, "When was the most recent incident you personally witnessed", "most_recent_incident", 3)
    add_question(doc, "Has the frequency or seriousness changed over time", "change_over_time", 3,
                 "Explain the factual basis for your answer.")
    add_question(doc, "Why do you believe the behaviour is likely to continue or be repeated", "likely_to_continue", 4,
                 "Give facts rather than assumptions. Include any response to warnings and any repeated pattern.")

    add_page_break(doc)
    add_heading(doc, "Warnings and attempts to resolve matters", 1)
    add_question(doc, "List every warning or request you personally gave to Rebecca Mumford", "warnings_given", 5,
                 "For each, give the date, method, what you said, her response and what happened afterwards.")
    add_question(doc, "Was the managing agent's warning passed to Rebecca Mumford", "agent_warning", 3,
                 "If yes, state who sent it, when, how and what proof exists. If you do not know, say so.")
    add_question(doc, "What practical steps or alternatives to possession have been offered or attempted", "alternatives", 4,
                 "Include access requests, cleaning proposals, repairs, meetings, mediation or contact with relevant services.")

    add_page_break(doc)
    add_heading(doc, "Access repairs and contractors", 1)
    add_question(doc, "List each occasion when access was requested", "access_requests", 5,
                 "Give the date, purpose, who made the request, the response and whether access occurred.")
    add_question(doc, "What did you personally observe during any inspection or contractor visit", "visit_observations", 5)
    add_question(doc, "What did a contractor or electrician tell you", "contractor_information", 4,
                 "Identify the person, the date, how they communicated and the exact substance. Make clear that this is information received from them, not your own observation.")
    add_question(doc, "What work could not be completed and why", "incomplete_work", 3,
                 "State how you know and identify the supporting record.")

    add_page_break(doc)
    add_heading(doc, "Complaints and information from other people", 1)
    add_question(doc, "Identify each person who has complained or supplied information", "complainants", 5,
                 "For each person, give their name and contact details if known, their address or role, the date, how they contacted you and what they reported.")
    add_question(doc, "Which complainants have you spoken to directly", "direct_contact", 3)
    add_question(doc, "Who may be willing to sign a witness statement or attend court", "willing_witnesses", 3,
                 "Do not promise on anyone's behalf. Record only what they have told you.")

    add_page_break(doc)
    add_heading(doc, "Effect of the behaviour", 1)
    add_question(doc, "What effect have you personally observed on neighbours or use of the communal areas", "effect_on_neighbours", 5,
                 "State what you personally observed. If you rely on a complaint, identify the complainant and the source instead.")
    add_question(doc, "What hygiene safety or property risks have you personally observed", "risks", 4)
    add_question(doc, "What effect has the behaviour had on management repairs cleaning or costs", "management_effect", 4,
                 "Identify any invoice, quotation or record supporting a cost.")
    add_question(doc, "Why do you say a possession order is now reasonable", "reasonableness", 5,
                 "Explain the history, repetition, effect, warnings and failed attempts to resolve matters in factual terms.")

    add_page_break(doc)
    add_heading(doc, "Matters the court may need to know", 1)
    add_question(doc, "Are you aware of any disability illness vulnerability or support need affecting Rebecca Mumford or an occupant", "vulnerability", 4,
                 "State only what you know, how you know it and any reasonable step taken in response. Do not diagnose anyone.")
    add_question(doc, "Has Rebecca raised disrepair harassment discrimination or any other complaint against the landlords", "tenant_complaints", 4,
                 "Give dates, what was raised and what response or repair action followed.")
    add_question(doc, "Have the council police environmental health social services or another agency been involved", "agency_involvement", 4,
                 "Identify the agency, reference number, dates, contact person and outcome if known.")

    add_page_break(doc)
    add_heading(doc, "Documents and records to provide", 1)
    checklist = [
        "The complete signed tenancy agreement and any later variations",
        "The complete signed copy of the notice actually served, including every continuation sheet",
        "Proof of service and any note made on the day of service",
        "Original emails with sender, recipient, date, time, subject and full message visible",
        "Complete message threads rather than isolated screenshots",
        "Original photographs and videos with their dates and an explanation of who took them",
        "Incident diary or notes made at or near the time",
        "Managing agent or management company correspondence",
        "Contractor, electrician, cleaner or maintenance records",
        "Council, environmental health, police or other agency correspondence and reference numbers",
        "Invoices, quotations or receipts for relevant cleaning, repair or damage",
        "Names and contact details for anyone who directly witnessed relevant events"
    ]
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    hdr = table.rows[0].cells
    for i, text in enumerate(("Document or record", "Available", "File name or explanation")):
        hdr[i].text = text
        set_cell_shading(hdr[i], "404040")
        set_cell_borders(hdr[i])
        set_cell_margins(hdr[i])
        for run in hdr[i].paragraphs[0].runs:
            run.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
    for idx, item in enumerate(checklist, 1):
        cells = table.add_row().cells
        cells[0].text = item
        cells[1].text = "[ ] Yes   [ ] No"
        p = cells[2].paragraphs[0]
        add_inline_content_control(p, f"checklist_{idx}", "File name or explanation")
        for c in cells:
            set_cell_borders(c)
            set_cell_margins(c, top=80, bottom=80)
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if idx % 2 == 0:
            for c in cells:
                set_cell_shading(c, "F4F4F4")

    add_question(doc, "List any other document or person that may help explain the events", "other_evidence", 4)

    add_page_break(doc)
    add_heading(doc, "Final check", 1)
    final_items = [
        "I have answered in my own words.",
        "I have separated what I personally know from information supplied by another person.",
        "I have identified the source of information that is not within my own knowledge.",
        "I have not guessed at dates, times or events.",
        "I have identified supporting documents and kept the originals.",
        "I understand that I must carefully review the later witness statement and sign it only if it is true."
    ]
    for idx, item in enumerate(final_items, 1):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.add_run(f"[ ] {item}")

    add_question(doc, "Anything else the court should know about the claim", "anything_else", 7,
                 "Include relevant facts only. If you are unsure whether something matters, record it and explain the source.")
    add_question(doc, "Date this form was completed", "completion_date", 1)
    add_question(doc, "Name of anyone who helped you type or complete this form and how they helped", "completion_assistance", 3,
                 "If nobody helped, write None. The answers must remain your own evidence.")
    add_question(doc, "Will Mumford's signature", "signature", 2,
                 "A typed name is sufficient for returning this information form. The final court witness statement will require its own signature and statement of truth.")

    props = doc.core_properties
    props.title = "Will Mumford Witness Statement Information Form"
    props.subject = "Information form for a witness statement concerning Flat 7 Machin Mews"
    props.author = "William Mumford"
    props.last_modified_by = "William Mumford"
    props.comments = ""

    doc.save(OUTPUT)
    print(str(OUTPUT))


if __name__ == "__main__":
    build()
