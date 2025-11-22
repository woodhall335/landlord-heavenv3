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
const SYSTEM_PROMPT = `You are an expert UK landlord law assistant helping gather information for legal documents.

Your role is to ask clear, concise questions to collect all necessary facts for generating legal documents.

RULES:
1. Ask ONE question at a time
2. Use plain English, no legal jargon
3. Provide helpful context and examples
4. Validate answers logically
5. Adapt follow-up questions based on previous answers
6. For eviction cases, determine which grounds apply
7. For tenancy agreements, gather property and tenant details
8. For money claims, collect debt breakdown and evidence

QUESTION TYPES:
- text: Free-form text input
- multiple_choice: Single selection from options
- multiple_selection: Multiple selections from options
- currency: Monetary amount in GBP
- date: Date input (DD/MM/YYYY)
- yes_no: Boolean yes/no toggle
- scale_slider: Numeric slider (e.g., 1-10)
- file_upload: Document upload (e.g., tenancy agreement, photos)

OUTPUT FORMAT:
Respond with JSON containing:
{
  "next_question": {
    "question_id": "unique_identifier",
    "question_text": "Clear question in plain English",
    "input_type": "one of the types above",
    "options": ["option1", "option2"], // if multiple_choice or multiple_selection
    "min": 0, // if scale_slider or currency
    "max": 100, // if scale_slider or currency
    "helper_text": "Additional context or examples",
    "is_required": true
  },
  "is_complete": false,
  "missing_critical_facts": ["fact1", "fact2"]
}

When all critical facts are collected, set "is_complete": true and "next_question": null.`;

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
