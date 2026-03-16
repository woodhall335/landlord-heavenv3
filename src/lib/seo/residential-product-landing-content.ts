import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_WIZARD_UPSELLS,
  type ResidentialLettingProductSku,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from '@/lib/residential-letting/products';
import {
  getResidentialStandaloneProfile,
  type ResidentialCautionBanner,
  type ResidentialLandingLink,
} from '@/lib/residential-letting/standalone-profiles';

type PublicResidentialLettingProductSku =
  (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number];

export interface ResidentialLandingComparisonRow {
  point: string;
  thisDocument: string;
  alternative: string;
}

export interface ResidentialLandingComparison {
  alternativeLabel: string;
  alternativeHref: string;
  rows: ResidentialLandingComparisonRow[];
}

export interface ResidentialLandingContent {
  slug: string;
  product: PublicResidentialLettingProductSku;
  title: string;
  description: string;
  h1: string;
  subheading: string;
  overview: string;
  quickAnswer: string;
  icon: string;
  whyUseThis: string[];
  howWizardWorks: string[];
  whenToUse: string[];
  howToUseAfterDownload: string[];
  commonMistakes: string[];
  whoThisIsFor: string[];
  notFor: string[];
  legalExplainer: string;
  includedHighlights: string[];
  documentPreviewAnatomy: string[];
  comparison: ResidentialLandingComparison;
  guideLinks: ResidentialLandingLink[];
  internalLinks: ResidentialLandingLink[];
  lastUpdated: string;
  cautionBanner?: ResidentialCautionBanner;
  faqs: Array<{ question: string; answer: string }>;
}

interface ResidentialLandingSeoGuideContent {
  quickAnswer: string;
  whenToUse: string[];
  howToUseAfterDownload: string[];
  commonMistakes: string[];
  comparison: ResidentialLandingComparison;
  guideLinks: ResidentialLandingLink[];
}

const LAST_UPDATED = 'March 2026';

const LANDLORD_DOCUMENT_HUB_LINK: ResidentialLandingLink = {
  label: 'England landlord document hub',
  href: '/landlord-documents-england',
  description: 'Browse the full set of England landlord agreement, arrears, inspection, and inventory documents.',
};

function link(label: string, href: string, description: string): ResidentialLandingLink {
  return { label, href, description };
}

function withHubLink(links: ResidentialLandingLink[]): ResidentialLandingLink[] {
  const seen = new Set<string>();

  return [...links, LANDLORD_DOCUMENT_HUB_LINK].filter((item) => {
    const key = `${item.href}:${item.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const AGREEMENT_SEO_GUIDE_CONTENT = {
  guarantor_agreement: {
    quickAnswer:
      'A guarantor agreement is used when a third party agrees to cover the tenant obligations if the tenant does not pay or otherwise defaults. Landlords usually use it before the tenancy starts where income is tight, the tenant is a student, or the affordability picture is weaker than the landlord is willing to accept on the tenant alone.',
    whenToUse: [
      'The tenant needs a guarantor to satisfy your referencing or affordability checks.',
      'You want the guarantor liability, any cap, and renewal wording written clearly rather than implied.',
      'You want a signed deed kept with the tenancy file before keys are released.',
    ],
    howToUseAfterDownload: [
      'Check the tenant, property, and tenancy dates match the main tenancy paperwork exactly.',
      'Decide whether the guarantee covers rent only or the wider tenant obligations before signing.',
      'Have the guarantor sign it properly as a deed and keep the witnessed copy with the tenancy agreement.',
    ],
    commonMistakes: [
      'Using vague wording about what the guarantor is actually covering.',
      'Not matching the names, address, or tenancy details to the main tenancy documents.',
      'Treating a deed like an informal note and missing proper witnessing.',
    ],
    comparison: {
      alternativeLabel: 'Tenancy agreement only',
      alternativeHref: '/assured-shorthold-tenancy-agreement-template',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You need a third party to stand behind the tenant obligations.',
          alternative: 'You are only setting the landlord and tenant terms with no separate guarantor.',
        },
        {
          point: 'What it records',
          thisDocument: 'Guarantor identity, liability scope, cap, continuation, and deed wording.',
          alternative: 'Core tenancy terms between landlord and tenant.',
        },
        {
          point: 'Signing',
          thisDocument: 'Signed by the guarantor as a deed and usually witnessed.',
          alternative: 'Signed as the main tenancy agreement.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Claim against a guarantor',
        '/money-claim-guarantor',
        'Read the enforcement guide if the guarantor later needs to be pursued for arrears or damage.'
      ),
      link(
        'AST agreement guide',
        '/assured-shorthold-tenancy-agreement-template',
        'Check the main tenancy route if you are still setting up the tenancy itself.'
      ),
    ]),
  },
  residential_sublet_agreement: {
    quickAnswer:
      'A residential sublet agreement is used when the existing tenant is granting occupation to a subtenant while the original tenancy continues above it. It is usually the right document where the head tenant is staying legally responsible to the landlord and wants the occupation, rent split, shared areas, and consent position written down clearly.',
    whenToUse: [
      'The original tenant is subletting all or part of the property instead of assigning the tenancy away.',
      'You need to record what space is exclusive, what stays shared, and how rent and bills are handled.',
      'You want the superior tenancy and landlord consent position set out in the document.',
    ],
    howToUseAfterDownload: [
      'Check that the head tenancy really allows subletting or that any required consent has been given.',
      'Describe the room or areas being sublet clearly so there is no confusion about shared spaces.',
      'Keep the signed sublet agreement with the head tenancy and any landlord consent letters.',
    ],
    commonMistakes: [
      'Using a sublet agreement where the real arrangement is a full assignment to a replacement tenant.',
      'Not stating what happens if the head tenancy ends or consent is withdrawn.',
      'Leaving utilities, keys, or house rules to separate informal messages.',
    ],
    comparison: {
      alternativeLabel: 'Lease assignment agreement',
      alternativeHref: '/lease-assignment-agreement-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'The head tenant stays on the hook under the original tenancy.',
          alternative: 'The outgoing tenant is being replaced by an incoming tenant.',
        },
        {
          point: 'Who remains liable to the landlord',
          thisDocument: 'The head tenant still sits between the landlord and the subtenant.',
          alternative: 'Liability moves to the incoming tenant subject to the assignment terms.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Occupation scope, house rules, rent, and the superior tenancy position.',
          alternative: 'Transfer of the tenancy interest and release or handover terms.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Tenant subletting without permission',
        '/tenant-subletting-without-permission',
        'Use the guide if the sublet issue is part of a wider breach or enforcement problem.'
      ),
      link(
        'Flatmate agreement',
        '/flatmate-agreement-england',
        'Use a flatmate agreement instead where the arrangement is shared living rather than a true sublet.'
      ),
    ]),
  },
  lease_amendment: {
    quickAnswer:
      'A lease amendment is used when the existing tenancy continues but specific terms need to change. It is usually the right document for targeted changes such as rent, clauses, occupier details, or other agreed wording where the parties want a clear addendum rather than a whole new tenancy document.',
    whenToUse: [
      'The tenancy is continuing and you only need to change selected terms.',
      'You want a clause-by-clause record of what is changing and what stays the same.',
      'You need a document that can sit behind the original tenancy in the same file.',
    ],
    howToUseAfterDownload: [
      'Check the clause references and new wording against the original signed tenancy before signing.',
      'Use precise effective dates so the change is easy to follow later.',
      'Store the signed amendment with the original tenancy rather than treating it as a replacement agreement.',
    ],
    commonMistakes: [
      'Using vague free text instead of identifying the exact clause being changed.',
      'Trying to use an amendment where the arrangement is really a new term or a new tenancy.',
      'Forgetting to make clear that all other terms remain unchanged.',
    ],
    comparison: {
      alternativeLabel: 'Renewal tenancy agreement',
      alternativeHref: '/renewal-tenancy-agreement-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'The tenancy stays in place and you are changing selected wording.',
          alternative: 'You are trying to document a fresh term for a continuing tenant.',
        },
        {
          point: 'Main result',
          thisDocument: 'A short variation document that sits with the original tenancy.',
          alternative: 'A renewal-style agreement with earlier tenancy and new term details.',
        },
        {
          point: 'What it avoids',
          thisDocument: 'Reissuing the whole tenancy where only a few points need updating.',
          alternative: 'Using amendment wording where the intention is genuinely a renewal.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Renew or update a tenancy guide',
        '/renew-tenancy-agreement-england',
        'Read the guide if you are deciding between amendment, periodic continuation, or a new term.'
      ),
      link(
        'AST agreement guide',
        '/assured-shorthold-tenancy-agreement-template',
        'Useful if the better answer is a fresh tenancy rather than an amendment.'
      ),
    ]),
  },
  lease_assignment_agreement: {
    quickAnswer:
      'A lease assignment agreement is used when one tenant is being replaced by another and the tenancy interest is being transferred. It is usually the right document where the landlord consents to the transfer, the outgoing and incoming tenants need their positions recorded clearly, and deposit or handover points must be addressed in the same paperwork.',
    whenToUse: [
      'The outgoing tenant is leaving and an incoming tenant is taking over the tenancy.',
      'You need the assignment date, consent position, and handover details recorded properly.',
      'You want the document to say what happens to the deposit, keys, and apportionments.',
    ],
    howToUseAfterDownload: [
      'Check that the landlord consent and assignment date align with the rest of the tenancy file.',
      'Confirm who is taking responsibility for the deposit, keys, and any shared liabilities.',
      'Keep the signed agreement with the original tenancy and the consent evidence.',
    ],
    commonMistakes: [
      'Using assignment wording where the head tenant is actually staying in place and subletting.',
      'Leaving deposit treatment or key handover unclear between outgoing and incoming tenants.',
      'Not stating whether the outgoing tenant is released or still liable for anything after assignment.',
    ],
    comparison: {
      alternativeLabel: 'Residential sublet agreement',
      alternativeHref: '/residential-sublet-agreement-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'The tenancy interest is being transferred to a replacement tenant.',
          alternative: 'The original tenant stays bound by the head tenancy and grants a subtenancy underneath.',
        },
        {
          point: 'Who is moving into the legal position',
          thisDocument: 'The incoming tenant steps into the tenancy from the assignment date.',
          alternative: 'The subtenant occupies under a separate agreement below the head tenancy.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Consent, release, handover, apportionments, and deposit handling.',
          alternative: 'Occupation scope, house rules, and the superior tenancy position.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Tenant subletting without permission',
        '/tenant-subletting-without-permission',
        'Helpful if you are still working out whether the facts point to subletting or assignment.'
      ),
      link(
        'Renew or update a tenancy guide',
        '/renew-tenancy-agreement-england',
        'Read this if the real issue is changing terms rather than replacing the tenant.'
      ),
    ]),
  },
  flatmate_agreement: {
    quickAnswer:
      'A flatmate agreement is used to record how people sharing a home will handle rooms, rent split, bills, chores, guests, notice, and move-out issues between themselves. It is usually the right document where the arrangement is internal to the household and you need something more practical than a tenancy document but more reliable than a chat thread.',
    whenToUse: [
      'The occupiers need a written record of room allocation, payments, and house rules between themselves.',
      'You want a practical shared-living document covering guests, bills, chores, and notice.',
      'You need a clearer process for replacing an occupier or dealing with shared costs on move-out.',
    ],
    howToUseAfterDownload: [
      'Make sure the room allocation and payment split match how the household actually works.',
      'Be specific about guest rules, quiet hours, cleaning, and shared purchases so expectations are clear.',
      'Use it as a household agreement alongside, not instead of, the main landlord-facing tenancy paperwork.',
    ],
    commonMistakes: [
      'Using a flatmate agreement where the facts really point to a sublet or assignment.',
      'Leaving bills, notice, or replacement occupier rules too vague to be useful later.',
      'Assuming it changes the landlord-facing tenancy by itself.',
    ],
    comparison: {
      alternativeLabel: 'Residential sublet agreement',
      alternativeHref: '/residential-sublet-agreement-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You need a household agreement between people already sharing the home.',
          alternative: 'One occupier is granting a real subtenancy out of an existing tenancy.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Room allocation, bills, chores, house rules, and move-out mechanics.',
          alternative: 'Subtenancy grant, superior tenancy context, consent, and occupation rights.',
        },
        {
          point: 'Relationship to the landlord tenancy',
          thisDocument: 'Internal to the household and not a substitute for the landlord-facing agreement.',
          alternative: 'A formal occupation agreement linked to the head tenancy structure.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Tenant subletting without permission',
        '/tenant-subletting-without-permission',
        'Useful if you are still deciding whether the arrangement is really flat-sharing or an unauthorised sublet.'
      ),
      link(
        'AST agreement guide',
        '/assured-shorthold-tenancy-agreement-template',
        'Check the landlord-facing tenancy route if the main tenancy also needs to be updated.'
      ),
    ]),
  },
  renewal_tenancy_agreement: {
    quickAnswer:
      'A renewal tenancy agreement is used where the landlord and tenant genuinely intend to document a fresh term rather than simply letting the tenancy continue or changing a few clauses. It is usually the right document only in narrower England cases, and the key question is whether renewal is actually the correct route or whether an amendment or periodic continuation is the better answer.',
    whenToUse: [
      'You have decided that a new term is genuinely needed rather than simply changing one or two clauses.',
      'You want the earlier tenancy, new term, rent, and changed terms recorded together in one renewal document.',
      'You have checked the current suitability warning and are comfortable that renewal is still the right path for the case.',
    ],
    howToUseAfterDownload: [
      'Check carefully whether the case should instead remain periodic or be handled by amendment.',
      'Make sure the earlier tenancy dates, the renewal start, and the changed terms all line up correctly.',
      'Keep the signed renewal with the earlier tenancy file and any compliance records it relies on.',
    ],
    commonMistakes: [
      'Using renewal wording where you are really just changing selected clauses in the existing tenancy.',
      'Overlooking the post-1 May 2026 warning position for England assured tenancies.',
      'Reissuing a new term without checking whether the tenancy could simply continue or be amended.',
    ],
    comparison: {
      alternativeLabel: 'Lease amendment',
      alternativeHref: '/lease-amendment-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You are documenting a fresh term for a continuing tenant.',
          alternative: 'You are changing selected wording while the tenancy itself continues.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Earlier tenancy details, renewal term, rent, and changed terms schedule.',
          alternative: 'Clause-by-clause changes and confirmation that the rest of the tenancy stays the same.',
        },
        {
          point: 'Question to ask first',
          thisDocument: 'Is renewal still the right route for this England case?',
          alternative: 'Do I simply need a clear addendum to the existing tenancy?',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Renew or update a tenancy guide',
        '/renew-tenancy-agreement-england',
        'Read the guide if you are still deciding between renewal, amendment, or letting the tenancy continue.'
      ),
      link(
        'Fixed term or periodic tenancy',
        '/fixed-term-periodic-tenancy-england',
        'Useful if you need to step back and decide whether a new fixed term is necessary at all.'
      ),
    ]),
  },
};

const ARREARS_SEO_GUIDE_CONTENT = {
  rent_arrears_letter: {
    quickAnswer:
      'A rent arrears letter is used when rent is overdue and the landlord wants a clear written demand that records the amount owed, the missed periods, the payment deadline, and the next likely step. It is usually the right first document where you want to press for payment or create a cleaner paper trail before a formal repayment plan, possession route, or money claim.',
    whenToUse: [
      'Rent is already overdue and you want a clear written demand rather than an informal reminder.',
      'You need a professional arrears summary before considering a repayment plan or court action.',
      'You want the payment instructions and response deadline stated in one place.',
    ],
    howToUseAfterDownload: [
      'Check the rent periods, payments received, and balance carefully against your ledger before sending.',
      'Serve the letter through the channels you normally rely on and keep proof of service.',
      'If the tenant responds with a proposal, move to a written repayment plan rather than leaving the arrangement informal.',
    ],
    commonMistakes: [
      'Sending a demand with the wrong balance or unclear missed rent periods.',
      'Using aggressive wording that goes beyond what the document is meant to do.',
      'Failing to keep a dated copy and proof of service for the tenancy file.',
    ],
    comparison: {
      alternativeLabel: 'Repayment plan agreement',
      alternativeHref: '/repayment-plan-agreement-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You are demanding payment and setting out the arrears position.',
          alternative: 'Both sides have agreed to clear arrears over time by instalments.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Arrears summary, payment deadline, and next-step warning.',
          alternative: 'Instalment dates, running balance, default consequences, and signatures.',
        },
        {
          point: 'Timing',
          thisDocument: 'Usually before any agreed settlement is reached.',
          alternative: 'After the parties have agreed a realistic repayment structure.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Rent arrears letter template guide',
        '/rent-arrears-letter-template',
        'Read the free guide if you want timing, wording, and escalation context around arrears letters.'
      ),
      link(
        'Claim rent arrears from a tenant',
        '/claim-rent-arrears-tenant',
        'Use the guide if you are moving from reminders and demands into court recovery.'
      ),
      link(
        'Rent arrears calculator',
        '/tools/rent-arrears-calculator',
        'Check the running balance before you finalise the arrears schedule.'
      ),
    ]),
  },
  repayment_plan_agreement: {
    quickAnswer:
      'A repayment plan agreement is used after rent arrears have built up and both sides want a written schedule for clearing the debt over time. It is usually the right document where the tenancy is continuing, instalments need to be set out clearly, and the landlord wants default wording and ongoing rent obligations recorded in the same agreement.',
    whenToUse: [
      'The tenant has acknowledged arrears and an instalment arrangement is being discussed.',
      'You want the due dates, running balance, and payment method written down clearly.',
      'You want the agreement to say what happens if the tenant misses an instalment.',
    ],
    howToUseAfterDownload: [
      'Check the arrears figure is correct before breaking it into instalments.',
      'Make it clear whether the tenant must also keep paying the usual ongoing rent on time.',
      'Monitor the payment dates closely and keep the signed plan with the arrears ledger.',
    ],
    commonMistakes: [
      'Agreeing a verbal plan with no written dates, balance, or default consequences.',
      'Setting instalments that ignore the ongoing rent and are not realistic to maintain.',
      'Leaving it unclear whether the landlord rights are preserved if the plan fails.',
    ],
    comparison: {
      alternativeLabel: 'Rent arrears letter',
      alternativeHref: '/rent-arrears-letter-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'Payment terms have been discussed and you need a written plan.',
          alternative: 'You are still demanding payment and setting out the arrears position.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Instalments, running balance, grace periods, and default wording.',
          alternative: 'Arrears demand, deadline, and warning of next steps.',
        },
        {
          point: 'Signing',
          thisDocument: 'Usually signed by both sides to show the arrangement agreed.',
          alternative: 'Usually sent as a landlord letter rather than a bilateral agreement.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Rent arrears landlord guide',
        '/rent-arrears-landlord-guide',
        'Read the wider guide if you are balancing payment plans, possession, and debt recovery.'
      ),
      link(
        'Claim rent arrears from a tenant',
        '/claim-rent-arrears-tenant',
        'Useful if the repayment plan fails and you need to move into court recovery.'
      ),
      link(
        'Rent arrears calculator',
        '/tools/rent-arrears-calculator',
        'Check the balance and instalment structure before finalising the agreement.'
      ),
    ]),
  },
};

const EVIDENCE_SEO_GUIDE_CONTENT = {
  rental_inspection_report: {
    quickAnswer:
      'A rental inspection report is used to record what you saw at the property on a specific visit, together with any issues, actions, readings, keys, comments, and supporting evidence. It is usually the right document for interim checks, move-in or move-out visits, and situations where you want a dated inspection record rather than a full baseline inventory.',
    whenToUse: [
      'You are carrying out an interim inspection, move-in visit, or move-out visit and want a dated report.',
      'You want room-by-room observations, actions, and supporting evidence references in one document.',
      'You need a cleaner inspection record for later management, repair, or dispute discussions.',
    ],
    howToUseAfterDownload: [
      'Build the room list to match the property so the report is easy to compare with later evidence.',
      'Use specific notes for issues, actions, meter readings, and occupier comments while the visit is fresh.',
      'Keep the signed or acknowledged report with the property file and any supporting photos or uploads.',
    ],
    commonMistakes: [
      'Using an inspection report as if it were a full check-in inventory when no proper baseline exists.',
      'Writing broad notes like "good condition" without saying what was actually observed.',
      'Failing to tie photos, comments, and action points back to the correct room.',
    ],
    comparison: {
      alternativeLabel: 'Inventory and schedule of condition',
      alternativeHref: '/inventory-schedule-of-condition-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You need a dated visit record with observations and follow-up points.',
          alternative: 'You need a baseline check-in style record of rooms, items, and condition.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Observations, issues, actions, utilities, keys, and occupier comments.',
          alternative: 'Room-by-room item lists, condition, cleanliness, handover details, and acknowledgments.',
        },
        {
          point: 'Typical timing',
          thisDocument: 'Interim visits, move-in checks, move-out checks, or issue-led inspections.',
          alternative: 'Start-of-tenancy evidence and structured condition recording.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Tenant refusing inspection',
        '/tenant-refusing-inspection',
        'Read the guide if access itself is part of the problem and you need the wider process context.'
      ),
      link(
        'Property damage claims',
        '/money-claim-property-damage',
        'Useful if the inspection findings may later support a damages claim.'
      ),
    ]),
  },
  inventory_schedule_condition: {
    quickAnswer:
      'An inventory and schedule of condition is used to record the property, the items provided, and the condition or cleanliness at the start of the tenancy or another agreed handover point. It is usually the right baseline document where you want a room-by-room record that can be checked against later damage, missing items, or cleaning issues.',
    whenToUse: [
      'You need a clear baseline record at move-in or another formal handover stage.',
      'You want room-by-room item details, condition notes, keys, readings, and acknowledgments in one place.',
      'You want a stronger starting point for later deposit or damage discussions.',
    ],
    howToUseAfterDownload: [
      'List the rooms and the supplied items carefully so the baseline is usable later.',
      'Be specific about condition, cleanliness, quantities, and anything already worn or marked.',
      'Keep the signed or acknowledged inventory with the tenancy file and supporting evidence.',
    ],
    commonMistakes: [
      'Treating the inventory like a short checklist instead of a proper baseline record.',
      'Failing to note existing wear, missing items, or meter readings at handover.',
      'Leaving the tenant acknowledgment or amendment process unclear.',
    ],
    comparison: {
      alternativeLabel: 'Rental inspection report',
      alternativeHref: '/rental-inspection-report-england',
      rows: [
        {
          point: 'Best when',
          thisDocument: 'You need a baseline condition and contents record for the property.',
          alternative: 'You need a dated inspection record for a specific visit or issue-led check.',
        },
        {
          point: 'Main focus',
          thisDocument: 'Room and item inventory, condition, cleanliness, keys, and handover information.',
          alternative: 'Observations, issues, actions, occupier comments, and follow-up notes.',
        },
        {
          point: 'Typical use',
          thisDocument: 'Check-in style evidence and comparison against later condition.',
          alternative: 'Interim inspection, move-out review, or targeted visit reporting.',
        },
      ],
    },
    guideLinks: withHubLink([
      link(
        'Tenant damaging property',
        '/tenant-damaging-property',
        'Read the guide if you are thinking ahead to evidence for damage recovery.'
      ),
      link(
        'Cleaning cost claims',
        '/money-claim-cleaning-costs',
        'Useful if you later need to claim for cleaning using a good baseline record.'
      ),
    ]),
  },
};

const SEO_GUIDE_CONTENT = {
  ...AGREEMENT_SEO_GUIDE_CONTENT,
  ...ARREARS_SEO_GUIDE_CONTENT,
  ...EVIDENCE_SEO_GUIDE_CONTENT,
} as Record<PublicResidentialLettingProductSku, ResidentialLandingSeoGuideContent>;

export const RESIDENTIAL_LANDING_CONTENT: Record<
  PublicResidentialLettingProductSku,
  ResidentialLandingContent
> = Object.fromEntries(
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map((product) => {
    const profile = getResidentialStandaloneProfile(product);
    const landing = profile.landing;
    const seoGuide = SEO_GUIDE_CONTENT[product];

    return [
      product,
      {
        slug: RESIDENTIAL_LETTING_PRODUCTS[product].slug,
        product,
        title: landing.title,
        description: landing.description,
        h1: landing.h1,
        subheading: landing.subheading,
        overview: landing.overview,
        quickAnswer: seoGuide.quickAnswer,
        icon: profile.icon,
        whyUseThis: landing.whyUseThis,
        howWizardWorks: landing.howWizardWorks,
        whenToUse: seoGuide.whenToUse,
        howToUseAfterDownload: seoGuide.howToUseAfterDownload,
        commonMistakes: seoGuide.commonMistakes,
        whoThisIsFor: landing.whoThisIsFor,
        notFor: landing.notFor,
        legalExplainer: landing.legalExplainer,
        includedHighlights: landing.includedHighlights,
        documentPreviewAnatomy: landing.documentPreviewAnatomy,
        comparison: seoGuide.comparison,
        guideLinks: seoGuide.guideLinks,
        internalLinks: landing.internalLinks,
        lastUpdated: LAST_UPDATED,
        cautionBanner: profile.cautionBanner,
        faqs: landing.faqs,
      },
    ];
  })
) as Record<PublicResidentialLettingProductSku, ResidentialLandingContent>;

export function getResidentialLandingContentBySlug(
  slug: string
): ResidentialLandingContent | undefined {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).find((content) => content.slug === slug);
}

export function getResidentialLandingSlugs(): string[] {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).map((content) => content.slug);
}

export function getResidentialRelatedLinks(product: ResidentialLettingProductSku): Array<{
  label: string;
  href: string;
  description: string;
}> {
  const wizardUpsells = RESIDENTIAL_WIZARD_UPSELLS[product] || [];
  return wizardUpsells
    .map((sku) => ({
      label: RESIDENTIAL_LETTING_PRODUCTS[sku].label,
      href: getResidentialLandingHref(sku),
      description: RESIDENTIAL_LETTING_PRODUCTS[sku].description,
    }))
    .slice(0, 3);
}

export function getResidentialWizardEntry(product: ResidentialLettingProductSku): string {
  return getResidentialWizardHref(product).replace('src=product_page', 'src=seo_landing');
}
