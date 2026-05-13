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
  intro: string;
  ctaText: string;
  faqs: FAQItem[];
};

function buildFaqs(productName: string, courtFormLabel: string): FAQItem[] {
  return [
    {
      question: `Is this ${productName} sample the full product?`,
      answer:
        'No. It is a sample generated from the same golden-pack manifest so you can inspect the document structure, wording, and page spread before buying.',
    },
    {
      question: `Does the paid ${productName} include editable case details?`,
      answer:
        'Yes. The paid workflow creates documents from your answers, then lets you preview and regenerate the pack when the facts need updating.',
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
      'See a section 8 notice example PDF from the solicitor-approved pack, including Form 3A, service record, N215, and arrears documents.',
    intro:
      'Use this Section 8 notice example PDF to check what the notice, service record, and arrears support look like before you start the paid pack.',
    ctaText: 'Ready to start? Get the solicitor-approved Section 8 Notice Pack.',
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
    intro:
      'Use this complete eviction pack example to inspect the notice-stage and court-stage documents before choosing the full possession route.',
    ctaText: 'Ready to start? Get the solicitor-approved Complete Eviction Pack.',
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
    intro:
      'Use this filled-out money claim example to see how arrears, pre-action letters, and claim particulars are organised before you buy.',
    ctaText: 'Ready to start? Get the solicitor-approved Money Claim Pack.',
    faqs: buildFaqs('Money Claim Pack', 'Particulars of Claim'),
  },
  {
    packKey: 'section13_standard',
    sku: 'section13_standard',
    slug: 'form-4a-example',
    samplePath: '/samples/form-4a-example',
    productHref: '/products/section-13-standard',
    productName: 'Section 13 Standard Pack',
    targetKeyword: 'form 4a example filled out',
    metaTitle: 'Form 4A Example Filled Out | Section 13 Sample',
    metaDescription:
      'See a Form 4A example filled out with market evidence, service record, cover letter, and Section 13 rent increase guidance.',
    intro:
      'Use this Form 4A example to check how a rent increase notice and supporting evidence are packaged before service.',
    ctaText: 'Ready to start? Get the solicitor-approved Section 13 Standard Pack.',
    faqs: buildFaqs('Section 13 Standard Pack', 'Form 4A'),
  },
  {
    packKey: 'section13_defensive',
    sku: 'section13_defensive',
    slug: 'section-13-defence-pack-example',
    samplePath: '/samples/section-13-defence-pack-example',
    productHref: '/products/section-13-defence',
    productName: 'Section 13 Defence Pack',
    targetKeyword: 'section 13 defence pack example',
    metaTitle: 'Section 13 Defence Pack Example | Tribunal Sample',
    metaDescription:
      'See a Section 13 defence pack example with evidence templates, response letters, tribunal summary, and bundle checklist.',
    intro:
      'Use this Section 13 defence pack example to see how challenge-ready evidence and tribunal documents are structured.',
    ctaText: 'Ready to start? Get the solicitor-approved Section 13 Defence Pack.',
    faqs: buildFaqs('Section 13 Defence Pack', 'tribunal response material'),
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
      'See an example assured shorthold tenancy agreement UK landlords can compare before buying the solicitor-approved England pack.',
    intro:
      'Use this standard tenancy agreement example to inspect the core agreement and supporting documents for a straightforward England let.',
    ctaText: 'Ready to start? Get the solicitor-approved Standard Tenancy Agreement.',
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
    intro:
      'Use this premium tenancy agreement example to see the fuller management wording and supporting documents before choosing Premium.',
    ctaText: 'Ready to start? Get the solicitor-approved Premium Tenancy Agreement.',
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
    intro:
      'Use this student tenancy agreement example to see how student sharers, guarantors, replacement occupiers, and move-out terms are handled.',
    ctaText: 'Ready to start? Get the solicitor-approved Student Tenancy Agreement.',
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
    intro:
      'Use this HMO tenancy agreement example to see how communal areas, house rules, shared facilities, and sharer expectations are documented.',
    ctaText: 'Ready to start? Get the solicitor-approved HMO / Shared House Tenancy Agreement.',
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
    intro:
      'Use this lodger agreement example to see how resident-landlord room lets, shared-home rules, and notice terms are documented.',
    ctaText: 'Ready to start? Get the solicitor-approved Lodger Agreement.',
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
