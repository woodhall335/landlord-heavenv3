/**
 * N1 Field Position Mapper
 *
 * This script maps the generic field names (Text Field 48, Check Box39, etc.)
 * to their actual positions and purposes in the N1 form by analyzing field coordinates.
 */

import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';

const N1_PATH = join(process.cwd(), 'public', 'official-forms', 'N1_1224.pdf');

async function mapN1FieldsByPosition() {
  console.log('📄 Analyzing N1 Form Field Positions\n');
  console.log('='.repeat(80));

  const pdfBytes = readFileSync(N1_PATH);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`\nTotal fields found: ${fields.length}\n`);

  // Group fields by page
  const fieldsByPage: { [key: number]: any[] } = {};

  fields.forEach((field) => {
    const fieldName = field.getName();
    const widgets = (field as any).acroField.getWidgets();

    widgets.forEach((widget: any) => {
      const pageRef = widget.P();
      if (!pageRef) return;

      const pages = pdfDoc.getPages();
      const pageIndex = pages.findIndex((page) => (page as any).ref === pageRef);

      if (pageIndex >= 0) {
        if (!fieldsByPage[pageIndex]) {
          fieldsByPage[pageIndex] = [];
        }

        const rect = widget.getRectangle();
        fieldsByPage[pageIndex].push({
          name: fieldName,
          type: field.constructor.name,
          page: pageIndex + 1,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    });
  });

  // Sort fields by page and Y position (top to bottom)
  Object.keys(fieldsByPage).forEach((pageNum) => {
    const page = parseInt(pageNum);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`PAGE ${page + 1}`);
    console.log('='.repeat(80));

    const pageFields = fieldsByPage[page];
    // Sort by Y position (descending - top to bottom in PDF coordinates)
    pageFields.sort((a, b) => b.y - a.y);

    pageFields.forEach((field, index) => {
      console.log(`\n${index + 1}. ${field.name}`);
      console.log(`   Type: ${field.type}`);
      console.log(`   Position: (${field.x.toFixed(1)}, ${field.y.toFixed(1)})`);
      console.log(`   Size: ${field.width.toFixed(1)} x ${field.height.toFixed(1)}`);

      // Guess the purpose based on position
      const purpose = guessFieldPurpose(field, page);
      if (purpose) {
        console.log(`   📌 Likely: ${purpose}`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Field mapping analysis complete!\n');
}

function guessFieldPurpose(field: any, page: number): string | null {
  const { _name, y, height, width, type } = field;

  // Page 0 (First page)
  if (page === 0) {
    if (y > 700) return 'Top section (Court name / Fee account)';
    if (y > 550 && y < 700 && height > 50) return 'Claimant details (large text area)';
    if (y > 400 && y < 550 && height > 50) return 'Defendant details (large text area)';
    if (y > 200 && y < 400 && height > 80) return 'Brief details of claim (large text area)';
    if (y > 100 && y < 200 && height > 40) return 'Value section';
    if (y > 50 && y < 150 && width < 200) return 'Defendant service address (left box)';
    if (y > 0 && y < 100) return 'Amount/Fees section (bottom right)';
  }

  // Page 1 (Second page)
  if (page === 1) {
    if (y > 600) return 'Preferred County Court Hearing Centre';
    if (y > 400 && y < 600) return 'Vulnerability question area';
    if (type === 'PDFCheckBox' && y > 400 && y < 600) return 'Vulnerability Yes/No checkbox';
    if (type === 'PDFCheckBox' && y < 400) return 'Human Rights Act Yes/No checkbox';
  }

  // Page 2 (Third page - Particulars)
  if (page === 2) {
    if (type === 'PDFCheckBox' && y > 600) return 'Particulars attached/to follow checkbox';
    if (height > 400) return 'Particulars of Claim text area';
  }

  // Page 3 (Fourth page - Statement of Truth)
  if (page === 3) {
    if (type === 'PDFCheckBox' && y > 500) return 'Statement of Truth belief checkbox';
    if (height > 40 && y > 400 && y < 500) return 'Signature box';
    if (type === 'PDFCheckBox' && y > 300 && y < 450) return 'Signatory type checkbox';
    if (width < 60 && y > 200 && y < 350) return 'Date field (Day/Month/Year)';
    if (y > 150 && y < 250) return 'Full name / Legal rep firm';
    if (y < 150) return 'Position/Office held';
  }

  // Page 4 (Fifth page - Address for service)
  if (page === 4) {
    if (y > 600) return 'Building and street';
    if (y > 550 && y < 650) return 'Second line of address';
    if (y > 500 && y < 580) return 'Town or city';
    if (y > 450 && y < 530) return 'County';
    if (y > 400 && y < 480 && width < 150) return 'Postcode';
    if (y > 300 && y < 420) return 'Phone number';
    if (y > 200 && y < 320) return 'DX number';
    if (y > 100 && y < 220) return 'Your Ref';
    if (y < 150) return 'Email';
  }

  return null;
}

// Run the mapping
mapN1FieldsByPosition().catch(console.error);
