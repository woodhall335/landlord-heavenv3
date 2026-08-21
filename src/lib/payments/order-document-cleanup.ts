import { resolveStoragePath } from '@/lib/documents/download';

type FinalOrderDocument = {
  id: string;
  pdf_url: string | null;
  tenancy_output_snapshot_id: string | null;
};

export function selectFinalOrderDocumentsForDeletion(
  documents: FinalOrderDocument[],
  params: {
    tenancyOutputSnapshotId?: string;
    exceptTenancyOutputSnapshotId?: string;
  }
): FinalOrderDocument[] {
  return documents.filter((document) => {
    if (params.tenancyOutputSnapshotId) {
      return document.tenancy_output_snapshot_id === params.tenancyOutputSnapshotId;
    }
    if (params.exceptTenancyOutputSnapshotId) {
      return document.tenancy_output_snapshot_id !== params.exceptTenancyOutputSnapshotId;
    }
    return true;
  });
}

export async function getFinalDocumentsForOrder(
  supabase: any,
  params: { caseId: string; orderId: string }
): Promise<FinalOrderDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, pdf_url, tenancy_output_snapshot_id')
    .eq('case_id', params.caseId)
    .eq('order_id', params.orderId)
    .eq('is_preview', false);

  if (error) {
    throw new Error(`Failed to fetch final documents for this order: ${error.message}`);
  }

  return (data || []) as FinalOrderDocument[];
}

export async function deleteFinalDocumentsForOrder(
  supabase: any,
  params: {
    caseId: string;
    orderId: string;
    tenancyOutputSnapshotId?: string;
    exceptTenancyOutputSnapshotId?: string;
  }
): Promise<string[]> {
  const documents = await getFinalDocumentsForOrder(supabase, params);
  const selected = selectFinalOrderDocumentsForDeletion(documents, params);

  if (selected.length === 0) return [];

  const storagePaths = selected
    .map((document) => resolveStoragePath(document.pdf_url))
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('documents').remove(storagePaths);
    if (storageError) {
      console.warn('Failed to delete some generated document files:', storageError);
    }
  }

  const documentIds = selected.map((document) => document.id);
  const { error: deleteError } = await supabase.from('documents').delete().in('id', documentIds);
  if (deleteError) {
    throw new Error(`Failed to delete generated document records: ${deleteError.message}`);
  }

  return documentIds;
}
