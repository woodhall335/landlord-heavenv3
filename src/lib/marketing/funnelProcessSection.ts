import type {
  NoticeOnlyPreviewData,
  NoticeVariantKey,
  PreviewDoc,
} from '@/lib/previews/noticeOnlyPreviews';
import type { CompletePackPreviewData, CompletePackVariantKey } from '@/lib/previews/completePackPreviews';
import type { MoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';

export type FunnelProduct = 'notice_only' | 'complete_pack' | 'money_claim';

export type FunnelProcessStep = {
  id: string;
  docKey: string;
  docTitle: string;
  whatItDoes: string;
  whyItMatters: string;
  whenUsed?: string;
  previewSrc?: string;
  previewAlt?: string;
};

export type FunnelProcessRoute = {
  id: string;
  label: string;
  subtitle: string;
  steps: FunnelProcessStep[];
};

export type FunnelProcessTab = {
  id: string;
  label: string;
  description: string;
  routes: FunnelProcessRoute[];
};

export type FunnelProcessSectionModel = {
  heading: string;
  subheading: string;
  tabs: FunnelProcessTab[];
  defaultTabId: string;
};

export type BuildFunnelProcessSectionInput = {
  product: FunnelProduct;
  noticePreviews?: NoticeOnlyPreviewData;
  completePackPreviews?: CompletePackPreviewData;
  moneyClaimPreviews?: MoneyClaimPreviewData;
};

type PurposeCopy = {
  whatItDoes: string;
  whyItMatters: string;
  whenUsed?: string;
};

type PurposeMatcher = {
  pattern: RegExp;
  copy: PurposeCopy;
};

const normalizeDocKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toTitleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

const fallbackPurposeCopy: PurposeCopy = {
  whatItDoes: 'Captures key case information in a structured legal document.',
  whyItMatters: 'Clear and complete paperwork helps avoid delays, disputes, and re-filing.',
  whenUsed: 'Used as part of the generated case pack.',
};

const noticeOnlyPurposeMatchers: PurposeMatcher[] = [
  {
    pattern: /section-21|form-6a/,
    copy: {
      whatItDoes: 'Captures the older historical notice stage used before the England changeover.',
      whyItMatters: 'It is retained only to explain older files and prevent users following outdated steps.',
      whenUsed: 'Used only when you are reviewing a historical legacy file.',
    },
  },
  {
    pattern: /section-8|form-3a|form-3/,
    copy: {
      whatItDoes: 'Sets out the possession grounds relied on for the current England Section 8 case.',
      whyItMatters: 'Grounds and notice period errors can undermine the possession claim later in court.',
      whenUsed: 'Served first when proceeding on a current England possession case.',
    },
  },
  {
    pattern: /section173|section-173/,
    copy: {
      whatItDoes: 'Generates the no-fault possession notice for occupation contracts in Wales.',
      whyItMatters: 'Correct Welsh statutory wording and timelines reduce rejection risk later.',
      whenUsed: 'Served before possession action under the no-fault Wales notice process.',
    },
  },
  {
    pattern: /rhw23|eviction-notice/,
    copy: {
      whatItDoes: 'Generates a fault-based Welsh possession notice linked to the selected breach grounds.',
      whyItMatters: 'Incorrect ground wording can weaken enforceability and create delay.',
      whenUsed: 'Served when relying on fault-based possession in Wales.',
    },
  },
  {
    pattern: /notice-to-leave/,
    copy: {
      whatItDoes: 'Creates the Scottish Notice to Leave with route-specific statutory grounds.',
      whyItMatters: 'Ground and period mistakes are a common reason notices fail later.',
      whenUsed: 'Served before tribunal possession proceedings in Scotland.',
    },
  },
  {
    pattern: /service.*instruction|service_instructions|serving/,
    copy: {
      whatItDoes: 'Explains acceptable service methods and evidence to retain after service.',
      whyItMatters: 'Proof of proper service is often required if the tenant disputes receipt.',
      whenUsed: 'Used immediately before and after serving the notice.',
    },
  },
  {
    pattern: /validity|checklist/,
    copy: {
      whatItDoes: 'Provides a final pre-service checklist of legal and factual checks.',
      whyItMatters: 'A final validation pass helps catch defects before the notice is served.',
      whenUsed: 'Used as the final check before service.',
    },
  },
  {
    pattern: /compliance|pre-service/,
    copy: {
      whatItDoes: 'Summarizes compliance prerequisites and supporting evidence to confirm.',
      whyItMatters: 'Missing compliance evidence is a frequent basis for possession challenges.',
      whenUsed: 'Used before service to confirm preconditions are satisfied.',
    },
  },
  {
    pattern: /rent.*schedule|arrears/,
    copy: {
      whatItDoes: 'Breaks down outstanding rent or sums owed by date and amount.',
      whyItMatters: 'A clear arrears schedule supports the factual basis for fault grounds.',
      whenUsed: 'Used when arrears or payment breaches are relied on.',
    },
  },
];

const completePackPurposeMatchers: PurposeMatcher[] = [
  {
    pattern: /notice/,
    copy: {
      whatItDoes: 'Generates the possession notice that starts the case.',
      whyItMatters: 'If the notice stage is defective, downstream court forms can fail.',
      whenUsed: 'Generated and served at the start of the eviction case.',
    },
  },
  {
    pattern: /n5b/,
    copy: {
      whatItDoes: 'Flags a historical legacy claim form that is no longer part of the current England process.',
      whyItMatters: 'This prevents users from relying on an outdated filing path for live cases.',
      whenUsed: 'Used only when reviewing a historical legacy file.',
    },
  },
  {
    pattern: /n5$/,
    copy: {
      whatItDoes: 'Builds the claim form used to open standard possession proceedings.',
      whyItMatters: 'This form opens the court claim and must align with your notice case.',
      whenUsed: 'Filed once the current England notice period has expired.',
    },
  },
  {
    pattern: /n119/,
    copy: {
      whatItDoes: 'Sets out detailed possession particulars, grounds, and arrears facts.',
      whyItMatters: 'A coherent particulars document supports judicial review of the claim.',
      whenUsed: 'Filed with N5 for standard possession proceedings.',
    },
  },
  {
    pattern: /witness/,
    copy: {
      whatItDoes: 'Drafts a structured witness statement summarizing timeline and evidence.',
      whyItMatters: 'Clear narrative evidence improves hearing readiness and consistency.',
      whenUsed: 'Used before filing or hearing to support factual assertions.',
    },
  },
  {
    pattern: /proof.*service/,
    copy: {
      whatItDoes: 'Records how and when documents were served, with evidence references.',
      whyItMatters: 'Service evidence is often essential where service is challenged.',
      whenUsed: 'Completed after serving notices or court paperwork.',
    },
  },
  {
    pattern: /evidence/,
    copy: {
      whatItDoes: 'Lists evidence needed to support grounds, chronology, and compliance.',
      whyItMatters: 'Missing evidence can weaken the claim even where forms are correct.',
      whenUsed: 'Used during claim preparation before filing and hearing.',
    },
  },
  {
    pattern: /hearing/,
    copy: {
      whatItDoes: 'Provides hearing-day preparation prompts and document checks.',
      whyItMatters: 'Structured preparation reduces avoidable issues at hearing stage.',
      whenUsed: 'Used shortly before the listed hearing date.',
    },
  },
  {
    pattern: /case-summary|court-bundle-index|bundle/,
    copy: {
      whatItDoes: 'Creates an index and summary so the court bundle is easy to navigate.',
      whyItMatters: 'Organized bundles improve clarity and reduce case-management friction.',
      whenUsed: 'Used when finalizing the filing bundle.',
    },
  },
  {
    pattern: /arrears-engagement-letter/,
    copy: {
      whatItDoes: 'Documents arrears engagement attempts and payment communication history.',
      whyItMatters: 'Evidence of engagement supports reasonableness and chronology.',
      whenUsed: 'Used before or alongside formal claim preparation.',
    },
  },
];

const moneyClaimPurposeMatchers: PurposeMatcher[] = [
  {
    pattern: /form-n1|n1|claim-form/,
    copy: {
      whatItDoes: 'Builds the main claim form used to issue the debt claim in county court.',
      whyItMatters: 'Correct claimant, defendant, and amount details are essential to issue the claim.',
      whenUsed: 'Used at claim issue stage.',
    },
  },
  {
    pattern: /particulars/,
    copy: {
      whatItDoes: 'Sets out the legal and factual basis of the debt claim in structured narrative form.',
      whyItMatters: 'Specific particulars reduce ambiguity and help the court assess the claim.',
      whenUsed: 'Filed with or shortly after claim issue, depending on how you submit the claim.',
    },
  },
  {
    pattern: /schedule|arrears/,
    copy: {
      whatItDoes: 'Itemizes the debt with dates, amounts, and balances.',
      whyItMatters: 'A clear schedule supports quantum and auditability of the claim.',
      whenUsed: 'Used at pre-action and filing stages.',
    },
  },
  {
    pattern: /interest/,
    copy: {
      whatItDoes: 'Calculates claimable statutory interest based on debt timing and amounts.',
      whyItMatters: 'Accurate interest calculations help avoid overclaim or underclaim errors.',
      whenUsed: 'Used when finalizing claim value before issue.',
    },
  },
  {
    pattern: /letter-before-claim/,
    copy: {
      whatItDoes: 'Generates a pre-action letter setting out debt and payment demand terms.',
      whyItMatters: 'Pre-action compliance can affect court expectations and costs decisions.',
      whenUsed: 'Sent before court issue in line with protocol requirements.',
    },
  },
  {
    pattern: /defendant-information-sheet|reply-form|financial-statement/,
    copy: {
      whatItDoes: 'Provides protocol documents for response and affordability information.',
      whyItMatters: 'Including required response documents supports procedural compliance.',
      whenUsed: 'Served with the letter before claim.',
    },
  },
  {
    pattern: /court-filing-guide|enforcement-guide|guide/,
    copy: {
      whatItDoes: 'Explains filing and post-judgment enforcement options step by step.',
      whyItMatters: 'Guidance reduces missed procedural steps after document generation.',
      whenUsed: 'Used during filing and after judgment if payment is not made.',
    },
  },
];

const PURPOSE_MATCHERS: Record<FunnelProduct, PurposeMatcher[]> = {
  notice_only: noticeOnlyPurposeMatchers,
  complete_pack: completePackPurposeMatchers,
  money_claim: moneyClaimPurposeMatchers,
};

const getPurposeCopy = (product: FunnelProduct, docKey: string, docTitle: string): PurposeCopy => {
  const normalized = `${normalizeDocKey(docKey)} ${normalizeDocKey(docTitle)}`;
  const matcher = PURPOSE_MATCHERS[product].find(({ pattern }) => pattern.test(normalized));
  return matcher?.copy ?? fallbackPurposeCopy;
};

type FallbackDoc = {
  key: string;
  title: string;
};

const NOTICE_FALLBACK_DOCS: Record<NoticeVariantKey, FallbackDoc[]> = {
  section21: [
    { key: 'legacy-historical-notice', title: 'Historical legacy notice' },
    { key: 'compliance-declaration', title: 'Compliance Declaration' },
    { key: 'service-instructions', title: 'Service Instructions' },
    { key: 'validity-checklist', title: 'Validity Checklist' },
  ],
  section8: [
    { key: 'section8-form3a-notice', title: 'England Form 3A Possession Notice' },
    { key: 'rent-arrears-schedule', title: 'Rent Arrears Schedule' },
    { key: 'service-instructions', title: 'Service Instructions' },
    { key: 'validity-checklist', title: 'Validity Checklist' },
  ],
  section173: [
    { key: 'section173-notice', title: 'Section 173 Notice' },
    { key: 'pre-service-compliance-checklist', title: 'Pre-Service Compliance Checklist' },
    { key: 'service-instructions', title: 'Service Instructions' },
    { key: 'validity-checklist', title: 'Validity Checklist' },
  ],
  rhw23: [
    { key: 'rhw23-notice', title: 'RHW23 Fault-Based Notice' },
    { key: 'pre-service-compliance-checklist', title: 'Pre-Service Compliance Checklist' },
    { key: 'rent-schedule', title: 'Rent Schedule' },
    { key: 'service-instructions', title: 'Service Instructions' },
    { key: 'validity-checklist', title: 'Validity Checklist' },
  ],
  'notice-to-leave': [
    { key: 'notice-to-leave', title: 'Notice to Leave' },
    { key: 'compliance-declaration', title: 'Compliance Declaration' },
    { key: 'service-instructions', title: 'Service Instructions' },
    { key: 'validity-checklist', title: 'Validity Checklist' },
  ],
};

const COMPLETE_PACK_FALLBACK_DOCS: Record<CompletePackVariantKey, FallbackDoc[]> = {
  section21: [
    { key: 'legacy-historical-notice', title: 'Historical legacy notice' },
    { key: 'legacy-historical-claim', title: 'Historical legacy claim form' },
    { key: 'witness-statement', title: 'Witness Statement' },
    { key: 'evidence-checklist', title: 'Evidence Checklist' },
    { key: 'proof-of-service', title: 'Proof of Service' },
    { key: 'hearing-checklist', title: 'Hearing Checklist' },
  ],
  section8: [
    { key: 'notice', title: 'England Form 3A Possession Notice' },
    { key: 'n5', title: 'Form N5' },
    { key: 'n119', title: 'Form N119 Particulars' },
    { key: 'witness-statement', title: 'Witness Statement' },
    { key: 'evidence-checklist', title: 'Evidence Checklist' },
    { key: 'proof-of-service', title: 'Proof of Service' },
    { key: 'hearing-checklist', title: 'Hearing Checklist' },
  ],
};

const MONEY_CLAIM_FALLBACK_DOCS: FallbackDoc[] = [
  { key: 'form-n1', title: 'Form N1 Claim Form' },
  { key: 'particulars-of-claim', title: 'Particulars of Claim' },
  { key: 'schedule-of-arrears', title: 'Schedule of Arrears' },
  { key: 'interest-calculation', title: 'Interest Calculation' },
  { key: 'letter-before-claim', title: 'Letter Before Claim' },
  { key: 'defendant-information-sheet', title: 'Defendant Information Sheet' },
  { key: 'reply-form', title: 'Reply Form' },
  { key: 'financial-statement', title: 'Financial Statement' },
  { key: 'court-filing-guide', title: 'Court Filing Guide' },
  { key: 'enforcement-guide', title: 'Enforcement Guide' },
];

const hydrateSteps = (product: FunnelProduct, routeId: string, docs: PreviewDoc[], fallbackDocs: FallbackDoc[]) => {
  const effectiveDocs = docs.length
    ? docs
    : fallbackDocs.map((fallbackDoc) => ({
        key: fallbackDoc.key,
        title: fallbackDoc.title,
        alt: `${fallbackDoc.title} preview`,
        src: '',
      }));

  return effectiveDocs.map((doc, index) => {
    const copy = getPurposeCopy(product, doc.key, doc.title);
    return {
      id: `${routeId}-${index + 1}`,
      docKey: doc.key,
      docTitle: doc.title || toTitleCase(doc.key),
      whatItDoes: copy.whatItDoes,
      whyItMatters: copy.whyItMatters,
      whenUsed: copy.whenUsed,
      previewSrc: doc.src || undefined,
      previewAlt: doc.alt || undefined,
    } as FunnelProcessStep;
  });
};

const noticeOnlyTabs = (previews?: NoticeOnlyPreviewData): FunnelProcessTab[] => {
  const section8Docs = previews?.england?.section8 ?? [];

  return [
    {
      id: 'england',
      label: 'England',
      description: 'Current Section 8 notice for landlords in England.',
      routes: [
        {
          id: 'section8',
          label: 'Section 8 notice pack',
          subtitle: 'Notice, service guidance, and validation documents for the current England rules.',
          steps: hydrateSteps('notice_only', 'section8', section8Docs, NOTICE_FALLBACK_DOCS.section8),
        },
      ],
    },
  ];
};

const completePackTabs = (previews?: CompletePackPreviewData): FunnelProcessTab[] => [
  {
    id: 'england',
    label: 'England',
    description: 'Section 8 notice, court forms, and filing paperwork for England possession cases.',
    routes: [
      {
        id: 'section8',
        label: 'Section 8 notice, N5 and N119',
        subtitle: 'Notice, court forms, and the main papers for a standard possession claim.',
        steps: hydrateSteps('complete_pack', 'section8', previews?.section8 ?? [], COMPLETE_PACK_FALLBACK_DOCS.section8),
      },
    ],
  },
];

const moneyClaimTabs = (previews?: MoneyClaimPreviewData): FunnelProcessTab[] => [
  {
    id: 'england',
    label: 'England',
    description: 'County Court and pre-action debt pathway for landlord money claims.',
    routes: [
      {
        id: 'money-claim-route',
        label: 'Money claim pack',
        subtitle: 'Letter before claim, court papers, and enforcement preparation.',
        steps: hydrateSteps('money_claim', 'money-claim-route', previews ?? [], MONEY_CLAIM_FALLBACK_DOCS),
      },
    ],
  },
];

export const buildFunnelProcessSectionModel = (input: BuildFunnelProcessSectionInput): FunnelProcessSectionModel => {
  if (input.product === 'notice_only') {
    return {
      heading: 'Understand Why Each Section 8 Notice Document Matters',
      subheading:
        'Preview the England notice pack, see what each document does, and understand why it matters before you generate the final version.',
      tabs: noticeOnlyTabs(input.noticePreviews),
      defaultTabId: 'england',
    };
  }

  if (input.product === 'complete_pack') {
    return {
      heading: 'Understand Why Each Court Pack Document Matters',
      subheading:
        'Preview the pack, see what each document is for, and understand why it matters before you buy.',
      tabs: completePackTabs(input.completePackPreviews),
      defaultTabId: 'england',
    };
  }

  return {
    heading: 'Understand Why Each Money Claim Document Matters',
    subheading:
      'Preview the debt documents, see what each one is for, and understand when you will use it.',
    tabs: moneyClaimTabs(input.moneyClaimPreviews),
    defaultTabId: 'england',
  };
};


