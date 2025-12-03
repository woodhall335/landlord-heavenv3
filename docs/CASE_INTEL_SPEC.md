# Case Intelligence System Specification

**Version:** 2.0.0
**Date:** December 3, 2025
**Module:** `src/lib/case-intel/`

## Overview

The Case Intelligence System provides AI-powered analysis of eviction cases, including:

1. **Case Strength Scoring** (0-100 score)
2. **Consistency Checking** (timeline validation, contradiction detection)
3. **Evidence Analysis** (completeness, gaps, timeline extraction)
4. **AI Narrative Generation** (court/tribunal-ready documents)

## Critical Design Principle: LAW-CHANGE SAFE

**⚠️ NO LEGAL RULES ARE HARD-CODED IN THIS MODULE**

All legal logic comes from:
- **Decision Engine YAML configs** (`src/lib/decision-engine/`)
- **MQS YAML files** (`config/mqs/`)
- **CaseFacts schema** (`src/lib/case-facts/schema.ts`)

This ensures:
- Legal rules can be updated via YAML without code changes
- Jurisdiction-specific logic is centralized
- System adapts to law changes by updating configs only

---

## Architecture

```
src/lib/case-intel/
├── index.ts          # Main API exports
├── types.ts          # TypeScript type definitions
├── scorer.ts         # Case strength scoring
├── consistency.ts    # Data consistency checks
├── evidence.ts       # Evidence analysis
└── narrative.ts      # AI narrative generation
```

### Dependencies

```
case-intel
├── decision-engine (legal rules from YAML)
├── case-facts (normalized data structure)
├── openai-client (gpt-4o-mini for narratives)
└── mqs-loader (question definitions)
```

---

## Main API Functions

### 1. `analyzeCase()`

**Primary function** - Comprehensive case analysis.

```typescript
import { analyzeCase } from '@/lib/case-intel';

const intelligence = await analyzeCase(caseFacts, {
  include_narrative: true,
  include_evidence: true,
  narrative_options: {
    target: 'n119', // or 'form_e' or 'general'
    include_dates: true,
    include_amounts: true,
  },
});
```

**Returns:** `CaseIntelligence`

```typescript
interface CaseIntelligence {
  score_report: CaseStrengthScore;       // 0-100 score with components
  narrative: CaseNarrative;              // AI-generated narratives
  evidence: EvidenceAnalysis;            // Evidence completeness & gaps
  inconsistencies: ConsistencyReport;    // Data quality issues
  decision_engine_output: DecisionOutput; // Pass-through from decision engine
  case_facts: CaseFacts;                 // Input facts
  metadata: {
    jurisdiction: string;
    product: string;
    case_type: string;
    analyzed_at: string;
    engine_version: string;
  };
}
```

### 2. `quickScoreCase()`

**Fast scoring** without narratives or detailed evidence.

```typescript
import { quickScoreCase } from '@/lib/case-intel';

const { score, rating, key_issues } = quickScoreCase(caseFacts);
// score: 0-100
// rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'
// key_issues: string[] (top 5 issues)
```

### 3. `isCaseReadyForSubmission()`

**Readiness check** - identifies blockers before submission.

```typescript
import { isCaseReadyForSubmission } from '@/lib/case-intel';

const { ready, blockers, warnings } = isCaseReadyForSubmission(caseFacts);
// ready: boolean
// blockers: string[] (critical issues preventing submission)
// warnings: string[] (issues that should be addressed)
```

### 4. Standalone Narrative Functions

```typescript
import { generateArrearsNarrative, generateASBNarrative } from '@/lib/case-intel';

const arrearsText = await generateArrearsNarrative(caseFacts);
const asbText = await generateASBNarrative(caseFacts);
```

---

## Component 1: Case Strength Scoring

**File:** `src/lib/case-intel/scorer.ts`

### Scoring Formula

```
Overall Score = (Legal × 40%) + (Evidence × 30%) + (Consistency × 20%) + (Procedure × 10%)
```

Each component scored 0-100 independently, then weighted.

### Legal Eligibility Component (40% weight)

**Sources:**
- Decision engine `blocking_issues` (from YAML rules)
- Decision engine `recommended_grounds` (from YAML)
- Decision engine `recommended_routes` (from YAML)

**Scoring Logic:**
```typescript
Start: 100 points

Deductions:
- Blocking issue: -25 points each
- Warning issue: -10 points each
- No viable routes: cap at 40 points

Bonuses:
- Mandatory ground available: +10 points
- High success probability ground (≥80%): +5 points
```

**Example Output:**
```typescript
{
  score: 75,
  weight: 0.4,
  notes: [
    "1 route(s) blocked by compliance issues",
    "Mandatory grounds are strong if facts proven"
  ],
  issues: [
    "SECTION_21 BLOCKED: Deposit not protected in approved scheme"
  ],
  strengths: [
    "1 MANDATORY ground(s): 8",
    "1 viable route(s): section_8"
  ]
}
```

### Evidence Component (30% weight)

**Sources:**
- Evidence analysis `completeness_score`
- Evidence analysis `missing_evidence`
- Evidence metadata from CaseFacts

**Scoring Logic:**
```typescript
Start: evidence.completeness_score

Base completeness:
- Missing critical evidence: -15 points each
- Missing recommended evidence: -5 points each
- No arrears detail (when arrears exists): -10 points
- No ASB detail (when ASB exists): -10 points
```

### Consistency Component (20% weight)

**Sources:**
- Consistency report from `checkConsistency()`

**Scoring Logic:**
```typescript
Start: 100 points

Deductions:
- Critical inconsistency: -20 points each
- Warning: -10 points each
- High-priority data gap: -5 points each
```

### Procedure Component (10% weight)

**Sources:**
- Notice service fields from CaseFacts
- Decision engine warnings (notice period, service issues)

**Scoring Logic:**
```typescript
Start: 100 points

Deductions:
- No service date: -20 points
- No service method: -10 points
- No expiry date: -15 points
- Notice not yet expired: -5 points
- Notice period warning: -15 points
```

---

## Component 2: Consistency Checking

**File:** `src/lib/case-intel/consistency.ts`

### Checks Performed

#### Timeline Consistency
- Tenancy start date is in the past
- Notice served after tenancy started
- Notice expiry after service date
- Arrears periods within tenancy period

#### Arrears Consistency
- `has_arrears` matches `total_arrears > 0`
- Arrears items sum equals total (within rounding)
- Arrears amounts reasonable vs rent amount

#### Grounds Consistency
- Ground 8 selected → arrears must exist
- Ground 14 selected → ASB must exist
- Ground 12 selected → breach must exist
- Decision engine blocks reflected

#### Data Completeness
- Landlord name present
- At least one tenant present
- Property address present
- Tenancy start date present
- Ground-specific requirements present

### Output Structure

```typescript
interface ConsistencyReport {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  inconsistencies: Inconsistency[];
  data_gaps: DataGap[];
  score: number; // 0-100
}

interface Inconsistency {
  fields: string[];
  message: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'timeline' | 'arrears' | 'grounds' | 'contradiction' | 'procedural';
  suggestion?: string;
}
```

### Severity Levels

- **Critical:** Blocks case submission (e.g., dates before tenancy start)
- **Warning:** Should be fixed but not blocking (e.g., arrears items don't sum exactly)
- **Info:** FYI only (e.g., large single arrears amount)

---

## Component 3: Evidence Analysis

**File:** `src/lib/case-intel/evidence.ts`

### Evidence Categories

1. **Arrears** - Payment history, bank statements, arrears schedules
2. **ASB** - Incident logs, neighbor complaints, police reports
3. **Damage** - Photos, damage schedules, repair quotes
4. **Communications** - Letters, emails, SMS with tenant
5. **Compliance** - Deposit certificates, gas certs, EPC, How to Rent
6. **Other** - General evidence

### Evidence Quality Ratings

- **Strong:** Dated, detailed, directly relevant (e.g., bank statement showing missed payments)
- **Adequate:** Present but lacking some detail (e.g., text description of ASB without dates)
- **Weak:** Minimal or contradictory (e.g., "no" to deposit protection)

### Timeline Extraction

Automatically extracts dates from:
- Arrears items (`period_start`, `period_end`)
- ASB incidents (`incident.date`)
- Notice service (`notice.service_date`, `notice.expiry_date`)
- Tenancy start (`tenancy.start_date`)

**Output:** Chronologically sorted timeline for narrative generation.

### Missing Evidence Detection

**Sources:**
- Decision engine `recommended_grounds` (from YAML)
- Decision engine `recommended_routes` (from YAML)

**Logic:**
```typescript
For each recommended ground:
  If Ground 8/10/11 → require: bank statements, arrears breakdown
  If Ground 14 → require: ASB logs with dates, correspondence
  If Ground 12 → require: correspondence about breach
  If Ground 15 → require: photos of damage

For Section 21 route:
  Require: gas cert, EPC, How to Rent proof
```

### Completeness Score

```typescript
Start: 100 points

Deductions:
- Critical missing evidence: -15 points each
- Recommended missing evidence: -5 points each
- Has arrears but no detail: -10 points
- Has ASB but no detail: -10 points
- Has breach but no detail: -10 points
```

---

## Component 4: AI Narrative Generation

**File:** `src/lib/case-intel/narrative.ts`

### Narrative Types

1. **Case Summary** - Overall case overview (150-200 words)
2. **Ground Narratives** - Specific particulars for each ground (100-150 words each)
3. **Arrears Narrative** - Chronological arrears schedule (100-150 words)
4. **ASB Narrative** - Incident chronology (100-150 words)
5. **Tribunal Narrative** - Full particulars for N119/Form E (200-250 words)

### AI Model Configuration

- **Model:** `gpt-4o-mini`
- **Temperature:** `0.2-0.3` (factual, consistent)
- **Max Tokens:** `300-500` (depending on narrative type)

### Prompting Strategy

**System Prompt Rules:**
```
✅ Use plain, neutral language
✅ State facts only - no opinions
✅ Include dates, amounts, concrete events
✅ Use jurisdiction-appropriate terminology
✅ Never invent facts not provided
❌ Never give legal advice or strategy
❌ Never tell user what route to choose
❌ Never create new legal rules
```

**Jurisdiction Context Injection:**

- **England & Wales:** Section 8/21 terminology, court language
- **Scotland:** Notice to Leave, First-tier Tribunal, emphasize discretionary nature
- **Northern Ireland:** Notice to Quit terminology

### Example Generated Narrative

**Input:**
```typescript
{
  landlord: "John Smith",
  tenants: ["Jane Doe"],
  property: "123 High Street, London, SE1 1AA",
  tenancy_start: "2023-01-15",
  rent_amount: 1500,
  total_arrears: 4500,
  grounds: ["8", "10"],
  notice_served: "2025-10-01"
}
```

**Output (Case Summary):**
```
The Claimant, John Smith, seeks possession of 123 High Street, London,
SE1 1AA against the Defendant, Jane Doe. The tenancy commenced on 15
January 2023 at a monthly rent of £1,500. The Defendant is currently in
arrears of £4,500, representing three months' unpaid rent. A Section 8
notice was served on 1 October 2025 on Ground 8 (serious rent arrears)
and Ground 10 (some rent arrears). Ground 8 is a mandatory ground as the
arrears threshold is met. The Claimant respectfully requests an order for
possession.
```

### Fallback Behavior

If OpenAI API key not configured or error occurs:
- Returns placeholder text: "Narrative generation not available"
- Does NOT block case analysis
- User can still access score, consistency, evidence reports

---

## Input: CaseFacts Structure

**Source:** `src/lib/case-facts/schema.ts`

The Case Intelligence module consumes `CaseFacts` (normalized from `WizardFacts`).

### Key Fields Used

```typescript
interface CaseFacts {
  meta: {
    jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
    product: 'notice_only' | 'complete_pack' | 'money_claim';
  };

  parties: {
    landlord: { name, address, phone, email };
    tenants: [{ name, address, email, phone }];
  };

  property: {
    address: { line1, line2, city, postcode, country };
  };

  tenancy: {
    start_date: string;
    rent_amount: number;
    rent_frequency: string;
    deposit_protected: boolean | null;
    prescribed_info_given: boolean | null;
  };

  issues: {
    rent_arrears: {
      has_arrears: boolean | null;
      total_arrears: number | null;
      arrears_items: ArrearsItem[];
      pre_action_confirmed: boolean | null; // Scotland
    };

    section8_grounds: {
      selected_grounds: string[];
      arrears_breakdown: string;
      incident_log: string;
      breach_details: string;
      damage_schedule: string;
    };

    asb: {
      has_asb: boolean | null;
      description: string;
      incidents: Incident[];
    };

    breaches: {
      has_breaches: boolean | null;
      description: string;
    };
  };

  compliance: {
    gas_safety_cert_provided: boolean;
    epc_provided: boolean;
    how_to_rent_given: boolean;
    hmo_license_valid: boolean;
  };

  notice: {
    service_date: string;
    expiry_date: string;
    service_method: string;
    served_by: string;
  };

  evidence: {
    correspondence_uploaded: boolean;
    bank_statements_uploaded: boolean;
    asb_logs_uploaded: boolean;
    photos_uploaded: boolean;
  };
}
```

---

## Decision Engine Integration

**The decision engine is the SINGLE SOURCE OF TRUTH for legal rules.**

### Decision Engine Output Used

```typescript
interface DecisionOutput {
  // Which routes are viable
  recommended_routes: ('section_8' | 'section_21' | 'notice_to_leave')[];

  // Which grounds apply (from YAML)
  recommended_grounds: GroundRecommendation[];

  // What blocks routes (from YAML compliance rules)
  blocking_issues: BlockingIssue[];

  // General warnings (from YAML)
  warnings: string[];

  // Scotland pre-action requirements (from YAML)
  pre_action_requirements: PreActionRequirement[];

  // Summary text
  analysis_summary: string;
}
```

### How Case Intel Uses Decision Engine

1. **Scorer** reads `blocking_issues`, `recommended_grounds`, `recommended_routes` to calculate legal eligibility score
2. **Consistency checker** compares selected grounds vs facts to detect contradictions
3. **Evidence analyzer** identifies missing evidence based on `recommended_grounds`
4. **Narrative generator** uses `recommended_grounds` to generate ground-specific narratives

**Case Intel NEVER overrides or contradicts decision engine outputs.**

---

## Usage Examples

### Example 1: Full Analysis

```typescript
import { analyzeCase } from '@/lib/case-intel';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';

// Get case from DB
const caseRow = await supabase.from('cases').select('*').eq('id', caseId).single();
const wizardFacts = await getWizardFacts(caseId);

// Normalize to CaseFacts
const caseFacts = normalizeCaseFacts(wizardFacts);

// Run full analysis
const intelligence = await analyzeCase(caseFacts, {
  include_narrative: true,
  include_evidence: true,
  narrative_options: {
    target: caseRow.jurisdiction === 'scotland' ? 'form_e' : 'n119',
  },
});

console.log(`Case Strength: ${intelligence.score_report.score}/100`);
console.log(`Legal Eligibility: ${intelligence.score_report.components.legal_eligibility.score}/100`);
console.log(`Evidence: ${intelligence.score_report.components.evidence.score}/100`);

// Check for blockers
if (intelligence.score_report.components.legal_eligibility.issues?.length > 0) {
  console.log('Blocking Issues:', intelligence.score_report.components.legal_eligibility.issues);
}

// Get narratives for documents
const n119Particulars = intelligence.narrative.tribunal_narrative;
const arrearsSchedule = intelligence.narrative.arrears_narrative;
```

### Example 2: Quick Readiness Check

```typescript
import { isCaseReadyForSubmission } from '@/lib/case-intel';

const { ready, blockers, warnings } = isCaseReadyForSubmission(caseFacts);

if (!ready) {
  console.log('Cannot submit yet. Blockers:');
  blockers.forEach(b => console.log(`- ${b}`));
}

if (warnings.length > 0) {
  console.log('Warnings (should address):');
  warnings.forEach(w => console.log(`- ${w}`));
}
```

### Example 3: Display Score in UI

```typescript
import { quickScoreCase } from '@/lib/case-intel';

const { score, rating, key_issues } = quickScoreCase(caseFacts);

// Display in dashboard
<div className="case-strength">
  <div className="score">{score}/100</div>
  <div className="rating">{rating}</div>
  <ul className="issues">
    {key_issues.map(issue => <li key={issue}>{issue}</li>)}
  </ul>
</div>
```

### Example 4: Evidence Gap Detection

```typescript
const intelligence = await analyzeCase(caseFacts);

const criticalGaps = intelligence.evidence.missing_evidence
  .filter(m => m.priority === 'critical');

if (criticalGaps.length > 0) {
  console.log('CRITICAL evidence missing:');
  criticalGaps.forEach(gap => {
    console.log(`- ${gap.item}: ${gap.reason}`);
  });
}
```

---

## API Endpoint Integration

### Suggested Endpoint: `/api/case-intel/analyze`

```typescript
// src/app/api/case-intel/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCase } from '@/lib/case-intel';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';
import { getWizardFacts } from '@/lib/case-facts/store';

export async function POST(request: NextRequest) {
  const { case_id, include_narrative = true } = await request.json();

  // Get wizard facts
  const wizardFacts = await getWizardFacts(case_id);
  const caseFacts = normalizeCaseFacts(wizardFacts);

  // Run analysis
  const intelligence = await analyzeCase(caseFacts, {
    include_narrative,
    include_evidence: true,
  });

  return NextResponse.json(intelligence);
}
```

### Suggested Endpoint: `/api/case-intel/ready`

```typescript
// src/app/api/case-intel/ready/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { isCaseReadyForSubmission } from '@/lib/case-intel';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';
import { getWizardFacts } from '@/lib/case-facts/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const case_id = searchParams.get('case_id');

  const wizardFacts = await getWizardFacts(case_id!);
  const caseFacts = normalizeCaseFacts(wizardFacts);

  const result = isCaseReadyForSubmission(caseFacts);

  return NextResponse.json(result);
}
```

---

## Performance Considerations

### Execution Time

- **quickScoreCase():** ~50-100ms (no AI calls)
- **analyzeCase() without narratives:** ~100-200ms
- **analyzeCase() with narratives:** ~3-5 seconds (OpenAI API calls)

### Optimization Tips

1. **Lazy narrative generation:** Only generate when user requests
2. **Cache analysis:** Store in DB if case facts haven't changed
3. **Parallel AI calls:** Generate multiple narratives concurrently
4. **Partial analysis:** Use `quickScoreCase()` for dashboard displays

### Resource Usage

- **Memory:** ~5-10MB per analysis (CaseFacts + outputs)
- **OpenAI tokens:** ~1,000-2,000 tokens per full narrative set (~$0.0003-$0.0006 cost)

---

## Testing Strategy

### Unit Tests

```typescript
// Test scorer
describe('calculateCaseStrength', () => {
  it('should deduct points for blocking issues', () => {
    const decisionOutput = {
      blocking_issues: [
        { route: 'section_21', severity: 'blocking', description: 'Deposit not protected' }
      ],
      recommended_grounds: [],
      warnings: []
    };

    const score = calculateCaseStrength(facts, decisionOutput, consistency, evidence);
    expect(score.components.legal_eligibility.score).toBeLessThan(100);
  });
});

// Test consistency
describe('checkConsistency', () => {
  it('should flag notice before tenancy start', () => {
    const facts = {
      tenancy: { start_date: '2025-01-01' },
      notice: { service_date: '2024-12-01' }
    };

    const report = checkConsistency(facts, decisionOutput);
    expect(report.inconsistencies).toHaveLength(1);
    expect(report.inconsistencies[0].severity).toBe('critical');
  });
});
```

### Integration Tests

```typescript
describe('analyzeCase integration', () => {
  it('should return full intelligence for valid case', async () => {
    const intelligence = await analyzeCase(validCaseFacts);

    expect(intelligence.score_report.score).toBeGreaterThan(0);
    expect(intelligence.narrative.case_summary).toBeTruthy();
    expect(intelligence.evidence.completeness_score).toBeGreaterThan(0);
  });
});
```

---

## Future Enhancements

### Phase 3 (Potential)

1. **Predictive Success Modeling**
   - ML model trained on historical case outcomes
   - Predicts win probability based on similar cases
   - Uses judge/tribunal track record data

2. **Document Quality Scoring**
   - OCR analysis of uploaded evidence
   - Checks for dates, signatures, legibility
   - Flags poor-quality scans

3. **Comparative Analysis**
   - "Similar cases in your jurisdiction"
   - Average scores for case type
   - Benchmark against successful cases

4. **Real-time Coaching**
   - As user fills wizard, show live score
   - Suggest which ground to focus on
   - Highlight missing evidence dynamically

5. **Multi-language Narratives**
   - Support Welsh language (bilingual requirement)
   - Translate narratives while preserving legal accuracy

---

## Change Log

### v2.0.0 (2025-12-03)
- Initial implementation of Case Intelligence System
- Integrated with decision engine v2.0
- Added AI narrative generation via gpt-4o-mini
- Comprehensive scoring across 4 components
- Evidence analysis with gap detection
- Consistency checking with severity levels

---

## Support and Maintenance

### Adding New Legal Rules

**✅ DO:** Update YAML configs in `src/lib/decision-engine/` or `config/mqs/`

**❌ DON'T:** Hard-code rules in `case-intel/` TypeScript files

### Adding New Jurisdictions

1. Add jurisdiction to decision engine YAML
2. Add jurisdiction context to `narrative.ts` → `getJurisdictionContext()`
3. No other changes needed - system will auto-adapt

### Adjusting Scoring Weights

Edit `DEFAULT_WEIGHTS` in `src/lib/case-intel/scorer.ts`:

```typescript
const DEFAULT_WEIGHTS = {
  legal_eligibility: 0.4, // 40%
  evidence: 0.3,          // 30%
  consistency: 0.2,       // 20%
  procedure: 0.1,         // 10%
};
```

Weights must sum to 1.0.

---

**Document Version:** 1.0
**Last Updated:** December 3, 2025
**Maintainer:** Landlord Heaven Engineering Team
