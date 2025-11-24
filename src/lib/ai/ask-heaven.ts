/**
 * Ask Heaven - AI Legal Co-Pilot
 *
 * Enhances user answers with legally precise wording and identifies missing information.
 * Uses the Ask Heaven system prompt from /docs/ASK_HEAVEN_SYSTEM_PROMPT.md
 *
 * Ask Heaven does NOT decide which questions to ask - it only improves answers.
 */

import { chatCompletion } from './openai-client';
import { readFileSync } from 'fs';
import path from 'path';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

export interface EnhanceAnswerParams {
  question: ExtendedWizardQuestion;
  rawAnswer: string;
  jurisdiction: string;
  product: string;
  caseType: string;
  collectedFacts?: Record<string, any>; // Optional context
}

export interface EnhancedAnswer {
  suggested_wording: string;
  missing_information: string[];
  evidence_suggestions: string[];
}

// Cache the system prompt
let ASK_HEAVEN_SYSTEM_PROMPT: string | null = null;

/**
 * Load the Ask Heaven system prompt from docs
 */
function loadSystemPrompt(): string {
  if (ASK_HEAVEN_SYSTEM_PROMPT) return ASK_HEAVEN_SYSTEM_PROMPT;

  const promptPath = path.join(process.cwd(), 'docs', 'ASK_HEAVEN_SYSTEM_PROMPT.md');

  try {
    const content = readFileSync(promptPath, 'utf8');
    ASK_HEAVEN_SYSTEM_PROMPT = content;
    return content;
  } catch (error) {
    console.error('[Ask Heaven] Failed to load system prompt:', error);
    // Fallback prompt
    return `You are Ask Heaven, a senior UK housing solicitor AI assistant.
Help landlords write clear, legally precise answers to wizard questions.
Always be factual, risk-aware, and never make up information.`;
  }
}

/**
 * Enhance a user's answer using Ask Heaven
 *
 * Returns null if:
 * - Question has no suggestion_prompt
 * - AI call fails
 * - Answer is empty
 */
export async function enhanceAnswer(params: EnhanceAnswerParams): Promise<EnhancedAnswer | null> {
  const { question, rawAnswer, jurisdiction, product, caseType, collectedFacts } = params;

  // Skip if no suggestion prompt defined
  if (!question.suggestion_prompt) {
    console.log(`[Ask Heaven] No suggestion_prompt for question ${question.id}, skipping`);
    return null;
  }

  // Skip if no answer provided
  if (!rawAnswer || rawAnswer.trim() === '') {
    console.log(`[Ask Heaven] No raw answer for question ${question.id}, skipping`);
    return null;
  }

  const systemPrompt = loadSystemPrompt();

  // Build context from collected facts if available
  const contextLines: string[] = [];
  if (collectedFacts) {
    if (collectedFacts.landlord_full_name) {
      contextLines.push(`Landlord: ${collectedFacts.landlord_full_name}`);
    }
    if (collectedFacts.tenant_full_name) {
      contextLines.push(`Tenant: ${collectedFacts.tenant_full_name}`);
    }
    if (collectedFacts.property_address_line1) {
      contextLines.push(`Property: ${collectedFacts.property_address_line1}`);
    }
    if (collectedFacts.rent_amount) {
      contextLines.push(`Rent: £${collectedFacts.rent_amount}`);
    }
  }

  const contextBlock = contextLines.length > 0
    ? `\n\nCase Context:\n${contextLines.join('\n')}\n`
    : '';

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    {
      role: 'user' as const,
      content: [
        `You are assisting with:`,
        `- Product: ${product}`,
        `- Case type: ${caseType}`,
        `- Jurisdiction: ${jurisdiction}`,
        contextBlock,
        `---`,
        ``,
        `Question: ${question.question}`,
        question.helperText ? `Helper text: ${question.helperText}` : '',
        ``,
        `Suggestion guidance: ${question.suggestion_prompt}`,
        ``,
        `Landlord's draft answer:`,
        `"${rawAnswer}"`,
        ``,
        `---`,
        ``,
        `Please respond in the following format ONLY:`,
        ``,
        `Suggested Wording`,
        `<improved answer text that is court-ready and legally precise>`,
        ``,
        `Missing Information`,
        `- item 1 (if any)`,
        `- item 2`,
        ``,
        `Evidence You May Upload`,
        `- evidence type 1`,
        `- evidence type 2`,
        ``,
        `If there is no missing information, write "Missing Information" followed by "None".`,
        `If no evidence suggestions, write "Evidence You May Upload" followed by "None".`,
      ].join('\n'),
    },
  ];

  try {
    const completion = await chatCompletion({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices?.[0]?.message?.content || '';

    if (!content) {
      console.error('[Ask Heaven] Empty response from AI');
      return null;
    }

    // Parse the structured response
    const parsed = parseAskHeavenResponse(content);

    console.log(`[Ask Heaven] Enhanced answer for question ${question.id}`);
    return parsed;
  } catch (error) {
    console.error('[Ask Heaven] Failed to enhance answer:', error);
    return null;
  }
}

/**
 * Parse Ask Heaven's structured response
 */
function parseAskHeavenResponse(content: string): EnhancedAnswer {
  // Split by sections
  const parts = content.split(/Missing Information|Evidence You May Upload/i);

  // Extract suggested wording (everything before "Missing Information")
  const suggestedBlock = parts[0]
    ?.replace(/Suggested Wording/i, '')
    .trim() || content.trim();

  // Extract missing information
  const missingBlock = parts[1] || '';
  const missing_information = missingBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.slice(1).trim())
    .filter((l) => l && l.toLowerCase() !== 'none');

  // Extract evidence suggestions
  const evidenceBlock = parts[2] || '';
  const evidence_suggestions = evidenceBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.slice(1).trim())
    .filter((l) => l && l.toLowerCase() !== 'none');

  return {
    suggested_wording: suggestedBlock,
    missing_information,
    evidence_suggestions,
  };
}
