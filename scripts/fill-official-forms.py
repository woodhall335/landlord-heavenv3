#!/usr/bin/env python3
"""
Fill Official GOV.UK Forms with Sample Data

This script creates completed versions of Form 3 (Section 8) and Form 6A (Section 21)
with realistic sample data for use as test fixtures.

Usage:
    python3 scripts/fill-official-forms.py
"""

import os
import subprocess
import tempfile
from pathlib import Path

# Constants
BASE_DIR = Path(__file__).parent.parent
ASSETS_DIR = BASE_DIR / "attached_assets"
OUTPUT_DIR = ASSETS_DIR / "completed_notices"

# Sample data - consistent across both forms
SAMPLE_DATA = {
    "tenant_name": "Sonia Shezadi",
    "property_address": "35 Woodhall Park Avenue, Pudsey, LS28 7HF",
    "landlord_name": "Tariq Mohammed",
    "landlord_address": "1 Example Street, Leeds, LS1 1AA",
    "landlord_phone": "07123 456789",
    # Section 8 specific
    "s8_date_served": "01/01/2026",
    "s8_earliest_proceedings": "15/01/2026",
    "s8_grounds": "8, 10 and 11",
    "s8_arrears_amount": "3,000.00",
    "s8_rent_amount": "1,500.00",
    "s8_ground_text": """Ground 8 - At both the date of the service of the notice and at the date of the hearing:
(a) if rent is payable weekly or fortnightly, at least eight weeks' rent is unpaid;
(b) if rent is payable monthly, at least two months' rent is unpaid.

Ground 10 - Some rent lawfully due from the tenant is unpaid on the date on which the proceedings for possession are begun.

Ground 11 - Whether or not any rent is in arrears on the date on which proceedings for possession are begun, the tenant has persistently delayed paying rent which has become lawfully due.""",
    "s8_particulars": """The tenant has failed to pay rent since October 2025. As of the date of this notice, rent arrears total GBP 3,000.00 (representing 2 months unpaid rent at GBP 1,500.00 per month).

The tenant has been in persistent arrears for the past 6 months despite multiple requests for payment. Letters were sent on 15/10/2025, 01/11/2025, and 15/11/2025 requesting payment of the outstanding rent.

The mandatory Ground 8 threshold is met as more than 2 months rent remains unpaid.""",
    # Section 21 specific
    "s21_service_date": "22/12/2025",
    "s21_expiry_date": "14/07/2026",
}


def create_section8_html() -> str:
    """Create HTML content for Section 8 Form 3."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Form 3 - Section 8 Notice</title>
<style>
body {{ font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; margin: 40px; }}
h1 {{ font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 5px; }}
h2 {{ font-size: 12pt; font-weight: bold; text-align: center; margin-top: 5px; }}
.header {{ text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }}
.form-no {{ font-size: 16pt; font-weight: bold; }}
.section {{ margin-bottom: 15px; }}
.section-num {{ font-weight: bold; }}
.field-value {{ background-color: #f0f0f0; padding: 5px; border: 1px solid #ccc; margin: 5px 0; }}
.signature-block {{ margin-top: 30px; border-top: 1px solid black; padding-top: 20px; }}
.checkbox {{ font-family: 'Courier New', monospace; }}
hr {{ border: none; border-top: 1px solid black; margin: 20px 0; }}
</style>
</head>
<body>

<div class="header">
<p class="form-no">FORM NO. 3</p>
<p><strong>Housing Act 1988 section 8 (as amended)</strong></p>
<h1>NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION</h1>
<h2>OF A PROPERTY IN ENGLAND</h2>
<p>let on an Assured Tenancy or an Assured Agricultural Occupancy</p>
</div>

<hr>

<div class="section">
<p><span class="section-num">1. To:</span></p>
<div class="field-value">{SAMPLE_DATA["tenant_name"]}</div>
</div>

<div class="section">
<p><span class="section-num">2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:</span></p>
<div class="field-value">{SAMPLE_DATA["property_address"]}</div>
</div>

<div class="section">
<p><span class="section-num">3. Your landlord/licensor intends to seek possession on ground(s):</span></p>
<div class="field-value"><strong>Grounds {SAMPLE_DATA["s8_grounds"]}</strong></div>
<p>in Schedule 2 to the Housing Act 1988 (as amended), which read(s):</p>
<div class="field-value" style="white-space: pre-wrap;">{SAMPLE_DATA["s8_ground_text"]}</div>
</div>

<div class="section">
<p><span class="section-num">4. Give a full explanation of why each ground is being relied on:</span></p>
<div class="field-value" style="white-space: pre-wrap;">{SAMPLE_DATA["s8_particulars"]}

Current rent arrears: GBP {SAMPLE_DATA["s8_arrears_amount"]}
Monthly rent amount: GBP {SAMPLE_DATA["s8_rent_amount"]}</div>
</div>

<div class="section">
<p><span class="section-num">5. The court proceedings will not begin earlier than:</span></p>
<div class="field-value">{SAMPLE_DATA["s8_earliest_proceedings"]}</div>
</div>

<div class="section">
<p><span class="section-num">6.</span> The latest date for court proceedings to begin is <strong>12 months</strong> from the date of service of this notice.</p>
</div>

<div class="signature-block">
<p><span class="section-num">7. Name and address of landlord, licensor or landlord's agent:</span></p>
<p>(To be completed in full by the landlord, licensor, or, in the case of joint landlords/licensors, at least one of the joint landlords/licensors, or by someone authorised to give notice on the landlord's/licensor's behalf.)</p>

<table style="margin-top: 15px;">
<tr><td style="width: 120px;"><strong>Signed:</strong></td><td>[Signed]</td></tr>
<tr><td><strong>Name:</strong></td><td>{SAMPLE_DATA["landlord_name"]}</td></tr>
<tr><td><strong>Address:</strong></td><td>{SAMPLE_DATA["landlord_address"]}</td></tr>
<tr><td><strong>Telephone:</strong></td><td>{SAMPLE_DATA["landlord_phone"]}</td></tr>
</table>

<p style="margin-top: 15px;"><strong>Capacity (please tick):</strong></p>
<p class="checkbox">[X] landlord/licensor &nbsp;&nbsp; [ ] joint landlord(s)/licensor(s) &nbsp;&nbsp; [ ] landlord's/licensor's agent</p>

<p style="margin-top: 15px;"><strong>Date:</strong> {SAMPLE_DATA["s8_date_served"]}</p>
</div>

<hr>
<p style="text-align: center; font-style: italic;">This notice was served on: {SAMPLE_DATA["s8_date_served"]}</p>

</body>
</html>
"""


def create_section21_html() -> str:
    """Create HTML content for Section 21 Form 6A."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Form 6A - Section 21 Notice</title>
<style>
body {{ font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; margin: 40px; }}
h1 {{ font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 5px; }}
h2 {{ font-size: 12pt; font-weight: bold; text-align: center; margin-top: 5px; }}
.header {{ text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }}
.form-no {{ font-size: 16pt; font-weight: bold; }}
.section {{ margin-bottom: 15px; }}
.section-num {{ font-weight: bold; }}
.field-value {{ background-color: #f0f0f0; padding: 5px; border: 1px solid #ccc; margin: 5px 0; }}
.signature-block {{ margin-top: 30px; border-top: 1px solid black; padding-top: 20px; }}
.checkbox {{ font-family: 'Courier New', monospace; }}
hr {{ border: none; border-top: 1px solid black; margin: 20px 0; }}
</style>
</head>
<body>

<div class="header">
<p class="form-no">FORM NO. 6A</p>
<p><strong>Housing Act 1988 section 21(1) and (4) (as amended)</strong></p>
<h1>NOTICE REQUIRING POSSESSION</h1>
<h2>OF A PROPERTY IN ENGLAND</h2>
<p>let on an Assured Shorthold Tenancy</p>
</div>

<hr>

<div class="section">
<p><span class="section-num">1. To:</span></p>
<div class="field-value">{SAMPLE_DATA["tenant_name"]}</div>
</div>

<div class="section">
<p><span class="section-num">2. You are required to leave the below address after:</span></p>
<div class="field-value">{SAMPLE_DATA["s21_expiry_date"]}</div>

<p>If you do not leave, your landlord may apply to the court for an order under Section 21(1) or (4) of the Housing Act 1988 requiring you to give up possession of:</p>
<div class="field-value">{SAMPLE_DATA["property_address"]}</div>

<p style="margin-top: 10px;">If your landlord does not apply to the court within a given timeframe this notice will lapse. Your landlord can rely on this notice to apply to the court during the period of 6 months commencing from the date this notice is given to you.</p>
</div>

<div class="signature-block">
<p><span class="section-num">3. Name and address of landlord or landlord's agent:</span></p>
<p>(To be completed in full by the landlord, or, in the case of joint landlords, at least one of the joint landlords, or by someone authorised to give notice on the landlord's behalf.)</p>

<table style="margin-top: 15px;">
<tr><td style="width: 120px;"><strong>Signed:</strong></td><td>[Signed]</td></tr>
<tr><td><strong>Name:</strong></td><td>{SAMPLE_DATA["landlord_name"]}</td></tr>
<tr><td><strong>Address:</strong></td><td>{SAMPLE_DATA["landlord_address"]}</td></tr>
<tr><td><strong>Telephone:</strong></td><td>{SAMPLE_DATA["landlord_phone"]}</td></tr>
</table>

<p style="margin-top: 15px;"><strong>Capacity (please tick):</strong></p>
<p class="checkbox">[X] landlord &nbsp;&nbsp; [ ] joint landlord(s) &nbsp;&nbsp; [ ] landlord's agent</p>

<p style="margin-top: 15px;"><strong>Date:</strong> {SAMPLE_DATA["s21_service_date"]}</p>
</div>

<hr>
<p style="text-align: center; font-style: italic;">This notice was served on: {SAMPLE_DATA["s21_service_date"]}</p>

</body>
</html>
"""


def convert_html_to_pdf(html_content: str, output_path: Path) -> Path:
    """Convert HTML content to PDF using LibreOffice."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(html_content)
        html_file = Path(f.name)

    try:
        # Convert HTML to PDF
        result = subprocess.run([
            'soffice', '--headless', '--convert-to', 'pdf',
            '--outdir', str(output_path.parent),
            str(html_file)
        ], capture_output=True, text=True, timeout=60)

        # Rename output file to desired name
        generated_pdf = output_path.parent / (html_file.stem + '.pdf')
        if generated_pdf.exists() and generated_pdf != output_path:
            generated_pdf.rename(output_path)

        if not output_path.exists():
            print(f"  Warning: PDF not created. stderr: {result.stderr}")
            return None

        return output_path

    finally:
        html_file.unlink(missing_ok=True)


def convert_html_to_odt(html_content: str, output_path: Path) -> Path:
    """Convert HTML content to ODT using LibreOffice."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(html_content)
        html_file = Path(f.name)

    try:
        # Convert HTML to ODT
        result = subprocess.run([
            'soffice', '--headless', '--convert-to', 'odt',
            '--outdir', str(output_path.parent),
            str(html_file)
        ], capture_output=True, text=True, timeout=60)

        # Rename output file to desired name
        generated_odt = output_path.parent / (html_file.stem + '.odt')
        if generated_odt.exists() and generated_odt != output_path:
            generated_odt.rename(output_path)

        if not output_path.exists():
            print(f"  Warning: ODT not created. stderr: {result.stderr}")
            return None

        return output_path

    finally:
        html_file.unlink(missing_ok=True)


def main():
    """Main entry point."""
    print("=" * 60)
    print("Creating Official Form Fixtures")
    print("=" * 60)

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Section 8 Form 3
    print("\n--- Section 8 Form 3 ---")
    s8_html = create_section8_html()

    s8_odt = OUTPUT_DIR / "completed_section_8_form_3.odt"
    s8_pdf = OUTPUT_DIR / "completed_section_8_form_3.pdf"

    print(f"Creating ODT: {s8_odt.name}...")
    convert_html_to_odt(s8_html, s8_odt)

    print(f"Creating PDF: {s8_pdf.name}...")
    convert_html_to_pdf(s8_html, s8_pdf)

    # Section 21 Form 6A
    print("\n--- Section 21 Form 6A ---")
    s21_html = create_section21_html()

    s21_odt = OUTPUT_DIR / "completed_section_21_form_6a.odt"
    s21_pdf = OUTPUT_DIR / "completed_section_21_form_6a.pdf"

    print(f"Creating ODT: {s21_odt.name}...")
    convert_html_to_odt(s21_html, s21_odt)

    print(f"Creating PDF: {s21_pdf.name}...")
    convert_html_to_pdf(s21_html, s21_pdf)

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print("\nCreated files:")
    for f in sorted(OUTPUT_DIR.iterdir()):
        size = f.stat().st_size
        print(f"  - {f.name} ({size:,} bytes)")

    # Verify files exist
    all_files = [s8_odt, s8_pdf, s21_odt, s21_pdf]
    missing = [f for f in all_files if not f.exists()]
    if missing:
        print(f"\nWarning: Missing files: {[f.name for f in missing]}")
        return 1

    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    exit(main())
