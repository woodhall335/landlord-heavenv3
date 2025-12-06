// src/app/api/ask-heaven/enhance-answer/route.ts
import { NextResponse } from 'next/server';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import type { ProductType } from '@/lib/wizard/mqs-loader';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type EnhanceAnswerBody = {
  case_id?: string;
  case_type?: string;
  jurisdiction?: string;
  product?: ProductType;
  question_id?: string;
  question_text?: string;
  answer?: string;
};

export async function POST(req: Request) {
  let body: EnhanceAnswerBody;

  try {
    body = (await req.json()) as EnhanceAnswerBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const {
    case_id,
    case_type = 'eviction',
    jurisdiction = 'england-wales',
    product = 'notice_only',
    question_id,
    question_text,
    answer,
  } = body;

  if (!answer || !question_id) {
    return NextResponse.json(
      { error: 'question_id and answer are required' },
      { status: 400 },
    );
  }

  // Minimal ExtendedWizardQuestion stub just for Ask Heaven
  const question: ExtendedWizardQuestion = {
    id: question_id,
    section: 'Ask Heaven',
    question: question_text ?? 'Free-text explanation',
    inputType: 'textarea',
  } as any;

  const enhanced = await enhanceAnswer({
    caseId: case_id,
    question,
    rawAnswer: answer,
    jurisdiction,
    product,
    caseType: case_type,
    // decisionContext, caseIntelContext, wizardFacts can be wired later if needed
  });

  // If Ask Heaven is disabled or failed, still return a valid payload
  if (!enhanced) {
    return NextResponse.json(
      {
        suggested_wording: '',
        missing_information: [],
        evidence_suggestions: [],
        consistency_flags: [],
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      suggested_wording: enhanced.suggested_wording,
      missing_information: enhanced.missing_information ?? [],
      evidence_suggestions: enhanced.evidence_suggestions ?? [],
      consistency_flags: enhanced.consistency_flags ?? [],
    },
    { status: 200 },
  );
}
