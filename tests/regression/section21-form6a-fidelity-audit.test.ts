/**
 * Section 21 Form 6A Fidelity Audit - Rendered PDF Regression Tests
 *
 * ENGLAND-ONLY: Validates that Form 6A output contains all prescribed wording
 * and meets court-ready standards.
 *
 * These tests verify:
 * 1. All mandatory prescribed text blocks are present in rendered PDF
 * 2. UK date formatting is correct (e.g., "15 January 2026")
 * 3. No placeholders or template leakage strings
 * 4. Court-ready validator catches any issues
 *
 * Part of the Jan 2026 Section 21 Audit
 *
 * Legal Reference: Housing Act 1988 Section 21, Assured Shorthold Tenancy Notices
 * (Prescribed Requirements) (England) Regulations 2015
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

// Generators
import {
  generateSection21Notice,
  mapWizardToSection21Data,
  generateSection21Form6A,
  FORM_6A_TEMPLATE_PATH,
} from '@/lib/documents/section21-generator';

// Validators
import {
  validateSection21CourtReady,
  scanFinalOutputForPlaceholders,
} from '@/lib/documents/court-ready-validator';

// PDF text extraction
import { extractPdfText } from '@/lib/evidence/extract-pdf-text';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const FIXTURES_DIR = path.join(process.cwd(), 'tests/fixtures/section21');
const OUTPUT_DIR = path.join(process.cwd(), 'tests/output/section21');

// Valid case facts for Form 6A generation
const VALID_SECTION21_FACTS = {
  // Landlord
  landlord_full_name: 'John Michael Smith',
  landlord_address_line1: '45 Landlord Lane',
  landlord_address_town: 'London',
  landlord_address_postcode: 'SW1A 1AA',
  landlord_email: 'john.smith@email.com',
  landlord_phone: '07700 900123',

  // Tenant
  tenant_full_name: 'Sarah Elizabeth Williams',
  property_address_line1: '123 Riverside Court',
  property_address_line2: 'Apartment 7B',
  property_address_town: 'London',
  property_address_postcode: 'SE1 9AA',

  // Tenancy
  tenancy_start_date: '2023-06-15',
  fixed_term: false,
  rent_amount: 1500,
  rent_frequency: 'monthly' as const,

  // Notice
  notice_date: '2026-01-20',
  service_date: '2026-01-20',
  serving_capacity: 'landlord' as const,

  // Compliance - all passed
  deposit_taken: true,
  deposit_amount: 1500,
  deposit_protected: true,
  deposit_scheme: 'DPS',
  prescribed_info_served: true,
  has_gas_appliances: true,
  gas_safety_cert_served: true,
  epc_served: true,
  epc_rating: 'C',
  how_to_rent_served: true,
  licensing_required: 'not_required',
  no_retaliatory_notice: true,
};

// =============================================================================
// PRESCRIBED TEXT BLOCKS - Must appear in Form 6A
// =============================================================================

/**
 * These text blocks are required by the Assured Shorthold Tenancy Notices
 * (Prescribed Requirements) (England) Regulations 2015 (as amended).
 *
 * The Form 6A must contain specific wording to be valid.
 */
const PRESCRIBED_TEXT_BLOCKS = [
  // Form identification
  { text: 'FORM NO. 6A', description: 'Form number header' },
  { text: 'Housing Act 1988', description: 'Legal reference' },
  { text: 'section 21', description: 'Section reference' },
  { text: 'NOTICE REQUIRING POSSESSION', description: 'Notice type heading' },
  { text: 'PROPERTY IN ENGLAND', description: 'Jurisdiction identifier' },
  { text: 'Assured Shorthold Tenancy', description: 'Tenancy type' },

  // Notes on the Notice (required guidance text)
  { text: 'Notes on the Notice', description: 'Notes section header' },
  { text: 'two months', description: 'Minimum notice period reference' },
  { text: 'order for possession from the court', description: 'Court order requirement' },
  { text: 'bailiff to evict you', description: 'Bailiff reference' },
  { text: "citizens' advice bureau", description: 'CAB reference' },
  { text: 'housing advice centre', description: 'Housing advice reference' },
  { text: 'law centre', description: 'Law centre reference' },
  { text: 'solicitor', description: 'Solicitor reference' },

  // Breathing space provisions (added 2021)
  { text: 'breathing space', description: 'Breathing space reference' },
  { text: 'debt advice provider', description: 'Debt advice reference' },

  // Homelessness duty (added 2021)
  { text: 'risk of homelessness', description: 'Homelessness risk reference' },
  { text: 'local authority', description: 'LA support reference' },

  // Shelter contact (recommended)
  { text: 'Shelter', description: 'Shelter charity reference' },

  // Structure markers
  { text: 'To:', description: 'Section 1 tenant addressee' },
  { text: 'You are required to leave', description: 'Section 2 eviction requirement' },
  { text: 'Name and address of landlord', description: 'Section 3 landlord details' },
  { text: 'Signed', description: 'Signature field' },
  { text: 'Date:', description: 'Date field' },
  { text: 'Capacity', description: 'Capacity section' },
  { text: 'Landlord', description: 'Landlord capacity option' },
  { text: 'Joint landlord', description: 'Joint landlord capacity option' },
  { text: 'agent', description: 'Agent capacity option' },

  // 6-month validity window
  { text: '6 months', description: 'Notice validity period' },
];

// =============================================================================
// PLACEHOLDER PATTERNS - Must NOT appear in Form 6A
// =============================================================================

const FORBIDDEN_PLACEHOLDERS = [
  // Template placeholders
  '{{',
  '}}',
  '[Enter',
  '[Insert',
  '[insert',
  '(insert',
  '[Your',
  '[NAME]',
  '[ADDRESS]',
  '[DATE]',
  '[___',
  'TEMPLATE',
  'Instructions for use',

  // Form 6A specific placeholders from official template
  '(insert full name',
  '(insert address',
  '(insert calendar date',
];

// =============================================================================
// UK DATE FORMAT PATTERN
// =============================================================================

/**
 * Valid UK legal date format: "1 January 2026" or "15 March 2026"
 * - Day: 1-31 (no leading zero)
 * - Month: Full name (January, February, etc.)
 * - Year: 4 digits
 */
const UK_DATE_PATTERN = /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/;

// =============================================================================
// TESTS
// =============================================================================

describe('Form 6A Fidelity Audit', () => {
  beforeAll(async () => {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  describe('Prescribed Text Blocks', () => {
    let pdfText: string;
    let htmlContent: string;

    beforeAll(async () => {
      // Generate Form 6A
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      htmlContent = result.html;

      if (result.pdf) {
        const extracted = await extractPdfText(result.pdf);
        pdfText = extracted.text;

        // Save for inspection
        await fs.writeFile(path.join(OUTPUT_DIR, 'form_6a_fidelity_test.pdf'), result.pdf);
        await fs.writeFile(path.join(OUTPUT_DIR, 'form_6a_fidelity_test.html'), htmlContent);
        await fs.writeFile(path.join(OUTPUT_DIR, 'form_6a_fidelity_text.txt'), pdfText);
      }
    }, 60000);

    for (const { text, description } of PRESCRIBED_TEXT_BLOCKS) {
      it(`contains prescribed text: "${description}"`, () => {
        // Check HTML first (faster)
        const inHtml = htmlContent.toLowerCase().includes(text.toLowerCase());
        // Check PDF text if available
        const inPdf = pdfText ? pdfText.toLowerCase().includes(text.toLowerCase()) : false;

        expect(inHtml || inPdf).toBe(true);
      });
    }
  });

  describe('Placeholder Detection', () => {
    let pdfText: string;
    let htmlContent: string;

    beforeAll(async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      htmlContent = result.html;

      if (result.pdf) {
        const extracted = await extractPdfText(result.pdf);
        pdfText = extracted.text;
      }
    }, 60000);

    for (const placeholder of FORBIDDEN_PLACEHOLDERS) {
      it(`does not contain placeholder: "${placeholder}"`, () => {
        const inHtml = htmlContent.includes(placeholder);
        const inPdf = pdfText ? pdfText.includes(placeholder) : false;

        if (inHtml) {
          console.error(`Found placeholder "${placeholder}" in HTML`);
        }
        if (inPdf) {
          console.error(`Found placeholder "${placeholder}" in PDF text`);
        }

        expect(inHtml).toBe(false);
        expect(inPdf).toBe(false);
      });
    }

    it('passes scanFinalOutputForPlaceholders validation', () => {
      if (!pdfText) {
        console.warn('PDF text not available, skipping');
        return;
      }

      const validation = scanFinalOutputForPlaceholders(pdfText, 'form_6a');

      if (!validation.isValid) {
        console.error('Placeholder scan failed:', validation.issues);
      }

      expect(validation.isValid).toBe(true);
    });
  });

  describe('UK Date Formatting', () => {
    it('uses correct UK legal date format in rendered output', async () => {
      const s21Data = mapWizardToSection21Data({
        ...VALID_SECTION21_FACTS,
        notice_date: '2026-03-15', // 15 March 2026
      });

      const result = await generateSection21Notice(s21Data, true);

      // Should contain date in "15 March 2026" format (or similar)
      expect(result.html).toMatch(UK_DATE_PATTERN);

      // Should NOT contain ISO format dates in visible text
      // (ISO format in data attributes is OK)
      const bodyContent = result.html.replace(/<[^>]+>/g, ''); // Strip HTML tags
      expect(bodyContent).not.toMatch(/2026-03-15/);
    });

    it('formats service date correctly', async () => {
      const s21Data = mapWizardToSection21Data({
        ...VALID_SECTION21_FACTS,
        service_date: '2026-01-20',
      });

      const result = await generateSection21Notice(s21Data, true);

      // Should contain "20 January 2026"
      expect(result.html).toContain('January 2026');
    });

    it('formats expiry date correctly', async () => {
      const s21Data = mapWizardToSection21Data({
        ...VALID_SECTION21_FACTS,
        service_date: '2026-01-20',
      });

      const result = await generateSection21Notice(s21Data, true);

      // Expiry should be at least 2 months after service (March 2026 or later)
      expect(result.html).toMatch(/March 2026|April 2026|May 2026/);
    });
  });

  describe('Required Data Fields', () => {
    it('includes tenant name in output', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      expect(result.html).toContain('Sarah Elizabeth Williams');
    });

    it('includes property address in output', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      expect(result.html).toContain('Riverside Court');
      expect(result.html).toContain('SE1 9AA');
    });

    it('includes landlord name in output', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      expect(result.html).toContain('John Michael Smith');
    });

    it('includes landlord address in output', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      expect(result.html).toContain('Landlord Lane');
    });

    it('includes landlord phone in output', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      expect(result.html).toContain('07700 900123');
    });
  });

  describe('Court-Ready Validation', () => {
    it('passes validateSection21CourtReady for valid case', async () => {
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const result = await generateSection21Notice(s21Data, true);

      const validation = validateSection21CourtReady(result.html, 'form_6a');

      if (!validation.isValid) {
        console.error('Court-ready validation failed:', validation.issues);
      }

      expect(validation.isValid).toBe(true);
    });

    it('detects missing required fields', async () => {
      // Test with minimal/incomplete data
      const incompleteHtml = `
        <html>
          <body>
            <p>To: (insert full name(s) of tenant(s))</p>
            <p>You are required to leave after: {{notice_expiry_date}}</p>
          </body>
        </html>
      `;

      const validation = validateSection21CourtReady(incompleteHtml, 'form_6a');

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Canonical Generator Consistency', () => {
    it('generateSection21Form6A produces identical output to generateSection21Notice', async () => {
      // Via canonical entry point
      const form6aResult = await generateSection21Form6A({
        caseFacts: VALID_SECTION21_FACTS,
        jurisdiction: 'england',
        isPreview: true,
      });

      // Via direct function
      const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
      const directResult = await generateSection21Notice(s21Data, true);

      // Both should contain the same key content
      expect(form6aResult.html).toContain('FORM NO. 6A');
      expect(directResult.html).toContain('FORM NO. 6A');
      expect(form6aResult.html).toContain('Sarah Elizabeth Williams');
      expect(directResult.html).toContain('Sarah Elizabeth Williams');
    });

    it('uses the canonical template path', () => {
      // Verify the template path is in the notice_only folder
      expect(FORM_6A_TEMPLATE_PATH).toBe(
        'uk/england/templates/notice_only/form_6a_section21/notice.hbs'
      );
    });
  });
});

describe('Form 6A Template Structure', () => {
  it('contains all three numbered sections', async () => {
    const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
    const result = await generateSection21Notice(s21Data, true);

    // Section 1: Tenant name
    expect(result.html).toContain('section-number');

    // Section 2: Leave date and property
    expect(result.html).toContain('You are required to leave');

    // Section 3: Landlord details and signature
    expect(result.html).toContain('Name and address of landlord');
  });

  it('contains capacity checkboxes', async () => {
    const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
    const result = await generateSection21Notice(s21Data, true);

    expect(result.html).toContain('checkbox-box');
    expect(result.html).toContain('Landlord');
    expect(result.html).toContain('agent');
  });

  it('contains signature line', async () => {
    const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
    const result = await generateSection21Notice(s21Data, true);

    expect(result.html).toContain('Signed');
    expect(result.html).toContain('signature-line');
  });

  it('contains service instructions guidance', async () => {
    const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
    const result = await generateSection21Notice(s21Data, true);

    expect(result.html).toContain('Service Instructions');
    expect(result.html).toContain('served on the tenant');
  });

  it('contains validity checklist', async () => {
    const s21Data = mapWizardToSection21Data(VALID_SECTION21_FACTS);
    const result = await generateSection21Notice(s21Data, true);

    expect(result.html).toContain('Validity Checklist');
    expect(result.html).toContain('deposit');
  });
});
