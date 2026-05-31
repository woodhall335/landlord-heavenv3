# Claims Landlord Heaven PRD

Version: 1.0
Status: Implementation spec
Last updated: 2026-05-30

## Summary

Claims Landlord Heaven is a dedicated small-claims document-preparation product for `claims.landlordheaven.co.uk`. It should feel like a modern AI-led interview while remaining deterministic underneath: every required question comes from config, every answer writes to a known field, and every generated document receives the exact data it needs.

The product covers eight claim categories:

- Landlord debt claim
- Unpaid invoice
- Loan or money owed
- Faulty goods refund
- Poor service / contractor dispute
- Builder or tradesperson dispute
- Deposit refund
- Vehicle repair / damage dispute

The landlord debt claim must reuse the existing specialist landlord money-claim pack. The other categories use a new generic small-claim pack model. Generic claims must never use landlord, tenant, tenancy, rent, or property-specific wording unless the selected category is `landlord_debt_claim`.

## Product Goals

- Create a high-converting claims funnel with less information overload than traditional forms.
- Preserve the current landlord Money Claim Pack document output.
- Add a configurable generic small-claim framework for broader claim categories.
- Make the wizard feel smart, premium, calm, and guided.
- Ensure every claim category has an explicit question flow, evidence checklist, required fields, and document mapping.

## Product Routes

- Primary route: `claims.landlordheaven.co.uk`
- Internal fallback route: `/claims`
- Existing landlord product route remains live: `/products/money-claim`
- Existing landlord wizard route remains live: `/wizard/flow?type=money_claim&product=money_claim&src=product_page&topic=debt`

## Visual Direction

The claims wizard should follow the structure of the supplied visual reference:

`C:/Users/t_moh/Downloads/ChatGPT Image May 29, 2026, 11_23_37 PM.png`

Use Landlord Heaven branding rather than the blue-only reference:

- Purple primary accent matching the Landlord Heaven logo.
- Soft lavender page background.
- White premium wizard surface.
- Subtle borders and restrained shadows.
- Clean six-step top rail.
- One question visible at a time after the claim-type selection.
- AI typing/thinking effect before each question.
- Short helper text only during data capture.
- Heavier legal detail belongs on the `Check` step.
- Use `lucide-react` icons for claim category cards.
- Avoid decorative blobs, dense legal panels, and long government-form layouts.

## Six Visible Wizard Steps

All claim categories use the same six visible steps:

1. `Claim type`
   - Select one claim category.
   - Store `claim_category`.
   - Store `claim_flow_mode`.

2. `About the claim`
   - Claimant details.
   - Defendant details.
   - Claim value estimate.
   - Short free-text story.
   - Category-specific relationship/context questions.

3. `Details`
   - Amount breakdown.
   - Key dates.
   - What was agreed.
   - What went wrong.
   - What the user wants paid, refunded, or reimbursed.

4. `Evidence`
   - Config-specific evidence checklist.
   - Ask "What does this evidence show?" for each selected item.
   - Evidence strength summary.

5. `Check`
   - Required field audit.
   - Suitability blockers.
   - Pre-action status.
   - Court fee estimate.
   - Document readiness.

6. `Results`
   - Pack preview.
   - Checkout.
   - Download/generation route after payment.

## AI-Led Interview Behaviour

The interface should feel like Ask Heaven is intelligently guiding the user, but required fact gathering must remain config-driven.

Each question screen should:

- Show a brief thinking state such as `Ask Heaven is checking what we need next...`.
- Type the configured question into view.
- Reveal one answer control after the question appears.
- Show one short helper sentence explaining why the answer matters.
- Save immediately after the answer is submitted.
- Move to the next visible config question.
- Allow editing previous answers from a review/history panel.

The AI layer may help draft or refine narrative answers after facts are supplied. It must not invent required legal questions, skip required document fields, verify evidence, promise success, or claim to be a solicitor.

## Existing Landlord Money Claim Pack Contract

The current landlord money-claim pack is a protected output path.

Current generator:

- `src/lib/documents/money-claim-pack-generator.ts`

Current mapper:

- `src/lib/documents/money-claim-wizard-mapper.ts`

Current validation:

- `src/lib/documents/money-claim-validator.ts`
- `src/lib/validation/money-claim-rules-engine.ts`

Current API:

- `src/app/api/money-claim/pack/[caseId]/route.ts`

Current landlord pack outputs:

- `01-particulars-of-claim.pdf`
- `02-schedule-of-arrears.pdf`
- `03-interest-calculation.pdf` when interest is selected
- `04-letter-before-claim.pdf`
- `05-information-sheet-for-defendants.pdf`
- `06-reply-form.pdf`
- `07-financial-statement-form.pdf`
- `08-filing-guide.pdf`
- `09-enforcement-guide.pdf`
- `10-n1-claim-form.pdf`

Do not remove or rename current landlord fields unless the mapper is updated and existing money-claim document tests still pass.

## Config Model

Each claim type must be represented by a config object.

```ts
type ClaimTypeId =
  | 'landlord_debt_claim'
  | 'unpaid_invoice'
  | 'loan_or_money_owed'
  | 'faulty_goods_refund'
  | 'poor_service_contractor_dispute'
  | 'builder_tradesperson_dispute'
  | 'deposit_refund'
  | 'vehicle_repair_damage_dispute';

type ClaimTypeConfig = {
  id: ClaimTypeId;
  slug: string;
  label: string;
  cardDescription: string;
  icon: string;
  accent: 'purple' | 'lavender' | 'green' | 'amber' | 'orange' | 'teal' | 'rose';
  flowMode: 'landlord_money_claim' | 'generic_small_claim';
  commercialPriority: 'highest' | 'high' | 'medium';
  stepFlow: ClaimStepConfig[];
  lineItemCategories: ClaimLineItemCategory[];
  evidenceCategories: ClaimEvidenceCategory[];
  requiredDocumentFields: string[];
  packOutputs: string[];
  suitabilityBlockers: string[];
  seoKeywords: string[];
};

type ClaimStepConfig = {
  stepId: 'claim_type' | 'about' | 'details' | 'evidence' | 'check' | 'results';
  title: string;
  aiIntro: string;
  questions: ClaimQuestionConfig[];
};

type ClaimQuestionConfig = {
  id: string;
  questionText: string;
  typingText?: string;
  helperText: string;
  fieldPath: string;
  answerType:
    | 'text'
    | 'textarea'
    | 'date'
    | 'currency'
    | 'address'
    | 'yes_no'
    | 'single_choice'
    | 'multi_choice'
    | 'line_items'
    | 'evidence_checklist';
  required: boolean;
  showWhen?: string;
  options?: Array<{ label: string; value: string; helperText?: string }>;
  mapsToDocument: boolean;
  validation?: {
    minLength?: number;
    minAmount?: number;
    requiredMessage?: string;
  };
};

type ClaimLineItemCategory = {
  id: string;
  label: string;
  description: string;
};

type ClaimEvidenceCategory = {
  id: string;
  label: string;
  description: string;
  recommended: boolean;
  requiredForDocument: boolean;
  tips: string[];
};
```

## Shared Question Groups

These shared questions should be reused by config where appropriate.

### Claimant Questions

```ts
[
  {
    id: 'claimant_type',
    questionText: 'Are you claiming as an individual or a company?',
    helperText: 'This controls how your name appears on the claim documents.',
    fieldPath: 'claimant.type',
    answerType: 'single_choice',
    required: true,
    mapsToDocument: true,
    options: [
      { label: 'Individual', value: 'individual' },
      { label: 'Company or organisation', value: 'company' }
    ]
  },
  {
    id: 'claimant_name',
    questionText: 'What legal name should appear as the claimant?',
    helperText: 'Use the name the court and defendant should see.',
    fieldPath: 'claimant.name',
    answerType: 'text',
    required: true,
    mapsToDocument: true
  },
  {
    id: 'claimant_address',
    questionText: 'What is the claimant address?',
    helperText: 'This is used for court correspondence and the claim form.',
    fieldPath: 'claimant.address',
    answerType: 'address',
    required: true,
    mapsToDocument: true
  },
  {
    id: 'claimant_contact',
    questionText: 'What contact details should be shown for the claimant?',
    helperText: 'Email and phone help with settlement discussions and filing records.',
    fieldPath: 'claimant.contact',
    answerType: 'text',
    required: false,
    mapsToDocument: true
  }
]
```

### Defendant Questions

```ts
[
  {
    id: 'defendant_type',
    questionText: 'Are you claiming against an individual or a company?',
    helperText: 'This helps format the defendant correctly on the documents.',
    fieldPath: 'defendant.type',
    answerType: 'single_choice',
    required: true,
    mapsToDocument: true,
    options: [
      { label: 'Individual', value: 'individual' },
      { label: 'Company or organisation', value: 'company' }
    ]
  },
  {
    id: 'defendant_name',
    questionText: 'Who are you claiming against?',
    helperText: 'Use the legal name as accurately as possible.',
    fieldPath: 'defendant.name',
    answerType: 'text',
    required: true,
    mapsToDocument: true
  },
  {
    id: 'defendant_address',
    questionText: 'What address should the claim be served at?',
    helperText: 'The court papers need a reliable service address.',
    fieldPath: 'defendant.address',
    answerType: 'address',
    required: true,
    mapsToDocument: true
  }
]
```

### Shared Claim Summary Questions

```ts
[
  {
    id: 'claim_value_estimate',
    questionText: 'Roughly how much are you claiming?',
    helperText: 'This helps estimate the court fee and claim route.',
    fieldPath: 'generic_claim.estimated_value',
    answerType: 'currency',
    required: true,
    mapsToDocument: false,
    validation: { minAmount: 0.01 }
  },
  {
    id: 'claim_story',
    questionText: 'Tell us briefly what happened.',
    helperText: 'Plain English is fine. We will turn this into structured claim wording later.',
    fieldPath: 'generic_claim.summary',
    answerType: 'textarea',
    required: true,
    mapsToDocument: true,
    validation: { minLength: 20 }
  }
]
```

## Claim Type Configs

### 1. Landlord Debt Claim

```ts
const landlordDebtClaimConfig: ClaimTypeConfig = {
  id: 'landlord_debt_claim',
  slug: 'landlord-debt-claim',
  label: 'Landlord debt claim',
  cardDescription: 'Claim unpaid rent, service charges, damage, bills or other tenant debt.',
  icon: 'Home',
  accent: 'purple',
  flowMode: 'landlord_money_claim',
  commercialPriority: 'highest',
  lineItemCategories: [
    { id: 'property_damage', label: 'Property damage', description: 'Repair or replacement costs beyond fair wear and tear.' },
    { id: 'cleaning', label: 'Cleaning / rubbish removal', description: 'Professional cleaning or waste removal costs.' },
    { id: 'unpaid_utilities', label: 'Unpaid utilities', description: 'Utilities left unpaid by the tenant.' },
    { id: 'unpaid_council_tax', label: 'Unpaid council tax', description: 'Council tax the tenant was liable for.' },
    { id: 'other_tenant_debt', label: 'Other tenant debt', description: 'Other tenancy-related sums.' }
  ],
  evidenceCategories: [
    { id: 'tenancy_agreement', label: 'Tenancy agreement', description: 'The signed tenancy agreement or latest variation.', recommended: true, requiredForDocument: true, tips: ['Include any variations.'] },
    { id: 'rent_schedule', label: 'Rent schedule / arrears ledger', description: 'A period-by-period rent breakdown.', recommended: true, requiredForDocument: true, tips: ['Show rent due, rent paid and running balance.'] },
    { id: 'bank_statements', label: 'Bank statements', description: 'Statements showing payments or missed payments.', recommended: true, requiredForDocument: false, tips: ['Redact unrelated transactions.'] },
    { id: 'demand_letters', label: 'Rent demand letters', description: 'Rent reminders or arrears chasers.', recommended: false, requiredForDocument: false, tips: ['Keep proof of posting or email delivery.'] },
    { id: 'inventory_checkin', label: 'Check-in inventory/photos', description: 'Condition evidence from the start of the tenancy.', recommended: true, requiredForDocument: false, tips: ['A signed inventory is strongest.'] },
    { id: 'checkout_photos', label: 'Check-out or damage photos', description: 'Photos showing the end condition.', recommended: true, requiredForDocument: false, tips: ['Use dated photos where possible.'] },
    { id: 'repair_cleaning_invoices', label: 'Repair or cleaning invoices', description: 'Quotes, invoices or receipts for claimed costs.', recommended: true, requiredForDocument: false, tips: ['Itemise each cost clearly.'] },
    { id: 'utility_council_tax_bills', label: 'Utility or council tax bills', description: 'Bills supporting non-rent sums.', recommended: false, requiredForDocument: false, tips: ['Show the period being claimed.'] },
    { id: 'letter_before_claim', label: 'Letter Before Claim', description: 'The pre-action letter and proof it was sent.', recommended: true, requiredForDocument: true, tips: ['Keep proof of service.'] }
  ],
  requiredDocumentFields: [
    'landlord_full_name',
    'tenant_full_name',
    'property_address_line1',
    'tenancy_start_date',
    'rent_amount',
    'rent_frequency',
    'money_claim.basis_of_claim',
    'money_claim.charge_interest',
    'money_claim.evidence_items'
  ],
  packOutputs: [
    'particulars_of_claim',
    'arrears_schedule',
    'interest_calculation_if_selected',
    'letter_before_claim',
    'defendant_info_sheet',
    'reply_form',
    'financial_statement_form',
    'court_filing_guide',
    'enforcement_guide',
    'n1_claim'
  ],
  suitabilityBlockers: ['non_england_claim', 'claim_value_zero_or_missing'],
  seoKeywords: ['landlord money claim', 'rent arrears claim', 'tenant debt claim', 'claim tenant damage costs'],
  stepFlow: []
};
```

Landlord step flow:

- `Claim type`: select `landlord_debt_claim`.
- `About the claim`: claimant legal name/address, tenant name/service address, property address, tenancy start/end, rent amount, rent frequency, rent due day.
- `Details`: select landlord claim reasons, complete arrears schedule if rent arrears is selected, add damage/cleaning/utility/council tax/other tenant debt line items, provide basis of claim, answer occupancy status, answer interest choice.
- `Evidence`: use current landlord money-claim evidence checklist.
- `Check`: use current landlord money-claim validators and court fee estimate.
- `Results`: use existing landlord Money Claim Pack generator and document list unchanged.

Landlord field mapping:

| PRD field | Existing stored field |
| --- | --- |
| claimant.name | `landlord_full_name`, `parties.landlord.name` |
| defendant.name | `tenant_full_name`, `parties.tenants[0].name` |
| defendant.address | `defendant_address_line1`, `parties.tenants[0].address_line1` |
| property.address | `property_address_line1`, `property.address_line1` |
| tenancy.start_date | `tenancy_start_date`, `tenancy.start_date` |
| tenancy.rent_amount | `rent_amount`, `tenancy.rent_amount` |
| tenancy.rent_frequency | `rent_frequency`, `tenancy.rent_frequency` |
| arrears schedule | `arrears_items`, `issues.rent_arrears.arrears_items` |
| non-rent line items | `money_claim.damage_items` |
| statement | `money_claim.basis_of_claim` |
| interest | `money_claim.charge_interest`, `money_claim.interest_start_date`, `money_claim.interest_rate` |
| evidence | `money_claim.evidence_items`, `money_claim.evidence_types_available` |

### 2. Unpaid Invoice

```ts
const unpaidInvoiceConfig: ClaimTypeConfig = {
  id: 'unpaid_invoice',
  slug: 'unpaid-invoice',
  label: 'Unpaid invoice',
  cardDescription: 'Claim payment for an invoice that remains unpaid.',
  icon: 'FilePound',
  accent: 'green',
  flowMode: 'generic_small_claim',
  commercialPriority: 'highest',
  lineItemCategories: [
    { id: 'invoice_principal', label: 'Invoice amount', description: 'The unpaid invoice value.' },
    { id: 'late_payment_fee', label: 'Late payment fee', description: 'Any contractual or statutory late payment amount.' },
    { id: 'additional_costs', label: 'Additional costs', description: 'Recoverable costs connected to the unpaid invoice.' }
  ],
  evidenceCategories: [
    { id: 'invoice', label: 'Invoice', description: 'The invoice showing amount and due date.', recommended: true, requiredForDocument: true, tips: ['Include invoice number and due date.'] },
    { id: 'contract_or_quote', label: 'Contract, quote or purchase order', description: 'The agreement for the work or goods.', recommended: true, requiredForDocument: false, tips: ['Show the agreed price.'] },
    { id: 'delivery_or_completion_proof', label: 'Delivery or completion proof', description: 'Evidence the work/goods were supplied.', recommended: true, requiredForDocument: false, tips: ['Use delivery notes, sign-off, or emails.'] },
    { id: 'chaser_emails', label: 'Chaser emails or messages', description: 'Requests for payment sent after the due date.', recommended: true, requiredForDocument: false, tips: ['Include any admission of the debt.'] },
    { id: 'statement_of_account', label: 'Statement of account', description: 'A breakdown of what remains unpaid.', recommended: false, requiredForDocument: false, tips: ['Useful where there are several invoices or part payments.'] }
  ],
  requiredDocumentFields: [
    'claimant.name',
    'claimant.address',
    'defendant.name',
    'defendant.address',
    'generic_claim.summary',
    'generic_claim.key_dates.invoice_date',
    'generic_claim.key_dates.due_date',
    'generic_claim.line_items',
    'generic_claim.evidence_items',
    'generic_claim.pre_action'
  ],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_invoice_or_agreement', 'claim_value_zero_or_missing'],
  seoKeywords: ['unpaid invoice claim', 'small claim unpaid invoice', 'recover unpaid invoice', 'invoice debt letter before claim'],
  stepFlow: []
};
```

Unpaid invoice step flow:

- `Claim type`: select `unpaid_invoice`.
- `About the claim`: claimant details, defendant details, rough claim value, free-text story, business/customer relationship.
- `Details`: invoice number, invoice date, due date, work/goods supplied, amount unpaid, part payments, payment chasers, interest choice.
- `Evidence`: invoice, quote/contract, delivery/completion proof, chaser emails, statement of account.
- `Check`: confirm defendant address, amount schedule, pre-action status, blockers, court fee.
- `Results`: generic small-claim pack.

Core questions:

```ts
[
  { id: 'invoice_number', questionText: 'What is the invoice number?', helperText: 'This helps identify the debt clearly.', fieldPath: 'generic_claim.invoice.number', answerType: 'text', required: false, mapsToDocument: true },
  { id: 'invoice_date', questionText: 'What date was the invoice issued?', helperText: 'The claim documents should show when payment was requested.', fieldPath: 'generic_claim.key_dates.invoice_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'invoice_due_date', questionText: 'When was the invoice due for payment?', helperText: 'This helps explain when the debt became overdue.', fieldPath: 'generic_claim.key_dates.due_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'supplied_description', questionText: 'What work, goods or services did you supply?', helperText: 'Describe what the invoice was for.', fieldPath: 'generic_claim.agreement_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'invoice_line_items', questionText: 'What invoice amounts are unpaid?', helperText: 'Add each unpaid invoice or charge.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'chasing_history', questionText: 'What have you done to chase payment?', helperText: 'This supports the pre-action history.', fieldPath: 'generic_claim.pre_action.chasing_history', answerType: 'textarea', required: false, mapsToDocument: true }
]
```

### 3. Loan Or Money Owed

```ts
const loanOrMoneyOwedConfig: ClaimTypeConfig = {
  id: 'loan_or_money_owed',
  slug: 'loan-money-owed',
  label: 'Loan or money owed',
  cardDescription: "Claim money loaned to someone that has not been repaid.",
  icon: 'HandCoins',
  accent: 'purple',
  flowMode: 'generic_small_claim',
  commercialPriority: 'high',
  lineItemCategories: [
    { id: 'loan_principal', label: 'Loan amount', description: 'The original amount lent.' },
    { id: 'unpaid_balance', label: 'Unpaid balance', description: 'The amount still outstanding after any repayments.' },
    { id: 'agreed_interest_or_fee', label: 'Agreed interest or fee', description: 'Only include if there was a clear agreement.' }
  ],
  evidenceCategories: [
    { id: 'bank_transfer', label: 'Bank transfer or payment proof', description: 'Proof the money was transferred.', recommended: true, requiredForDocument: true, tips: ['Show date and amount.'] },
    { id: 'written_agreement', label: 'Written agreement', description: 'Any message, note or document recording the loan terms.', recommended: true, requiredForDocument: false, tips: ['Even text messages can help.'] },
    { id: 'repayment_messages', label: 'Repayment messages', description: 'Messages discussing repayment dates or promises.', recommended: true, requiredForDocument: false, tips: ['Admissions of debt are useful.'] },
    { id: 'partial_payments', label: 'Partial payment proof', description: 'Evidence of any repayments already made.', recommended: false, requiredForDocument: false, tips: ['This helps calculate the balance.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.key_dates.loan_date', 'generic_claim.key_dates.repayment_due_date', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_proof_money_transferred', 'claim_value_zero_or_missing'],
  seoKeywords: ['claim money owed', 'small claim personal loan', 'recover loan from friend', 'letter before claim money owed'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'loan_date', questionText: 'When did you lend or pay the money?', helperText: 'This anchors the claim timeline.', fieldPath: 'generic_claim.key_dates.loan_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'loan_amount', questionText: 'How much did you lend or pay?', helperText: 'This is the starting amount before repayments.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'repayment_terms', questionText: 'What was agreed about repayment?', helperText: 'Include dates, instalments, or any promise to repay.', fieldPath: 'generic_claim.agreement_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'repayment_due_date', questionText: 'When should the money have been repaid?', helperText: 'Use the best date you have.', fieldPath: 'generic_claim.key_dates.repayment_due_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'partial_repayments', questionText: 'Has any money been repaid?', helperText: 'This prevents the claim from overstating the balance.', fieldPath: 'generic_claim.partial_payments', answerType: 'line_items', required: false, mapsToDocument: true },
  { id: 'admissions', questionText: 'Has the other person admitted they owe the money?', helperText: 'Messages admitting the debt can strengthen the claim.', fieldPath: 'generic_claim.admissions_summary', answerType: 'textarea', required: false, mapsToDocument: true }
]
```

### 4. Faulty Goods Refund

```ts
const faultyGoodsRefundConfig: ClaimTypeConfig = {
  id: 'faulty_goods_refund',
  slug: 'faulty-goods-refund',
  label: 'Faulty goods refund',
  cardDescription: 'Claim a refund for goods that are faulty, damaged or not as described.',
  icon: 'PackageSearch',
  accent: 'amber',
  flowMode: 'generic_small_claim',
  commercialPriority: 'medium',
  lineItemCategories: [
    { id: 'purchase_price', label: 'Purchase price', description: 'The price paid for the goods.' },
    { id: 'repair_or_replacement_cost', label: 'Repair or replacement cost', description: 'Costs caused by the faulty goods.' },
    { id: 'delivery_or_return_cost', label: 'Delivery or return cost', description: 'Related delivery or return costs.' }
  ],
  evidenceCategories: [
    { id: 'receipt_or_order', label: 'Receipt or order confirmation', description: 'Proof of purchase and price.', recommended: true, requiredForDocument: true, tips: ['Include order number.'] },
    { id: 'fault_photos', label: 'Photos or video of the fault', description: 'Visual evidence of the defect or damage.', recommended: true, requiredForDocument: false, tips: ['Take clear photos from several angles.'] },
    { id: 'complaint_messages', label: 'Complaint messages', description: 'Messages telling the seller about the problem.', recommended: true, requiredForDocument: false, tips: ['Include the date you complained.'] },
    { id: 'seller_response', label: 'Seller response', description: 'Any refusal, delay or offer from the seller.', recommended: true, requiredForDocument: false, tips: ['Include refund refusal wording.'] },
    { id: 'repair_report', label: 'Repair report or quote', description: 'Third-party confirmation of the fault or cost.', recommended: false, requiredForDocument: false, tips: ['Useful for disputed defects.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.key_dates.purchase_date', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_proof_of_purchase', 'claim_value_zero_or_missing'],
  seoKeywords: ['faulty goods refund claim', 'small claim faulty goods', 'claim refund not as described', 'consumer refund letter before claim'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'item_bought', questionText: 'What item did you buy?', helperText: 'Name the goods clearly.', fieldPath: 'generic_claim.item_or_service', answerType: 'text', required: true, mapsToDocument: true },
  { id: 'seller_name', questionText: 'Who sold the goods?', helperText: 'Use the seller or business name.', fieldPath: 'defendant.name', answerType: 'text', required: true, mapsToDocument: true },
  { id: 'purchase_date', questionText: 'When did you buy the goods?', helperText: 'This helps show the claim timeline.', fieldPath: 'generic_claim.key_dates.purchase_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'fault_description', questionText: 'What is wrong with the goods?', helperText: 'Explain whether they are faulty, damaged, or not as described.', fieldPath: 'generic_claim.problem_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'refund_request', questionText: 'What refund or payment did you ask for?', helperText: 'This becomes the remedy requested.', fieldPath: 'generic_claim.requested_outcome', answerType: 'textarea', required: true, mapsToDocument: true },
  { id: 'seller_response', questionText: 'How did the seller respond?', helperText: 'A refusal or no response is important to the pre-action story.', fieldPath: 'generic_claim.pre_action.response_summary', answerType: 'textarea', required: false, mapsToDocument: true }
]
```

### 5. Poor Service / Contractor Dispute

```ts
const poorServiceContractorDisputeConfig: ClaimTypeConfig = {
  id: 'poor_service_contractor_dispute',
  slug: 'poor-service-contractor-dispute',
  label: 'Poor service / contractor dispute',
  cardDescription: 'Claim for poor quality work or services not delivered as agreed.',
  icon: 'UserRoundCheck',
  accent: 'orange',
  flowMode: 'generic_small_claim',
  commercialPriority: 'high',
  lineItemCategories: [
    { id: 'refund_or_price_reduction', label: 'Refund or price reduction', description: 'Money back for poor or incomplete service.' },
    { id: 'remedial_cost', label: 'Remedial cost', description: 'Cost of putting the problem right.' },
    { id: 'additional_loss', label: 'Additional loss', description: 'Other recoverable losses connected to the service.' }
  ],
  evidenceCategories: [
    { id: 'quote_or_contract', label: 'Quote or contract', description: 'The agreed service, price and scope.', recommended: true, requiredForDocument: true, tips: ['Show what was promised.'] },
    { id: 'payment_proof', label: 'Payment proof', description: 'Evidence of payments made.', recommended: true, requiredForDocument: true, tips: ['Include deposits and staged payments.'] },
    { id: 'photos_or_records', label: 'Photos or records of the issue', description: 'Evidence showing poor work or non-delivery.', recommended: true, requiredForDocument: false, tips: ['Before and after photos help.'] },
    { id: 'complaint_messages', label: 'Complaint messages', description: 'Messages raising the issue and requesting a fix.', recommended: true, requiredForDocument: false, tips: ['Include any deadline you gave.'] },
    { id: 'replacement_quote', label: 'Replacement or remedial quote', description: 'Cost to complete or correct the work.', recommended: true, requiredForDocument: false, tips: ['Use a clear third-party quote.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.agreement_summary', 'generic_claim.problem_summary', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_agreement_or_payment_proof', 'claim_value_zero_or_missing'],
  seoKeywords: ['poor service small claim', 'contractor dispute claim', 'claim for bad workmanship', 'letter before claim contractor'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'service_agreed', questionText: 'What service was agreed?', helperText: 'Describe what the contractor or service provider promised to do.', fieldPath: 'generic_claim.agreement_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'price_agreed', questionText: 'What price was agreed and what did you pay?', helperText: 'This helps calculate the claim value.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'what_went_wrong', questionText: 'What was defective, missing or not delivered?', helperText: 'Be factual about the service problem.', fieldPath: 'generic_claim.problem_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'complaint_date', questionText: 'When did you complain?', helperText: 'This supports the pre-action chronology.', fieldPath: 'generic_claim.key_dates.complaint_date', answerType: 'date', required: false, mapsToDocument: true },
  { id: 'remedial_cost', questionText: 'What will it cost to put right?', helperText: 'Use estimates, invoices or a reasonable calculation.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'requested_outcome', questionText: 'What do you want the defendant to pay?', helperText: 'State the refund, remedial cost, or compensation requested.', fieldPath: 'generic_claim.requested_outcome', answerType: 'textarea', required: true, mapsToDocument: true }
]
```

### 6. Builder Or Tradesperson Dispute

```ts
const builderTradespersonDisputeConfig: ClaimTypeConfig = {
  id: 'builder_tradesperson_dispute',
  slug: 'builder-tradesperson-dispute',
  label: 'Builder or tradesperson dispute',
  cardDescription: 'Claim for unfinished work, defects or payment disputes.',
  icon: 'HardHat',
  accent: 'teal',
  flowMode: 'generic_small_claim',
  commercialPriority: 'highest',
  lineItemCategories: [
    { id: 'unfinished_work', label: 'Unfinished work', description: 'Cost of completing the agreed work.' },
    { id: 'defective_work', label: 'Defective work', description: 'Cost of correcting poor workmanship.' },
    { id: 'overpayment', label: 'Overpayment', description: 'Money paid for work not delivered.' },
    { id: 'remedial_quote', label: 'Remedial quote', description: 'Third-party cost to repair or complete.' }
  ],
  evidenceCategories: [
    { id: 'scope_or_quote', label: 'Scope of works or quote', description: 'The agreed work, price and specification.', recommended: true, requiredForDocument: true, tips: ['Include plans or written scope if available.'] },
    { id: 'payment_proof', label: 'Payment proof', description: 'Bank transfers, receipts or invoices.', recommended: true, requiredForDocument: true, tips: ['Show staged payments.'] },
    { id: 'photos', label: 'Photos of the works', description: 'Photos showing unfinished or defective work.', recommended: true, requiredForDocument: false, tips: ['Date order helps.'] },
    { id: 'snagging_list', label: 'Snagging list', description: 'A list of defects or unfinished items.', recommended: true, requiredForDocument: false, tips: ['Keep it clear and numbered.'] },
    { id: 'expert_or_remedial_estimate', label: 'Expert or remedial estimate', description: 'A third-party view of what correction will cost.', recommended: true, requiredForDocument: false, tips: ['A written estimate is stronger than a verbal quote.'] },
    { id: 'messages', label: 'Messages with the builder/tradesperson', description: 'Messages about delays, defects, promises or refusals.', recommended: true, requiredForDocument: false, tips: ['Include missed deadlines.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.agreement_summary', 'generic_claim.problem_summary', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_scope_or_payment_proof', 'claim_value_zero_or_missing'],
  seoKeywords: ['builder dispute small claim', 'claim for poor building work', 'tradesperson dispute claim', 'bad workmanship claim'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'scope_of_works', questionText: 'What work was the builder or tradesperson meant to do?', helperText: 'Describe the agreed scope in plain English.', fieldPath: 'generic_claim.agreement_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'payment_made', questionText: 'How much have you paid so far?', helperText: 'Add deposits, staged payments and final payments.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'defects_or_unfinished_work', questionText: 'What work is defective or unfinished?', helperText: 'This becomes the core factual complaint.', fieldPath: 'generic_claim.problem_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'deadline_missed', questionText: 'Was a completion deadline missed?', helperText: 'A missed deadline can help explain breach and loss.', fieldPath: 'generic_claim.key_dates.deadline_missed', answerType: 'date', required: false, mapsToDocument: true },
  { id: 'remedial_quote', questionText: 'What will it cost to finish or repair the work?', helperText: 'Use a quote or reasonable estimate.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'chance_to_put_right', questionText: 'Did you give them a chance to put it right?', helperText: 'This supports the pre-action history.', fieldPath: 'generic_claim.pre_action.chance_to_put_right', answerType: 'yes_no', required: false, mapsToDocument: true }
]
```

### 7. Deposit Refund

```ts
const depositRefundConfig: ClaimTypeConfig = {
  id: 'deposit_refund',
  slug: 'deposit-refund',
  label: 'Deposit refund',
  cardDescription: 'Claim the return of a deposit paid for accommodation, services or a booking.',
  icon: 'ShieldPound',
  accent: 'rose',
  flowMode: 'generic_small_claim',
  commercialPriority: 'high',
  lineItemCategories: [
    { id: 'deposit_amount', label: 'Deposit amount', description: 'The deposit paid.' },
    { id: 'additional_refund_due', label: 'Additional refund due', description: 'Any further refundable sum.' },
    { id: 'related_cost', label: 'Related cost', description: 'Costs caused by the deposit not being returned.' }
  ],
  evidenceCategories: [
    { id: 'deposit_receipt', label: 'Deposit receipt or payment proof', description: 'Proof the deposit was paid.', recommended: true, requiredForDocument: true, tips: ['Show date and amount.'] },
    { id: 'terms', label: 'Terms or agreement', description: 'The refund terms or booking/service terms.', recommended: true, requiredForDocument: false, tips: ['Highlight refund wording.'] },
    { id: 'refund_request', label: 'Refund request messages', description: 'Messages asking for the deposit back.', recommended: true, requiredForDocument: false, tips: ['Include dates.'] },
    { id: 'refusal_or_no_response', label: 'Refusal or no response evidence', description: 'The other side refusing, delaying or ignoring the refund.', recommended: true, requiredForDocument: false, tips: ['Screenshot messages if needed.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.key_dates.deposit_paid_date', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'no_deposit_payment_proof', 'claim_value_zero_or_missing'],
  seoKeywords: ['deposit refund claim', 'small claim deposit not returned', 'claim back deposit', 'letter before claim deposit refund'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'deposit_purpose', questionText: 'What was the deposit paid for?', helperText: 'For example a booking, service, event, vehicle, or other agreement.', fieldPath: 'generic_claim.agreement_summary', answerType: 'textarea', required: true, mapsToDocument: true },
  { id: 'deposit_amount', questionText: 'How much deposit did you pay?', helperText: 'This is the main amount claimed.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'deposit_paid_date', questionText: 'When did you pay the deposit?', helperText: 'This anchors the timeline.', fieldPath: 'generic_claim.key_dates.deposit_paid_date', answerType: 'date', required: true, mapsToDocument: true },
  { id: 'refund_trigger', questionText: 'Why should the deposit now be refunded?', helperText: 'Explain the cancellation, completion, or refund trigger.', fieldPath: 'generic_claim.problem_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'refund_request_date', questionText: 'When did you ask for the refund?', helperText: 'This helps show the defendant had a chance to pay.', fieldPath: 'generic_claim.key_dates.refund_request_date', answerType: 'date', required: false, mapsToDocument: true },
  { id: 'refusal_reason', questionText: 'What reason did they give for not refunding it?', helperText: 'If they gave no reason, say that.', fieldPath: 'generic_claim.pre_action.response_summary', answerType: 'textarea', required: false, mapsToDocument: true }
]
```

### 8. Vehicle Repair / Damage Dispute

```ts
const vehicleRepairDamageDisputeConfig: ClaimTypeConfig = {
  id: 'vehicle_repair_damage_dispute',
  slug: 'vehicle-repair-damage-dispute',
  label: 'Vehicle repair / damage dispute',
  cardDescription: 'Claim for vehicle repairs, damage or related costs.',
  icon: 'Car',
  accent: 'lavender',
  flowMode: 'generic_small_claim',
  commercialPriority: 'medium',
  lineItemCategories: [
    { id: 'repair_cost', label: 'Repair cost', description: 'Cost of repair work claimed.' },
    { id: 'damage_cost', label: 'Damage cost', description: 'Cost caused by damage to the vehicle.' },
    { id: 'inspection_report_cost', label: 'Inspection or report cost', description: 'Cost of inspection or diagnosis.' },
    { id: 'related_loss', label: 'Related loss', description: 'Other recoverable vehicle-related losses.' }
  ],
  evidenceCategories: [
    { id: 'garage_invoice', label: 'Garage invoice or repair bill', description: 'Proof of repair work and cost.', recommended: true, requiredForDocument: true, tips: ['Include job sheet if available.'] },
    { id: 'mechanic_report', label: 'Mechanic report', description: 'Independent evidence about the repair or damage.', recommended: true, requiredForDocument: false, tips: ['Useful where fault is disputed.'] },
    { id: 'vehicle_photos', label: 'Photos of the vehicle or damage', description: 'Photos showing condition or damage.', recommended: true, requiredForDocument: false, tips: ['Take clear photos from several angles.'] },
    { id: 'repair_estimate', label: 'Repair estimate', description: 'Quote for putting the vehicle right.', recommended: true, requiredForDocument: false, tips: ['Use a dated quote.'] },
    { id: 'messages', label: 'Messages with the garage or defendant', description: 'Correspondence about the dispute.', recommended: true, requiredForDocument: false, tips: ['Include refusal or admissions.'] },
    { id: 'mot_service_records', label: 'MOT or service records', description: 'Records showing prior condition or vehicle history.', recommended: false, requiredForDocument: false, tips: ['Useful where condition is disputed.'] }
  ],
  requiredDocumentFields: ['claimant.name', 'claimant.address', 'defendant.name', 'defendant.address', 'generic_claim.summary', 'generic_claim.problem_summary', 'generic_claim.line_items', 'generic_claim.evidence_items'],
  packOutputs: ['letter_before_claim', 'amount_schedule', 'particulars_of_claim', 'evidence_index', 'interest_calculation_if_selected', 'n1_claim', 'filing_guide', 'enforcement_guide'],
  suitabilityBlockers: ['non_england_claim', 'insurance_only_dispute', 'personal_injury_claim', 'claim_value_zero_or_missing'],
  seoKeywords: ['vehicle repair dispute claim', 'garage repair small claim', 'claim vehicle damage costs', 'letter before claim garage'],
  stepFlow: []
};
```

Core questions:

```ts
[
  { id: 'vehicle_details', questionText: 'What vehicle is the claim about?', helperText: 'Include make, model and registration if known.', fieldPath: 'generic_claim.vehicle.details', answerType: 'text', required: true, mapsToDocument: true },
  { id: 'defendant_role', questionText: 'Who are you claiming against?', helperText: 'For example a garage, repairer, seller, or person who damaged the vehicle.', fieldPath: 'generic_claim.relationship_summary', answerType: 'single_choice', required: true, mapsToDocument: true, options: [{ label: 'Garage or repairer', value: 'garage' }, { label: 'Seller', value: 'seller' }, { label: 'Person who damaged the vehicle', value: 'damage_causer' }, { label: 'Other', value: 'other' }] },
  { id: 'vehicle_problem', questionText: 'What went wrong?', helperText: 'Describe the repair issue, damage, or disputed cost.', fieldPath: 'generic_claim.problem_summary', answerType: 'textarea', required: true, mapsToDocument: true, validation: { minLength: 20 } },
  { id: 'incident_or_repair_date', questionText: 'When did the repair, damage or incident happen?', helperText: 'Use the best date available.', fieldPath: 'generic_claim.key_dates.incident_or_repair_date', answerType: 'date', required: false, mapsToDocument: true },
  { id: 'vehicle_line_items', questionText: 'What vehicle costs are you claiming?', helperText: 'Add repair costs, damage costs, reports or related losses.', fieldPath: 'generic_claim.line_items', answerType: 'line_items', required: true, mapsToDocument: true },
  { id: 'insurance_position', questionText: 'Is this only an insurance dispute?', helperText: 'Insurance-only disputes may need a different route.', fieldPath: 'generic_claim.suitability.insurance_only', answerType: 'yes_no', required: true, mapsToDocument: false }
]
```

## Document Mapping Rules

### Landlord Mapping

Landlord config maps into existing fields:

- `landlord_full_name`
- `tenant_full_name`
- `property_address_line1`
- `tenancy_start_date`
- `rent_amount`
- `rent_frequency`
- `arrears_items`
- `money_claim.damage_items`
- `money_claim.basis_of_claim`
- `money_claim.charge_interest`
- `money_claim.evidence_items`

The landlord path must continue using `mapCaseFactsToMoneyClaimCase` and `generateMoneyClaimPack`.

### Generic Mapping

Generic configs map into new generic fields:

- `claimant.name`
- `claimant.address`
- `defendant.name`
- `defendant.address`
- `generic_claim.category`
- `generic_claim.summary`
- `generic_claim.key_dates`
- `generic_claim.line_items`
- `generic_claim.evidence_items`
- `generic_claim.pre_action`
- `generic_claim.interest`

Generic claim generation must use new generic templates and a new generic N1 payload builder. It must not call landlord-specific `particulars_of_claim.hbs`, `schedule_of_arrears.hbs`, landlord filing-guide copy, or landlord N1 brief-detail logic.

## Generic Pack Outputs

Generic small-claim pack outputs:

- `01-letter-before-claim.pdf`
- `02-amount-schedule.pdf`
- `03-particulars-of-claim.pdf`
- `04-evidence-index.pdf`
- `05-interest-calculation.pdf` when interest is selected
- `06-n1-claim-form.pdf`
- `07-filing-guide.pdf`
- `08-enforcement-guide.pdf`

Generic templates must use neutral wording:

- claimant
- defendant
- agreement
- amount claimed
- goods
- services
- invoice
- loan
- deposit
- vehicle
- remedial cost

They must not use:

- landlord
- tenant
- tenancy
- rent arrears
- assured shorthold tenancy
- let property

unless the selected `flowMode` is `landlord_money_claim`.

## Suitability Blocking

All configs must apply these global blockers:

- Non-England claim at v1 launch.
- Personal injury.
- Employment.
- Family law.
- Criminal matter.
- Immigration.
- Defamation.
- Housing disrepair.
- Urgent injunction.
- Complex professional negligence.
- Claim value is zero or missing.
- Defendant name or service address missing.

Category-specific blockers are defined on each config.

## Check Step Requirements

The `Check` step must show:

- selected category
- claim value
- claimant and defendant summary
- required field status
- suitability blockers
- warnings
- evidence strength
- pre-action status
- interest status
- court fee estimate
- document readiness

The `Check` step is where heavier detail belongs. Earlier steps should stay focused and low-overload.

## Results Step Requirements

The `Results` step must show:

- locked document preview or preview summary
- pack contents
- price and checkout CTA
- post-payment generation route
- filing reminder: user checks, signs and files their own claim

The product must not say Landlord Heaven files the claim unless a future regulated filing service is separately approved.

## Design Acceptance Criteria

- Purple primary accent matching Landlord Heaven branding.
- Soft lavender wizard background.
- White premium wizard surface.
- One primary question visible at a time after claim-type selection.
- AI typing/thinking effect before each question.
- No dense legal text during data capture.
- Claim-type cards use `lucide-react` icons.
- Desktop and mobile screenshots match the intended premium, modern, low-overload feel.
- Text must not overlap or overflow on mobile.

## Technical Acceptance Criteria

- Every claim config validates against the schema.
- Every config has all six steps.
- Every config has at least one question in `about`, `details`, and `evidence`.
- Every required document field is collected by that config's step flow.
- Conditional questions appear only when relevant.
- Landlord config maps to the existing `MoneyClaimCase`.
- Generic configs map to the new generic claim model.
- Landlord pack output document types remain unchanged.
- Generic claims do not render landlord/tenant/tenancy wording.
- Generic claims do not call landlord templates.
- Existing money-claim tests pass.

## Test Plan

Run or add tests for:

- Claim config schema validation.
- Required field coverage per claim type.
- Conditional question visibility.
- Landlord mapping into existing money-claim fields.
- Generic mapping into new generic claim fields.
- Existing landlord Money Claim Pack output document list.
- Generic pack output document list.
- N1 brief details:
  - landlord path may use tenancy/rent wording
  - generic path must use category-specific generic wording
- Unsupported claim blockers.
- One-question-at-a-time UI behaviour.
- Browser QA on desktop and mobile for the lavender/purple claims wizard.

## Implementation Notes

Recommended implementation order:

1. Add config types and static configs.
2. Add config validation tests.
3. Build the one-question interview shell.
4. Wire landlord config to the existing money-claim flow/mapping.
5. Add generic claim model and mapper.
6. Add generic templates and generic N1 payload builder.
7. Add generic document generation route.
8. Add subdomain/fallback routing.
9. Add browser QA and polish.

## Assumptions

- First launch is England-only.
- The AI-style interview is a front-end experience over deterministic configs.
- Live AI may assist with narrative drafting, but must not control required-field selection.
- Existing landlord money-claim output is protected and must not regress.
- Generic claims are document-preparation only; users check, sign and file their own claim.
