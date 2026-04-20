import fs from 'fs/promises';
import path from 'path';

import { PDFDocument } from 'pdf-lib';

import { extractPdfText } from '../src/lib/evidence/extract-pdf-text.ts';

type GoldenPackDocumentRecord = {
  title: string;
  documentType?: string;
  files: {
    pdf?: string;
  };
};

type GoldenPackManifest = {
  key: string;
  displayName: string;
  documents: GoldenPackDocumentRecord[];
};

type AuditFinding = {
  level: 'error' | 'warning';
  message: string;
};

type AuditResult = {
  pack: string;
  documentType: string;
  title: string;
  pdfPath: string;
  pageCount: number;
  fieldCount: number;
  filledFieldCount: number;
  findings: AuditFinding[];
};

const OUTPUT_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');
const AUDIT_ROOT = path.join(OUTPUT_ROOT, '_audit');
const POSTCODE_REGEX = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i;

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function loadFieldValues(pdfPath: string): Promise<{
  pageCount: number;
  fieldCount: number;
  filledFieldCount: number;
  values: Map<string, string>;
}> {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const values = new Map<string, string>();

  for (const field of form.getFields()) {
    const name = field.getName();
    let value = '';
    try {
      value = form.getTextField(name).getText() || '';
    } catch {
      try {
        value = form.getCheckBox(name).isChecked() ? 'CHECKED' : '';
      } catch {
        value = '';
      }
    }

    if (value) {
      values.set(name, value);
    }
  }

  return {
    pageCount: pdfDoc.getPageCount(),
    fieldCount: form.getFields().length,
    filledFieldCount: values.size,
    values,
  };
}

function requireValue(
  findings: AuditFinding[],
  values: Map<string, string>,
  fieldName: string,
  label: string,
) {
  if (!String(values.get(fieldName) || '').trim()) {
    findings.push({ level: 'error', message: `${label} is empty (${fieldName}).` });
  }
}

function requirePattern(
  findings: AuditFinding[],
  values: Map<string, string>,
  fieldName: string,
  pattern: RegExp,
  label: string,
) {
  const value = String(values.get(fieldName) || '').trim();
  if (!value) {
    findings.push({ level: 'error', message: `${label} is empty (${fieldName}).` });
    return;
  }
  if (!pattern.test(value)) {
    findings.push({ level: 'error', message: `${label} has an unexpected value "${value}" (${fieldName}).` });
  }
}

async function auditSection8Notice(pack: string, title: string, pdfPath: string): Promise<AuditResult> {
  const fieldAudit = await loadFieldValues(pdfPath);
  const findings: AuditFinding[] = [];

  requireValue(findings, fieldAudit.values, 'form3a_tenant_names', 'Tenant names');
  requireValue(findings, fieldAudit.values, 'form3a_property_line1', 'Property address line 1');
  requireValue(findings, fieldAudit.values, 'form3a_property_line2', 'Property address line 2 / town');
  requirePattern(findings, fieldAudit.values, 'form3a_property_postcode', POSTCODE_REGEX, 'Property postcode');
  requireValue(findings, fieldAudit.values, 'form3a_grounds_text', 'Grounds text');
  requireValue(findings, fieldAudit.values, 'form3a_explanation_text', 'Grounds explanation');
  requireValue(findings, fieldAudit.values, 'form3a_signature', 'Signature');
  requirePattern(findings, fieldAudit.values, 'form3a_signatory_postcode', POSTCODE_REGEX, 'Signatory postcode');

  const propertyCity = String(fieldAudit.values.get('form3a_property_city') || '').trim();
  if (POSTCODE_REGEX.test(propertyCity)) {
    findings.push({
      level: 'error',
      message: `Property city field contains a postcode instead of a town/city ("${propertyCity}").`,
    });
  }

  const signatoryCity = String(fieldAudit.values.get('form3a_signatory_city') || '').trim();
  if (POSTCODE_REGEX.test(signatoryCity)) {
    findings.push({
      level: 'error',
      message: `Signatory city field contains a postcode instead of a town/city ("${signatoryCity}").`,
    });
  }

  return {
    pack,
    documentType: 'section8_notice',
    title,
    pdfPath,
    pageCount: fieldAudit.pageCount,
    fieldCount: fieldAudit.fieldCount,
    filledFieldCount: fieldAudit.filledFieldCount,
    findings,
  };
}

async function auditN5Claim(pack: string, title: string, pdfPath: string): Promise<AuditResult> {
  const fieldAudit = await loadFieldValues(pdfPath);
  const findings: AuditFinding[] = [];

  requireValue(findings, fieldAudit.values, 'In the court', 'Court name');
  requireValue(findings, fieldAudit.values, "claimant's details", 'Claimant details');
  requireValue(findings, fieldAudit.values, "defendant's details", 'Defendant details');
  requireValue(findings, fieldAudit.values, 'possession of', 'Property address');
  requireValue(findings, fieldAudit.values, 'Statement of Truth signature box', 'Statement of truth signature');
  requireValue(findings, fieldAudit.values, 'Date the Statement of Truth is signed - DD', 'Statement day');
  requireValue(findings, fieldAudit.values, 'Date the Statement of Truth is signed - MM', 'Statement month');
  requireValue(findings, fieldAudit.values, 'Date the Statement of Truth is signed - YYYY', 'Statement year');

  const checkedReasonCount = ['rent arrears - yes', 'anti-social behaviour - yes', 'other reasons - yes']
    .map((fieldName) => fieldAudit.values.get(fieldName) === 'CHECKED')
    .filter(Boolean)
    .length;
  if (checkedReasonCount === 0) {
    findings.push({ level: 'error', message: 'No possession reason checkbox is selected on the N5 claim.' });
  }

  return {
    pack,
    documentType: 'n5_claim',
    title,
    pdfPath,
    pageCount: fieldAudit.pageCount,
    fieldCount: fieldAudit.fieldCount,
    filledFieldCount: fieldAudit.filledFieldCount,
    findings,
  };
}

async function auditN119Claim(pack: string, title: string, pdfPath: string): Promise<AuditResult> {
  const fieldAudit = await loadFieldValues(pdfPath);
  const findings: AuditFinding[] = [];

  requireValue(findings, fieldAudit.values, 'name of court', 'Court name');
  requireValue(findings, fieldAudit.values, 'name of claimant', 'Claimant name');
  requireValue(findings, fieldAudit.values, 'name of defendant', 'Defendant name');
  requireValue(findings, fieldAudit.values, 'The claimant has a right to possession of:', 'Possession address');
  requireValue(
    findings,
    fieldAudit.values,
    'To the best of the claimant’s knowledge the following persons are in possession of the property:',
    'Persons in possession',
  );
  requireValue(findings, fieldAudit.values, '4. (a) The reason the claimant is asking for possession is:', 'Q4(a)');
  requireValue(findings, fieldAudit.values, '6. Other type of notice', 'Notice type');

  const checkedFrequencyCount = [
    '3(b) The current rent is payable each week',
    '3(b) The current rent is payable each fortnight',
    '3(b) The current rent is payable each month',
  ]
    .map((fieldName) => fieldAudit.values.get(fieldName) === 'X')
    .filter(Boolean)
    .length;
  if (checkedFrequencyCount !== 1) {
    findings.push({
      level: 'error',
      message: `N119 rent frequency is ambiguous; expected 1 checkbox but found ${checkedFrequencyCount}.`,
    });
  }

  const noticeType = String(fieldAudit.values.get('6. Other type of notice') || '');
  if (!noticeType.includes('Form 3A')) {
    findings.push({
      level: 'error',
      message: `N119 notice type should reference Form 3A but was "${noticeType}".`,
    });
  }

  const combinedText = [...fieldAudit.values.values()].join(' ');
  if (combinedText.includes(') was served on the defendant on 20 .')) {
    findings.push({
      level: 'error',
      message: 'N119 contains the known broken notice fragment ") was served on the defendant on 20 .".',
    });
  }

  return {
    pack,
    documentType: 'n119_particulars',
    title,
    pdfPath,
    pageCount: fieldAudit.pageCount,
    fieldCount: fieldAudit.fieldCount,
    filledFieldCount: fieldAudit.filledFieldCount,
    findings,
  };
}

async function auditN1Claim(pack: string, title: string, pdfPath: string): Promise<AuditResult> {
  const fieldAudit = await loadFieldValues(pdfPath);
  const findings: AuditFinding[] = [];

  requireValue(findings, fieldAudit.values, 'Text21', 'Claimant details');
  requireValue(findings, fieldAudit.values, 'Text22', 'Defendant details');
  requireValue(findings, fieldAudit.values, 'Text23', 'Brief details of claim');
  requireValue(findings, fieldAudit.values, 'Text25', 'Amount claimed');
  requireValue(findings, fieldAudit.values, 'Text26', 'Court fee');
  requireValue(findings, fieldAudit.values, 'Text28', 'Total amount');
  requirePattern(findings, fieldAudit.values, 'Text34', POSTCODE_REGEX, 'Service postcode');

  if (fieldAudit.values.get('Check Box43') !== 'CHECKED') {
    findings.push({
      level: 'error',
      message: 'N1 must tick "Particulars attached" (Check Box43) for the money claim pack.',
    });
  }

  const briefDetails = String(fieldAudit.values.get('Text23') || '');
  if (!briefDetails.includes('Particulars of Claim attached')) {
    findings.push({
      level: 'error',
      message: 'N1 brief details should refer to the attached Particulars of Claim.',
    });
  }

  return {
    pack,
    documentType: 'n1_claim',
    title,
    pdfPath,
    pageCount: fieldAudit.pageCount,
    fieldCount: fieldAudit.fieldCount,
    filledFieldCount: fieldAudit.filledFieldCount,
    findings,
  };
}

async function auditForm4A(pack: string, title: string, pdfPath: string): Promise<AuditResult> {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fieldValues = new Map(
    form.getFields().map((field) => [
      field.getName(),
      'getText' in field && typeof field.getText === 'function'
        ? String(field.getText() || '')
        : 'isChecked' in field && typeof field.isChecked === 'function'
          ? (field.isChecked() ? 'CHECKED' : 'UNCHECKED')
          : '',
    ])
  );
  const flattened = await PDFDocument.load(pdfBytes);
  flattened.getForm().flatten();
  const extraction = await extractPdfText(Buffer.from(await flattened.save()), 20);
  const findings: AuditFinding[] = [];
  const text = extraction.text.replace(/\s+/g, ' ');

  const requiredSnippets = [
    'Alex Tenant',
    'Jordan Tenant',
    '10 Sample Road',
    'LS1 1AA',
    'Taylor Landlord',
    '1285.00',
    '1200.00',
  ];

  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) {
      findings.push({
        level: 'error',
        message: `Form 4A is missing expected rendered text "${snippet}".`,
      });
    }
  }

  if (fieldValues.get('form4a_first_increase_day') !== '01'
    || fieldValues.get('form4a_first_increase_month') !== '04'
    || fieldValues.get('form4a_first_increase_year') !== '2025') {
    findings.push({
      level: 'error',
      message: 'Form 4A should populate question 4.4 with the first increase after 11 February 2003 in the golden sample.',
    });
  }

  const nonOfficialFields = [
    'form4a_service_method',
    'form4a_supporting_reference',
    'form4a_final_signature',
    'form4a_signatory_phone',
    'form4a_signatory_email',
    'form4a_signatory_name_address',
  ];

  for (const fieldName of nonOfficialFields) {
    if (fieldValues.has(fieldName)) {
      findings.push({
        level: 'error',
        message: `Form 4A should not contain non-official overlay field "${fieldName}".`,
      });
    }
  }

  return {
    pack,
    documentType: 'section13_form_4a',
    title,
    pdfPath,
    pageCount: pdfDoc.getPageCount(),
    fieldCount: form.getFields().length,
    filledFieldCount: [...fieldValues.values()].filter((value) => value.trim().length > 0).length,
    findings,
  };
}

async function auditMappedDocument(
  manifest: GoldenPackManifest,
  document: GoldenPackDocumentRecord,
): Promise<AuditResult | null> {
  const pdfRelativePath = document.files.pdf;
  if (!pdfRelativePath) {
    return null;
  }

  const pdfPath = path.join(OUTPUT_ROOT, pdfRelativePath);
  switch (document.documentType) {
    case 'section8_notice':
      return auditSection8Notice(manifest.key, document.title, pdfPath);
    case 'n5_claim':
      return auditN5Claim(manifest.key, document.title, pdfPath);
    case 'n119_particulars':
      return auditN119Claim(manifest.key, document.title, pdfPath);
    case 'n1_claim':
      return auditN1Claim(manifest.key, document.title, pdfPath);
    case 'section13_form_4a':
      return auditForm4A(manifest.key, document.title, pdfPath);
    default:
      return null;
  }
}

function toMarkdown(results: AuditResult[]): string {
  const lines: string[] = [
    '# Golden Pack Mapped Forms Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  for (const result of results) {
    lines.push(`## ${result.pack} - ${result.title}`);
    lines.push('');
    lines.push(`- Document type: \`${result.documentType}\``);
    lines.push(`- PDF: \`${path.relative(process.cwd(), result.pdfPath)}\``);
    lines.push(`- Pages: ${result.pageCount}`);
    lines.push(`- Form fields: ${result.fieldCount}`);
    lines.push(`- Filled fields: ${result.filledFieldCount}`);
    if (result.findings.length === 0) {
      lines.push('- Status: PASS');
    } else {
      lines.push(`- Status: ${result.findings.some((finding) => finding.level === 'error') ? 'FAIL' : 'WARN'}`);
      for (const finding of result.findings) {
        lines.push(`- ${finding.level.toUpperCase()}: ${finding.message}`);
      }
    }
    lines.push('');
  }

  const totalErrors = results.flatMap((result) => result.findings).filter((finding) => finding.level === 'error').length;
  const totalWarnings = results.flatMap((result) => result.findings).filter((finding) => finding.level === 'warning').length;
  lines.push(`Summary: ${results.length} mapped forms audited, ${totalErrors} errors, ${totalWarnings} warnings.`);
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const rootManifest = await readJson<{ packs: GoldenPackManifest[] }>(path.join(OUTPUT_ROOT, 'manifest.json'));
  const results = (
    await Promise.all(
      rootManifest.packs.flatMap((manifest) => manifest.documents.map((document) => auditMappedDocument(manifest, document))),
    )
  ).filter((result): result is AuditResult => Boolean(result));

  await fs.mkdir(AUDIT_ROOT, { recursive: true });
  await fs.writeFile(path.join(AUDIT_ROOT, 'mapped-forms-audit.json'), JSON.stringify(results, null, 2), 'utf8');
  await fs.writeFile(path.join(AUDIT_ROOT, 'mapped-forms-audit.md'), toMarkdown(results), 'utf8');

  const errorCount = results.flatMap((result) => result.findings).filter((finding) => finding.level === 'error').length;
  const warningCount = results.flatMap((result) => result.findings).filter((finding) => finding.level === 'warning').length;

  console.log(`Audited ${results.length} mapped forms.`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`Report: ${path.join(AUDIT_ROOT, 'mapped-forms-audit.md')}`);

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
