import type { FAQItem } from '@/components/seo/FAQSection';
import type { GoldenPackKey } from '@/lib/marketing/golden-pack-proof';
import type { ProductSku } from '@/lib/pricing/products';

export type ProductSamplePageConfig = {
  packKey: GoldenPackKey;
  sku: ProductSku;
  slug: string;
  samplePath: string;
  productHref: string;
  productName: string;
  targetKeyword: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  intro: string;
  ctaText: string;
  faqs: FAQItem[];
};

function buildFaqs(productName: string, courtFormLabel: string): FAQItem[] {
  return [
    {
      question: `Is this ${productName} sample the full product?`,
      answer:
        'No. It is a sample generated from the same golden-pack manifest so you can inspect the document structure, wording, and page spread before buying. The paid product builds the pack around your facts instead of giving you a static form to adapt.',
    },
    {
      question: `Does the paid ${productName} include editable case details?`,
      answer:
        'Yes. The paid pack creates documents from your answers, runs the relevant procedural checks, then lets you preview and update the pack when the facts need changing.',
    },
    {
      question: `Does this sample include ${courtFormLabel}?`,
      answer:
        `The sample page lists every document currently included in the ${productName}, including page counts where the golden-pack manifest provides them.`,
    },
  ];
}

export const productSamplePages = [
  {
    packKey: 'notice_only',
    sku: 'notice_only',
    slug: 'section-8-notice-example',
    samplePath: '/samples/section-8-notice-example',
    productHref: '/products/notice-only',
    productName: 'Section 8 Notice Pack',
    targetKeyword: 'section 8 notice example pdf',
    metaTitle: 'Section 8 Notice Example PDF | Full Sample Pack',
    metaDescription:
      'See a section 8 notice example PDF from the landlord pack, including Form 3A, service record, N215, and arrears documents.',
    seoKeywords: [
      'section 8 notice example pdf',
      'form 3a example',
      'section 8 notice sample',
      'eviction notice example england',
      'landlord notice sample',
      'n215 certificate of service example',
      'rent arrears schedule sample',
      'section 8 pack sample',
      'notice only sample pack',
      'landlord eviction document sample',
    ],
    intro:
      'Use this Section 8 notice example PDF to check what the notice, service record, and arrears support look like before you start the paid pack.',
    ctaText: 'Need to serve notice? Create my Section 8 Notice Pack.',
    faqs: buildFaqs('Section 8 Notice Pack', 'Form 3A'),
  },
  {
    packKey: 'complete_pack',
    sku: 'complete_pack',
    slug: 'complete-eviction-pack-example',
    samplePath: '/samples/complete-eviction-pack-example',
    productHref: '/products/complete-pack',
    productName: 'Complete Eviction Pack',
    targetKeyword: 'complete eviction pack example',
    metaTitle: 'Complete Eviction Pack Example | Section 8 Court Sample',
    metaDescription:
      'See a complete eviction pack example with Section 8 notice, N5, N119, witness statement, evidence checklist, and hearing guidance.',
    seoKeywords: [
      'complete eviction pack example',
      'section 8 court pack sample',
      'n5 n119 example',
      'possession claim pack sample',
      'landlord court forms example',
      'eviction court bundle sample',
      'witness statement possession sample',
      'section 8 possession claim example',
      'court-ready eviction pack',
      'complete pack document sample',
    ],
    intro:
      'Use this complete eviction pack example to inspect the notice-stage and court-stage documents before choosing the full possession route.',
    ctaText: 'Case moving toward court? Prepare my Complete Eviction Pack.',
    faqs: buildFaqs('Complete Eviction Pack', 'N5 and N119'),
  },
  {
    packKey: 'money_claim',
    sku: 'money_claim',
    slug: 'money-claim-online-example',
    samplePath: '/samples/money-claim-online-example',
    productHref: '/products/money-claim',
    productName: 'Money Claim Pack',
    targetKeyword: 'money claim online example filled out',
    metaTitle: 'Money Claim Online Example Filled Out | Sample Pack',
    metaDescription:
      'See a money claim online example filled out for unpaid rent, with letter before claim, arrears schedule, and Particulars of Claim.',
    seoKeywords: [
      'money claim online example filled out',
      'mcol example landlord',
      'rent arrears claim example',
      'particulars of claim example rent arrears',
      'letter before claim sample',
      'landlord debt recovery example',
      'tenant debt claim sample',
      'unpaid rent court claim example',
      'money claim pack sample',
      'n1 claim form landlord example',
    ],
    intro:
      'Use this filled-out money claim example to see how arrears, pre-action letters, and claim particulars are organised before you buy.',
    ctaText: 'Tenant still owes money? Prepare my Money Claim Pack.',
    faqs: buildFaqs('Money Claim Pack', 'Particulars of Claim'),
  },
  {
    packKey: 'section13_standard',
    sku: 'section13_standard',
    slug: 'form-4a-example',
    samplePath: '/samples/form-4a-example',
    productHref: '/products/section-13-standard',
    productName: 'Supported Rent Increase Pack',
    targetKeyword: 'form 4a example filled out',
    metaTitle: 'Form 4A Example Filled Out | Section 13 Sample',
    metaDescription:
      'See a Form 4A example filled out with market evidence, service record, cover letter, and Section 13 rent increase guidance.',
    seoKeywords: [
      'form 4a example filled out',
      'section 13 notice example',
      'rent increase notice sample',
      'form 4a rent increase sample',
      'market rent evidence example',
      'landlord rent increase pack sample',
      'section 13 service record',
      'rent increase cover letter sample',
      'supported rent increase pack',
      'england rent increase notice example',
    ],
    intro:
      'Use this Form 4A example to check how a rent increase notice and supporting evidence are packaged before service.',
    ctaText: 'Need to increase rent? Create my Supported Rent Increase Pack.',
    faqs: buildFaqs('Supported Rent Increase Pack', 'Form 4A'),
  },
  {
    packKey: 'section13_defensive',
    sku: 'section13_defensive',
    slug: 'section-13-defence-pack-example',
    samplePath: '/samples/section-13-defence-pack-example',
    productHref: '/products/section-13-defence',
    productName: 'Tribunal-Ready Rent Increase Pack',
    targetKeyword: 'section 13 tribunal ready rent increase pack example',
    metaTitle: 'Tribunal-Ready Rent Increase Pack Example | Tribunal Sample',
    metaDescription:
      'See a Section 13 tribunal ready rent increase pack example with evidence templates, response letters, tribunal summary, and bundle checklist.',
    seoKeywords: [
      'section 13 tribunal ready rent increase pack example',
      'section 13 defence pack sample',
      'rent increase tribunal evidence sample',
      'tenant rent challenge response example',
      'form 4a defence pack',
      'tribunal rent increase bundle',
      'market rent evidence template',
      'rent challenge document sample',
      'landlord tribunal pack example',
      'section 13 challenge pack',
    ],
    intro:
      'Use this tribunal-ready rent increase pack example to see how challenge-ready evidence and tribunal documents are structured.',
    ctaText: 'Expect a challenge? Prepare my Tribunal-Ready Rent Increase Pack.',
    faqs: buildFaqs('Tribunal-Ready Rent Increase Pack', 'tribunal response material'),
  },
  {
    packKey: 'england_standard_tenancy_agreement',
    sku: 'england_standard_tenancy_agreement',
    slug: 'standard-tenancy-agreement-example',
    samplePath: '/samples/standard-tenancy-agreement-example',
    productHref: '/standard-tenancy-agreement',
    productName: 'Standard Tenancy Agreement',
    targetKeyword: 'example assured shorthold tenancy agreement uk',
    metaTitle: 'Example Assured Shorthold Tenancy Agreement UK | Sample',
    metaDescription:
      'See an example assured shorthold tenancy agreement UK landlords can compare before choosing the England pack.',
    seoKeywords: [
      'example assured shorthold tenancy agreement uk',
      'standard tenancy agreement example',
      'england tenancy agreement sample',
      'assured periodic tenancy agreement example',
      'landlord tenancy agreement sample',
      'renters rights act tenancy agreement example',
      'standard tenancy pack sample',
      'tenancy agreement preview',
      'whole property tenancy agreement example',
      'england landlord agreement sample',
    ],
    intro:
      'Use this standard tenancy agreement example to inspect the core agreement, setup checklist, and support records before building a validated England tenancy setup pack around your own property, occupiers, rent, deposit, and management facts.',
    ctaText: 'Setting up a straightforward let? Build my validated Standard tenancy pack.',
    faqs: buildFaqs('Standard Tenancy Agreement', 'prescribed information support'),
  },
  {
    packKey: 'england_premium_tenancy_agreement',
    sku: 'england_premium_tenancy_agreement',
    slug: 'premium-tenancy-agreement-example',
    samplePath: '/samples/premium-tenancy-agreement-example',
    productHref: '/premium-tenancy-agreement',
    productName: 'Premium Tenancy Agreement',
    targetKeyword: 'example premium tenancy agreement',
    metaTitle: 'Example Premium Tenancy Agreement | Full Sample',
    metaDescription:
      'See an example premium tenancy agreement with fuller management wording for access, repairs, reporting, keys, and hand-back.',
    seoKeywords: [
      'example premium tenancy agreement',
      'premium tenancy agreement sample',
      'stronger tenancy agreement wording',
      'property access clause example',
      'repair reporting tenancy clause',
      'key handover tenancy agreement',
      'landlord management terms sample',
      'premium tenancy pack example',
      'england tenancy agreement preview',
      'tenancy agreement with management clauses',
    ],
    intro:
      'Use this premium tenancy agreement example to see the fuller management wording, handover records, and support documents before creating a fact-built Premium pack with stronger control around access, repairs, keys, reporting, and hand-back.',
    ctaText: 'Need stronger management terms? Build my validated Premium tenancy pack.',
    faqs: buildFaqs('Premium Tenancy Agreement', 'premium management wording'),
  },
  {
    packKey: 'england_student_tenancy_agreement',
    sku: 'england_student_tenancy_agreement',
    slug: 'student-tenancy-agreement-example',
    samplePath: '/samples/student-tenancy-agreement-example',
    productHref: '/student-tenancy-agreement',
    productName: 'Student Tenancy Agreement',
    targetKeyword: 'student tenancy agreement example uk',
    metaTitle: 'Student Tenancy Agreement Example UK | Full Sample',
    metaDescription:
      'See a student tenancy agreement example UK landlords can review for guarantors, sharers, replacements, and end-of-term move-out.',
    seoKeywords: [
      'student tenancy agreement example uk',
      'student tenancy agreement sample',
      'student guarantor agreement example',
      'student sharer tenancy agreement',
      'replacement tenant clause sample',
      'student landlord agreement example',
      'student tenancy pack sample',
      'student move out clause',
      'joint student tenancy agreement example',
      'england student let agreement',
    ],
    intro:
      'Use this student tenancy agreement example to see how guarantors, sharers, replacement occupiers, and end-of-term move-out are handled before building a validated student pack around the actual household.',
    ctaText: 'Setting up a student let? Build my validated Student tenancy pack.',
    faqs: buildFaqs('Student Tenancy Agreement', 'guarantor and sharer wording'),
  },
  {
    packKey: 'england_hmo_shared_house_tenancy_agreement',
    sku: 'england_hmo_shared_house_tenancy_agreement',
    slug: 'hmo-tenancy-agreement-example',
    samplePath: '/samples/hmo-tenancy-agreement-example',
    productHref: '/hmo-shared-house-tenancy-agreement',
    productName: 'HMO / Shared House Tenancy Agreement',
    targetKeyword: 'example hmo tenancy agreement uk',
    metaTitle: 'Example HMO Tenancy Agreement UK | Shared House Sample',
    metaDescription:
      'See an example HMO tenancy agreement UK landlords can review for house rules, communal areas, sharer duties, and shared occupation.',
    seoKeywords: [
      'example hmo tenancy agreement uk',
      'hmo tenancy agreement sample',
      'shared house tenancy agreement example',
      'hmo house rules sample',
      'communal area clause tenancy',
      'sharer duties agreement',
      'hmo landlord agreement example',
      'shared occupation tenancy sample',
      'hmo tenancy pack sample',
      'england hmo agreement preview',
    ],
    intro:
      'Use this HMO tenancy agreement example to see how communal areas, house rules, shared facilities, and sharer expectations are documented before building a validated shared-house management pack around the property setup.',
    ctaText: 'Managing sharers? Build my validated HMO / Shared House pack.',
    faqs: buildFaqs('HMO / Shared House Tenancy Agreement', 'house rules and communal areas'),
  },
  {
    packKey: 'england_lodger_agreement',
    sku: 'england_lodger_agreement',
    slug: 'lodger-agreement-example',
    samplePath: '/samples/lodger-agreement-example',
    productHref: '/lodger-agreement',
    productName: 'Lodger Agreement',
    targetKeyword: 'lodger agreement example uk',
    metaTitle: 'Lodger Agreement Example UK | Resident Landlord Sample',
    metaDescription:
      'See a lodger agreement example UK resident landlords can review for shared-home rules, notice, occupation, and day-to-day boundaries.',
    seoKeywords: [
      'lodger agreement example uk',
      'lodger agreement sample',
      'resident landlord agreement example',
      'room let agreement sample',
      'shared home rules lodger',
      'lodger notice terms example',
      'lodger occupation agreement',
      'resident landlord room let',
      'lodger pack sample',
      'england lodger agreement preview',
    ],
    intro:
      'Use this lodger agreement example to see how resident-landlord room lets, shared-home rules, notice terms, and day-to-day boundaries are documented before building a validated shared-home pack around your facts.',
    ctaText: 'Taking in a lodger? Build my validated Lodger pack.',
    faqs: buildFaqs('Lodger Agreement', 'resident-landlord room let wording'),
  },
] as const satisfies ProductSamplePageConfig[];

export const productSamplePagePaths = productSamplePages.map((page) => page.samplePath);

export function getProductSamplePageBySlug(slug: string): ProductSamplePageConfig | undefined {
  return productSamplePages.find((page) => page.slug === slug);
}

export function getProductSamplePageByPackKey(
  packKey: GoldenPackKey
): ProductSamplePageConfig | undefined {
  return productSamplePages.find((page) => page.packKey === packKey);
}
