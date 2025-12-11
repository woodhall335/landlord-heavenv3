import fs from 'fs/promises';
import path from 'path';

export interface PackPreviewDocument {
  title: string;
  category?: string;
  description?: string;
  file_name: string;
  html?: string;
  pdf?: Buffer | Uint8Array | string;
  text?: string;
}

function normalisePdf(pdf: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(pdf)) return pdf;
  if (pdf instanceof Uint8Array) return Buffer.from(pdf);
  return Buffer.from(pdf, 'base64');
}

function ensureExtension(fileName: string, desiredExt: string): string {
  const parsed = path.parse(fileName);
  return parsed.ext.toLowerCase() === desiredExt
    ? fileName
    : `${parsed.name}${desiredExt}`;
}

export async function savePackPreview(
  flowName: string,
  slug: string,
  documents: PackPreviewDocument[],
): Promise<void> {
  const baseDir = path.join('/tmp/pack-preview', slug);
  await fs.rm(baseDir, { recursive: true, force: true });
  await fs.mkdir(baseDir, { recursive: true });

  console.log(`\n📂 ${flowName}`);
  console.log('Output folder:', baseDir);

  for (const doc of documents) {
    let format = 'unknown';
    let targetPath = path.join(baseDir, doc.file_name);

    if (doc.pdf) {
      format = 'pdf';
      targetPath = path.join(baseDir, ensureExtension(doc.file_name, '.pdf'));
      await fs.writeFile(targetPath, normalisePdf(doc.pdf));
    } else if (doc.html) {
      format = 'html';
      targetPath = path.join(baseDir, ensureExtension(doc.file_name, '.html'));
      await fs.writeFile(targetPath, doc.html, 'utf-8');
    } else if (doc.text) {
      format = 'txt';
      targetPath = path.join(baseDir, ensureExtension(doc.file_name, '.txt'));
      await fs.writeFile(targetPath, doc.text, 'utf-8');
    }

    console.log(
      ` - ${doc.title} [${doc.category || 'uncategorised'} | ${format}] -> ${targetPath}`,
    );
  }

  console.log(`Total documents: ${documents.length}`);
}
