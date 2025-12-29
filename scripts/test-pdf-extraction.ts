#!/usr/bin/env npx ts-node
/**
 * Test script for PDF text extraction
 * Run with: npx ts-node scripts/test-pdf-extraction.ts <path-to-pdf>
 */

import * as fs from 'fs';
import * as path from 'path';

// Polyfill for pdfjs-dist in Node.js environment
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).document === 'undefined') {
  (globalThis as any).document = {
    createElement: () => ({ getContext: () => null }),
    documentElement: { style: {} },
  };
}

async function extractPdfText(filePath: string): Promise<string> {
  console.log('Reading file:', filePath);
  const buffer = fs.readFileSync(filePath);
  console.log('File size:', buffer.length, 'bytes');

  try {
    console.log('Importing pdfjs-dist...');
    const pdfjsModule = await import('pdfjs-dist');
    const pdfjsLib = pdfjsModule.default || pdfjsModule;
    console.log('pdfjs-dist loaded, keys:', Object.keys(pdfjsLib));

    const getDocument = pdfjsLib.getDocument;
    if (!getDocument) {
      throw new Error('getDocument not found in pdfjs-dist');
    }

    // Disable worker
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    }

    const data = new Uint8Array(buffer);
    console.log('Loading PDF document...');

    const loadingTask = getDocument({
      data,
      disableFontFace: true,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    console.log('PDF loaded, pages:', pdf.numPages);

    const textParts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 5);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Extracting text from page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      textParts.push(pageText);
      console.log(`Page ${pageNum}: ${pageText.length} characters`);
    }

    return textParts.join('\n');
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
    console.log('Example: npx ts-node scripts/test-pdf-extraction.ts fixtures/test.pdf');
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
