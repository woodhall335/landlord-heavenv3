# 🤖 AI PIPELINE ARCHITECTURE

**Version:** 1.0  
**Date:** November 2024  
**Status:** Ready for Implementation

---

## 🎯 EXECUTIVE SUMMARY

Landlord Heaven uses a **3-layer AI pipeline** with comprehensive guard rails to ensure accurate, safe, and cost-efficient document generation.

**Models Used:**

- **GPT-4.1 Mini** - Fact-finding wizard (fast, cheap)
- **GPT-4** - Document generation (accurate, reliable)
- **Claude Sonnet 4** - QA validation (legal accuracy check)

**Key Principle:**

> "Use the cheapest model that can do the job well, with validation at every step."

---

## 🛡️ GUARD RAIL FRAMEWORK

### Layer 1: Input Validation (Pre-AI)

```yaml
Purpose: Prevent garbage in

Checks: ✅ Schema validation (all required fields present)
  ✅ Data type checking (strings, numbers, dates)
  ✅ Format validation (postcodes, emails, amounts)
  ✅ Range validation (dates in past/future, amounts > 0)
  ✅ Cross-field validation (end date > start date)
  ✅ Jurisdiction-specific validation (council codes exist)

Example:
  Input: { rent_owed: "three grand" }
  Validation: ❌ FAIL - rent_owed must be numeric
  Result: Return error to user, don't call AI
```

### Layer 2: AI Processing (With Constraints)

```yaml
Purpose: Guide AI with strict rules

Techniques: ✅ Structured prompts (clear instructions)
  ✅ JSON mode (force structured output)
  ✅ Temperature control (0.3 for legal, 0.7 for conversational)
  ✅ Max tokens (prevent rambling)
  ✅ Stop sequences (prevent hallucination)
  ✅ System prompts (define behavior boundaries)

Example Prompt Structure:
  System: "You are a legal document assistant. Output JSON only."
  User: "Generate Section 8 notice with these facts..."
  Format: { "document": "...", "warnings": [...] }
  Temperature: 0.3
  Max tokens: 4000
```

### Layer 3: Output Validation (Post-AI)

```yaml
Purpose: Catch AI mistakes before user sees them

Checks: ✅ JSON parsing (valid structure)
  ✅ Required fields present (no missing data)
  ✅ Legal accuracy (Claude Sonnet 4 review)
  ✅ Template compilation (Handlebars syntax)
  ✅ Fact consistency (matches input facts)
  ✅ Compliance rules (no prohibited content)
  ✅ Quality score (0-100, must be >85)

Example:
  AI Output: Section 8 notice generated
  Validation: Run through Claude Sonnet 4
  Claude: "✅ Legally accurate, no issues found"
  Quality Score: 92/100
  Result: ✅ PASS - Deliver to user
```

---

## 🔄 COMPLETE PIPELINE FLOW

### Step 1: Fact-Finding (Conversational Wizard)

**Model:** GPT-4.1 Mini  
**Temperature:** 0.7 (conversational)  
**Purpose:** Collect facts in plain English

```yaml
Input: User clicks "Start"
Process: 1. Load jurisdiction config (Agent 6 generated)
  2. Initialize conversation state
  3. Ask first question (plain English)
  4. User responds (structured input via UI)
  5. Validate response (Layer 1 guard rails)
  6. Store in case_facts table
  7. AI determines next question (branching logic)
  8. Repeat until all facts collected

Output: Complete case_facts JSON
```

**Example Conversation:**

```typescript
// AI Prompt (GPT-4.1 Mini)
{
  system: `You are a conversational wizard for Landlord Heaven.

  RULES:
  - Ask ONE question at a time
  - Use plain English (no legal jargon)
  - Be empathetic and friendly
  - Explain why you're asking
  - Never ask for information you already have

  CURRENT STATE:
  - Collected: ${JSON.stringify(collectedFacts)}
  - Missing: ${missingFacts.join(', ')}
  - Jurisdiction: ${jurisdiction}

  Determine the next question to ask based on decision rules.`,

  temperature: 0.7,
  max_tokens: 200,

  response_format: { type: "json_object" }
}

// AI Response
{
  "next_question_id": "rent_amount",
  "question_text": "How much rent is currently owed?",
  "input_type": "currency",
  "help_text": "Enter the total unpaid rent. We need this for your court documents.",
  "required": true
}
```

---

### Step 2: Decision Engine (Route Selection)

**Model:** GPT-4.1 Mini  
**Temperature:** 0.3 (precise)  
**Purpose:** Determine best legal route

```yaml
Input: Complete case_facts JSON
Process: 1. Load decision_rules.yaml (Agent 6 generated)
  2. Apply eligibility logic
  3. Check compliance requirements
  4. Identify red flags
  5. Calculate success probability
  6. Recommend optimal route
  7. Generate alternative options

Output: Recommended legal route + analysis
```

**Example Decision:**

```typescript
// AI Prompt (GPT-4.1 Mini)
{
  system: `You are a legal decision engine for UK landlord-tenant cases.

  DECISION RULES:
  ${decisionRulesYAML}

  CASE FACTS:
  ${JSON.stringify(caseFacts)}

  Analyze the case and recommend the best legal route.

  OUTPUT JSON:
  {
    "recommended_route": "section_8" | "section_21" | "money_claim",
    "grounds": ["ground_8", "ground_10"],
    "mandatory_grounds": ["ground_8"],
    "notice_period_days": 14,
    "success_probability": 85,
    "red_flags": [],
    "compliance_issues": [],
    "alternative_routes": [],
    "reasoning": "Explanation here"
  }`,

  temperature: 0.3,
  max_tokens: 1500,
  response_format: { type: "json_object" }
}

// AI Response
{
  "recommended_route": "section_8",
  "grounds": ["ground_8", "ground_10"],
  "mandatory_grounds": ["ground_8"],
  "notice_period_days": 14,
  "success_probability": 90,
  "red_flags": [],
  "compliance_issues": [],
  "reasoning": "3 months rent arrears meets Ground 8 (mandatory). Adding Ground 10 for additional coverage."
}
```

---

### Step 3: Document Generation (Template Filling)

**Model:** GPT-4  
**Temperature:** 0.3 (precise)  
**Purpose:** Generate court-ready documents

```yaml
Input:
  - case_facts JSON
  - recommended_route
  - document templates (Handlebars)

Process: 1. Load appropriate template
  2. Extract required facts
  3. AI fills in legal language
  4. Compile Handlebars template
  5. Generate PDF/DOCX
  6. Apply watermark (if preview)

Output: Court-ready document
```

**Example Generation:**

```typescript
// AI Prompt (GPT-4)
{
  system: `You are a legal document generator for UK landlord-tenant law.

  TEMPLATE:
  ${handlebarsTemplate}

  CASE FACTS:
  ${JSON.stringify(caseFacts)}

  ROUTE:
  ${recommendedRoute}

  INSTRUCTIONS:
  - Fill template with case facts
  - Use precise legal language
  - Include all required sections
  - Follow court formatting rules
  - Cite relevant statutes
  - Do NOT add information not in case facts
  - Do NOT use placeholder text

  OUTPUT: Complete filled template (Handlebars format)`,

  temperature: 0.3,
  max_tokens: 8000
}

// AI Response (Handlebars filled)
```

**Template Compilation:**

```typescript
// Compile Handlebars
const template = Handlebars.compile(aiGeneratedTemplate);
const document = template(caseFacts);

// Generate PDF
const pdf = await generatePDF(document, {
  format: "A4",
  margin: "2cm",
  watermark: isPreview ? "PREVIEW - NOT FOR COURT USE" : null,
});
```

---

### Step 4: QA Validation (Legal Accuracy Check)

**Model:** Claude Sonnet 4  
**Temperature:** 0.3 (precise)  
**Purpose:** Catch errors before delivery

```yaml
Input: Generated document

Process:
  1. Claude reviews document
  2. Checks legal accuracy
  3. Verifies fact consistency
  4. Identifies missing elements
  5. Scores quality (0-100)
  6. Returns issues list

Output: QA report + quality score

Pass Threshold: >85/100
If Fail: Regenerate with corrections
```

**Example QA Check:**

```typescript
// AI Prompt (Claude Sonnet 4)
{
  system: `You are a legal QA specialist for UK landlord-tenant documents.

  DOCUMENT TO REVIEW:
  ${generatedDocument}

  ORIGINAL FACTS:
  ${JSON.stringify(caseFacts)}

  CHECKLIST:
  - All required sections present?
  - Facts match input data?
  - Legal language correct?
  - Statute citations accurate?
  - Notice periods correct?
  - No prohibited content?
  - No unfair terms?
  - Court format compliant?

  SCORING:
  - 100: Perfect, no issues
  - 85-99: Minor issues (acceptable)
  - 70-84: Moderate issues (needs fixes)
  - <70: Major issues (regenerate)

  OUTPUT JSON:
  {
    "quality_score": 92,
    "issues": [],
    "warnings": [],
    "recommendations": [],
    "pass": true
  }`,

  temperature: 0.3,
  max_tokens: 2000,
  response_format: { type: "json_object" }
}

// AI Response
{
  "quality_score": 92,
  "issues": [],
  "warnings": [
    "Consider adding more detail in grounds particulars"
  ],
  "recommendations": [
    "Include specific dates of missed payments"
  ],
  "pass": true
}
```

**Quality Gate:**

```typescript
if (qaReport.quality_score >= 85 && qaReport.pass) {
  // ✅ Document is good - deliver to user
  await deliverDocument(document, caseId);
} else {
  // ❌ Quality too low - regenerate
  await regenerateDocument(caseId, qaReport.issues);
}
```

---

## 💰 COST OPTIMIZATION

### Model Selection Strategy:

```yaml
Fact-Finding (GPT-4.1 Mini):
  Cost: ~$0.15 per 1M input tokens
  Usage: 200-500 tokens per question
  Total: ~$0.01 per case
  Reason: Simple conversation, needs speed

Decision Engine (GPT-4.1 Mini):
  Cost: ~$0.15 per 1M input tokens
  Usage: 1000-2000 tokens per case
  Total: ~$0.003 per case
  Reason: Structured logic, fast enough

Document Generation (GPT-4):
  Cost: ~$2.50 per 1M input tokens
  Usage: 3000-5000 tokens per document
  Total: ~$0.015 per document
  Reason: Needs high accuracy for legal content

QA Validation (Claude Sonnet 4):
  Cost: ~$3.00 per 1M input tokens
  Usage: 2000-4000 tokens per document
  Total: ~$0.012 per document
  Reason: Best for legal review

TOTAL COST PER CASE: ~$0.04
With 3 documents per case: ~$0.12

MARGIN CALCULATION:
Selling price: £29.99 (Notice Only)
AI cost: £0.10
Margin: 99.7% 🎯
```

### Token Management:

```typescript
// Track tokens per request
async function callAI(prompt: string, model: string) {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    // ... other params
  });

  // Log usage
  await logTokenUsage({
    model,
    input_tokens: response.usage.prompt_tokens,
    output_tokens: response.usage.completion_tokens,
    total_cost: calculateCost(response.usage, model),
  });

  return response;
}

// Monthly budget alerts
async function checkMonthlyBudget() {
  const usage = await getMonthlyUsage();

  if (usage.total_cost > MONTHLY_BUDGET * 0.8) {
    await sendAlert("AI costs at 80% of monthly budget");
  }
}
```

---

## 🔒 SAFETY & SECURITY

### Content Filtering:

```yaml
Input Filtering: ❌ Block profanity
  ❌ Block discrimination
  ❌ Block threats/violence
  ❌ Block personal attacks
  ❌ Block attempts to jailbreak AI

Output Filtering: ❌ Block legal advice (vs information)
  ❌ Block guaranteed outcomes
  ❌ Block solicitor impersonation
  ❌ Block unfair contract terms
  ❌ Block prohibited fees
```

### Rate Limiting:

```typescript
// Per-user rate limits
const RATE_LIMITS = {
  fact_finding: "50 requests / 15 minutes",
  document_generation: "10 documents / hour",
  qa_validation: "20 validations / hour",
};

// Implementation
async function checkRateLimit(userId: string, action: string) {
  const key = `rate_limit:${userId}:${action}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, RATE_LIMITS[action].seconds);
  }

  if (count > RATE_LIMITS[action].max) {
    throw new Error("Rate limit exceeded");
  }
}
```

---

## 📊 MONITORING & LOGGING

### Metrics to Track:

```yaml
Performance:
  - AI response time (p50, p95, p99)
  - Template compilation time
  - PDF generation time
  - End-to-end case time

Quality:
  - QA pass rate (target: >95%)
  - Average quality score (target: >90)
  - Regeneration rate (target: <5%)
  - User satisfaction (target: >4.5/5)

Cost:
  - Cost per case
  - Cost per document
  - Monthly AI spend
  - Cost vs revenue ratio

Errors:
  - AI timeout rate
  - API error rate
  - Validation failure rate
  - User-reported issues
```

### Logging Structure:

```typescript
interface AILogEntry {
  timestamp: Date;
  case_id: string;
  user_id: string;
  model: string;
  action: "fact_finding" | "decision" | "generation" | "qa";

  input: {
    prompt_tokens: number;
    prompt_preview: string; // First 200 chars
  };

  output: {
    completion_tokens: number;
    output_preview: string; // First 200 chars
    quality_score?: number;
  };

  performance: {
    latency_ms: number;
    retries: number;
  };

  cost: {
    input_cost: number;
    output_cost: number;
    total_cost: number;
  };

  errors?: string[];
}
```

---

## 🚨 ERROR HANDLING

### Retry Strategy:

```typescript
async function callAIWithRetry(
  prompt: string,
  model: string,
  maxRetries: number = 3
) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await callAI(prompt, model);
      return response;
    } catch (error) {
      attempt++;

      if (error.code === "rate_limit_exceeded") {
        // Wait and retry
        await sleep(2000 * attempt);
        continue;
      }

      if (error.code === "server_error") {
        // Try different model
        if (model === "gpt-4") {
          model = "gpt-4-turbo";
          continue;
        }
      }

      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}
```

### Fallback Strategy:

```yaml
If GPT-4 fails: → Try GPT-4 Turbo
  → Try GPT-3.5 Turbo
  → Use cached template (if available)
  → Alert admin
  → Offer refund to user

If Claude fails (QA): → Skip QA (log warning)
  → Deliver with disclaimer
  → Manual review queue

If all AI fails: → Notify user of delay
  → Manual generation by support
  → Full refund offered
```

---

## ✅ TESTING STRATEGY

### Test Cases:

```yaml
Happy Path:
  - Simple rent arrears case
  - Standard Section 8 notice
  - All facts valid
  - Expected: ✅ Pass QA, quality >90

Edge Cases:
  - Multiple grounds selected
  - Complex tenancy dates
  - Vulnerable tenant flags
  - Expected: ✅ Pass with warnings

Failure Cases:
  - Missing required facts
  - Invalid dates (future start)
  - Inconsistent amounts
  - Expected: ❌ Fail validation

Attack Cases:
  - Prompt injection attempts
  - Jailbreak attempts
  - Malicious input
  - Expected: ❌ Blocked by filters
```

### QA Checklist:

```yaml
Before Launch: ✅ Generate 100 test documents
  ✅ Manual legal review (20% sample)
  ✅ All QA scores >85
  ✅ No prohibited content
  ✅ All templates compile
  ✅ PDFs generate correctly
  ✅ Costs within budget
  ✅ Rate limits working
  ✅ Error handling tested
  ✅ Monitoring dashboard live
```

---

## 🎯 SUCCESS METRICS

### Month 1 Targets:

```yaml
Quality:
  - QA pass rate: >90%
  - Avg quality score: >88
  - Regeneration rate: <10%
  - User satisfaction: >4.0/5

Performance:
  - p95 response time: <5s
  - Uptime: >99.5%
  - Error rate: <1%

Cost:
  - Cost per case: <£0.15
  - Monthly AI spend: <£500
  - Cost/revenue ratio: <0.5%
```

### Month 6 Targets:

```yaml
Quality:
  - QA pass rate: >95%
  - Avg quality score: >92
  - Regeneration rate: <5%
  - User satisfaction: >4.5/5

Performance:
  - p95 response time: <3s
  - Uptime: >99.9%
  - Error rate: <0.5%

Cost:
  - Cost per case: <£0.10
  - Monthly AI spend: Scale with revenue
  - Cost/revenue ratio: <0.3%
```

---

**END OF AI PIPELINE ARCHITECTURE**

This pipeline ensures accurate, safe, and cost-efficient AI document generation with comprehensive guard rails at every step.
