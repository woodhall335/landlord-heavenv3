import { createAdminClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  mapCaseFactsToMoneyClaimCase,
  mapCaseFactsToScotlandMoneyClaimCase,
} from '@/lib/documents/money-claim-wizard-mapper';
import { getPackContents } from '@/lib/products';
import type { PackItem } from '@/lib/products';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';

// =============================================================================
// TYPES
// =============================================================================

interface FulfillOrderInput {
  orderId: string;
  caseId: string;
  productType: string;
  userId?: string | null;
}

interface FulfillmentValidation {
  isComplete: boolean;
  expectedCount: number;
  actualCount: number;
  expectedKeys: string[];
  actualTitles: string[];
  missingKeys: string[];
}

interface FulfillmentResult {
  status: 'fulfilled' | 'already_fulfilled' | 'incomplete' | 'processing';
  documents: number;
  validation?: FulfillmentValidation;
  error?: string;
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
      missingKeys: expectedKeys,
    };
  }

  const actualTitles = (actualDocs || []).map((d) => d.document_title);
  const actualKeys = (actualDocs || []).map((d) => d.document_type);
  const actualCount = actualDocs?.length || 0;

  // Exact key-based completeness check: every expected key must exist in actual document_type values
  const missingKeys = expectedKeys.filter((key) => !actualKeys.includes(key));
  const isComplete = missingKeys.length === 0;

  return {
    isComplete,
    expectedCount: expectedKeys.length,
    actualCount,
    expectedKeys,
    actualTitles,
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
        `  Expected: ${validation.expectedKeys.join(', ')}\n` +
        `  Actual: ${validation.actualTitles.join(', ')}`
    );
  }
}

// =============================================================================
// MAIN FULFILLMENT FUNCTION
// =============================================================================

export async function fulfillOrder({
  orderId,
  caseId,
  productType,
  userId,
}: FulfillOrderInput): Promise<FulfillmentResult> {
  const supabase = createAdminClient();

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

  // ===========================================================================
  // CANONICAL JURISDICTION RESOLUTION
  // Matches behavior in /api/wizard/analyze to handle Wales cases where DB
  // jurisdiction is stored as "england" but property.country is "wales".
  // This ensures Wales-specific validation and ground_codes derivation runs.
  // ===========================================================================
  const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

  let canonicalJurisdiction =
    normalizeJurisdiction((caseData as any).jurisdiction) ||
    normalizeJurisdiction((caseData as any).property_location) ||
    normalizeJurisdiction(caseFacts.property?.country as string | null);

  // Critical fix: If jurisdiction is 'england' but property.country is 'wales',
  // treat as Wales. This matches /api/wizard/analyze behavior.
  if (canonicalJurisdiction === 'england' && caseFacts.property?.country === 'wales') {
    console.log('[fulfillment] Correcting jurisdiction: DB has "england" but property.country is "wales"');
    canonicalJurisdiction = 'wales';
  }

  // Fallback to the raw DB value if normalization fails (shouldn't happen)
  const jurisdiction = canonicalJurisdiction || (caseData as any).jurisdiction || 'england';

  // ==========================================================================
  // VALIDATION: Check if fulfillment is already complete
  // This replaces the old "any doc exists" check with proper validation
  // ==========================================================================
  const preValidation = await validateFulfillmentCompleteness(
    supabase,
    caseId,
    productType,
    jurisdiction,
    route,
    hasArrears
  );

  if (preValidation.isComplete && preValidation.actualCount > 0) {
    // All expected documents exist - mark as fulfilled and return
    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        metadata: {
          total_documents: preValidation.actualCount,
          expected_documents: preValidation.expectedCount,
          validation: 'complete',
        },
      })
      .eq('id', orderId);

    // Sync case status to 'completed' (idempotent)
    await supabase
      .from('cases')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    logFulfillmentValidation(orderId, caseId, productType, preValidation);

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

  try {
    if (productType === 'notice_only' || productType === 'complete_pack') {
      const { generateNoticeOnlyPack, generateCompleteEvictionPack } = await import(
        '@/lib/documents/eviction-pack-generator'
      );

      const evictionPack =
        productType === 'notice_only'
          ? await generateNoticeOnlyPack(wizardFacts)
          : await generateCompleteEvictionPack(wizardFacts);

      for (const doc of evictionPack.documents) {
        if (!doc.pdf) continue;

        const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, doc.pdf, {
            contentType: 'application/pdf',
            upsert: true, // Allow overwrite for regeneration
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Upsert document record using canonical document_type key
        const { error: insertError } = await supabase.from('documents').upsert(
          {
            user_id: resolvedUserId,
            case_id: caseId,
            document_type: doc.document_type,
            document_title: doc.title,
            jurisdiction,
            html_content: doc.html || null,
            pdf_url: publicUrlData.publicUrl,
            is_preview: false,
            qa_passed: true,
            metadata: { description: doc.description, pack_type: productType, order_id: orderId },
          },
          { onConflict: 'case_id,document_type,is_preview' }
        );

        if (insertError) {
          console.error(`[fulfillment] Failed to insert document "${doc.title}":`, insertError);
        } else {
          generatedDocsCount++;
        }
      }
    } else if (productType === 'money_claim') {
      const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

      const pack = await generateMoneyClaimPack({
        ...mapCaseFactsToMoneyClaimCase(caseFacts),
        case_id: caseId,
      });

      for (const doc of pack.documents) {
        if (!doc.pdf) continue;

        const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, doc.pdf, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from('documents').upsert(
          {
            user_id: resolvedUserId,
            case_id: caseId,
            document_type: doc.document_type,
            document_title: doc.title,
            jurisdiction,
            html_content: doc.html || null,
            pdf_url: publicUrlData.publicUrl,
            is_preview: false,
            qa_passed: true,
            metadata: { description: doc.description, pack_type: productType, order_id: orderId },
          },
          { onConflict: 'case_id,document_type,is_preview' }
        );

        if (insertError) {
          console.error(`[fulfillment] Failed to insert document "${doc.title}":`, insertError);
        } else {
          generatedDocsCount++;
        }
      }
    } else if (productType === 'sc_money_claim') {
      const { generateScotlandMoneyClaim } = await import(
        '@/lib/documents/scotland-money-claim-pack-generator'
      );

      const pack = await generateScotlandMoneyClaim({
        ...mapCaseFactsToScotlandMoneyClaimCase(caseFacts),
        case_id: caseId,
      });

      for (const doc of pack.documents) {
        if (!doc.pdf) continue;

        const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, doc.pdf, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from('documents').upsert(
          {
            user_id: resolvedUserId,
            case_id: caseId,
            document_type: doc.document_type,
            document_title: doc.title,
            jurisdiction,
            html_content: doc.html || null,
            pdf_url: publicUrlData.publicUrl,
            is_preview: false,
            qa_passed: true,
            metadata: { description: doc.description, pack_type: productType, order_id: orderId },
          },
          { onConflict: 'case_id,document_type,is_preview' }
        );

        if (insertError) {
          console.error(`[fulfillment] Failed to insert document "${doc.title}":`, insertError);
        } else {
          generatedDocsCount++;
        }
      }
    } else if (productType === 'ast_standard' || productType === 'ast_premium') {
      const { generateStandardASTDocuments, generatePremiumASTDocuments } = await import(
        '@/lib/documents/ast-generator'
      );

      const astPack =
        productType === 'ast_standard'
          ? await generateStandardASTDocuments(wizardFacts, caseId)
          : await generatePremiumASTDocuments(wizardFacts, caseId);

      for (const doc of astPack.documents) {
        if (!doc.pdf) continue;

        const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, doc.pdf, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from('documents').upsert(
          {
            user_id: resolvedUserId,
            case_id: caseId,
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
              tier: astPack.tier,
            },
          },
          { onConflict: 'case_id,document_type,is_preview' }
        );

        if (insertError) {
          console.error(`[fulfillment] Failed to insert document "${doc.title}":`, insertError);
        } else {
          generatedDocsCount++;
        }
      }
    } else {
      throw new Error(`Unsupported product type for fulfillment: ${productType}`);
    }

    // ==========================================================================
    // POST-GENERATION VALIDATION: Verify all expected documents now exist
    // ==========================================================================
    const postValidation = await validateFulfillmentCompleteness(
      supabase,
      caseId,
      productType,
      jurisdiction,
      route,
      hasArrears
    );

    logFulfillmentValidation(orderId, caseId, productType, postValidation);

    if (postValidation.isComplete) {
      // All documents generated successfully - mark as fulfilled
      await supabase
        .from('orders')
        .update({
          fulfillment_status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
          metadata: {
            total_documents: postValidation.actualCount,
            expected_documents: postValidation.expectedCount,
            generated_documents: generatedDocsCount,
            validation: 'complete',
          },
        })
        .eq('id', orderId);

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

      await supabase
        .from('orders')
        .update({
          fulfillment_status: 'processing', // Keep as processing for retry
          metadata: {
            total_documents: postValidation.actualCount,
            expected_documents: postValidation.expectedCount,
            generated_documents: generatedDocsCount,
            validation: 'incomplete',
            missing_keys: postValidation.missingKeys,
            last_attempt: new Date().toISOString(),
          },
        })
        .eq('id', orderId);

      return {
        status: 'incomplete',
        documents: postValidation.actualCount,
        validation: postValidation,
        error: `Incomplete fulfillment: ${postValidation.actualCount}/${postValidation.expectedCount} documents. Missing: ${postValidation.missingKeys.join(', ')}`,
      };
    }
  } catch (error: any) {
    // Generation failed - mark as processing (not failed) so it can be retried
    console.error(`[fulfillment] Generation error for order ${orderId}:`, error);

    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'processing',
        metadata: {
          error: error.message,
          last_attempt: new Date().toISOString(),
        },
      })
      .eq('id', orderId);

    throw error;
  }
}
