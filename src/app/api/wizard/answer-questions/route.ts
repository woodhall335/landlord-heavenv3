import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';
import { mapEvidenceToFacts } from '@/lib/evidence/map-evidence-to-facts';
import { REQUIREMENTS, resolveRequirementKey } from '@/lib/validators/requirements';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { isLevelAFactKey, FACT_QUESTIONS, normalizeLevelAFactsToCanonical } from '@/lib/validators/facts/factKeys';

export const runtime = 'nodejs';

type AnswerValidationError = { factKey: string; message: string };

/**
 * Get the most recent evidence analysis from the analysis map.
 * This is used to preserve extracted fields across re-checks.
 *
 * The analysis map is keyed by evidence_id, with each entry containing
 * the extraction results including detected_type, extracted_fields, confidence, etc.
 */
function getLatestEvidenceAnalysis(
  analysisMap: Record<string, any>
): { detected_type: string; extracted_fields: Record<string, any>; confidence: number; warnings: string[] } | null {
  if (!analysisMap || Object.keys(analysisMap).length === 0) {
    return null;
  }

  // Merge all extracted fields from all analyses, with later entries overwriting earlier ones
  // Also track the most relevant analysis (highest confidence section_21 or section_8 detection)
  const allAnalyses = Object.values(analysisMap);
  if (allAnalyses.length === 0) {
    return null;
  }

  // Prioritize section 21 or section 8 notice analyses
  const noticeAnalyses = allAnalyses.filter(
    (a) =>
      a?.detected_type?.toLowerCase().includes('section_21') ||
      a?.detected_type?.toLowerCase().includes('section_8') ||
      a?.detected_type?.toLowerCase().includes('form_6a') ||
      a?.detected_type?.toLowerCase().includes('form_3') ||
      a?.extracted_fields?.form_6a_used === true ||
      a?.extracted_fields?.form_6a_detected === true ||
      a?.extracted_fields?.section_21_detected === true ||
      a?.extracted_fields?.section_8_detected === true
  );

  // If we found notice analyses, use those; otherwise use all analyses
  const relevantAnalyses = noticeAnalyses.length > 0 ? noticeAnalyses : allAnalyses;

  // Merge all extracted fields, preferring higher confidence values
  const mergedFields: Record<string, any> = {};
  const allWarnings: string[] = [];
  let bestConfidence = 0;
  let bestDetectedType = 'unknown';

  for (const analysis of relevantAnalyses) {
    if (!analysis?.extracted_fields) continue;

    // Track best detection type
    const confidence = analysis.confidence ?? 0;
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestDetectedType = analysis.detected_type || 'unknown';
    }

    // Merge fields - non-null values override previous
    for (const [key, value] of Object.entries(analysis.extracted_fields)) {
      if (value !== undefined && value !== null && value !== '') {
        mergedFields[key] = value;
      }
    }

    // Collect warnings
    if (Array.isArray(analysis.warnings)) {
      allWarnings.push(...analysis.warnings);
    }
  }

  if (Object.keys(mergedFields).length === 0) {
    return null;
  }

  return {
    detected_type: bestDetectedType,
    extracted_fields: mergedFields,
    confidence: bestConfidence,
    warnings: allWarnings,
  };
}

function normalizeAnswer(question: QuestionDefinition, value: any): { value?: any; error?: string } {
  switch (question.type) {
    case 'yes_no': {
      if (typeof value === 'boolean') return { value: value ? 'yes' : 'no' };
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['yes', 'y', 'true'].includes(normalized)) return { value: 'yes' };
        if (['no', 'n', 'false'].includes(normalized)) return { value: 'no' };
      }
      return { error: 'Answer must be yes or no.' };
    }
    case 'yes_no_unsure': {
      // Level A questions: yes/no/not_sure (or unsure)
      if (typeof value === 'boolean') return { value: value ? 'yes' : 'no' };
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['yes', 'y', 'true'].includes(normalized)) return { value: 'yes' };
        if (['no', 'n', 'false'].includes(normalized)) return { value: 'no' };
        if (['not_sure', 'unsure', 'unknown', 'not sure', 'notsure'].includes(normalized)) {
          return { value: 'not_sure' };
        }
      }
      return { error: 'Answer must be yes, no, or not sure.' };
    }
    case 'date': {
      if (typeof value !== 'string') return { error: 'Date must be a string.' };
      const trimmed = value.trim();
      const parsed = new Date(trimmed);
      if (Number.isNaN(parsed.getTime())) return { error: 'Date must be valid.' };
      const iso = parsed.toISOString().slice(0, 10);
      return { value: iso };
    }
    case 'currency': {
      const numeric = typeof value === 'number' ? value : parseFloat(String(value));
      if (Number.isNaN(numeric)) return { error: 'Amount must be a number.' };
      if (question.validation?.min !== undefined && numeric < question.validation.min) {
        return { error: `Amount must be at least ${question.validation.min}.` };
      }
      if (question.validation?.max !== undefined && numeric > question.validation.max) {
        return { error: `Amount must be at most ${question.validation.max}.` };
      }
      return { value: numeric };
    }
    case 'text': {
      if (typeof value !== 'string') return { error: 'Answer must be text.' };
      const trimmed = value.trim();
      if (question.required && trimmed.length === 0) return { error: 'Answer is required.' };
      if (question.validation?.regex) {
        const regex = new RegExp(question.validation.regex);
        if (!regex.test(trimmed)) return { error: 'Answer format is invalid.' };
      }
      return { value: trimmed };
    }
    case 'select': {
      if (typeof value !== 'string') return { error: 'Select a valid option.' };
      const options = new Set(question.options?.map((option) => option.value));
      if (options.size > 0 && !options.has(value)) {
        return { error: 'Select a valid option.' };
      }
      return { value };
    }
    case 'multi_select': {
      if (!Array.isArray(value)) return { error: 'Select one or more options.' };
      const options = new Set(question.options?.map((option) => option.value));
      if (options.size > 0 && value.some((item) => !options.has(item))) {
        return { error: 'Select valid options only.' };
      }
      return { value };
    }
    default:
      return { error: 'Unsupported question type.' };
  }
}

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/answer-questions', writesUsingAdmin: true });
    const supabase = createSupabaseAdminClient();
    const user = await getServerUser();

    const body = await request.json();
    const caseId = body?.caseId as string | undefined;
    const answers = body?.answers as Record<string, any> | undefined;

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers are required' }, { status: 400 });
    }

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, jurisdiction')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseRow.user_id) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (caseRow.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const factsSnapshot = await getOrCreateWizardFacts(supabase as any, caseId);
    const requirementKey = resolveRequirementKey({
      product: (factsSnapshot as any)?.__meta?.product || (factsSnapshot as any)?.product,
      jurisdiction: caseRow.jurisdiction,
      facts: factsSnapshot as any,
    });
    const requirement = requirementKey ? REQUIREMENTS[requirementKey] : null;
    const questions = requirement?.requiredFacts || [];
    const isLevelAMode = requirement?.levelAMode === true;

    const errors: AnswerValidationError[] = [];
    // Answers must be keyed by factKey (not question id).
    const normalizedAnswers: Record<string, any> = {};

    Object.entries(answers).forEach(([factKey, value]) => {
      // First check if it's a Level A fact key
      if (isLevelAFactKey(factKey)) {
        // Find the Level A question config
        const levelAQuestion = FACT_QUESTIONS.find(
          (q) => q.factKey === factKey && q.isLevelA === true
        );
        if (levelAQuestion) {
          // Create a QuestionDefinition-like object for normalization
          const pseudoQuestion: QuestionDefinition = {
            id: factKey,
            factKey,
            question: levelAQuestion.question,
            type: levelAQuestion.type as any,
            required: levelAQuestion.required ?? true,
            options: levelAQuestion.options,
          };
          const result = normalizeAnswer(pseudoQuestion, value);
          if (result.error) {
            errors.push({ factKey, message: result.error });
            return;
          }
          normalizedAnswers[factKey] = result.value;
          return;
        }
      }

      // Fall back to standard requirement questions
      const question = questions.find((item) => item.factKey === factKey);
      if (!question) {
        // If not found in requirements, check if it's a known Level A key we should accept anyway
        if (isLevelAMode && isLevelAFactKey(factKey)) {
          // Accept the answer as-is for Level A mode
          normalizedAnswers[factKey] = value;
          return;
        }
        errors.push({ factKey, message: 'Unknown question key.' });
        return;
      }
      const result = normalizeAnswer(question, value);
      if (result.error) {
        errors.push({ factKey, message: result.error });
        return;
      }
      normalizedAnswers[question.factKey] = result.value;
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Invalid answers', errors }, { status: 400 });
    }

    // FIX: Also persist canonical keys alongside Level A keys
    // This ensures that validators can find values under canonical keys directly
    // e.g., rent_frequency_confirmed -> rent_frequency, rent_amount_confirmed -> rent_amount
    const canonicalAnswers = normalizeLevelAFactsToCanonical(normalizedAnswers);

    await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
      const current = (currentRaw as any) || {};
      return {
        ...current,
        ...normalizedAnswers,
        ...canonicalAnswers, // Include normalized canonical keys
      } as typeof current;
    });

    const refreshedFacts = await getOrCreateWizardFacts(supabase as any, caseId);
    const evidenceFiles = ((refreshedFacts as any)?.evidence?.files || []) as any[];
    const analysisMap = ((refreshedFacts as any)?.evidence?.analysis || {}) as Record<string, any>;
    const mappedFacts = mapEvidenceToFacts({
      facts: (refreshedFacts as any) || {},
      evidenceFiles,
      analysisMap,
    });

    const intelligence = applyDocumentIntelligence(mappedFacts as any);

    await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
      const current = (currentRaw as any) || {};
      return {
        ...current,
        ...(intelligence.facts as any),
      } as typeof current;
    });

    // FIX: Get the most recent evidence analysis to pass to validator
    // This preserves extracted fields (Form 6A, dates, names, etc.) across re-checks
    const latestAnalysis = getLatestEvidenceAnalysis(analysisMap);

    const validationOutcome = runLegalValidator({
      product: (refreshedFacts as any)?.__meta?.product || (refreshedFacts as any)?.product,
      jurisdiction: caseRow.jurisdiction,
      facts: intelligence.facts as any,
      analysis: latestAnalysis,
    });

    // Level A mode: Use level_a_questions instead of missing_questions
    const levelAQuestions = validationOutcome.level_a_questions ?? [];
    const isResultLevelAMode = validationOutcome.level_a_mode === true;

    // Build next_questions based on mode
    let nextQuestions: any[];
    if (isResultLevelAMode && levelAQuestions.length > 0) {
      nextQuestions = levelAQuestions.map((q: any) => ({
        id: q.factKey,
        factKey: q.factKey,
        question: q.question,
        type: q.type || 'yes_no_unsure',
        helpText: q.helpText,
        options: q.options, // Include options for select/multi_select types
        isLevelA: true,
      }));
    } else {
      nextQuestions = validationOutcome.missing_questions ?? [];
    }

    const validationSummary = validationOutcome.result
      ? {
          validator_key: validationOutcome.validator_key,
          status: validationOutcome.result?.status,
          blockers: validationOutcome.result?.blockers,
          warnings: validationOutcome.result?.warnings,
          upsell: validationOutcome.result?.upsell ?? null,
          level_a_mode: isResultLevelAMode,
        }
      : null;

    if (validationSummary) {
      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        return {
          ...current,
          validation_summary: validationSummary,
          recommendations: validationOutcome.recommendations ?? [],
          next_questions: nextQuestions,
          validation_version: 'answer_questions_v1',
          level_a_mode: isResultLevelAMode,
        } as typeof current;
      });
    }

    return NextResponse.json({
      success: true,
      validation: validationOutcome.result
        ? {
            validator_key: validationOutcome.validator_key,
            status: validationOutcome.result.status,
            blockers: validationOutcome.result.blockers,
            warnings: validationOutcome.result.warnings,
            upsell: validationOutcome.result.upsell ?? null,
            recommendations: validationOutcome.recommendations ?? [],
            next_questions: nextQuestions,
            level_a_mode: isResultLevelAMode,
          }
        : null,
      validation_summary: validationSummary,
      recommendations: validationOutcome.recommendations ?? [],
      next_questions: nextQuestions,
      level_a_mode: isResultLevelAMode,
    });
  } catch (error) {
    console.error('answer-questions route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
