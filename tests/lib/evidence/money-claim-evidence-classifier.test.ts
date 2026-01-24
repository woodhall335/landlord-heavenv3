import { describe, expect, it } from 'vitest';
import {
  classifyEvidenceDocument,
  classifyAllEvidence,
  buildEvidenceContext,
  type MoneyClaimEvidenceType,
} from '@/lib/evidence/money-claim-evidence-classifier';

// =============================================================================
// TEST DATA FIXTURES
// =============================================================================

const testDocuments = {
  tenancyAgreement: {
    id: '1',
    name: 'Tenancy_Agreement_2024.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  checkInInventory: {
    id: '2',
    name: 'check-in-inventory-report.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  checkOutInventory: {
    id: '3',
    name: 'check_out_inventory.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  repairInvoice: {
    id: '4',
    name: 'plumber-invoice-123.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  rentLedger: {
    id: '5',
    name: 'rent_ledger_2024.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: undefined,
  },
  damagePhoto: {
    id: '6',
    name: 'IMG_1234.jpg',
    type: 'image/jpeg',
    category: undefined,
  },
  bankStatement: {
    id: '7',
    name: 'bank-statement-jan-2024.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  councilTaxBill: {
    id: '8',
    name: 'council-tax-demand-2024.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  utilityBill: {
    id: '9',
    name: 'gas-bill-december.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  letter: {
    id: '10',
    name: 'letter-to-tenant.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  unknownFile: {
    id: '11',
    name: 'document-1234.pdf',
    type: 'application/pdf',
    category: undefined,
  },
  photoWithExplicitCategory: {
    id: '12',
    name: 'file123.jpg',
    type: 'image/jpeg',
    category: 'property_photos_after',
  },
};

// =============================================================================
// CLASSIFICATION TESTS
// =============================================================================

describe('Money Claim Evidence Classifier', () => {
  describe('classifyEvidenceDocument', () => {
    it('classifies tenancy agreement from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.tenancyAgreement);
      expect(result.evidenceType).toBe('tenancy_agreement');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('classifies check-in inventory from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.checkInInventory);
      expect(result.evidenceType).toBe('inventory_checkin');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('classifies check-out inventory from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.checkOutInventory);
      expect(result.evidenceType).toBe('inventory_checkout');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('classifies invoice from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.repairInvoice);
      expect(result.evidenceType).toBe('invoice_quote_receipt');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies rent ledger from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.rentLedger);
      expect(result.evidenceType).toBe('rent_ledger_bank_statement');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies bank statement from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.bankStatement);
      expect(result.evidenceType).toBe('rent_ledger_bank_statement');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies council tax from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.councilTaxBill);
      expect(result.evidenceType).toBe('council_tax_statement');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies utility bill from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.utilityBill);
      expect(result.evidenceType).toBe('utility_bill');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies letter from filename', () => {
      const result = classifyEvidenceDocument(testDocuments.letter);
      expect(result.evidenceType).toBe('correspondence');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('classifies JPEG as photo based on MIME type', () => {
      const result = classifyEvidenceDocument(testDocuments.damagePhoto);
      expect(result.evidenceType).toBe('photo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('defaults to other for unrecognized filename', () => {
      const result = classifyEvidenceDocument(testDocuments.unknownFile);
      expect(result.evidenceType).toBe('other');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('uses user category when provided (highest confidence)', () => {
      const result = classifyEvidenceDocument(testDocuments.photoWithExplicitCategory);
      expect(result.evidenceType).toBe('inventory_checkout');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('classifyAllEvidence', () => {
    it('returns summary with all types present', () => {
      const docs = [
        testDocuments.tenancyAgreement,
        testDocuments.checkInInventory,
        testDocuments.repairInvoice,
        testDocuments.damagePhoto,
      ];
      const result = classifyAllEvidence(docs);

      expect(result.items).toHaveLength(4);
      expect(result.hasTenancyAgreement).toBe(true);
      expect(result.hasInventoryCheckin).toBe(true);
      expect(result.hasInvoiceQuoteReceipt).toBe(true);
      expect(result.hasPhoto).toBe(true);
      expect(result.hasInventoryCheckout).toBe(false);
    });

    it('handles empty document array', () => {
      const result = classifyAllEvidence([]);

      expect(result.items).toHaveLength(0);
      expect(result.hasPhoto).toBe(false);
      expect(result.hasTenancyAgreement).toBe(false);
    });
  });

  describe('buildEvidenceContext', () => {
    it('returns all false for undefined documents', () => {
      const context = buildEvidenceContext(undefined);

      expect(context.evidence_summary).toBeNull();
      expect(context.has_photo_evidence).toBe(false);
      expect(context.has_tenancy_agreement_evidence).toBe(false);
      expect(context.has_inventory_checkin_evidence).toBe(false);
      expect(context.has_invoice_quote_receipt_evidence).toBe(false);
    });

    it('returns all false for empty documents array', () => {
      const context = buildEvidenceContext([]);

      expect(context.evidence_summary).toBeNull();
      expect(context.has_photo_evidence).toBe(false);
    });

    it('correctly identifies evidence types present', () => {
      const docs = [
        testDocuments.tenancyAgreement,
        testDocuments.checkInInventory,
        testDocuments.checkOutInventory,
        testDocuments.damagePhoto,
      ];
      const context = buildEvidenceContext(docs);

      expect(context.has_photo_evidence).toBe(true);
      expect(context.has_tenancy_agreement_evidence).toBe(true);
      expect(context.has_inventory_checkin_evidence).toBe(true);
      expect(context.has_inventory_checkout_evidence).toBe(true);
      expect(context.has_any_inventory_evidence).toBe(true);
      expect(context.has_invoice_quote_receipt_evidence).toBe(false);
    });

    it('has_any_inventory_evidence is true with only check-in', () => {
      const context = buildEvidenceContext([testDocuments.checkInInventory]);
      expect(context.has_any_inventory_evidence).toBe(true);
    });

    it('has_any_inventory_evidence is true with only check-out', () => {
      const context = buildEvidenceContext([testDocuments.checkOutInventory]);
      expect(context.has_any_inventory_evidence).toBe(true);
    });
  });
});

// =============================================================================
// INTEGRATION WITH RULES ENGINE
// =============================================================================

describe('Evidence Classification - Rules Engine Integration', () => {
  it('context can be spread into evaluation context', () => {
    const docs = [testDocuments.tenancyAgreement, testDocuments.damagePhoto];
    const context = buildEvidenceContext(docs);

    // Verify context has expected shape for rules engine
    expect(context).toHaveProperty('has_photo_evidence');
    expect(context).toHaveProperty('has_tenancy_agreement_evidence');
    expect(context).toHaveProperty('has_inventory_checkin_evidence');
    expect(context).toHaveProperty('has_inventory_checkout_evidence');
    expect(context).toHaveProperty('has_invoice_quote_receipt_evidence');
    expect(context).toHaveProperty('has_rent_ledger_bank_statement_evidence');
    expect(context).toHaveProperty('has_correspondence_evidence');
    expect(context).toHaveProperty('has_council_tax_statement_evidence');
    expect(context).toHaveProperty('has_utility_bill_evidence');
    expect(context).toHaveProperty('has_any_inventory_evidence');

    // All should be booleans
    expect(typeof context.has_photo_evidence).toBe('boolean');
    expect(typeof context.has_any_inventory_evidence).toBe('boolean');
  });
});
