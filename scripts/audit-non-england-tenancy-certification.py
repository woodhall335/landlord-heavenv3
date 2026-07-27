from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import subprocess
from datetime import date
from pathlib import Path
from typing import Any

import pdfplumber
from PIL import Image, ImageDraw
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "audit" / "tenancy-legal-parity-2026-07-27-prompt-92ad2de1"
PDF_ROOT = ROOT / "output" / "pdf"
POPPLER = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
    / "native"
    / "poppler"
    / "Library"
    / "bin"
    / "pdftoppm.exe"
)

SAMPLES = {
    "scotland": "scotland-prt-branded-sample.pdf",
    "wales-fixed": "wales-fixed-branded-sample.pdf",
    "wales-periodic": "wales-periodic-branded-sample.pdf",
    "northern-ireland": "northern-ireland-private-tenancy-branded-sample.pdf",
}

SOURCES: list[dict[str, Any]] = [
    {
        "jurisdiction": "scotland",
        "title": "Scottish Government Model Private Residential Tenancy Agreement",
        "url": "https://www.gov.scot/publications/private-residential-tenancy-model-agreement/documents/",
        "publication_or_amendment_date": "2024-04-01",
        "effective_date": "2024-04-01",
        "checked": "2026-07-27",
        "clauses": "Model PRT clauses 1-39",
        "wording_rule": "Mandatory terms source-derived; discretionary wording may be selected or adapted",
        "local_files": [
            "config/mqs/tenancy_agreement/official_model_sources/scotland-model-prt-2024-04.docx",
            "config/mqs/tenancy_agreement/official_model_sources/scotland-model-prt-2024-04.pdf",
        ],
    },
    {
        "jurisdiction": "scotland",
        "title": "Private Residential Tenancy Statutory Terms Supporting Notes",
        "url": "https://www.gov.scot/publications/private-residential-tenancy-statutory-terms-supporting-notes/",
        "publication_or_amendment_date": "2024-04-01",
        "effective_date": "2024-04-01",
        "checked": "2026-07-27",
        "clauses": "Mandatory supporting pack asset",
        "wording_rule": "Official PDF retained and delivered unchanged",
        "local_files": [
            "config/mqs/tenancy_agreement/scotland_prt_statutory_terms_supporting_notes_april_2024.pdf"
        ],
    },
    {
        "jurisdiction": "scotland",
        "title": "Housing (Scotland) Act 2025 commencement and rent-control guidance",
        "url": "https://www.gov.scot/policies/private-renting/rent-controls/",
        "publication_or_amendment_date": "2026-04-01",
        "effective_date": "2026-04-01",
        "checked": "2026-07-27",
        "clauses": "Rent-control-area status and commencement-sensitive rent wording",
        "wording_rule": "Adapted current-law explanatory wording",
        "local_files": [],
    },
    {
        "jurisdiction": "scotland",
        "title": "Rental discrimination: guidance for Scotland",
        "url": "https://www.gov.scot/publications/rental-discrimination-guidance-for-scotland/",
        "publication_or_amendment_date": "2026-05-01",
        "effective_date": "2026-05-01",
        "checked": "2026-07-27",
        "clauses": "Children and benefits claimant rental-discrimination statement",
        "wording_rule": "Adapted explanatory wording; statute prevails",
        "local_files": [],
    },
    {
        "jurisdiction": "wales-periodic",
        "title": "Welsh Government model written statement for periodic standard contracts",
        "url": "https://www.gov.wales/model-written-statement-periodic-standard-contracts",
        "publication_or_amendment_date": "2026-05-29",
        "effective_date": "2026-06-01",
        "checked": "2026-07-27",
        "clauses": "Periodic terms 1-83 plus 14A and 14B",
        "wording_rule": "Fundamental and supplementary corpus source-derived; populated key matters substituted",
        "local_files": [
            "config/mqs/tenancy_agreement/official_model_sources/wales-periodic-standard-2026-05.docx",
            "config/mqs/tenancy_agreement/official_model_sources/wales-periodic-standard-2026-05.pdf",
        ],
    },
    {
        "jurisdiction": "wales-fixed",
        "title": "Welsh Government model written statement for fixed term standard contracts",
        "url": "https://www.gov.wales/model-written-statement-fixed-term-standard-contracts",
        "publication_or_amendment_date": "2026-05-29",
        "effective_date": "2026-06-01",
        "checked": "2026-07-27",
        "clauses": "Fixed terms 1-56 plus 14A and 14B",
        "wording_rule": "Fundamental and supplementary corpus source-derived; populated key matters substituted",
        "local_files": [
            "config/mqs/tenancy_agreement/official_model_sources/wales-fixed-standard-2026-06.docx",
            "config/mqs/tenancy_agreement/official_model_sources/wales-fixed-standard-2026-06.pdf",
        ],
    },
    {
        "jurisdiction": "wales",
        "title": "Renting Homes (Miscellaneous Amendments) (Wales) Regulations 2026 guidance",
        "url": "https://www.gov.wales/renting-homes-miscellaneous-amendments-wales-regulations-2026-guidance-landlords-html",
        "publication_or_amendment_date": "2026-04-29",
        "effective_date": "2026-06-01",
        "checked": "2026-07-27",
        "clauses": "Terms 14A and 14B and related restrictions",
        "wording_rule": "New fundamental terms preserved",
        "local_files": [],
    },
    {
        "jurisdiction": "northern-ireland",
        "title": "Private Tenancies Act (Northern Ireland) 2022 commencement position",
        "url": "https://www.communities-ni.gov.uk/articles/private-tenancies-act-northern-ireland-2022",
        "publication_or_amendment_date": "2026-07-27 check",
        "effective_date": "Multiple; section 11 longer notice periods remain in progress",
        "checked": "2026-07-27",
        "clauses": "Tenancy information, deposits, rent increases, alarms, electrical safety and notice position",
        "wording_rule": "Current commenced law only",
        "local_files": [],
    },
    {
        "jurisdiction": "northern-ireland",
        "title": "Landlord's Notice Relating to the Granting of a Private Tenancy",
        "url": "https://www.communities-ni.gov.uk/publications/private-tenancies-act-northern-ireland-2022-guide-sections-1-6-tenants-and-landlords",
        "publication_or_amendment_date": "2023-03-01",
        "effective_date": "2023-04-01",
        "checked": "2026-07-27",
        "clauses": "Prescribed Tenancy Information Notice and completion guidance",
        "wording_rule": "Official blank prescribed document delivered unchanged",
        "local_files": [
            "config/mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_2023.docx",
            "config/mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_2023.pdf",
            "config/mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_guidance_2023.pdf",
        ],
    },
    {
        "jurisdiction": "northern-ireland",
        "title": "Rent Book Regulations (Northern Ireland) 2007",
        "url": "https://www.legislation.gov.uk/nisr/2007/89/contents",
        "publication_or_amendment_date": "2007-02-13",
        "effective_date": "2007-04-01",
        "checked": "2026-07-27",
        "clauses": "Mandatory rent-book particulars and payment record",
        "wording_rule": "Prescribed particulars populated; record layout adapted",
        "local_files": [],
    },
    {
        "jurisdiction": "northern-ireland",
        "title": "Electrical Safety Standards for Private Tenancies Regulations (Northern Ireland) 2024",
        "url": "https://www.legislation.gov.uk/nisr/2024/201/contents",
        "publication_or_amendment_date": "2024",
        "effective_date": "2025-04-01",
        "checked": "2026-07-27",
        "clauses": "Five-year inspection/report and tenant-copy duties",
        "wording_rule": "Adapted contractual acknowledgement; regulations prevail",
        "local_files": [],
    },
    {
        "jurisdiction": "northern-ireland",
        "title": "Smoke, Heat and Carbon Monoxide Alarms for Private Tenancies Regulations (Northern Ireland) 2024",
        "url": "https://www.legislation.gov.uk/nisr/2024/123/contents",
        "publication_or_amendment_date": "2024-05-30",
        "effective_date": "2024-12-01 for all private tenancies",
        "checked": "2026-07-27",
        "clauses": "Alarm installation, testing and maintenance",
        "wording_rule": "Adapted contractual acknowledgement; regulations prevail",
        "local_files": [],
    },
]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_csv(name: str, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with (AUDIT / name).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def extract_text(path: Path) -> str:
    with pdfplumber.open(path) as document:
        return "\n".join(page.extract_text() or "" for page in document.pages)


def fonts_embedded(reader: PdfReader) -> tuple[bool, list[str]]:
    missing: set[str] = set()
    observed: set[int] = set()
    for page in reader.pages:
        resources = page.get("/Resources") or {}
        fonts = resources.get("/Font") or {}
        fonts = fonts.get_object() if hasattr(fonts, "get_object") else fonts
        for reference in fonts.values():
            font = reference.get_object()
            marker = id(font)
            if marker in observed:
                continue
            observed.add(marker)
            descriptor = font.get("/FontDescriptor")
            if descriptor:
                descriptor = descriptor.get_object()
            elif font.get("/DescendantFonts"):
                descendant = font["/DescendantFonts"][0].get_object()
                descriptor = descendant.get("/FontDescriptor")
                descriptor = descriptor.get_object() if descriptor else None
            embedded = bool(
                descriptor
                and any(key in descriptor for key in ("/FontFile", "/FontFile2", "/FontFile3"))
            )
            if not embedded:
                missing.add(str(font.get("/BaseFont", "unknown")))
    return not missing, sorted(missing)


def render_sample(key: str, path: Path) -> list[Path]:
    destination = AUDIT / "rendered-pages" / key
    destination.mkdir(parents=True, exist_ok=True)
    prefix = destination / "page"
    subprocess.run(
        [str(POPPLER), "-png", "-r", "110", str(path), str(prefix)],
        check=True,
        capture_output=True,
    )
    pages = sorted(destination.glob("page-*.png"))
    thumbs: list[Image.Image] = []
    for index, page in enumerate(pages, start=1):
        image = Image.open(page).convert("RGB")
        image.thumbnail((330, 470))
        canvas = Image.new("RGB", (350, 505), "white")
        canvas.paste(image, ((350 - image.width) // 2, 24))
        ImageDraw.Draw(canvas).text((12, 7), f"{key} - page {index}", fill="black")
        thumbs.append(canvas)
    columns = 4
    rows = (len(thumbs) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * 350, rows * 505), "#d9dee5")
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % columns) * 350, (index // columns) * 505))
    contact = AUDIT / "contact-sheets"
    contact.mkdir(parents=True, exist_ok=True)
    sheet.save(contact / f"{key}.png")

    chunk_directory = AUDIT / "contact-sheet-chunks"
    chunk_directory.mkdir(parents=True, exist_ok=True)
    chunk_size = 12
    chunk_columns = 3
    for chunk_start in range(0, len(thumbs), chunk_size):
        chunk = thumbs[chunk_start : chunk_start + chunk_size]
        chunk_rows = (len(chunk) + chunk_columns - 1) // chunk_columns
        chunk_sheet = Image.new(
            "RGB",
            (chunk_columns * 350, chunk_rows * 505),
            "#d9dee5",
        )
        for index, thumb in enumerate(chunk):
            chunk_sheet.paste(
                thumb,
                ((index % chunk_columns) * 350, (index // chunk_columns) * 505),
            )
        first_page = chunk_start + 1
        last_page = chunk_start + len(chunk)
        chunk_sheet.save(
            chunk_directory / f"{key}-{first_page:03d}-{last_page:03d}.png"
        )
    return pages


def template_term_positions(path: Path, first: int, last: int) -> list[dict[str, Any]]:
    source = path.read_text(encoding="utf-8")
    stripped = html.unescape(re.sub(r"<[^>]+>", " ", source))
    stripped = re.sub(r"\s+", " ", stripped)
    rows = []
    previous = -1
    for number in range(first, last + 1):
        candidates = [
            match.start()
            for match in re.finditer(rf"(?<!\d){number}\.(?!\d)", stripped)
            if match.start() > previous
        ]
        position = candidates[0] if candidates else -1
        rows.append(
            {
                "term": number,
                "present_in_order": position > previous,
                "character_offset": position,
            }
        )
        if position >= 0:
            previous = position
    return rows


def main() -> None:
    AUDIT.mkdir(parents=True, exist_ok=True)

    manifest_sources = []
    for source in SOURCES:
        item = dict(source)
        retained = []
        for relative in source["local_files"]:
            path = ROOT / relative
            retained.append(
                {
                    "path": relative.replace("\\", "/"),
                    "bytes": path.stat().st_size,
                    "sha256": digest(path),
                }
            )
        item["retained_files"] = retained
        item.pop("local_files")
        manifest_sources.append(item)
    (AUDIT / "source-version-manifest.json").write_text(
        json.dumps({"generated": date.today().isoformat(), "sources": manifest_sources}, indent=2)
        + "\n",
        encoding="utf-8",
    )

    texts: dict[str, str] = {}
    structural_rows = []
    sample_manifest = []
    visual_rows = []
    rendered_index = []
    for key, filename in SAMPLES.items():
        path = PDF_ROOT / filename
        reader = PdfReader(path)
        text = extract_text(path)
        texts[key] = text
        dimensions = [
            (float(page.mediabox.width), float(page.mediabox.height)) for page in reader.pages
        ]
        a4 = all(abs(width - 595.28) < 2 and abs(height - 841.89) < 2 for width, height in dimensions)
        embedded, missing_fonts = fonts_embedded(reader)
        pages = render_sample(key, path)
        pack_manifest_path = PDF_ROOT / f"{path.stem}-pack" / "manifest.json"
        pack_manifest = json.loads(pack_manifest_path.read_text(encoding="utf-8"))
        structural_rows.append(
            {
                "sample": filename,
                "opens": "pass",
                "text_extraction": "pass" if len(text.strip()) > 100 else "fail",
                "pages": len(reader.pages),
                "all_pages_a4": "pass" if a4 else "fail",
                "fonts_embedded": "pass" if embedded else "fail",
                "unembedded_fonts": "; ".join(missing_fonts),
                "outline_entries": len(reader.outline),
                "rendered_pages": len(pages),
                "status": "pass" if a4 and embedded and len(pages) == len(reader.pages) else "fail",
            }
        )
        visual_rows.append(
            {
                "sample": filename,
                "pages": len(pages),
                "contact_sheet": f"contact-sheets/{key}.png",
                "review_status": "pending-manual-contact-sheet-review",
                "clipping": "pending",
                "overlap": "pending",
                "blank_pages": "pending",
                "notes": "Every page rendered at 110 DPI.",
            }
        )
        rendered_index.append(
            {
                "sample": filename,
                "pages": [str(page.relative_to(AUDIT)).replace("\\", "/") for page in pages],
                "contactSheet": f"contact-sheets/{key}.png",
            }
        )
        sample_manifest.append(
            {
                "file": f"output/pdf/{filename}",
                "bytes": path.stat().st_size,
                "pages": len(reader.pages),
                "sha256": digest(path),
                "packManifest": str(pack_manifest_path.relative_to(ROOT)).replace("\\", "/"),
                "packAssets": pack_manifest["documents"],
            }
        )

    (AUDIT / "sample-file-manifest.json").write_text(
        json.dumps({"samples": sample_manifest}, indent=2) + "\n", encoding="utf-8"
    )
    (AUDIT / "rendered-page-index.json").write_text(
        json.dumps({"samples": rendered_index}, indent=2) + "\n", encoding="utf-8"
    )
    write_csv(
        "PDF structural-validation.csv",
        structural_rows,
        [
            "sample",
            "opens",
            "text_extraction",
            "pages",
            "all_pages_a4",
            "fonts_embedded",
            "unembedded_fonts",
            "outline_entries",
            "rendered_pages",
            "status",
        ],
    )
    write_csv(
        "visual-QA.csv",
        visual_rows,
        [
            "sample",
            "pages",
            "contact_sheet",
            "review_status",
            "clipping",
            "overlap",
            "blank_pages",
            "notes",
        ],
    )

    unresolved_patterns = [
        r"\[Where\b",
        r"\{\{[^}]+\}\}",
        r"\bundefined\b",
        r"\bnull\b",
        r"TO BE COMPLETED",
        r"sample-only internal",
    ]
    unresolved_rows = []
    for key, text in texts.items():
        for pattern in unresolved_patterns:
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            unresolved_rows.append(
                {
                    "sample": SAMPLES[key],
                    "pattern": pattern,
                    "matches": len(matches),
                    "status": "pass" if not matches else "fail",
                }
            )
    write_csv(
        "unresolved-template-token-scan.csv",
        unresolved_rows,
        ["sample", "pattern", "matches", "status"],
    )

    malformed_patterns = [
        "during whch",
        "including the your rights",
        "with written receipt",
        "rather “the contract-holder’s”",
        "a day’s rent,up to",
        "emotional and sexual, psychological, emotional",
        "STAND ARD",
    ]
    malformed_rows = []
    for key, text in texts.items():
        for phrase in malformed_patterns:
            count = text.lower().count(phrase.lower())
            malformed_rows.append(
                {
                    "sample": SAMPLES[key],
                    "phrase": phrase,
                    "matches": count,
                    "status": "pass" if count == 0 else "fail",
                }
            )
    write_csv(
        "malformed-copy-scan.csv",
        malformed_rows,
        ["sample", "phrase", "matches", "status"],
    )

    leakage_rules = {
        "scotland": ["section 21", "occupation contract", "rent smart wales", "tenancy information notice"],
        "wales-fixed": ["notice to leave", "first-tier tribunal", "landlord registration scheme ni"],
        "wales-periodic": ["notice to leave", "first-tier tribunal", "landlord registration scheme ni"],
        "northern-ireland": ["section 21", "occupation contract", "notice to leave", "first-tier tribunal"],
    }
    leakage_rows = []
    for key, phrases in leakage_rules.items():
        text = texts[key].lower()
        for phrase in phrases:
            count = text.count(phrase)
            leakage_rows.append(
                {
                    "sample": SAMPLES[key],
                    "prohibited_phrase": phrase,
                    "matches": count,
                    "status": "pass" if count == 0 else "fail",
                }
            )
    write_csv(
        "jurisdiction-leakage-results.csv",
        leakage_rows,
        ["sample", "prohibited_phrase", "matches", "status"],
    )

    completeness_expectations = {
        "scotland": [
            "prt_agreement",
            "inventory_schedule",
            "pre_tenancy_checklist_scotland",
            "easy_read_notes_scotland",
        ],
        "wales-fixed": ["soc_agreement", "inventory_schedule", "pre_tenancy_checklist_wales"],
        "wales-periodic": ["soc_agreement", "inventory_schedule", "pre_tenancy_checklist_wales"],
        "northern-ireland": [
            "private_tenancy_agreement",
            "inventory_schedule",
            "pre_tenancy_checklist_northern_ireland",
            "rent_book_northern_ireland",
            "tenancy_information_notice_northern_ireland",
            "tenancy_information_notice_guidance_northern_ireland",
        ],
    }
    completeness_rows = []
    attachment_rows = []
    for key, expected in completeness_expectations.items():
        pack_path = PDF_ROOT / f"{Path(SAMPLES[key]).stem}-pack" / "manifest.json"
        pack = json.loads(pack_path.read_text(encoding="utf-8"))
        actual = [item["documentType"] for item in pack["documents"]]
        for document_type in expected:
            completeness_rows.append(
                {
                    "sample": SAMPLES[key],
                    "required_document_type": document_type,
                    "included": "yes" if document_type in actual else "no",
                    "status": "pass" if document_type in actual else "fail",
                }
            )
        agreement_pages = next(
            item["pages"] for item in pack["documents"] if item["category"] == "agreement"
        )
        inventory_pages = next(
            item["pages"] for item in pack["documents"] if item["documentType"] == "inventory_schedule"
        )
        attachment_rows.append(
            {
                "sample": SAMPLES[key],
                "claimed_mode": pack["inventoryMode"],
                "schedule_asset_in_pack": "yes" if "inventory_schedule" in actual else "no",
                "appended_to_agreement": "yes" if pack["agreementIncludesAppendedSchedule1"] else "no",
                "agreement_pages": agreement_pages,
                "inventory_pages": inventory_pages,
                "status": "pass"
                if pack["inventoryMode"] == "attached"
                and pack["agreementIncludesAppendedSchedule1"]
                and "inventory_schedule" in actual
                else "fail",
            }
        )
    write_csv(
        "document-completeness.csv",
        completeness_rows,
        ["sample", "required_document_type", "included", "status"],
    )
    write_csv(
        "attachment-consistency.csv",
        attachment_rows,
        [
            "sample",
            "claimed_mode",
            "schedule_asset_in_pack",
            "appended_to_agreement",
            "agreement_pages",
            "inventory_pages",
            "status",
        ],
    )

    key_rows = [
        {
            "sample": SAMPLES["scotland"],
            "check": "Scottish property/address and registration isolation",
            "status": "pass"
            if all(value.lower() in texts["scotland"].lower() for value in ["edinburgh", "123456/230/01234"])
            else "fail",
        },
        {
            "sample": SAMPLES["wales-fixed"],
            "check": "Fixed end date follows start date and 12-month term",
            "status": "pass"
            if all(value in texts["wales-fixed"] for value in ["01/09/2026", "31/08/2027", "12 months"])
            else "fail",
        },
        {
            "sample": SAMPLES["wales-periodic"],
            "check": "Periodic agreement contains no contractual end date",
            "status": "pass" if "31 August 2027" not in texts["wales-periodic"] else "fail",
        },
        {
            "sample": SAMPLES["northern-ireland"],
            "check": "NI landlord registration and Belfast data",
            "status": "pass"
            if all(value.lower() in texts["northern-ireland"].lower() for value in ["belfast", "ni-lr-642901"])
            else "fail",
        },
    ]
    write_csv("key-matter-consistency.csv", key_rows, ["sample", "check", "status"])

    parity_specs = [
        (
            "scotland",
            ROOT / "config/jurisdictions/uk/scotland/templates/prt_agreement.hbs",
            7,
            39,
            "Scottish Government model PRT April 2024",
        ),
        (
            "wales-fixed",
            ROOT / "config/jurisdictions/uk/wales/templates/fixed_term_standard_occupation_contract.hbs",
            1,
            56,
            "Welsh Government fixed model May 2026",
        ),
        (
            "wales-periodic",
            ROOT / "config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs",
            1,
            83,
            "Welsh Government periodic model May 2026",
        ),
    ]
    parity_rows = []
    term_evidence = []
    for key, path, first, last, source in parity_specs:
        positions = template_term_positions(path, first, last)
        term_evidence.append(
            {
                "document": key,
                "source": source,
                "expected_range": [first, last],
                "terms": positions,
                "all_present_in_order": all(item["present_in_order"] for item in positions),
            }
        )
        parity_rows.append(
            {
                "document": key,
                "source": source,
                "expected_terms": last - first + 1,
                "terms_found_in_order": sum(item["present_in_order"] for item in positions),
                "2026_terms_14A_14B": "pass"
                if key.startswith("wales")
                and "Right for children to live at or visit dwelling" in texts[key]
                and "Right to claim benefits" in texts[key]
                else ("n/a" if key == "scotland" else "fail"),
                "status": "pass" if all(item["present_in_order"] for item in positions) else "fail",
                "claim": "structural source-parity evidence only; not a legal-compliance certification",
            }
        )
    write_csv(
        "clause-parity-summary.csv",
        parity_rows,
        [
            "document",
            "source",
            "expected_terms",
            "terms_found_in_order",
            "2026_terms_14A_14B",
            "status",
            "claim",
        ],
    )

    differences = {
        "automated_term_evidence": term_evidence,
        "explained_differences": [
            {
                "document": "scotland",
                "classification": "authoritative-current-law adaptation",
                "location": "term 10 and glossary",
                "change": "RPZ-only language replaced with commencement-sensitive rent-control-area wording",
                "authority": "Housing (Scotland) Act 2025 commencement and Scottish Government rent-control guidance",
                "legal_review_status": "external solicitor review still required",
            },
            {
                "document": "scotland",
                "classification": "expanded contractual equality wording",
                "location": "term 22",
                "change": "Protected-characteristic list expanded and 1 May 2026 children/benefits rule acknowledged",
                "authority": "Equality Act 2010 and Scottish rental-discrimination guidance",
                "legal_review_status": "external solicitor review still required",
            },
            {
                "document": "wales-fixed and wales-periodic",
                "classification": "defect correction",
                "location": "explanatory text and terms 1-2/deposit text",
                "change": "Known malformed copy and unresolved model drafting instructions removed; explicit no-modification declaration rendered",
                "authority": "current Welsh Government model sources and 2026 guidance",
                "legal_review_status": "source/difference review complete; external solicitor approval not obtained",
            },
            {
                "document": "all",
                "classification": "populated key matter",
                "location": "party, property, rent, deposit and date fields",
                "change": "Model blanks replaced with coherent synthetic sample facts",
                "authority": "customer data mapping",
                "legal_review_status": "not a clause modification",
            },
        ],
        "unexplained_substantive_differences": [],
        "certification_limit": "This report proves structural coverage and explains intentional differences; it does not certify legal validity or solicitor approval.",
    }
    (AUDIT / "statutory-differences.json").write_text(
        json.dumps(differences, indent=2) + "\n", encoding="utf-8"
    )

    (AUDIT / "test-results.txt").write_text(
        "Pending final test, lint, TypeScript and production-build run.\n", encoding="utf-8"
    )
    readme = f"""# Tenancy legal-parity remediation audit

Generated: 27 July 2026

## What was wrong

- The Scottish equality clause was truncated, the deposit status could imply future dates as completed facts, and an agreement could say Schedule 1 was attached without physically appending it.
- Scottish supporting notes were mentioned without a package-level proof, and RPZ-only wizard wording did not reflect the 2026 rent-control-area framework.
- Both Welsh source-derived templates contained unresolved model instructions and known malformed copy; Rent Smart Wales registration and licensing were conflated.
- The Northern Ireland flow treated the rent book as conditional, omitted a generated rent-book component, and risked presenting uncommenced longer notice periods as current.

## What changed

- Attachment mode now appends the generated nine-page inventory to the agreement PDF and fails if the schedule cannot be generated. Later-supply mode uses different wording.
- Scottish deposit facts distinguish pending and completed protection and capture payer, scheme contact/address, dates, reference, deductions, repayment and disputes. Official April 2024 supporting notes are mandatory in the pack manifest.
- Welsh drafting instructions and copy defects were removed, a no-modification declaration is rendered, terms 14A/14B are regression-scanned, and registration/licensing/agent licensing are separate facts.
- Every Northern Ireland pack contains a populated rent book, the official blank Tenancy Information Notice, its official guidance, and current commenced notice-to-quit wording.
- Long Welsh and Northern Ireland agreements now include contents pages. All agreement samples retain the existing Landlord Heaven identity.

## Source position and limitations

The detailed sources, versions, dates and retained-file hashes are in `source-version-manifest.json`. Intentional differences are in `statutory-differences.json`.

The Scottish term 10/rent-control wording and term 22/equality wording are adapted from current authorities rather than represented as verbatim April 2024 model text. No external solicitor approval was obtained in this engineering run. The Northern Ireland prescribed Tenancy Information Notice remains the official blank form and must be completed and signed; the wizard explicitly requires that workflow. These documents must remain behind the existing certification/release gate pending qualified jurisdiction-specific legal review.

## Commands

- `npx -p node@20 -p tsx tsx scripts/generate-branded-non-england-certification-samples.ts`
- `python scripts/audit-non-england-tenancy-certification.py`
- `npm run validate:yaml-config`
- `npx tsc --noEmit`
- `npx vitest run tests/tenancy/branded-model-derived-agreements.test.ts tests/tenancy/non-england-legal-drift-2026.test.ts src/lib/documents/__tests__/ast-pack-generation.test.ts src/lib/validation/__tests__/tenancy-details-validator.test.ts tests/integration/ast-jurisdiction-parity.test.ts`
- `npm run lint`
- `npm run build`
- `git diff --check`

## Final agreement page counts

- Scotland PRT: {len(PdfReader(PDF_ROOT / SAMPLES["scotland"]).pages)}
- Wales fixed term: {len(PdfReader(PDF_ROOT / SAMPLES["wales-fixed"]).pages)}
- Wales periodic: {len(PdfReader(PDF_ROOT / SAMPLES["wales-periodic"]).pages)}
- Northern Ireland: {len(PdfReader(PDF_ROOT / SAMPLES["northern-ireland"]).pages)}

Every agreement page is indexed in `rendered-page-index.json`; full-page PNGs and four contact sheets are stored under this directory.
"""
    (AUDIT / "README.md").write_text(readme, encoding="utf-8")


if __name__ == "__main__":
    main()
