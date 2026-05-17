import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const rentIncreaseHubPage: RentIncreaseGuidePage = {
  slug: 'hub',
  path: RENT_INCREASE_HUB_PATH,
  title: 'Increase Rent in England',
  heroTitle: 'Increase Rent in England Using Section 13 / Form 4A',
  heroSubtitle:
    'Use this workflow to check the rent increase dates, review the evidence, and prepare the Section 13 / Form 4A paperwork before you serve it.',
  heroBullets: [
    'Built for the current England route from 1 May 2026.',
    'Covers timing, Form 4A, market-rent evidence, and challenge risk.',
    'Helps you move from guidance to a service-ready Section 13 pack.',
  ],
  metaTitle: 'Rent Increase Guide 2026: Check If Your Rent Is Supportable',
  metaDescription:
    'England landlord rent increase guide. Check whether the rent is supportable, then choose the right Section 13 and Form 4A pack before serving notice.',
  primaryKeyword: 'increase rent england',
  intentLabel: 'rent increase / section 13 landlord pack',
  introAngle:
    'Check the England route before serving a rent increase notice, especially the date, figure, evidence, and challenge risk.',
  heroImage: '/images/wizard-icons/41-rent.png',
  heroAlt: 'Rent increase process overview illustration',
  secondaryCta: RENT_INCREASE_LINKS.section13,
  quickAnswer: [
    'This page helps landlords increase rent in the right order. Check the tenancy facts, work out the earliest valid date, review local comparables, decide the figure, complete Form 4A, serve it properly, and keep the file together if the tenant challenges the increase.',
    'Each linked page answers a different question. One explains Section 13. One focuses on Form 4A. One helps with market rent. The challenge and tribunal pages cover what happens if the tenant pushes back.',
    'The main point is simple: do not serve the notice until the date, figure, and explanation make sense. A neat form with weak reasoning is fragile. A clear date, sensible figure, and connected evidence file are easier to stand behind.',
    'The guide separates "how do I increase the rent?" from "how do I defend the increase?" They are related, but they are not the same job. Start with the standard route, then move into the challenge route only if the case needs it.',
  ],
  sections: sections({
    whatIsIt: [
      'This guide explains the England Section 13 route in practical terms. It helps you understand the route, then move to the exact page that answers your next question.',
      'Most landlords need to know whether the date works, whether the figure makes sense, what Form 4A does, and what to do if the tenant says no. When those points are handled together, the final file is easier to rely on.',
    ],
    legalRules: [
      'The detailed process on this page is for England. From 1 May 2026, the prescribed notice form for the Section 13 route is Form 4A. The form is not the whole job. The timing, dates, and service record still need to be clear.',
      'Searches like "rent increase rules UK" are broad, but the legal process is not. Scotland, Wales, and Northern Ireland use different frameworks, so this page stays focused on England.',
    ],
    stepByStep: [
      'For most landlords, the best order is simple. Confirm the tenancy facts and recent rent history. Calculate the earliest valid date. Check local comparables. Choose a figure you can explain. Then complete Form 4A and prepare service.',
      'That order matters because it avoids rushed edits after the form has already been filled in. If the date and figure are settled first, the notice, report, and service record read like one file.',
    ],
    commonMistakes: [
      'A common mistake is thinking the file is strong because the form looks complete. The better question is whether the figure is supportable and whether the explanation still makes sense across the notice, report, and follow-up emails.',
      'Another mistake is poor record-keeping. Missing service details, weak comparables, and inconsistent wording make the file harder to defend. The documents do not need drama. They need to tell one clear story.',
    ],
    tribunalRisks: [
      'If the tenant challenges the increase, weak preparation shows quickly. Inconsistent dates, weak comparables, stale evidence, or a figure detached from the local market can all cause problems.',
      'Risk also increases when landlords change the explanation as the conversation goes on. If the report says one thing and emails say another, the file is harder to defend. Settle the explanation early and keep it consistent.',
    ],
    avoidChallenges: [
      'Challenge avoidance usually starts with readability. A tenant may still disagree, but a clear file gives them less room to argue that the proposal is confused or inconsistent.',
      'Use the pages below in the order that matches your question. Start with Section 13 if you need the big picture, Form 4A if you are checking the form, market rent if you are deciding the figure, and challenge or tribunal pages if risk has increased.',
      'A landlord usually gets the best result when the paperwork reads as though the route was thought through from start to finish. This page helps turn a stressful decision into a clearer file before the tenant reads the notice.',
    ],
  }),
  faqs: [
    {
      question: 'What is the best first page to read before increasing rent?',
      answer:
        'If you are starting from scratch, begin with the Section 13 notice page, then read Form 4A and market-rent calculation before finalising the figure.',
    },
    {
      question: 'Does this page provide detailed process steps for all UK nations?',
      answer:
        'No. Detailed process guidance here is for England. Other UK nations use different legal frameworks and should be treated separately.',
    },
    {
      question: 'How many CTAs should a landlord expect on each page?',
      answer:
        'Each page gives clear ways to move from guidance into the Standard Section 13 wizard.',
    },
    {
      question: 'When is the Defensive pack mentioned?',
      answer:
        'When challenge or tribunal risk becomes part of the picture. The Standard pack is the main starting point; the Defence Pack is for stronger preparation when the file is likely to be tested.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.section13,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.rules,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.wizard,
    RENT_INCREASE_LINKS.standardProduct,
  ],
  samplePackKey: 'section13_standard',
  midCtaTitle: 'Generate a compliant Section 13 notice with built-in checks',
  midCtaBody:
    'Use the Standard pack when you are ready to turn the date, figure, and explanation into a clearer landlord file.',
  finalCtaTitle: 'Create my rent increase notice',
  finalCtaBody:
    'Move from reading to action with one workflow that keeps your figures, dates, and explanation aligned before you serve.',
};
