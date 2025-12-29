import { NextResponse } from 'next/server';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';
import { mapEvidenceToFacts } from '@/lib/evidence/map-evidence-to-facts';
import { REQUIREMENTS, resolveRequirementKey } from '@/lib/validators/requirements';
import type { QuestionDefinition } from '@/lib/validators/question-schema';

export const runtime = 'nodejs';

type AnswerValidationError = { factKey: string; message: string };

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
    const supabase = createAdminClient();
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

    const errors: AnswerValidationError[] = [];
    // Answers must be keyed by factKey (not question id).
    const normalizedAnswers: Record<string, any> = {};

    Object.entries(answers).forEach(([factKey, value]) => {
      const question = questions.find((item) => item.factKey === factKey);
      if (!question) {
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

    await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
      const current = (currentRaw as any) || {};
      return {
        ...current,
        ...normalizedAnswers,
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

    const validationOutcome = runLegalValidator({
      product: (refreshedFacts as any)?.__meta?.product || (refreshedFacts as any)?.product,
      jurisdiction: caseRow.jurisdiction,
      facts: intelligence.facts as any,
      analysis: null,
    });

    const validationSummary = validationOutcome.result
      ? {
          validator_key: validationOutcome.validator_key,
          status: validationOutcome.result?.status,
          blockers: validationOutcome.result?.blockers,
          warnings: validationOutcome.result?.warnings,
          upsell: validationOutcome.result?.upsell ?? null,
        }
      : null;

    if (validationSummary) {
      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        return {
          ...current,
          validation_summary: validationSummary,
          recommendations: validationOutcome.recommendations ?? [],
          next_questions: validationOutcome.missing_questions ?? [],
          validation_version: 'answer_questions_v1',
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
            next_questions: validationOutcome.missing_questions ?? [],
          }
        : null,
      validation_summary: validationSummary,
      recommendations: validationOutcome.recommendations ?? [],
      next_questions: validationOutcome.missing_questions ?? [],
    });
  } catch (error) {
    console.error('answer-questions route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
