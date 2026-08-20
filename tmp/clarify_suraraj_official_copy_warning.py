from pathlib import Path

from docx import Document


path = Path(r"C:\Users\t_moh\Downloads\suraraj-pradhan-ground-1-client-pack-20-august-2026-final-v10\03_COURT_FORMS_FOR_ISSUE_AFTER_NOTICE_EXPIRES\01-court-issue-conditions-and-evidence-schedule.docx")
document = Document(path)
old = "The supplied 2 April 2026 title-register summary in SP1 is useful preliminary evidence only and must not be substituted for an official copy."
new = "The supplied 2 April 2026 title-register summary in SP1 is marked not an official copy. It is useful preliminary evidence only and must not be substituted for an official copy."
for paragraph in document.paragraphs:
    if old in paragraph.text:
        paragraph.text = paragraph.text.replace(old, new)
        break
else:
    raise SystemExit("Court-issue warning not found")
document.save(path)
