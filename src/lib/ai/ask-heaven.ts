// src/lib/ai/ask-heaven.ts

import type { ChatMessage } from './openai-client';
import { jsonCompletion } from './openai-client';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import type { ProductType } from '@/lib/wizard/mqs-loader';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { CaseIntelligence, ConsistencyReport } from '@/lib/case-intel';

interface EnhanceAnswerArgs {
  question: ExtendedWizardQuestion;
  rawAnswer: string;
  jurisdiction: string;
  product: ProductType;
  caseType: string;
  /** Optional: Decision engine output for context */
  decisionContext?: DecisionOutput;
  /** Optional: Case intelligence for consistency checks */
  caseIntelContext?: CaseIntelligence;
  /** Optional: Wizard facts for context */
  wizardFacts?: Record<string, any>;
}

export interface EnhanceAnswerResult {
  suggested_wording: string;
  missing_information: string[];
  evidence_suggestions: string[];
  /** NEW: Consistency flags from case-intel */
  consistency_flags: string[];
}

/**
 * Enhance a user's free-text answer:
 * - Clean, court-friendly wording
 * - List of missing info
 * - Evidence suggestions
 *
 * If OpenAI is not configured or anything fails, returns null so the wizard
 * continues without blocking.
 *
 * IMPORTANT: We only run this for clearly free-text questions.
 */
export async function enhanceAnswer(
  args: EnhanceAnswerArgs
): Promise<EnhanceAnswerResult | null> {
  const {
    question,
    rawAnswer,
    jurisdiction,
    product,
    caseType,
    decisionContext,
    caseIntelContext,
  } = args;
  // wizardFacts is available in args but not currently used in this function

  // If no key, just skip quietly
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  // Normalise input type – some MQS may use inputType, some input_type
  const inputType: string =
    (question as any).inputType ??
    (question as any).input_type ??
    '';

  const suggestionPrompt: string | undefined = (question as any)
    .suggestion_prompt;

  const hasSuggestionPrompt = !!suggestionPrompt;

  // ✅ Only allow Ask Heaven on clearly free-text questions
  const FREE_TEXT_TYPES = new Set(['textarea', 'text', 'longtext']);

  // If it's not a free-text input, we bail out – EVEN if it has suggestion_prompt
  if (!FREE_TEXT_TYPES.has(inputType)) {
    return null;
  }

  // Build jurisdiction-specific guidance
  const jurisdictionGuidance = getJurisdictionGuidance(jurisdiction, caseType);

  // Build decision engine context (if available)
  const decisionEngineContext = decisionContext
    ? buildDecisionEngineContext(decisionContext)
    : '';

  // Extract consistency flags from case-intel (if available)
  const consistencyFlags = caseIntelContext
    ? extractConsistencyFlags(caseIntelContext.inconsistencies, question)
    : [];

  const systemPrompt = `
You are "Ask Heaven", a cautious legal assistant for landlords.
You help rewrite their rough answers into clear, factual, judge-friendly wording
for court and tribunal forms.

CRITICAL 100% LEGAL-SAFETY RULES (do not violate):
❌ NEVER introduce new legal rules or thresholds
❌ NEVER contradict the decision engine outputs provided
❌ NEVER recommend a legal route ("you should choose X" or "try Section Y")
❌ NEVER give legal strategy or advice
✅ ONLY clarify user-provided facts and highlight missing details
✅ ONLY explain what the decision engine already determined
✅ ONLY structure text into court-appropriate language
✅ The decision engine is the SINGLE SOURCE OF TRUTH for legal rules

Rules:
- Use plain, neutral language.
- Focus on dates, events, amounts, and concrete facts.
- Avoid insults, speculation, and emotional language.
- Never invent facts or dates that weren't given.
- If something is missing, clearly say what is missing rather than guessing.
- If consistency issues are detected, note them factually without judgment.

${jurisdictionGuidance}

${decisionEngineContext}

CRITICAL JSON INSTRUCTIONS:
- You must respond ONLY with a single JSON object.
- Do NOT include any explanation, prose, or markdown.
- The JSON must have this exact shape:

{
  "suggested_wording": string,
  "missing_information": string[],
  "evidence_suggestions": string[],
  "consistency_flags": string[]
}

- The response MUST be valid JSON (double quotes, no trailing commas).
- consistency_flags should highlight contradictions or date/amount mismatches.
`.trim();

  const userPrompt = `
Question (for a landlord-facing wizard):
"${question.question}"

Jurisdiction: ${jurisdiction}
Product: ${product}
Case type: ${caseType}
Input type: ${inputType}

${hasSuggestionPrompt ? `Question-specific guidance:\n${suggestionPrompt}\n` : ''}

Landlord's rough answer:
"${rawAnswer}"

Using this information:
1. Rewrite the answer into clear, factual wording suitable for court/tribunal forms.
2. Identify any important information that appears to be missing.
3. Suggest what evidence or documents the landlord should gather to support this answer.

IMPORTANT:
- Return your answer ONLY as valid JSON (a single json object).
- Do not wrap it in markdown.
- Do not add any text before or after the JSON.
`.trim();

  // Include consistency flags in user prompt if detected
  let userPromptWithConsistency = userPrompt;
  if (consistencyFlags.length > 0) {
    userPromptWithConsistency += `\n\nCONSISTENCY ISSUES DETECTED:\n${consistencyFlags.map(f => `- ${f}`).join('\n')}\n\nPlease note these issues in consistency_flags array.`;
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPromptWithConsistency },
  ];

  // Simple JSON "schema" for our own reference; OpenAI doesn't enforce this
  const schema = {
    type: 'object',
    properties: {
      suggested_wording: { type: 'string' },
      missing_information: {
        type: 'array',
        items: { type: 'string' },
      },
      evidence_suggestions: {
        type: 'array',
        items: { type: 'string' },
      },
      consistency_flags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['suggested_wording', 'missing_information', 'evidence_suggestions', 'consistency_flags'],
  };

  try {
    const result = await jsonCompletion<EnhanceAnswerResult>(messages, schema, {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 800, // Increased for consistency_flags
    });

    const json = result.json || ({} as Partial<EnhanceAnswerResult>);

    return {
      suggested_wording: json.suggested_wording ?? '',
      missing_information: json.missing_information ?? [],
      evidence_suggestions: json.evidence_suggestions ?? [],
      consistency_flags: json.consistency_flags ?? consistencyFlags, // Fallback to detected flags
    };
  } catch (error) {
    console.error(
      'enhanceAnswer failed, proceeding without suggestions:',
      error
    );
    // Let the wizard continue without blocking
    return null;
  }
}

/**
 * Returns jurisdiction-specific legal guidance for Ask Heaven.
 * This helps the AI provide contextually relevant suggestions.
 *
 * Audit items: C2, C4 - Make Ask Heaven jurisdiction-aware
 */
function getJurisdictionGuidance(jurisdiction: string, caseType: string): string {
  // Only provide guidance for eviction cases
  if (caseType !== 'eviction') {
    return '';
  }

  switch (jurisdiction.toLowerCase()) {
    case 'england-wales':
    case 'england':
    case 'wales':
      return `
JURISDICTION-SPECIFIC CONTEXT (England & Wales):
- Section 21 (no-fault evictions) requires strict compliance: deposit protection, prescribed information, gas safety certificate, EPC, "How to Rent" guide provided at start, and valid HMO/selective license if required.
- Section 8 (fault-based evictions) uses numbered grounds: Ground 8 (serious arrears, 2+ months) is mandatory if threshold met at notice AND hearing; Grounds 10/11 (lesser arrears, persistent late payment) are discretionary; Ground 14 (ASB/nuisance); Ground 12 (tenancy breach).
- Courts require clear evidence: dated records, payment histories, witness statements, photographs, correspondence logs.
- Notice periods: Section 21 requires 2 months; Section 8 can be 2 weeks (serious grounds) or 2 months.
- Emphasize facts that support the ground being used, and note any compliance issues that could block Section 21.
`.trim();

    case 'scotland':
      return `
JURISDICTION-SPECIFIC CONTEXT (Scotland):
- ALL grounds are discretionary - the First-tier Tribunal has full discretion on every case.
- NO Section 21 equivalent - landlords MUST have a valid ground for possession.
- Pre-action requirements are MANDATORY for rent arrears (Ground 1): must contact tenant, signpost to debt advice, and attempt reasonable resolution before serving Notice to Leave.
- Notice to Leave grounds include: Ground 1 (rent arrears, 3+ months with pre-action), Ground 2 (tenancy breach), Ground 3 (antisocial behaviour), Ground 4 (landlord to occupy - must not re-let within 3 months or face penalty).
- Notice periods: 28 days for serious grounds (arrears at notice date, ASB), 84 days for others (landlord occupation, sale, refurbishment).
- Tribunal considers reasonableness, proportionality, and tenant circumstances in EVERY case.
- Penalties for misuse: up to 6 months' rent if Ground 4/5 used dishonestly.
- Emphasize pre-action compliance for arrears cases and genuine intentions for landlord occupation/sale grounds.
`.trim();

    case 'northern-ireland':
    case 'northern ireland':
      return `
JURISDICTION-SPECIFIC CONTEXT (Northern Ireland):
- NI eviction workflows are not yet fully supported in this system.
- General guidance: NI uses Notice to Quit procedures similar to pre-2015 England & Wales.
- Consult a local NI solicitor for specific eviction advice.
`.trim();

    default:
      return '';
  }
}

/**
 * Build decision engine context for Ask Heaven
 *
 * Provides factual context about what the decision engine determined.
 * NEVER creates new rules - only describes existing outputs.
 */
function buildDecisionEngineContext(decision: DecisionOutput): string {
  let context = '\n\nDECISION ENGINE CONTEXT (do not contradict these facts):\n';

  // Recommended routes
  if (decision.recommended_routes && decision.recommended_routes.length > 0) {
    context += `\nRecommended Routes: ${decision.recommended_routes.map(r => r.toUpperCase()).join(', ')}\n`;
  }

  // Blocking issues
  const blockingIssues = decision.blocking_issues.filter(b => b.severity === 'blocking');
  if (blockingIssues.length > 0) {
    context += '\nBLOCKED ROUTES:\n';
    for (const block of blockingIssues) {
      context += `  - ${block.route.toUpperCase()}: ${block.description}\n`;
    }
    context += '\n⚠️  When describing blocked routes, state the facts but NEVER recommend alternative routes.\n';
  }

  // Recommended grounds
  if (decision.recommended_grounds && decision.recommended_grounds.length > 0) {
    context += '\nRecommended Grounds:\n';
    for (const ground of decision.recommended_grounds) {
      context += `  - Ground ${ground.code}: ${ground.title}`;
      if (ground.type === 'mandatory') context += ' [MANDATORY]';
      if (ground.type === 'discretionary') context += ' [DISCRETIONARY]';
      context += '\n';
    }
  }

  // Warnings
  if (decision.warnings && decision.warnings.length > 0) {
    context += '\nWarnings:\n';
    for (const warning of decision.warnings.slice(0, 3)) {
      context += `  - ${warning}\n`;
    }
  }

  // Pre-action requirements (Scotland)
  if (decision.pre_action_requirements && decision.pre_action_requirements.required) {
    context += '\nPre-Action Requirements:\n';
    context += `  Required: ${decision.pre_action_requirements.required}\n`;
    context += `  Met: ${decision.pre_action_requirements.met ?? 'Unknown'}\n`;
    if (decision.pre_action_requirements.details && decision.pre_action_requirements.details.length > 0) {
      for (const detail of decision.pre_action_requirements.details) {
        context += `  - ${detail}\n`;
      }
    }
  }

  context += '\nYou may reference these facts in your response, but NEVER override them.\n';

  return context;
}

/**
 * Extract consistency flags relevant to this question
 */
function extractConsistencyFlags(
  consistencyReport: ConsistencyReport,
  question: ExtendedWizardQuestion
): string[] {
  const flags: string[] = [];
  const questionId = (question as any).id;

  // Check for critical inconsistencies
  const criticalIssues = consistencyReport.inconsistencies.filter(
    (i) => i.severity === 'critical'
  );

  for (const issue of criticalIssues) {
    // Check if this question is involved in the inconsistency
    if (issue.fields.some((f) => f.includes(questionId))) {
      flags.push(`${issue.category.toUpperCase()}: ${issue.message}`);
    }
  }

  // Check for warning-level issues that mention common fields
  const warningIssues = consistencyReport.inconsistencies.filter(
    (i) => i.severity === 'warning'
  );

  for (const issue of warningIssues.slice(0, 2)) {
    // Only show top 2 warnings
    if (
      issue.category === 'arrears' &&
      (questionId.includes('arrears') || questionId.includes('rent'))
    ) {
      flags.push(`ARREARS: ${issue.message}`);
    } else if (issue.category === 'timeline' && questionId.includes('date')) {
      flags.push(`TIMELINE: ${issue.message}`);
    }
  }

  return flags;
}
