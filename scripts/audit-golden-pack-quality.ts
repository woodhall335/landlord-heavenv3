import fs from 'fs/promises';
import path from 'path';

type ManifestDocument = {
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
};

type Manifest = {
  key: string;
  displayName: string;
  outputDir: string;
  documentCount: number;
  documents: ManifestDocument[];
};

type DocFinding = {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
};

type DocAssessment = {
  pack: string;
  documentType: string;
  title: string;
  category: string;
  textPath: string | null;
  pages: number;
  lines: number;
  words: number;
  disposition: 'keep' | 'rewrite' | 'merge' | 'remove';
  findings: DocFinding[];
};

const ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');
const AUDIT_ROOT = path.join(ROOT, '_audit');
const REPORT_PATH = path.join(AUDIT_ROOT, 'golden-pack-quality-audit.md');

const GENERIC_PATTERNS = [
  /this pack includes/gi,
  /use this pack/gi,
  /this document is intended to/gi,
  /use this (guide|checklist|record|sheet|appendix|schedule|template)/gi,
  /what to do now/gi,
  /keep this/gi,
  /keep with/gi,
  /practical steps/gi,
  /this tool provides assistance only/gi,
];

const MOJIBAKE_PATTERNS = [
  /Ã‚Â£/g,
  /Â£/g,
  /Ã¢ËœÂ/g,
  /â˜/g,
  /Ã¢â‚¬â€/g,
  /â€”/g,
  /â€œ/g,
  /â€\u009d/g,
  /Ãƒ/g,
];

const DISCLAIMER_PATTERNS = [
  /not legal advice/gi,
  /legal advice/gi,
  /guidance only/gi,
  /non-contractual guidance/gi,
  /this tool provides assistance only/gi,
];

const INTERNAL_VALUE_PATTERNS = [
  /\b\d+_days\b/g,
  /\boutgoing_tenant\b/g,
  /\brent_and_all_tenant_obligations\b/g,
];

const LIKELY_MERGE_DOCS = new Set([
  'court_forms_guide',
  'service_record_notes',
  'evidence_checklist',
  'what_happens_next',
]);

const LIKELY_REMOVE_DOCS = new Set<string>();

const CATEGORY_MIN_WORDS: Record<string, number> = {
  guidance: 220,
  checklist: 180,
  schedule: 140,
  agreement: 700,
  notice: 1000,
  court_form: 350,
  evidence_tool: 180,
  particulars: 250,
  bonus: 180,
  '': 150,
};

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + (text.match(pattern)?.length ?? 0), 0);
}

function countWords(text: string): number {
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean).length;
}

function isOfficialForm(doc: ManifestDocument): boolean {
  return /^(Form\s+[A-Z0-9]+|Certificate of Service)/i.test(doc.title)
    && (doc.category === 'notice' || doc.category === 'court_form' || doc.category === 'evidence_tool');
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function collectManifests(): Promise<Manifest[]> {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const manifests: Manifest[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '_audit') continue;
    const manifestPath = path.join(ROOT, entry.name, 'manifest.json');
    try {
      manifests.push(await readJson<Manifest>(manifestPath));
    } catch {
      // Ignore non-pack directories.
    }
  }
  return manifests.sort((a, b) => a.key.localeCompare(b.key));
}

function assessTextDocument(pack: string, doc: ManifestDocument, text: string): DocAssessment {
  const findings: DocFinding[] = [];
  const category = doc.category ?? '';
  const documentType = doc.documentType ?? doc.fileName;
  const lines = text.split(/\r?\n/).length;
  const words = countWords(text);
  const pages = doc.extraction?.pageCount ?? 0;
  const mojibakeCount = countMatches(text, MOJIBAKE_PATTERNS);
  const disclaimerCount = isOfficialForm(doc) ? 0 : countMatches(text, DISCLAIMER_PATTERNS);
  const genericCount = countMatches(text, GENERIC_PATTERNS);
  const internalValueCount = countMatches(text, INTERNAL_VALUE_PATTERNS);
  const minWords = CATEGORY_MIN_WORDS[category] ?? CATEGORY_MIN_WORDS[''];

  if (!category.trim()) {
    findings.push({ severity: 'medium', message: 'Manifest category is blank.' });
  }

  if (mojibakeCount > 0) {
    findings.push({ severity: 'critical', message: `Encoding / mojibake artifacts detected (${mojibakeCount}).` });
  }

  if (internalValueCount > 0) {
    findings.push({ severity: 'high', message: 'Internal enum-style values are visible in user-facing text.' });
  }

  if (words < minWords) {
    findings.push({
      severity: words < Math.max(80, Math.floor(minWords * 0.5)) ? 'high' : 'medium',
      message: `Document is thin for its category (${words} words; expected around ${minWords}+).`,
    });
  }

  if (genericCount >= 4) {
    findings.push({ severity: 'medium', message: `Heavy generic boilerplate detected (${genericCount} generic phrases).` });
  }

  if (disclaimerCount >= 2) {
    findings.push({ severity: 'medium', message: 'Disclaimer language may be crowding out practical content.' });
  }

  if (doc.extraction?.isLowText) {
    findings.push({ severity: 'medium', message: 'Low extracted text may indicate a weak text layer or low informational value.' });
  }

  let disposition: DocAssessment['disposition'] = 'keep';
  if (LIKELY_REMOVE_DOCS.has(documentType)) {
    disposition = 'remove';
  } else if (LIKELY_MERGE_DOCS.has(documentType)) {
    disposition = 'merge';
  } else if (findings.some((f) => f.severity === 'critical' || f.severity === 'high')) {
    disposition = 'rewrite';
  } else if (findings.length >= 2) {
    disposition = 'rewrite';
  }

  return {
    pack,
    documentType,
    title: doc.title,
    category,
    textPath: doc.files.text ?? null,
    pages,
    lines,
    words,
    disposition,
    findings,
  };
}

async function buildAssessments(manifests: Manifest[]): Promise<DocAssessment[]> {
  const results: DocAssessment[] = [];
  for (const manifest of manifests) {
    for (const doc of manifest.documents) {
      if (!doc.files.text) {
        const isZipBundle = (doc.documentType ?? '').includes('zip');
        results.push({
          pack: manifest.key,
          documentType: doc.documentType ?? doc.fileName,
          title: doc.title,
          category: doc.category ?? '',
          textPath: null,
          pages: doc.extraction?.pageCount ?? 0,
          lines: 0,
          words: 0,
          disposition: isZipBundle ? 'keep' : 'rewrite',
          findings: isZipBundle
            ? []
            : [{ severity: 'medium', message: 'No extracted text artifact available for quality review.' }],
        });
        continue;
      }

      const fullTextPath = path.join(ROOT, doc.files.text);
      const text = await fs.readFile(fullTextPath, 'utf8');
      results.push(assessTextDocument(manifest.key, doc, text));
    }
  }
  return results;
}

function summarizePack(assessments: DocAssessment[]) {
  const total = assessments.length;
  const critical = assessments.filter((a) => a.findings.some((f) => f.severity === 'critical')).length;
  const high = assessments.filter((a) => a.findings.some((f) => f.severity === 'high')).length;
  const medium = assessments.filter((a) => a.findings.some((f) => f.severity === 'medium')).length;
  const low = assessments.filter((a) => a.findings.some((f) => f.severity === 'low')).length;
  const rewrite = assessments.filter((a) => a.disposition === 'rewrite').length;
  const merge = assessments.filter((a) => a.disposition === 'merge').length;
  const remove = assessments.filter((a) => a.disposition === 'remove').length;
  const keep = assessments.filter((a) => a.disposition === 'keep').length;
  return { total, critical, high, medium, low, rewrite, merge, remove, keep };
}

function ratePack(summary: ReturnType<typeof summarizePack>): string {
  const penalty =
    summary.critical * 2.5 +
    summary.high * 1.75 +
    summary.medium * 0.55 +
    summary.low * 0.2 +
    summary.rewrite * 0.5 +
    summary.merge * 0.35 +
    summary.remove * 0.5;
  const raw = Math.max(1, Math.min(10, 10 - penalty));
  return raw.toFixed(1);
}

function renderReport(manifests: Manifest[], assessments: DocAssessment[]): string {
  const byPack = new Map<string, DocAssessment[]>();
  for (const assessment of assessments) {
    const list = byPack.get(assessment.pack) ?? [];
    list.push(assessment);
    byPack.set(assessment.pack, list);
  }

  const lines: string[] = [];
  lines.push('# Golden Pack Full Quality Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('Scope: All manifests and extracted text artifacts in `artifacts/golden-packs`.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');

  for (const manifest of manifests) {
    const packAssessments = byPack.get(manifest.key) ?? [];
    const summary = summarizePack(packAssessments);
    lines.push(
      `- \`${manifest.key}\`: ${ratePack(summary)}/10 | keep=${summary.keep}, rewrite=${summary.rewrite}, merge=${summary.merge}, remove=${summary.remove}, critical=${summary.critical}, high=${summary.high}, medium=${summary.medium}`,
    );
  }

  lines.push('');
  lines.push('## Cross-Pack Systemic Issues');
  lines.push('');

  const mojibakeDocs = assessments.filter((a) => a.findings.some((f) => f.message.includes('Encoding / mojibake')));
  const blankCategoryDocs = assessments.filter((a) => a.findings.some((f) => f.message.includes('Manifest category is blank')));
  const thinDocs = assessments.filter((a) => a.findings.some((f) => f.message.includes('Document is thin')));
  const internalValueDocs = assessments.filter((a) => a.findings.some((f) => f.message.includes('Internal enum-style values')));

  lines.push(`- Mojibake/encoding defects: ${mojibakeDocs.length} documents`);
  lines.push(`- Blank manifest categories: ${blankCategoryDocs.length} documents`);
  lines.push(`- Thin documents relative to purpose: ${thinDocs.length} documents`);
  lines.push(`- Raw internal values visible to users: ${internalValueDocs.length} documents`);
  lines.push('');

  for (const manifest of manifests) {
    const packAssessments = (byPack.get(manifest.key) ?? []).sort((a, b) => a.title.localeCompare(b.title));
    const summary = summarizePack(packAssessments);
    lines.push(`## ${manifest.displayName} (\`${manifest.key}\`)`);
    lines.push('');
    lines.push(`Score: ${ratePack(summary)}/10`);
    lines.push('');
    lines.push('| Document | Category | Pages | Words | Disposition | Findings |');
    lines.push('| --- | --- | ---: | ---: | --- | --- |');
    for (const assessment of packAssessments) {
      const findingText = assessment.findings.length
        ? assessment.findings.map((f) => `${f.severity}: ${f.message}`).join('<br>')
        : 'none';
      lines.push(
        `| ${assessment.title} | ${assessment.category || '(blank)'} | ${assessment.pages} | ${assessment.words} | ${assessment.disposition} | ${findingText} |`,
      );
    }
    lines.push('');
  }

  lines.push('## Highest Priority Document Fixes');
  lines.push('');

  const priority = assessments
    .filter((a) => a.disposition !== 'keep')
    .sort((a, b) => {
      const score = (item: DocAssessment) =>
        item.findings.reduce((sum, f) => sum + ({ critical: 3, high: 2, medium: 1, low: 0.5 }[f.severity]), 0);
      return score(b) - score(a);
    })
    .slice(0, 20);

  for (const item of priority) {
    lines.push(`- \`${item.pack}/${item.documentType}\` -> ${item.disposition}: ${item.findings.map((f) => f.message).join(' ')}`);
  }

  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Official court forms can look "thin" in extracted text because some of their value is form structure rather than narrative volume.');
  lines.push('- This audit is intended to catch filler, duplication, weak differentiation, and visible output defects. It is not a solicitor sign-off.');

  return lines.join('\n');
}

async function main() {
  await fs.mkdir(AUDIT_ROOT, { recursive: true });
  const manifests = await collectManifests();
  const assessments = await buildAssessments(manifests);
  const report = renderReport(manifests, assessments);
  await fs.writeFile(REPORT_PATH, report, 'utf8');
  console.log(`Audited ${assessments.length} documents across ${manifests.length} packs.`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
