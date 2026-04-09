import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const section13NoticePage: RentIncreaseGuidePage = {
  slug: 'section-13-notice',
  path: `${RENT_INCREASE_HUB_PATH}/section-13-notice`,
  title: 'Section 13 Notice Guide',
  heroTitle: 'Section 13 Notice for Landlords in England',
  heroSubtitle:
    'Understand what the notice does, when it applies, and how to present a rent proposal that is both compliant and defendable.',
  heroBullets: [
    'Notice explainer intent: what Section 13 is and what it is not.',
    'Covers practical notice quality, not just form completion.',
    'Links to Form 4A, rules, and tribunal pages for deeper steps.',
  ],
  metaTitle: 'Section 13 Notice UK: Landlord Guide to Form 4A and Rent Increase Process',
  metaDescription:
    'Detailed Section 13 notice guide for landlords in England. Learn what the notice does, legal timing rules, common errors, and how to reduce challenge risk.',
  primaryKeyword: 'section 13 notice',
  intentLabel: 'notice explainer',
  introAngle:
    'Clarify the role of the notice first, then connect it to evidence quality and service discipline.',
  heroImage: '/images/wizard-icons/06-notice-details.png',
  heroAlt: 'Section 13 notice explainer icon',
  secondaryCta: RENT_INCREASE_LINKS.form4a,
  quickAnswer: [
    'A section 13 notice is the formal route for proposing a new rent in relevant assured tenancy contexts in England. From 1 May 2026, the prescribed form is Form 4A. The notice communicates the proposed figure and intended start date, but it does not prove the figure is reasonable on its own. Landlords still need a coherent evidence basis and a clean service record. In practice, supporting-file quality matters as much as form completion if the tenant pushes back.',
    'Think of the notice as the front cover of your rent-increase file. If the front cover is tidy but the pages inside are inconsistent, confidence falls quickly. If the front cover and evidence set tell one story, confidence rises. The best section 13 practice therefore joins notice drafting with comparable analysis, timeline validation, and proof-of-service retention.',
    'Landlords sometimes frame section 13 as a percentage increase exercise. That framing is weak. The stronger framing is market position: what the proposed figure means relative to local comparable homes on a normalized basis. This page explains the notice role; linked pages cover form completion detail, rules, and dispute handling.',
    'For operational consistency, treat notice preparation as a checklist-driven task rather than an ad hoc drafting exercise. When chronology, evidence position, and service plan are validated in sequence, the final notice is clearer and easier to support. This approach also reduces rushed edits that can introduce avoidable inconsistencies across documents.',
  ],
  sections: sections({
    whatIsIt: [
      'Section 13 is the formal notice mechanism for proposing a revised rent in England where that route is applicable. It is procedural in form but evidential in effect. Procedural, because the notice must be correctly completed and served. Evidential, because the proposal may be tested against market indicators if challenged. Strong landlords treat these as one workflow, not separate tasks performed by different teams at different times.',
      'The practical meaning for operations is straightforward. Do not finalize the notice before checking chronology and comparable strength. Do not communicate one justification in email and another in the report. Do not rely on memory for service details. The notice should be the concise expression of work already done, not the beginning of that work.',
      'A well-built notice also improves teamwork. If anyone in your organisation needs to review or explain the case, the rationale should be obvious from the pack. Clear structure and stable wording reduce dependency on one person\'s memory and make support responses faster and more consistent.',
    ],
    legalRules: [
      'Detailed process on this page is for England. At minimum, landlords need to respect notice timing and tenancy-period alignment requirements, and avoid frequency errors that trigger anti-drift failures. The easiest way to fail quality control is to choose the proposed start date first and then force chronology to fit. Good process reverses that: compute earliest valid date first, then decide proposal timing around it.',
      'Another legal quality point is scope discipline. A section 13 notice is not a tribunal submission, but it should still be drafted with tribunal readability in mind. Dates should be unambiguous, property identifiers consistent, and proposal wording reproducible from saved facts. This preserves credibility if the case later moves into a formal dispute path.',
    ],
    stepByStep: [
      'Start with tenancy facts and historical anchors. Confirm current rent terms, tenancy start date, service method assumptions, and previous increase chronology. Then calculate the earliest valid start date and lock it. Next, build a comparable set and derive a proposed figure from the adjusted range. Only after those steps should Form 4A be completed. This sequence prevents mismatch between the notice date and evidence horizon.',
      'After completing the notice, serve it using your chosen method, then document service immediately. Keep the service record in the same folder as the justification report and comparables summary. If tenant correspondence begins, answer from that file. This keeps the narrative stable and reduces conflicting statements that weaken credibility.',
    ],
    commonMistakes: [
      'One recurring mistake is overconfidence in form completion while underinvesting in evidence quality. Another is importing comparables that are not genuinely similar in location or property profile, then treating outliers as anchors for the proposed figure. Landlords also lose strength when they over-explain costs and under-explain market position, because challenge forums focus on market rent, not landlord budget pressure.',
      'Service-record mistakes remain common. Notices are served, but method, date, and supporting records are not preserved in a consistent log. When a tenant disputes timing, that omission creates avoidable uncertainty. A premium process treats service documentation as mandatory output, not optional admin.',
    ],
    tribunalRisks: [
      'Tribunal risk rises when the proposal appears detached from local evidence. Even where comparables exist, weak adjustment reasoning or unclear recency can reduce confidence. Risk also rises when the notice pack contains internally inconsistent language. Tribunal context rewards clarity and coherence more than volume.',
      'A landlord can lower risk by keeping three elements aligned: proposal figure, comparable analysis, and explanation sentence. If those agree, the case reads as disciplined. If they diverge, the tenant has an easier line of attack. This is why deterministic wording and snapshot-safe generation matter in production systems.',
    ],
    avoidChallenges: [
      'To reduce challenge probability, make the proposal legible and proportionate. Show where the figure sits in the local range, reference recent source-backed comparables, and avoid unnecessary rhetoric. A tenant who understands the basis may still disagree, but a clear file reduces confusion-driven disputes.',
      'Use this page with the linked Form 4A and market-rent pages, then generate the Standard pack once your figure and date are settled. Keep final notice, proof-of-service record, and report together. That gives you a coherent file for normal correspondence and a stronger baseline if disagreement escalates.',
      'When answering tenant questions, keep the same concise case-position sentence used in your report. Consistency lowers friction and shows the proposal is evidence-led rather than improvised. Clear repetition of the same factual basis is often the simplest way to prevent escalation from misunderstanding.',
    ],
  }),
  faqs: [
    {
      question: 'Is Section 13 the same as Form 4A?',
      answer:
        'No. Section 13 is the legal route; Form 4A is the prescribed form used to serve the notice in that route.',
    },
    {
      question: 'Can I rely on the form without a justification report?',
      answer:
        'You can serve the form, but challenge resilience is much stronger when the form is paired with a clear comparable-based report and service record.',
    },
    {
      question: 'Does this page cover Scotland, Wales, and Northern Ireland procedures?',
      answer:
        'No. The detailed process here is for England, and other UK nations have different rules and forms.',
    },
    {
      question: 'What should I do immediately after serving the notice?',
      answer:
        'Record service details and keep the notice, service proof, and supporting report in one stable case file.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.tribunal,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Build a stronger Section 13 notice from the start',
  midCtaBody:
    'Generate the notice, service record, and support report from one validated workflow so your reasoning stays consistent.',
  finalCtaTitle: 'Generate your Section 13 notice now',
  finalCtaBody:
    'Use the Standard wizard for a confident DIY notice pack with built-in validation and evidence framing.',
};
