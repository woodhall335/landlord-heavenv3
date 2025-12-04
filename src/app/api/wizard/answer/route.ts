/**
 * Wizard API - Submit Answer
 *
 * POST /api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { loadMQS, getNextMQSQuestion, type ProductType, type MasterQuestionSet } from '@/lib/wizard/mqs-loader';
import { applyMappedAnswers, setFactPath } from '@/lib/case-facts/mapping';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { runDecisionEngine, type DecisionInput } from '@/lib/decision-engine';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const answerSchema = z.object({
  case_id: z.string().min(1),
  question_id: z.string(),
  answer: z.any(),
});

// ============================================================================
// Runtime Validation for Critical WizardFacts Fields
// ============================================================================

/**
 * Validates critical answers using Zod schemas per question ID.
 * Protects essential data like dates, money, and product configuration.
 */
function validateCriticalAnswer(questionId: string, answer: unknown): { ok: true } | { ok: false; errors: string[] } {
  try {
    // Critical field: AST tier (product selection)
    if (questionId === 'ast_tier') {
      const schema = z.enum(['Standard AST', 'Premium AST'], {
        message: 'AST tier must be "Standard AST" or "Premium AST"'
      });
      schema.parse(answer);
      return { ok: true };
    }

    // Critical field: Tenancy start date (part of tenancy_type_and_dates group)
    // Handles both AST (tenancy_start_date) and Scotland/NI (start_date) field names
    if (questionId === 'tenancy_type_and_dates') {
      const dateValidation = z.string()
        .min(1, 'Tenancy start date is required')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tenancy start date must be in YYYY-MM-DD format');

      const groupSchema = z.object({
        tenancy_start_date: dateValidation.optional(),
        start_date: dateValidation.optional(),
      }).passthrough() // Allow other fields in the group
        .refine(
          (data) => data.tenancy_start_date || data.start_date,
          'Either tenancy_start_date or start_date is required'
        );

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Rent amount (part of rent_details group)
    if (questionId === 'rent_details') {
      const groupSchema = z.object({
        rent_amount: z.union([
          z.number().positive('Rent amount must be positive'),
          z.string()
            .min(1, 'Rent amount is required')
            .refine(
              (val) => !isNaN(Number(val)) && Number(val) > 0,
              'Rent amount must be a positive number'
            )
        ]),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Property address line 1 (part of property_address group)
  if (questionId === 'property_address') {
    const groupSchema = z.object({
      property_address_line1: z.string()
        .min(1, 'Property address line 1 is required')
        .max(200, 'Property address line 1 is too long')
        .optional(),
      address_line1: z.string()
        .min(1, 'Property address line 1 is required')
        .max(200, 'Property address line 1 is too long')
        .optional(),
    }).passthrough(); // Allow other fields in the group

    const parsed = groupSchema.parse(answer);
    if (!parsed.property_address_line1 && !parsed.address_line1) {
      throw new Error('Property address line 1 is required');
    }
    return { ok: true };
  }

    // ============================================================================
    // Scotland-specific validations
    // ============================================================================

    // Critical field: Scotland landlord registration details
    if (questionId === 'landlord_details') {
      const groupSchema = z.object({
        landlord_registration_number: z.union([
          z.string().min(1, 'Landlord registration number should not be empty if provided').optional(),
          z.literal('').optional(),
          z.undefined()
        ]),
        landlord_registration_authority: z.union([
          z.string().min(1, 'Registration authority should not be empty if provided').optional(),
          z.literal('').optional(),
          z.undefined()
        ])
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland tenancy dates (Notice to Leave)
    if (questionId === 'tenancy_dates') {
      const dateSchema = z.string()
        .min(1, 'Tenancy start date is required')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tenancy start date must be in YYYY-MM-DD format');

      dateSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland rent terms (Notice to Leave)
    if (questionId === 'rent_terms') {
      const groupSchema = z.object({
        rent_amount: z.union([
          z.number().positive('Rent amount must be positive'),
          z.string()
            .min(1, 'Rent amount is required')
            .refine(
              (val) => !isNaN(Number(val)) && Number(val) > 0,
              'Rent amount must be a positive number'
            )
        ]),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland deposit protection (Notice to Leave)
    if (questionId === 'deposit_protection') {
      const groupSchema = z.object({
        deposit_amount: z.union([
          z.number().nonnegative('Deposit amount must be zero or positive'),
          z.string()
            .refine(
              (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
              'Deposit amount must be zero or a positive number'
            )
        ]).optional(),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland deposit details (PRT Agreement)
    if (questionId === 'deposit_details') {
      const groupSchema = z.object({
        deposit_amount: z.union([
          z.number().nonnegative('Deposit amount must be zero or positive'),
          z.string()
            .refine(
              (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
              'Deposit amount must be zero or a positive number'
            )
        ]).optional(),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland/NI property details with postcode
    if (questionId === 'property_details') {
      const groupSchema = z.object({
        postcode: z.union([
          z.string()
            .min(1, 'Postcode is required')
            .max(10, 'Postcode is too long'),
          z.undefined()
        ]).optional(),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland notice service dates (Notice to Leave)
    if (questionId === 'notice_service') {
      const groupSchema = z.object({
        notice_date: z.string()
          .min(1, 'Notice date is required')
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Notice date must be in YYYY-MM-DD format'),
        notice_expiry: z.string()
          .min(1, 'Notice expiry date is required')
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Notice expiry date must be in YYYY-MM-DD format'),
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Critical field: Scotland arrears amount (Notice to Leave)
    if (questionId === 'arrears_amount') {
      const amountSchema = z.union([
        z.number().nonnegative('Arrears amount must be zero or positive'),
        z.string()
          .min(1, 'Arrears amount is required')
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) >= 0,
            'Arrears amount must be zero or a positive number'
          )
      ]);

      amountSchema.parse(answer);
      return { ok: true };
    }

    // ============================================================================
    // Northern Ireland-specific validations
    // ============================================================================

    // Critical field: NI HMO details with council name
    if (questionId === 'hmo_details') {
      const groupSchema = z.object({
        council_name: z.union([
          z.string().min(1, 'Council name should not be empty if provided').optional(),
          z.literal('').optional(),
          z.undefined()
        ])
      }).passthrough(); // Allow other fields in the group

      groupSchema.parse(answer);
      return { ok: true };
    }

    // Not a critical field - validation passes
    return { ok: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      ok: false,
      errors: ['Validation failed for this answer']
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
  const fallbackValue = facts[question.id];
  if (fallbackValue === null || fallbackValue === undefined) return false;
  if (typeof fallbackValue === 'string') return fallbackValue.trim().length > 0;
  return true;
}

function computeProgress(mqs: MasterQuestionSet, facts: Record<string, any>): number {
  if (!mqs.questions.length) return 100;

  // Filter to only applicable questions (those without dependencies or with satisfied dependencies)
  const applicableQuestions = mqs.questions.filter((q) => {
    const dependsOn = (q as any).depends_on || q.dependsOn;
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
      depValue = facts[dependsOn.questionId];
    }

    // Check if dependency is satisfied
    if (Array.isArray(dependsOn.value)) {
      // Handle when user's answer is also an array (multi_select questions)
      if (Array.isArray(depValue)) {
        return depValue.some(val => dependsOn.value.includes(val));
      }
      // User's answer is scalar, check if it's in the dependency array
      return dependsOn.value.includes(depValue);
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
  value: any
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
        numericValue > 0
      );
    }
  }

  if (questionId === 'rent_arrears') {
    updatedFacts = setFactPath(
      updatedFacts,
      'issues.rent_arrears.has_arrears',
      Boolean(value)
    );
  }

  return updatedFacts;
}

// ============================================================================
// Main Handler
// ============================================================================

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const validationResult = answerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { case_id, question_id, answer } = validationResult.data;

    // Runtime validation for critical WizardFacts fields
    const criticalValidation = validateCriticalAnswer(question_id, answer);
    if (!criticalValidation.ok) {
      return NextResponse.json(
        { error: 'Invalid answer for this question', details: criticalValidation.errors },
        { status: 400 }
      );
    }

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    // ---------------------------------------
    // 1. Load case with RLS-respecting query
    // ---------------------------------------
    let query = supabase.from('cases').select('*').eq('id', case_id);
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Type assertion: we know data exists after the null check
    const caseRow = data as { id: string; jurisdiction: string; case_type: string; collected_facts: any };

    const collectedFacts = (caseRow.collected_facts as Record<string, any>) || {};
    const product = deriveProduct(caseRow.case_type, collectedFacts);
    const mqs = loadMQS(product, caseRow.jurisdiction);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    const question = mqs.questions.find((q) => q.id === question_id);

    if (!question) {
      return NextResponse.json({ error: 'Unknown question_id' }, { status: 400 });
    }

    const normalizedAnswer = normalizeAnswer(question, answer);

    if (!validateAnswer(question, normalizedAnswer)) {
      return NextResponse.json({ error: 'Answer failed validation' }, { status: 400 });
    }

    // ---------------------------------------
    // 2. Merge into WizardFacts (flat DB format)
    // ---------------------------------------
    const currentFacts = await getOrCreateWizardFacts(supabase, case_id);
    let mergedFacts = applyMappedAnswers(
      currentFacts,
      question.maps_to,
      normalizedAnswer
    );

    if (!question.maps_to || question.maps_to.length === 0) {
      mergedFacts = setFactPath(mergedFacts, question_id, normalizedAnswer);
    }

    mergedFacts = updateDerivedFacts(
      question_id,
      caseRow.jurisdiction,
      mergedFacts,
      normalizedAnswer
    );

    const newFacts = await updateWizardFacts(
      supabase,
      case_id,
      () => mergedFacts,
      { meta: collectedFacts.__meta }
    );

    // ---------------------------------------
    // 3. Log conversation (user + assistant)
    // ---------------------------------------
    const rawAnswerText =
      typeof normalizedAnswer === 'string'
        ? normalizedAnswer
        : JSON.stringify(normalizedAnswer);

    // Log the user message – DO NOT let failures here break the flow
    try {
      await supabase.from('conversations').insert({
        case_id,
        role: 'user',
        content: rawAnswerText,
        question_id,
        input_type: question.inputType ?? null,
        user_input: normalizedAnswer as any, // Supabase types user_input as Json
      } as any);
    } catch (convErr) {
      console.error('Failed to insert user conversation row:', convErr);
    }

    // Build decision context for Ask Heaven
    let decisionContext = null;
    try {
      // Only run decision engine for eviction cases with enough data
      if (caseRow.case_type === 'eviction' && collectedFacts && Object.keys(collectedFacts).length > 5) {
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

    // Call Ask Heaven with enhanced context, but treat all errors as non-fatal
    let enhanced: Awaited<ReturnType<typeof enhanceAnswer>> | null = null;
    try {
      enhanced = await enhanceAnswer({
        question,
        rawAnswer: rawAnswerText,
        jurisdiction: caseRow.jurisdiction,
        product,
        caseType: caseRow.case_type,
        decisionContext,           // NEW: Decision engine context
        wizardFacts: collectedFacts, // NEW: Current wizard state
      });
    } catch (enhErr) {
      console.error('enhanceAnswer failed, proceeding without suggestions:', enhErr);
      enhanced = null;
    }

    if (enhanced) {
      try {
        await supabase
          .from('conversations')
          .insert({
            case_id,
            role: 'assistant',
            content: enhanced.suggested_wording,
            question_id,
            model: 'ask-heaven',
            user_input: normalizedAnswer as any, // Supabase types user_input as Json
          } as any);
      } catch (convErr) {
        console.error('Failed to insert assistant conversation row:', convErr);
      }
    }


    // ---------------------------------------
    // 4. Determine next question + progress
    // ---------------------------------------
    const nextQuestion = getNextMQSQuestion(mqs, newFacts);
    const progress = computeProgress(mqs, newFacts);
    const isComplete = !nextQuestion;

    await supabase
      .from('cases')
      .update({
        wizard_progress: isComplete ? 100 : progress,
        wizard_completed_at: isComplete ? new Date().toISOString() : null,
      } as any)
      .eq('id', case_id);

    return NextResponse.json({
      case_id,
      question_id,
      answer_saved: true,
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
      next_question: nextQuestion ?? null,
      is_complete: isComplete,
      progress: isComplete ? 100 : progress,
    });
  } catch (error: any) {
    console.error('Save answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
