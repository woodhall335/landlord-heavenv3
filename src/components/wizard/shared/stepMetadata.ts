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
  checklistTitle?: string;
  checklistItems?: Array<{ label: string; optional?: boolean }>;
  whyThisMatters?: { title?: string; body: string };
};

export type StepKey = `${WizardProduct}.${WizardJurisdiction}.${string}`;

// Wizard UI V3 design starter palette (style reference only, not wired to rendering here).
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

const withChecklist = (items: Array<{ label: string; optional?: boolean }>, body: string, iconKey: string, timeEstimate: string): StepMetadata => ({
  iconKey,
  timeEstimate,
  checklistTitle: "What you'll need",
  checklistItems: items,
  whyThisMatters: { body },
});

const EVICTION_BASE: Record<string, StepMetadata> = {
  case_basics: withChecklist([{ label: 'Jurisdiction' }, { label: 'Eviction route' }, { label: 'Current tenancy status' }], 'This sets the legal pathway and keeps later sections aligned with the correct process.', 'RiFileList3Line', '~2 min'),
  scotland_basics: withChecklist([{ label: 'Jurisdiction confirmation' }, { label: 'Tenancy type' }, { label: 'Route selection' }], 'Early route choices shape notice timing and the remainder of the workflow.', 'RiFileList3Line', '~2 min'),
  parties: withChecklist([{ label: 'Landlord details' }, { label: 'Tenant details' }, { label: 'Service address' }], 'Clear party details reduce drafting issues and help ensure notices are addressed correctly.', 'RiTeamLine', '~3 min'),
  property: withChecklist([{ label: 'Property address' }, { label: 'Postcode' }, { label: 'Any unit details', optional: true }], 'Property details identify the tenancy unambiguously across notices and supporting documents.', 'RiHome4Line', '~2 min'),
  tenancy: withChecklist([{ label: 'Tenancy start date' }, { label: 'Rent amount' }, { label: 'Rent frequency' }, { label: 'Rent due day' }], 'Tenancy terms drive notice content, dates, and arrears calculations used later in the wizard.', 'RiCalendarLine', '~3 min'),
  section21_compliance: withChecklist([{ label: 'Deposit protection details' }, { label: 'Prescribed information status' }, { label: 'Gas/EPC/How to Rent records' }], 'Compliance checks help confirm whether a no-fault route is suitable before final review.', 'RiShieldCheckLine', '~4 min'),
  wales_compliance: withChecklist([{ label: 'Registration or licensing status' }, { label: 'Written statement status' }, { label: 'Deposit compliance (if taken)' }, { label: 'Safeguard declarations' }], 'These checks capture prerequisite Wales requirements before progressing to drafting.', 'RiShieldCheckLine', '~4 min'),
  notice: withChecklist([{ label: 'Service date' }, { label: 'Notice grounds or reason' }, { label: 'Method of service' }], 'Notice settings determine deadlines and ensure the generated document reflects your case facts.', 'RiMailSendLine', '~4 min'),
  scotland_notice: withChecklist([{ label: 'Notice to Leave date' }, { label: 'Ground reference' }, { label: 'Service method' }], 'Notice timing and service details are key to producing a valid Notice to Leave draft.', 'RiMailSendLine', '~3 min'),
  section8_arrears: withChecklist([{ label: 'Rent schedule' }, { label: 'Arrears periods' }, { label: 'Payment history', optional: true }], 'Arrears figures support ground selection and improve consistency in calculations and evidence.', 'RiMoneyPoundCircleLine', '~5 min'),
  scotland_compliance: withChecklist([{ label: 'PRT-related prerequisites' }, { label: 'Safety/compliance records', optional: true }, { label: 'Supporting timeline details' }], 'This captures key Scotland-specific checks so later steps can stay focused on grounds and notice details.', 'RiShieldCheckLine', '~3 min'),
  scotland_grounds: withChecklist([{ label: 'Ground selection' }, { label: 'Ground facts summary' }, { label: 'Date references', optional: true }], 'Ground selection provides the legal basis for the notice and structures the final draft output.', 'RiScales3Line', '~3 min'),
  evidence: withChecklist([{ label: 'Core supporting files' }, { label: 'Arrears records', optional: true }, { label: 'Communication log', optional: true }], 'Evidence planning helps you keep supporting material organized before completion.', 'RiFolderUploadLine', '~4 min'),
  court_signing: withChecklist([{ label: 'Court details' }, { label: 'Claimant signing details' }, { label: 'Reference numbers', optional: true }], 'Court and signing information ensures generated paperwork is complete and ready for next actions.', 'RiQuillPenLine', '~3 min'),
  scotland_tribunal: withChecklist([{ label: 'Tribunal venue or region' }, { label: 'Representative details', optional: true }, { label: 'Submission readiness check' }], 'Tribunal details help prepare the final bundle for the correct forum and process.', 'RiBuildingLine', '~3 min'),
  review: withChecklist([{ label: 'Check entered facts' }, { label: 'Confirm dates and names' }, { label: 'Download-ready confirmation' }], 'The review step is a final quality check to reduce avoidable errors before generating outputs.', 'RiSearchEyeLine', '~2 min'),
};

const MONEY_CLAIM_BASE: Record<string, StepMetadata> = {
  claimant: withChecklist([{ label: 'Claimant name' }, { label: 'Address' }, { label: 'Contact details', optional: true }], 'Accurate claimant information is needed for statement formatting and downstream documents.', 'RiUser3Line', '~2 min'),
  defendant: withChecklist([{ label: 'Defendant name' }, { label: 'Last known address' }, { label: 'Additional defendants', optional: true }], 'Defendant details support service planning and clear identification throughout the claim.', 'RiUserReceived2Line', '~2 min'),
  tenancy: withChecklist([{ label: 'Tenancy start date' }, { label: 'Property details' }, { label: 'Rent terms' }], 'Tenancy context frames the claim timeline and links arrears to the relevant agreement.', 'RiCalendarLine', '~3 min'),
  claim_details: withChecklist([{ label: 'Claim summary' }, { label: 'Breach description' }, { label: 'Key dates' }], 'This section establishes the core narrative used in the formal claim statement.', 'RiDraftLine', '~4 min'),
  arrears: withChecklist([{ label: 'Arrears amount' }, { label: 'Period covered' }, { label: 'Payment records' }], 'A clear arrears breakdown helps keep totals consistent across forms and evidence.', 'RiMoneyPoundCircleLine', '~4 min'),
  damages: withChecklist([{ label: 'Damage items', optional: true }, { label: 'Estimated values', optional: true }, { label: 'Costs basis' }], 'Documenting damages and costs early helps present a coherent total claim value.', 'RiScalesLine', '~3 min'),
  claim_statement: withChecklist([{ label: 'Statement narrative' }, { label: 'Legal basis summary' }, { label: 'Relief sought' }], 'The claim statement pulls together your facts into a concise, structured filing summary.', 'RiFileTextLine', '~4 min'),
  preaction: withChecklist([{ label: 'Pre-action correspondence' }, { label: 'Warnings or letters sent' }, { label: 'Response history', optional: true }], 'Recording pre-action steps helps show process history and supports claim readiness.', 'RiMailCheckLine', '~3 min'),
  evidence: withChecklist([{ label: 'Tenancy documents' }, { label: 'Payment records' }, { label: 'Photos/messages', optional: true }], 'Evidence links your narrative to documents, making review and filing preparation easier.', 'RiFolderUploadLine', '~4 min'),
  review: withChecklist([{ label: 'Verify totals' }, { label: 'Confirm names and dates' }, { label: 'Ready-to-finish check' }], 'A final review helps catch inconsistencies before submitting or exporting claim outputs.', 'RiSearchEyeLine', '~2 min'),
};

const TENANCY_BASE: Record<string, StepMetadata> = {
  product: withChecklist([{ label: 'Agreement product choice' }, { label: 'Any optional package level' }, { label: 'Intended use case' }], 'The selected product controls which clauses and options are shown later in the flow.', 'RiApps2Line', '~1 min'),
  property: withChecklist([{ label: 'Property address' }, { label: 'Postcode' }, { label: 'Property type' }], 'Property details anchor the agreement and reduce ambiguity for all parties.', 'RiHome4Line', '~2 min'),
  landlord: withChecklist([{ label: 'Landlord legal name' }, { label: 'Address for notices' }, { label: 'Contact details', optional: true }], 'Landlord details are central to contract validity and notice handling.', 'RiUserStarLine', '~2 min'),
  tenants: withChecklist([{ label: 'Tenant names' }, { label: 'Lead contact details' }, { label: 'Additional tenant info', optional: true }], 'Complete tenant details help ensure the agreement reflects all intended parties.', 'RiTeamLine', '~3 min'),
  tenancy: withChecklist([{ label: 'Start date' }, { label: 'Term length' }, { label: 'Occupancy details', optional: true }], 'Tenancy setup determines core contract timing and occupancy expectations.', 'RiCalendarLine', '~3 min'),
  rent: withChecklist([{ label: 'Rent amount' }, { label: 'Payment frequency' }, { label: 'Payment method', optional: true }], 'Rent terms define payment obligations and are reused throughout the agreement.', 'RiMoneyPoundCircleLine', '~2 min'),
  deposit: withChecklist([{ label: 'Deposit amount' }, { label: 'Protection approach', optional: true }, { label: 'Deposit conditions' }], 'Deposit information clarifies upfront costs and related obligations in the contract.', 'RiSafe2Line', '~2 min'),
  bills: withChecklist([{ label: 'Utility responsibilities' }, { label: 'Council tax position' }, { label: 'Included services', optional: true }], 'Bill allocation avoids confusion by setting expectations from the start.', 'RiReceiptLine', '~2 min'),
  compliance: withChecklist([{ label: 'Safety document readiness' }, { label: 'Required disclosures' }, { label: 'Compliance acknowledgements' }], 'Compliance details help keep agreement drafting aligned with standard pre-let requirements.', 'RiShieldCheckLine', '~3 min'),
  terms: withChecklist([{ label: 'Special terms', optional: true }, { label: 'Default clause preferences' }, { label: 'Restrictions or permissions' }], 'Terms shape day-to-day rules and allow limited customization of the agreement.', 'RiFileEditLine', '~3 min'),
  premium: withChecklist([{ label: 'Premium options selected', optional: true }, { label: 'Additional clause set', optional: true }, { label: 'Upsell confirmation', optional: true }], 'Premium selections add optional enhancements without changing core agreement facts.', 'RiSparklingLine', '~2 min'),
  review: withChecklist([{ label: 'Validate party details' }, { label: 'Check tenancy economics' }, { label: 'Final readiness confirmation' }], 'Review is a final pass to improve clarity and accuracy before generating documents.', 'RiSearchEyeLine', '~2 min'),
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
addEntries('notice_only', 'northern-ireland', {
  case_basics: EVICTION_BASE.case_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  notice: EVICTION_BASE.notice,
  section8_arrears: EVICTION_BASE.section8_arrears,
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
addEntries('complete_pack', 'wales', {
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
addEntries('complete_pack', 'scotland', {
  scotland_basics: EVICTION_BASE.scotland_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  scotland_grounds: EVICTION_BASE.scotland_grounds,
  scotland_notice: EVICTION_BASE.scotland_notice,
  evidence: EVICTION_BASE.evidence,
  scotland_tribunal: EVICTION_BASE.scotland_tribunal,
  review: EVICTION_BASE.review,
});
addEntries('complete_pack', 'northern-ireland', {
  case_basics: EVICTION_BASE.case_basics,
  parties: EVICTION_BASE.parties,
  property: EVICTION_BASE.property,
  tenancy: EVICTION_BASE.tenancy,
  notice: EVICTION_BASE.notice,
  section8_arrears: EVICTION_BASE.section8_arrears,
  evidence: EVICTION_BASE.evidence,
  court_signing: EVICTION_BASE.court_signing,
  review: EVICTION_BASE.review,
});

(['money_claim', 'money_claim_england_wales', 'money_claim_scotland'] as const).forEach((product) => {
  ALL_JURISDICTIONS.forEach((jurisdiction) => {
    addEntries(product, jurisdiction, MONEY_CLAIM_BASE);
  });
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
