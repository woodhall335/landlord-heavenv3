/**
 * Script to create placeholder PDFs for Scottish Simple Procedure (money claim) forms
 * These are minimal PDFs that allow the system to load and test while awaiting official forms
 */

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPlaceholderPDF(filename, title, description) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  // Title
  page.drawText(title, {
    x: 50,
    y: height - 100,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Placeholder notice
  page.drawText('PLACEHOLDER - AWAITING OFFICIAL FORM', {
    x: 50,
    y: height - 140,
    size: 14,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });

  // Description
  const descriptionLines = description.match(/.{1,80}/g) || [description];
  let yPosition = height - 180;

  descriptionLines.forEach(line => {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  });

  // Footer
  page.drawText('This placeholder PDF allows system testing while official forms are being obtained.', {
    x: 50,
    y: 50,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, '..', 'public', 'official-forms', 'scotland', filename);
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`✓ Created ${filename}`);
}

async function main() {
  console.log('Creating Scottish Simple Procedure placeholder PDFs...\n');

  await createPlaceholderPDF(
    'simple_procedure_claim_form.pdf',
    'Simple Procedure Claim Form (Form 3A)',
    'Official Scottish Courts and Tribunals Service form for initiating Simple Procedure claims (up to £5,000). This form is used for claims including rent arrears, damages, and other civil monetary disputes in the Sheriff Court.'
  );

  await createPlaceholderPDF(
    'simple_procedure_response_form.pdf',
    'Simple Procedure Response Form (Form 4A)',
    'Official form for respondents to admit or dispute Simple Procedure claims. While primarily for defendants, having this form helps provide complete pack context for claimants.'
  );

  console.log('\n✓ All Scottish Simple Procedure placeholder PDFs created successfully!');
}

main().catch(err => {
  console.error('Error creating placeholder PDFs:', err);
  process.exit(1);
});
