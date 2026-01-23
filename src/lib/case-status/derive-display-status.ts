/**
 * Derive Display Status
 *
 * Server-side helper to derive user-facing status labels from case and order data.
 * The display status shows a more informative label than the raw case.status.
 */

export type DisplayStatus =
  | 'draft'
  | 'in_progress'
  | 'ready_to_purchase'
  | 'generating_documents'
  | 'paid_in_progress'
  | 'documents_ready'
  | 'completed'
  | 'archived';

export interface DisplayStatusInfo {
  status: DisplayStatus;
  label: string;
  badgeVariant: 'neutral' | 'warning' | 'success' | 'error';
  description?: string;
}

export interface DeriveStatusInput {
  caseStatus: string | null;
  wizardProgress?: number | null;
  wizardCompletedAt?: string | null;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  hasFinalDocuments?: boolean;
}

/**
 * Derive the display status and label for a case based on case and order data.
 *
 * Priority order:
 * 1. paid + fulfilled (has final docs) => "Documents ready"
 * 2. paid + processing/pending => "In progress" (paid_in_progress)
 * 3. wizard complete but unpaid => "Ready to purchase"
 * 4. archived => "Archived"
 * 5. in_progress => "In progress"
 * 6. draft => "Draft"
 */
export function deriveDisplayStatus(input: DeriveStatusInput): DisplayStatusInfo {
  const {
    caseStatus,
    wizardProgress,
    wizardCompletedAt,
    paymentStatus,
    fulfillmentStatus,
    hasFinalDocuments,
  } = input;

  // Archived cases always show as archived
  if (caseStatus === 'archived') {
    return {
      status: 'archived',
      label: 'Archived',
      badgeVariant: 'neutral',
    };
  }

  // If paid and fulfilled with final documents, show "Documents ready"
  if (paymentStatus === 'paid' && fulfillmentStatus === 'fulfilled' && hasFinalDocuments) {
    return {
      status: 'documents_ready',
      label: 'Documents ready',
      badgeVariant: 'success',
      description: 'Your documents are ready to download',
    };
  }

  // If paid but documents are still being generated - show "In progress" (not "Generating documents")
  if (paymentStatus === 'paid' && fulfillmentStatus !== 'fulfilled') {
    return {
      status: 'paid_in_progress',
      label: 'In progress',
      badgeVariant: 'warning',
      description: 'Your documents are being generated',
    };
  }

  // If paid and fulfilled but no final docs yet (edge case - poll state)
  if (paymentStatus === 'paid' && fulfillmentStatus === 'fulfilled' && !hasFinalDocuments) {
    return {
      status: 'paid_in_progress',
      label: 'In progress',
      badgeVariant: 'warning',
      description: 'Finalizing your documents',
    };
  }

  // Case status completed (from DB) - trust the DB status
  if (caseStatus === 'completed') {
    return {
      status: 'completed',
      label: 'Completed',
      badgeVariant: 'success',
    };
  }

  // Wizard completed but not paid => ready to purchase
  // Must explicitly check for 100 or a truthy wizardCompletedAt
  const isWizardComplete = wizardProgress === 100 || (wizardCompletedAt != null && wizardCompletedAt !== '');
  if (isWizardComplete && paymentStatus !== 'paid') {
    return {
      status: 'ready_to_purchase',
      label: 'Ready to purchase',
      badgeVariant: 'warning',
      description: 'Complete your purchase to get your documents',
    };
  }

  // In progress
  if (caseStatus === 'in_progress' || (wizardProgress != null && wizardProgress > 0)) {
    return {
      status: 'in_progress',
      label: 'In progress',
      badgeVariant: 'warning',
    };
  }

  // Default to draft
  return {
    status: 'draft',
    label: 'Draft',
    badgeVariant: 'neutral',
  };
}

/**
 * Get badge variant for display status
 */
export function getDisplayStatusBadgeVariant(
  status: DisplayStatus
): 'neutral' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'documents_ready':
    case 'completed':
      return 'success';
    case 'generating_documents':
    case 'paid_in_progress':
    case 'in_progress':
    case 'ready_to_purchase':
      return 'warning';
    case 'archived':
    case 'draft':
    default:
      return 'neutral';
  }
}

/**
 * Get display label for a status
 */
export function getDisplayStatusLabel(status: DisplayStatus): string {
  switch (status) {
    case 'documents_ready':
      return 'Documents ready';
    case 'generating_documents':
      return 'Generating documents';
    case 'paid_in_progress':
      return 'In progress';
    case 'ready_to_purchase':
      return 'Ready to purchase';
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    case 'archived':
      return 'Archived';
    case 'draft':
    default:
      return 'Draft';
  }
}
