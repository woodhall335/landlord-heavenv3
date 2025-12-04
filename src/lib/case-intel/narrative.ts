/**
 * AI Narrative Builder
 *
 * Generates court/tribunal-ready narratives using Ask Heaven.
 *
 * CRITICAL:
 * - Uses decision engine for legal context
 * - Never gives strategy or tells user what route to choose
 * - Never invents legal rules beyond decision engine/YAML
 * - Outputs factual summaries only
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { CaseNarrative, NarrativeOptions } from './types';
import {
  getJsonAIClient,
  hasCustomJsonAIClient,
  type ChatMessage,
} from '@/lib/ai/openai-client';

/**
 * Generate comprehensive case narrative
 */
export async function generateCaseNarrative(
  facts: CaseFacts,
  decisionOutput: DecisionOutput,
  options: NarrativeOptions = {}
): Promise<CaseNarrative | null> {
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
    console.warn('OpenAI API key not configured - skipping narrative generation');
    return null;
  }

  try {
    const case_summary = await generateCaseSummary(facts, decisionOutput, options);
    const ground_narratives = await generateGroundNarratives(facts, decisionOutput);
    const arrears_narrative = facts.issues.rent_arrears.has_arrears
      ? await generateArrearsNarrative(facts)
      : undefined;
    const asb_narrative = facts.issues.asb?.has_asb
      ? await generateASBNarrative(facts)
      : undefined;
    const tribunal_narrative = await generateTribunalNarrative(facts, decisionOutput, options);

    return {
      case_summary,
      ground_narratives,
      arrears_narrative,
      asb_narrative,
      tribunal_narrative,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Narrative generation failed:', error);
    return null;
  }
}

/**
 * Generate overall case summary
 */
async function generateCaseSummary(
  facts: CaseFacts,
  decisionOutput: DecisionOutput,
  options: NarrativeOptions
): Promise<string> {
  const jurisdiction = facts.meta.jurisdiction || 'england-wales';
  const target = options.target || 'general';

  const systemPrompt = `You are a legal document assistant. Generate a clear, factual case summary suitable for court/tribunal documents.

RULES:
- Use plain, neutral language
- State facts only - no opinions, strategy, or legal advice
- Include dates, amounts, and concrete events
- Never invent facts not provided
- Never tell the user what route to choose or give strategic advice
- Format as a single narrative paragraph

${getJurisdictionContext(jurisdiction)}`;

  const factsContext = buildFactsContext(facts, decisionOutput);

  const userPrompt = `Generate a case summary for a ${jurisdiction} eviction case.

${factsContext}

Target document: ${target}

Generate a single-paragraph case summary (150-200 words) that:
1. Identifies the parties (landlord and tenant)
2. Describes the property and tenancy
3. States the core issues (arrears, ASB, breach, etc.)
4. Mentions key dates (tenancy start, notice served)
5. Uses factual, court-appropriate language

Output ONLY the paragraph, no preamble or explanation.`;

  const { jsonCompletion } = getJsonAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{ summary: string }>(
      messages,
      {
        type: 'object',
        properties: {
          summary: { type: 'string' },
        },
        required: ['summary'],
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 400,
      }
    );

    return result.json?.summary || 'Case summary could not be generated.';
  } catch (error) {
    console.error('Case summary generation failed:', error);
    return 'Case summary could not be generated.';
  }
}

/**
 * Generate ground-specific narratives
 */
async function generateGroundNarratives(
  facts: CaseFacts,
  decisionOutput: DecisionOutput
): Promise<{ [ground: string]: string }> {
  const narratives: { [ground: string]: string } = {};

  for (const ground of decisionOutput.recommended_grounds) {
    const narrative = await generateGroundNarrative(facts, ground.code, ground.title);
    if (narrative) {
      narratives[ground.code] = narrative;
    }
  }

  return narratives;
}

/**
 * Generate narrative for a specific ground
 */
async function generateGroundNarrative(
  facts: CaseFacts,
  groundCode: string,
  groundTitle: string
): Promise<string> {
  const jurisdiction = facts.meta.jurisdiction || 'england-wales';

  const systemPrompt = `You are a legal document assistant. Generate factual particulars for a specific eviction ground.

RULES:
- State facts only - no opinions or strategy
- Include specific dates, amounts, and events
- Use neutral, court-appropriate language
- Never invent facts not provided
- Focus on evidence supporting this specific ground

${getJurisdictionContext(jurisdiction)}`;

  let factsForGround = '';

  // Extract relevant facts for this ground
  if (groundCode === '8' || groundCode === '10' || groundCode === '11' || groundCode === '1') {
    // Arrears grounds
    factsForGround = buildArrearsFactsContext(facts);
  } else if (groundCode === '14' || groundCode === '3') {
    // ASB grounds
    factsForGround = buildASBFactsContext(facts);
  } else if (groundCode === '12' || groundCode === '2') {
    // Breach grounds
    factsForGround = buildBreachFactsContext(facts);
  } else {
    // Generic
    factsForGround = buildFactsContext(facts, null);
  }

  const userPrompt = `Generate particulars for ${groundTitle} (Ground ${groundCode}).

${factsForGround}

Generate a factual narrative (100-150 words) explaining why this ground applies.
Include specific dates, amounts, and events.
Output ONLY the narrative, no preamble.`;

  const { jsonCompletion } = getJsonAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{ narrative: string }>(
      messages,
      {
        type: 'object',
        properties: {
          narrative: { type: 'string' },
        },
        required: ['narrative'],
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 300,
      }
    );

    return result.json?.narrative || `Particulars for Ground ${groundCode} could not be generated.`;
  } catch (error) {
    console.error(`Ground ${groundCode} narrative generation failed:`, error);
    return `Particulars for Ground ${groundCode} could not be generated.`;
  }
}

/**
 * Generate arrears narrative
 */
export async function generateArrearsNarrative(
  facts: CaseFacts
): Promise<string> {
  const systemPrompt = `You are a legal document assistant. Generate a factual arrears schedule for court documents.

RULES:
- Present arrears chronologically
- Include period dates and amounts
- State total arrears clearly
- Use neutral language
- Never invent amounts or dates`;

  const factsContext = buildArrearsFactsContext(facts);

  const userPrompt = `Generate an arrears schedule narrative.

${factsContext}

Generate a clear, factual arrears narrative (100-150 words) suitable for court documents.
Output ONLY the narrative, no preamble.`;

  const { jsonCompletion } = getJsonAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{ narrative: string }>(
      messages,
      {
        type: 'object',
        properties: {
          narrative: { type: 'string' },
        },
        required: ['narrative'],
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
      }
    );

    return result.json?.narrative || 'Arrears narrative could not be generated.';
  } catch (error) {
    console.error('Arrears narrative generation failed:', error);
    return 'Arrears narrative could not be generated.';
  }
}

/**
 * Generate ASB narrative
 */
export async function generateASBNarrative(
  facts: CaseFacts
): Promise<string> {
  const systemPrompt = `You are a legal document assistant. Generate a factual ASB narrative for court documents.

RULES:
- Describe incidents chronologically
- Include dates and specific behaviors
- Use neutral, factual language
- Avoid inflammatory terms
- State impact clearly`;

  const factsContext = buildASBFactsContext(facts);

  const userPrompt = `Generate an antisocial behaviour narrative.

${factsContext}

Generate a clear, factual ASB narrative (100-150 words) suitable for court documents.
Output ONLY the narrative, no preamble.`;

  const { jsonCompletion } = getJsonAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{ narrative: string }>(
      messages,
      {
        type: 'object',
        properties: {
          narrative: { type: 'string' },
        },
        required: ['narrative'],
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
      }
    );

    return result.json?.narrative || 'ASB narrative could not be generated.';
  } catch (error) {
    console.error('ASB narrative generation failed:', error);
    return 'ASB narrative could not be generated.';
  }
}

/**
 * Generate tribunal/court narrative (jurisdiction-specific)
 */
export async function generateTribunalNarrative(
  facts: CaseFacts,
  decisionOutput: DecisionOutput,
  options: NarrativeOptions = {}
): Promise<string> {
  const jurisdiction = facts.meta.jurisdiction || 'england-wales';
  const target = options.target || 'general';

  const systemPrompt = `You are a legal document assistant. Generate factual particulars for court/tribunal applications.

RULES:
- State chronology of events clearly
- Include all relevant dates and amounts
- Use jurisdiction-appropriate terminology
- Never invent facts
- Never give legal advice or strategy

${getJurisdictionContext(jurisdiction)}`;

  const factsContext = buildFactsContext(facts, decisionOutput);

  const userPrompt = `Generate particulars of claim for a ${jurisdiction} eviction case.

${factsContext}

Target: ${target === 'n119' ? 'N119 Particulars of Claim' : target === 'form_e' ? 'Scotland Form E' : 'General tribunal application'}

Generate a structured narrative (200-250 words) covering:
1. Tenancy details
2. Grounds for possession
3. Chronology of events
4. Current status

Output ONLY the narrative, no preamble.`;

  const { jsonCompletion } = getJsonAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{ narrative: string }>(
      messages,
      {
        type: 'object',
        properties: {
          narrative: { type: 'string' },
        },
        required: ['narrative'],
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 500,
      }
    );

    return result.json?.narrative || 'Tribunal narrative could not be generated.';
  } catch (error) {
    console.error('Tribunal narrative generation failed:', error);
    return 'Tribunal narrative could not be generated.';
  }
}

// =============================================================================
// HELPER FUNCTIONS - BUILD CONTEXT FROM FACTS
// =============================================================================

function buildFactsContext(facts: CaseFacts, decisionOutput: DecisionOutput | null): string {
  let context = '';

  // Parties
  context += `LANDLORD: ${facts.parties.landlord.name || 'Not specified'}\n`;
  if (facts.parties.tenants && facts.parties.tenants.length > 0) {
    context += `TENANT(S): ${facts.parties.tenants.map((t) => t.name).filter(Boolean).join(', ')}\n`;
  }

  // Property
  if (facts.property.address?.line1) {
    context += `PROPERTY: ${facts.property.address.line1}`;
    if (facts.property.address.postcode) context += `, ${facts.property.address.postcode}`;
    context += '\n';
  }

  // Tenancy
  if (facts.tenancy.start_date) {
    context += `TENANCY START: ${facts.tenancy.start_date}\n`;
  }
  if (facts.tenancy.rent_amount) {
    context += `RENT: £${facts.tenancy.rent_amount} ${facts.tenancy.rent_frequency || 'per month'}\n`;
  }

  // Issues
  if (facts.issues.rent_arrears.has_arrears && facts.issues.rent_arrears.total_arrears) {
    context += `ARREARS: £${facts.issues.rent_arrears.total_arrears.toFixed(2)}\n`;
  }
  if (facts.issues.asb?.has_asb) {
    context += `ASB ISSUES: Yes\n`;
  }
  if (facts.issues.breaches?.has_breaches) {
    context += `TENANCY BREACHES: Yes\n`;
  }

  // Notice
  if (facts.notice.service_date) {
    context += `NOTICE SERVED: ${facts.notice.service_date}\n`;
  }
  if (facts.notice.expiry_date) {
    context += `NOTICE EXPIRES: ${facts.notice.expiry_date}\n`;
  }

  // Decision engine context (if provided)
  if (decisionOutput) {
    if (decisionOutput.recommended_grounds.length > 0) {
      context += `RECOMMENDED GROUNDS: ${decisionOutput.recommended_grounds.map((g) => `${g.code} (${g.title})`).join(', ')}\n`;
    }
  }

  return context;
}

function buildArrearsFactsContext(facts: CaseFacts): string {
  let context = '';

  if (facts.tenancy.rent_amount) {
    context += `MONTHLY RENT: £${facts.tenancy.rent_amount}\n`;
  }

  if (facts.issues.rent_arrears.total_arrears) {
    context += `TOTAL ARREARS: £${facts.issues.rent_arrears.total_arrears.toFixed(2)}\n`;
  }

  if (facts.issues.rent_arrears.arrears_items && facts.issues.rent_arrears.arrears_items.length > 0) {
    context += '\nARREARS BREAKDOWN:\n';
    for (const item of facts.issues.rent_arrears.arrears_items) {
      context += `- Period ${item.period_start || '?'} to ${item.period_end || '?'}: £${(item.amount_owed || 0).toFixed(2)}\n`;
    }
  }

  if (facts.issues.section8_grounds?.arrears_breakdown) {
    context += `\nADDITIONAL DETAILS:\n${facts.issues.section8_grounds.arrears_breakdown}\n`;
  }

  return context;
}

function buildASBFactsContext(facts: CaseFacts): string {
  let context = '';

  if (facts.issues.asb?.description) {
    context += `ASB DESCRIPTION:\n${facts.issues.asb.description}\n\n`;
  }

  if (facts.issues.asb?.incidents) {
    const incidents = Array.isArray(facts.issues.asb.incidents)
      ? facts.issues.asb.incidents
      : [facts.issues.asb.incidents];

    context += 'INCIDENTS:\n';
    for (const incident of incidents) {
      if (typeof incident === 'object' && incident !== null) {
        context += `- ${incident.date || 'Date unknown'}: ${incident.description || 'No description'}\n`;
      }
    }
  }

  if (facts.issues.section8_grounds?.incident_log) {
    context += `\nINCIDENT LOG:\n${facts.issues.section8_grounds.incident_log}\n`;
  }

  return context;
}

function buildBreachFactsContext(facts: CaseFacts): string {
  let context = '';

  if (facts.issues.breaches?.description) {
    context += `BREACH DESCRIPTION:\n${facts.issues.breaches.description}\n\n`;
  }

  if (facts.issues.section8_grounds?.breach_details) {
    context += `BREACH DETAILS:\n${facts.issues.section8_grounds.breach_details}\n`;
  }

  if (facts.issues.section8_grounds?.damage_schedule) {
    context += `\nDAMAGE SCHEDULE:\n${facts.issues.section8_grounds.damage_schedule}\n`;
  }

  return context;
}

function getJurisdictionContext(jurisdiction: string): string {
  switch (jurisdiction.toLowerCase()) {
    case 'england-wales':
    case 'england':
    case 'wales':
      return `CONTEXT: England & Wales eviction law. Use Section 8/Section 21 terminology where appropriate.`;

    case 'scotland':
      return `CONTEXT: Scotland eviction law. Use Notice to Leave and First-tier Tribunal terminology. All grounds are discretionary.`;

    case 'northern-ireland':
      return `CONTEXT: Northern Ireland eviction law. Use Notice to Quit terminology.`;

    default:
      return '';
  }
}
