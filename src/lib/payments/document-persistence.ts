type DocumentsTableClient = {
  from: (table: 'documents') => {
    upsert: (values: Record<string, unknown>, options: { onConflict: string }) => Promise<{ error: any }>;
    select: (columns: string) => {
      eq: (column: string, value: unknown) => any;
      is: (column: string, value: null) => any;
      maybeSingle: () => Promise<{ data: { id: string } | null; error: any }>;
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => Promise<{ error: any }>;
    };
    insert: (values: Record<string, unknown>) => Promise<{ error: any }>;
  };
};

function isNoRowsError(error: any): boolean {
  return error?.code === 'PGRST116';
}

export async function persistDocumentRecordWithFallback(
  supabase: DocumentsTableClient,
  payload: Record<string, unknown>,
  options: {
    caseId: string;
    documentType: string;
    outputSnapshotId?: string | null;
  }
): Promise<{ error: any; method: 'upsert' | 'update' | 'insert' }> {
  const { caseId, documentType, outputSnapshotId } = options;

  const upsertResult = await supabase.from('documents').upsert(payload, {
    onConflict: outputSnapshotId
      ? 'case_id,document_type,is_preview,output_snapshot_id'
      : 'case_id,document_type,is_preview',
  });

  if (!upsertResult.error) {
    return { error: null, method: 'upsert' };
  }

  const selectBuilder = supabase
    .from('documents')
    .select('id')
    .eq('case_id', caseId)
    .eq('document_type', documentType)
    .eq('is_preview', false);

  const existingResult = outputSnapshotId
    ? await selectBuilder.eq('output_snapshot_id', outputSnapshotId).maybeSingle()
    : await selectBuilder.is('output_snapshot_id', null).maybeSingle();

  if (existingResult.error && !isNoRowsError(existingResult.error)) {
    return { error: existingResult.error, method: 'upsert' };
  }

  if (existingResult.data?.id) {
    const updateResult = await supabase
      .from('documents')
      .update(payload)
      .eq('id', existingResult.data.id);

    return { error: updateResult.error, method: 'update' };
  }

  const insertResult = await supabase.from('documents').insert(payload);
  return { error: insertResult.error, method: 'insert' };
}
