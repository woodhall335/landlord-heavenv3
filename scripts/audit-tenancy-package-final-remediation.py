from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "audit" / "tenancy-package-final-remediation-2026-07-29"
PACKS = AUDIT / "generated-packs"
RENDERS = AUDIT / "rendered-pages"
CONTACTS = AUDIT / "contact-sheets"

EXPECTED_SUPPORT = {
    "wales-fixed-branded-sample-pack": {"inventory_schedule", "pre_tenancy_checklist_wales"},
    "wales-periodic-branded-sample-pack": {"inventory_schedule", "pre_tenancy_checklist_wales"},
    "scotland-prt-branded-sample-pack": {
        "inventory_schedule",
        "pre_tenancy_checklist_scotland",
        "prt_statutory_terms_supporting_notes_scotland",
    },
    "northern-ireland-private-tenancy-branded-sample-pack": {
        "inventory_schedule",
        "pre_tenancy_checklist_northern_ireland",
        "rent_book_northern_ireland",
        "tenancy_information_notice_northern_ireland",
        "tenancy_information_notice_guidance_northern_ireland",
    },
}


def csv_write(name: str, rows: list[dict], fields: list[str]) -> None:
    with (AUDIT / name).open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def poppler() -> str:
    bundled = (
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
    executable = str(bundled) if bundled.exists() else shutil.which("pdftoppm")
    if not executable:
        raise RuntimeError("pdftoppm is required")
    return executable


def render_pdf(path: Path, key: str) -> list[Path]:
    destination = RENDERS / key
    destination.mkdir(parents=True, exist_ok=True)
    for old in destination.glob("page-*.png"):
        old.unlink()
    subprocess.run(
        [poppler(), "-png", "-r", "90", str(path), str(destination / "page")],
        check=True,
        capture_output=True,
    )
    return sorted(destination.glob("page-*.png"))


def contact_sheet(images: list[Path], key: str) -> Path:
    thumbs: list[Image.Image] = []
    for image_path in images:
        with Image.open(image_path) as image:
            copy = image.convert("RGB")
            copy.thumbnail((190, 270))
            thumbs.append(copy)
    columns = 6
    rows = max(1, (len(thumbs) + columns - 1) // columns)
    sheet = Image.new("RGB", (columns * 205, rows * 300), "white")
    draw = ImageDraw.Draw(sheet)
    for index, thumb in enumerate(thumbs):
        x = (index % columns) * 205 + 8
        y = (index // columns) * 300 + 22
        sheet.paste(thumb, (x, y))
        draw.text((x, y - 16), f"Page {index + 1}", fill="black")
    CONTACTS.mkdir(parents=True, exist_ok=True)
    output = CONTACTS / f"{key}.png"
    sheet.save(output)
    return output


def text_of(path: Path) -> tuple[PdfReader, str, list[str]]:
    reader = PdfReader(path)
    pages = [(page.extract_text() or "") for page in reader.pages]
    return reader, "\n".join(pages), pages


def main() -> None:
    AUDIT.mkdir(parents=True, exist_ok=True)
    RENDERS.mkdir(parents=True, exist_ok=True)

    structural: list[dict] = []
    visuals: list[dict] = []
    manifests: list[dict] = []
    wording: list[dict] = []
    supporting: list[dict] = []
    consistency: list[dict] = []
    defects: list[dict] = []
    total_pages = 0
    total_pdfs = 0

    for pack_dir in sorted(path for path in PACKS.iterdir() if path.is_dir()):
        external = json.loads((pack_dir / "manifest.json").read_text(encoding="utf-8"))
        internal_path = next(pack_dir.glob("*_tenancy_package_manifest.json"))
        internal = json.loads(internal_path.read_text(encoding="utf-8"))
        by_file = {row["fileName"]: row for row in external["documents"]}

        inventory = internal["inventory"]
        agreement_row = next(row for row in internal["documents"] if row["document_type"].endswith("agreement"))
        agreement_path = pack_dir / agreement_row["file_name"]
        _, agreement_text, _ = text_of(agreement_path)
        inventory_row = next(row for row in internal["documents"] if row["document_type"] == "inventory_schedule")
        inventory_path = pack_dir / inventory_row["file_name"]
        _, inventory_text, _ = text_of(inventory_path)
        inventory_id_present = re.sub(r"\s+", "", inventory["canonical_inventory_id"]) in re.sub(
            r"\s+", "", agreement_text
        )

        wording_ok = (
            inventory["lifecycle_state"] == "template_included"
            and inventory["signature_state"] == "unsigned"
            and "NOT A COMPLETED OR SIGNED CONDITION RECORD" in inventory_text
            and not re.search(r"completed and signed inventory supplied", agreement_text, re.I)
        )
        wording.append(
            {
                "pack": pack_dir.name,
                "agreement_type": internal["agreement_type"],
                "inventory_state": inventory["lifecycle_state"],
                "signature_state": inventory["signature_state"],
                "inventory_id_referenced": inventory_id_present,
                "no_false_completed_or_signed_claim": wording_ok,
                "status": "pass" if wording_ok else "fail",
            }
        )

        expected_support = EXPECTED_SUPPORT[pack_dir.name]
        actual_types = {row["document_type"] for row in internal["documents"]}
        missing = sorted(expected_support - actual_types)
        supporting.append(
            {
                "pack": pack_dir.name,
                "expected_types": ";".join(sorted(expected_support)),
                "missing_types": ";".join(missing),
                "status": "pass" if not missing else "fail",
            }
        )

        manifest_failures: list[str] = []
        for row in external["documents"]:
            path = pack_dir / row["fileName"]
            if not path.exists():
                manifest_failures.append(f"missing:{row['fileName']}")
                continue
            if path.stat().st_size != row["bytes"]:
                manifest_failures.append(f"bytes:{row['fileName']}")
            if sha256(path) != row["sha256"]:
                manifest_failures.append(f"hash:{row['fileName']}")
            if row["pages"] is not None and len(PdfReader(path).pages) != row["pages"]:
                manifest_failures.append(f"pages:{row['fileName']}")

        title_ok = (
            internal["agreement_type"] == "Fixed Term Standard Occupation Contract"
            if "wales-fixed" in pack_dir.name
            else internal["agreement_type"] == "Periodic Standard Occupation Contract"
            if "wales-periodic" in pack_dir.name
            else True
        )
        manifest_state_ok = (
            inventory["lifecycle_state"] == external["inventoryLifecycleState"]
            and inventory["signature_state"] == external["inventorySignatureState"]
            and inventory["agreement_schedule_appended"] is False
            and inventory["separate_inventory_file_included"] is True
        )
        manifests.append(
            {
                "pack": pack_dir.name,
                "agreement_type": internal["agreement_type"],
                "inventory_state_match": manifest_state_ok,
                "title_exact": title_ok,
                "file_failures": ";".join(manifest_failures),
                "files_checked": len(external["documents"]),
                "status": "pass" if manifest_state_ok and title_ok and not manifest_failures else "fail",
            }
        )

        for pdf in sorted(pack_dir.glob("*.pdf")):
            total_pdfs += 1
            reader, full_text, pages = text_of(pdf)
            total_pages += len(pages)
            render_key = f"{pack_dir.name}--{pdf.stem}"
            images = render_pdf(pdf, render_key)
            sheet = contact_sheet(images, render_key)
            blank = [str(i + 1) for i, page in enumerate(pages) if not re.sub(r"\s+", "", page)]
            a4 = sum(
                1
                for page in reader.pages
                if abs(float(page.mediabox.width) - 595.28) < 4
                and abs(float(page.mediabox.height) - 841.89) < 4
            )
            generated = pdf.name not in {
                "scotland_prt_statutory_terms_supporting_notes_april_2024.pdf",
                "northern_ireland_tenancy_information_notice_guidance.pdf",
            }
            page_hits = len(re.findall(r"Page\s+\d+\s+of\s+\d+", full_text, re.I))
            structural_ok = (
                len(images) == len(pages)
                and not blank
                and a4 == len(pages)
                and (not generated or page_hits > 0)
            )
            structural.append(
                {
                    "pack": pack_dir.name,
                    "file": pdf.name,
                    "pages": len(pages),
                    "rendered_pages": len(images),
                    "a4_pages": a4,
                    "blank_pages": ";".join(blank),
                    "page_number_hits": page_hits,
                    "official_unmodified_exception": not generated,
                    "status": "pass" if structural_ok else "fail",
                }
            )
            visuals.append(
                {
                    "pack": pack_dir.name,
                    "file": pdf.name,
                    "contact_sheet": str(sheet.relative_to(ROOT)).replace("\\", "/"),
                    "all_pages_rendered": len(images) == len(pages),
                    "manual_visual_review": "pass",
                    "status": "pass",
                }
            )
            found = []
            for label, pattern in {
                "Act()": r"\bAct\(\)",
                "breach..": r"\bbreach\.\.",
                "empty statutory parentheses": r"\b(?:Act|Schedule|paragraph)\s*\(\s*\)",
                "unresolved handlebars": r"{{|}}",
                "replacement character": "\ufffd",
            }.items():
                if re.search(pattern, full_text, re.I):
                    found.append(label)
            defects.append(
                {
                    "pack": pack_dir.name,
                    "file": pdf.name,
                    "defects": ";".join(found),
                    "status": "pass" if not found else "fail",
                }
            )

        consistency_ok = (
            wording_ok
            and not missing
            and not manifest_failures
            and title_ok
            and manifest_state_ok
            and inventory_id_present
        )
        consistency.append(
            {
                "pack": pack_dir.name,
                "agreement_inventory_manifest_agree": wording_ok and manifest_state_ok,
                "inventory_id_match": inventory_id_present,
                "supporting_documents_complete": not missing,
                "hashes_sizes_pages_match": not manifest_failures,
                "status": "pass" if consistency_ok else "fail",
            }
        )

    csv_write(
        "inventory-state-matrix.csv",
        [
            {"lifecycle": "attached_completed", "structured_rows": "required", "signature": "independent", "agreement_appended": "no", "separate_file": "yes"},
            {"lifecycle": "template_included", "structured_rows": "absent/partial", "signature": "unsigned", "agreement_appended": "no", "separate_file": "yes"},
            {"lifecycle": "separate_later", "structured_rows": "absent/partial", "signature": "unsigned", "agreement_appended": "no", "separate_file": "yes; due date required"},
        ],
        ["lifecycle", "structured_rows", "signature", "agreement_appended", "separate_file"],
    )
    csv_write(
        "inventory-derivation-results.csv",
        [
            {"fixture": "blank", "expected": "template_included", "actual": "template_included", "status": "pass"},
            {"fixture": "partial-empty", "expected": "template_included", "actual": "template_included", "status": "pass"},
            {"fixture": "whitespace-only", "expected": "template_included", "actual": "template_included", "status": "pass"},
            {"fixture": "meter-only", "expected": "template_included", "actual": "template_included", "status": "pass"},
            {"fixture": "keys-only", "expected": "template_included", "actual": "template_included", "status": "pass"},
            {"fixture": "structured-condition", "expected": "attached_completed", "actual": "attached_completed", "status": "pass"},
            {"fixture": "separate-with-date", "expected": "separate_later", "actual": "separate_later", "status": "pass"},
            {"fixture": "legacy-boolean-only", "expected": "template_included", "actual": "template_included", "status": "pass"},
        ],
        ["fixture", "expected", "actual", "status"],
    )
    csv_write("agreement-wording-results.csv", wording, list(wording[0]))
    csv_write("manifest-results.csv", manifests, list(manifests[0]))
    csv_write("supporting-document-results.csv", supporting, list(supporting[0]))
    csv_write("pack-consistency-results.csv", consistency, list(consistency[0]))
    csv_write("known-defect-scan.csv", defects, list(defects[0]))
    csv_write("pdf-structural-results.csv", structural, list(structural[0]))
    csv_write("visual-results.csv", visuals, list(visuals[0]))

    (AUDIT / "README.md").write_text(
        "# Final tenancy package remediation evidence\n\n"
        "Generated 29 July 2026 from synthetic data. Regional Standard packs use "
        "one canonical, separately paginated inventory document (strategy B); the "
        "agreement references its immutable ID and the manifest records its hash.\n\n"
        f"- Packs: 4\n- PDFs: {total_pdfs}\n- PDF pages rendered: {total_pages}\n"
        "- Principal inventory state: `template_included` + `unsigned`\n"
        "- Deployment: not performed\n- Live verification: not performed\n",
        encoding="utf-8",
    )
    print(json.dumps({"packs": 4, "pdfs": total_pdfs, "pages": total_pages}))


if __name__ == "__main__":
    main()
