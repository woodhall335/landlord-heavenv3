import fs from 'fs/promises';
import path from 'path';

import { extractPdfText } from '../../src/lib/evidence/extract-pdf-text.ts';

export interface GoldenPackDocumentInput {
  title: string;
  description?: string;
  category?: string;
  document_type?: string;
  file_name: string;
  html?: string | null;
  pdf?: Buffer | Uint8Array | string;
  text?: string | null;
  contentType?: string;
}

export interface GoldenPackDocumentRecord {
  title: string;
  description?: string;
  category?: string;
  documentType?: string;
  fileName: string;
  files: {
    pdf?: string;
    html?: string;
    text?: string;
  };
  extraction?: {
    pageCount: number;
    isLowText: boolean;
    isMetadataOnly: boolean;
    method: string;
    error?: string;
  };
}

export interface GoldenPackRecord {
  key: string;
  displayName: string;
  outputDir: string;
  documentCount: number;
  documents: GoldenPackDocumentRecord[];
}

function toPosix(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function normaliseBinary(data: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  return Buffer.from(data, 'base64');
}

function ensureExtension(fileName: string, fallbackExt: string): string {
  const parsed = path.parse(fileName);
  return parsed.ext ? fileName : `${parsed.name}${fallbackExt}`;
}

function isZipDocument(document: GoldenPackDocumentInput): boolean {
  return document.contentType === 'application/zip' || path.extname(document.file_name).toLowerCase() === '.zip';
}

export async function saveGoldenPack(params: {
  baseDir: string;
  key: string;
  displayName: string;
  documents: GoldenPackDocumentInput[];
}): Promise<GoldenPackRecord> {
  const productDir = path.join(params.baseDir, params.key);
  await fs.rm(productDir, { recursive: true, force: true });
  await fs.mkdir(productDir, { recursive: true });

  const documentRecords: GoldenPackDocumentRecord[] = [];

  for (const document of params.documents) {
    const record: GoldenPackDocumentRecord = {
      title: document.title,
      description: document.description,
      category: document.category,
      documentType: document.document_type,
      fileName: document.file_name,
      files: {},
    };

    const parsed = path.parse(document.file_name);
    const baseName = parsed.name || document.document_type || 'document';

    if (document.pdf) {
      const desiredExt = isZipDocument(document) ? '.zip' : '.pdf';
      const targetName = ensureExtension(document.file_name, desiredExt);
      const targetPath = path.join(productDir, targetName);
      const pdfBuffer = normaliseBinary(document.pdf);

      await fs.writeFile(targetPath, pdfBuffer);
      record.files.pdf = toPosix(path.relative(params.baseDir, targetPath));

      if (!isZipDocument(document)) {
        try {
          const extraction = await extractPdfText(pdfBuffer, 20);
          record.extraction = {
            pageCount: extraction.pageCount,
            isLowText: extraction.isLowText,
            isMetadataOnly: extraction.isMetadataOnly,
            method: extraction.method,
            error: extraction.error,
          };

          if (extraction.text.trim()) {
            const textPath = path.join(productDir, `${baseName}.txt`);
            await fs.writeFile(textPath, extraction.text, 'utf8');
            record.files.text = toPosix(path.relative(params.baseDir, textPath));
          }
        } catch (error) {
          record.extraction = {
            pageCount: 0,
            isLowText: true,
            isMetadataOnly: true,
            method: 'failed',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    if (document.html) {
      const htmlPath = path.join(productDir, `${baseName}.html`);
      await fs.writeFile(htmlPath, document.html, 'utf8');
      record.files.html = toPosix(path.relative(params.baseDir, htmlPath));
    }

    if (document.text && !record.files.text) {
      const textPath = path.join(productDir, `${baseName}.txt`);
      await fs.writeFile(textPath, document.text, 'utf8');
      record.files.text = toPosix(path.relative(params.baseDir, textPath));
    }

    documentRecords.push(record);
  }

  const manifest: GoldenPackRecord = {
    key: params.key,
    displayName: params.displayName,
    outputDir: toPosix(path.relative(params.baseDir, productDir)),
    documentCount: documentRecords.length,
    documents: documentRecords,
  };

  await fs.writeFile(
    path.join(productDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  return manifest;
}
