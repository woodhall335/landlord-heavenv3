/**
 * Phase 3.2: Canonical Categories + HBS Form 6A Alignment Tests
 *
 * This test suite verifies:
 * - P0-B: Form 6A (Section 21 notice) must come from HBS template, not official-forms-filler.ts
 * - P0-C: Evidence upload category validation (canonical categories only)
 * - P0-D: Wizard/MQS sends canonical categories for deposit/EPC/gas
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fillForm6A, fillOfficialForm } from '@/lib/documents/official-forms-filler';
import { isEvidenceCategory, EvidenceCategory } from '@/lib/evidence/schema';

// =============================================================================
// P0-B: Form 6A Must Come From HBS Template
// =============================================================================

describe('P0-B: Form 6A HBS Alignment', () => {
  it('fillForm6A should throw deprecation error', async () => {
    const mockData = {
      landlord_full_name: 'Test Landlord',
      landlord_address: '123 Test Street',
      tenant_full_name: 'Test Tenant',
      property_address: '456 Property Lane',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly' as const,
      signatory_name: 'Test Landlord',
      signature_date: '2024-01-01',
    };

    await expect(fillForm6A(mockData)).rejects.toThrow(/DEPRECATED.*fillForm6A is disabled/);
  });

  it('fillOfficialForm with form6a should throw deprecation error', async () => {
    const mockData = {
      landlord_full_name: 'Test Landlord',
      landlord_address: '123 Test Street',
      tenant_full_name: 'Test Tenant',
      property_address: '456 Property Lane',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly' as const,
      signatory_name: 'Test Landlord',
      signature_date: '2024-01-01',
    };

    await expect(fillOfficialForm('form6a', mockData)).rejects.toThrow(
      /DEPRECATED.*Form 6A cannot be generated via fillOfficialForm/
    );
  });

  it('Section 21 notice generator uses HBS template (not official PDF)', () => {
    // Verify section21-generator.ts references the HBS template
    const generatorPath = path.join(
      process.cwd(),
      'src/lib/documents/section21-generator.ts'
    );
    const content = fs.readFileSync(generatorPath, 'utf-8');

    // Must reference the HBS template
    expect(content).toContain('form_6a_section21/notice.hbs');
    // Must NOT reference the official PDF
    expect(content).not.toContain('form_6a.pdf');
  });

  it('HBS template for Section 21 exists', () => {
    const templatePath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs'
    );
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('eviction-pack-generator.ts does not import fillForm6A', () => {
    const generatorPath = path.join(
      process.cwd(),
      'src/lib/documents/eviction-pack-generator.ts'
    );
    const content = fs.readFileSync(generatorPath, 'utf-8');

    // Should import fillN5Form, fillN119Form, fillN5BForm (court forms)
    expect(content).toContain('fillN5Form');
    expect(content).toContain('fillN5BForm');
    expect(content).toContain('fillN119Form');

    // Should NOT import fillForm6A (deprecated)
    expect(content).not.toMatch(/import\s*\{[^}]*fillForm6A[^}]*\}/);
  });
});

// =============================================================================
// P0-C: Evidence Category Validation
// =============================================================================

describe('P0-C: Evidence Category Allowlist', () => {
  describe('isEvidenceCategory validation', () => {
    it('accepts valid canonical categories', () => {
      expect(isEvidenceCategory('deposit_protection_certificate')).toBe(true);
      expect(isEvidenceCategory('epc')).toBe(true);
      expect(isEvidenceCategory('gas_safety_certificate')).toBe(true);
      expect(isEvidenceCategory('tenancy_agreement')).toBe(true);
      expect(isEvidenceCategory('bank_statements')).toBe(true);
      expect(isEvidenceCategory('correspondence')).toBe(true);
      expect(isEvidenceCategory('other')).toBe(true);
    });

    it('rejects invalid/arbitrary categories', () => {
      expect(isEvidenceCategory('lol_hacked')).toBe(false);
      expect(isEvidenceCategory('arbitrary_category')).toBe(false);
      expect(isEvidenceCategory('deposit_cert')).toBe(false);  // close but wrong
      expect(isEvidenceCategory('gas_certificate')).toBe(false);  // close but wrong
      expect(isEvidenceCategory('123')).toBe(false);
      expect(isEvidenceCategory('')).toBe(false);
      expect(isEvidenceCategory('DROP TABLE users')).toBe(false);
    });
  });

  describe('EvidenceCategory enum has required values', () => {
    it('contains N5B checkbox categories', () => {
      // These categories map to N5B attachment checkboxes E, F, G
      expect(EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE).toBe('deposit_protection_certificate');
      expect(EvidenceCategory.EPC).toBe('epc');
      expect(EvidenceCategory.GAS_SAFETY_CERTIFICATE).toBe('gas_safety_certificate');
    });
  });
});

// =============================================================================
// P0-D: MQS Evidence Categories
// =============================================================================

describe('P0-D: MQS Canonical Evidence Categories', () => {
  it('complete_pack/england.yaml has evidenceCategory for deposit upload', () => {
    const mqsPath = path.join(process.cwd(), 'config/mqs/complete_pack/england.yaml');
    const content = fs.readFileSync(mqsPath, 'utf-8');
    const mqs = yaml.load(content) as any;

    const depositQuestion = mqs.questions.find(
      (q: any) => q.id === 'evidence_deposit_protection'
    );

    expect(depositQuestion).toBeDefined();
    expect(depositQuestion.inputType).toBe('upload');
    expect(depositQuestion.evidenceCategory).toBe('deposit_protection_certificate');
  });

  it('complete_pack/england.yaml has evidenceCategory for EPC upload', () => {
    const mqsPath = path.join(process.cwd(), 'config/mqs/complete_pack/england.yaml');
    const content = fs.readFileSync(mqsPath, 'utf-8');
    const mqs = yaml.load(content) as any;

    const epcQuestion = mqs.questions.find((q: any) => q.id === 'evidence_epc');

    expect(epcQuestion).toBeDefined();
    expect(epcQuestion.inputType).toBe('upload');
    expect(epcQuestion.evidenceCategory).toBe('epc');
  });

  it('complete_pack/england.yaml has evidenceCategory for gas safety upload', () => {
    const mqsPath = path.join(process.cwd(), 'config/mqs/complete_pack/england.yaml');
    const content = fs.readFileSync(mqsPath, 'utf-8');
    const mqs = yaml.load(content) as any;

    const gasQuestion = mqs.questions.find((q: any) => q.id === 'evidence_gas_safety');

    expect(gasQuestion).toBeDefined();
    expect(gasQuestion.inputType).toBe('upload');
    expect(gasQuestion.evidenceCategory).toBe('gas_safety_certificate');
  });

  it('MQS evidenceCategory values are valid canonical categories', () => {
    const mqsPath = path.join(process.cwd(), 'config/mqs/complete_pack/england.yaml');
    const content = fs.readFileSync(mqsPath, 'utf-8');
    const mqs = yaml.load(content) as any;

    const uploadQuestions = mqs.questions.filter(
      (q: any) => q.inputType === 'upload' && q.evidenceCategory
    );

    // All evidenceCategory values must be valid
    for (const q of uploadQuestions) {
      expect(isEvidenceCategory(q.evidenceCategory)).toBe(true);
    }
  });
});

// =============================================================================
// Integration: Category Validation in Upload Route
// =============================================================================

describe('Upload Route Category Validation (integration)', () => {
  // These are structural tests to verify the route has the validation code
  it('upload-evidence route imports isEvidenceCategory', () => {
    const routePath = path.join(
      process.cwd(),
      'src/app/api/wizard/upload-evidence/route.ts'
    );
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain("import { isEvidenceCategory");
    expect(content).toContain("from '@/lib/evidence/schema'");
  });

  it('upload-evidence route validates category and returns 400 for invalid', () => {
    const routePath = path.join(
      process.cwd(),
      'src/app/api/wizard/upload-evidence/route.ts'
    );
    const content = fs.readFileSync(routePath, 'utf-8');

    // Should have category validation logic
    expect(content).toContain('isEvidenceCategory(categoryString)');
    expect(content).toContain('status: 400');
    expect(content).toContain('Invalid evidence category');
  });

  it('upload-evidence route uses validatedCategory for evidence entry', () => {
    const routePath = path.join(
      process.cwd(),
      'src/app/api/wizard/upload-evidence/route.ts'
    );
    const content = fs.readFileSync(routePath, 'utf-8');

    // Should use validatedCategory in evidence entry
    expect(content).toContain('category: validatedCategory');
  });
});

// =============================================================================
// StructuredWizard Evidence Category
// =============================================================================

describe('StructuredWizard evidenceCategory handling', () => {
  it('StructuredWizard uses evidenceCategory from question', () => {
    const wizardPath = path.join(
      process.cwd(),
      'src/components/wizard/StructuredWizard.tsx'
    );
    const content = fs.readFileSync(wizardPath, 'utf-8');

    // Should prioritize evidenceCategory over label
    expect(content).toContain(
      '(currentQuestion as any).evidenceCategory ?? (currentQuestion as any).label'
    );
  });
});
