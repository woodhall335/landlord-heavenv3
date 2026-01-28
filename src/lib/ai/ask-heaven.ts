// src/lib/ai/ask-heaven.ts

import type { ChatMessage } from './openai-client';
import { getJsonAIClient, hasCustomJsonAIClient } from './openai-client';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import type { ProductType } from '@/lib/wizard/mqs-loader';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { CaseIntelligence, ConsistencyReport } from '@/lib/case-intel';

/**
 * Shared system persona for all Ask Heaven modes (wizard + chat).
 * Behaves like a cautious, high-end UK housing solicitor but
 * does NOT create a solicitor–client relationship or give
 * personalised legal advice.
 */
export const ASK_HEAVEN_BASE_SYSTEM_PROMPT = `
You are "Ask Heaven", an ultra-specialised UK landlord & housing law assistant.

Think and communicate like a cautious, £500/hour senior solicitor who:
- Practices ONLY in UK residential landlord/tenant law.
- Handles eviction notices, possession claims, rent arrears, money claims,
  tenancy agreements (AST/PRT/NI), HMO and licensing, safety & compliance.

CRITICAL SCOPE & SAFETY RULES:
- You are NOT the user's lawyer and do NOT create a solicitor–client relationship.
- You do NOT give personalised legal advice (no "you should definitely do X").
- You MUST stay within UK landlord/tenant/property law.
- If the question is outside landlord/tenant/property law
  (e.g. politics, health, "price of milk", general life advice),
  clearly say you are restricted to landlord issues and decline.

ALLOWED:
- Explain relevant law and procedure in neutral terms.
- Outline typical options landlords might discuss with a solicitor.
- Highlight risks, deadlines, and evidence gaps.
- Help users express their own facts clearly for forms and letters.

PROHIBITED:
- Inventing new legal rules or thresholds.
- Contradicting the platform's decision engine outputs.
- Selecting specific legal routes for the user ("do Section 8", "choose Ground 1").
- Guaranteeing outcomes or giving aggressive litigation strategy.

QUALITY RULES (behave like a top-tier solicitor):
- Be precise with terminology (e.g. "Section 8, Ground 8", "Notice to Leave",
  "Pre-Action Protocol for Debt Claims", "Simple Procedure").
- Separate clearly:
  - Facts (what the user has told you),
  - Law (what the rules/procedures say),
  - Options (what landlords typically consider),
  - Risks (what could go wrong / where judges focus).
- Never invent facts or dates. If something is missing, say what is missing.
- Prefer short, structured answers with headings and bullet points over walls of text.
- For borderline or high-stakes situations, suggest speaking to a qualified
  housing solicitor or adviser.

When decision-engine or case-intel data is provided, treat it as the
authoritative source of legal rules. You must NOT contradict it.
`.trim();

export interface EnhanceAnswerArgs {
  /** Optional: Case id so Ask Heaven can thread conversations to a specific case */
  caseId?: string;

  /** The MQS / wizard question being answered */
  question: ExtendedWizardQuestion;

  /** Raw user answer (as typed) */
  rawAnswer: string;

  /** Jurisdiction slug, e.g. 'england-wales' */
  jurisdiction: string;

  /** Product, e.g. 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement' */
  product: ProductType;

  /** Case type, e.g. 'eviction' | 'money_claim' | 'tenancy_agreement' */
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
  /** Consistency flags from case-intel / model */
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
    caseId,
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
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
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
    ? extractConsistencyFlags(caseIntelContext?.inconsistencies, question)
    : [];

  // Optional case metadata string so caseId is actually used
  const caseMetadata = caseId ? `Case ID: ${caseId}\n` : '';

  const systemPrompt = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

You are currently acting in WIZARD ANSWER ENHANCEMENT mode.

Your job in this mode:
- Rewrite the landlord's rough answer into clear, factual, judge-friendly wording
  for court and tribunal forms.
- Highlight important missing information.
- Suggest evidence that would typically support this answer.

ADDITIONAL HARD RULES FOR THIS MODE:
❌ NEVER introduce new legal rules or thresholds.
❌ NEVER contradict the decision engine outputs provided.
❌ NEVER recommend a legal route ("you should choose X" or "try Section Y").
❌ NEVER give personalised legal strategy ("definitely issue a claim now").
✅ ONLY clarify user-provided facts and highlight missing details.
✅ ONLY explain what the decision engine already determined.
✅ ONLY structure text into court-appropriate language.
✅ The decision engine is the SINGLE SOURCE OF TRUTH for legal rules.

Case context:
${caseMetadata}Jurisdiction: ${jurisdiction}
Product: ${product}
Case type: ${caseType}

General wording rules:
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
    userPromptWithConsistency += `\n\nCONSISTENCY ISSUES DETECTED:\n${consistencyFlags
      .map((f) => `- ${f}`)
      .join('\n')}\n\nPlease note these issues in consistency_flags array.`;
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
    required: [
      'suggested_wording',
      'missing_information',
      'evidence_suggestions',
      'consistency_flags',
    ],
  };

  try {
    const result = await getJsonAIClient().jsonCompletion<EnhanceAnswerResult>(
      messages,
      schema,
      {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 800, // Increased for consistency_flags
      },
    );

    const json = result.json || ({} as Partial<EnhanceAnswerResult>);
    const evidenceSuggestions =
      (json as any).evidence_suggestions ??
      (json as any).evidence_you_may_upload ??
      [];
    const missingInformation =
      (json as any).missing_information ?? (json as any).missing_info ?? [];
    const consistencyFlagsFromModel =
      (json as any).consistency_flags ??
      (json as any).consistency_issues ??
      undefined;

    return {
      suggested_wording: (json as any).suggested_wording ?? '',
      missing_information: missingInformation,
      evidence_suggestions: evidenceSuggestions,
      consistency_flags: consistencyFlagsFromModel ?? consistencyFlags, // Fallback to detected flags
    };
  } catch (error) {
    console.error(
      'enhanceAnswer failed, proceeding without suggestions:',
      error,
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
      return `
JURISDICTION-SPECIFIC CONTEXT (England):
- Section 21 (no-fault evictions) requires strict compliance: deposit protection, prescribed information, gas safety certificate, EPC, "How to Rent" guide provided at start, and valid HMO/selective license if required.
- Section 8 (fault-based evictions) uses numbered grounds: Ground 8 (serious arrears, 2+ months) is mandatory if threshold met at notice AND hearing; Grounds 10/11 (lesser arrears, persistent late payment) are discretionary; Ground 14 (ASB/nuisance); Ground 12 (tenancy breach).
- Courts require clear evidence: dated records, payment histories, witness statements, photographs, correspondence logs.
- Notice periods: Section 21 requires 2 months; Section 8 can be 2 weeks (serious grounds) or 2 months.
- Terminology: tenant, assured shorthold tenancy (AST), Housing Act 1988.
- Emphasize facts that support the ground being used, and note any compliance issues that could block Section 21.
`.trim();

    case 'wales':
      return `
JURISDICTION-SPECIFIC CONTEXT (Wales):
- Wales uses the Renting Homes (Wales) Act 2016 - NOT Housing Act 1988.
- Terminology: "contract holder" (not tenant), "occupation contract" (not tenancy), "landlord" remains the same.
- Section 173 (no-fault possession) is ONLY available for standard occupation contracts. Requires 6 months notice and strict compliance: Rent Smart Wales registration, deposit protection, all safety certificates.
- Section 173 is BLOCKED for supported standard and secure contracts - must use fault-based routes instead.
- Fault-based notices: Section 157 (serious rent arrears, 2+ months), Section 159 (some rent arrears), Section 161 (antisocial behaviour), Section 162 (breach of contract).
- Courts require clear evidence: dated records, payment histories, witness statements, photographs, correspondence logs.
- NEVER suggest Section 21 or Section 8 in Wales - these are England-only routes.
- Emphasize Rent Smart Wales compliance and use correct Welsh terminology (contract holder, occupation contract).
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
- AVAILABLE PRODUCTS: Only Tenancy Agreement is available for Northern Ireland. Eviction Pack, Complete Pack, and Money Claim Pack are NOT available for this jurisdiction.
`.trim();

    default:
      return '';
  }
}

/**
 * Returns region-aware product availability guidance.
 * Used to inform AI responses about what products are available in each jurisdiction.
 *
 * Regional Product Availability (January 2026):
 * - England: All products (notice_only, complete_pack, money_claim, tenancy_agreement)
 * - Wales: notice_only, tenancy_agreement only
 * - Scotland: notice_only, tenancy_agreement only
 * - Northern Ireland: tenancy_agreement only
 */
export function getRegionalProductGuidance(jurisdiction: string, product?: string): string {
  const normalizedJurisdiction = jurisdiction.toLowerCase();

  // If product is specified, check if it's available
  if (product) {
    const englandOnlyProducts = ['complete_pack', 'eviction_pack', 'money_claim'];
    const notAvailableInNI = ['notice_only', ...englandOnlyProducts];

    if (normalizedJurisdiction === 'northern-ireland' && notAvailableInNI.includes(product)) {
      return `⚠️ ${product} is not available in Northern Ireland. Only Tenancy Agreement is available for this jurisdiction.`;
    }

    if ((normalizedJurisdiction === 'wales' || normalizedJurisdiction === 'scotland') && englandOnlyProducts.includes(product)) {
      const regionName = normalizedJurisdiction === 'wales' ? 'Wales' : 'Scotland';
      const alternative = product === 'money_claim'
        ? 'Consider using Notice Only (£49.99) for rent arrears eviction notices instead.'
        : 'Consider using Notice Only (£49.99) for eviction notices instead.';
      return `⚠️ ${product} is only available in England, not ${regionName}. ${alternative}`;
    }
  }

  // General guidance by jurisdiction
  switch (normalizedJurisdiction) {
    case 'england':
      return 'All products are available in England: Notice Only, Complete Pack, Money Claim Pack, and Tenancy Agreement.';

    case 'wales':
      return 'In Wales, only Notice Only (£49.99) and Tenancy Agreement are available. Complete Pack and Money Claim Pack are England-only.';

    case 'scotland':
      return 'In Scotland, only Notice Only (£49.99) and Tenancy Agreement are available. Complete Pack and Money Claim Pack are England-only.';

    case 'northern-ireland':
    case 'northern ireland':
      return 'In Northern Ireland, only Tenancy Agreement is available. Eviction notices and Money Claim Pack are not currently supported.';

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

  const recommendedRoutes = Array.isArray(decision.recommended_routes)
    ? decision.recommended_routes
    : [];
  const blockingIssues = Array.isArray(decision.blocking_issues)
    ? decision.blocking_issues
    : [];
  const recommendedGrounds = Array.isArray(decision.recommended_grounds)
    ? decision.recommended_grounds
    : [];
  const warnings = Array.isArray(decision.warnings) ? decision.warnings : [];
  const preAction = decision.pre_action_requirements ?? null;

  // Recommended routes
  if (recommendedRoutes.length > 0) {
    context += `\nRecommended Routes: ${recommendedRoutes
      .map((r) => r.toUpperCase())
      .join(', ')}\n`;
  }

  // Blocking issues
  const blockingOnly = blockingIssues.filter(
    (b) => b?.severity === 'blocking',
  );
  if (blockingOnly.length > 0) {
    context += '\nBLOCKED ROUTES:\n';
    for (const block of blockingOnly) {
      if (!block) continue;
      const routeLabel =
        typeof block.route === 'string'
          ? block.route.toUpperCase()
          : 'UNKNOWN ROUTE';
      const description =
        typeof block.description === 'string'
          ? block.description
          : 'Review required';
      context += `  - ${routeLabel}: ${description}\n`;
    }
    context +=
      '\n⚠️  When describing blocked routes, state the facts but NEVER recommend alternative routes.\n';
  }

  // Recommended grounds
  if (recommendedGrounds.length > 0) {
    context += '\nRecommended Grounds:\n';
    for (const ground of recommendedGrounds) {
      if (!ground) continue;
      const label =
        typeof ground.code === 'string' ? ground.code : 'Unknown';
      const title =
        typeof ground.title === 'string' ? ground.title : 'Review required';
      context += `  - Ground ${label}: ${title}`;
      if (ground.type === 'mandatory') context += ' [MANDATORY]';
      if (ground.type === 'discretionary') context += ' [DISCRETIONARY]';
      context += '\n';
    }
  }

  // Warnings
  if (warnings.length > 0) {
    context += '\nWarnings:\n';
    for (const warning of warnings.slice(0, 3)) {
      context += `  - ${warning}\n`;
    }
  }

  // Pre-action requirements (Scotland-style summary object)
  if (preAction && typeof preAction === 'object') {
    context += '\nPre-Action Requirements:\n';
    context += `  Required: ${preAction.required}\n`;
    context += `  Met: ${preAction.met ?? 'Unknown'}\n`;
    if (Array.isArray(preAction.details) && preAction.details.length > 0) {
      for (const detail of preAction.details) {
        context += `  - ${detail}\n`;
      }
    }
  }

  context +=
    '\nYou may reference these facts in your response, but NEVER override them.\n';

  return context;
}

/**
 * Extract consistency flags relevant to this question
 */
function extractConsistencyFlags(
  consistencyReport:
    | ConsistencyReport
    | { inconsistencies?: any[] }
    | any[]
    | undefined,
  question: ExtendedWizardQuestion,
): string[] {
  const flags: string[] = [];
  const questionId = (question as any).id ?? '';

  const inconsistencies = Array.isArray(
    (consistencyReport as any)?.inconsistencies,
  )
    ? (consistencyReport as any).inconsistencies
    : Array.isArray(consistencyReport)
    ? consistencyReport
    : [];

  const criticalIssues = inconsistencies.filter(
    (i: any) => i?.severity === 'critical',
  );

  for (const issue of criticalIssues) {
    if (!issue || !Array.isArray(issue.fields)) continue;
    if (
      issue.fields.some(
        (f: string) =>
          questionId && typeof f === 'string' && f.includes(questionId),
      )
    ) {
      const category =
        typeof issue.category === 'string'
          ? issue.category.toUpperCase()
          : 'CONSISTENCY';
      const message =
        typeof issue.message === 'string'
          ? issue.message
          : 'Review required';
      flags.push(`${category}: ${message}`);
    }
  }

  const warningIssues = inconsistencies.filter(
    (i: any) => i?.severity === 'warning',
  );

  for (const issue of warningIssues.slice(0, 2)) {
    if (!issue) continue;

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
