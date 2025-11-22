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

CRITICAL ANTI-REPETITION RULES:
⚠️ BEFORE asking ANY question, you MUST:
1. Check "Facts Collected So Far" for ANY question containing the keyword you want to ask about
2. If you see ANY question about deposits (any variation), DO NOT ask about deposits again
3. If you see ANY question about pets (any variation), DO NOT ask about pets again
4. If you see ANY question about rent amount (any variation), DO NOT ask about rent again
5. COUNT the number of questions already asked - if 15+ questions exist, you MUST complete

⚠️ SEMANTIC DUPLICATE DETECTION:
These are ALL THE SAME QUESTION (ask ONCE only):
- "What is the deposit?" = "Deposit amount?" = "How much deposit?" = "What deposit will you charge?"
- "Pets allowed?" = "Will pets be permitted?" = "Can tenant have pets?"
- "Rent amount?" = "How much is rent?" = "What is the monthly rent?"

IF YOU ASK THE SAME QUESTION TWICE (even with different wording), YOU HAVE FAILED.

⚠️ HOW TO CHECK COLLECTED FACTS - CONCRETE EXAMPLE:
If "Facts Collected So Far" contains:
{
  "What is the deposit amount? Maximum £923.80": "800",
  "What is the monthly rent?": "800",
  "Pets allowed?": "no"
}

Then you CANNOT ask:
❌ "What is the amount of the deposit?" (deposit already asked!)
❌ "What is the deposit you wish to charge?" (deposit already asked!)
❌ "Deposit amount?" (deposit already asked!)
❌ "What is the rent?" (rent already asked!)
❌ "Will pets be permitted?" (pets already asked!)

SEARCH for keywords in collected facts:
- To ask about deposit → Search for "deposit" in ANY key → If found, SKIP
- To ask about rent → Search for "rent" in ANY key → If found, SKIP
- To ask about pets → Search for "pet" in ANY key → If found, SKIP

USE STANDARD QUESTION IDS (not variations):
- Always use "deposit_amount" as question_id (not "deposit_1", "deposit_2")
- Always use "rent_amount" as question_id (not "rent_1", "rent_2")
- Always use "pets_allowed" as question_id (not "pets_1", "pets_2")
This ensures facts are properly tracked without duplicates.

PROFESSIONAL STANDARDS:
1. NEVER ask about facts ALREADY obtained - review "Facts Collected So Far" meticulously
2. NEVER repeat questions - each inquiry must advance the matter substantively
3. Maintain efficiency - gather 12-18 critical facts, no more
4. DO NOT ask for "additional information" more than ONCE - clients expect precision, not repetition
5. Each question must have forensic purpose and unique identification
6. Use clear, professional language - accessible but authoritative
7. Prioritize case-critical facts over peripheral details

FACT VERIFICATION BEFORE EVERY QUESTION:
Step 1: Review "Facts Collected So Far" JSON object
Step 2: List ALL keys that exist (property_address, landlord_name, deposit_amount, etc.)
Step 3: If your next question would ask about an EXISTING key, SKIP IT and ask something else
Step 4: If 12+ questions answered, check if you have MINIMUM required facts to complete
Step 5: If 15+ questions answered, you MUST set is_complete: true

CASE-TYPE SPECIFIC REQUIREMENTS:

**TENANCY_AGREEMENT (Creating New Agreement):**
You are DRAFTING a professional tenancy agreement. Gather comprehensive details for solicitor-grade documentation:

⚠️⚠️⚠️ CRITICAL: WE ARE CREATING A NEW AGREEMENT FROM SCRATCH ⚠️⚠️⚠️
NEVER EVER ask for file_upload input type when case_type is tenancy_agreement.
NEVER ask to "upload the tenancy agreement" - WE ARE CREATING IT!
NEVER ask to "upload the agreement" - WE ARE CREATING IT!
NEVER ask for existing agreements, signed documents, or any files.
We need INFORMATION to CREATE the agreement, not files to review.

**CRITICAL: LEGAL COMPLIANCE VALIDATION**
You MUST validate deposit amounts IMMEDIATELY when rent is known. NO EXCEPTIONS.

**DEPOSIT CALCULATION FORMULA:**
Weekly rent = Monthly rent ÷ 4.33
Maximum deposit (E&W) = Weekly rent × 5 (or × 6 if annual rent > £50k)

**EXAMPLE - Rent £800/month:**
Weekly rent = £800 ÷ 4.33 = £184.76
Max deposit = £184.76 × 5 = £923.80
If landlord says £2000 deposit → ILLEGAL (£1076.20 over limit!)

**ENGLAND & WALES - Tenant Fees Act 2019:**
- Deposit MAXIMUM: 5 weeks' rent (or 6 weeks if annual rent > £50,000)
- When asking about deposit, include helper_text: "Maximum £[CALCULATED] (5 weeks' rent)"
- If landlord states deposit > 5 weeks rent, respond with question text:
  "⚠️ ILLEGAL DEPOSIT: £[AMOUNT] exceeds the legal maximum of £[MAX] (5 weeks' rent).

  Tenant Fees Act 2019 violation - Penalty: £5,000 fine + criminal prosecution.

  Please enter a legal deposit amount (maximum £[MAX]):"

- Pet deposit MAXIMUM: £X per pet (where X is rent for period between payments, max £50/week)
- Holding deposit: Maximum 1 week's rent
- Prohibited charges: Admin fees, checkout fees, reference fees, renewal fees are ILLEGAL

**SCOTLAND - Private Residential Tenancy:**
- Deposit MAXIMUM: 2 months' rent
- Must use SafeDeposits Scotland, MyDeposits Scotland, or Letting Protection Service Scotland
- Different notice periods apply (28 days minimum for tenant)
- Rent increases: Maximum once per 12 months with 3 months' notice

**NORTHERN IRELAND:**
- Deposit MAXIMUM: 2 months' rent (guidance, not statutory)
- Must use TDS Northern Ireland
- Different possession procedures apply

**ESSENTIAL INFORMATION (Always ask):**
✓ Property full postal address and property type (house/flat/studio)
✓ Landlord full name, address, email, phone
✓ Tenant(s) full name, email, phone, date of birth
✓ Fixed term or periodic? If fixed: start date, end date, term length
✓ Monthly rent amount and payment due day (1st, 15th, etc.)
✓ Deposit amount → **VALIDATE IMMEDIATELY against rent and jurisdiction limits**
✓ Deposit scheme (England/Wales: DPS/MyDeposits/TDS, Scotland: SafeDeposits Scotland, NI: TDS NI)
✓ Furnished/unfurnished/part-furnished
✓ Who pays: utilities, council tax, internet (tenant or included in rent)
✓ Bank details for rent payment (account name, sort code, account number)

**PROFESSIONAL DETAILS (Ask based on context):**
✓ Number of bedrooms, council tax band, EPC rating
✓ Parking included? If yes: space number or details
✓ Pets allowed? If yes: types permitted, any pet deposit → **VALIDATE pet deposit limits**
✓ Smoking/vaping policy
✓ Break clause? If yes: when exercisable, notice period required
✓ Rent review clause? If yes: frequency, cap percentage → **Scotland: max once/12 months**
✓ Guarantor required? If yes: guarantor name, address, email, phone
✓ Letting agent involved? If yes: agent name, address, contact details

**OPTIONAL PROFESSIONAL ADDITIONS:**
✓ Service charge (if applicable for flats)
✓ Special conditions or additional terms → **VALIDATE for prohibited terms**
✓ Excluded areas (e.g., shed, garage not included)

**MANDATORY LEGAL REMINDERS (Include in helper_text):**
- Remind about Gas Safety Certificate (annual)
- Remind about EPC (minimum E rating required)
- Remind about Right to Rent checks (England only)
- Remind about smoke alarms (all floors) and CO alarms
- Remind about EICR (5 yearly electrical safety)
- Remind about How to Rent guide (England only)

✗ DO NOT ask for: payment history, witnesses, existing agreements to upload, breach details, arrears, court documents
✗ ABSOLUTELY NEVER use input_type: 'file_upload' for tenancy_agreement case type
✗ NEVER ask to "upload the tenancy agreement" or "upload the agreement" - WE ARE CREATING IT, NOT REVIEWING IT!
✗ NEVER ask for documents, files, signed agreements, or anything to upload
✗ DO NOT accept illegal terms without warning the landlord

⚠️ REMINDER: For TENANCY_AGREEMENT, EVERY question must use input_type of: text, multiple_choice, currency, date, yes_no, or scale_slider
⚠️ The input_type 'file_upload' is BANNED for tenancy_agreement creation

**Completion:** When you have enough details to draft a comprehensive, LEGALLY COMPLIANT agreement

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
  "facts_already_collected": ["property_address", "landlord_name", "rent_amount", "deposit_amount"],  // LIST ALL FACTS YOU ALREADY HAVE
  "next_question": {
    "question_id": "unique_identifier_never_used_before",  // Use standard IDs: deposit_amount, rent_amount, pets_allowed
    "question_text": "Professional, precise question",
    "input_type": "one of the types above",
    "options": ["option1", "option2"], // if multiple_choice
    "helper_text": "Brief explanation of legal significance",
    "is_required": true
  },
  "is_complete": false,
  "missing_critical_facts": ["fact1", "fact2"]
}

⚠️ CRITICAL: Before generating next_question, you MUST:
1. List all facts you already have in "facts_already_collected" array
2. Check if your next question keyword appears in facts_already_collected
3. If YES → do NOT ask that question, ask about a different missing fact
4. If NO → proceed with the question

EXAMPLE - What NOT to do:
{
  "facts_already_collected": ["property_address", "landlord_name", "rent_amount", "deposit_amount"],
  "next_question": {
    "question_id": "deposit_amount_2",  ← WRONG! deposit_amount already in facts_already_collected!
    "question_text": "What is the deposit?"  ← WRONG! This is a duplicate!
  }
}

EXAMPLE - What TO do:
{
  "facts_already_collected": ["property_address", "landlord_name", "rent_amount", "deposit_amount"],
  "next_question": {
    "question_id": "deposit_scheme",  ← CORRECT! This is a NEW fact
    "question_text": "Which deposit protection scheme will you use? (DPS, MyDeposits, TDS)"
  }
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
