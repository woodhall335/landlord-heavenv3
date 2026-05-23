import {
  ENGLAND_POST_MAY_2026_POSITION,
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
  title: `Supported Rent Increase Pack for England Landlords | ${PRODUCTS.section13_standard.displayPrice}`,
  description:
    'Prepare an England Section 13 rent increase with Form 4A, current local market comparables, a rent summary, cover letter, and service record in one pack.',
  keywords: [
    'Form 4A pack',
    'Section 13 notice template',
    'Section 13 rent increase pack',
    'current Form 4A',
    'checked Section 13 notice',
    'Form 4A England',
    'section 13 notice rent increase',
    'form 4a rent increase',
  ],
  heroTitle: 'Create a Form 4A rent increase pack with market evidence.',
  heroSubtitle:
    'Use this when you want to propose a supportable rent increase in England with Form 4A, the proposed figure, current local market listings, cover letter, and service record built around the same facts before you serve.',
  productSku: 'section13_standard',
  ctaLabel: `Build my supported rent increase - ${PRODUCTS.section13_standard.displayPrice}`,
  heroBullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    'Includes Form 4A, current comparable rental evidence, rent increase summary, cover letter, and service record.',
  ],
  packIntro:
    'This is for landlords who need a market-supported rent increase file, not just a blank Form 4A. It helps you compare the proposed rent against current advertised rents for similar homes nearby, explain the figure, and keep the service record clear.',
  packBreakdown: [
    {
      name: 'Form 4A (Legal Rent Increase Notice)',
      plainEnglish: 'The official notice used to propose a rent increase in England under Section 13.',
      function: 'Sets the proposed rent and the date it is meant to take effect.',
      riskIfMissing:
        'If the notice is wrong or incomplete, the increase can be challenged, ignored, or delayed.',
      landlordOutcome:
        'Gives the rent increase the correct notice starting point.',
      includedByDefault: true,
    },
    {
      name: 'Rent Increase Summary',
      plainEnglish: 'A plain-English summary explaining the current rent, proposed rent, timing, and market position.',
      function: 'Links the proposed increase to current market comparables and your reasons for the figure.',
      riskIfMissing:
        'If the increase is served without a clear explanation, the tenant has more room to say the figure was chosen without evidence.',
      landlordOutcome:
        'Helps the paperwork show a reasoned increase instead of an unsupported number.',
      includedByDefault: true,
    },
    {
      name: 'Current Comparable Rental Evidence',
      plainEnglish: 'Nearby advertised rental properties used to support the proposed figure.',
      function: 'Shows how the proposed rent compares with current advertised rents for similar homes nearby.',
      riskIfMissing:
        'If the comparables are weak, outdated, or absent, a challenged increase is much easier to reduce.',
      landlordOutcome:
        'Gives you a structured evidence file showing how the proposed rent sits within or near the local market range.',
      includedByDefault: true,
    },
    {
      name: 'Cover Letter',
      plainEnglish: 'A plain-English letter that explains the increase to the tenant.',
      function: 'Explains the notice as a documented, evidence-backed change rather than an unexplained demand.',
      riskIfMissing:
        'If the communication is poor, avoidable pushback becomes more likely.',
      landlordOutcome:
        'Gives the tenant a clearer explanation before the conversation becomes a dispute.',
      includedByDefault: true,
    },
    {
      name: 'Service Record',
      plainEnglish: 'A record showing how and when the notice was served.',
      function: 'Creates written proof that the notice was sent by the correct method on the correct date.',
      riskIfMissing:
        'If service is challenged and you cannot show what was done, the process can stall even when the rent figure itself is reasonable.',
      landlordOutcome:
        'Protects the rent increase from avoidable arguments about service.',
      includedByDefault: true,
    },
  ],
  whyYouNeedThis: {
    intro:
      'Rent increases often go wrong because the notice, evidence, and service record do not line up when the tenant pushes back. This keeps Form 4A, current market comparables, and service proof together before the notice is served.',
    cards: [
      {
        title: 'A bare Form 4A does not explain the figure',
        body:
          'Form 4A starts the process, but it does not explain why the rent should change. Current local market listings, a rent summary, and a service record make the increase easier to explain.',
      },
      {
        title: 'Comparable listings help before challenge',
        body:
          'If the tenant asks how you chose the new rent, you need more than instinct or one rough comparison. The pack turns nearby advertised rental evidence into a cleaner landlord file.',
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
      'The pack makes the increase easier to explain, easier to evidence, and more consistent if the tenant asks for detail.',
    cards: [
      {
        title: 'It helps you find a more supportable figure',
        body:
          'The workflow helps you judge where the proposed rent sits against current advertised rents for similar homes nearby.',
      },
      {
        title: 'It makes the paperwork easier to trust',
        body:
          'The notice, rent summary, comparables, cover letter, and service record all point in the same direction.',
      },
      {
        title: 'It improves tenant communication',
        body:
          'The cover letter and report give you a clearer way to explain the increase before it turns into a dispute.',
      },
      {
        title: 'It gives you a stronger position if challenged',
        body:
          'If the tenant questions the rent, you already have the explanation and market evidence ready.',
      },
    ],
  },
  howItWorks: {
    intro:
      'The workflow keeps the notice and evidence together so the rent increase reads clearly from start to finish.',
    steps: [
      {
        step: 'Step 01',
        title: 'Add the tenancy and rent details',
        body:
          'Enter the current rent, the proposed figure, the property details, and the dates that matter before anything is generated.',
      },
      {
        step: 'Step 02',
        title: 'Check current local comparables',
        body:
          'Review recent nearby rental listings, keep the comparables that best explain the proposed figure, and add the service details.',
      },
      {
        step: 'Step 03',
        title: 'Download the rent increase file',
        body:
          'Review the pack, then serve the notice with the explanation and service record kept together.',
      },
    ],
  },
  cta: {
    title: 'Build the supported rent increase file before you serve',
    body:
      'Choose this if you want Form 4A, current market comparables, a rent increase summary, cover letter, and the service record prepared together.',
    secondaryLabel: 'Prepare for a rent challenge',
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
        'You receive the Form 4A notice, rent increase summary, current comparable rental evidence, a tenant-facing cover letter, and a service record for the notice.',
    },
    {
      question: 'Why is the evidence pack included?',
      answer:
        'Because the notice only starts the process. The evidence helps you explain the figure, show the local market position, and respond if the tenant questions the increase.',
    },
    {
      question: 'Does this use real rental listings?',
      answer:
        'Yes. The workflow uses recent nearby rental listings from major UK property platforms to help support and explain the proposed figure without implying an official valuation.',
    },
    {
      question: 'Does this replace legal advice?',
      answer:
        'No. It helps you prepare the paperwork and keep everything organised, but it is not legal representation.',
    },
    {
      question: 'When should I choose the Tribunal-Ready Rent Increase Pack instead?',
      answer:
        'Choose the Tribunal-Ready Rent Increase Pack when you expect a challenge or want the fuller tribunal-facing bundle, response materials, legal briefing, and preparation tools from the start.',
    },
    {
      question: 'Is this a court approved Section 13 notice?',
      answer:
        'No. Courts and tribunals do not pre-approve any notice, claim form, or agreement. This Form 4A pack follows current England rules and includes checks to help you serve correctly.',
    },
    {
      question: 'Is this legally binding?',
      answer:
        'Yes - when completed and served correctly. This template follows post-May 2026 England rules, and the checklist helps you avoid common Section 13 notice mistakes.',
    },
  ],
};

export const SECTION13_DEFENCE_PAGE: Section13ProductPageConfig = {
  slug: 'section-13-defence',
  title: `Tribunal-Ready Rent Increase Pack for England Landlords | ${PRODUCTS.section13_defensive.displayPrice}`,
  description:
    'Prepare a challenged Section 13 rent increase in England with Form 4A, current market comparables, response templates, legal briefing, and indexed tribunal bundle support.',
  keywords: [
    'section 13 defence pack',
    'Section 13 tribunal bundle',
    'challenge Section 13 notice pack',
    'Section 13 response letter template',
    'tribunal evidence pack',
    'tribunal evidence checklist',
    "Renters' Rights Act tribunal pack",
    'section 13 tribunal defence',
  ],
  heroTitle: 'Prepare for a Section 13 rent challenge before it lands.',
  heroSubtitle:
    'Use this when the tenant is likely to question or challenge the rent increase. It includes everything in the Supported Rent Increase Pack plus an indexed tribunal bundle, argument summary, response template, legal briefing, and condition comparison support.',
  productSku: 'section13_defensive',
  ctaLabel: `Build my tribunal-ready file - ${PRODUCTS.section13_defensive.displayPrice}`,
  heroBullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    'Adds an indexed tribunal bundle, defence guide, argument summary, response template, legal briefing, and challenge response materials.',
  ],
  packIntro:
    'This is for rent increases where you expect questions, negotiation, or a formal challenge. It helps you support the rent figure with current comparable rental evidence and organise the response materials into a hearing-ready structure.',
  packBreakdown: [
    {
      name: 'Indexed Tribunal Bundle',
      plainEnglish: 'An organised hearing bundle with the core documents and exhibits indexed in one place.',
      function: 'Puts the evidence in an order the tribunal can follow without digging through loose documents.',
      riskIfMissing:
        'If the bundle is disorganised, good evidence is harder to trust and follow.',
      landlordOutcome:
        'Helps you present the case as a coherent bundle rather than a stack of unrelated documents.',
      includedByDefault: true,
    },
    {
      name: 'Tribunal Argument Summary',
      plainEnglish: 'A short written summary of why the proposed rent is reasonable.',
      function: 'Pulls the comparables, adjustments, and landlord position into one argument.',
      riskIfMissing:
        'If the evidence is there but the argument is unclear, the tribunal has to work harder to understand your position.',
      landlordOutcome:
        'Makes your case clearer from the start and helps the evidence land with more force.',
      includedByDefault: true,
    },
    {
      name: 'Market Evidence Report',
      plainEnglish: 'A fuller report showing how the proposed rent compares with current advertised rents for similar homes nearby.',
      function: 'Anchors the new rent to current comparable rental evidence and explains the adjustments behind the figure.',
      riskIfMissing:
        'If the comparables are weak or unsupported, the rent is easier to reduce when the tenant challenges it.',
      landlordOutcome:
        'Gives your tribunal-ready file a factual backbone instead of relying on assertion.',
      includedByDefault: true,
    },
    {
      name: 'Tribunal Defence Guide',
      plainEnglish: 'A practical guide to presenting the rent increase case if the dispute reaches tribunal.',
      function: 'Explains what to prepare, what to bring, and how to keep the bundle in order.',
      riskIfMissing:
        'If you are unclear on how to present the case, good paperwork can still be undermined by a weak hearing approach.',
      landlordOutcome:
        'Gives you more structure when the case moves beyond service into challenge territory.',
      includedByDefault: true,
    },
    {
      name: 'Landlord Response Template',
      plainEnglish: 'A structured reply you can use when the tenant raises objections.',
      function: 'Keeps your response consistent with the notice and evidence.',
      riskIfMissing:
        'If objections are answered casually or inconsistently, the tenant has more room to say your position is unclear or changing.',
      landlordOutcome:
        'Helps you answer challenges in a calmer and more consistent way.',
      includedByDefault: true,
    },
    {
      name: 'Legal Briefing',
      plainEnglish: 'A short briefing on the Section 13 legal test and what the tribunal looks at.',
      function: 'Keeps your argument tied to the legal test instead of wandering into points that do not help the decision.',
      riskIfMissing:
        'If you misunderstand the legal focus, strong evidence can still be presented in the wrong way.',
      landlordOutcome:
        'Keeps the defence aligned with the issues that actually matter in a Section 13 challenge.',
      includedByDefault: true,
    },
    {
      name: 'Property Condition Comparison Sheet',
      plainEnglish: 'A structured way to record property condition points that may affect comparison with nearby advertised homes.',
      function: 'Keeps condition adjustments visible when comparing the proposed rent with similar properties.',
      riskIfMissing:
        'If condition differences are not recorded, comparables can be harder to explain when challenged.',
      landlordOutcome:
        'Helps you show how condition, location, and features affect the market comparison.',
      includedByDefault: true,
    },
    {
      name: 'Tenant Argument Response Guide',
      plainEnglish: 'A guide to the objections tenants commonly raise and how to answer them consistently.',
      function: 'Helps your response stay tied to Form 4A, the market evidence, and the proposed figure.',
      riskIfMissing:
        'If objections are answered casually or inconsistently, the tenant has more room to say your position is unclear or changing.',
      landlordOutcome:
        'Helps you answer challenge points in a calmer and more consistent way.',
      includedByDefault: true,
    },
  ],
  whyYouNeedThis: {
    intro:
      'When a tenant is likely to challenge the increase, serving Form 4A is only part of the job. You also need current comparable rental evidence, an argument summary, response wording, and a bundle structure that is easy to follow.',
    cards: [
      {
        title: 'A challenged increase needs a market file',
        body:
          'The tribunal may look at the rent figure and the evidence behind it, not just whether the notice was served. Current local advertised rents matter.',
      },
      {
        title: 'Scattered paperwork weakens a good position',
        body:
          'If the comparables, explanation, and replies do not line up, it becomes harder for your position to look reliable.',
      },
      {
        title: 'The response stage matters',
        body:
          'How you answer objections can affect the tone of the dispute before it reaches a hearing, especially if your replies drift away from the evidence.',
      },
    ],
  },
  howThisHelps: {
    intro:
      'The Tribunal-Ready Rent Increase Pack helps you put the rent figure, current market comparables, replies, legal briefing, and Section 13 tribunal bundle in one clear route.',
    cards: [
      {
        title: 'It helps you explain the rent figure',
        body:
          'The comparables report shows how the proposed rent was chosen against nearby advertised rental properties, so you are not relying on a bare assertion.',
      },
      {
        title: 'It keeps the evidence together',
        body:
          'The bundle, argument summary, and exhibits are prepared to read as one set of materials.',
      },
      {
        title: 'It keeps your replies consistent',
        body:
          'The response template and briefing help you answer objections without contradicting the notice or the market evidence.',
      },
      {
        title: 'It helps you prepare for tribunal risk',
        body:
          'If the tenant challenges the increase, you already have the structure, exhibits, briefing, response notes, and preparation guide in place.',
      },
    ],
  },
  howItWorks: {
    intro:
      'The workflow is for landlords who expect pushback and want the stronger materials prepared before the dispute becomes harder to manage.',
    steps: [
      {
        step: 'Step 01',
        title: 'Build the notice and the market case together',
        body:
          'Add the rent figure, tenancy details, dates, and comparable evidence so the notice and the defence materials use the same facts.',
      },
      {
        step: 'Step 02',
        title: 'Prepare the response materials',
        body:
          'Prepare the argument summary, response wording, bundle structure, and evidence checklist while the details are still fresh and organised.',
      },
      {
        step: 'Step 03',
        title: 'Serve with the challenge materials ready',
        body:
          'Review the pack, serve the notice, and keep the stronger materials ready if the tenant questions or contests the increase.',
      },
    ],
  },
  cta: {
    title: 'Prepare the tribunal-ready file before the challenge lands',
    body:
      'Choose this if you expect the increase to be questioned and want the current market evidence, response wording, legal briefing, and indexed tribunal bundle prepared early.',
    secondaryLabel: 'Create a supported rent increase file',
    secondaryHref: '/products/section-13-standard',
  },
  faqs: [
    {
      question: 'Do I need this pack for every rent increase?',
      answer:
        'No. Many landlords only need the Supported Rent Increase Pack. Use this route when challenge risk is real, the tenant is likely to question the figure, or tribunal preparation is already in view.',
    },
    {
      question: 'Does this include the core Section 13 notice documents as well?',
      answer:
        'Yes. It includes the core Section 13 notice documents and adds the response, evidence, argument, and tribunal-facing materials around them.',
    },
    {
      question: 'Why is the tribunal bundle included?',
      answer:
        'Because the way your evidence is organised affects how easy your case is to follow. The indexed bundle keeps the notice, comparables, exhibits, and supporting papers in a clearer order.',
    },
    {
      question: 'Does this use real comparable listings too?',
      answer:
        'Yes. It uses recent nearby rental listings to help support the proposed figure, then adds the argument, response, briefing, and tribunal materials you need when the increase is more likely to be tested.',
    },
    {
      question: 'Is this still England only?',
      answer:
        'Yes. This pack is for England landlords using Section 13 and Form 4A.',
    },
    {
      question: 'Does this replace legal advice or representation?',
      answer:
        'No. It helps you prepare documents and organise the case materials, but it is not legal advice, a solicitor service, or tribunal representation.',
    },
    {
      question: 'Is this a court approved Tribunal-Ready Rent Increase Pack?',
      answer:
        'No. Courts and tribunals do not pre-approve any notice, claim form, pack, or agreement. This tribunal pack follows current England rules and includes checks to help you prepare correctly.',
    },
    {
      question: 'Is this legally binding?',
      answer:
        'Yes - when completed and used correctly. This pack follows post-May 2026 England rules, and the checklist helps you avoid common tribunal bundle mistakes.',
    },
  ],
};
