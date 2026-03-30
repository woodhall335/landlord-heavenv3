import fs from 'node:fs';
import path from 'node:path';

export interface SampleAgreementParty {
  role: string;
  lines: string[];
}

export interface SampleAgreementSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface SampleAgreementPreviewData {
  title: string;
  introduction: string;
  parties: SampleAgreementParty[];
  sections: SampleAgreementSection[];
  sourceNote: string;
  wordCount: number;
}

const TEMPLATE_PATH = path.join(
  process.cwd(),
  'config',
  'jurisdictions',
  'uk',
  'england',
  'templates',
  'standard_ast_formatted.hbs'
);

const EXAMPLE_VALUES: Array<[string, string]> = [
  ['{{landlord_full_name}}', 'Harbour Lettings Ltd'],
  ['{{landlord_address}}', '12 Market Street, Leeds LS1 4AB'],
  ['{{landlord_email}}', 'legal@harbourlettings.co.uk'],
  ['{{landlord_phone}}', '0113 555 1020'],
  ['{{property_address}}', '24 Willow Bank, Leeds LS6 2QP'],
  ['{{formatUKDate tenancy_start_date}}', '1 June 2026'],
  ['{{rent_amount}}', '1,250.00'],
  ['{{rent_period}}', 'month'],
  ['{{rent_due_day}}', '1st day'],
  ['{{payment_method}}', 'standing order'],
  ['{{deposit_amount}}', '1,442.00'],
  ['{{deposit_scheme_name}}', 'the Tenancy Deposit Scheme'],
];

const EXAMPLE_PARTIES: SampleAgreementParty[] = [
  {
    role: 'Landlord',
    lines: [
      'Harbour Lettings Ltd',
      '12 Market Street, Leeds LS1 4AB',
      'legal@harbourlettings.co.uk | 0113 555 1020',
    ],
  },
  {
    role: 'Tenant',
    lines: [
      'Daniel Reed',
      'daniel.reed@example.com | 07700 900123',
      'Aisha Reed',
      'aisha.reed@example.com | 07700 900124',
    ],
  },
];

function readTemplateSource(): string {
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

function normalizeTemplateSource(source: string): string {
  let normalized = source;

  for (const [token, replacement] of EXAMPLE_VALUES) {
    normalized = normalized.replaceAll(token, replacement);
  }

  normalized = normalized.replace(/{{#if guarantor_name}}10{{else}}9{{\/if}}/g, '9');
  normalized = normalized.replace(
    /{{#each tenants}}[\s\S]*?{{\/each}}/g,
    '<strong>Daniel Reed</strong><br><span class="email-text">daniel.reed@example.com</span> | 07700 900123<br><br><strong>Aisha Reed</strong><br><span class="email-text">aisha.reed@example.com</span> | 07700 900124'
  );
  normalized = normalized.replace(/{{#if multiple_tenants}}s{{\/if}}/g, 's');
  normalized = normalized.replace(
    /{{#if multiple_tenants}} \(jointly and severally\){{\/if}}/g,
    ' (jointly and severally)'
  );
  normalized = normalized.replace(/{{#if agent_name}}[\s\S]*?{{\/if}}/g, '');
  normalized = normalized.replace(/{{#if guarantor_name}}[\s\S]*?{{\/if}}/g, '');
  normalized = normalized.replace(/{{#unless [^}]+}}[\s\S]*?{{\/unless}}/g, '');
  normalized = normalized.replace(/{{>[\s\S]*?}}/g, '');
  normalized = normalized.replace(/{{[^}]+}}/g, '');

  return normalized;
}

function extractBetween(source: string, startMarker: string, endMarker: string): string {
  const startIndex = source.indexOf(startMarker);
  if (startIndex === -1) {
    return '';
  }

  const contentStart = startIndex + startMarker.length;
  const endIndex = source.indexOf(endMarker, contentStart);
  if (endIndex === -1) {
    return source.slice(contentStart);
  }

  return source.slice(contentStart, endIndex);
}

function cleanInlineHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<\/?(strong|span|div|ul|ol|li)[^>]*>/gi, '')
    .replace(/&pound;/g, '£')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .trim();
}

function extractParagraphs(sectionHtml: string): string[] {
  return Array.from(sectionHtml.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi))
    .map((match) => cleanInlineHtml(match[2]))
    .filter(Boolean);
}

function countWords(values: string[]): number {
  return values
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function buildSections(): SampleAgreementSection[] {
  const template = normalizeTemplateSource(readTemplateSource());

  const propertyParagraphs = extractParagraphs(
    extractBetween(template, '<h2>3. The Property</h2>', '<h2>4. The Term</h2>')
  );
  const termParagraphs = extractParagraphs(
    extractBetween(template, '<h2>4. The Term</h2>', '<h2>5. Rent</h2>')
  );
  const rentParagraphs = extractParagraphs(
    extractBetween(template, '<h2>5. Rent</h2>', '<h2>6. Deposit</h2>')
  );
  const depositParagraphs = extractParagraphs(
    extractBetween(template, '<h2>6. Deposit</h2>', '<h2>7. Tenant Obligations</h2>')
  );
  const tenantParagraphs = extractParagraphs(
    extractBetween(template, '<h2>7. Tenant Obligations</h2>', '<h2>8. Landlord Obligations</h2>')
  );
  const landlordParagraphs = extractParagraphs(
    extractBetween(template, '<h2>8. Landlord Obligations</h2>', '<h2>9. General Provisions</h2>')
  );
  const generalParagraphs = extractParagraphs(
    extractBetween(
      template,
      '<h2>9. General Provisions</h2>',
      '<div class="signature-section">'
    )
  );

  return [
    {
      id: 'parties',
      title: 'Parties',
      paragraphs: [
        'This example agreement is between Harbour Lettings Ltd as landlord and Daniel Reed and Aisha Reed as joint tenants. It shows the structure used when the agreement needs clear named parties, a property address, and a practical route for serving notices and managing the tenancy from day one.',
      ],
    },
    {
      id: 'property',
      title: 'Property',
      paragraphs: propertyParagraphs.slice(0, 3),
    },
    {
      id: 'term',
      title: 'Term',
      paragraphs: termParagraphs.slice(0, 5),
    },
    {
      id: 'rent',
      title: 'Rent',
      paragraphs: rentParagraphs.slice(0, 5),
    },
    {
      id: 'deposit',
      title: 'Deposit',
      paragraphs: depositParagraphs.slice(0, 4),
    },
    {
      id: 'responsibilities',
      title: 'Repairs / responsibilities',
      paragraphs: [
        ...tenantParagraphs.slice(2, 5),
        tenantParagraphs[9],
        ...landlordParagraphs.slice(1, 5),
      ].filter(Boolean),
    },
    {
      id: 'notices',
      title: 'Notices / ending tenancy',
      paragraphs: [
        termParagraphs[5],
        termParagraphs[6],
        generalParagraphs[3],
        generalParagraphs[4],
      ].filter(Boolean),
    },
  ];
}

const sections = buildSections();
const partyCopy = EXAMPLE_PARTIES.flatMap((party) => [party.role, ...party.lines]);

export const ENGLAND_SAMPLE_AGREEMENT_PREVIEW: SampleAgreementPreviewData = {
  title: 'Sample agreement preview',
  introduction:
    "These example clauses are drawn from Landlord Heaven's live England standard tenancy agreement wording and rendered with safe sample details so you can inspect the structure before choosing the route that fits the let.",
  parties: EXAMPLE_PARTIES,
  sections,
  sourceNote:
    "Preview text is based on the current England standard tenancy agreement source used in Landlord Heaven's preview and generation system. Sample names, contact details, and property facts are illustrative only.",
  wordCount: countWords([
    ...partyCopy,
    ...sections.flatMap((section) => [section.title, ...section.paragraphs]),
  ]),
};
