import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const rentIncreaseHubPage: RentIncreaseGuidePage = {
  slug: 'hub',
  path: RENT_INCREASE_HUB_PATH,
  title: 'Increase Rent in England',
  heroTitle: 'Increase Rent in England Using Section 13 / Form 4A',
  heroSubtitle:
    'Use this landlord workflow to increase rent lawfully in England, check the dates, and generate the Section 13 / Form 4A paperwork before you serve anything.',
  heroBullets: [
    'Built for the current England route from 1 May 2026.',
    'Covers timing, Form 4A, market-rent evidence, and challenge risk.',
    'Lets landlords move from guidance to a service-ready Section 13 pack.',
  ],
  metaTitle: 'Increase Rent in England | Section 13 / Form 4A Pack for Landlords',
  metaDescription:
    'Increase rent lawfully in England using Section 13 and Form 4A. Check notice timing, market-rent evidence, challenge risk, and practical next steps before you serve.',
  primaryKeyword: 'increase rent england',
  intentLabel: 'rent increase / section 13 landlord pack',
  introAngle:
    'Check the England route properly first so you do not serve a rent increase notice before you are comfortable with the date, the figure, and the challenge risk.',
  heroImage: '/images/wizard-icons/41-rent.png',
  heroAlt: 'Rent increase process overview illustration',
  secondaryCta: RENT_INCREASE_LINKS.section13,
  quickAnswer: [
    'This page helps landlords increase rent in the right order. Instead of treating a rent increase like a one-form task, it shows the England workflow from start to finish: check the tenancy facts, work out the earliest valid date, review the local comparables, decide the figure, complete Form 4A, serve it properly, and keep the file together if the tenant challenges the increase.',
    'Each linked page answers a different landlord question. One explains what a Section 13 notice is. One focuses on Form 4A. One helps you think about market rent. The challenge and tribunal pages pick up the next stage if the tenant pushes back, which keeps the content aligned to what landlords are actually searching for at each step.',
    'If you remember one thing from this page, make it this: do not serve the notice until the story behind it is clear. A neat form with weak reasoning is fragile. A clear date, a sensible figure, and a joined-up evidence file are much easier to stand behind later.',
    'That is why the guide separates "how do I increase the rent?" from "how do I defend the increase?" Those are related questions, but they are not the same job. Landlords usually make better decisions when they read the standard route first and move into the challenge route only when the case really needs it.',
  ],
  sections: sections({
    whatIsIt: [
      'This guide is a practical landlord reference for the England Section 13 route. It is not written like a law-school summary and it is not trying to turn one answer into ten pages of repeated text. The aim is to help you understand the route in plain English, then move to the exact page that answers the next question you actually have.',
      'That matters because most landlords do not need abstract commentary. They need to know whether the date works, whether the figure makes sense, what Form 4A actually does, and what to do if the tenant says no. When those points are handled together, the final file reads more naturally and is easier to rely on.',
    ],
    legalRules: [
      'The detailed process on this page is for England. From 1 May 2026, the prescribed notice form for the Section 13 route is Form 4A. That does not mean the form is the whole job. You still need the timing to work, the dates to line up, and the service record to be clear enough that you can explain it later.',
      'Search phrases like "rent increase rules UK" are broad, but the legal mechanics are not. Scotland, Wales, and Northern Ireland each use different frameworks. This page stays clear about that so you do not leave with false confidence from reading the wrong process page.',
    ],
    stepByStep: [
      'For most landlords, the safest order is simple. First confirm the tenancy facts and the recent rent history. Then calculate the earliest valid date. After that, look at local comparables and work out what figure you can explain with a straight face. Only then should you complete Form 4A and prepare service.',
      'That order matters because it cuts out the panic edits that happen when the form gets filled in too early. If you decide the date and the figure first, the finished notice, report, and service record read like one deliberate file instead of a form that had to be corrected afterwards.',
    ],
    commonMistakes: [
      'A common landlord mistake is thinking the file is strong because the form looks complete. That is procedural confidence, not evidential confidence. The better question is whether the figure is supportable and whether the explanation still makes sense when someone reads the notice, the report, and your follow-up emails together.',
      'Another mistake is poor record-keeping. Missing service details, weak comparables, and inconsistent wording between the notice and the report make the file harder to defend than it needs to be. The documents do not need legal theatre. They just need to tell one clear story from start to finish.',
    ],
    tribunalRisks: [
      'If the tenant challenges the increase, weak preparation shows up quickly. It is often enough for the challenge to highlight inconsistent dates, weak comparables, stale evidence, or a figure that feels detached from the local market. The higher and more ambitious the proposed increase looks, the more carefully the file is likely to be read.',
      'Risk also increases when landlords start changing the explanation as the conversation goes on. If the report says one thing and your emails say another, the file becomes harder to defend. The safer pattern is to settle the explanation early and repeat it consistently.',
    ],
    avoidChallenges: [
      'Challenge avoidance usually starts with readability. A tenant may still disagree with the increase, but a clear file gives them less room to argue that the proposal is confused, inconsistent, or impossible to follow. Specific reasons tied to local comparables are much stronger than generic statements about costs or market conditions.',
      'Use the pages below in the order that matches your question. Start with the Section 13 notice page if you need the big picture, the Form 4A page if you are checking the form, the market-rent page if you are still deciding the figure, and the challenge or tribunal pages if the risk has already moved up a level. Then choose the Standard or Defence pack once the file is clear.',
      'A landlord usually gets the best result when the paperwork reads as though one person thought the route through from start to finish. That is the real purpose of this rent increase page: helping you turn a stressful decision into a calmer, more readable file before the tenant ever reads the notice.',
    ],
  }),
  faqs: [
    {
      question: 'What is the best first page to read before increasing rent?',
      answer:
        'If you are starting from scratch, begin with the Section 13 notice page, then move to Form 4A and market-rent calculation before finalising the figure.',
    },
    {
      question: 'Does this page provide detailed process steps for all UK nations?',
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
        'When challenge or tribunal risk becomes part of the picture. The Standard pack is the main starting point, while the Defence Pack is there for stronger landlord preparation when the file is likely to be tested.',
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
    'Use the Standard pack when you are ready to turn the dates, the figure, and the explanation into a cleaner landlord file.',
  finalCtaTitle: 'Generate your Section 13 notice',
  finalCtaBody:
    'Move from reading to action with one workflow that keeps your figures, dates, and explanation aligned before you serve, so the whole rent increase file feels deliberate and easier to defend.',
};
