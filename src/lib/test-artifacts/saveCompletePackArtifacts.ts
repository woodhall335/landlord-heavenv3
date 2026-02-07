import fs from 'fs/promises';
import path from 'path';

interface ArtifactDocument {
  title?: string;
  document_type?: string;
  file_name?: string;
  pdf?: Buffer | Uint8Array | string;
  html?: string;
  text?: string;
}

interface SaveCompletePackArtifactsInput {
  packSlug: string;
  variant: string;
  jurisdiction?: string;
  documents: ArtifactDocument[];
  metadata?: Record<string, unknown>;
}

interface SavedArtifactInfo {
  key: string;
  filename: string;
  title?: string;
  type: string;
}

interface SaveCompletePackArtifactsResult {
  outputDir: string;
  runId: string;
  docs: SavedArtifactInfo[];
  skipped: Array<{ key: string; reason: string }>;
}

function normalisePdf(pdf: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(pdf)) return pdf;
  if (pdf instanceof Uint8Array) return Buffer.from(pdf);
  return Buffer.from(pdf, 'base64');
}

function getStableBaseName(key: string): string {
  const map: Record<string, string> = {
    n5_claim: 'n5',
    n119_particulars: 'n119',
    n5b_claim: 'n5b',
    section8_notice: 'notice',
    section21_notice: 'notice',
    service_instructions: 'service-instructions',
    validity_checklist: 'service-checklist',
    compliance_declaration: 'compliance-declaration',
    arrears_schedule: 'arrears-schedule',
    witness_statement: 'witness-statement',
    court_filing_guide: 'court-filing-guide',
    evidence_checklist: 'evidence-checklist',
    proof_of_service: 'proof-of-service',
  };

  return map[key] ?? key.replace(/_/g, '-');
}

function resolveDocumentPayload(doc: ArtifactDocument): { type: 'pdf' | 'html' | 'txt'; data: Buffer | string } | null {
  if (doc.pdf) {
    return { type: 'pdf', data: normalisePdf(doc.pdf) };
  }
  if (doc.html) {
    return { type: 'html', data: doc.html };
  }
  if (doc.text) {
    return { type: 'txt', data: doc.text };
  }
  return null;
}

function sanitizeRunId(value: string): string {
  return value.replace(/[:.]/g, '-');
}

export async function saveCompletePackArtifacts(
  input: SaveCompletePackArtifactsInput
): Promise<SaveCompletePackArtifactsResult> {
  const runId = sanitizeRunId(new Date().toISOString());
  const jurisdiction = input.jurisdiction ?? 'england';
  const outputDir = path.join(
    process.cwd(),
    'artifacts',
    'test',
    'complete-pack',
    jurisdiction,
    input.variant,
    runId
  );
  const docs: SavedArtifactInfo[] = [];
  const skipped: Array<{ key: string; reason: string }> = [];
  const usedNames = new Map<string, number>();

  try {
    await fs.mkdir(outputDir, { recursive: true });

    for (const doc of input.documents) {
      const key = doc.document_type || doc.file_name || 'unknown';
      const payload = resolveDocumentPayload(doc);

      if (!payload) {
        skipped.push({ key, reason: 'Unsupported document payload' });
        continue;
      }

      const baseName = getStableBaseName(key);
      const occurrence = (usedNames.get(baseName) ?? 0) + 1;
      usedNames.set(baseName, occurrence);
      const suffix = occurrence > 1 ? `-${occurrence}` : '';
      const filename = `${baseName}${suffix}.${payload.type}`;
      const targetPath = path.join(outputDir, filename);

      await fs.writeFile(targetPath, payload.data);
      docs.push({
        key,
        filename,
        title: doc.title,
        type: payload.type,
      });
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      runId,
      jurisdiction,
      variant: input.variant,
      packSlug: input.packSlug,
      docs,
      skipped,
      metadata: input.metadata ?? {},
    };

    await fs.writeFile(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
  } catch (error) {
    await fs.rm(outputDir, { recursive: true, force: true });
    throw error;
  }

  return { outputDir, runId, docs, skipped };
}
