/**
 * Scotland PRT Pack Fixes - Regression Tests
 *
 * Tests for the three critical fixes:
 * A) First payment clause interpolation (Clause 4.2)
 * B) Payment details rendering (professional bank details format)
 * C) Easy Read Notes auto-generation
 */

import { describe, it, expect } from 'vitest';

describe('Scotland PRT Pack Fixes', () => {
  describe('A) First Payment Clause Interpolation', () => {
    it('should calculate first_payment from rent_amount when not explicitly provided', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01onal234567',
        property_address_line1: '123 Test St',
        property_city: 'Edinburgh',
        property_postcode: 'EH1 1AA',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        deposit_amount: 1200,
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // First payment should default to rent amount
      expect(astData.first_payment).toBe('1200.00');
      // First payment date should default to tenancy start date
      expect(astData.first_payment_date).toBe('2025-03-01');
    });

    it('should use explicit first_payment and first_payment_date when provided', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        deposit_amount: 1200,
        first_payment: 600, // Pro-rata amount
        first_payment_date: '2025-03-15', // Different from start date
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      expect(astData.first_payment).toBe('600.00');
      expect(astData.first_payment_date).toBe('2025-03-15');
    });

    it('should return placeholder when rent_amount is missing', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        deposit_amount: 1200,
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
        // Missing rent_amount and tenancy_start_date
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Should return placeholder strings, not blank
      expect(astData.first_payment).toContain('TO BE COMPLETED');
      expect(astData.first_payment_date).toContain('TO BE COMPLETED');
    });

    it('should never render blank first payment clause text', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      // Test various edge cases
      const testCases = [
        { rent_amount: 0, tenancy_start_date: '' },
        { rent_amount: undefined, tenancy_start_date: undefined },
        { rent_amount: null, tenancy_start_date: null },
        {}, // Empty facts
      ];

      for (const facts of testCases) {
        const wizardFacts = {
          property_country: 'scotland',
          landlord_full_name: 'Test Landlord',
          landlord_email: 'landlord@test.com',
          landlord_phone: '01234567890',
          property_address_line1: '123 Test St',
          deposit_amount: 1200,
          tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
          ...facts,
        };

        const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

        // CRITICAL: First payment should NEVER be blank/empty
        expect(astData.first_payment).toBeTruthy();
        expect(astData.first_payment_date).toBeTruthy();

        // Should not be just "£" or empty string
        expect(astData.first_payment).not.toBe('');
        expect(astData.first_payment_date).not.toBe('');
      }
    });
  });

  describe('B) Payment Details Rendering', () => {
    it('should format structured bank details professionally', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        deposit_amount: 1200,
        bank_account_name: 'John Smith Lettings',
        bank_sort_code: '123456',
        bank_account_number: '12345678',
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Should contain all three parts with labels
      expect(astData.payment_details).toContain('Account Name: John Smith Lettings');
      expect(astData.payment_details).toContain('Sort Code: 12-34-56'); // Formatted with hyphens
      expect(astData.payment_details).toContain('Account Number: 12345678');
    });

    it('should use placeholders for missing bank details', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        deposit_amount: 1200,
        bank_account_name: 'John Smith Lettings',
        // Missing sort_code and account_number
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Should have account name but placeholders for missing fields
      expect(astData.payment_details).toContain('Account Name: John Smith Lettings');
      expect(astData.payment_details).toContain('[TO BE COMPLETED BEFORE SIGNING]');
    });

    it('should flag truncated single-token payment details', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        deposit_amount: 1200,
        payment_details: 'Waterloo1223', // Truncated/incomplete
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Should flag incomplete details with a warning
      expect(astData.payment_details).toContain('Waterloo1223');
      expect(astData.payment_details).toContain('COMPLETE BANK DETAILS REQUIRED');
    });

    it('should never output just "to: Waterloo1223." style truncated output', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name: 'Test Landlord',
        landlord_email: 'landlord@test.com',
        landlord_phone: '01234567890',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2025-03-01',
        rent_amount: 1200,
        deposit_amount: 1200,
        payment_details: 'Waterloo1223',
        tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Payment details should be longer than just the token
      expect(astData.payment_details.length).toBeGreaterThan(20);
      // Should contain either structured details or a warning
      expect(
        astData.payment_details.includes('Account Name:') ||
          astData.payment_details.includes('[') // Placeholder bracket
      ).toBe(true);
    });
  });

  describe('C) Easy Read Notes Auto-Generation', () => {
    it('should include Easy Read Notes in Scotland pack contents', async () => {
      const { getPackContents } = await import('@/lib/products/pack-contents');

      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'scotland',
      });

      // Find Easy Read Notes
      const easyReadNotes = packContents.find((item) => item.key === 'easy_read_notes_scotland');

      expect(easyReadNotes).toBeDefined();
      expect(easyReadNotes?.title).toContain('Easy Read Notes');
      expect(easyReadNotes?.category).toBe('Guidance');
      expect(easyReadNotes?.required).toBe(true);
    });

    it('should include Easy Read Notes in Scotland premium pack contents', async () => {
      const { getPackContents } = await import('@/lib/products/pack-contents');

      const packContents = getPackContents({
        product: 'ast_premium',
        jurisdiction: 'scotland',
      });

      const easyReadNotes = packContents.find((item) => item.key === 'easy_read_notes_scotland');

      expect(easyReadNotes).toBeDefined();
      expect(easyReadNotes?.title).toContain('Easy Read Notes');
    });

    it('should NOT include Easy Read Notes in England pack contents', async () => {
      const { getPackContents } = await import('@/lib/products/pack-contents');

      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'england',
      });

      const easyReadNotes = packContents.find((item) => item.key === 'easy_read_notes_scotland');

      // England should not have Scotland Easy Read Notes
      expect(easyReadNotes).toBeUndefined();
    });

    it('should have Scotland jurisdiction config with easyReadNotes template path', async () => {
      const { getJurisdictionConfig } = await import('@/lib/documents/ast-generator');

      const config = getJurisdictionConfig('scotland');

      expect(config.templatePaths.easyReadNotes).toBeDefined();
      expect(config.templatePaths.easyReadNotes).toContain('easy_read_notes');
      expect(config.easyReadNotesDocumentType).toBe('easy_read_notes_scotland');
    });

    it('should verify Easy Read Notes template exists', async () => {
      const fs = await import('fs');
      const path = await import('path');

      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/scotland/templates/easy_read_notes.hbs'
      );

      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });

  describe('D) Scotland Pack Complete Integration', () => {
    it('Scotland standard pack should have 4 documents including Easy Read Notes', async () => {
      const { getPackContents } = await import('@/lib/products/pack-contents');

      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'scotland',
      });

      // Should have: agreement, inventory, checklist, easy read notes
      expect(packContents.length).toBe(4);

      const keys = packContents.map((item) => item.key);
      expect(keys).toContain('prt_agreement');
      expect(keys).toContain('inventory_schedule');
      expect(keys).toContain('pre_tenancy_checklist_scotland');
      expect(keys).toContain('easy_read_notes_scotland');
    });

    it('Scotland premium pack should have 4 documents including Easy Read Notes', async () => {
      const { getPackContents } = await import('@/lib/products/pack-contents');

      const packContents = getPackContents({
        product: 'ast_premium',
        jurisdiction: 'scotland',
      });

      expect(packContents.length).toBe(4);

      const keys = packContents.map((item) => item.key);
      expect(keys).toContain('prt_agreement_hmo');
      expect(keys).toContain('inventory_schedule');
      expect(keys).toContain('pre_tenancy_checklist_scotland');
      expect(keys).toContain('easy_read_notes_scotland');
    });

    it('worst-case facts test - long names and missing bank fields should use placeholders', async () => {
      const { mapWizardToASTData } = await import('@/lib/documents/ast-wizard-mapper');

      const wizardFacts = {
        property_country: 'scotland',
        landlord_full_name:
          'Sir Reginald Bartholomew McTavish III of Dunfermline Estate Holdings Ltd',
        landlord_email: 'reginald.mctavish@dunfermline-estate-holdings.co.uk',
        landlord_phone: '01onal234567890',
        property_address_line1: '123 Royal Mile Penthouse Suite, Edinburgh Castle Complex',
        property_city: 'Edinburgh',
        property_postcode: 'EH1 2NG',
        // Missing: rent_amount, tenancy_start_date, bank details
        deposit_amount: 5000,
        tenants: [
          {
            full_name: 'Alexandra Hermione Fitzgerald-Montgomery von Württemberg',
            email: 'alexandra.fitzgerald-montgomery@very-long-email-domain-name.co.uk',
            phone: '07700900123',
          },
        ],
      };

      const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'scotland' });

      // Should have placeholders for missing fields, not blanks
      expect(astData.first_payment).toContain('TO BE COMPLETED');
      expect(astData.first_payment_date).toContain('TO BE COMPLETED');
      expect(astData.payment_details).toContain('TO BE COMPLETED');

      // Long names should be preserved
      expect(astData.landlord_full_name).toContain('McTavish');
      expect(astData.tenants[0].full_name).toContain('Fitzgerald-Montgomery');
    });
  });
});
