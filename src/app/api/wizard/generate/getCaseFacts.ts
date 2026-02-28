// Case facts retrieval for document generation API.
// In production this should fetch from the backing data store (e.g., Supabase).
export async function getCaseFacts(caseId: string): Promise<Record<string, any>> {
  // Placeholder implementation until hooked up to persistence.
  void caseId;
  return {};
}
