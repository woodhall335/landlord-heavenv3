import { describe, expect, it } from 'vitest';

import {
  validateGeneratedTenancyPackage,
  type ASTPackDocument,
} from '@/lib/documents/ast-generator';
import {
  deriveCanonicalInventoryState,
  inventoryCustomerStatus,
} from '@/lib/tenancy/inventory-state';

const pdf = Buffer.from('test-pdf');

function templateState() {
  return deriveCanonicalInventoryState(
    { inventory_delivery_method: 'attached' },
    { documentSeed: 'CASE-TEST' }
  );
}

function coreDocuments(): ASTPackDocument[] {
  const state = templateState();
  const status = inventoryCustomerStatus(state);
  return [
    {
      title: 'Private Residential Tenancy Agreement',
      description: 'Agreement',
      category: 'agreement',
      document_type: 'prt_agreement',
      html: `Inventory template ${state.inventoryDocumentId}`,
      pdf,
      file_name: 'tenancy_agreement.pdf',
    },
    {
      title: 'Inventory Template',
      description: 'Template',
      category: 'schedule',
      document_type: 'inventory_schedule',
      html: `${state.inventoryDocumentId} ${state.lifecycleState} ${state.signatureState}`,
      pdf,
      file_name: 'inventory_schedule.pdf',
    },
    {
      title: 'Checklist',
      description: 'Checklist',
      category: 'checklist',
      document_type: 'pre_tenancy_checklist_scotland',
      html: `${status} ${state.inventoryDocumentId}`,
      pdf,
      file_name: 'compliance_checklist.pdf',
    },
    {
      title: 'Supporting Notes',
      description: 'Official notes',
      category: 'guidance',
      document_type: 'prt_statutory_terms_supporting_notes_scotland',
      html: 'Official notes',
      pdf,
      file_name: 'supporting_notes.pdf',
    },
  ];
}

describe('regional tenancy package consistency validator', () => {
  it('accepts an internally consistent Scotland template pack', () => {
    expect(
      validateGeneratedTenancyPackage(
        coreDocuments(),
        'scotland',
        templateState()
      )
    ).toEqual([]);
  });

  it('blocks a completed/attached claim when canonical state is a template', () => {
    const documents = coreDocuments();
    documents[0].html =
      'A detailed inventory and condition report is attached to this agreement';

    expect(
      validateGeneratedTenancyPackage(documents, 'scotland', templateState())
    ).toContain('PACKAGE_INVENTORY_COMPLETION_CLAIM_MISMATCH');
  });

  it('blocks a missing immutable inventory reference', () => {
    const documents = coreDocuments();
    documents[0].html = 'Inventory template included separately';

    expect(
      validateGeneratedTenancyPackage(documents, 'scotland', templateState())
    ).toContain('PACKAGE_INVENTORY_ID_REFERENCE_MISMATCH');
  });

  it('blocks publication when the required Scotland notes are absent', () => {
    const documents = coreDocuments().filter(
      (document) =>
        document.document_type !==
        'prt_statutory_terms_supporting_notes_scotland'
    );

    expect(
      validateGeneratedTenancyPackage(documents, 'scotland', templateState())
    ).toContain('PACKAGE_SCOTLAND_SUPPORTING_NOTES_MISSING');
  });
});
