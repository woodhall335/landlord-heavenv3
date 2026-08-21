import { describe, expect, it } from 'vitest';
import { selectFinalOrderDocumentsForDeletion } from '../order-document-cleanup';

const documents = [
  { id: 'revision-one', pdf_url: 'documents/revision-one.pdf', tenancy_output_snapshot_id: 'snapshot-one' },
  { id: 'revision-two', pdf_url: 'documents/revision-two.pdf', tenancy_output_snapshot_id: 'snapshot-two' },
  { id: 'legacy', pdf_url: 'documents/legacy.pdf', tenancy_output_snapshot_id: null },
];

describe('selectFinalOrderDocumentsForDeletion', () => {
  it('removes only a failed tenancy revision', () => {
    expect(
      selectFinalOrderDocumentsForDeletion(documents, {
        tenancyOutputSnapshotId: 'snapshot-two',
      }).map((document) => document.id)
    ).toEqual(['revision-two']);
  });

  it('removes superseded revisions while preserving the newly validated revision', () => {
    expect(
      selectFinalOrderDocumentsForDeletion(documents, {
        exceptTenancyOutputSnapshotId: 'snapshot-two',
      }).map((document) => document.id)
    ).toEqual(['revision-one', 'legacy']);
  });
});
