import { getWizardIconPathBySlug } from './wizardIconManifest';

export type WizardJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export type WizardProduct =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'money_claim_england_wales'
  | 'money_claim_scotland'
  | 'tenancy_agreement'
  | 'ast_standard'
  | 'ast_premium';

export type StepMetadata = {
  iconKey: string;
  timeEstimate: string;
  imageSlug?: string;
  panelIconSlug?: string;
  checklistTitle?: string;
  checklistItems?: Array<{ label: string; optional?: boolean }>;
  whyThisMatters?: { title?: string; body: string };
};

export type StepKey = `${WizardProduct}.${WizardJurisdiction}.${string}`;

export const PANEL_ICON_SLUGS = {
  askHeaven: 'ask-heaven',
  whatYouNeed: 'what-you-need',
  warning: 'warning',
  success: 'success',
} as const;

export type PanelIconSlug = (typeof PANEL_ICON_SLUGS)[keyof typeof PANEL_ICON_SLUGS];

export const WIZARD_V3_PALETTE = {
  primary: '#6D28D9',
  primaryHover: '#5B21B6',
  lightSurface: '#F3E8FF',
  border: '#E9D5FF',
  text: '#0F172A',
  muted: '#64748B',
  background: '#F8FAFC',
  success: '#22C55E',
  warning: '#F59E0B',
} as const;

export function makeStepKey(product: WizardProduct, jurisdiction: WizardJurisdiction, stepId: string): string {
  return `${product}.${jurisdiction}.${stepId}`;
}

const withChecklist = (
  items: Array<{ label: string; optional?: boolean }>,
  body: string,
  iconKey: string,
  timeEstimate: string,
  imageSlug: string
): StepMetadata => ({
  iconKey,
  timeEstimate,
  imageSlug,
  checklistTitle: "What you'll need",
  panelIconSlug: 'what-you-need',
  checklistItems: items,
  whyThisMatters: { body },
});

const EVICTION_BASE: Record<string, StepMetadata> = {
  case_basics: withChecklist([{ label: 'Jurisdiction' }, { label: 'Eviction route' }, { label: 'Current tenancy status' }], 'This sets the legal pathway and keeps later sections aligned with the correct process.', 'RiFileList3Line', '~2 min', 'case-basics'),
  scotland_basics: withChecklist([{ label: 'Jurisdiction confirmation' }, { label: 'Tenancy type' }, { label: 'Route selection' }], 'Early route choices shape notice timing and the remainder of the workflow.', 'RiFileList3Line', '~2 min', 'case-basics'),
  parties: withChecklist([{ label: 'Landlord details' }, { label: 'Tenant details' }, { label: 'Service address' }], 'Clear party details reduce drafting issues and help ensure notices are addressed correctly.', 'RiTeamLine', '~3 min', 'parties'),
  property: withChecklist([{ label: 'Property address' }, { label: 'Postcode' }, { label: 'Any unit details', optional: true }], 'Property details identify the tenancy unambiguously across notices and supporting documents.', 'RiHome4Line', '~2 min', 'property'),
  tenancy: withChecklist([{ label: 'Tenancy start date' }, { label: 'Rent amount' }, { label: 'Rent frequency' }, { label: 'Rent due day' }], 'Tenancy terms drive notice content, dates, and arrears calculations used later in the wizard.', 'RiCalendarLine', '~3 min', 'tenancy'),
  section21_compliance: withChecklist([{ label: 'Deposit protection details' }, { label: 'Prescribed information status' }, { label: 'Gas/EPC/How to Rent records' }], 'Compliance checks help confirm whether a no-fault route is suitable before final review.', 'RiShieldCheckLine', '~4 min', 'section-21'),
  wales_compliance: withChecklist([{ label: 'Registration or licensing status' }, { label: 'Written statement status' }, { label: 'Deposit compliance (if taken)' }, { label: 'Safeguard declarations' }], 'These checks capture prerequisite Wales requirements before progressing to drafting.', 'RiShieldCheckLine', '~4 min', 'compliance'),
  notice: withChecklist([{ label: 'Service date' }, { label: 'Notice grounds or reason' }, { label: 'Method of service' }], 'Notice settings determine deadlines and ensure the generated document reflects your case facts.', 'RiMailSendLine', '~4 min', 'notice-details'),
  scotland_notice: withChecklist([{ label: 'Notice to Leave date' }, { label: 'Ground reference' }, { label: 'Service method' }], 'Notice timing and service details are key to producing a valid Notice to Leave draft.', 'RiMailSendLine', '~3 min', 'notice-details'),
  section8_arrears: withChecklist([{ label: 'Rent schedule' }, { label: 'Arrears periods' }, { label: 'Payment history', optional: true }], 'Arrears figures support ground selection and improve consistency in calculations and evidence.', 'RiMoneyPoundCircleLine', '~5 min', 'rent-arrears'),
  scotland_compliance: withChecklist([{ label: 'PRT-related prerequisites' }, { label: 'Safety/compliance records', optional: true }, { label: 'Supporting timeline details' }], 'This captures key Scotland-specific checks so later steps can stay focused on grounds and notice details.', 'RiShieldCheckLine', '~3 min', 'compliance'),
  scotland_grounds: withChecklist([{ label: 'Ground selection' }, { label: 'Ground facts summary' }, { label: 'Date references', optional: true }], 'Ground selection provides the legal basis for the notice and structures the final draft output.', 'RiScales3Line', '~3 min', 'grounds'),
  evidence: withChecklist([{ label: 'Core supporting files' }, { label: 'Arrears records', optional: true }, { label: 'Communication log', optional: true }], 'Evidence planning helps you keep supporting material organized before completion.', 'RiFolderUploadLine', '~4 min', 'evidence'),
  court_signing: withChecklist([{ label: 'Court details' }, { label: 'Claimant signing details' }, { label: 'Reference numbers', optional: true }], 'Court and signing information ensures generated paperwork is complete and ready for next actions.', 'RiQuillPenLine', '~3 min', 'court'),
  scotland_tribunal: withChecklist([{ label: 'Tribunal venue or region' }, { label: 'Representative details', optional: true }, { label: 'Submission readiness check' }], 'Tribunal details help prepare the final bundle for the correct forum and process.', 'RiBuildingLine', '~3 min', 'hearing'),
  review: withChecklist([{ label: 'Check entered facts' }, { label: 'Confirm dates and names' }, { label: 'Download-ready confirmation' }], 'The review step is a final quality check to reduce avoidable errors before generating outputs.', 'RiSearchEyeLine', '~2 min', 'review-finish'),
};

const MONEY_CLAIM_BASE: Record<string, StepMetadata> = {
  claimant: withChecklist([{ label: 'Claimant name' }, { label: 'Address' }, { label: 'Contact details' }], 'Accurate claimant details are required for court forms and service documents.', 'RiUserLine', '~3 min', 'claimant'),
  defendant: withChecklist([{ label: 'Defendant name' }, { label: 'Address' }, { label: 'Additional parties', optional: true }], 'Defendant details must be correct to reduce service issues and delays.', 'RiUserSearchLine', '~3 min', 'defendant'),
  tenancy: withChecklist([{ label: 'Tenancy start date' }, { label: 'Rent amount' }, { label: 'Payment frequency' }], 'Tenancy details establish the contractual framework for the claim.', 'RiHome4Line', '~3 min', 'tenancy'),
  claim_details: withChecklist([{ label: 'Claim basis' }, { label: 'Dates of breach' }, { label: 'Amount sought' }], 'Clear claim details improve consistency across statements and forms.', 'RiFileList3Line', '~4 min', 'claim-details'),
  arrears: withChecklist([{ label: 'Arrears schedule' }, { label: 'Payment history' }, { label: 'Ledger references', optional: true }], 'A clear arrears ledger supports the claimed debt and evidence pack.', 'RiMoneyPoundCircleLine', '~5 min', 'arrears-ledger'),
  damages: withChecklist([{ label: 'Damage items', optional: true }, { label: 'Cost estimates' }, { label: 'Supporting references', optional: true }], 'Damages inputs help quantify additional losses tied to the claim.', 'RiHammerLine', '~4 min', 'damages-costs'),
  claim_statement: withChecklist([{ label: 'Statement summary' }, { label: 'Legal basis' }, { label: 'Requested outcome' }], 'The statement ties facts and figures together for filing readiness.', 'RiFileTextLine', '~4 min', 'claim-statement'),
  preaction: withChecklist([{ label: 'Pre-action correspondence' }, { label: 'Deadlines provided' }, { label: 'Response received', optional: true }], 'Pre-action checks help show procedural fairness before filing.', 'RiMailCheckLine', '~3 min', 'pre-action'),
  evidence: withChecklist([{ label: 'Core evidence files' }, { label: 'Tenancy documents' }, { label: 'Communications log', optional: true }], 'Organized evidence reduces friction during review and court submission.', 'RiFolderUploadLine', '~4 min', 'evidence-pack'),
  review: withChecklist([{ label: 'Review parties and amounts' }, { label: 'Confirm readiness' }, { label: 'Finalize output bundle' }], 'Final review catches errors before submission.', 'RiSearchEyeLine', '~2 min', 'summary-cards'),
};

const TENANCY_BASE: Record<string, StepMetadata> = {
  product: withChecklist([{ label: 'Agreement type' }, { label: 'Tier selection' }, { label: 'Suitability checks' }], 'Product setup ensures the right agreement path before entering detailed terms.', 'RiShoppingBagLine', '~2 min', 'inventory'),
  property: withChecklist([{ label: 'Property address' }, { label: 'Postcode' }, { label: 'Property type' }], 'Property details anchor the contract to the correct premises.', 'RiHome4Line', '~2 min', 'property'),
  landlord: withChecklist([{ label: 'Landlord details' }, { label: 'Service address' }, { label: 'Contact details' }], 'Landlord details are core to legal notices and agreement drafting.', 'RiUserStarLine', '~3 min', 'landlord'),
  tenants: withChecklist([{ label: 'Tenant details' }, { label: 'Lead contact details' }, { label: 'Additional tenant info', optional: true }], 'Complete tenant details help ensure the agreement reflects all intended parties.', 'RiTeamLine', '~3 min', 'tenants'),
  tenancy: withChecklist([{ label: 'Start date' }, { label: 'Term length' }, { label: 'Occupancy details', optional: true }], 'Tenancy setup determines core contract timing and occupancy expectations.', 'RiCalendarLine', '~3 min', 'tenancy'),
  rent: withChecklist([{ label: 'Rent amount' }, { label: 'Payment frequency' }, { label: 'Payment method', optional: true }], 'Rent terms define payment obligations and are reused throughout the agreement.', 'RiMoneyPoundCircleLine', '~2 min', 'rent'),
  deposit: withChecklist([{ label: 'Deposit amount' }, { label: 'Protection approach', optional: true }, { label: 'Deposit conditions' }], 'Deposit information clarifies upfront costs and related obligations in the contract.', 'RiSafe2Line', '~2 min', 'deposit'),
  bills: withChecklist([{ label: 'Utility responsibilities' }, { label: 'Council tax position' }, { label: 'Included services', optional: true }], 'Bill allocation avoids confusion by setting expectations from the start.', 'RiReceiptLine', '~2 min', 'bills'),
  compliance: withChecklist([{ label: 'Safety document readiness' }, { label: 'Required disclosures' }, { label: 'Compliance acknowledgements' }], 'Compliance details help keep agreement drafting aligned with standard pre-let requirements.', 'RiShieldCheckLine', '~3 min', 'compliance'),
  terms: withChecklist([{ label: 'Special terms', optional: true }, { label: 'Default clause preferences' }, { label: 'Restrictions or permissions' }], 'Terms shape day-to-day rules and allow limited customization of the agreement.', 'RiFileEditLine', '~3 min', 'terms'),
  premium: withChecklist([{ label: 'Premium options selected', optional: true }, { label: 'Additional clause set', optional: true }, { label: 'Upsell confirmation', optional: true }], 'Premium selections add optional enhancements without changing core agreement facts.', 'RiSparklingLine', '~2 min', 'premium'),
  review: withChecklist([{ label: 'Validate party details' }, { label: 'Check tenancy economics' }, { label: 'Final readiness confirmation' }], 'Review is a final pass to improve clarity and accuracy before generating documents.', 'RiSearchEyeLine', '~2 min', 'summary-cards'),
};

const ALL_JURISDICTIONS: WizardJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
const WIZARD_STEP_METADATA_ENTRIES: Array<[string, StepMetadata]> = [];

const addEntries = (
  product: WizardProduct,
  jurisdiction: WizardJurisdiction,
  metadataByStepId: Record<string, StepMetadata>
): void => {
  Object.entries(metadataByStepId).forEach(([stepId, metadata]) => {
    WIZARD_STEP_METADATA_ENTRIES.push([makeStepKey(product, jurisdiction, stepId), metadata]);
  });
};

addEntries('notice_only', 'england', {
  case_basics: EVICTION_BASE.case_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  section21_compliance: EVICTION_BASE.section21_compliance,
  notice: EVICTION_BASE.notice,
  section8_arrears: EVICTION_BASE.section8_arrears,
  review: EVICTION_BASE.review,
});
addEntries('notice_only', 'wales', {
  case_basics: EVICTION_BASE.case_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  wales_compliance: EVICTION_BASE.wales_compliance,
  notice: EVICTION_BASE.notice,
  section8_arrears: EVICTION_BASE.section8_arrears,
  review: EVICTION_BASE.review,
});
addEntries('notice_only', 'scotland', {
  scotland_basics: EVICTION_BASE.scotland_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  scotland_compliance: EVICTION_BASE.scotland_compliance,
  scotland_grounds: EVICTION_BASE.scotland_grounds,
  scotland_notice: EVICTION_BASE.scotland_notice,
  review: EVICTION_BASE.review,
});

addEntries('complete_pack', 'england', {
  case_basics: EVICTION_BASE.case_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  notice: EVICTION_BASE.notice,
  section21_compliance: EVICTION_BASE.section21_compliance,
  section8_arrears: EVICTION_BASE.section8_arrears,
  evidence: EVICTION_BASE.evidence,
  court_signing: EVICTION_BASE.court_signing,
  review: EVICTION_BASE.review,
});

(['money_claim', 'money_claim_england_wales', 'money_claim_scotland'] as const).forEach((product) => {
  addEntries(product, 'england', MONEY_CLAIM_BASE);
});

(['tenancy_agreement', 'ast_standard', 'ast_premium'] as const).forEach((product) => {
  ALL_JURISDICTIONS.forEach((jurisdiction) => {
    addEntries(product, jurisdiction, TENANCY_BASE);
  });
});

export const WIZARD_STEP_METADATA: Record<string, StepMetadata> = Object.fromEntries(
  WIZARD_STEP_METADATA_ENTRIES
);

export function getStepMetadata(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction,
  stepId: string
): StepMetadata | undefined {
  return WIZARD_STEP_METADATA[makeStepKey(product, jurisdiction, stepId)];
}

export function resolveStepIconPath(meta?: StepMetadata): string | undefined {
  return getWizardIconPathBySlug(meta?.imageSlug);
}

export function resolvePanelIconPath(meta?: StepMetadata): string | undefined {
  return getWizardIconPathBySlug(meta?.panelIconSlug);
}

export function getPanelIconPath(kind: keyof typeof PANEL_ICON_SLUGS): string | undefined {
  return getWizardIconPathBySlug(PANEL_ICON_SLUGS[kind]);
}

export function isSupportedJurisdictionForProduct(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction
): boolean {
  if (product === 'complete_pack') {
    return jurisdiction === 'england';
  }

  if (
    product === 'money_claim' ||
    product === 'money_claim_england_wales' ||
    product === 'money_claim_scotland'
  ) {
    return jurisdiction === 'england';
  }

  if (product === 'notice_only') {
    return jurisdiction !== 'northern-ireland';
  }

  return true;
}

export function countMetadataKeysByProductJurisdiction(): Record<string, Record<string, number>> {
  return Object.keys(WIZARD_STEP_METADATA).reduce<Record<string, Record<string, number>>>(
    (counts, key) => {
      const [product, jurisdiction] = key.split('.') as [WizardProduct, WizardJurisdiction, ...string[]];
      counts[product] ??= {};
      counts[product][jurisdiction] = (counts[product][jurisdiction] ?? 0) + 1;
      return counts;
    },
    {}
  );
}
