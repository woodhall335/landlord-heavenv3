type MarketingIllustration = Readonly<{
  src: string;
  alt: string;
}>;

const illustration = (filename: string, alt: string): MarketingIllustration => ({
  src: `/images/illustrations/landlord-documents/${filename}.webp`,
  alt,
});

/**
 * Shared watercolor-and-ink artwork for marketing pages and product cards.
 * Keep product meaning in HTML; these images intentionally contain no readable copy.
 */
export const MARKETING_ILLUSTRATIONS = {
  section8: {
    grounds: {
      seriousArrears: illustration('section8-ground-serious-arrears', 'Rent ledger, calendar, coins and keys illustrating serious rent arrears'),
      unpaidRent: illustration('section8-ground-unpaid-rent', 'Overdue rent date, empty payment tray and property keys'),
      persistentArrears: illustration('section8-ground-persistent-arrears', 'Repeated missed rent payments shown across a rental timeline'),
      breachOfTenancy: illustration('section8-ground-breach-tenancy', 'Tenancy document and damaged rental-property door illustrating a supported breach'),
      antisocialBehaviour: illustration('section8-ground-antisocial-behaviour', 'Rental property, incident record and evidence shield illustrating antisocial behaviour'),
    },
    process: {
      guidedQuestions: illustration('section8-process-guided-questions', 'Guided online tenancy questions with a rental property and key'),
      legalChecks: illustration('section8-process-legal-checks', 'Notice document, calendar and shield being checked before service'),
      previewAndServe: illustration('section8-process-preview-serve', 'Document preview, payment and service-file delivery'),
    },
    stages: {
      noticeAndService: illustration('section8-stage-notice-service', 'Section 8 notice and service-document pack'),
      courtAndPossession: illustration('section8-stage-court-possession', 'Court and possession document file with evidence and courthouse'),
    },
    finalClearerFile: illustration('section8-final-clearer-file', 'Organised landlord notice file protected by a document shield'),
  },
  site: {
    secureCheckout: illustration('site-secure-checkout', 'Secure one-off checkout for landlord documents'),
    instantDocumentDelivery: illustration('site-instant-document-delivery', 'Secure digital delivery of completed landlord documents'),
    savedCaseDashboard: illustration('site-saved-case-dashboard', 'Saved landlord case with progress and document downloads'),
    evidenceChecklist: illustration('site-evidence-checklist', 'Organised landlord evidence checklist and supporting records'),
    serviceRecord: illustration('site-service-record', 'Notice service record with dates, property and proof of delivery'),
    tenancyEngland: illustration('site-tenancy-england', 'England tenancy agreement pack with rental property and keys'),
    tenancyWales: illustration('site-tenancy-wales', 'Wales occupation contract pack with rental property and keys'),
    tenancyScotland: illustration('site-tenancy-scotland', 'Scotland private residential tenancy pack with rental property and keys'),
    tenancyNorthernIreland: illustration('site-tenancy-northern-ireland', 'Northern Ireland tenancy agreement pack with rental property and keys'),
    moneyClaim: illustration('site-money-claim', 'Landlord money claim file with rent ledger, evidence and court documents'),
    rentIncrease: illustration('site-rent-increase', 'Supported rent increase with market comparison and rental property'),
    assistedPreparation: illustration('site-assisted-preparation', 'Specialist-assisted landlord document preparation'),
    landlordSupport: illustration('site-landlord-support', 'Landlord support for questions about a document workflow'),
    documentPreview: illustration('site-document-preview', 'Protected landlord-document preview before purchase'),
    complianceProtection: illustration('site-compliance-protection', 'Rental-property compliance records protected by a shield'),
  },
  eviction: {
    section21Notice: illustration('eviction-section21-notice', 'Section 21 notice, service calendar and rental property'),
    possessionClaim: illustration('eviction-possession-claim', 'Possession claim file, evidence bundle and courthouse'),
    bailiffWarrant: illustration('eviction-bailiff-warrant', 'Warrant-stage possession documents and property keys'),
    expiredNotice: illustration('eviction-expired-notice', 'Expired notice and the next possession-stage documents'),
    propertyDamage: illustration('eviction-property-damage', 'Property-damage evidence, photographs and repair estimate'),
    petsBreach: illustration('eviction-pets-breach', 'Tenancy evidence relating to an unauthorised pet'),
    noiseAntisocial: illustration('eviction-noise-antisocial', 'Neighbour incident record and antisocial-behaviour evidence'),
    abandonedProperty: illustration('eviction-abandoned-property', 'Apparently abandoned rental property and inspection record'),
    refusedAccess: illustration('eviction-refused-access', 'Refused property access and landlord correspondence trail'),
    unauthorisedSubletting: illustration('eviction-unauthorised-subletting', 'Occupancy records and suspected unauthorised subletting'),
  },
  claims: {
    unpaidRent: illustration('claim-unpaid-rent', 'Rent arrears ledger and money-claim evidence'),
    propertyDamage: illustration('claim-property-damage', 'Property-damage claim evidence and repair calculation'),
    unpaidUtilities: illustration('claim-unpaid-utilities', 'Utilities debt records and tenancy evidence'),
    cleaningCosts: illustration('claim-cleaning-costs', 'Cleaning-cost evidence and checkout inventory'),
    depositShortfall: illustration('claim-deposit-shortfall', 'Deposit deductions and remaining claim balance'),
    councilTax: illustration('claim-council-tax', 'Council-tax liability documents and tenancy dates'),
    guarantor: illustration('claim-guarantor', 'Guarantee document and landlord debt calculation'),
    formerTenant: illustration('claim-former-tenant', 'Former-tenant recovery file and forwarding correspondence'),
    letterBeforeAction: illustration('claim-letter-before-action', 'Letter before action, deadline and supporting evidence'),
    ccjEnforcement: illustration('claim-ccj-enforcement', 'Court judgment and enforcement route documents'),
  },
  tenancy: {
    fixedTerm: illustration('tenancy-fixed-term', 'Fixed-term tenancy agreement and date range'),
    periodic: illustration('tenancy-periodic', 'Periodic tenancy agreement and repeating rent periods'),
    student: illustration('tenancy-student', 'Student tenancy pack for a shared rental property'),
    premium: illustration('tenancy-premium', 'Premium tenancy pack with additional schedules'),
    renewal: illustration('tenancy-renewal', 'Tenancy renewal agreement and updated dates'),
    inventory: illustration('tenancy-inventory', 'Property inventory, condition photographs and keys'),
  },
  compliance: {
    depositProtection: illustration('compliance-deposit-protection', 'Deposit protection and prescribed-information records'),
    eicr: illustration('compliance-eicr', 'Electrical inspection and compliance record'),
    gasSafety: illustration('compliance-gas-safety', 'Gas safety inspection and certificate'),
    hmo: illustration('compliance-hmo', 'HMO licence and property safety checks'),
  },
  tools: {
    rentArrearsCalculator: illustration('tool-rent-arrears-calculator', 'Rent arrears calculator and exportable schedule'),
    noticeDateCalculator: illustration('tool-notice-date-calculator', 'Notice service and expiry date calculator'),
    hmoLicenceChecker: illustration('tool-hmo-licence-checker', 'HMO licensing and property eligibility checks'),
    rentDemandLetter: illustration('tool-rent-demand-letter', 'Guided rent-demand letter builder'),
    rentChallengeChecker: illustration('tool-rent-challenge-checker', 'Rent increase challenge and risk checker'),
    marketRentEvidence: illustration('tool-market-rent-evidence', 'Comparable properties and market-rent evidence'),
  },
  actions: {
    createAccount: illustration('action-create-account', 'Secure landlord account creation and verification'),
    paymentSuccess: illustration('action-payment-success', 'Successful document payment and secure download'),
    resumeSavedCase: illustration('action-resume-saved-case', 'Saved case progress and resume action'),
    askHeaven: illustration('action-ask-heaven', 'Landlord document questions and guided assistance'),
  },
} as const;
