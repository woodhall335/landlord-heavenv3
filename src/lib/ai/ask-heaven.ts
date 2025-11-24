import { chatCompletion } from './openai-client';
import { readFileSync } from 'fs';
import path from 'path';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

interface EnhanceAnswerParams {
  question: ExtendedWizardQuestion;
  rawAnswer: string;
  jurisdiction: string;
  product: string;
  caseType: string;
}

export interface EnhancedAnswer {
  suggested_wording: string;
  missing_information: string[];
  evidence_suggestions: string[];
}

let ASK_HEAVEN_SYSTEM_PROMPT: string | null = null;

function loadSystemPrompt(): string {
  if (ASK_HEAVEN_SYSTEM_PROMPT) return ASK_HEAVEN_SYSTEM_PROMPT;
  const promptPath = path.join(process.cwd(), 'docs', 'ASK_HEAVEN_SYSTEM_PROMPT.md');
  const content = readFileSync(promptPath, 'utf8');
  ASK_HEAVEN_SYSTEM_PROMPT = content;
  return content;
}

export async function enhanceAnswer(params: EnhanceAnswerParams): Promise<EnhancedAnswer | null> {
  const { question, rawAnswer, jurisdiction, product, caseType } = params;

  // If there is no suggestion_prompt, skip enhancement
  if (!question.suggestion_prompt) return null;

  const systemPrompt = loadSystemPrompt();

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    {
      role: 'user' as const,
      content: [
        `You are assisting with product: ${product}, case_type: ${caseType}, jurisdiction: ${jurisdiction}.`,
        `Question: ${question.question}`,
        question.helperText ? `Helper: ${question.helperText}` : '',
        `Suggestion prompt: ${question.suggestion_prompt}`,
        '',
        `Landlord's draft answer:`,
        rawAnswer || '(no answer provided yet)',
        '',
        `Respond in the following format ONLY:`,
        '',
        `Suggested Wording`,
        `<improved single-block answer text>`,
        '',
        `Missing Information`,
        `- item 1 (if any)`,
        `- item 2`,
        '',
        `Evidence You May Upload`,
        `- type 1`,
        `- type 2`,
      ].join('\n'),
    },
  ];

  const completion = await chatCompletion({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.3,
  });

  const content = completion.choices?.[0]?.message?.content || '';

  // Very simple parser – we can refine later
  const suggestedBlock = content.split('Missing Information')[0].replace('Suggested Wording', '').trim();
  const missingBlock = content.split('Missing Information')[1]?.split('Evidence You May Upload')[0] || '';
  const evidenceBlock = content.split('Evidence You May Upload')[1] || '';

  const missing_information = missingBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim())
    .filter(Boolean);

  const evidence_suggestions = evidenceBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim())
    .filter(Boolean);

  return {
    suggested_wording: suggestedBlock,
    missing_information,
    evidence_suggestions,
  };
}
