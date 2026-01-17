#!/usr/bin/env tsx
/**
 * RENDER NOTICE ONLY SNAPSHOTS
 *
 * Generates visual snapshots (PNG) of Notice Only PDFs for visual QA.
 * Converts PDF pages to images for regression testing and layout verification.
 *
 * Output: artifacts/notice_only/_snapshots/<route>/page-{N}.png
 *
 * Usage:
 *   npx tsx scripts/render-notice-only-snapshots.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');
const SNAPSHOTS_DIR = path.join(ARTIFACTS_DIR, '_snapshots');

interface SnapshotResult {
  pdfPath: string;
  route: string;
  pages: number;
  snapshotPaths: string[];
  success: boolean;
  error?: string;
}

/**
 * Find all PDF files in artifacts/notice_only/
 */
async function findPDFs(): Promise<Array<{ path: string; route: string }>> {
  const pdfs: Array<{ path: string; route: string }> = [];

  async function scan(dir: string, relativePath: string = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

      if (entry.name === '_snapshots' || entry.name === '_reports') {
        continue; // Skip snapshot and report directories
      }

      if (entry.isDirectory()) {
        await scan(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
        // Route is the directory structure (e.g., "england/form_3_section8")
        const route = relativePath || 'root';
        pdfs.push({ path: fullPath, route });
      }
    }
  }

  await scan(ARTIFACTS_DIR);
  return pdfs;
}

/**
 * Check if PDF-to-image conversion tool is available
 */
async function checkPdfConversionTool(): Promise<{
  available: boolean;
  tool: 'pdftoppm' | 'pdftocairo' | 'ghostscript' | 'none';
  command: string | null;
}> {
  // Try pdftoppm (from poppler-utils) - best quality
  try {
    await execAsync('pdftoppm -v');
    return { available: true, tool: 'pdftoppm', command: 'pdftoppm -png -singlefile -r 150' };
  } catch {}

  // Try pdftocairo (from poppler-utils) - also good
  try {
    await execAsync('pdftocairo -v');
    return { available: true, tool: 'pdftocairo', command: 'pdftocairo -png -singlefile -r 150' };
  } catch {}

  // Try ghostscript - widely available but slower
  try {
    await execAsync('gs -v');
    return { available: true, tool: 'ghostscript', command: 'gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r150' };
  } catch {}

  return { available: false, tool: 'none', command: null };
}

/**
 * Convert PDF pages to PNG using available tool
 */
async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  tool: { tool: string; command: string }
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const baseName = path.basename(pdfPath, '.pdf');
  const snapshotPaths: string[] = [];

  if (tool.tool === 'pdftoppm' || tool.tool === 'pdftocairo') {
    // Use pdftoppm or pdftocairo for each page
    try {
      // Get page count first
      const { stdout: pageInfo } = await execAsync(`pdfinfo "${pdfPath}" 2>/dev/null || echo "Pages: 1"`);
      const pageMatch = pageInfo.match(/Pages:\s+(\d+)/);
      const pageCount = pageMatch ? parseInt(pageMatch[1]) : 1;

      // Convert each page
      for (let i = 1; i <= Math.min(pageCount, 3); i++) {
        // Limit to first 3 pages
        const outputPath = path.join(outputDir, `page-${i}.png`);
        const cmd =
          tool.tool === 'pdftoppm'
            ? `pdftoppm -png -f ${i} -l ${i} -r 150 "${pdfPath}" "${path.join(outputDir, `page-${i}`)}" && mv "${path.join(outputDir, `page-${i}-1.png`)}" "${outputPath}" 2>/dev/null || true`
            : `pdftocairo -png -f ${i} -l ${i} -r 150 "${pdfPath}" "${path.join(outputDir, `page-${i}`)}" && mv "${path.join(outputDir, `page-${i}-01.png`)}" "${outputPath}" 2>/dev/null || true`;

        try {
          await execAsync(cmd);
          if (existsSync(outputPath)) {
            snapshotPaths.push(outputPath);
          }
        } catch (e) {
          // Page might not exist
          break;
        }
      }
    } catch (error: any) {
      console.warn(`Warning: Could not get page count for ${pdfPath}`);
      // Fall back to converting first page only
      const outputPath = path.join(outputDir, 'page-1.png');
      const cmd =
        tool.tool === 'pdftoppm'
          ? `pdftoppm -png -f 1 -l 1 -r 150 "${pdfPath}" "${path.join(outputDir, 'page-1')}"`
          : `pdftocairo -png -f 1 -l 1 -r 150 "${pdfPath}" "${path.join(outputDir, 'page-1')}"`;
      await execAsync(cmd);

      // pdftoppm creates page-1-1.png, pdftocairo creates page-1-01.png
      const generatedFile = tool.tool === 'pdftoppm'
        ? path.join(outputDir, 'page-1-1.png')
        : path.join(outputDir, 'page-1-01.png');

      if (existsSync(generatedFile)) {
        await fs.rename(generatedFile, outputPath);
        snapshotPaths.push(outputPath);
      }
    }
  } else if (tool.tool === 'ghostscript') {
    // Use ghostscript
    const outputPath = path.join(outputDir, 'page-%d.png');
    await execAsync(`gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r150 -dFirstPage=1 -dLastPage=3 -sOutputFile="${outputPath}" "${pdfPath}"`);

    // Find generated files
    for (let i = 1; i <= 3; i++) {
      const pagePath = path.join(outputDir, `page-${i}.png`);
      if (existsSync(pagePath)) {
        snapshotPaths.push(pagePath);
      }
    }
  }

  return snapshotPaths;
}

/**
 * Render snapshot for a PDF
 */
async function renderSnapshot(
  pdf: { path: string; route: string },
  tool: { tool: string; command: string }
): Promise<SnapshotResult> {
  try {
    const snapshotDir = path.join(SNAPSHOTS_DIR, pdf.route);
    const snapshotPaths = await convertPdfToImages(pdf.path, snapshotDir, tool);

    return {
      pdfPath: pdf.path,
      route: pdf.route,
      pages: snapshotPaths.length,
      snapshotPaths,
      success: snapshotPaths.length > 0,
      error: snapshotPaths.length === 0 ? 'No pages rendered' : undefined,
    };
  } catch (error: any) {
    return {
      pdfPath: pdf.path,
      route: pdf.route,
      pages: 0,
      snapshotPaths: [],
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         NOTICE ONLY PDF SNAPSHOT RENDERER                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check for PDF conversion tool
  console.log('🔍 Checking for PDF-to-image conversion tools...');
  const toolCheck = await checkPdfConversionTool();

  if (!toolCheck.available) {
    console.error('');
    console.error('❌ No PDF-to-image conversion tool found!');
    console.error('');
    console.error('Please install one of the following:');
    console.error('  • poppler-utils (pdftoppm): apt install poppler-utils');
    console.error('  • ghostscript: apt install ghostscript');
    console.error('');
    console.error('These tools are needed to convert PDF pages to PNG images for visual QA.');
    process.exit(1);
  }

  console.log(`✅ Using ${toolCheck.tool} for PDF-to-image conversion`);
  console.log('');

  // Find PDFs
  console.log('📁 Scanning for PDFs in artifacts/notice_only/...');
  const pdfs = await findPDFs();

  if (pdfs.length === 0) {
    console.log('');
    console.log('⚠️  No PDFs found. Run the E2E test first:');
    console.log('   npx tsx scripts/prove-notice-only-e2e.ts');
    console.log('');
    process.exit(0);
  }

  console.log(`📄 Found ${pdfs.length} PDF(s)`);
  console.log('');

  // Render snapshots
  const results: SnapshotResult[] = [];
  for (const pdf of pdfs) {
    console.log(`🖼️  Rendering: ${pdf.route}`);
    const result = await renderSnapshot(pdf, {
      tool: toolCheck.tool,
      command: toolCheck.command!,
    });
    results.push(result);

    if (result.success) {
      console.log(`   ✅ ${result.pages} page(s) rendered`);
      for (const snap of result.snapshotPaths) {
        console.log(`      → ${path.relative(process.cwd(), snap)}`);
      }
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  }

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  const successful = results.filter((r) => r.success).length;
  const totalPages = results.reduce((sum, r) => sum + r.pages, 0);

  console.log(`Total PDFs:        ${pdfs.length}`);
  console.log(`Successful:        ${successful}`);
  console.log(`Failed:            ${pdfs.length - successful}`);
  console.log(`Total Pages:       ${totalPages}`);
  console.log('');
  console.log(`Snapshots saved to: ${path.relative(process.cwd(), SNAPSHOTS_DIR)}`);
  console.log('');

  if (successful < pdfs.length) {
    console.log('⚠️  Some snapshots failed to render - see errors above');
    process.exit(1);
  }

  console.log('✅ All snapshots rendered successfully!');
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
