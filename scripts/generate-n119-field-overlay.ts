/**
 * N119 Field Overlay Generator
 *
 * Creates a visual debug overlay of the N119 PDF form showing:
 * 1. A rectangle around every AcroForm field
 * 2. Field name labels next to each rectangle
 * 3. A JSON report of all field positions
 *
 * This helps identify which fields are physically located under Q2, Q3(b), and Q6.
 *
 * Usage:
 *   npx ts-node scripts/generate-n119-field-overlay.ts
 *
 * Output:
 *   - tests/output/n119-debug-overlay.pdf
 *   - tests/output/n119-fields.json
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFField, PDFFont } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const FORMS_DIR = join(process.cwd(), 'public', 'official-forms');
const OUTPUT_DIR = join(process.cwd(), 'tests', 'output');

// Field info structure for JSON output
interface FieldInfo {
  fieldName: string;
  type: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  widgets: number;
  shortId: string;
}

// Color coding by field type
const COLORS = {
  text: rgb(0, 0, 1),       // Blue for text fields
  checkbox: rgb(0, 0.7, 0), // Green for checkboxes
  other: rgb(0.7, 0, 0.7),  // Purple for other
};

/**
 * Get field rectangle from widgets
 */
function getFieldRectangle(field: PDFField): { page: number; x: number; y: number; width: number; height: number } | null {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets.length === 0) return null;

    const widget = widgets[0];
    const rect = widget.getRectangle();
    const pageRef = widget.P();

    // Get page index
    let pageIndex = 0;
    if (pageRef) {
      // Try to find which page this widget is on
      // This is a simplification - we'll use the page ref to identify
      pageIndex = 0; // Default to first page, will be updated below
    }

    return {
      page: pageIndex,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Create a short ID for labeling
 */
function createShortId(index: number): string {
  return `F${index.toString().padStart(2, '0')}`;
}

/**
 * Truncate field name for label (keep first 25 chars)
 */
function truncateForLabel(name: string, maxLen: number = 25): string {
  if (name.length <= maxLen) return name;
  return name.substring(0, maxLen) + '...';
}

async function generateOverlay() {
  console.log('🔍 N119 Field Overlay Generator\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load the N119 PDF
  const pdfPath = join(FORMS_DIR, 'n119-eng.pdf');
  console.log(`📄 Loading: ${pdfPath}`);

  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const pages = pdfDoc.getPages();

  console.log(`📊 Found ${fields.length} fields across ${pages.length} pages\n`);

  // Embed a standard font for labels
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Collect field info for JSON output
  const fieldInfoList: FieldInfo[] = [];

  // Map field widgets to pages
  const fieldsByPage: Map<number, { field: PDFField; rect: any; shortId: string; type: string }[]> = new Map();

  fields.forEach((field, index) => {
    const name = field.getName();
    const type = field.constructor.name;
    const shortId = createShortId(index + 1);

    // Get all widgets for this field
    const widgets = field.acroField.getWidgets();

    widgets.forEach((widget, widgetIdx) => {
      try {
        const rect = widget.getRectangle();
        const pageRef = widget.P();

        // Find the page index for this widget
        let pageIndex = 0;
        for (let i = 0; i < pages.length; i++) {
          const pageRef2 = pages[i].ref;
          if (pageRef && pageRef2 && pageRef.toString() === pageRef2.toString()) {
            pageIndex = i;
            break;
          }
        }

        // Store field info
        if (widgetIdx === 0) {
          fieldInfoList.push({
            fieldName: name,
            type: type.replace('PDF', ''),
            page: pageIndex + 1, // 1-indexed for human readability
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            widgets: widgets.length,
            shortId,
          });
        }

        // Group by page for drawing
        if (!fieldsByPage.has(pageIndex)) {
          fieldsByPage.set(pageIndex, []);
        }
        fieldsByPage.get(pageIndex)!.push({
          field,
          rect,
          shortId: widgets.length > 1 ? `${shortId}.${widgetIdx + 1}` : shortId,
          type,
        });
      } catch (e) {
        console.warn(`⚠️ Could not get rectangle for widget ${widgetIdx} of field: ${name}`);
      }
    });
  });

  // Draw rectangles and labels on each page
  for (const [pageIndex, pageFields] of fieldsByPage) {
    const page = pages[pageIndex];

    for (const { field, rect, shortId, type } of pageFields) {
      // Determine color based on type
      const color = type.includes('Text') ? COLORS.text :
                    type.includes('Check') || type.includes('Button') ? COLORS.checkbox :
                    COLORS.other;

      // Draw rectangle border
      page.drawRectangle({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        borderColor: color,
        borderWidth: 1,
        opacity: 0.7,
      });

      // Draw field ID label (small, above the field)
      const labelText = shortId;
      const fontSize = 6;
      const labelY = rect.y + rect.height + 2;

      page.drawText(labelText, {
        x: rect.x,
        y: labelY,
        size: fontSize,
        font,
        color,
      });
    }
  }

  // Save the overlay PDF
  const overlayPdfPath = join(OUTPUT_DIR, 'n119-debug-overlay.pdf');
  const overlayBytes = await pdfDoc.save();
  writeFileSync(overlayPdfPath, overlayBytes);
  console.log(`✅ Overlay PDF saved: ${overlayPdfPath}`);

  // Sort fields by page, then by Y position (top to bottom)
  fieldInfoList.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return b.y - a.y; // Higher Y is higher on page
  });

  // Save the JSON report
  const jsonPath = join(OUTPUT_DIR, 'n119-fields.json');
  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    totalFields: fields.length,
    totalPages: pages.length,
    fields: fieldInfoList,
    // Create a lookup table from shortId to full name
    idToName: Object.fromEntries(fieldInfoList.map((f) => [f.shortId, f.fieldName])),
    // Create a lookup table from name to shortId
    nameToId: Object.fromEntries(fieldInfoList.map((f) => [f.fieldName, f.shortId])),
  };

  writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`✅ Field JSON saved: ${jsonPath}`);

  // Print summary organized by question sections
  console.log('\n' + '='.repeat(80));
  console.log('FIELD POSITION SUMMARY');
  console.log('='.repeat(80));

  // Group fields by approximate question number
  const questionGroups: Record<string, FieldInfo[]> = {
    'Header': [],
    'Q1 Property': [],
    'Q2 Persons in Possession': [],
    'Q3 Tenancy': [],
    'Q4 Reasons': [],
    'Q5 Steps Taken': [],
    'Q6 Notice': [],
    'Q7-10 Other': [],
    'Q11-15 Demotion': [],
    'Statement of Truth': [],
  };

  for (const field of fieldInfoList) {
    const name = field.fieldName.toLowerCase();
    if (name.includes('court') || name.includes('claim no') || name.includes('claimant') || name.includes('defendant')) {
      questionGroups['Header'].push(field);
    } else if (name.includes('right to possession') || name.includes('possession of:')) {
      questionGroups['Q1 Property'].push(field);
    } else if (name.includes('knowledge') || name.includes('persons are in possession')) {
      questionGroups['Q2 Persons in Possession'].push(field);
    } else if (name.startsWith('3(') || name.includes('rent') || name.includes('tenancy')) {
      questionGroups['Q3 Tenancy'].push(field);
    } else if (name.startsWith('4.')) {
      questionGroups['Q4 Reasons'].push(field);
    } else if (name.startsWith('5.')) {
      questionGroups['Q5 Steps Taken'].push(field);
    } else if (name.startsWith('6.') || name.includes('notice')) {
      questionGroups['Q6 Notice'].push(field);
    } else if (name.startsWith('7.') || name.startsWith('8.') || name.startsWith('9.') || name.startsWith('10.')) {
      questionGroups['Q7-10 Other'].push(field);
    } else if (name.startsWith('11.') || name.startsWith('12.') || name.startsWith('13.') || name.startsWith('14.') || name.startsWith('15.')) {
      questionGroups['Q11-15 Demotion'].push(field);
    } else if (name.includes('statement of truth') || name.includes('signature') || name.includes('signing') || name.includes('solicitor') || name.includes('believe')) {
      questionGroups['Statement of Truth'].push(field);
    } else {
      questionGroups['Q7-10 Other'].push(field);
    }
  }

  for (const [section, sectionFields] of Object.entries(questionGroups)) {
    if (sectionFields.length === 0) continue;

    console.log(`\n📋 ${section}:`);
    for (const field of sectionFields) {
      const typeLabel = field.type === 'TextField' ? 'TXT' : field.type === 'CheckBox' ? 'CHK' : field.type;
      console.log(`   ${field.shortId} [${typeLabel}] Page ${field.page}, Y=${field.y}, H=${field.height}`);
      console.log(`      → "${truncateForLabel(field.fieldName, 60)}"`);
    }
  }

  // Specifically highlight Q2, Q3(b), Q6 fields
  console.log('\n' + '='.repeat(80));
  console.log('KEY FIELDS FOR Q2, Q3(b), Q6:');
  console.log('='.repeat(80));

  const keyFields = fieldInfoList.filter((f) =>
    f.fieldName.includes('knowledge') ||
    f.fieldName.includes('payable each') ||
    f.fieldName.startsWith('6.') ||
    f.fieldName.toLowerCase().includes('notice')
  );

  console.log('\n🎯 Q2 (Persons in Possession):');
  for (const f of keyFields.filter((f) => f.fieldName.includes('knowledge'))) {
    console.log(`   ${f.shortId}: "${f.fieldName}"`);
    console.log(`   Position: Page ${f.page}, X=${f.x}, Y=${f.y}, W=${f.width}, H=${f.height}`);
  }

  console.log('\n🎯 Q3(b) (Rent Frequency):');
  for (const f of keyFields.filter((f) => f.fieldName.includes('payable each'))) {
    console.log(`   ${f.shortId}: "${f.fieldName}"`);
    console.log(`   Position: Page ${f.page}, X=${f.x}, Y=${f.y}, W=${f.width}, H=${f.height}`);
  }

  console.log('\n🎯 Q6 (Notice):');
  for (const f of keyFields.filter((f) => f.fieldName.startsWith('6.'))) {
    console.log(`   ${f.shortId}: "${f.fieldName}"`);
    console.log(`   Position: Page ${f.page}, X=${f.x}, Y=${f.y}, W=${f.width}, H=${f.height}`);
  }

  console.log('\n✅ Overlay generation complete!');
  console.log(`\nTo view the overlay, open: ${overlayPdfPath}`);
  console.log(`Field data available in: ${jsonPath}`);
}

// Run the generator
generateOverlay().catch(console.error);
