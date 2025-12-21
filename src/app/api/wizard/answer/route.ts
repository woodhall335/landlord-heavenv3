/**
 * Wizard API - Submit Answer
 *
 * POST src/api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import {
  loadMQS,
  getNextMQSQuestion,
  type ProductType,
  type MasterQuestionSet,
} from '@/lib/wizard/mqs-loader';
import { applyMappedAnswers, setFactPath } from '@/lib/case-facts/mapping';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { runDecisionEngine, type DecisionInput, type DecisionOutput } from '@/lib/decision-engine';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { getReviewNavigation } from '@/lib/wizard/review-navigation';
import { deriveCanonicalJurisdiction, normalizeJurisdiction } from '@/lib/types/jurisdiction';
import { validateFlow } from '@/lib/validation/validateFlow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function isQuestionAnswered(question: ExtendedWizardQuestion, facts: Record<string, any>): boolean {
  if (question.maps_to && question.maps_to.length > 0) {
    return question.maps_to.every((path) => {
      const value = getValueAtPath(facts, path);
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    });
  }

  // For questions without maps_to, check if answered directly by question ID
  const fallbackValue = (facts as any)[question.id as string];
  if (fallbackValue === null || fallbackValue === undefined) return false;
  if (typeof fallbackValue === 'string') return fallbackValue.trim().length > 0;
  return true;
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
    const _user = await getServerUser().catch(() => null);
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

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    // ---------------------------------------
    // 1. Load case - RLS policies handle access control
    //    No need for manual user_id filtering
    // ---------------------------------------
    const { data, error: fetchError } = await supabase
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
            'We currently support tenancy agreements for Northern Ireland. For England & Wales and Scotland, we support evictions (notices and court packs) and money claims. Northern Ireland eviction and money claim support is planned for Q2 2026.',
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
    const currentFacts = await getOrCreateWizardFacts(supabase, case_id);
    let mergedFacts = applyMappedAnswers(currentFacts, question.maps_to, normalizedAnswer);

    if (!question.maps_to || question.maps_to.length === 0) {
      mergedFacts = setFactPath(mergedFacts, question_id, normalizedAnswer);
    }

    mergedFacts = updateDerivedFacts(
      question_id,
      caseRow.jurisdiction,
      mergedFacts,
      normalizedAnswer,
    );

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
    // Key UX rule: Never block Next/Continue - only warn early and persistently.
    // Preview generation remains the only hard block.
    let previewBlockingIssues: Array<{
      code: string;
      user_message: string;
      fields: string[];
      affected_question_id?: string;
      alternate_question_ids?: string[];
      user_fix_hint?: string;
      severity: 'blocking';
      legal_reason?: string;
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

      previewBlockingIssues = previewValidation.blocking_issues.map(issue => ({
        code: issue.code,
        user_message: issue.user_fix_hint || 'Missing information',
        fields: issue.fields,
        affected_question_id: issue.affected_question_id,
        alternate_question_ids: issue.alternate_question_ids,
        user_fix_hint: issue.user_fix_hint,
        severity: 'blocking' as const,
        legal_reason: issue.legal_basis,
      }));

      previewWarnings = previewValidation.warnings.map(issue => ({
        code: issue.code,
        user_message: issue.user_fix_hint || 'Information needs attention',
        fields: issue.fields,
        affected_question_id: issue.affected_question_id,
        alternate_question_ids: issue.alternate_question_ids,
        user_fix_hint: issue.user_fix_hint,
        severity: 'warning' as const,
        legal_reason: issue.legal_basis,
      }));

      console.log(`[WIZARD] Preview validation: ${previewBlockingIssues.length} blocking, ${previewWarnings.length} warnings`);
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

        // Auto-select route (user can override later if they choose)
        let selected_notice_route = route_recommendation.recommended_route;

        // Persist route selection in wizard facts
        mergedFacts = setFactPath(mergedFacts, 'selected_notice_route', selected_notice_route);
        mergedFacts = setFactPath(mergedFacts, 'route_recommendation', route_recommendation);

        // Return recommendation to frontend for display
        responseData.route_recommendation = route_recommendation;

        console.log(`[SMART-GUIDANCE] Route recommended: ${selected_notice_route}`, {
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

    const newFacts = await updateWizardFacts(supabase, case_id, () => mergedFacts, {
      meta: (collectedFacts as any).__meta,
    });

    // ---------------------------------------
    // 4. Log conversation (user + assistant)
    // ---------------------------------------

    try {
      await supabase.from('conversations').insert({
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
        await supabase.from('conversations').insert({
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

    await supabase.from('cases').update(updatePayload as any).eq('id', case_id);

    return NextResponse.json({
      case_id,
      question_id,
      answer_saved: true,
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
