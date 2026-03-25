import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

const filePath = path.join(
  process.cwd(),
  'config',
  'mqs',
  'tenancy_agreement',
  'The_Renters__Rights_Act_Information_Sheet_2026.pdf'
);

export async function GET() {
  const fileBuffer = await readFile(filePath);

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="renters-rights-act-information-sheet-2026.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
