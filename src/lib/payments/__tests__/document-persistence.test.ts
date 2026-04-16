import { describe, expect, it, vi } from 'vitest';

import { persistDocumentRecordWithFallback } from '../document-persistence';

function createDocumentsClient(options?: {
  upsertError?: any;
  existingId?: string | null;
  existingError?: any;
  updateError?: any;
  insertError?: any;
}) {
  const maybeSingle = vi.fn(async () => ({
    data: options?.existingId ? { id: options.existingId } : null,
    error: options?.existingError ?? null,
  }));

  const eqForUpdate = vi.fn(async () => ({ error: options?.updateError ?? null }));
  const update = vi.fn(() => ({ eq: eqForUpdate }));

  const selectChain: any = {
    eq: vi.fn(() => selectChain),
    is: vi.fn(() => selectChain),
    maybeSingle,
  };

  const table = {
    upsert: vi.fn(async () => ({ error: options?.upsertError ?? null })),
    select: vi.fn(() => selectChain),
    update,
    insert: vi.fn(async () => ({ error: options?.insertError ?? null })),
  };

  return {
    client: {
      from: vi.fn(() => table),
    },
    table,
    selectChain,
    maybeSingle,
    update,
    eqForUpdate,
  };
}

const payload = {
  case_id: 'case-1',
  document_type: 'england_standard_tenancy_agreement',
  is_preview: false,
};

describe('persistDocumentRecordWithFallback', () => {
  it('uses upsert when it succeeds', async () => {
    const { client, table } = createDocumentsClient();

    const result = await persistDocumentRecordWithFallback(client as any, payload, {
      caseId: 'case-1',
      documentType: 'england_standard_tenancy_agreement',
      outputSnapshotId: null,
    });

    expect(result).toEqual({ error: null, method: 'upsert' });
    expect(table.upsert).toHaveBeenCalledOnce();
    expect(table.insert).not.toHaveBeenCalled();
  });

  it('falls back to insert when upsert fails and no existing document is found', async () => {
    const { client, table } = createDocumentsClient({
      upsertError: { message: 'no unique constraint matching the ON CONFLICT specification' },
    });

    const result = await persistDocumentRecordWithFallback(client as any, payload, {
      caseId: 'case-1',
      documentType: 'england_standard_tenancy_agreement',
      outputSnapshotId: null,
    });

    expect(result).toEqual({ error: null, method: 'insert' });
    expect(table.insert).toHaveBeenCalledOnce();
  });

  it('falls back to update when upsert fails and an existing document is found', async () => {
    const { client, table, eqForUpdate } = createDocumentsClient({
      upsertError: { message: 'no unique constraint matching the ON CONFLICT specification' },
      existingId: 'doc-1',
    });

    const result = await persistDocumentRecordWithFallback(client as any, payload, {
      caseId: 'case-1',
      documentType: 'england_standard_tenancy_agreement',
      outputSnapshotId: null,
    });

    expect(result).toEqual({ error: null, method: 'update' });
    expect(table.insert).not.toHaveBeenCalled();
    expect(eqForUpdate).toHaveBeenCalledWith('id', 'doc-1');
  });
});
