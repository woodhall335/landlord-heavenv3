import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const rentIncreaseHubPage: RentIncreaseGuidePage = {
  slug: 'hub',
  path: RENT_INCREASE_HUB_PATH,
  title: 'Rent Increase Guide',
  heroTitle: 'Rent Increase Guide for England Landlords',
  heroSubtitle:
    'Understand Section 13, Form 4A, market-rent evidence, and challenge risk as one connected workflow before you serve notice.',
  heroBullets: [
    'Built for the current England assured tenancy route from 1 May 2026.',
    'Covers notice drafting, date validation, comparables, and dispute preparation.',
    'Routes into the Section 13 wizard when you are ready to generate the pack.',
  ],
  metaTitle: 'Rent Increase Guide UK: Section 13, Form 4A, Rules and Tribunal Risk',
  metaDescription:
    'Authoritative landlord guide to increasing rent in England using Section 13 and Form 4A. Learn legal rules, market-rent evidence, challenge risk, and practical next steps.',
  primaryKeyword: 'rent increase UK',
  intentLabel: 'hub / cluster overview',
  introAngle:
    'Map the full process first so you do not serve a notice before checking dates, evidence quality, and challenge exposure.',
  heroImage: '/images/wizard-icons/41-rent.png',
  heroAlt: 'Rent increase process overview illustration',
  secondaryCta: RENT_INCREASE_LINKS.section13,
  quickAnswer: [
    "This hub is the control panel for the Section 13 topic cluster. Instead of treating a rent increase as a single-form task, it shows the landlord workflow as a sequence: confirm tenancy facts, calculate the earliest valid date, set a defensible figure from comparables, complete Form 4A, serve correctly, and keep the service and evidence trail ready. The practical benefit is fewer reworks, fewer avoidable disputes, and clearer internal consistency if the tenant asks for reasons or challenges the proposal.",
    'The pages are split by intent so you can go straight to the question you actually have. One page explains the Section 13 notice role, one focuses on Form 4A completion, one clarifies rules and jurisdiction boundaries, one focuses on market-rent method, and two pages handle challenge and tribunal paths. That separation matters because these topics overlap heavily and landlords need a clear reading route, not the same content rewritten under different titles.',
    'If you only remember one principle, use this one: serve a notice only after the underlying case file is coherent. A polished form with weak evidence is fragile. A coherent evidence file with an accurate form is durable. The Standard Section 13 wizard is designed around that order so landlords can make decisions before checkout, not discover weaknesses after service.',
  ],
  sections: sections({
    whatIsIt: [
      'The rent increase hub is a practical landlord reference for the England process. It is not a law-school summary and it is not a sales page disguised as advice. The objective is to give a clear, search-intent-based route through the topics that actually decide quality: legal timing, notice completion, evidence depth, and challenge response. When those elements are handled together, the notice pack reads like a coherent case file rather than separate documents created on different days.',
      'This hub also solves a common SEO and user problem: overlapping pages that say the same thing. Each sub-page in this cluster has a distinct role and a distinct primary keyword. That means a landlord can begin with broad guidance, then move into deeper pages as needed, without reading repetitive text or conflicting recommendations. It also helps search engines understand intent boundaries, reducing cannibalisation and improving relevance.',
    ],
    legalRules: [
      'For England assured tenancies, the detailed process below is England-specific. Form 4A is the notice instrument from 1 May 2026 for section 13 rent proposals. The landlord must still satisfy notice-period and date-alignment requirements, and should preserve a clear service record. A valid process starts with accurate chronology, not with a guessed proposed date inserted into a form.',
      'The UK-wide search phrase "rent increase rules UK" is broad, but legal mechanics are jurisdiction-specific. Scotland, Wales, and Northern Ireland use different frameworks. This hub gives detailed operational guidance for England only and explicitly signposts that distinction to avoid false confidence. Trust is improved when the page is precise about scope rather than pretending to cover every jurisdiction in full procedural depth.',
    ],
    stepByStep: [
      'Use this sequence for most cases. First, confirm tenancy and increase-history facts. Second, calculate the earliest valid date. Third, gather local comparables and normalize rent frequency. Fourth, decide the proposed figure with a clear position statement. Fifth, complete Form 4A and prepare service. Sixth, retain proof of service and justification materials in one folder. This order gives you a stable narrative before tenant communication starts.',
      'In operational terms, this sequence reduces panic edits. Landlords who skip directly to form completion often need to revisit dates or numbers, then issue mixed explanations in emails and documents. A pre-validated process avoids that drift. The Section 13 wizard follows this same logic by showing preview metrics before final output generation so decisions are made with context rather than after-the-fact corrections.',
    ],
    commonMistakes: [
      'Landlords often mix up procedural confidence with evidential confidence. Procedural confidence means the form appears complete. Evidential confidence means the figure is supportable and the explanation is coherent. Another mistake is using stale comparables from too wide an area to justify an aggressive rent jump. These shortcuts are exactly what make a proposal look reverse-engineered when challenged.',
      'A second class of mistakes sits in record-keeping: missing service details, disconnected comparables, and inconsistent narrative between notice, report, and correspondence. These are avoidable quality defects. A premium pack should read as one authored file with one line of reasoning. The documents do not need legal theatre; they need consistency, specificity, and a traceable chain from evidence to figure.',
    ],
    tribunalRisks: [
      'If challenged, weak preparation usually appears quickly. The tenant side does not need to prove your pack is poor in abstract terms; it only needs to highlight inconsistencies, stale evidence, or unclear adjustments. The more your proposed figure sits above the middle of the range, the more carefully your evidence choices and assumptions will be examined. Tribunal risk is therefore partly a pricing decision and partly a documentation-quality decision.',
      'Risk also increases when landlords treat correspondence casually. Statements in emails can conflict with statements in the report, and that inconsistency reduces credibility. The safer pattern is to keep the explanation stable from preview through final output and through any follow-up communications. This is why the hub emphasizes a single source of truth for figures and positioning language.',
    ],
    avoidChallenges: [
      'Challenge avoidance starts with readability. A tenant is less likely to escalate if the proposal is clear, the timing is correct, and the market reasoning is specific. Clarity is persuasive. Vague claims such as "market conditions have changed" are weaker than concrete statements tied to comparable count, distance, recency, and adjusted range position.',
      'Use the pages below in the order that matches your question. Start with the section-13-notice page if you need the big picture, the Form 4A page if you are checking the form itself, the market-rent page if you are still deciding the figure, and the tribunal pages if challenge risk is active. Then generate the Standard pack once the core file is stable.',
    ],
  }),
  faqs: [
    {
      question: 'What is the best first page to read in this cluster?',
      answer:
        'If you are starting from scratch, begin with the Section 13 notice page, then move to Form 4A and market-rent calculation before finalising the figure.',
    },
    {
      question: 'Does this hub provide detailed process steps for all UK nations?',
      answer:
        'No. Detailed process guidance here is for England. Other UK nations use different legal frameworks and should be treated separately.',
    },
    {
      question: 'How many CTAs should a landlord expect on each page?',
      answer:
        'Each page includes a clear intro CTA, a mid-page CTA, and a final CTA to the Standard Section 13 wizard.',
    },
    {
      question: 'When is the Defensive pack mentioned?',
      answer:
        'Only in contextual tribunal or dispute sections. The primary CTA across this cluster remains the Standard wizard.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.section13,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.rules,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Generate a compliant Section 13 notice with built-in checks',
  midCtaBody:
    'Use the Standard wizard to validate timeline rules, set a defensible figure, and produce a coherent notice pack ready for service.',
  finalCtaTitle: 'Generate your Section 13 notice',
  finalCtaBody:
    'Move from guidance to action with one deterministic workflow that keeps your figures, dates, and explanation aligned.',
};

