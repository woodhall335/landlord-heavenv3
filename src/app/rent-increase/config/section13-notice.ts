import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const section13NoticePage: RentIncreaseGuidePage = {
  slug: 'section-13-notice',
  path: `${RENT_INCREASE_HUB_PATH}/section-13-notice`,
  title: 'Section 13 Notice Guide',
  heroTitle: 'Section 13 Notice for Landlords in England',
  heroSubtitle:
    'Understand what the notice does, when it applies, and how to put forward a rent proposal that reads clearly from start to finish.',
  heroBullets: [
    'Explains what the Section 13 notice actually does for a landlord.',
    'Covers notice quality, not just form completion.',
    'Links to Form 4A, market-rent, and challenge pages for the next steps.',
  ],
  metaTitle: 'Section 13 Notice UK: Landlord Guide to Form 4A and Rent Increase Process',
  metaDescription:
    'Detailed Section 13 notice guide for landlords in England. Learn what the notice does, legal timing rules, common errors, and how to reduce challenge risk.',
  primaryKeyword: 'section 13 notice',
  intentLabel: 'notice explainer',
  introAngle:
    'Understand the role of the notice first, then make sure the evidence, dates, and service record support it properly.',
  heroImage: '/images/wizard-icons/06-notice-details.png',
  heroAlt: 'Section 13 notice explainer icon',
  secondaryCta: RENT_INCREASE_LINKS.form4a,
  quickAnswer: [
    'A Section 13 notice is the formal England route for proposing a new rent where that process applies. From 1 May 2026, the prescribed form is Form 4A. The notice tells the tenant what rent is being proposed and when it is meant to start, but the notice is not the whole case on its own.',
    'The stronger way to think about the notice is as the front page of your rent increase file. If the date, the figure, and the evidence behind it all line up, the notice feels clearer and easier to stand behind. If they do not, the problems show up quickly once the tenant starts asking questions.',
    'That is why this page focuses on the role of the notice itself. It helps you understand what the notice should communicate, what it cannot do on its own, and why the rest of the file still matters if you want the increase to read naturally and hold together under scrutiny.',
    'In practice, the best landlord workflow is to settle the chronology and evidence first, then complete the notice. That cuts out rushed edits and makes the whole file easier to explain later.',
    'It also helps you speak to the tenant more confidently. When the notice matches the support report and the service record, you are much less likely to end up rewriting the explanation halfway through the process because the paperwork no longer says the same thing.',
  ],
  sections: sections({
    whatIsIt: [
      'Section 13 is the formal notice mechanism for proposing a revised rent in England where that route applies. For a landlord, the practical point is simple: this is the notice that tells the tenant what you are proposing and when you want the new rent to begin.',
      'But the notice only works well when it reflects work you have already done. The best notice is not the start of the thinking. It is the clear summary of a file where the chronology has been checked, the figure has been thought through, and the service plan is already settled.',
      'That also makes the file easier for other people to read. If you, a colleague, or a later adviser needs to look at the case, the reasoning should be obvious from the notice pack itself rather than living only in someone\'s memory.',
    ],
    legalRules: [
      'The detailed process on this page is for England. At minimum, landlords need the timing to work, the date to line up properly, and the rent frequency to be stated clearly. One of the easiest ways to create avoidable problems is to decide the proposed start date first and only then try to make the chronology fit.',
      'A second legal quality point is clarity. A Section 13 notice is not the same thing as a tribunal submission, but it should still read clearly enough that you could rely on it later if the increase is challenged. Dates, property details, and proposal wording should all be unambiguous.',
    ],
    stepByStep: [
      'Start with the tenancy facts. Confirm the current rent, the tenancy dates, the recent increase history, and how you expect to serve the notice. Then calculate the earliest valid date and settle the proposed figure by looking at local comparables. Once those points are clear, complete Form 4A.',
      'After serving the notice, record service straight away and keep that record with the support report and comparables summary. If the tenant starts asking questions, answer from the same file. That helps you stay consistent instead of changing the explanation as you go.',
    ],
    commonMistakes: [
      'One recurring mistake is trusting the form more than the file behind it. Another is choosing comparables that are too distant, too old, or not genuinely similar, then using them to justify an ambitious figure. Those choices make the notice harder to defend than it needs to be.',
      'Service-record mistakes are common too. Landlords serve the notice, but do not log the method, the date, and the supporting details cleanly enough to prove what happened later. That creates avoidable uncertainty if the timing is questioned.',
    ],
    tribunalRisks: [
      'Tribunal risk rises when the notice looks detached from the local evidence or when the pack starts contradicting itself. Even where comparables exist, unclear adjustment reasoning or poor recency can weaken the file quickly.',
      'The best way to lower that risk is to keep the figure, the comparables, and the explanation sentence aligned. When those three elements agree, the notice reads clearly. When they do not, the tenant has a much easier point to attack.',
    ],
    avoidChallenges: [
      'To reduce the chance of a challenge, make the proposal legible and proportionate. Show where the figure sits in the local range, use recent comparables, and keep the explanation calm and specific. A tenant may still disagree, but a clear file removes a lot of confusion-driven escalation.',
      'Use this page with the linked Form 4A and market-rent pages, then move into the Standard pack once the figure and date are settled. Keep the notice, proof of service, and report together so the whole case can be read as one joined-up file.',
      'When the tenant asks questions, use the same clear explanation you used in the report. Repeating the same factual basis calmly is often the simplest way to keep the dispute from becoming more complicated than it needs to be.',
      'That consistency matters because a landlord file often stops feeling natural the moment the wording starts changing from document to document. A stable explanation is easier for you to rely on and easier for someone else to follow if the case needs to be reviewed later.',
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
    RENT_INCREASE_LINKS.standardProduct,
  ],
  midCtaTitle: 'Build a stronger Section 13 notice from the start',
  midCtaBody:
    'Use the Standard pack to build the notice, service record, and support report from one workflow so the file stays consistent.',
  finalCtaTitle: 'Generate your Section 13 notice now',
  finalCtaBody:
    'Use the Standard pack when you are ready to turn the timing, the figure, and the explanation into a clearer landlord file that still makes sense when someone reads it from the notice through to service and any follow-up questions.',
};
