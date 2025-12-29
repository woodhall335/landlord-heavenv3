#!/usr/bin/env npx ts-node
/**
 * Test script for PDF text extraction
 * Run with: npx ts-node scripts/test-pdf-extraction.ts <path-to-pdf>
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse, VerbosityLevel } from 'pdf-parse';

async function extractPdfText(filePath: string): Promise<string> {
  console.log('Reading file:', filePath);
  const buffer = fs.readFileSync(filePath);
  console.log('File size:', buffer.length, 'bytes');

  try {
    console.log('Creating PDFParse instance...');

    // Get the worker path
    const workerPath = path.resolve(
      process.cwd(),
      'node_modules/pdf-parse/dist/worker/pdf.worker.mjs'
    );
    console.log('Worker path:', workerPath);

    // Convert to file:// URL for Node.js
    const workerUrl = `file://${workerPath}`;
    console.log('Worker URL:', workerUrl);

    // Set worker using file URL
    PDFParse.setWorker(workerUrl);

    const parser = new PDFParse({
      data: buffer,
      verbosity: VerbosityLevel.ERRORS,
      disableFontFace: true,
      useSystemFonts: true,
    });

    console.log('Loading PDF...');
    const info = await parser.getInfo();
    console.log('PDF loaded successfully');
    console.log('Total pages:', info.total);
    console.log('Info:', JSON.stringify(info.info, null, 2));

    console.log('Extracting text...');
    const textResult = await parser.getText({ first: 10 });
    const text = textResult.text;

    await parser.destroy();

    return text || '';
  } catch (error: any) {
    console.error('Extraction failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.log('Usage: npx ts-node scripts/test-pdf-extraction.ts <path-to-pdf>');
    console.log('');
    console.log('Example: npx ts-node scripts/test-pdf-extraction.ts tests/fixtures/sample.pdf');
    process.exit(1);
  }

  const fullPath = path.resolve(pdfPath);
  if (!fs.existsSync(fullPath)) {
    console.error('File not found:', fullPath);
    process.exit(1);
  }

  try {
    const text = await extractPdfText(fullPath);
    console.log('\n=== EXTRACTED TEXT ===\n');
    console.log(text.slice(0, 2000));
    if (text.length > 2000) {
      console.log(`\n... (${text.length - 2000} more characters)`);
    }
    console.log('\n=== END ===');
    console.log(`Total: ${text.length} characters`);
  } catch (error: any) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
}

main();
