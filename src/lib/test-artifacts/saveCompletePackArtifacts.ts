import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

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
  storage: 'local' | 'tmp';
  zipPath?: string;
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

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV?.includes('AWS_Lambda')
  );
}

export async function saveCompletePackArtifacts(
  input: SaveCompletePackArtifactsInput
): Promise<SaveCompletePackArtifactsResult> {
  const runId = sanitizeRunId(new Date().toISOString());
  const jurisdiction = input.jurisdiction ?? 'england';
  const serverlessRuntime = isServerlessRuntime();
  const baseDir = serverlessRuntime ? path.join('/tmp', 'test-artifacts') : path.join(process.cwd(), 'artifacts');
  const outputDir = path.join(baseDir, 'test', 'complete-pack', jurisdiction, input.variant, runId);
  const docs: SavedArtifactInfo[] = [];
  const skipped: Array<{ key: string; reason: string }> = [];
  const usedNames = new Map<string, number>();
  const zip = serverlessRuntime ? new JSZip() : null;

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
      if (zip) {
        zip.file(filename, payload.data);
      }
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
    if (zip) {
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    }
  } catch (error) {
    await fs.rm(outputDir, { recursive: true, force: true });
    if (serverlessRuntime) {
      throw new Error(
        'Serverless storage unavailable: unable to write artifacts to /tmp. Check runtime filesystem permissions.'
      );
    }
    throw error;
  }

  let zipPath: string | undefined;
  if (zip) {
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    zipPath = path.join(outputDir, `${runId}.zip`);
    await fs.writeFile(zipPath, zipBuffer);
  }

  return { outputDir, runId, docs, skipped, storage: serverlessRuntime ? 'tmp' : 'local', zipPath };
}
