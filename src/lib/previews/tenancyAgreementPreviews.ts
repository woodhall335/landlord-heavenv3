import 'server-only';

import type { PreviewDoc } from '@/lib/previews/noticeOnlyPreviews';

export type TenancyPreviewJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland';

export type TenancyPreviewTier = 'standard' | 'premium';

export type TenancyAgreementPreviewData = Record<
  TenancyPreviewJurisdiction,
  Record<TenancyPreviewTier, PreviewDoc[]>
>;

const JURISDICTION_LABELS: Record<TenancyPreviewJurisdiction, string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'Northern Ireland',
};

const TIER_LABELS: Record<TenancyPreviewTier, string> = {
  standard: 'Standard',
  premium: 'Premium',
};

type PreviewDocConfig = {
  key: string;
  title: string;
  description: string;
  filename: string;
};

const buildPreviewDoc = (
  jurisdiction: TenancyPreviewJurisdiction,
  tier: TenancyPreviewTier,
  config: PreviewDocConfig
): PreviewDoc => ({
  key: config.key,
  title: config.title,
  description: config.description,
  src: `/images/previews/tenancy-agreement/${jurisdiction}/${tier}/${config.filename}`,
  alt: `Landlord Heaven ${JURISDICTION_LABELS[jurisdiction]} ${TIER_LABELS[tier]} tenancy pack ${config.title} preview`,
});

const PREVIEW_DOCS: Record<
  TenancyPreviewJurisdiction,
  Record<TenancyPreviewTier, PreviewDocConfig[]>
> = {
  england: {
    standard: [
      {
        key: 'ast_agreement',
        title: 'Assured Periodic Tenancy Agreement',
        description: 'Jurisdiction-specific England tenancy agreement built for a straightforward let.',
        filename: 'tenancy-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Blank inventory and condition record to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_england',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering the main England pre-tenancy compliance steps.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'deposit_protection_certificate',
        title: 'Deposit Protection Certificate',
        description: 'Standalone certificate confirming the tenancy deposit scheme details.',
        filename: 'deposit-protection-certificate-preview.webp',
      },
      {
        key: 'tenancy_deposit_information',
        title: 'Prescribed Information Pack',
        description: 'England deposit prescribed information pack for tenant service and compliance.',
        filename: 'prescribed-information-pack-preview.webp',
      },
    ],
    premium: [
      {
        key: 'ast_agreement_hmo',
        title: 'Premium Assured Periodic Tenancy Agreement',
        description: 'Broader drafting for shared households, HMOs, students, and guarantor-backed lets.',
        filename: 'tenancy-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Wizard-completed when data is provided, or ready to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_england',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering the main England pre-tenancy compliance steps.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'deposit_protection_certificate',
        title: 'Deposit Protection Certificate',
        description: 'Standalone certificate confirming the tenancy deposit scheme details.',
        filename: 'deposit-protection-certificate-preview.webp',
      },
      {
        key: 'tenancy_deposit_information',
        title: 'Prescribed Information Pack',
        description: 'England deposit prescribed information pack for tenant service and compliance.',
        filename: 'prescribed-information-pack-preview.webp',
      },
      {
        key: 'key_schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Record the keys, access devices, and handover details for the tenancy setup.',
        filename: 'key-schedule-preview.webp',
      },
      {
        key: 'property_maintenance_guide',
        title: 'Property Maintenance Guide',
        description: 'Practical maintenance and reporting guidance for the tenancy after move-in.',
        filename: 'property-maintenance-guide-preview.webp',
      },
      {
        key: 'checkout_procedure',
        title: 'Checkout Procedure',
        description: 'End-of-tenancy handback steps and checkout record guidance.',
        filename: 'checkout-procedure-preview.webp',
      },
    ],
  },
  wales: {
    standard: [
      {
        key: 'soc_agreement',
        title: 'Standard Occupation Contract',
        description: 'Wales-specific occupation contract for a straightforward residential let.',
        filename: 'occupation-contract-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Blank inventory and condition record to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_wales',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering Rent Smart Wales and key setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
    ],
    premium: [
      {
        key: 'soc_agreement_hmo',
        title: 'Premium Occupation Contract',
        description: 'Broader drafting for shared households, HMOs, students, and guarantor-backed Welsh lets.',
        filename: 'occupation-contract-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Wizard-completed when data is provided, or ready to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_wales',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering Rent Smart Wales and key setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'key_schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Record the keys, access devices, and handover details for the tenancy setup.',
        filename: 'key-schedule-preview.webp',
      },
      {
        key: 'property_maintenance_guide',
        title: 'Property Maintenance Guide',
        description: 'Practical maintenance and reporting guidance for the tenancy after move-in.',
        filename: 'property-maintenance-guide-preview.webp',
      },
      {
        key: 'checkout_procedure',
        title: 'Checkout Procedure',
        description: 'End-of-tenancy handback steps and checkout record guidance.',
        filename: 'checkout-procedure-preview.webp',
      },
    ],
  },
  scotland: {
    standard: [
      {
        key: 'prt_agreement',
        title: 'Private Residential Tenancy Agreement',
        description: 'Scotland-specific PRT agreement for a straightforward residential let.',
        filename: 'prt-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Blank inventory and condition record to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_scotland',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering landlord registration and Scottish setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'easy_read_notes_scotland',
        title: 'Easy Read Notes',
        description: 'Plain-language guidance included with the Scotland tenancy pack.',
        filename: 'easy-read-notes-preview.webp',
      },
    ],
    premium: [
      {
        key: 'prt_agreement_hmo',
        title: 'Premium Private Residential Tenancy Agreement',
        description: 'Broader drafting for shared households, HMOs, students, and guarantor-backed Scottish lets.',
        filename: 'prt-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Wizard-completed when data is provided, or ready to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_scotland',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering landlord registration and Scottish setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'easy_read_notes_scotland',
        title: 'Easy Read Notes',
        description: 'Plain-language guidance included with the Scotland tenancy pack.',
        filename: 'easy-read-notes-preview.webp',
      },
      {
        key: 'key_schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Record the keys, access devices, and handover details for the tenancy setup.',
        filename: 'key-schedule-preview.webp',
      },
      {
        key: 'property_maintenance_guide',
        title: 'Property Maintenance Guide',
        description: 'Practical maintenance and reporting guidance for the tenancy after move-in.',
        filename: 'property-maintenance-guide-preview.webp',
      },
      {
        key: 'checkout_procedure',
        title: 'Checkout Procedure',
        description: 'End-of-tenancy handback steps and checkout record guidance.',
        filename: 'checkout-procedure-preview.webp',
      },
    ],
  },
  'northern-ireland': {
    standard: [
      {
        key: 'private_tenancy_agreement',
        title: 'Private Tenancy Agreement',
        description: 'Northern Ireland tenancy agreement for a straightforward residential let.',
        filename: 'private-tenancy-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Blank inventory and condition record to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_northern_ireland',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering key Northern Ireland setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
    ],
    premium: [
      {
        key: 'private_tenancy_agreement_hmo',
        title: 'Premium Private Tenancy Agreement',
        description: 'Broader drafting for shared households, HMOs, students, and guarantor-backed Northern Ireland lets.',
        filename: 'private-tenancy-agreement-preview.webp',
      },
      {
        key: 'inventory_schedule',
        title: 'Inventory & Schedule of Condition',
        description: 'Wizard-completed when data is provided, or ready to complete at check-in.',
        filename: 'inventory-schedule-preview.webp',
      },
      {
        key: 'pre_tenancy_checklist_northern_ireland',
        title: 'Pre-Tenancy Compliance Checklist',
        description: 'Practical checklist covering key Northern Ireland setup requirements.',
        filename: 'compliance-checklist-preview.webp',
      },
      {
        key: 'key_schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Record the keys, access devices, and handover details for the tenancy setup.',
        filename: 'key-schedule-preview.webp',
      },
      {
        key: 'property_maintenance_guide',
        title: 'Property Maintenance Guide',
        description: 'Practical maintenance and reporting guidance for the tenancy after move-in.',
        filename: 'property-maintenance-guide-preview.webp',
      },
      {
        key: 'checkout_procedure',
        title: 'Checkout Procedure',
        description: 'End-of-tenancy handback steps and checkout record guidance.',
        filename: 'checkout-procedure-preview.webp',
      },
    ],
  },
};

export async function getTenancyAgreementPreviewData(): Promise<TenancyAgreementPreviewData> {
  const data = {} as TenancyAgreementPreviewData;

  for (const jurisdiction of Object.keys(PREVIEW_DOCS) as TenancyPreviewJurisdiction[]) {
    data[jurisdiction] = {
      standard: PREVIEW_DOCS[jurisdiction].standard.map((doc) =>
        buildPreviewDoc(jurisdiction, 'standard', doc)
      ),
      premium: PREVIEW_DOCS[jurisdiction].premium.map((doc) =>
        buildPreviewDoc(jurisdiction, 'premium', doc)
      ),
    };
  }

  return data;
}
