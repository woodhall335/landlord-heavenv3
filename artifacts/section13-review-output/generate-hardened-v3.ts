import fs from 'fs/promises';
import path from 'path';

import {
  generateSection13Pack,
  generateSection13TribunalBundle,
} from '@/lib/documents/section13-generator';
import { createEmptySection13State } from '@/lib/section13/facts';
import { computeSection13Preview } from '@/lib/section13/rules';
import type { Section13Comparable } from '@/lib/section13/types';

function buildComparable(index: number, monthlyEquivalent: number): Section13Comparable {
  return {
    source: 'scraped',
    sourceDateKind: 'published',
    sourceDateValue: '2026-03-15',
    addressSnippet: `Comparable ${index + 1}`,
    postcodeNormalized: 'LS1 1AA',
    bedrooms: 2,
    rawRentValue: monthlyEquivalent,
    rawRentFrequency: 'pcm',
    monthlyEquivalent,
    weeklyEquivalent: Number((monthlyEquivalent * 12 / 52).toFixed(2)),
    adjustedMonthlyEquivalent: monthlyEquivalent,
    isManual: false,
    sortOrder: index,
    adjustments: [],
    metadata: {},
  };
}

function buildState(selectedPlan: 'section13_standard' | 'section13_defensive') {
  const state = createEmptySection13State();
  state.selectedPlan = selectedPlan;
  state.tenancy.tenantNames = ['Alex Tenant', 'Jordan Tenant'];
  state.tenancy.propertyAddressLine1 = '10 Sample Road';
  state.tenancy.propertyTownCity = 'Leeds';
  state.tenancy.postcodeRaw = 'LS1 1AA';
  state.tenancy.postcodeNormalized = 'LS1 1AA';
  state.tenancy.bedrooms = 2;
  state.tenancy.tenancyStartDate = '2025-03-01';
  state.tenancy.currentRentAmount = 1200;
  state.tenancy.currentRentFrequency = 'monthly';
  state.tenancy.lastRentIncreaseDate = '2025-04-01';
  state.landlord.landlordName = 'Taylor Landlord';
  state.landlord.landlordAddressLine1 = '1 Landlord Terrace';
  state.landlord.landlordTownCity = 'Leeds';
  state.landlord.landlordPostcodeRaw = 'LS2 2BB';
  state.landlord.landlordPostcodeNormalized = 'LS2 2BB';
  state.landlord.landlordPhone = '01130000000';
  state.landlord.landlordEmail = 'landlord@example.com';
  state.proposal.proposedRentAmount = 1285;
  state.proposal.proposedStartDate = '2026-06-01';
  state.proposal.serviceDate = '2026-03-25';
  state.proposal.serviceMethod = 'post';
  state.comparablesMeta.searchPostcodeRaw = 'LS1 1AA';
  state.comparablesMeta.searchPostcodeNormalized = 'LS1 1AA';
  state.comparablesMeta.bedrooms = 2;
  state.adjustments.manualJustification =
    'The proposed rent reflects recent local listings and the improved condition of the property.';

  const comparables = [1240, 1265, 1275, 1290, 1305, 1315, 1330, 1345].map((rent, index) =>
    buildComparable(index, rent)
  );

  state.preview = computeSection13Preview(state, comparables, new Date('2026-04-08T00:00:00.000Z'));
  return { state, comparables };
}

async function writePack(productType: 'section13_standard' | 'section13_defensive') {
  const { state, comparables } = buildState(productType);
  const caseId = `${productType}-review-case`;
  const outputDir = path.join(process.cwd(), 'artifacts', 'section13-review-output', productType);
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const pack = await generateSection13Pack({
    caseId,
    productType,
    state,
    comparables,
    evidenceFiles: [],
  });

  let documents = [...pack.documents];
  let workflowStatus = pack.workflowStatus;
  let bundleWarnings = [...pack.bundleWarnings];
  let bundleAssets = [...pack.bundleAssets];

  if (productType === 'section13_defensive') {
    const bundle = await generateSection13TribunalBundle({
      caseId,
      state,
      evidenceFiles: [],
      sourceDocuments: pack.documents.map((doc) => ({
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        file_name: doc.file_name,
        pdf: doc.pdf,
      })),
    });

    documents = [...documents, ...bundle.documents];
    workflowStatus = bundle.workflowStatus;
    bundleWarnings = [...bundleWarnings, ...bundle.bundleWarnings];
    bundleAssets = [...bundleAssets, ...bundle.bundleAssets];
  }

  for (const doc of documents) {
    if (!doc.pdf) continue;
    await fs.writeFile(path.join(outputDir, doc.file_name), doc.pdf);
  }

  await fs.writeFile(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(
      {
        productType,
        caseId,
        documentCount: documents.length,
        documentTypes: documents.map((doc) => doc.document_type),
        workflowStatus,
        bundleWarnings,
        bundleAssetCount: bundleAssets.length,
      },
      null,
      2
    )
  );
}

async function main() {
  await writePack('section13_standard');
  await writePack('section13_defensive');
  console.log('Generated Section 13 hardened-v3 review packs');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
