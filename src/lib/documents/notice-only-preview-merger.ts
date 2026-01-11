/**
 * Notice Only Pack Preview Merger
 *
 * Merges all Notice Only documents into a single PDF for preview.
 * Used to show users exactly what they're purchasing before payment.
 *
 * NOTE: Watermarks have been removed as part of the simplified UX change.
 * See docs/pdf-watermark-audit.md for details.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { CanonicalJurisdiction } from '../types/jurisdiction';

// ============================================================================
// TYPES
// ============================================================================

export interface NoticeOnlyDocument {
  title: string;
  category: 'notice' | 'guidance' | 'checklist' | 'schedule';
  pdf?: Buffer;
  html?: string;
}

export interface NoticeOnlyPreviewOptions {
  jurisdiction: Extract<CanonicalJurisdiction, 'england' | 'wales' | 'scotland'>;
  notice_type?: 'section_8' | 'section_21' | 'notice_to_leave' | 'wales_section_173' | 'wales_fault_based';
  /** @deprecated Watermarks have been removed from all PDFs */
  watermarkText?: string;
  includeTableOfContents?: boolean;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a complete Notice Only pack preview
 *
 * @param documents - Array of documents to merge (notice, service instructions, etc.)
 * @param options - Preview generation options
 * @returns Buffer containing merged, watermarked PDF
 */
export async function generateNoticeOnlyPreview(
  documents: NoticeOnlyDocument[],
  options: NoticeOnlyPreviewOptions
): Promise<Buffer> {
  console.log('[NOTICE-PREVIEW] Starting preview generation');
  console.log('[NOTICE-PREVIEW] Document count:', documents.length);
  console.log('[NOTICE-PREVIEW] Jurisdiction:', options.jurisdiction);
  console.log('[NOTICE-PREVIEW] Notice type:', options.notice_type);

  // Create merged PDF
  const mergedPdf = await PDFDocument.create();
  const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await mergedPdf.embedFont(StandardFonts.Helvetica);

  // Add table of contents if requested
  if (options.includeTableOfContents) {
    console.log('[NOTICE-PREVIEW] Adding table of contents');
    await addTableOfContents(mergedPdf, documents, options, font, regularFont);
  }

  // Merge all document PDFs
  let totalPages = options.includeTableOfContents ? 1 : 0;

  for (const doc of documents) {
    if (!doc.pdf) {
      console.warn('[NOTICE-PREVIEW] Skipping document without PDF:', doc.title);
      continue;
    }

    try {
      const docPdf = await PDFDocument.load(doc.pdf);
      const pageCount = docPdf.getPageCount();
      const copiedPages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });

      totalPages += pageCount;

      console.log('[NOTICE-PREVIEW] Added:', doc.title, `(${pageCount} pages)`);
    } catch (err) {
      console.error('[NOTICE-PREVIEW] Failed to merge:', doc.title, err);
    }
  }

  // ====================================================================================
  // WATERMARKS REMOVED - Simplified UX Change
  // ====================================================================================
  // All watermarks have been removed from preview PDFs as part of the simplified
  // notice-only validation UX. Server-side validation at /api/wizard/generate
  // remains the hard stop for compliance.
  // See docs/pdf-watermark-audit.md for details on the removal.
  // ====================================================================================
  console.log('[NOTICE-PREVIEW] Watermarks disabled - generating clean preview');

  const pages = mergedPdf.getPages();

  // Calculate page numbering
  // When TOC is included, it occupies exactly 1 page at the start and doesn't get numbered
  const tocPageCount = options.includeTableOfContents ? 1 : 0;
  const totalContentPages = pages.length - tocPageCount;

  // Add page numbers to content pages only (not TOC)
  // Page numbers are 1-indexed and only count content pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width } = page.getSize();

    // Skip TOC pages (they don't get page numbers)
    if (i < tocPageCount) {
      continue;
    }

    // Calculate 1-indexed content page number
    const contentPageNumber = i - tocPageCount + 1;

    page.drawText(`Page ${contentPageNumber} of ${totalContentPages}`, {
      x: width - 100,
      y: 20,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  console.log('[NOTICE-PREVIEW] Added page numbers to', totalContentPages, 'content pages (TOC pages:', tocPageCount, ', total pages:', pages.length, ')');

  // Save and return
  const pdfBytes = await mergedPdf.save();
  console.log('[NOTICE-PREVIEW] Complete. Total size:', (pdfBytes.length / 1024).toFixed(2), 'KB');

  return Buffer.from(pdfBytes);
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

async function addTableOfContents(
  mergedPdf: PDFDocument,
  documents: NoticeOnlyDocument[],
  options: NoticeOnlyPreviewOptions,
  font: any,
  regularFont: any
): Promise<void> {
  const tocPage = mergedPdf.addPage([595, 842]); // A4 size
  const { width, height } = tocPage.getSize();

  let yPos = height - 60;

  // Title
  tocPage.drawText('NOTICE ONLY PACK - PREVIEW', {
    x: 50,
    y: yPos,
    size: 24,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPos -= 40;

  // Jurisdiction - FIX: Properly determine jurisdiction from options and notice_type
  let jurisdictionLabel = 'England';
  if (options.jurisdiction === 'wales') {
    jurisdictionLabel = 'Wales';
  } else if (options.jurisdiction === 'scotland') {
    jurisdictionLabel = 'Scotland';
  }

  tocPage.drawText(`Jurisdiction: ${jurisdictionLabel}`, {
    x: 50,
    y: yPos,
    size: 14,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPos -= 25;

  // Notice type - FIX: Ensure correct labels for each jurisdiction
  if (options.notice_type) {
    const noticeLabel =
      options.notice_type === 'section_8'
        ? 'Section 8 Notice (Fault-Based) - England'
        : options.notice_type === 'section_21'
        ? 'Section 21 Notice (No-Fault) - England'
        : options.notice_type === 'wales_section_173'
        ? 'Section 173 Notice (No-Fault) - Wales'
        : options.notice_type === 'wales_fault_based'
        ? 'Fault-Based Notice - Wales (Renting Homes Act 2016)'
        : options.notice_type === 'notice_to_leave'
        ? 'Notice to Leave - Scotland (PRT)'
        : 'Notice';

    tocPage.drawText(`Notice Type: ${noticeLabel}`, {
      x: 50,
      y: yPos,
      size: 14,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 40;
  } else {
    yPos -= 20;
  }

  // Document list header
  tocPage.drawText('DOCUMENTS INCLUDED:', {
    x: 50,
    y: yPos,
    size: 16,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPos -= 30;

  // List documents with estimated page numbers
  let currentPage = 2; // TOC is page 1

  documents.forEach((doc, idx) => {
    if (yPos < 100) {
      // If running out of space, add note
      tocPage.drawText('... (see remaining documents in pack)', {
        x: 60,
        y: yPos,
        size: 12,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      return;
    }

    tocPage.drawText(`${idx + 1}. ${doc.title}`, {
      x: 60,
      y: yPos,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    tocPage.drawText(`Page ${currentPage}`, {
      x: 450,
      y: yPos,
      size: 12,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Estimate pages based on category
    const estimatedPages = doc.category === 'notice' ? 3 : 2;
    currentPage += estimatedPages;
    yPos -= 25;
  });

  // Value proposition section
  yPos -= 20;

  if (yPos > 150) {
    tocPage.drawText('WHAT YOU GET:', {
      x: 50,
      y: yPos,
      size: 14,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPos -= 25;

    const benefits = [
      '* Court-ready legal documents',
      '* Professional service instructions',
      '* Pre-service compliance checklist',
      '* Next steps guidance',
      '* Lifetime dashboard access',
      '* Free regeneration anytime',
    ];

    benefits.forEach((benefit) => {
      if (yPos > 100) {
        tocPage.drawText(benefit, {
          x: 60,
          y: yPos,
          size: 11,
          font: regularFont,
          color: rgb(0.2, 0.5, 0.2),
        });
        yPos -= 20;
      }
    });
  }

  // Important notice at bottom
  yPos = 120;

  tocPage.drawText('IMPORTANT: This is a PREVIEW ONLY', {
    x: 50,
    y: yPos,
    size: 14,
    font: font,
    color: rgb(0.8, 0, 0),
  });
  yPos -= 20;

  tocPage.drawText('Complete purchase (£29.99) to download full unredacted documents.', {
    x: 50,
    y: yPos,
    size: 11,
    font: regularFont,
    color: rgb(0.5, 0, 0),
  });
  yPos -= 20;

  tocPage.drawText('All documents are editable and can be regenerated anytime.', {
    x: 50,
    y: yPos,
    size: 10,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default generateNoticeOnlyPreview;
