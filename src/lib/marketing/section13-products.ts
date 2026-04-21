import {
  ENGLAND_POST_MAY_2026_POSITION,
  LANDLORD_GUIDANCE_DISCLAIMER,
} from '@/lib/marketing/landlord-messaging';
import type { ProductSalesBreakdownItem, ProductSalesCard, ProductSalesStep } from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';

export type Section13ProductPageConfig = {
  slug: 'section-13-standard' | 'section-13-defence';
  title: string;
  description: string;
  keywords: string[];
  heroTitle: string;
  heroSubtitle: string;
  productSku: 'section13_standard' | 'section13_defensive';
  ctaLabel: string;
  heroBullets: string[];
  packIntro: string;
  packBreakdown: ProductSalesBreakdownItem[];
  whyYouNeedThis: {
    intro: string;
    cards: ProductSalesCard[];
  };
  howThisHelps: {
    intro: string;
    cards: ProductSalesCard[];
  };
  howItWorks: {
    intro: string;
    steps: ProductSalesStep[];
  };
  cta: {
    title: string;
    body: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
  faqs: Array<{ question: string; answer: string }>;
};

export const SECTION13_STANDARD_PAGE: Section13ProductPageConfig = {
  slug: 'section-13-standard',
  title: `Section 13 Rent Increase Pack for England Landlords | ${PRODUCTS.section13_standard.displayPrice}`,
  description:
    'Increase rent in England using Section 13 and Form 4A with market evidence, service records, and landlord-facing support in one pack.',
  keywords: [
    'section 13 notice rent increase',
    'section 13 notice england',
    'form 4a rent increase',
    'rent increase section 13',
    'increase rent section 13',
  ],
  heroTitle: 'Section 13 Rent Increase Pack for England landlords',
  heroSubtitle:
    'Increase the rent with evidence, timing checks, and supporting paperwork that still makes sense if the tenant asks why the figure has changed.',
  productSku: 'section13_standard',
  ctaLabel: `Start Section 13 Rent Increase Pack - ${PRODUCTS.section13_standard.displayPrice}`,
  heroBullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    'Built for landlords who want the notice, market evidence, and service record to read as one joined-up rent increase file.',
    LANDLORD_GUIDANCE_DISCLAIMER,
  ],
  packIntro:
    'This pack is built for landlords who need more than a blank Form 4A. Each part of the file exists to justify the increase, communicate it properly, and hold up better if the tenant questions the new figure.',
  packBreakdown: [
    {
      name: 'Form 4A (Legal Rent Increase Notice)',
      plainEnglish: 'The official statutory notice used to increase rent in England.',
      function: 'Sets the proposed rent and the date it is meant to take effect.',
      riskIfMissing:
        'If the notice is wrong or incomplete, the increase can be challenged, ignored, or delayed before the real issue is even discussed.',
      landlordOutcome:
        'Gives your rent increase a lawful starting point instead of leaving the change open to an easy procedural challenge.',
      includedByDefault: true,
    },
    {
      name: 'Rent Justification Report',
      plainEnglish: 'A landlord-facing report explaining why the new rent figure is reasonable.',
      function: 'Links the proposed increase to market evidence and your pricing rationale.',
      riskIfMissing:
        'If the increase is served without a clear explanation behind it, the tenant has more room to say the figure was chosen arbitrarily.',
      landlordOutcome:
        'Helps the file read like a reasoned increase instead of a number dropped on the tenant without support.',
      includedByDefault: true,
    },
    {
      name: 'Comparable Market Data',
      plainEnglish: 'The local rental listings and market references used to support the proposed figure.',
      function: 'Shows how the rent compares with similar properties in the same area.',
      riskIfMissing:
        'If the comparables are weak, outdated, or absent, a challenged increase is much easier to reduce.',
      landlordOutcome:
        'Gives you concrete evidence that the new figure still sits within a defensible local market range.',
      includedByDefault: true,
    },
    {
      name: 'Cover Letter',
      plainEnglish: 'A plain-English letter that explains the increase to the tenant.',
      function: 'Frames the notice as a documented, evidence-backed change rather than an abrupt demand.',
      riskIfMissing:
        'If the communication is poor, avoidable tenant pushback becomes more likely before they even look at the evidence.',
      landlordOutcome:
        'Improves the chance of the increase being understood and accepted without unnecessary conflict.',
      includedByDefault: true,
    },
    {
      name: 'Service Record / Certificate',
      plainEnglish: 'A record showing how and when the notice was served.',
      function: 'Creates written proof that the notice was sent by the correct method on the correct date.',
      riskIfMissing:
        'If service is challenged and you cannot show what was done, the process can stall even when the rent figure itself is reasonable.',
      landlordOutcome:
        'Protects the rent increase file against avoidable procedural arguments about service.',
      includedByDefault: true,
    },
  ],
  whyYouNeedThis: {
    intro:
      'Landlords do not lose time on rent increases only because the figure is too high. They lose time because the notice, the evidence, and the service record do not line up cleanly when the tenant pushes back.',
    cards: [
      {
        title: 'A form alone does not justify the figure',
        body:
          'Form 4A starts the process, but it does not explain why the rent should move to the number you want. The market evidence and service record are what stop the increase looking arbitrary.',
      },
      {
        title: 'Weak evidence gets challenged first',
        body:
          'If the tenant asks how you arrived at the new rent, you need more than instinct or a rough comparison with another listing you saw last week.',
      },
      {
        title: 'Service errors can derail a sound increase',
        body:
          'Even a reasonable increase becomes harder to rely on if you cannot show it was served properly or on the right date.',
      },
    ],
  },
  howThisHelps: {
    intro:
      'The pack is designed to make the increase easier to explain, easier to evidence, and easier to defend if the tenant starts asking for detail.',
    cards: [
      {
        title: 'It makes the file easier to trust',
        body:
          'The notice, report, comparables, and service record all point in the same direction, which makes the increase feel planned rather than improvised.',
      },
      {
        title: 'It improves tenant communication',
        body:
          'The cover letter and explanation report give you a calmer, clearer way to present the increase before the conversation turns into a dispute.',
      },
      {
        title: 'It gives you a stronger position if challenged',
        body:
          'If the tenant questions the rent, you already have the explanation and market evidence ready instead of trying to reconstruct it afterwards.',
      },
    ],
  },
  howItWorks: {
    intro:
      'The workflow keeps the notice and the supporting evidence together so the rent increase reads as one joined-up landlord file.',
    steps: [
      {
        step: 'Step 01',
        title: 'Add the tenancy and rent details',
        body:
          'Enter the current rent, the proposed figure, the property details, and the dates that matter before anything is generated.',
      },
      {
        step: 'Step 02',
        title: 'Build the evidence behind the increase',
        body:
          'Work through the comparable-rent reasoning and service details so the notice and the rest of the file read together cleanly.',
      },
      {
        step: 'Step 03',
        title: 'Generate the Section 13 pack',
        body:
          'Review the completed file, then serve the notice with the supporting explanation and service record kept together.',
      },
    ],
  },
  cta: {
    title: 'Increase the rent with a cleaner Section 13 file',
    body:
      'Start here if you want the notice, the evidence, and the service record prepared as one joined-up England landlord pack instead of piecing them together yourself.',
    secondaryLabel: 'See the Section 13 Defence Pack',
    secondaryHref: '/products/section-13-defence',
  },
  faqs: [
    {
      question: 'Is this pack only for England?',
      answer: 'Yes. This pack is built for England landlords using Section 13 and Form 4A.',
    },
    {
      question: 'What do I actually receive?',
      answer:
        'You receive the Form 4A notice, a justification report, the comparable market data file, a tenant-facing cover letter, and a service record for the notice.',
    },
    {
      question: 'Why is the evidence pack included?',
      answer:
        'Because the legal notice only starts the process. The evidence is what helps you explain the figure and defend it if the tenant questions the increase.',
    },
    {
      question: 'Does this replace legal advice?',
      answer:
        'No. It helps you prepare the paperwork and keep the file organised, but it is not legal representation.',
    },
    {
      question: 'When should I choose the Defence Pack instead?',
      answer:
        'Choose the Defence Pack when you expect a challenge or want the fuller tribunal-facing bundle, response materials, and preparation tools from the start.',
    },
  ],
};

export const SECTION13_DEFENCE_PAGE: Section13ProductPageConfig = {
  slug: 'section-13-defence',
  title: `Section 13 Defence Pack for England Landlords | ${PRODUCTS.section13_defensive.displayPrice}`,
  description:
    'Defend a Section 13 rent increase in England with a fuller tribunal-ready bundle, response templates, and market evidence built to stand up under challenge.',
  keywords: [
    'section 13 defence pack',
    'section 13 tribunal defence',
    'form 4a challenge england',
    'section 13 tribunal guide',
    'defend rent increase england',
  ],
  heroTitle: 'Section 13 Defence Pack for England landlords',
  heroSubtitle:
    'Defend the rent increase with a structured case file that still works when the tenant pushes back and the matter moves closer to tribunal.',
  productSku: 'section13_defensive',
  ctaLabel: `Start Section 13 Defence Pack - ${PRODUCTS.section13_defensive.displayPrice}`,
  heroBullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    'Built for landlords who need the Section 13 file to hold together under challenge, not just look fine on the day it is served.',
    LANDLORD_GUIDANCE_DISCLAIMER,
  ],
  packIntro:
    'This pack is for the harder Section 13 cases. It does not just help you serve the notice. It helps you organise the argument, the evidence, and the response material so the file still reads clearly when a challenge is active.',
  packBreakdown: [
    {
      name: 'Full Tribunal Bundle (Indexed Exhibits)',
      plainEnglish: 'An organised hearing file with the core documents and exhibits indexed in one bundle.',
      function: 'Puts the evidence into a judge-friendly order so the tribunal can follow the case without digging through loose documents.',
      riskIfMissing:
        'If the bundle is disorganised, even good evidence loses force because the file feels harder to trust and harder to follow.',
      landlordOutcome:
        'Helps you present the case as a professional, coherent landlord file rather than a stack of unrelated documents.',
      includedByDefault: true,
    },
    {
      name: 'Tribunal Argument Summary',
      plainEnglish: 'A concise written summary of why the proposed rent is reasonable.',
      function: 'Draws the comparables, adjustments, and landlord position into a single argument the tribunal can understand quickly.',
      riskIfMissing:
        'If the evidence is there but the argument is not, the tribunal has to do more of the work itself to understand your position.',
      landlordOutcome:
        'Makes your case clearer from the start and helps the evidence land with more force.',
      includedByDefault: true,
    },
    {
      name: 'Justification Report (Comparables Analysis)',
      plainEnglish: 'A fuller market-evidence report showing how the proposed rent compares locally.',
      function: 'Anchors the new rent to real comparable properties and explains the adjustments behind the figure.',
      riskIfMissing:
        'If the comparables are weak or unsupported, the rent is easier to reduce when the tenant challenges it.',
      landlordOutcome:
        'Gives your defence a factual backbone instead of relying on assertion alone.',
      includedByDefault: true,
    },
    {
      name: 'Defence Guide',
      plainEnglish: 'A practical guide to presenting the rent increase case if the dispute reaches tribunal.',
      function: 'Explains what to prepare, what to bring, and how to keep the hearing file in order.',
      riskIfMissing:
        'If you are unclear on how to present the case, good paperwork can still be undermined by a weak hearing approach.',
      landlordOutcome:
        'Gives you more structure and confidence when the case moves beyond service into challenge territory.',
      includedByDefault: true,
    },
    {
      name: 'Landlord Response Template',
      plainEnglish: 'A structured reply you can use when the tenant raises objections.',
      function: 'Keeps your response consistent with the notice and the evidence instead of turning into reactive back-and-forth.',
      riskIfMissing:
        'If objections are answered casually or inconsistently, the tenant gets more room to say the position is unclear or shifting.',
      landlordOutcome:
        'Helps you answer challenges in a calmer and more disciplined way.',
      includedByDefault: true,
    },
    {
      name: 'Legal Briefing',
      plainEnglish: 'A short briefing on the Section 13 framework and what the tribunal will actually look at.',
      function: 'Keeps your argument tied to the legal test instead of wandering into points that do not help the decision.',
      riskIfMissing:
        'If you misunderstand the legal focus of the hearing, strong evidence can still be presented in the wrong way.',
      landlordOutcome:
        'Keeps the defence aligned with the issues that actually matter in a Section 13 challenge.',
      includedByDefault: true,
    },
    {
      name: 'Evidence Checklist',
      plainEnglish: 'A checklist showing which exhibits, comparables, and file records should be in place before the matter goes further.',
      function: 'Stops key exhibits or file records from being left out of the tribunal bundle.',
      riskIfMissing:
        'If the file is incomplete, the strongest points can be weakened simply because an important exhibit was never included.',
      landlordOutcome:
        'Helps you present a more complete and reliable case file.',
      includedByDefault: true,
    },
    {
      name: 'Negotiation Email Template',
      plainEnglish: 'A template for structured tenant communication before the matter hardens into a hearing.',
      function: 'Lets you set out the position clearly while still leaving room for a practical resolution.',
      riskIfMissing:
        'If negotiation is poorly handled, the dispute can escalate faster than it needs to and the written record may not help you later.',
      landlordOutcome:
        'Improves the chance of resolving the issue early while keeping the paper trail useful if you cannot.',
      includedByDefault: true,
    },
  ],
  whyYouNeedThis: {
    intro:
      'When challenge risk is active, the question stops being whether you can serve the notice. The real question becomes whether the whole file still holds together when the tenant tests the figure.',
    cards: [
      {
        title: 'A challenged increase needs an argument, not just a form',
        body:
          'The tribunal will care about the quality of the reasoning and the evidence behind the figure, not just whether a notice was served.',
      },
      {
        title: 'Disorganised files weaken good cases',
        body:
          'If the evidence sits in different places and the explanations are inconsistent, the credibility of the case drops even before the substance is weighed.',
      },
      {
        title: 'Landlords often lose ground in the response stage',
        body:
          'The way objections are answered and the file is presented can change how strong the case feels long before the hearing itself.',
      },
    ],
  },
  howThisHelps: {
    intro:
      'The Defence Pack turns a served notice into a fuller landlord case file that is easier to explain, easier to present, and harder to pick apart.',
    cards: [
      {
        title: 'It keeps the evidence joined up',
        body:
          'The bundle, argument summary, and exhibits are built to read together instead of feeling like documents assembled in a rush.',
      },
      {
        title: 'It improves your response discipline',
        body:
          'The response template and briefing help you answer objections in a way that stays consistent with the evidence already in the file.',
      },
      {
        title: 'It gets you closer to tribunal-ready',
        body:
          'You are not starting from scratch if the increase is challenged because the structure, exhibits, and hearing preparation are already there.',
      },
    ],
  },
  howItWorks: {
    intro:
      'The workflow is built for the landlord who expects pushback and wants the whole file prepared before that pushback turns into a tribunal problem.',
    steps: [
      {
        step: 'Step 01',
        title: 'Build the notice and the market case together',
        body:
          'Start with the rent figure, the tenancy details, and the comparable evidence so the defence is grounded in the same facts as the notice.',
      },
      {
        step: 'Step 02',
        title: 'Prepare the challenge response file',
        body:
          'Generate the argument summary, response wording, bundle structure, and evidence checklist while the facts are still fresh and organised.',
      },
      {
        step: 'Step 03',
        title: 'Move into service and challenge readiness',
        body:
          'Review the file, serve the notice, and keep the tribunal-ready materials alongside it in case the tenant contests the increase.',
      },
    ],
  },
  cta: {
    title: 'Prepare the stronger Section 13 defence file now',
    body:
      'Start here if you expect the rent increase to be challenged and want the evidence, response material, and tribunal bundle prepared before the file starts drifting.',
    secondaryLabel: 'See the Standard Section 13 Pack',
    secondaryHref: '/products/section-13-standard',
  },
  faqs: [
    {
      question: 'Do I need this pack for every rent increase?',
      answer:
        'No. Many landlords only need the Standard pack. The Defence Pack is for cases where challenge risk is real or tribunal preparation is already in view.',
    },
    {
      question: 'Does this include the core Section 13 notice documents as well?',
      answer:
        'Yes. The Defence Pack builds on the standard notice file and adds the fuller challenge, response, and tribunal-facing materials.',
    },
    {
      question: 'Why is the tribunal bundle included?',
      answer:
        'Because the way the evidence is organised affects how credible the case feels. The indexed bundle helps the tribunal follow the file more easily.',
    },
    {
      question: 'Is this still England only?',
      answer:
        'Yes. The Defence Pack is built for England landlords using Section 13 when a challenge is likely.',
    },
    {
      question: 'Does this replace legal advice or representation?',
      answer:
        'No. It is a document-generation and preparation pack, not a solicitor service or tribunal representation.',
    },
  ],
};
