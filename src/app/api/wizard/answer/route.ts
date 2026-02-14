/**
 * Wizard API - Submit Answer
 *
 * POST src/api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import {
  loadMQS,
  getNextMQSQuestion,
  isQuestionAnsweredForMQS,
  type ProductType,
  type MasterQuestionSet,
} from '@/lib/wizard/mqs-loader';
import { applyMappedAnswers, setFactPath } from '@/lib/case-facts/mapping';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import type { PersistedSmartReview, PersistedSmartReviewWarning } from '@/lib/case-facts/schema';
import { batchClearDependentFacts } from '@/lib/wizard/normalizeFacts';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { runDecisionEngine, type DecisionInput, type DecisionOutput } from '@/lib/decision-engine';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { getReviewNavigation } from '@/lib/wizard/review-navigation';
import { deriveCanonicalJurisdiction, normalizeJurisdiction } from '@/lib/types/jurisdiction';
import { validateFlow } from '@/lib/validation/validateFlow';
import { filterWizardIssues } from '@/lib/validation/wizardIssueFilter';
import type { Jurisdiction, Product } from '@/lib/jurisdictions/capabilities/matrix';
import {
  runSmartReview,
  isSmartReviewEnabled,
  mapLegacyUploadsToBundle,
  type SmartReviewWarning,
  type EvidenceCategory,
} from '@/lib/evidence';
import { logMutation } from '@/lib/auth/audit-log';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';
import { getCasePaymentStatus } from '@/lib/payments/entitlement';
import {
  getTenancyTierLabelForSku,
  getTenancyTierQuestionId,
  inferTenancySkuFromTierLabel,
  type TenancyJurisdiction,
} from '@/lib/tenancy/product-tier';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// ==============================================================================
// PHASE 1: DEBUG INSTRUMENTATION (behind NOTICE_ONLY_DEBUG=1 env flag)
// ==============================================================================
const NOTICE_ONLY_DEBUG = process.env.NOTICE_ONLY_DEBUG === '1';

function debugLog(context: string, data: Record<string, any>) {
  if (NOTICE_ONLY_DEBUG) {
    console.log(`[NOTICE-ONLY-DEBUG] [/api/wizard/answer] [${context}]`, JSON.stringify(data, null, 2));
  }
}

function debugWarnScalarPathObject(questionId: string, mapsToPath: string, value: unknown) {
  if (NOTICE_ONLY_DEBUG && value !== null && typeof value === 'object' && !Array.isArray(value)) {
    console.error(`[NOTICE-ONLY-DEBUG] [RED FLAG] Attempted to store object at scalar path!`, {
      question_id: questionId,
      maps_to_path: mapsToPath,
      typeof_value: typeof value,
      value_keys: Object.keys(value as object),
    });
  }
}

const answerSchema = z.object({
  case_id: z.string().min(1),
  question_id: z.string(),
  answer: z.any(),
  mode: z.enum(['default', 'edit', 'enhance_only']).optional(),
  include_answered: z.boolean().optional(),
  review_mode: z.boolean().optional(),
  current_question_id: z.string().optional(),
});

const legacyMoneyClaimQuestions: Record<string, Partial<ExtendedWizardQuestion>> = {
  landlord_name: { maps_to: ['landlord_name'], inputType: 'text' },
  tenancy_start_date: { maps_to: ['tenancy_start_date'], inputType: 'date' },
  rent_amount: { maps_to: ['rent_amount'], inputType: 'number' },
  rent_frequency: { maps_to: ['rent_frequency'], inputType: 'text' },
  claim_type: { maps_to: ['basis_of_claim'], inputType: 'multiselect' },
  arrears_total: { maps_to: ['arrears_total'], inputType: 'number' },
  arrears_schedule_upload: { maps_to: ['arrears_items'], inputType: 'group' },
  charge_interest: { maps_to: ['charge_interest'], inputType: 'yes_no' },
  interest_start_date: { maps_to: ['interest_start_date'], inputType: 'date' },
  interest_rate: { maps_to: ['interest_rate'], inputType: 'number' },
  particulars_of_claim: { maps_to: ['particulars_of_claim'], inputType: 'textarea' },
  payment_attempts: { maps_to: ['payment_attempts'], inputType: 'textarea' },
  lba_sent: { maps_to: ['lba_sent'], inputType: 'yes_no' },
  lba_date: { maps_to: ['lba_date'], inputType: 'date' },
  lba_method: { maps_to: ['lba_method'], inputType: 'multiselect' },
  signatory_name: { maps_to: ['signatory_name'], inputType: 'text' },
};

// ============================================================================
// Runtime Validation for Critical WizardFacts Fields
// ============================================================================

/**
 * Validates critical answers using Zod schemas per question ID.
 *
 * IMPORTANT:
 * - We ONLY enforce this for structured MQS flows (tenancy_agreement, money_claim, etc.).
 * - We explicitly SKIP eviction flows, because those questions may reuse IDs
 *   with different shapes (conversational wizard).
 */
function validateCriticalAnswer(
  questionId: string,
  answer: unknown,
  caseType: string,
  jurisdiction: string,
): { ok: true } | { ok: false; errors: string[] } {
  // Do NOT enforce these runtime validations for conversational eviction flows.
  // The MQS + downstream generators already enforce their own constraints.
  if (caseType === 'eviction') {
    return { ok: true };
  }

  try {
    // ------------------------------------------------------------------------
    // Shared tenancy / money-claim validations (caseType !== 'eviction')
    // ------------------------------------------------------------------------

    // Critical field: AST tier (product selection)
    if (questionId === 'ast_tier' && caseType === 'tenancy_agreement') {
      const schema = z.enum(['Standard AST', 'Premium AST'], {
        message: 'AST tier must be "Standard AST" or "Premium AST"',
      });
      schema.parse(answer);
      return { ok: true };
    }

    // Critical field: Tenancy start date (part of tenancy_type_and_dates group)
    // Handles both AST (tenancy_start_date) and Scotland/NI (start_date) field names
    if (questionId === 'tenancy_type_and_dates' && caseType === 'tenancy_agreement') {
      const dateValidation = z
        .string()
        .min(1, 'Tenancy start date is required')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tenancy start date must be in YYYY-MM-DD format');

      const groupSchema = z
        .object({
          tenancy_start_date: dateValidation.optional(),
          start_date: dateValidation.optional(),
        })
        .passthrough() // Allow other fields in the group
        .refine(
          (data) => data.tenancy_start_date || data.start_date,
          'Either tenancy_start_date or start_date is required',
        );

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Rent amount (part of rent_details group)
    if (questionId === 'rent_details' && caseType === 'tenancy_agreement') {
      const groupSchema = z
        .object({
          rent_amount: z.union([
            z.number().positive('Rent amount must be positive'),
            z
              .string()
              .min(1, 'Rent amount is required')
              .refine(
                (val) => !isNaN(Number(val)) && Number(val) > 0,
                'Rent amount must be a positive number',
              ),
          ]),
        })
        .passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Property address line 1 (part of property_address group)
    if (questionId === 'property_address' && caseType === 'tenancy_agreement') {
      const stringSchema = z
        .string()
        .min(1, 'Property address is required')
        .max(500, 'Property address is too long');

      const groupSchema = z
        .object({
          property_address_line1: z
            .string()
            .min(1, 'Property address line 1 is required')
            .max(200, 'Property address line 1 is too long')
            .optional(),
          address_line1: z
            .string()
            .min(1, 'Property address line 1 is required')
            .max(200, 'Property address line 1 is too long')
            .optional(),
        })
        .passthrough(); // Allow other fields in the group

      const parsed = z.union([stringSchema, groupSchema]).parse(answer);

      if (typeof parsed === 'object') {
        if (!parsed.property_address_line1 && !parsed.address_line1) {
          throw new Error('Property address line 1 is required');
        }
      }

      return { ok: true };
    }

    // ========================================================================
    // Scotland-specific validations (only when jurisdiction === 'scotland')
    // ========================================================================

    if (jurisdiction === 'scotland') {
      // Critical field: Scotland landlord registration details
      if (questionId === 'landlord_details') {
        const groupSchema = z
          .object({
            landlord_registration_number: z.union([
              z
                .string()
                .min(1, 'Landlord registration number should not be empty if provided')
                .optional(),
              z.literal('').optional(),
              z.undefined(),
            ]),
            landlord_registration_authority: z.union([
              z
                .string()
                .min(1, 'Registration authority should not be empty if provided')
                .optional(),
              z.literal('').optional(),
              z.undefined(),
            ]),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland tenancy dates (Notice to Leave)
      if (questionId === 'tenancy_dates') {
        const dateSchema = z
          .string()
          .min(1, 'Tenancy start date is required')
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tenancy start date must be in YYYY-MM-DD format');

        dateSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland rent terms (Notice to Leave)
      if (questionId === 'rent_terms') {
        const groupSchema = z
          .object({
            rent_amount: z.union([
              z.number().positive('Rent amount must be positive'),
              z
                .string()
                .min(1, 'Rent amount is required')
                .refine(
                  (val) => !isNaN(Number(val)) && Number(val) > 0,
                  'Rent amount must be a positive number',
                ),
            ]),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland deposit protection (Notice to Leave)
      if (questionId === 'deposit_protection') {
        const groupSchema = z
          .object({
            deposit_amount: z
              .union([
                z.number().nonnegative('Deposit amount must be zero or positive'),
                z
                  .string()
                  .refine(
                    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
                    'Deposit amount must be zero or a positive number',
                  ),
              ])
              .optional(),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland deposit details (PRT Agreement)
      if (questionId === 'deposit_details') {
        const groupSchema = z
          .object({
            deposit_amount: z
              .union([
                z.number().nonnegative('Deposit amount must be zero or positive'),
                z
                  .string()
                  .refine(
                    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
                    'Deposit amount must be zero or a positive number',
                  ),
              ])
              .optional(),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland/NI property details with postcode
      if (questionId === 'property_details') {
        const groupSchema = z
          .object({
            postcode: z
              .union([
                z
                  .string()
                  .min(1, 'Postcode is required')
                  .max(10, 'Postcode is too long'),
                z.undefined(),
              ])
              .optional(),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland notice service dates (Notice to Leave)
      if (questionId === 'notice_service') {
        const groupSchema = z
          .object({
            notice_date: z
              .string()
              .min(1, 'Notice date is required')
              .regex(/^\d{4}-\d{2}-\d{2}$/, 'Notice date must be in YYYY-MM-DD format'),
            notice_expiry: z
              .string()
              .min(1, 'Notice expiry date is required')
              .regex(/^\d{4}-\d{2}-\d{2}$/, 'Notice expiry date must be in YYYY-MM-DD format'),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }

      // Critical field: Scotland arrears amount (Notice to Leave)
      if (questionId === 'arrears_amount') {
        const amountSchema = z.union([
          z.number().nonnegative('Arrears amount must be zero or positive'),
          z
            .string()
            .min(1, 'Arrears amount is required')
            .refine(
              (val) => !isNaN(Number(val)) && Number(val) >= 0,
              'Arrears amount must be zero or a positive number',
            ),
        ]);

        amountSchema.parse(answer);
        return { ok: true };
      }
    }

    // ========================================================================
    // Northern Ireland-specific validations
    // ========================================================================

    if (jurisdiction === 'northern-ireland') {
      // Critical field: NI HMO details with council name
      if (questionId === 'hmo_details') {
        const groupSchema = z
          .object({
            council_name: z.union([
              z
                .string()
                .min(1, 'Council name should not be empty if provided')
                .optional(),
              z.literal('').optional(),
              z.undefined(),
            ]),
          })
          .passthrough(); // Allow other fields in the group

        groupSchema.parse(answer);
        return { ok: true };
      }
    }

    // Not a critical field (or caseType/jurisdiction not targeted) - validation passes
    return { ok: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Validation failed for this answer'],
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function deriveProduct(caseType: string, collectedFacts: Record<string, any>): ProductType {
  const metaProduct = collectedFacts?.__meta?.product as ProductType | undefined;
  if (metaProduct) return metaProduct;
  if (caseType === 'money_claim') return 'money_claim';
  if (caseType === 'tenancy_agreement') return 'tenancy_agreement';
  return 'complete_pack';
}

function getValueAtPath(facts: Record<string, any>, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      const resolvedKey = Number.isInteger(Number(key)) ? Number(key) : key;
      return acc[resolvedKey as keyof typeof acc];
    }, facts);
}

// NOTE: isQuestionAnswered logic is now consolidated in isQuestionAnsweredForMQS
// which is imported from @/lib/wizard/mqs-loader to avoid duplication.
// Local alias for backwards compatibility in this file:
function isQuestionAnswered(question: ExtendedWizardQuestion, facts: Record<string, any>): boolean {
  return isQuestionAnsweredForMQS(question, facts);
}

function computeProgress(mqs: MasterQuestionSet, facts: Record<string, any>): number {
  if (!mqs.questions.length) return 100;

  // Filter to only applicable questions (those without dependencies or with satisfied dependencies)
  const applicableQuestions = mqs.questions.filter((q) => {
    const dependsOn = (q as any).depends_on || (q as any).dependsOn;
    if (!dependsOn?.questionId) return true; // No dependency, always applicable

    // Find the dependent value
    const dependency = mqs.questions.find((dep) => dep.id === dependsOn.questionId);
    let depValue: any;
    if (dependency?.maps_to?.length) {
      depValue = dependency.maps_to
        .map((path) => getValueAtPath(facts, path))
        .find((v) => v !== undefined);
    }
    if (depValue === undefined) {
      depValue = (facts as any)[dependsOn.questionId];
    }

    // Check if dependency is satisfied
    if (Array.isArray(dependsOn.value)) {
      // dependsOn.value is array: check if any match
      if (Array.isArray(depValue)) {
        return depValue.some((val: any) => dependsOn.value.includes(val));
      }
      // User's answer is scalar, check if it's in the dependency array
      return dependsOn.value.includes(depValue);
    }
    // dependsOn.value is scalar
    if (Array.isArray(depValue)) {
      // But user's answer is array (multi-select): check if it includes the scalar value
      return depValue.includes(dependsOn.value);
    }
    return depValue === dependsOn.value;
  });

  if (!applicableQuestions.length) return 100;

  const answeredCount = applicableQuestions.filter((q) => isQuestionAnswered(q, facts)).length;
  return Math.round((answeredCount / applicableQuestions.length) * 100);
}

function normalizeAnswer(question: ExtendedWizardQuestion, answer: any) {
  if (question.inputType === 'yes_no') {
    if (typeof answer === 'string') {
      return answer.toLowerCase().startsWith('y');
    }
    return Boolean(answer);
  }

  return answer;
}

function validateAnswer(question: ExtendedWizardQuestion, answer: any): boolean {
  if (question.validation?.required) {
    if (answer === null || answer === undefined || answer === '') return false;
  }

  if (question.inputType === 'group' && question.fields) {
    return question.fields.every((field) => {
      if (!field.validation?.required) return true;
      const value = (answer || {})[field.id];
      return value !== null && value !== undefined && value !== '';
    });
  }

  return true;
}

function updateDerivedFacts(
  questionId: string,
  jurisdiction: string,
  facts: Record<string, any>,
  value: any,
): Record<string, any> {
  let updatedFacts = { ...facts };

  if (questionId === 'tenancy_type') {
    if (typeof value === 'string' && value.toLowerCase().includes('prt')) {
      updatedFacts = setFactPath(updatedFacts, 'tenancy.tenancy_type', 'prt');
    }
  }

  if (questionId === 'property_details' && jurisdiction) {
    updatedFacts = setFactPath(updatedFacts, 'property.country', jurisdiction);
  }

  if (questionId === 'arrears_total' || questionId === 'arrears_amount') {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isNaN(numericValue)) {
      updatedFacts = setFactPath(
        updatedFacts,
        'issues.rent_arrears.has_arrears',
        numericValue > 0,
      );
    }
  }

  if (questionId === 'rent_arrears') {
    updatedFacts = setFactPath(
      updatedFacts,
      'issues.rent_arrears.has_arrears',
      Boolean(value),
    );
  }

  return updatedFacts;
}

// ============================================================================
// Main Handler
// ============================================================================

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/answer', writesUsingAdmin: true });
    const body = await request.json();
    const parsedBody = answerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedBody.error.format() },
        { status: 400 },
      );
    }

    const { case_id, question_id, answer, mode, include_answered, review_mode, current_question_id } =
      parsedBody.data;
    const isEnhanceOnly = mode === 'enhance_only';
    const isReviewMode =
      !isEnhanceOnly && (mode === 'edit' || include_answered === true || review_mode === true);

    // Admin client bypasses RLS - used for case operations for anonymous users
    const adminSupabase = createSupabaseAdminClient();

    // ---------------------------------------
    // 1. Load case - use admin client to support anonymous users
    // ---------------------------------------
    const { data, error: fetchError } = await adminSupabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single();

    // Properly classify errors: 404 vs 5xx vs auth errors
    if (fetchError || !data) {
      const { handleCaseFetchError } = await import('@/lib/api/error-handling');
      const errorResponse = handleCaseFetchError(
        fetchError,
        data,
        'wizard/answer',
        case_id
      );
      if (errorResponse) {
        return errorResponse;
      }
    }

    // Check edit window - block if case has paid order with expired window
    const mutationCheck = await checkMutationAllowed(case_id);
    if (!mutationCheck.allowed) {
      return mutationCheck.errorResponse;
    }

    const caseRow = data as {
      id: string;
      jurisdiction: string;
      case_type: string;
      collected_facts: any;
    };

    const collectedFacts = (caseRow.collected_facts as Record<string, any>) || {};
    let canonicalJurisdiction =
      deriveCanonicalJurisdiction(caseRow.jurisdiction, collectedFacts) ||
      normalizeJurisdiction(caseRow.jurisdiction);

    if (!canonicalJurisdiction && caseRow.case_type === 'eviction') {
      canonicalJurisdiction = 'england';
    }

    if (!canonicalJurisdiction) {
      console.error('[JURISDICTION] Unable to derive canonical jurisdiction', {
        jurisdiction: caseRow.jurisdiction,
        facts: collectedFacts,
      });
      return NextResponse.json(
        {
          code: 'INVALID_JURISDICTION',
          error: 'INVALID_JURISDICTION',
          user_message: 'Jurisdiction must be one of england, wales, scotland, or northern-ireland.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // ---------------------------------------
    // 1a. Northern Ireland gating
    // ---------------------------------------
    if (
      canonicalJurisdiction === 'northern-ireland' &&
      caseRow.case_type !== 'tenancy_agreement'
    ) {
      return NextResponse.json(
        {
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          user_message:
            'Northern Ireland: tenancy agreements only (eviction notices planned). England & Wales and Scotland support evictions (notices and court packs) and money claims where available.',
          supported: {
            'northern-ireland': ['tenancy_agreement'],
            england: [
              'notice_only',
              'complete_pack',
              'money_claim',
              'tenancy_agreement',
            ],
            wales: [
              'notice_only',
              'complete_pack',
              'money_claim',
              'tenancy_agreement',
            ],
            scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
          },
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // ---------------------------------------
    // 1b. Runtime validation for critical WizardFacts fields
    //      (only for structured flows; eviction is skipped)
    // ---------------------------------------
    const criticalValidation = validateCriticalAnswer(
      question_id,
      answer,
      caseRow.case_type,
      canonicalJurisdiction,
    );

    if (!criticalValidation.ok) {
      return NextResponse.json(
        {
          code: 'ANSWER_VALIDATION_FAILED',
          error: 'Invalid answer for this question',
          details: criticalValidation.errors,
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    const isEnglandOrWales = canonicalJurisdiction === 'england' || canonicalJurisdiction === 'wales';
    const paymentStatus = await getCasePaymentStatus(case_id);
    const entitlementProducts = paymentStatus.paidProducts;
    const lockedTenancySku = entitlementProducts.includes('ast_premium')
      ? 'ast_premium'
      : entitlementProducts.includes('ast_standard')
      ? 'ast_standard'
      : null;
    const purchasedProduct =
      paymentStatus.latestOrder?.product_type || lockedTenancySku || null;

    // ---------------------------------------
    // 2. Load MQS and question
    // ---------------------------------------
    const product = deriveProduct(caseRow.case_type, collectedFacts);
    const mqs = loadMQS(product, canonicalJurisdiction);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 },
      );
    }

    let question = mqs.questions.find((q) => q.id === question_id);

    if (!question && caseRow.case_type === 'money_claim') {
      const legacy = legacyMoneyClaimQuestions[question_id];
      if (legacy) {
        question = {
          id: question_id,
          section: 'Legacy',
          question: question_id,
          inputType: legacy.inputType || 'text',
          maps_to: legacy.maps_to || [],
          validation: legacy.validation || {},
          fields: legacy.fields as any,
        } as ExtendedWizardQuestion;
      }
    }

    if (!question && caseRow.case_type === 'eviction') {
      question = {
        id: question_id,
        section: 'Legacy',
        question: question_id,
        inputType: 'text',
        maps_to: [question_id],
        validation: {},
      } as ExtendedWizardQuestion;
    }

    if (!question) {
      return NextResponse.json({ error: 'Unknown question_id' }, { status: 400 });
    }

    const normalizedAnswer = normalizeAnswer(question, answer);

    if (caseRow.case_type === 'tenancy_agreement' && lockedTenancySku) {
      const tierQuestionId = getTenancyTierQuestionId(canonicalJurisdiction as TenancyJurisdiction);
      if (question_id === tierQuestionId) {
        const requestedSku = inferTenancySkuFromTierLabel(String(normalizedAnswer));
        if (requestedSku && requestedSku !== lockedTenancySku) {
          const isUpgradeAttempt =
            requestedSku === 'ast_premium' && !entitlementProducts.includes('ast_premium');
          return NextResponse.json(
            {
              code: isUpgradeAttempt ? 'UPGRADE_REQUIRED' : 'PRODUCT_LOCKED',
              error: isUpgradeAttempt ? 'UPGRADE_REQUIRED' : 'PRODUCT_LOCKED',
              message: isUpgradeAttempt
                ? 'Upgrade required to access Premium tenancy agreement features.'
                : 'This case is locked to the purchased product.',
              purchased_product: purchasedProduct,
              requested_product: requestedSku,
              entitlements: entitlementProducts,
            },
            { status: isUpgradeAttempt ? 402 : 409 },
          );
        }
      }
    }

    // For conversational eviction flows, skip strict MQS per-question validation.
    // The eviction wizard uses a looser, AI-driven flow and may send simple strings
    // to questions that are modelled as groups in the MQS.
    if (
      caseRow.case_type !== 'eviction' &&
      caseRow.case_type !== 'money_claim' &&
      !validateAnswer(question, normalizedAnswer)
    ) {
      return NextResponse.json(
        {
          code: 'ANSWER_VALIDATION_FAILED',
          error: 'Answer failed validation',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    const rawAnswerText =
      typeof normalizedAnswer === 'string'
        ? normalizedAnswer
        : JSON.stringify(normalizedAnswer);

    // ========================================================================
    // ENHANCE-ONLY MODE: return Ask Heaven suggestions without side effects
    // ========================================================================
    if (isEnhanceOnly) {
      let decisionContext: DecisionOutput | undefined = undefined;
      try {
        if (
          caseRow.case_type === 'eviction' &&
          collectedFacts &&
          Object.keys(collectedFacts).length > 5
        ) {
          const caseFacts = wizardFactsToCaseFacts(collectedFacts);

          const decisionInput: DecisionInput = {
            jurisdiction: caseRow.jurisdiction as any,
            product: product as any,
            case_type: 'eviction',
            facts: caseFacts,
          };

          decisionContext = runDecisionEngine(decisionInput);
        }
      } catch (decisionErr) {
        console.warn('Decision engine failed in answer route (enhance_only):', decisionErr);
        // Continue without decision context
      }

      let enhanced: Awaited<ReturnType<typeof enhanceAnswer>> | null = null;
      try {
        enhanced = await enhanceAnswer({
          question,
          rawAnswer: rawAnswerText,
          jurisdiction: caseRow.jurisdiction,
          product,
          caseType: caseRow.case_type,
          decisionContext,
          wizardFacts: collectedFacts,
        });
      } catch (enhErr) {
        console.error('enhanceAnswer failed in enhance_only mode:', enhErr);
        enhanced = null;
      }

      return NextResponse.json({
        case_id,
        question_id,
        answer_saved: false,
        ask_heaven: enhanced
          ? {
              suggested_wording: enhanced.suggested_wording,
              missing_information: enhanced.missing_information,
              evidence_suggestions: enhanced.evidence_suggestions,
              consistency_flags: enhanced.consistency_flags,
            }
          : null,
        suggested_wording: enhanced?.suggested_wording ?? null,
        missing_information: enhanced?.missing_information ?? [],
        evidence_suggestions: enhanced?.evidence_suggestions ?? [],
        enhanced_answer: enhanced
          ? {
              raw: rawAnswerText,
              suggested: enhanced.suggested_wording,
              missing_information: enhanced.missing_information,
              evidence_suggestions: enhanced.evidence_suggestions,
            }
          : undefined,
      });
    }


    // ---------------------------------------
    // 3. Merge into WizardFacts (flat DB format)
    // ---------------------------------------
    // Use admin client to support anonymous users
    const currentFacts = await getOrCreateWizardFacts(adminSupabase, case_id);

    // PHASE 1: Debug instrumentation - log incoming answer
    debugLog('Incoming', {
      case_id,
      question_id,
      answer_payload_keys: answer && typeof answer === 'object' ? Object.keys(answer) : ['primitive'],
      maps_to_paths: question.maps_to || [],
    });

    // Check for object pollution at scalar paths BEFORE applying
    if (question.maps_to && question.maps_to.length > 0 && normalizedAnswer && typeof normalizedAnswer === 'object') {
      for (const path of question.maps_to) {
        const key = path.split('.').pop();
        if (key && Object.prototype.hasOwnProperty.call(normalizedAnswer as object, key)) {
          const valueForPath = (normalizedAnswer as Record<string, unknown>)[key];
          debugWarnScalarPathObject(question_id, path, valueForPath);
        }
      }
    }

    let mergedFacts = applyMappedAnswers(currentFacts, question.maps_to, normalizedAnswer);

    if (!question.maps_to || question.maps_to.length === 0) {
      mergedFacts = setFactPath(mergedFacts, question_id, normalizedAnswer);
    }

    // ====================================================================================
    // SPECIAL HANDLING: ground_particulars is a structured textarea that returns an object
    // ====================================================================================
    // The normal mapping code skips objects to prevent "object pollution", but
    // ground_particulars specifically NEEDS to save its structured object (shared_arrears,
    // ground_8, ground_10, etc.) to the facts. Without this, the answer is lost and the
    // wizard returns the same question indefinitely.
    if (question_id === 'ground_particulars' && normalizedAnswer && typeof normalizedAnswer === 'object') {
      // Save the entire structured object directly to the mapped paths
      for (const mappedPath of (question.maps_to || ['ground_particulars'])) {
        mergedFacts = setFactPath(mergedFacts, mappedPath, normalizedAnswer);
      }
      console.log('[WIZARD] Saved ground_particulars structured object:', {
        paths: question.maps_to || ['ground_particulars'],
        keys: Object.keys(normalizedAnswer as object),
      });
    }

    // ALSO save answers under their field IDs for reliable lookup
    // This ensures values are accessible whether looked up by maps_to path or field ID
    // Critical for: deposit_protected_scheme, gas_safety_certificate, recent_repair_complaints_s21, etc.
    if (normalizedAnswer && typeof normalizedAnswer === 'object' && !Array.isArray(normalizedAnswer)) {
      // Group question - save each field under its field ID AND its maps_to path
      // Build a map of field ID -> maps_to for this question's fields
      const fieldMapsTo: Record<string, string[]> = {};
      if (question.fields && Array.isArray(question.fields)) {
        for (const field of question.fields) {
          if (field.id && field.maps_to) {
            // Handle both string and array formats for maps_to
            const mapsToArray = Array.isArray(field.maps_to) ? field.maps_to : [field.maps_to];
            fieldMapsTo[field.id] = mapsToArray.filter(Boolean);
          }
        }
      }

      for (const [fieldId, fieldValue] of Object.entries(normalizedAnswer as Record<string, unknown>)) {
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue !== 'object') {
          // Save under field ID
          mergedFacts = setFactPath(mergedFacts, fieldId, fieldValue);

          // Also save under field-level maps_to paths (if different from field ID)
          const mapsToForField = fieldMapsTo[fieldId] || [];
          for (const mapsToPath of mapsToForField) {
            if (mapsToPath && mapsToPath !== fieldId) {
              mergedFacts = setFactPath(mergedFacts, mapsToPath, fieldValue);
            }
          }
        }
      }
    } else if (normalizedAnswer !== undefined && normalizedAnswer !== null) {
      // Single question (yes_no, select, etc.) - save under question_id
      // This ensures is_fixed_term, deposit_taken, has_gas_appliances etc. are always saved
      mergedFacts = setFactPath(mergedFacts, question_id, normalizedAnswer);
    }

    mergedFacts = updateDerivedFacts(
      question_id,
      caseRow.jurisdiction,
      mergedFacts,
      normalizedAnswer,
    );

    // PHASE 1: Debug instrumentation - log facts diff
    if (NOTICE_ONLY_DEBUG) {
      const touchedKeys = question.maps_to?.length
        ? question.maps_to.map(p => p.split('.').pop()).filter(Boolean)
        : [question_id];
      const factsDiff: Record<string, { before: any; after: any }> = {};
      for (const key of touchedKeys) {
        if (key) {
          factsDiff[key] = {
            before: currentFacts[key],
            after: mergedFacts[key],
          };
        }
      }
      debugLog('FactsDiff', { touched_keys: touchedKeys, diff: factsDiff });
    }

    // ============================================================================
    // CLEAR DEPENDENT FACTS: When a controlling fact changes to a value that
    // makes dependent facts irrelevant, remove them to avoid stale/orphan data.
    // This is critical for conditional visibility - e.g., when deposit_protected_scheme
    // changes to false, prescribed_info_given should be cleared.
    // ============================================================================
    {
      const factsToTrack: Record<string, any> = {};

      // Track the question ID itself (for questions without maps_to)
      factsToTrack[question_id] = normalizedAnswer;

      // Track all mapped paths (for questions with maps_to)
      if (question.maps_to && question.maps_to.length > 0) {
        for (const mappedPath of question.maps_to) {
          // For simple paths (no dots), use the mapped path directly
          // For nested paths, use the first segment
          const factKey = mappedPath.includes('.') ? mappedPath.split('.')[0] : mappedPath;
          factsToTrack[factKey] = normalizedAnswer;
        }
      }

      // Clear any dependent facts based on the changes
      mergedFacts = batchClearDependentFacts(mergedFacts, factsToTrack);
    }

    // ============================================================================
    // UNIFIED VALIDATION VIA REQUIREMENTS ENGINE (WIZARD STAGE)
    // ============================================================================
    // Wizard stage should warn only, not block (prevents late surprises)
    const selectedRoute = mergedFacts.selected_notice_route ||
                          mergedFacts.route_recommendation?.recommended_route ||
                          mergedFacts.selected_route ||
                          (caseRow.case_type === 'eviction' ? 'section_8' : product);

    console.log('[WIZARD] Running unified validation via validateFlow');
    const flowValidation = validateFlow({
      jurisdiction: canonicalJurisdiction as any,
      product: product as any,
      route: selectedRoute,
      stage: 'wizard',
      facts: mergedFacts,
      caseId: case_id,
    });

    // Wizard stage warnings (do NOT block progression)
    const complianceWarnings = [
      ...flowValidation.warnings,
      ...flowValidation.blocking_issues, // Convert blocks to warnings at wizard stage
    ].map(issue => ({
      code: issue.code,
      user_message: issue.user_fix_hint || 'Missing information',
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      alternate_question_ids: issue.alternate_question_ids,
      user_fix_hint: issue.user_fix_hint,
    }));

    // ============================================================================
    // PREVIEW-STAGE VALIDATION FOR ALL MODES (INLINE WARNINGS)
    // ============================================================================
    // Always run preview-stage validation to surface blocking issues and warnings
    // immediately after each answer - not just at preview regeneration time.
    // This enables inline per-step warnings across ALL notice-only wizards.
    //
    // Key UX rules:
    // 1. Never block Next/Continue - only warn early and persistently
    // 2. Never show "missing future fields" as blockers during the wizard
    // 3. Only show issues CAUSED BY the user's saved answers (e.g., deposit_protected=false)
    // 4. Preview generation remains the only hard block
    let previewBlockingIssues: Array<{
      code: string;
      user_message: string;
      fields: string[];
      affected_question_id?: string;
      alternate_question_ids?: string[];
      user_fix_hint?: string;
      severity: 'blocking';
      legal_reason?: string;
      friendlyAction?: string;
      friendlyQuestionLabel?: string;
    }> = [];
    let previewWarnings: Array<{
      code: string;
      user_message: string;
      fields: string[];
      affected_question_id?: string;
      alternate_question_ids?: string[];
      user_fix_hint?: string;
      severity: 'warning';
      legal_reason?: string;
      friendlyAction?: string;
      friendlyQuestionLabel?: string;
    }> = [];

    // Only run preview validation for notice-only products (eviction notices)
    // This covers Section 21, Section 8, Wales/Scotland variants, etc.
    const isNoticeOnlyFlow = product === 'notice_only' ||
                              product === 'complete_pack' ||
                              caseRow.case_type === 'eviction';

    if (isNoticeOnlyFlow) {
      console.log('[WIZARD] Running preview-stage validation for inline warnings');
      const previewValidation = validateFlow({
        jurisdiction: canonicalJurisdiction as any,
        product: product as any,
        route: selectedRoute,
        stage: 'preview',
        facts: mergedFacts,
        caseId: case_id,
      });

      // ============================================================================
      // WIZARD CONTEXT FILTERING: Filter out "missing future fields" issues
      // ============================================================================
      // Only show issues that are CAUSED BY the user's actual answers, not issues
      // for questions the user hasn't reached yet. This prevents the confusing
      // "tenant_full_name missing" blocker appearing before the user reaches that step.
      const wizardFilterContext = {
        jurisdiction: canonicalJurisdiction as Jurisdiction,
        product: product as Product,
        route: selectedRoute,
        facts: mergedFacts,
      };

      // Filter blocking issues - only show issues caused by actual answers
      const filteredBlockingIssues = filterWizardIssues(
        previewValidation.blocking_issues,
        wizardFilterContext
      );

      // Filter warning issues
      const filteredWarnings = filterWizardIssues(
        previewValidation.warnings,
        wizardFilterContext
      );

      // Transform to API response format with friendly labels
      previewBlockingIssues = filteredBlockingIssues.map(issue => ({
        code: issue.code,
        user_message: issue.friendlyAction || issue.user_fix_hint || 'Missing information',
        fields: issue.fields,
        affected_question_id: issue.affected_question_id,
        alternate_question_ids: issue.alternate_question_ids,
        user_fix_hint: issue.friendlyAction || issue.user_fix_hint,
        severity: 'blocking' as const,
        legal_reason: issue.legalReason || issue.legal_basis,
        friendlyAction: issue.friendlyAction,
        friendlyQuestionLabel: issue.friendlyQuestionLabel,
      }));

      previewWarnings = filteredWarnings.map(issue => ({
        code: issue.code,
        user_message: issue.friendlyAction || issue.user_fix_hint || 'Information needs attention',
        fields: issue.fields,
        affected_question_id: issue.affected_question_id,
        alternate_question_ids: issue.alternate_question_ids,
        user_fix_hint: issue.friendlyAction || issue.user_fix_hint,
        severity: 'warning' as const,
        legal_reason: issue.legalReason || issue.legal_basis,
        friendlyAction: issue.friendlyAction,
        friendlyQuestionLabel: issue.friendlyQuestionLabel,
      }));

      const rawCounts = {
        blocking: previewValidation.blocking_issues.length,
        warnings: previewValidation.warnings.length,
      };
      const filteredCounts = {
        blocking: previewBlockingIssues.length,
        warnings: previewWarnings.length,
      };

      console.log(`[WIZARD] Preview validation (filtered for wizard context): ${filteredCounts.blocking} blocking (was ${rawCounts.blocking}), ${filteredCounts.warnings} warnings (was ${rawCounts.warnings})`);
    }

    // ============================================================================
    // SMART GUIDANCE: Initialize response data container
    // ============================================================================
    const responseData: any = {};

    // ============================================================================
    // SMART GUIDANCE: ROUTE RECOMMENDATION (after deposit_and_compliance)
    // ============================================================================
    // Phase 2.1: Route Recommendation with UI Display Data
    // Triggered after deposit_and_compliance question in Notice Only (England & Wales)
    if (
      product === 'notice_only' &&
      isEnglandOrWales &&
      question_id === 'deposit_and_compliance'
    ) {
      try {
        console.log('[SMART-GUIDANCE] Running route recommendation after deposit_and_compliance');

        // Run decision engine to determine route eligibility
        const caseFacts = wizardFactsToCaseFacts(mergedFacts);
        const decisionInput: DecisionInput = {
          jurisdiction: canonicalJurisdiction,
          product: 'notice_only',
          case_type: 'eviction',
          facts: caseFacts,
        };
        const decision = runDecisionEngine(decisionInput);

        // Build route recommendation for UI display
        const recommendedRoute = decision.recommended_routes[0] || 'section_8';
        const route_recommendation = {
          recommended_route: recommendedRoute,
          reasoning: decision.route_explanations?.[recommendedRoute as keyof typeof decision.route_explanations] ||
                     'Based on your compliance status, this is the most suitable route.',
          blocked_routes: decision.blocked_routes,
          // CRITICAL FIX: Store ALL blocking issues (unfiltered) for route comparison,
          // but they should only be shown for their specific routes, not for all routes
          blocking_issues: decision.blocking_issues
            .filter(b => b.severity === 'blocking')
            .map(b => ({
              route: b.route,
              issue: b.issue,
              description: b.description,
              action_required: b.action_required,
              legal_basis: b.legal_basis || '',
            })),
          warnings: decision.warnings || [],
          allowed_routes: decision.allowed_routes,
          recommended_routes_all: decision.recommended_routes,
        };

        // Check if user explicitly selected a route via eviction_route question
        const userExplicitRoute = mergedFacts.eviction_route || mergedFacts.selected_notice_route;
        let selected_notice_route: string;

        if (userExplicitRoute && !route_recommendation.blocked_routes.includes(userExplicitRoute)) {
          // User's explicit selection is valid (not blocked) - keep it
          selected_notice_route = userExplicitRoute;
          console.log(`[SMART-GUIDANCE] Keeping user's explicit route selection: ${userExplicitRoute}`);
        } else if (userExplicitRoute && route_recommendation.blocked_routes.includes(userExplicitRoute)) {
          // User's selection is blocked - use decision engine's recommendation
          selected_notice_route = route_recommendation.recommended_route;
          console.log(`[SMART-GUIDANCE] User selected ${userExplicitRoute} but it's blocked - auto-routing to: ${selected_notice_route}`);
        } else {
          // No explicit user selection - use decision engine recommendation
          selected_notice_route = route_recommendation.recommended_route;
          console.log(`[SMART-GUIDANCE] No explicit user selection - using recommendation: ${selected_notice_route}`);
        }

        // Persist route selection in wizard facts
        mergedFacts = setFactPath(mergedFacts, 'selected_notice_route', selected_notice_route);
        mergedFacts = setFactPath(mergedFacts, 'route_recommendation', route_recommendation);

        // Return recommendation to frontend for display
        responseData.route_recommendation = route_recommendation;

        console.log(`[SMART-GUIDANCE] Final route: ${selected_notice_route}`, {
          userExplicitRoute,
          blocked: route_recommendation.blocked_routes,
          warnings: route_recommendation.warnings.length,
        });
      } catch (routeErr) {
        console.error('[SMART-GUIDANCE] Route recommendation failed:', routeErr);
        // Non-fatal - user can still proceed
      }
    }

    // ============================================================================
    // SMART GUIDANCE: GROUND RECOMMENDATIONS (after arrears_summary)
    // ============================================================================
    // Phase 2.2: Ground Recommendations for Section 8
    // Triggered after arrears_summary question in Notice Only (England & Wales)
    if (
      product === 'notice_only' &&
      isEnglandOrWales &&
      question_id === 'arrears_summary'
    ) {
      try {
        console.log('[SMART-GUIDANCE] Running ground recommendations after arrears_summary');

        const caseFacts = wizardFactsToCaseFacts(mergedFacts);
        const decisionInput: DecisionInput = {
          jurisdiction: canonicalJurisdiction,
          product: 'notice_only',
          case_type: 'eviction',
          facts: caseFacts,
        };
        const decision = runDecisionEngine(decisionInput);

        // Format ground recommendations for frontend
        const ground_recommendations = decision.recommended_grounds?.map(g => ({
          code: g.code || g.ground_number,
          title: g.title || g.ground_title,
          type: g.mandatory ? 'mandatory' : 'discretionary',
          notice_period_days: g.notice_period_days,
          success_probability: g.success_probability || 'medium',
          reasoning: g.reasoning || g.explanation,
          required_evidence: g.required_evidence || [],
          legal_basis: g.legal_basis,
        })) || [];

        // Pre-populate section8_grounds with recommended codes (user can adjust)
        if (ground_recommendations.length > 0) {
          const recommended_codes = ground_recommendations.map(g =>
            `Ground ${g.code} - ${(g.title || '').split(' - ')[0]}`
          );

          // Only pre-fill if user hasn't selected grounds yet
          if (!mergedFacts.section8_grounds || mergedFacts.section8_grounds.length === 0) {
            mergedFacts = setFactPath(mergedFacts, 'section8_grounds', recommended_codes);
          }

          // Always store recommendations for reference
          mergedFacts = setFactPath(mergedFacts, 'ground_recommendations', ground_recommendations);
        }

        // Return to frontend for display
        responseData.ground_recommendations = ground_recommendations;

        console.log(`[SMART-GUIDANCE] Recommended ${ground_recommendations.length} grounds:`,
          ground_recommendations.map(g => `Ground ${g.code} (${g.type})`).join(', '));
      } catch (groundErr) {
        console.error('[SMART-GUIDANCE] Ground recommendation failed:', groundErr);
        // Non-fatal - user can still proceed
      }
    }

    // ============================================================================
    // SMART GUIDANCE: DATE AUTO-CALCULATION (after notice_service)
    // ============================================================================
    // Phase 2.3: Auto-calculate notice expiry date
    // Triggered after notice_service question (when notice_service_date is entered)
    if (
      product === 'notice_only' &&
      isEnglandOrWales &&
      question_id === 'notice_service'
    ) {
      try {
        console.log('[SMART-GUIDANCE] Running date auto-calculation after notice_service');

        // Import date calculator
        const { calculateSection8ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

        const notice_service_date = normalizedAnswer?.notice_service_date;

        if (notice_service_date) {
          const selected_route = mergedFacts.selected_notice_route ||
                                mergedFacts.route_recommendation?.recommended_route ||
                                'section_8';

          let calculated_result;

          if (selected_route === 'section_8') {
            // Extract ground codes from section8_grounds array
            const grounds = mergedFacts.section8_grounds || [];
            const groundObjects = grounds.map((groundStr: string) => {
              const match = groundStr.match(/Ground\s+(\d+)/i);
              const code = match ? parseInt(match[1]) : 0;
              const mandatory = ['1', '2', '3', '4', '5', '6', '7', '8'].includes(code.toString());
              return { code, mandatory };
            });

            calculated_result = calculateSection8ExpiryDate({
              service_date: notice_service_date,
              grounds: groundObjects,
              tenancy_start_date: mergedFacts.tenancy_start_date,
              fixed_term: mergedFacts.is_fixed_term,
              fixed_term_end_date: mergedFacts.fixed_term_end_date,
            });
          } else if (selected_route === 'section_21') {
            // For Section 21, need to calculate based on rent period
            const { calculateSection21ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

            calculated_result = calculateSection21ExpiryDate({
              service_date: notice_service_date,
              tenancy_start_date: mergedFacts.tenancy_start_date,
              fixed_term: mergedFacts.is_fixed_term,
              fixed_term_end_date: mergedFacts.fixed_term_end_date,
              rent_period: mergedFacts.rent_frequency || 'monthly',
            });
          }

          if (calculated_result) {
            // Store calculated date (user can override if needed)
            mergedFacts = setFactPath(mergedFacts, 'calculated_expiry_date', calculated_result.earliest_valid_date);
            mergedFacts = setFactPath(mergedFacts, 'date_calculation_explanation', calculated_result.explanation);

            // Pre-fill notice_expiry_date if user hasn't entered it yet
            // Save to BOTH legacy flat field AND nested MQS field for compatibility
            if (!normalizedAnswer?.notice_expiry_date && !mergedFacts.notice_expiry_date && !mergedFacts.notice_service?.notice_expiry_date) {
              mergedFacts = setFactPath(mergedFacts, 'notice_expiry_date', calculated_result.earliest_valid_date);
              mergedFacts = setFactPath(mergedFacts, 'notice_service.notice_expiry_date', calculated_result.earliest_valid_date);
            }

            // Return to frontend for display
            responseData.calculated_date = {
              date: calculated_result.earliest_valid_date,
              notice_period_days: calculated_result.notice_period_days,
              explanation: calculated_result.explanation,
              legal_basis: 'Housing Act 1988',
              warnings: calculated_result.warnings || [],
            };

            console.log(`[SMART-GUIDANCE] Calculated expiry date: ${calculated_result.earliest_valid_date} ` +
              `(${calculated_result.notice_period_days} days notice period)`);
          }
        }
      } catch (dateErr) {
        console.error('[SMART-GUIDANCE] Date calculation failed:', dateErr);
        // Non-fatal - user can still enter date manually
      }
    }

    if (caseRow.case_type === 'tenancy_agreement' && lockedTenancySku) {
      const tierLabel = getTenancyTierLabelForSku(
        lockedTenancySku,
        canonicalJurisdiction as TenancyJurisdiction,
      );
      mergedFacts.product_tier = tierLabel;
      mergedFacts[getTenancyTierQuestionId(canonicalJurisdiction as TenancyJurisdiction)] =
        tierLabel;
    }

    const updatedMeta = {
      ...(collectedFacts as any).__meta,
      ...(paymentStatus.hasPaidOrder
        ? {
            purchased_product: purchasedProduct,
            entitlements: entitlementProducts,
          }
        : {}),
    };

    // Use admin client to support anonymous users
    const newFacts = await updateWizardFacts(adminSupabase, case_id, () => mergedFacts, {
      meta: updatedMeta,
    });

    // Audit log for paid cases (non-blocking, fire-and-forget)
    // Get user from supabase session for audit
    const { data: userData } = await adminSupabase.auth.getUser();
    const auditUserId = userData?.user?.id || null;
    logMutation({
      caseId: case_id,
      userId: auditUserId,
      action: 'wizard_answer_update',
      changedKeys: [question_id, ...(question.maps_to || [])],
      metadata: {
        question_id,
        input_type: (question as any).inputType,
        source: 'wizard-answer',
      },
    }).catch(() => {}); // Fire and forget

    // ---------------------------------------
    // 4. Log conversation (user + assistant)
    // ---------------------------------------

    try {
      await adminSupabase.from('conversations').insert({
        case_id,
        role: 'user',
        content: rawAnswerText,
        question_id,
        input_type: (question as any).inputType ?? null,
        user_input: normalizedAnswer as any,
      } as any);
    } catch (convErr) {
      console.error('Failed to insert user conversation row:', convErr);
    }

    // ---------------------------------------
    // 5. Decision engine context for Ask Heaven (evictions only, non-blocking)
    // ---------------------------------------
    let decisionContext: DecisionOutput | undefined = undefined;
    try {
      if (
        caseRow.case_type === 'eviction' &&
        collectedFacts &&
        Object.keys(collectedFacts).length > 5
      ) {
        const caseFacts = wizardFactsToCaseFacts(collectedFacts);

        const decisionInput: DecisionInput = {
          jurisdiction: caseRow.jurisdiction as any,
          product: product as any,
          case_type: 'eviction',
          facts: caseFacts,
        };

        decisionContext = runDecisionEngine(decisionInput);
      }
    } catch (decisionErr) {
      console.warn('Decision engine failed in answer route:', decisionErr);
      // Continue without decision context
    }

    // ---------------------------------------
    // 6. Ask Heaven enhancement (non-fatal)
    // ---------------------------------------
    let enhanced: Awaited<ReturnType<typeof enhanceAnswer>> | null = null;
    try {
      enhanced = await enhanceAnswer({
        question,
        rawAnswer: rawAnswerText,
        jurisdiction: caseRow.jurisdiction,
        product,
        caseType: caseRow.case_type,
        decisionContext, // Decision engine context
        wizardFacts: collectedFacts, // Current wizard state
      });
    } catch (enhErr) {
      console.error('enhanceAnswer failed, proceeding without suggestions:', enhErr);
      enhanced = null;
    }

    if (enhanced) {
      try {
        await adminSupabase.from('conversations').insert({
          case_id,
          role: 'assistant',
          content: enhanced.suggested_wording,
          question_id,
          model: 'ask-heaven',
          user_input: normalizedAnswer as any,
        } as any);
      } catch (convErr) {
        console.error('Failed to insert assistant conversation row:', convErr);
      }
    }

    // ============================================================================
    // 6.5. SMART REVIEW: AI-assisted evidence extraction and fact comparison
    // ============================================================================
    // Runs for complete_pack/eviction_pack when:
    // - Smart Review is enabled (ENABLE_SMART_REVIEW=true)
    // - User has uploaded at least 1 document in an evidence category
    // - Throttle limit not exceeded (max once per 30s per case)
    // Returns warnings for mismatches but NEVER blocks generation in v1.
    let smartReviewWarnings: SmartReviewWarning[] = [];

    // Note: eviction_pack is a legacy alias that might appear in persisted data
    if (
      (product === 'complete_pack' || (product as string) === 'eviction_pack') &&
      canonicalJurisdiction === 'england' &&
      isSmartReviewEnabled() &&
      question_id.startsWith('evidence_') // Only run after evidence uploads
    ) {
      try {
        console.log('[SMART-REVIEW] Running Smart Review after evidence upload');

        // Build evidence bundle from wizard facts
        const evidenceBundle = mapLegacyUploadsToBundle(
          newFacts['evidence.pack_documents_uploaded'] ||
          newFacts['evidence.other_uploads'] ||
          []
        );

        // Add categorized uploads to bundle
        const categoryUploads: Array<{ key: string; category: EvidenceCategory }> = [
          { key: 'evidence.tenancy_agreement_uploads', category: 'tenancy_agreement' as EvidenceCategory },
          { key: 'evidence.bank_statements_uploads', category: 'bank_statements' as EvidenceCategory },
          { key: 'evidence.deposit_protection_uploads', category: 'deposit_protection_certificate' as EvidenceCategory },
          { key: 'evidence.prescribed_info_uploads', category: 'prescribed_information_proof' as EvidenceCategory },
          { key: 'evidence.how_to_rent_uploads', category: 'how_to_rent_proof' as EvidenceCategory },
          { key: 'evidence.epc_uploads', category: 'epc' as EvidenceCategory },
          { key: 'evidence.gas_safety_uploads', category: 'gas_safety_certificate' as EvidenceCategory },
          { key: 'evidence.notice_service_uploads', category: 'notice_served_proof' as EvidenceCategory },
          { key: 'evidence.correspondence_uploads', category: 'correspondence' as EvidenceCategory },
          { key: 'evidence.other_uploads', category: 'other' as EvidenceCategory },
        ];

        for (const { key, category } of categoryUploads) {
          const uploads = newFacts[key];
          if (Array.isArray(uploads) && uploads.length > 0) {
            if (!evidenceBundle.byCategory[category]) {
              evidenceBundle.byCategory[category] = [];
            }
            evidenceBundle.byCategory[category]!.push(
              ...uploads.map((u: any) => ({
                id: u.id || crypto.randomUUID(),
                filename: u.filename || u.name || 'unknown',
                mimeType: u.mimeType || u.type || 'application/octet-stream',
                sizeBytes: u.sizeBytes || u.size || 0,
                uploadedAt: u.uploadedAt || new Date().toISOString(),
                storageKey: u.storageKey || u.path || '',
                category: category,
                sha256: u.sha256,
              }))
            );
          }
        }

        // Run Smart Review pipeline
        const smartReviewResult = await runSmartReview({
          caseId: case_id,
          evidenceBundle,
          wizardFacts: newFacts,
          product,
          jurisdiction: canonicalJurisdiction,
        });

        if (smartReviewResult.success && smartReviewResult.warnings.length > 0) {
          smartReviewWarnings = smartReviewResult.warnings;
          console.log(`[SMART-REVIEW] Found ${smartReviewWarnings.length} warnings:`, {
            blockers: smartReviewResult.summary.warningsBlocker,
            warnings: smartReviewResult.summary.warningsWarning,
            info: smartReviewResult.summary.warningsInfo,
          });

          // Store Smart Review warnings in response data for UI
          responseData.smart_review = {
            warnings: smartReviewWarnings,
            summary: smartReviewResult.summary,
            cost_usd: smartReviewResult.totalCostUsd,
          };
        } else if (smartReviewResult.skipped) {
          console.log(`[SMART-REVIEW] Skipped: ${smartReviewResult.skipped.reason}`);
        }
      } catch (smartReviewErr) {
        console.error('[SMART-REVIEW] Failed:', smartReviewErr);
        // Non-fatal - continue without Smart Review
      }

      // ============================================================================
      // 6.6. SMART REVIEW PERSISTENCE: Save results to case_facts for reload
      // ============================================================================
      // Persist Smart Review results so they survive page refresh.
      // This is a separate update to avoid complicating the main facts flow.
      try {
        const persistedSmartReview: PersistedSmartReview = {
          ranAt: new Date().toISOString(),
          warnings: smartReviewWarnings.map((w): PersistedSmartReviewWarning => ({
            code: w.code,
            severity: w.severity,
            title: w.title,
            message: w.message,
            fields: w.fields,
            relatedUploads: w.relatedUploads,
            suggestedUserAction: w.suggestedUserAction,
            confidence: w.confidence,
            comparison: w.comparison,
          })),
          summary: responseData.smart_review?.summary ?? {
            documentsProcessed: 0,
            documentsCached: 0,
            documentsSkipped: 0,
            documentsTimedOut: 0,
            pagesProcessed: 0,
            warningsTotal: smartReviewWarnings.length,
            warningsBlocker: smartReviewWarnings.filter(w => w.severity === 'blocker').length,
            warningsWarning: smartReviewWarnings.filter(w => w.severity === 'warning').length,
            warningsInfo: smartReviewWarnings.filter(w => w.severity === 'info').length,
          },
          limitsApplied: responseData.smart_review?.limitsApplied,
          costUsd: responseData.smart_review?.cost_usd,
        };

        // Use admin client to support anonymous users
        await updateWizardFacts(adminSupabase, case_id, (current) => ({
          ...current,
          __smart_review: persistedSmartReview,
        }));

        console.log(`[SMART-REVIEW] Persisted ${smartReviewWarnings.length} warnings to case_facts`);
      } catch (persistErr) {
        console.error('[SMART-REVIEW] Failed to persist results:', persistErr);
        // Non-fatal - warnings will still be returned in this response
      }
    }

    // ---------------------------------------
    // 7. Determine next question + progress
    // ---------------------------------------
    const progress = computeProgress(mqs, newFacts);
    const cursorId = current_question_id || question_id;

    let nextQuestion: ExtendedWizardQuestion | null = null;
    let isComplete = false;

    if (isReviewMode) {
      const reviewNav = getReviewNavigation(mqs, newFacts, cursorId);
      nextQuestion = reviewNav.nextQuestion;
      isComplete = reviewNav.isComplete;
    } else {
      nextQuestion = getNextMQSQuestion(mqs, newFacts);
      isComplete = !nextQuestion;
    }

    const updatePayload: Record<string, any> = {
      wizard_progress: isComplete ? 100 : progress,
    };

    if (!isReviewMode) {
      updatePayload.wizard_completed_at = isComplete ? new Date().toISOString() : null;
    }

    // Use admin client to support anonymous users
    await adminSupabase.from('cases').update(updatePayload as any).eq('id', case_id);

    return NextResponse.json({
      case_id,
      question_id,
      answer_saved: true,
      // ============================================================================
      // PHASE 2 FIX: Return updated facts so frontend can validate using server state
      // This ensures wxIssues are computed from saved facts, not stale local state
      // ============================================================================
      facts: newFacts,
      ask_heaven: enhanced
        ? {
            suggested_wording: enhanced.suggested_wording,
            missing_information: enhanced.missing_information,
            evidence_suggestions: enhanced.evidence_suggestions,
            consistency_flags: enhanced.consistency_flags,
          }
        : null,
      suggested_wording: enhanced?.suggested_wording ?? null,
      missing_information: enhanced?.missing_information ?? [],
      evidence_suggestions: enhanced?.evidence_suggestions ?? [],
      enhanced_answer: enhanced
        ? {
            raw: rawAnswerText,
            suggested: enhanced.suggested_wording,
            missing_information: enhanced.missing_information,
            evidence_suggestions: enhanced.evidence_suggestions,
          }
        : undefined,
      // ============================================================================
      // SMART GUIDANCE: Include all recommendation data in response
      // ============================================================================
      route_recommendation: responseData.route_recommendation ?? null,
      ground_recommendations: responseData.ground_recommendations ?? null,
      calculated_date: responseData.calculated_date ?? null,
      compliance_warnings: complianceWarnings,
      // ============================================================================
      // SMART REVIEW: AI-extracted warnings from evidence documents
      // ============================================================================
      smart_review: responseData.smart_review ?? null,
      smart_review_warnings: smartReviewWarnings,
      // ============================================================================
      // CANONICAL VALIDATION OUTPUT: Always returned for inline per-step warnings
      // ============================================================================
      // wizard_warnings: Non-blocking guidance from wizard stage
      wizard_warnings: complianceWarnings,
      // preview_blocking_issues: Blocking issues that will prevent document generation
      preview_blocking_issues: previewBlockingIssues,
      // preview_warnings: Warnings from preview stage (recommended for compliance)
      preview_warnings: previewWarnings,
      // has_blocking_issues: Boolean flag for quick UI checks
      has_blocking_issues: previewBlockingIssues.length > 0,
      // issue_counts: Summary counts for persistent panel display
      issue_counts: {
        blocking: previewBlockingIssues.length,
        warnings: previewWarnings.length + complianceWarnings.length,
      },
      next_question: nextQuestion ?? null,
      is_complete: isComplete,
      // In edit mode, flow is only truly complete if there are no blocking issues
      is_review_complete: isReviewMode && isComplete && previewBlockingIssues.length === 0,
      progress: isComplete ? 100 : progress,
    });
  } catch (error: any) {
    console.error('Save answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
