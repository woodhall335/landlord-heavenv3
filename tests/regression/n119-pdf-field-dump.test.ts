/**
 * N119 PDF Field Dump Test
 *
 * This test dumps all field names from the official N119 PDF form to verify:
 * 1. What fields are available
 * 2. What the exact field names are
 * 3. Which fields correspond to Q2, Q6, and frequency
 */

import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

describe('N119 PDF Field Dump', () => {
  it('should dump all field names from n119-eng.pdf', async () => {
    const pdfPath = path.join(process.cwd(), 'public/official-forms/n119-eng.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('\n\n=== N119 PDF FIELD DUMP ===\n');
    console.log(`Total fields: ${fields.length}\n`);

    // Categorize fields
    const textFields: string[] = [];
    const checkboxFields: string[] = [];
    const otherFields: string[] = [];

    fields.forEach((field) => {
      const name = field.getName();
      const type = field.constructor.name;

      if (type.includes('Text')) {
        textFields.push(name);
      } else if (type.includes('Check') || type.includes('Button')) {
        checkboxFields.push(name);
      } else {
        otherFields.push(`${name} (${type})`);
      }
    });

    console.log('--- TEXT FIELDS ---');
    textFields.forEach((name, i) => console.log(`${i + 1}. "${name}"`));

    console.log('\n--- CHECKBOX/BUTTON FIELDS ---');
    checkboxFields.forEach((name, i) => console.log(`${i + 1}. "${name}"`));

    if (otherFields.length > 0) {
      console.log('\n--- OTHER FIELDS ---');
      otherFields.forEach((name, i) => console.log(`${i + 1}. ${name}`));
    }

    console.log('\n=== FIELD ANALYSIS ===\n');

    // Find Q2 fields (occupants/persons in possession)
    const q2Fields = fields.filter((f) =>
      f.getName().toLowerCase().includes('possession') ||
      f.getName().toLowerCase().includes('occupant') ||
      f.getName().includes('knowledge')
    );
    console.log('Q2 (Persons in Possession) candidates:');
    q2Fields.forEach((f) => console.log(`  - "${f.getName()}"`));

    // Find Q6 fields (notice served)
    const q6Fields = fields.filter((f) =>
      f.getName().toLowerCase().includes('notice') ||
      f.getName().includes('6.')
    );
    console.log('\nQ6 (Notice Served) candidates:');
    q6Fields.forEach((f) => console.log(`  - "${f.getName()}"`));

    // Find frequency fields
    const freqFields = fields.filter((f) =>
      f.getName().toLowerCase().includes('week') ||
      f.getName().toLowerCase().includes('fortnight') ||
      f.getName().toLowerCase().includes('month') ||
      f.getName().toLowerCase().includes('payable')
    );
    console.log('\nFrequency candidates:');
    freqFields.forEach((f) => console.log(`  - "${f.getName()}"`));

    // Verify we found fields
    expect(fields.length).toBeGreaterThan(0);
    expect(textFields.length).toBeGreaterThan(0);
  });

  it('should verify critical field names match code constants', async () => {
    const pdfPath = path.join(process.cwd(), 'public/official-forms/n119-eng.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fieldNames = form.getFields().map((f) => f.getName());

    // Expected critical field names - use curly apostrophe (U+2019) as in PDF
    const expectedFields = {
      // Uses curly apostrophe - must match PDF exactly
      OCCUPANTS: "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:",
      NOTICE_DATE_DAY_MONTH: '6. Day and month notice served',
      NOTICE_DATE_YEAR: '6. Year notice served',
      NOTICE_OTHER_TYPE: '6. Other type of notice',
      RENT_WEEKLY: '3(b) The current rent is payable each week',
      RENT_FORTNIGHTLY: '3(b) The current rent is payable each fortnight',
      RENT_MONTHLY: '3(b) The current rent is payable each month',
    };

    console.log('\n=== CRITICAL FIELD VERIFICATION ===\n');

    for (const [key, expectedName] of Object.entries(expectedFields)) {
      const exists = fieldNames.includes(expectedName);
      console.log(`${key}: "${expectedName}" - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

      if (!exists) {
        // Try to find similar field names
        const similar = fieldNames.filter((n) =>
          n.toLowerCase().includes(key.toLowerCase()) ||
          expectedName
            .split(' ')
            .slice(0, 3)
            .some((word) => n.toLowerCase().includes(word.toLowerCase()))
        );
        if (similar.length > 0) {
          console.log(`  Similar fields found:`);
          similar.forEach((s) => console.log(`    - "${s}"`));
        }
      }
    }

    // All critical fields should exist
    for (const expectedName of Object.values(expectedFields)) {
      expect(fieldNames).toContain(expectedName);
    }
  });
});
