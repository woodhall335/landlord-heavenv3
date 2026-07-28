export interface DashboardCaseActionInput {
  id: string;
  case_type: string;
  jurisdiction: string;
  wizard_progress: number;
  display_status?: string | null;
  has_paid_order?: boolean;
  resume_product?: string | null;
}

export interface DashboardCaseActions {
  primaryHref: string;
  primaryLabel: string;
  editHref: string | null;
  editLabel: string | null;
}

function buildWizardHref(caseItem: DashboardCaseActionInput): string {
  const params = new URLSearchParams({
    type: caseItem.case_type,
    jurisdiction: caseItem.jurisdiction || 'england',
    case_id: caseItem.id,
  });

  if (caseItem.resume_product) params.set('product', caseItem.resume_product);
  return `/wizard/flow?${params.toString()}`;
}

function buildPeopleEditHref(caseItem: DashboardCaseActionInput): string {
  const href = new URL(buildWizardHref(caseItem), 'https://dashboard.local');

  if (caseItem.case_type === 'money_claim') {
    href.searchParams.set('step', 'claimant');
  } else if (caseItem.case_type === 'tenancy_agreement') {
    href.searchParams.set('highlight_sections', 'landlord,tenants');
  } else if (caseItem.case_type === 'eviction') {
    href.searchParams.set('step', 'parties');
  }

  return `${href.pathname}?${href.searchParams.toString()}`;
}

function buildPreviewHref(caseItem: DashboardCaseActionInput): string {
  const params = new URLSearchParams();
  if (caseItem.resume_product) params.set('product', caseItem.resume_product);
  if (caseItem.jurisdiction) params.set('jurisdiction', caseItem.jurisdiction);
  const query = params.toString();
  return `/wizard/preview/${caseItem.id}${query ? `?${query}` : ''}`;
}

export function getDashboardCaseActions(
  caseItem: DashboardCaseActionInput
): DashboardCaseActions {
  if (caseItem.has_paid_order) {
    return {
      primaryHref: `/dashboard/cases/${caseItem.id}`,
      primaryLabel: 'View case & documents',
      editHref: null,
      editLabel: null,
    };
  }

  const readyToPurchase =
    caseItem.wizard_progress >= 100 ||
    caseItem.display_status === 'ready_to_purchase';

  if (!readyToPurchase) {
    return {
      primaryHref: buildWizardHref(caseItem),
      primaryLabel: 'Resume case',
      editHref: null,
      editLabel: null,
    };
  }

  const editLabels: Record<string, string> = {
    money_claim: 'Edit claimants or case details',
    tenancy_agreement: 'Review or add people',
    eviction: 'Review or edit parties',
    rent_increase: 'Review or edit answers',
  };

  return {
    primaryHref: buildPreviewHref(caseItem),
    primaryLabel: 'Review documents & pay',
    editHref: buildPeopleEditHref(caseItem),
    editLabel: editLabels[caseItem.case_type] || 'Review or edit answers',
  };
}
