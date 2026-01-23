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
 * 1. archived => "Archived"
 * 2. paid + has final documents => "Documents ready"
 * 3. paid + no documents yet => "In progress" (paid_in_progress)
 * 4. wizard complete but unpaid => "Ready to purchase"
 * 5. in_progress => "In progress"
 * 6. draft => "Draft"
 */
export function deriveDisplayStatus(input: DeriveStatusInput): DisplayStatusInfo {
  const {
    caseStatus,
    wizardProgress,
    wizardCompletedAt,
    paymentStatus,
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

  // If paid AND has final documents => "Documents ready"
  // hasFinalDocuments is the authoritative indicator that documents are ready
  if (paymentStatus === 'paid' && hasFinalDocuments) {
    return {
      status: 'documents_ready',
      label: 'Documents ready',
      badgeVariant: 'success',
      description: 'Your documents are ready to download',
    };
  }

  // If paid but no documents yet => "In progress"
  if (paymentStatus === 'paid' && !hasFinalDocuments) {
    return {
      status: 'paid_in_progress',
      label: 'In progress',
      badgeVariant: 'warning',
      description: 'Your documents are being generated',
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
