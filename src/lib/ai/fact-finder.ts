/**
 * Fact-Finding AI
 *
 * Intelligent conversational wizard that asks questions to gather case facts
 * Uses GPT-4o-mini for cost-effective fact-finding
 */

import { chatCompletion, ChatMessage } from './openai-client';

export interface WizardQuestion {
  question_id: string;
  question_text: string;
  input_type: 'text' | 'multiple_choice' | 'currency' | 'date' | 'multiple_selection' | 'file_upload' | 'scale_slider' | 'yes_no';
  options?: string[]; // For multiple_choice, multiple_selection
  min?: number; // For scale_slider, currency
  max?: number; // For scale_slider, currency
  helper_text?: string;
  validation_rules?: Record<string, any>;
  is_required: boolean;
  depends_on?: {
    question_id: string;
    required_value: any;
  };
}

export interface FactFinderRequest {
  case_type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  collected_facts: Record<string, any>;
  conversation_history?: ChatMessage[];
}

export interface FactFinderResponse {
  next_question: WizardQuestion | null;
  is_complete: boolean;
  missing_critical_facts: string[];
  conversation_history: ChatMessage[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
  };
}

/**
 * System prompt for fact-finding wizard
 */
const SYSTEM_PROMPT = `You are a senior UK property litigation solicitor charging £500 per hour. Your expertise spans landlord and tenant law, possession proceedings, and residential tenancies. You are conducting a professional client intake.

Your role is to obtain precise, legally sufficient information with the thoroughness and professionalism expected at the highest level of legal practice.

PROFESSIONAL STANDARDS:
1. NEVER ask about facts ALREADY obtained - review "Facts Collected So Far" meticulously
2. NEVER repeat questions - each inquiry must advance the matter substantively
3. Maintain efficiency - gather 12-18 critical facts, no more
4. DO NOT ask for "additional information" more than ONCE - clients expect precision, not repetition
5. Each question must have forensic purpose and unique identification
6. Use clear, professional language - accessible but authoritative
7. Prioritize case-critical facts over peripheral details

CASE-TYPE SPECIFIC REQUIREMENTS:

**TENANCY_AGREEMENT (Creating New Agreement):**
You are DRAFTING a new tenancy agreement. Ask ONLY information needed to CREATE the document:
✓ Property address (full postal address)
✓ Landlord full name and contact address
✓ Tenant(s) full name(s) and contact details
✓ Rent amount and payment frequency
✓ Tenancy start date and initial term
✓ Deposit amount
✓ Furnished/unfurnished status
✓ Who pays utilities/council tax
✓ Any special terms (pets, rent reviews, break clauses)
✓ Prohibited use restrictions

✗ DO NOT ask for: payment history, witnesses, existing agreements to upload, breach details, arrears, court documents
✗ DO NOT request file_upload - we are CREATING the agreement, not reviewing an existing one
Complete after 10-15 questions when you have sufficient details to draft the agreement.

**EVICTION (Possession Proceedings):**
You are gathering evidence for possession proceedings. Required information:
✓ Tenant details and property address
✓ Type of tenancy (AST, contractual, periodic)
✓ Grounds for possession (Section 8/21, specific grounds)
✓ Notice served (type, date, compliance)
✓ Arrears amount and payment history
✓ Property condition issues (if relevant)
✓ Request file_upload for: existing tenancy agreement, Section 21/8 notice, rent statements, correspondence
Complete after 15-20 questions when you have evidence for court application.

**MONEY_CLAIM (Debt Recovery):**
You are gathering evidence for money claim proceedings. Required information:
✓ Debtor details
✓ Nature of debt (rent arrears, damages, breach)
✓ Contract/agreement basis
✓ Amount owed (itemized breakdown)
✓ Payment history and missed payments
✓ Demands sent and responses
✓ Request file_upload for: tenancy agreement, invoices, payment records, demand letters
Complete after 12-18 questions when you have documentary basis for claim.

COMPLETION CRITERIA:
- Conclude when sufficient facts obtained for the specific task
- If client responds "null", "no information", or "unknown" to optional matters, proceed to completion
- Set "is_complete": true when you possess adequate instructions

INPUT TYPES:
- text: Narrative or specific information
- multiple_choice: Selection from defined options
- yes_no: Binary determination
- currency: Monetary sums in GBP
- date: Dates in DD/MM/YYYY format
- file_upload: Documentary evidence (tenancy agreements, notices, statements, correspondence)

OUTPUT FORMAT:
{
  "next_question": {
    "question_id": "unique_identifier_never_used_before",
    "question_text": "Professional, precise question",
    "input_type": "one of the types above",
    "options": ["option1", "option2"], // if multiple_choice
    "helper_text": "Brief explanation of legal significance",
    "is_required": true
  },
  "is_complete": false,
  "missing_critical_facts": ["fact1", "fact2"]
}

Conclude fact-finding when you have obtained sufficient instructions to prepare court-ready documentation. Set "is_complete": true and "next_question": null.`;

/**
 * Get next question from AI based on case progress
 */
export async function getNextQuestion(
  request: FactFinderRequest
): Promise<FactFinderResponse> {
  const { case_type, jurisdiction, collected_facts, conversation_history = [] } = request;

  // Build context message
  const contextMessage: ChatMessage = {
    role: 'user',
    content: `
**Case Context:**
- Case Type: ${case_type}
- Jurisdiction: ${jurisdiction}
- Facts Collected So Far: ${JSON.stringify(collected_facts, null, 2)}

Please determine the next question to ask, or indicate if fact-finding is complete.
`,
  };

  const messages: ChatMessage[] = [
    ...conversation_history,
    contextMessage,
  ];

  try {
    const response = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1500,
      }
    );

    // Parse JSON response
    let parsedResponse: {
      next_question: WizardQuestion | null;
      is_complete: boolean;
      missing_critical_facts: string[];
    };

    try {
      parsedResponse = JSON.parse(response.content);
    } catch (parseError) {
      // Fallback: Extract JSON from response if not pure JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // Update conversation history
    const updatedHistory = [
      ...messages,
      { role: 'assistant', content: response.content },
    ];

    return {
      next_question: parsedResponse.next_question,
      is_complete: parsedResponse.is_complete,
      missing_critical_facts: parsedResponse.missing_critical_facts || [],
      conversation_history: updatedHistory,
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        cost_usd: response.cost_usd,
      },
    };
  } catch (error: any) {
    console.error('Fact-finder AI error:', error);
    throw new Error(`Fact-finder AI error: ${error.message}`);
  }
}

/**
 * Validate user's answer to a question
 */
export async function validateAnswer(
  question: WizardQuestion,
  answer: any
): Promise<{ valid: boolean; error?: string; normalized_value?: any }> {
  // Basic validation based on input type
  switch (question.input_type) {
    case 'yes_no':
      if (typeof answer !== 'boolean') {
        return { valid: false, error: 'Answer must be yes or no' };
      }
      break;

    case 'currency':
      const amount = parseFloat(answer);
      if (isNaN(amount)) {
        return { valid: false, error: 'Invalid currency amount' };
      }
      if (question.min !== undefined && amount < question.min) {
        return { valid: false, error: `Amount must be at least £${question.min}` };
      }
      if (question.max !== undefined && amount > question.max) {
        return { valid: false, error: `Amount must not exceed £${question.max}` };
      }
      return { valid: true, normalized_value: amount };

    case 'date':
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(answer)) {
        return { valid: false, error: 'Date must be in DD/MM/YYYY format' };
      }
      break;

    case 'multiple_choice':
      if (!question.options?.includes(answer)) {
        return { valid: false, error: 'Please select a valid option' };
      }
      break;

    case 'multiple_selection':
      if (!Array.isArray(answer)) {
        return { valid: false, error: 'Please select at least one option' };
      }
      const invalidOptions = answer.filter((a) => !question.options?.includes(a));
      if (invalidOptions.length > 0) {
        return { valid: false, error: 'Invalid options selected' };
      }
      break;

    case 'scale_slider':
      const value = parseFloat(answer);
      if (isNaN(value)) {
        return { valid: false, error: 'Invalid value' };
      }
      if (question.min !== undefined && value < question.min) {
        return { valid: false, error: `Value must be at least ${question.min}` };
      }
      if (question.max !== undefined && value > question.max) {
        return { valid: false, error: `Value must not exceed ${question.max}` };
      }
      break;

    case 'text':
      if (question.is_required && (!answer || answer.trim() === '')) {
        return { valid: false, error: 'This field is required' };
      }
      break;

    default:
      break;
  }

  return { valid: true, normalized_value: answer };
}
