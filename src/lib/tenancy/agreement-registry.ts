import { PRODUCTS } from '@/lib/pricing/products';
import { isNonEnglandStandardTenancyPubliclyEnabled } from './non-england-rollout';

export type TenancyAgreementReleaseStatus =
  | 'available'
  | 'legal-review-required'
  | 'not-supported';

export interface TenancyAgreementRegistryEntry {
  publicName: string;
  slug: string;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  agreementType: string;
  wizardSchema: string;
  sourceVersion: string;
  price: number;
  standardAvailable: boolean;
  premiumAvailable: boolean;
  startRoute: string;
  detailsRoute: string;
  previewSupport: boolean;
  supportingDocuments: string[];
  seo: { title: string; description: string };
  sitemapEligible: boolean;
  indexable: boolean;
  releaseStatus: TenancyAgreementReleaseStatus;
}

function nonEnglandReleaseStatus(
  jurisdiction: 'wales' | 'scotland' | 'northern-ireland'
): TenancyAgreementReleaseStatus {
  return isNonEnglandStandardTenancyPubliclyEnabled(jurisdiction)
    ? 'available'
    : 'legal-review-required';
}

export const TENANCY_AGREEMENT_REGISTRY: readonly TenancyAgreementRegistryEntry[] = [
  {
    publicName: 'England Standard Assured Periodic Tenancy Agreement',
    slug: 'england-standard-assured-periodic-tenancy',
    jurisdiction: 'england',
    agreementType: 'assured_periodic_tenancy',
    wizardSchema: 'tenancy_agreement/england',
    sourceVersion: 'england-post-1-may-2026',
    price: PRODUCTS.england_standard_tenancy_agreement.price,
    standardAvailable: true,
    premiumAvailable: false,
    startRoute:
      '/wizard/flow?type=tenancy_agreement&product=england_standard_tenancy_agreement&jurisdiction=england',
    detailsRoute: '/products/ast',
    previewSupport: true,
    supportingDocuments: [
      'inventory_schedule',
      'pre_tenancy_checklist_england',
      'deposit_protection_certificate',
      'tenancy_deposit_information',
    ],
    seo: {
      title: 'Tenancy Agreement England',
      description:
        'Create an England tenancy agreement generated from your validated wizard answers.',
    },
    sitemapEligible: true,
    indexable: true,
    releaseStatus: 'available',
  },
  {
    publicName: 'Wales Fixed-Term Standard Occupation Contract',
    slug: 'wales-fixed-term-standard-occupation-contract',
    jurisdiction: 'wales',
    agreementType: 'fixed_term_standard_occupation_contract',
    wizardSchema: 'tenancy_agreement/wales',
    sourceVersion: 'welsh-government-model-may-2026',
    price: PRODUCTS.ast_standard.price,
    standardAvailable: true,
    premiumAvailable: false,
    startRoute: '/wizard?product=ast_standard&jurisdiction=wales&contract_type=fixed',
    detailsRoute: '/wales-tenancy-agreement-template',
    previewSupport: true,
    supportingDocuments: [
      'inventory_schedule',
      'pre_tenancy_checklist_wales',
      'deposit_status',
    ],
    seo: {
      title: 'Wales Fixed-Term Standard Occupation Contract',
      description:
        'Understand and prepare a fixed-term standard occupation contract for Wales.',
    },
    sitemapEligible: true,
    indexable: true,
    releaseStatus: nonEnglandReleaseStatus('wales'),
  },
  {
    publicName: 'Wales Periodic Standard Occupation Contract',
    slug: 'wales-periodic-standard-occupation-contract',
    jurisdiction: 'wales',
    agreementType: 'periodic_standard_occupation_contract',
    wizardSchema: 'tenancy_agreement/wales',
    sourceVersion: 'welsh-government-model-may-2026',
    price: PRODUCTS.ast_standard.price,
    standardAvailable: true,
    premiumAvailable: false,
    startRoute: '/wizard?product=ast_standard&jurisdiction=wales&contract_type=periodic',
    detailsRoute: '/wales-tenancy-agreement-template',
    previewSupport: true,
    supportingDocuments: [
      'inventory_schedule',
      'pre_tenancy_checklist_wales',
      'deposit_status',
    ],
    seo: {
      title: 'Wales Periodic Standard Occupation Contract',
      description:
        'Understand and prepare a periodic standard occupation contract for Wales.',
    },
    sitemapEligible: true,
    indexable: true,
    releaseStatus: nonEnglandReleaseStatus('wales'),
  },
  {
    publicName: 'Scotland Private Residential Tenancy',
    slug: 'scotland-private-residential-tenancy',
    jurisdiction: 'scotland',
    agreementType: 'private_residential_tenancy',
    wizardSchema: 'tenancy_agreement/scotland',
    sourceVersion: 'scottish-model-prt-april-2024',
    price: PRODUCTS.ast_standard.price,
    standardAvailable: true,
    premiumAvailable: false,
    startRoute: '/wizard?product=ast_standard&jurisdiction=scotland',
    detailsRoute: '/private-residential-tenancy-agreement-template',
    previewSupport: true,
    supportingDocuments: [
      'inventory_schedule',
      'pre_tenancy_checklist_scotland',
      'easy_read_notes_scotland',
    ],
    seo: {
      title: 'Private Residential Tenancy Agreement Scotland',
      description:
        'Prepare a Scotland PRT with the Scottish Government supporting notes included.',
    },
    sitemapEligible: true,
    indexable: true,
    releaseStatus: nonEnglandReleaseStatus('scotland'),
  },
  {
    publicName: 'Northern Ireland Private Tenancy Agreement',
    slug: 'northern-ireland-private-tenancy-agreement',
    jurisdiction: 'northern-ireland',
    agreementType: 'private_tenancy_agreement',
    wizardSchema: 'tenancy_agreement/northern-ireland',
    sourceVersion: 'northern-ireland-2026-07-27',
    price: PRODUCTS.ast_standard.price,
    standardAvailable: true,
    premiumAvailable: false,
    startRoute: '/wizard?product=ast_standard&jurisdiction=northern-ireland',
    detailsRoute: '/northern-ireland-tenancy-agreement-template',
    previewSupport: true,
    supportingDocuments: [
      'inventory_schedule',
      'pre_tenancy_checklist_northern_ireland',
      'rent_book_northern_ireland',
      'tenancy_information_notice_northern_ireland',
      'tenancy_information_notice_guidance_northern_ireland',
      'tenancy_package_manifest_northern_ireland',
    ],
    seo: {
      title: 'Northern Ireland Tenancy Agreement',
      description:
        'Prepare a Northern Ireland private tenancy agreement with a populated rent book and Tenancy Information Notice.',
    },
    sitemapEligible: true,
    indexable: true,
    releaseStatus: nonEnglandReleaseStatus('northern-ireland'),
  },
] as const;

export function getReleasedStandardTenancyEntries(
  jurisdiction: TenancyAgreementRegistryEntry['jurisdiction']
): readonly TenancyAgreementRegistryEntry[] {
  return TENANCY_AGREEMENT_REGISTRY.filter(
    (entry) =>
      entry.jurisdiction === jurisdiction &&
      entry.releaseStatus === 'available' &&
      entry.standardAvailable &&
      !entry.premiumAvailable
  );
}

export function getReleasedStandardTenancyEntry(
  jurisdiction: TenancyAgreementRegistryEntry['jurisdiction'],
  agreementType?: string
): TenancyAgreementRegistryEntry {
  const matches = getReleasedStandardTenancyEntries(jurisdiction).filter(
    (entry) => !agreementType || entry.agreementType === agreementType
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected one released standard tenancy entry for ${jurisdiction}${
        agreementType ? ` (${agreementType})` : ''
      }, found ${matches.length}`
    );
  }

  return matches[0];
}
