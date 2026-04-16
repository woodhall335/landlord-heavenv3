import { createAdminClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  mapCaseFactsToMoneyClaimCase,
  mapCaseFactsToScotlandMoneyClaimCase,
} from '@/lib/documents/money-claim-wizard-mapper';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import { generateResidentialLettingDocuments } from '@/lib/documents/residential-letting-generator';
import { getPackContents } from '@/lib/products';
import type { PackItem } from '@/lib/products';
import {
  resolveEffectiveJurisdiction,
  JurisdictionResolutionError,
} from '@/lib/tenancy/jurisdiction';
import { safeUpdateOrderWithMetadata } from '@/lib/payments/safe-order-metadata';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import { persistDocumentRecordWithFallback } from '@/lib/payments/document-persistence';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';
import { doesDocumentTypeMatch, toCanonicalDocumentKey } from '@/lib/documents/dashboard-document-display';
import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import {
  generateSection13CoreDocuments,
  getSection13Form4AAssetMetadata,
  SECTION13_CORE_DOCUMENT_TYPES,
  SECTION13_DEFENSIVE_DOCUMENT_TYPES,
  type Section13EvidenceFile,
} from '@/lib/documents/section13-generator';
import {
  buildSection13BundleJobIdempotencyKey,
  buildSection13EvidenceSetHash,
  createOrGetSection13BundleJob,
  createSection13OutputSnapshot,
  getDefaultSection13StateForCase,
  getSection13Comparables,
  getSection13DocumentsForSnapshot,
  getSection13EvidenceUploads,
  getSection13OutputSnapshotByOrderId,
  replaceSection13BundleAssets,
} from '@/lib/section13/server';
import {
  buildSection13JustificationSummaryText,
  computeSection13Preview,
} from '@/lib/section13/rules';
import type {
  Section13BundleAsset,
  Section13EvidenceUpload,
  Section13OutputSnapshot,
  Section13ProductSku,
} from '@/lib/section13/types';

// =============================================================================
// TYPES
// =============================================================================

interface FulfillOrderInput {
  orderId: string;
  caseId: string;
  productType: string;
  addOns?: string[];
  userId?: string | null;
}

interface FulfillmentValidation {
  isComplete: boolean;
  expectedCount: number;
  actualCount: number;
  expectedKeys: string[];
  actualTitles: string[];
  actualCanonicalKeys: string[];
  missingKeys: string[];
}

interface FulfillmentResult {
  status: 'fulfilled' | 'already_fulfilled' | 'incomplete' | 'processing' | 'requires_action';
  documents: number;
  validation?: FulfillmentValidation;
  error?: string;
  /** For requires_action status: documents that were blocked by validation */
  blockedDocuments?: BlockedDocument[];
  /** For requires_action status: actions needed to complete fulfillment */
  requiredActions?: RequiredAction[];
}

interface BlockedDocument {
  documentType: string;
  documentTitle: string;
  blockingCodes: string[];
  reason: string;
}

interface RequiredAction {
  fieldKey: string;
  label: string;
  errorCode: string;
  helpText: string;
}

// =============================================================================
// FULFILLMENT VALIDATION HELPERS
// =============================================================================

/**
 * Get expected document keys for a given product, jurisdiction, and route.
 * Uses pack-contents.ts as the single source of truth.
 */
function getExpectedDocumentKeys(
  productType: string,
  jurisdiction: string,
  route?: string,
  hasArrears?: boolean
): string[] {
  const packContents: PackItem[] = getPackContents({
    product: productType,
    jurisdiction,
    route,
    has_arrears: hasArrears,
  });

  return packContents.map((item) => item.key);
}

function getExpectedDocumentKeysForProducts(
  productTypes: string[],
  jurisdiction: string,
  route?: string,
  hasArrears?: boolean
): string[] {
  return Array.from(
    new Set(
      productTypes.flatMap((productType) =>
        getExpectedDocumentKeys(productType, jurisdiction, route, hasArrears)
      )
    )
  );
}

export function computeMissingDocumentKeys(expectedKeys: string[], actualDocs: Array<{ document_type: string; document_title: string }>): { missingKeys: string[]; actualCanonicalKeys: string[] } {
  const actualCanonicalKeys = actualDocs.flatMap((d) => {
    const keys = new Set<string>();
    const canonicalType = toCanonicalDocumentKey(d.document_type);
    if (canonicalType) keys.add(canonicalType);
    const canonicalTitle = toCanonicalDocumentKey(d.document_title);
    if (canonicalTitle) keys.add(canonicalTitle);
    return Array.from(keys);
  });

  const missingKeys = expectedKeys.filter((key) =>
    !actualCanonicalKeys.some((actualKey) => doesDocumentTypeMatch(key, actualKey))
  );

  return { missingKeys, actualCanonicalKeys };
}

/**
 * Validate that all expected documents exist for a case.
 * Compares expected document keys from pack-contents against actual documents in database.
 */
async function validateFulfillmentCompleteness(
  supabase: ReturnType<typeof createAdminClient>,
  caseId: string,
  productType: string,
  jurisdiction: string,
  route?: string,
  hasArrears?: boolean
): Promise<FulfillmentValidation> {
  // Get expected documents from pack-contents (single source of truth)
  const expectedKeys = getExpectedDocumentKeys(productType, jurisdiction, route, hasArrears);

  // Get actual documents from database
  const { data: actualDocs, error } = await supabase
    .from('documents')
    .select('id, document_title, document_type, metadata')
    .eq('case_id', caseId)
    .eq('is_preview', false);

  if (error) {
    console.error('[fulfillment] Failed to fetch documents for validation:', error);
    return {
      isComplete: false,
      expectedCount: expectedKeys.length,
      actualCount: 0,
      expectedKeys,
      actualTitles: [],
      actualCanonicalKeys: [],
      missingKeys: expectedKeys,
    };
  }

  const actualTitles = (actualDocs || []).map((d) => d.document_title);
  const actualCount = actualDocs?.length || 0;
  const { missingKeys, actualCanonicalKeys } = computeMissingDocumentKeys(expectedKeys, actualDocs || []);
  const isComplete = missingKeys.length === 0;

  return {
    isComplete,
    expectedCount: expectedKeys.length,
    actualCount,
    expectedKeys,
    actualTitles,
    actualCanonicalKeys,
    missingKeys,
  };
}

async function validateFulfillmentCompletenessForProducts(
  supabase: ReturnType<typeof createAdminClient>,
  caseId: string,
  productTypes: string[],
  jurisdiction: string,
  route?: string,
  hasArrears?: boolean
): Promise<FulfillmentValidation> {
  const expectedKeys = getExpectedDocumentKeysForProducts(productTypes, jurisdiction, route, hasArrears);

  const { data: actualDocs, error } = await supabase
    .from('documents')
    .select('id, document_title, document_type, metadata')
    .eq('case_id', caseId)
    .eq('is_preview', false);

  if (error) {
    console.error('[fulfillment] Failed to fetch documents for validation:', error);
    return {
      isComplete: false,
      expectedCount: expectedKeys.length,
      actualCount: 0,
      expectedKeys,
      actualTitles: [],
      actualCanonicalKeys: [],
      missingKeys: expectedKeys,
    };
  }

  const actualTitles = (actualDocs || []).map((d) => d.document_title);
  const actualCount = actualDocs?.length || 0;
  const { missingKeys, actualCanonicalKeys } = computeMissingDocumentKeys(expectedKeys, actualDocs || []);

  return {
    isComplete: missingKeys.length === 0,
    expectedCount: expectedKeys.length,
    actualCount,
    expectedKeys,
    actualTitles,
    actualCanonicalKeys,
    missingKeys,
  };
}

/**
 * Log fulfillment validation result with detailed information.
 */
function logFulfillmentValidation(
  orderId: string,
  caseId: string,
  productType: string,
  validation: FulfillmentValidation
): void {
  if (validation.isComplete) {
    console.log(
      `[fulfillment] ✅ Order ${orderId} complete: ${validation.actualCount}/${validation.expectedCount} documents`
    );
  } else {
    console.warn(
      `[fulfillment] ⚠️ INCOMPLETE FULFILLMENT for order ${orderId}:\n` +
        `  Case: ${caseId}\n` +
        `  Product: ${productType}\n` +
        `  Documents: ${validation.actualCount}/${validation.expectedCount}\n` +
        `  Missing keys: ${validation.missingKeys.join(', ') || 'unknown'}\n` +
        `  Expected canonical keys: ${validation.expectedKeys.join(', ')}\n` +
        `  Actual canonical keys: ${validation.actualCanonicalKeys.join(', ')}\n` +
        `  Actual titles: ${validation.actualTitles.join(', ')}`
    );
  }
}

type PersistableGeneratedDocument = {
  title: string;
  description?: string;
  document_type: string;
  html?: string | null;
  pdf?: Buffer;
  file_name: string;
  contentType?: string;
};

async function persistGeneratedDocuments(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    caseId: string;
    userId: string;
    jurisdiction: string;
    orderId: string;
    productType: string;
    documents: PersistableGeneratedDocument[];
    metadata?: Record<string, unknown>;
    outputSnapshotId?: string | null;
    storageFolder?: string | null;
  }
): Promise<number> {
  const {
    caseId,
    userId,
    jurisdiction,
    orderId,
    productType,
    documents,
    metadata,
    outputSnapshotId,
    storageFolder,
  } = params;
  let generatedDocsCount = 0;

  for (const doc of documents) {
    if (!doc.pdf) continue;

    const fileName = storageFolder
      ? `${storageFolder}/${doc.file_name}`
      : `${userId}/${caseId}/${doc.file_name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, doc.pdf, {
        contentType: doc.contentType || 'application/pdf',
        upsert: true,
      });

    if (uploadError && !uploadError.message.includes('already exists')) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);

    const documentPayload = {
      user_id: userId,
      case_id: caseId,
      order_id: orderId,
      output_snapshot_id: outputSnapshotId || null,
      document_type: doc.document_type,
      document_title: doc.title,
      jurisdiction,
      html_content: doc.html || null,
      pdf_url: publicUrlData.publicUrl,
      is_preview: false,
      qa_passed: true,
      metadata: {
        description: doc.description,
        pack_type: productType,
        order_id: orderId,
        output_snapshot_id: outputSnapshotId || null,
        ...(metadata || {}),
      },
    };

    const { error: insertError, method } = await persistDocumentRecordWithFallback(
      supabase as any,
      documentPayload,
      {
        caseId,
        documentType: doc.document_type,
        outputSnapshotId,
      }
    );

    if (insertError) {
      console.error(`[fulfillment] Failed to insert document "${doc.title}":`, insertError);
    } else {
      if (method !== 'upsert') {
        console.warn(
          `[fulfillment] Document "${doc.title}" persisted via ${method} fallback instead of upsert`
        );
      }
      generatedDocsCount++;
    }
  }

  return generatedDocsCount;
}

async function loadSection13EvidenceFiles(
  supabase: ReturnType<typeof createAdminClient>,
  evidenceUploads: Section13EvidenceUpload[]
): Promise<Section13EvidenceFile[]> {
  const files: Section13EvidenceFile[] = [];

  for (const upload of evidenceUploads) {
    if (!upload.storagePath || upload.uploadStatus === 'failed') {
      continue;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(upload.storagePath);

      if (error || !data) {
        console.warn('[fulfillment] Could not download Section 13 evidence upload', {
          uploadId: upload.id,
          storagePath: upload.storagePath,
          error: error?.message,
        });
        continue;
      }

      const arrayBuffer = await data.arrayBuffer();
      files.push({
        upload,
        bytes: new Uint8Array(arrayBuffer),
        contentType: upload.mimeType || data.type || 'application/octet-stream',
      });
    } catch (error: any) {
      console.warn('[fulfillment] Failed to load Section 13 evidence upload', {
        uploadId: upload.id,
        storagePath: upload.storagePath,
        error: error?.message || String(error),
      });
    }
  }

  return files;
}

async function persistSection13BundleAssets(
  supabase: ReturnType<typeof createAdminClient>,
  caseId: string,
  assets: Section13BundleAsset[]
): Promise<void> {
  const documentTypes = Array.from(
    new Set(
      assets
        .map((asset) => {
          const metadata = (asset.metadata || {}) as Record<string, unknown>;
          const documentType = metadata.document_type;
          return typeof documentType === 'string' && documentType.length > 0 ? documentType : null;
        })
        .filter((value): value is string => Boolean(value))
    )
  );

  let documentIdByType = new Map<string, string>();

  if (documentTypes.length > 0) {
    const { data: docs } = await supabase
      .from('documents')
      .select('id, document_type')
      .eq('case_id', caseId)
      .in('document_type', documentTypes)
      .order('created_at', { ascending: false });

    documentIdByType = new Map<string, string>();
    for (const doc of docs || []) {
      if (!documentIdByType.has((doc as any).document_type)) {
        documentIdByType.set((doc as any).document_type, (doc as any).id);
      }
    }
  }

  await replaceSection13BundleAssets(
    supabase,
    caseId,
    assets.map((asset) => {
      const metadata = (asset.metadata || {}) as Record<string, unknown>;
      const documentType =
        typeof metadata.document_type === 'string' ? metadata.document_type : null;

      return {
        ...asset,
        sourceDocumentId:
          asset.sourceDocumentId ||
          (documentType ? documentIdByType.get(documentType) || null : null),
      };
    })
  );
}

async function ensureSection13OutputSnapshot(params: {
  supabase: ReturnType<typeof createAdminClient>;
  orderId: string;
  caseId: string;
  state: Record<string, any>;
  comparables: Record<string, any>[];
}): Promise<Section13OutputSnapshot> {
  const { supabase, orderId, caseId, state, comparables } = params;
  const existing = await getSection13OutputSnapshotByOrderId(supabase, orderId);
  if (existing) {
    return existing;
  }

  const formMetadata = await getSection13Form4AAssetMetadata();
  const justificationSummaryText = buildSection13JustificationSummaryText(state as any, state.preview);
  const manualJustification =
    typeof state.adjustments?.manualJustification === 'string'
      ? state.adjustments.manualJustification.trim()
      : '';
  const justificationNarrativeText = manualJustification
    ? `${justificationSummaryText} ${manualJustification}`
    : justificationSummaryText;

  return createSection13OutputSnapshot(supabase, {
    orderId,
    caseId,
    rulesVersion: state.rulesVersion,
    formAssetVersion: formMetadata.version,
    formAssetSha256: formMetadata.sha256,
    stateSnapshot: JSON.parse(JSON.stringify(state)),
    previewMetrics: JSON.parse(JSON.stringify(state.preview || {})),
    defensibilitySummarySentence:
      state.preview?.defensibilitySummarySentence ||
      'Add a proposed rent and enough recent source-backed comparables to generate a defensibility summary.',
    justificationSummaryText,
    justificationNarrativeText,
    comparableSnapshot: JSON.parse(JSON.stringify(comparables)),
  });
}

function getExpectedSection13DocumentKeys(productType: Section13ProductSku): string[] {
  return [
    ...(productType === 'section13_defensive'
      ? SECTION13_DEFENSIVE_DOCUMENT_TYPES
      : SECTION13_CORE_DOCUMENT_TYPES),
  ];
}

async function validateSection13SnapshotFulfillment(params: {
  supabase: ReturnType<typeof createAdminClient>;
  caseId: string;
  outputSnapshotId: string;
  productType: Section13ProductSku;
}): Promise<FulfillmentValidation> {
  const { supabase, caseId, outputSnapshotId, productType } = params;
  const expectedKeys = getExpectedSection13DocumentKeys(productType);
  const docs = await getSection13DocumentsForSnapshot(supabase, {
    caseId,
    outputSnapshotId,
    documentTypes: expectedKeys,
  });
  const actualDocs = docs.map((row) => ({
    document_type: (row as any).document_type,
    document_title: (row as any).document_title,
  }));
  const { missingKeys, actualCanonicalKeys } = computeMissingDocumentKeys(expectedKeys, actualDocs);

  return {
    isComplete: missingKeys.length === 0 && actualDocs.length >= expectedKeys.length,
    expectedCount: expectedKeys.length,
    actualCount: actualDocs.length,
    expectedKeys,
    actualTitles: actualDocs.map((doc) => doc.document_title),
    actualCanonicalKeys,
    missingKeys,
  };
}

async function queueSection13BundleJob(params: {
  supabase: ReturnType<typeof createAdminClient>;
  caseId: string;
  orderId: string;
  outputSnapshot: Section13OutputSnapshot;
  evidenceUploads: Section13EvidenceUpload[];
}): Promise<void> {
  const { supabase, caseId, orderId, outputSnapshot, evidenceUploads } = params;
  const evidenceSetHash = buildSection13EvidenceSetHash(evidenceUploads);
  const idempotencyKey = buildSection13BundleJobIdempotencyKey({
    caseId,
    orderId,
    outputSnapshotId: outputSnapshot.id || '',
    evidenceSetHash,
  });

  await createOrGetSection13BundleJob(supabase, {
    caseId,
    orderId,
    outputSnapshotId: outputSnapshot.id || '',
    idempotencyKey,
    status: 'queued',
    generationMode: 'sync',
    attemptCount: 0,
    maxAttempts: 3,
    warningCount: 0,
  });
}

async function generateSection13DocumentsForSnapshot(params: {
  supabase: ReturnType<typeof createAdminClient>;
  orderId: string;
  caseId: string;
  userId: string;
  jurisdiction: string;
  productType: Section13ProductSku;
  wizardFacts: Record<string, any>;
}): Promise<{
  generatedCount: number;
  outputSnapshot: Section13OutputSnapshot;
  validation: FulfillmentValidation;
  wasAlreadyComplete: boolean;
}> {
  const { supabase, orderId, caseId, userId, jurisdiction, productType, wizardFacts } = params;
  const section13State = getDefaultSection13StateForCase(wizardFacts, productType);
  const comparables = await getSection13Comparables(supabase, caseId);
  section13State.preview = computeSection13Preview(section13State, comparables);
  const outputSnapshot = await ensureSection13OutputSnapshot({
    supabase,
    orderId,
    caseId,
    state: section13State as any,
    comparables: comparables as any[],
  });

  const preValidation = await validateSection13SnapshotFulfillment({
    supabase,
    caseId,
    outputSnapshotId: outputSnapshot.id || '',
    productType,
  });

  const evidenceUploads =
    productType === 'section13_defensive'
      ? await getSection13EvidenceUploads(supabase, caseId)
      : [];

  if (preValidation.isComplete && preValidation.actualCount > 0) {
    if (productType === 'section13_defensive') {
      await queueSection13BundleJob({
        supabase,
        caseId,
        orderId,
        outputSnapshot,
        evidenceUploads,
      });
    }

    await supabase
      .from('cases')
      .update({
        workflow_status: 'fulfilled',
        workflow_status_updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    return {
      generatedCount: preValidation.actualCount,
      outputSnapshot,
      validation: preValidation,
      wasAlreadyComplete: true,
    };
  }

  const evidenceFiles =
    productType === 'section13_defensive'
      ? await loadSection13EvidenceFiles(supabase, evidenceUploads)
      : [];

  const documents = await generateSection13CoreDocuments({
    caseId,
    productType,
    state: outputSnapshot.stateSnapshot,
    comparables: outputSnapshot.comparableSnapshot,
    evidenceFiles,
    snapshot: outputSnapshot,
  });

  const generatedCount = await persistGeneratedDocuments(supabase, {
    caseId,
    userId,
    jurisdiction,
    orderId,
    productType,
    documents,
    outputSnapshotId: outputSnapshot.id || null,
    storageFolder: `${userId}/${caseId}/${outputSnapshot.id || orderId}`,
    metadata: {
      rules_version: outputSnapshot.rulesVersion,
      form_asset_version: outputSnapshot.formAssetVersion,
      form_asset_sha256: outputSnapshot.formAssetSha256,
      challenge_band: outputSnapshot.previewMetrics?.challengeBand,
      evidence_band: outputSnapshot.previewMetrics?.evidenceBand,
      workflow_status: 'fulfilled',
    },
  });

  if (productType === 'section13_defensive') {
    await queueSection13BundleJob({
      supabase,
      caseId,
      orderId,
      outputSnapshot,
      evidenceUploads,
    });
  }

  await supabase
    .from('cases')
    .update({
      workflow_status: 'fulfilled',
      workflow_status_updated_at: new Date().toISOString(),
    })
    .eq('id', caseId);

  const postValidation = await validateSection13SnapshotFulfillment({
    supabase,
    caseId,
    outputSnapshotId: outputSnapshot.id || '',
    productType,
  });

  return {
    generatedCount,
    outputSnapshot,
    validation: postValidation,
    wasAlreadyComplete: false,
  };
}

async function generateDocumentsForProduct(params: {
  supabase: ReturnType<typeof createAdminClient>;
  productType: string;
  orderId: string;
  caseId: string;
  userId: string;
  jurisdiction: string;
  wizardFacts: Record<string, any>;
  caseFacts: Record<string, any>;
}): Promise<number> {
  const { supabase, productType, orderId, caseId, userId, jurisdiction, wizardFacts, caseFacts } = params;

  if (productType === 'notice_only' || productType === 'complete_pack') {
    const { generateNoticeOnlyPack, generateCompleteEvictionPack } = await import(
      '@/lib/documents/eviction-pack-generator'
    );

    const evictionPack =
      productType === 'notice_only'
        ? await generateNoticeOnlyPack(wizardFacts)
        : await generateCompleteEvictionPack(wizardFacts);

    return persistGeneratedDocuments(supabase, {
      caseId,
      userId,
      jurisdiction,
      orderId,
      productType,
      documents: evictionPack.documents,
    });
  }

  if (productType === 'money_claim') {
    const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

    const pack = await generateMoneyClaimPack({
      ...mapCaseFactsToMoneyClaimCase(caseFacts as any),
      case_id: caseId,
    });

    return persistGeneratedDocuments(supabase, {
      caseId,
      userId,
      jurisdiction,
      orderId,
      productType,
      documents: pack.documents,
    });
  }

  if (productType === 'sc_money_claim') {
    const { generateScotlandMoneyClaim } = await import(
      '@/lib/documents/scotland-money-claim-pack-generator'
    );

    const pack = await generateScotlandMoneyClaim({
      ...mapCaseFactsToScotlandMoneyClaimCase(caseFacts as any),
      case_id: caseId,
    });

    return persistGeneratedDocuments(supabase, {
      caseId,
      userId,
      jurisdiction,
      orderId,
      productType,
      documents: pack.documents,
    });
  }

  if (productType === 'ast_standard' || productType === 'ast_premium') {
    const { generateStandardASTDocuments, generatePremiumASTDocuments } = await import(
      '@/lib/documents/ast-generator'
    );

    const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: jurisdiction });
    const astPack =
      productType === 'ast_standard'
        ? await generateStandardASTDocuments(astData, caseId)
        : await generatePremiumASTDocuments(astData, caseId);

    return persistGeneratedDocuments(supabase, {
      caseId,
      userId,
      jurisdiction,
      orderId,
      productType,
      documents: astPack.documents,
      metadata: { tier: astPack.tier },
    });
  }

  if (productType === 'section13_standard' || productType === 'section13_defensive') {
    const result = await generateSection13DocumentsForSnapshot({
      supabase,
      orderId,
      caseId,
      userId,
      jurisdiction,
      productType: productType as Section13ProductSku,
      wizardFacts: wizardFacts as Record<string, any>,
    });

    return result.generatedCount;
  }

  if (isResidentialLettingProductSku(productType)) {
    const pack = await generateResidentialLettingDocuments(
      productType as ResidentialLettingProductSku,
      {
        ...wizardFacts,
        case_id: caseId,
      }
    );

    return persistGeneratedDocuments(supabase, {
      caseId,
      userId,
      jurisdiction,
      orderId,
      productType,
      documents: pack.documents,
    });
  }

  throw new Error(`Unsupported product type for fulfillment: ${productType}`);
}

// =============================================================================
// MAIN FULFILLMENT FUNCTION
// =============================================================================

export async function fulfillOrder({
  orderId,
  caseId,
  productType,
  addOns = [],
  userId,
}: FulfillOrderInput): Promise<FulfillmentResult> {
  const supabase = createAdminClient();
  const requestedFulfillmentProducts = Array.from(new Set([productType, ...addOns].filter(Boolean)));

  // First, get case data to determine jurisdiction and route
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError || !caseData) {
    throw new Error('Case not found for fulfillment');
  }

  const wizardFacts = (caseData as any).collected_facts || {};
  const route = wizardFacts.selected_notice_route || wizardFacts.eviction_route;
  const hasArrears = wizardFacts.has_arrears || wizardFacts.arrears_claimed;
  const caseType = (caseData as any).case_type || null;

  // ===========================================================================
  // CANONICAL JURISDICTION RESOLUTION - SINGLE SOURCE OF TRUTH
  // Uses resolveEffectiveJurisdiction() which NEVER defaults to England.
  // This ensures Wales/Scotland/NI cases always get their correct documents.
  // ===========================================================================
  const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

  let jurisdiction: string;
  try {
    const resolved = resolveEffectiveJurisdiction({
      caseData: {
        jurisdiction: (caseData as any).jurisdiction,
        property_location: (caseData as any).property_location,
      },
      wizardFacts: wizardFacts as any,
      caseFacts,
      isPurchased: true, // This is post-purchase fulfillment
      context: `fulfillment:${caseId}:${productType}`,
    });
    jurisdiction = resolved.jurisdiction;
    console.log(
      `[fulfillment] Resolved jurisdiction: "${jurisdiction}" from source: "${resolved.source}" for case ${caseId}`
    );
  } catch (error) {
    if (error instanceof JurisdictionResolutionError) {
      // This is a critical error - we cannot generate documents without jurisdiction
      console.error(
        `[fulfillment] CRITICAL: Failed to resolve jurisdiction for case ${caseId}. ` +
        `Sources checked: ${error.sources.join(', ')}`
      );
      throw new Error(
        `Cannot generate documents: jurisdiction not set on case. ` +
        `Please contact support. Case ID: ${caseId}`
      );
    }
    throw error;
  }

  const fulfillmentProducts = Array.from(
    new Set(
      requestedFulfillmentProducts
        .map((sku) =>
          resolveFulfillmentProductForCase({
            productType: sku,
            jurisdiction,
            caseType,
          }) || sku
        )
        .filter(Boolean)
    )
  );
  const primaryFulfillmentProduct = fulfillmentProducts[0] || productType;

  // ==========================================================================
  // SECTION 8 COMPLETE PACK: Auto-normalize signature_date to notice_expiry_date
  // This ensures existing paid cases can regenerate successfully.
  // The signature date MUST be >= notice_expiry_date for Section 8 court forms.
  // ==========================================================================
  const isSection8Route = route === 'section_8' || route === 'section8_notice';
  const isCompletePack = productType === 'complete_pack';

  if (isSection8Route && isCompletePack) {
    const noticeExpiryDate = wizardFacts.notice_expiry_date ||
                              wizardFacts.expiry_date ||
                              wizardFacts.notice?.expiry_date;
    const currentSignatureDate = wizardFacts.signature_date ||
                                  wizardFacts.signing?.signature_date;

    if (noticeExpiryDate) {
      const needsUpdate = !currentSignatureDate || currentSignatureDate < noticeExpiryDate;

      if (needsUpdate) {
        console.log(
          `[fulfillment] Section 8 complete_pack: Auto-normalizing signature_date from ` +
          `"${currentSignatureDate || 'unset'}" to "${noticeExpiryDate}" (notice expiry)`
        );

        // Update the wizardFacts in memory for this generation
        wizardFacts.signature_date = noticeExpiryDate;

        // Also persist to database so the fix is permanent
        const updatedFacts = {
          ...(caseData as any).collected_facts,
          signature_date: noticeExpiryDate,
        };

        await supabase
          .from('cases')
          .update({ collected_facts: updatedFacts })
          .eq('id', caseId);
      }
    }
  }

  const isSection13Fulfillment =
    fulfillmentProducts.length > 0 &&
    fulfillmentProducts.every(
      (sku) => sku === 'section13_standard' || sku === 'section13_defensive'
    );

  if (isSection13Fulfillment) {
    const resolvedUserId = userId || (caseData as any).user_id;
    if (!resolvedUserId) {
      throw new Error('Unable to resolve user for fulfillment');
    }

    const section13Product = fulfillmentProducts.includes('section13_defensive')
      ? 'section13_defensive'
      : 'section13_standard';

    await supabase
      .from('orders')
      .update({ fulfillment_status: 'processing' })
      .eq('id', orderId);

    await supabase
      .from('cases')
      .update({
        workflow_status: 'generating',
        workflow_status_updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    try {
      const result = await generateSection13DocumentsForSnapshot({
        supabase,
        orderId,
        caseId,
        userId: resolvedUserId,
        jurisdiction,
        productType: section13Product,
        wizardFacts: wizardFacts as Record<string, any>,
      });

      logFulfillmentValidation(orderId, caseId, section13Product, result.validation);

      if (!result.validation.isComplete) {
        await safeUpdateOrderWithMetadata(
          supabase,
          orderId,
          { fulfillment_status: 'processing' },
          {
            total_documents: result.validation.actualCount,
            expected_documents: result.validation.expectedCount,
            generated_documents: result.generatedCount,
            validation: 'incomplete',
            missing_keys: result.validation.missingKeys,
            last_attempt: new Date().toISOString(),
            output_snapshot_id: result.outputSnapshot.id || null,
            rules_version: result.outputSnapshot.rulesVersion,
            products: fulfillmentProducts,
            add_ons: addOns,
          }
        );

        return {
          status: 'incomplete',
          documents: result.validation.actualCount,
          validation: result.validation,
          error: `Incomplete fulfillment: ${result.validation.actualCount}/${result.validation.expectedCount} documents. Missing: ${result.validation.missingKeys.join(', ')}`,
        };
      }

      await safeUpdateOrderWithMetadata(
        supabase,
        orderId,
        {
          fulfillment_status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
        },
        {
          total_documents: result.validation.actualCount,
          expected_documents: result.validation.expectedCount,
          generated_documents: result.generatedCount,
          validation: 'complete',
          output_snapshot_id: result.outputSnapshot.id || null,
          rules_version: result.outputSnapshot.rulesVersion,
          form_asset_version: result.outputSnapshot.formAssetVersion,
          products: fulfillmentProducts,
          add_ons: addOns,
        }
      );

      await supabase
        .from('cases')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      return {
        status: result.wasAlreadyComplete ? 'already_fulfilled' : 'fulfilled',
        documents: result.validation.actualCount,
        validation: result.validation,
      };
    } catch (error) {
      throw error;
    }
  }

  // ==========================================================================
  // VALIDATION: Check if fulfillment is already complete
  // This replaces the old "any doc exists" check with proper validation
  // ==========================================================================
  const preValidation = await validateFulfillmentCompletenessForProducts(
    supabase,
    caseId,
    fulfillmentProducts,
    jurisdiction,
    route,
    hasArrears
  );

  if (preValidation.isComplete && preValidation.actualCount > 0) {
    // All expected documents exist - mark as fulfilled and return
    await safeUpdateOrderWithMetadata(
      supabase,
      orderId,
      {
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
      },
      {
        total_documents: preValidation.actualCount,
        expected_documents: preValidation.expectedCount,
        validation: 'complete',
      }
    );

    // Sync case status to 'completed' (idempotent)
    await supabase
      .from('cases')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    logFulfillmentValidation(orderId, caseId, fulfillmentProducts.join(', '), preValidation);

    return {
      status: 'already_fulfilled',
      documents: preValidation.actualCount,
      validation: preValidation,
    };
  }

  // If some documents exist but not all, log and proceed to regenerate missing
  if (preValidation.actualCount > 0 && !preValidation.isComplete) {
    console.warn(
      `[fulfillment] Partial fulfillment detected for order ${orderId}: ` +
        `${preValidation.actualCount}/${preValidation.expectedCount} documents. Proceeding to generate missing.`
    );
  }

  // ==========================================================================
  // GENERATION: Generate documents based on product type
  // ==========================================================================

  const resolvedUserId = userId || (caseData as any).user_id;
  if (!resolvedUserId) {
    throw new Error('Unable to resolve user for fulfillment');
  }

  // caseFacts already defined above during canonical jurisdiction resolution
  let generatedDocsCount = 0;

  // Mark as processing before starting generation
  await supabase
    .from('orders')
    .update({ fulfillment_status: 'processing' })
    .eq('id', orderId);

  if (fulfillmentProducts.some((sku) => sku === 'section13_standard' || sku === 'section13_defensive')) {
    await supabase
      .from('cases')
      .update({
        workflow_status: 'generating',
        workflow_status_updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);
  }

  const isTenancyAgreementProduct = fulfillmentProducts.some(
    (sku) =>
      sku === 'ast_standard' ||
      sku === 'ast_premium' ||
      sku === 'england_standard_tenancy_agreement' ||
      sku === 'england_premium_tenancy_agreement' ||
      sku === 'england_student_tenancy_agreement' ||
      sku === 'england_hmo_shared_house_tenancy_agreement' ||
      sku === 'england_lodger_agreement'
  );
  if (isTenancyAgreementProduct) {
    const tenancyValidation = validateTenancyRequiredFacts(wizardFacts as Record<string, unknown>, {
      jurisdiction: jurisdiction as any,
      product: primaryFulfillmentProduct,
    });
    const missingTenancyFields = [
      ...tenancyValidation.missing_fields,
      ...tenancyValidation.invalid_fields,
    ];

    if (missingTenancyFields.length > 0) {
      const safeFailureMessage =
        'Unable to fulfill tenancy agreement order: missing required tenancy facts';

      console.error(
        '[fulfillment] Tenancy fulfillment blocked due to missing required facts',
        {
          orderId,
          caseId,
          productType: primaryFulfillmentProduct,
          missing_fields: missingTenancyFields,
        }
      );

      await safeUpdateOrderWithMetadata(
        supabase,
        orderId,
        { fulfillment_status: 'failed' },
        {
          validation: 'incomplete',
          tenancy_validation_code: 'tenancy_required_fields_missing',
          missing_fields: missingTenancyFields,
          last_attempt: new Date().toISOString(),
          error: safeFailureMessage,
        }
      );

      return {
        status: 'incomplete',
        documents: 0,
        error: `${safeFailureMessage}: ${missingTenancyFields.join(', ')}`,
      };
    }
  }

  try {
    for (const fulfillmentProduct of fulfillmentProducts) {
      generatedDocsCount += await generateDocumentsForProduct({
        supabase,
        productType: fulfillmentProduct,
        orderId,
        caseId,
        userId: resolvedUserId,
        jurisdiction,
        wizardFacts,
        caseFacts,
      });
    }

    // ==========================================================================
    // POST-GENERATION VALIDATION: Verify all expected documents now exist
    // ==========================================================================
    const postValidation = await validateFulfillmentCompletenessForProducts(
      supabase,
      caseId,
      fulfillmentProducts,
      jurisdiction,
      route,
      hasArrears
    );

    logFulfillmentValidation(orderId, caseId, fulfillmentProducts.join(', '), postValidation);

    if (postValidation.isComplete) {
      // All documents generated successfully - mark as fulfilled
      await safeUpdateOrderWithMetadata(
        supabase,
        orderId,
        {
          fulfillment_status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
        },
        {
          total_documents: postValidation.actualCount,
          expected_documents: postValidation.expectedCount,
          generated_documents: generatedDocsCount,
          validation: 'complete',
          products: fulfillmentProducts,
          add_ons: addOns,
        }
      );

      // Sync case status to 'completed' (idempotent)
      await supabase
        .from('cases')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      return {
        status: 'fulfilled',
        documents: postValidation.actualCount,
        validation: postValidation,
      };
    } else {
      // NOT all documents generated - keep as processing, do NOT mark fulfilled
      console.error(
        `[fulfillment] ❌ FAILED to complete fulfillment for order ${orderId}:\n` +
          `  Incomplete: ${postValidation.actualCount}/${postValidation.expectedCount} documents\n` +
          `  Missing: ${postValidation.missingKeys.join(', ')}`
      );

      await safeUpdateOrderWithMetadata(
        supabase,
        orderId,
        { fulfillment_status: 'failed' },
        {
          total_documents: postValidation.actualCount,
          expected_documents: postValidation.expectedCount,
          generated_documents: generatedDocsCount,
          validation: 'incomplete',
          missing_keys: postValidation.missingKeys,
          last_attempt: new Date().toISOString(),
          products: fulfillmentProducts,
          add_ons: addOns,
        }
      );

      return {
        status: 'incomplete',
        documents: postValidation.actualCount,
        validation: postValidation,
        error: `Incomplete fulfillment: ${postValidation.actualCount}/${postValidation.expectedCount} documents. Missing: ${postValidation.missingKeys.join(', ')}`,
      };
    }
  } catch (error: any) {
    // ==========================================================================
    // SECTION 21 VALIDATION ERROR HANDLING (REQUIRES_ACTION)
    // If this is a Section 21 validation error (statusCode 422 with section21Validation),
    // mark as 'requires_action' instead of failed. This allows users to fix the issue
    // and resume fulfillment without losing their payment.
    // ==========================================================================
    const isSection21ValidationError =
      error.statusCode === 422 &&
      error.section21Validation &&
      (productType === 'notice_only' || productType === 'complete_pack');

    if (isSection21ValidationError) {
      console.warn(
        `[fulfillment] Section 21 validation blocked for order ${orderId}. ` +
        `Marking as REQUIRES_ACTION for user to fix.`
      );

      // Map Section 21 validation blockers to required actions
      const blockers = error.section21Validation?.blockers || [];
      const requiredActions: RequiredAction[] = blockers.map((b: any) => ({
        fieldKey: b.evidenceFields?.[0] || b.code,
        label: b.code.replace('S21_', '').replace(/_/g, ' '),
        errorCode: b.code,
        helpText: b.message,
      }));

      const blockedDocuments: BlockedDocument[] = [
        {
          documentType: 'section21_notice',
          documentTitle: 'Section 21 Notice - Form 6A',
          blockingCodes: blockers.map((b: any) => b.code),
          reason: error.section21Validation?.summary || error.message,
        },
      ];

      // Check how many documents were generated before the error
      const postErrorValidation = await validateFulfillmentCompleteness(
        supabase,
        caseId,
        productType,
        jurisdiction,
        route,
        hasArrears
      );

      await safeUpdateOrderWithMetadata(
        supabase,
        orderId,
        { fulfillment_status: 'requires_action' },
        {
          total_documents: postErrorValidation.actualCount,
          expected_documents: postErrorValidation.expectedCount,
          generated_documents: generatedDocsCount,
          validation: 'requires_action',
          section21_blockers: blockers.map((b: any) => b.code),
          required_actions: requiredActions,
          blocked_documents: blockedDocuments,
          last_attempt: new Date().toISOString(),
          error: error.message,
        }
      );

      // Update case status to indicate action required
      await supabase
        .from('cases')
        .update({
          status: 'action_required',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      return {
        status: 'requires_action',
        documents: postErrorValidation.actualCount,
        validation: postErrorValidation,
        blockedDocuments,
        requiredActions,
        error: error.section21Validation?.summary || error.message,
      };
    }

    // Generation failed - mark as processing (not failed) so it can be retried
    console.error(`[fulfillment] Generation error for order ${orderId}:`, error);

    await safeUpdateOrderWithMetadata(
      supabase,
      orderId,
      { fulfillment_status: 'processing' },
      {
        error: error.message,
        last_attempt: new Date().toISOString(),
      }
    );

    throw error;
  }
}
