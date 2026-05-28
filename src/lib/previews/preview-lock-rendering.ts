import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

import {
  getPreviewLockState,
  type PreviewLockState,
} from '@/lib/previews/preview-lock-policy';

interface PreviewLockRenderInput {
  isPaid: boolean;
  pageCount: number;
  pageNumber: number;
}

interface PdfLockResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  pageStates: PreviewLockState[];
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildLockOverlaySvg(params: {
  width: number;
  height: number;
  state: PreviewLockState;
}): string {
  const { width, height, state } = params;
  const isPartial = state === 'partial';
  const overlayY = isPartial ? height / 2 : 0;
  const overlayHeight = isPartial ? height / 2 : height;
  const title = isPartial ? 'Lower half locked' : 'Preview locked';
  const subtitle = isPartial
    ? 'Unlock the pack after checkout to read the full document.'
    : 'Unlock the full document pack after checkout.';
  const centerY = overlayY + overlayHeight / 2;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="${overlayY}" width="${width}" height="${overlayHeight}" fill="rgba(255,255,255,0.94)" />
      <rect x="${Math.max(24, width * 0.08)}" y="${Math.max(overlayY + 24, centerY - 78)}" width="${Math.max(280, width * 0.84)}" height="132" rx="22" fill="#F7F3FF" stroke="#D8CAFF" stroke-width="2" />
      <text x="${width / 2}" y="${centerY - 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#24163E">${escapeSvgText(title)}</text>
      <text x="${width / 2}" y="${centerY + 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#6B5B93">${escapeSvgText(subtitle)}</text>
      <text x="${width / 2}" y="${centerY + 48}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="#7C3AED">LANDLORD HEAVEN PREVIEW</text>
    </svg>
  `;
}

export async function applyPreviewLockToImageBuffer(
  imageBuffer: Buffer,
  input: PreviewLockRenderInput
): Promise<{ buffer: Buffer; state: PreviewLockState }> {
  const state = getPreviewLockState(input);

  if (state === 'clear') {
    return { buffer: imageBuffer, state };
  }

  const sharp = (await import('sharp')).default;
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 794;
  const height = metadata.height || 1123;
  const overlay = Buffer.from(buildLockOverlaySvg({ width, height, state }));

  const buffer = await sharp(imageBuffer)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return { buffer, state };
}

function drawPdfLockOverlay(page: PDFPage, state: PreviewLockState, font: PDFFont, boldFont: PDFFont) {
  if (state === 'clear') {
    return;
  }

  const { width, height } = page.getSize();
  const isPartial = state === 'partial';
  const overlayHeight = isPartial ? height / 2 : height;
  const overlayY = 0;
  const panelWidth = Math.min(width - 72, 440);
  const panelHeight = 116;
  const panelX = (width - panelWidth) / 2;
  const panelY = isPartial ? overlayHeight / 2 - panelHeight / 2 : height / 2 - panelHeight / 2;
  const title = isPartial ? 'Lower half locked' : 'Preview locked';
  const subtitle = isPartial
    ? 'Unlock after checkout to read the full document.'
    : 'Unlock the full document pack after checkout.';

  page.drawRectangle({
    x: 0,
    y: overlayY,
    width,
    height: overlayHeight,
    color: rgb(1, 1, 1),
    opacity: 0.94,
  });

  page.drawRectangle({
    x: panelX,
    y: panelY,
    width: panelWidth,
    height: panelHeight,
    color: rgb(0.969, 0.953, 1),
    borderColor: rgb(0.82, 0.74, 1),
    borderWidth: 1.4,
    opacity: 0.98,
  });

  const titleSize = 18;
  const subtitleSize = 10.5;
  const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);
  const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
  const marker = 'LANDLORD HEAVEN PREVIEW';
  const markerSize = 8.5;
  const markerWidth = boldFont.widthOfTextAtSize(marker, markerSize);

  page.drawText(title, {
    x: panelX + (panelWidth - titleWidth) / 2,
    y: panelY + 70,
    size: titleSize,
    font: boldFont,
    color: rgb(0.141, 0.086, 0.243),
  });

  page.drawText(subtitle, {
    x: panelX + (panelWidth - subtitleWidth) / 2,
    y: panelY + 44,
    size: subtitleSize,
    font,
    color: rgb(0.42, 0.357, 0.576),
  });

  page.drawText(marker, {
    x: panelX + (panelWidth - markerWidth) / 2,
    y: panelY + 20,
    size: markerSize,
    font: boldFont,
    color: rgb(0.486, 0.227, 0.929),
  });
}

export async function applyPreviewLockToPdfBytes(
  pdfBytes: Uint8Array,
  options: { isPaid: boolean }
): Promise<PdfLockResult> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageCount = pages.length;
  const pageStates = pages.map((_, index) =>
    getPreviewLockState({
      isPaid: options.isPaid,
      pageCount,
      pageNumber: index + 1,
    })
  );

  if (options.isPaid || pageStates.every((state) => state === 'clear')) {
    return { pdfBytes, pageCount, pageStates };
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let index = 0; index < pageStates.length; index += 1) {
    const state = pageStates[index];
    if (state === 'clear') {
      continue;
    }

    const currentPage = pdfDoc.getPage(index);
    const { width, height } = currentPage.getSize();

    if (state === 'locked') {
      pdfDoc.removePage(index);
      const replacementPage = pdfDoc.insertPage(index, [width, height]);
      drawPdfLockOverlay(replacementPage, state, font, boldFont);
      continue;
    }

    drawPdfLockOverlay(currentPage, state, font, boldFont);
  }

  return {
    pdfBytes: await pdfDoc.save(),
    pageCount,
    pageStates,
  };
}
