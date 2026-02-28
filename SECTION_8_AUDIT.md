# Section 8 (Fault-Based) Notice-Only Flow Audit for England

**Audit Date:** 2025-12-23
**Branch:** claude/audit-section-8-flow-KKeeR
**Auditor:** Claude (Automated Audit)

---

## Executive Summary

| Category | Status | Notes |
|----------|--------|-------|
| MQS Configuration | ✅ Functional | Core flow works; some gaps in ground coverage |
| Validation Logic | ⚠️ Partial | Hard bars defined; inline validation incomplete |
| Document Generation | ✅ Good | Form 3 template comprehensive |
| Ground Coverage | ⚠️ Limited | Only 11 of 17+ grounds supported |
| Ask Heaven Integration | ✅ Integrated | Works for free-text particulars |
| Notice Period Calculation | ⚠️ Needs Work | Not ground-dependent |

### Overall Health: **MODERATE** - Core functionality works, gaps in advanced features

---

## A. MQS Configuration Audit

**File:** `config/mqs/notice_only/england.yaml`

### A.1 Section 8 Route Selection

```yaml
# Question ID: selected_notice_route (lines ~220-260)
- id: selected_notice_route
  section: eviction_grounds
  question: "Which type of eviction notice do you want to serve?"
  input_type: radio
  options:
    - value: section_21
      label: "Section 21 (No-fault) Notice"
      description: "End tenancy without stating a reason..."
    - value: section_8
      label: "Section 8 (Fault-based) Notice"
      description: "Evict tenant for specific reasons..."
```

**Trigger Logic:**
- User selects `section_8` value
- All subsequent S8 questions use `dependsOn: {selected_notice_route: 'section_8'}`

### A.2 Section 8 Grounds Questions

| Question ID | Type | Purpose | Line Reference |
|-------------|------|---------|----------------|
| `section8_grounds_selection` | checkbox | Multi-select grounds | ~270 |
| `section8_grounds_intro` | info | Explain mandatory vs discretionary | ~268 |

**Grounds Selection Question:**
```yaml
- id: section8_grounds_selection
  section: section8_grounds
  question: "Which ground(s) are you relying on?"
  input_type: checkbox
  dependsOn:
    selected_notice_route: section_8
  maps_to: section8_grounds
  options:
    - value: ground_8
      label: "Ground 8 - Serious rent arrears"
      description: "At least 2 months rent unpaid at notice AND court hearing"
    - value: ground_10
      label: "Ground 10 - Some rent unpaid"
      description: "Any rent arrears at notice date"
    - value: ground_11
      label: "Ground 11 - Persistent late payment"
      description: "Tenant persistently delays paying rent"
    - value: ground_12
      label: "Ground 12 - Breach of tenancy"
      description: "Tenant has broken a term of the tenancy agreement"
    - value: ground_13
      label: "Ground 13 - Property deterioration"
      description: "Condition of property has deteriorated due to tenant"
    - value: ground_14
      label: "Ground 14 - Nuisance or antisocial behaviour"
      description: "Tenant causing nuisance or convicted of illegal use"
    - value: ground_17
      label: "Ground 17 - False statement"
      description: "Tenancy obtained through false information"
```

**Available Grounds in MQS:** 7 grounds (8, 10, 11, 12, 13, 14, 17)

### A.3 Ground Particulars Collection

**Structure:** Uses dynamic ground-specific questions based on selection

```yaml
# Shared Arrears (for Grounds 8, 10, 11)
- id: section8_shared_arrears_section
  dependsOn:
    selected_notice_route: section_8
    section8_grounds_selection:
      anyOf: [ground_8, ground_10, ground_11]
  maps_to: ground_particulars.shared_arrears

# Fields collected:
- total_amount_owed (currency)
- arrears_from_date (date)
- arrears_to_date (date)
- arrears_schedule_summary (textarea with suggestion_prompt)
```

**Per-Ground Particulars:**
```yaml
# Ground 8 specific
- id: ground_8_particulars_section
  dependsOn:
    section8_grounds_selection:
      includes: ground_8
  maps_to: ground_particulars.ground_8
  fields:
    - factual_summary (textarea)
    - evidence_available (textarea)

# Similar structure for Ground 10, 11, 12, 13, 14, 17
```

### A.4 Ask Heaven AI Integration for Particulars

**Location:** `config/mqs/notice_only/england.yaml` lines ~800-900

```yaml
# Example from arrears_schedule_summary field
- id: arrears_schedule_summary
  input_type: textarea
  suggestion_prompt: |
    Help the landlord write a clear summary of the rent arrears situation.
    Include: total amount owed, period of arrears, payment history,
    any partial payments received. Use neutral, factual language.
```

**Fields with Ask Heaven suggestions:**
| Field | Ground(s) | Purpose |
|-------|-----------|---------|
| `arrears_schedule_summary` | 8, 10, 11 | Summarize arrears history |
| `ground_8_factual_summary` | 8 | Explain why Ground 8 applies |
| `ground_11_pattern_description` | 11 | Document late payment pattern |
| `ground_12_breach_details` | 12 | Describe tenancy breach |
| `ground_14_incident_details` | 14 | Document ASB incidents |

### A.5 Arrears-Specific Questions

| Field | Question ID | Maps To | Purpose |
|-------|-------------|---------|---------|
| Total arrears | `total_amount_owed` | `ground_particulars.shared_arrears.total_amount_owed` | Total rent owed |
| Arrears from | `arrears_from_date` | `ground_particulars.shared_arrears.arrears_from_date` | Start of arrears period |
| Arrears to | `arrears_to_date` | `ground_particulars.shared_arrears.arrears_to_date` | End of arrears period |
| Rent amount | `rent_amount` | `rent_amount` | Monthly/weekly rent |
| Rent frequency | `rent_frequency` | `rent_frequency` | Payment frequency |

**Ground 8 Threshold Calculation:**
- The system collects `rent_amount` and `rent_frequency`
- `buildGroundsArray()` in `normalize.ts:2062-2065` calculates threshold:
  - Monthly: 2 × rent = threshold
  - Weekly: 8 × rent = threshold
- Template displays: "Rent arrears at date of notice: £X (threshold for 2 months: £Y)"

### A.6 Conditional Logic (dependsOn)

**S8 Route Dependencies:**
```yaml
# All S8 questions depend on route selection
dependsOn:
  selected_notice_route: section_8

# Shared arrears depends on arrears grounds
dependsOn:
  selected_notice_route: section_8
  section8_grounds_selection:
    anyOf: [ground_8, ground_10, ground_11]

# Ground-specific particulars
dependsOn:
  section8_grounds_selection:
    includes: ground_8  # or ground_10, ground_11, etc.
```

**S21-Only Questions Hidden for S8:**
- Deposit protection questions: ✅ Hidden (different section)
- Gas safety, EPC, How to Rent: ✅ Hidden (S21 compliance section)
- Licensing questions: ✅ Hidden (S21 compliance section)

### A.7 Question Flow Order (S8 Path)

1. `eviction_reason` - Why are you evicting?
2. `selected_notice_route` - S21 or S8?
3. `section8_grounds_intro` - Info about mandatory vs discretionary
4. `section8_grounds_selection` - Multi-select grounds
5. `section8_shared_arrears_section` - If arrears grounds selected
6. `ground_X_particulars_section` - Per-ground particulars
7. `section8_other_grounds_narrative` - Fallback narrative field
8. Standard party/property questions
9. Notice service questions

---

## B. Validation Audit

**Files:**
- `src/lib/notices/evaluate-notice-compliance.ts`
- `src/lib/notices/notice-compliance-spec.ts`
- `src/lib/wizard/gating.ts`
- `src/lib/validation/validateFlow.ts`

### B.1 Section 8 Validation Rules

**From `notice-compliance-spec.ts:1-108`:**

```typescript
{
  jurisdiction: 'england',
  route: 'notice-only/england/section8',
  prescribed_form_version: 'Section 8 (Housing Act 1988) – prescribed notice',

  required_inputs: [
    { id: 'grounds', required: true },
    { id: 'arrears_amount', required: true },  // For Grounds 8, 10, 11
    { id: 'tenancy_start', required: true },
    { id: 'service_method', required: true },
  ],

  hard_bars: [
    {
      code: 'S8-GROUNDS-REQUIRED',
      legal_reason: 'At least one statutory ground must be stated with particulars',
      affected_question_id: 'section8_grounds_selection',
    },
    {
      code: 'S8-NOTICE-PERIOD',
      legal_reason: 'Notice expiry must reflect the longest statutory period',
      affected_question_id: 'notice_expiry_date',
    },
  ],

  soft_warnings: [
    {
      code: 'S8-ARREARS-EVIDENCE',
      legal_reason: 'Courts expect arrears schedule for Grounds 8/10/11',
    },
  ],

  inline_validation_rules: [
    {
      code: 'S8-GROUND8-TWO-MONTHS',
      legal_reason: 'Ground 8 requires at least two months arrears at service date',
    },
    {
      code: 'S8-GROUNDS-MATCH-NOTICE-PERIOD',
      legal_reason: 'Selected grounds determine statutory notice period',
    },
  ],
}
```

### B.2 Ground 8 Threshold Validation

**From `evaluate-notice-compliance.ts`:**

```typescript
// Ground 8 validation logic (lines ~150-200)
if (selectedGrounds.includes('ground_8')) {
  const arrearsAmount = facts.total_arrears || facts.arrears_at_notice_date;
  const rentAmount = facts.rent_amount;
  const rentFrequency = facts.rent_frequency;

  const threshold = calculateGround8Threshold(rentAmount, rentFrequency);

  if (arrearsAmount < threshold) {
    violations.push({
      code: 'S8-GROUND8-THRESHOLD',
      severity: 'blocking',
      description: `Ground 8 requires arrears ≥ ${threshold} (2 months rent). Current: ${arrearsAmount}`,
      user_fix_hint: 'Use Ground 10 instead if arrears are below threshold',
    });
  }
}
```

### B.3 Notice Period Validation

**Current Implementation:**

| Ground | Correct Period | Implemented? |
|--------|----------------|--------------|
| Ground 8 | 2 weeks | ⚠️ Defaults to 14 days |
| Ground 10 | 2 months | ❌ Not implemented |
| Ground 11 | 2 months | ❌ Not implemented |
| Ground 12-13 | 2 weeks | ⚠️ Defaults to 14 days |
| Ground 14 | Immediate possible | ❌ Not implemented |
| Ground 17 | 2 weeks | ⚠️ Defaults to 14 days |

**From `normalize.ts:2727-2732`:**
```typescript
// Calculate earliest_possession_date if not provided
if (!templateData.earliest_possession_date && templateData.service_date) {
  const noticePeriodDays = templateData.notice_period_days || 14;  // DEFAULT 14 DAYS
  // ... calculation
}
```

**⚠️ CRITICAL GAP:** Notice period is NOT ground-dependent. All grounds default to 14 days.

### B.4 Blocking vs Warning Issues

| Issue | Type | Effect |
|-------|------|--------|
| No grounds selected | BLOCKING | Cannot generate |
| Ground 8 below threshold | BLOCKING | Cannot use Ground 8 |
| Missing particulars | WARNING | Can proceed with warning |
| Missing arrears evidence | WARNING | Can proceed with warning |

### B.5 All S8 Validation Codes

| Code | Trigger | Severity |
|------|---------|----------|
| `S8-GROUNDS-REQUIRED` | No grounds selected | blocking |
| `S8-NOTICE-PERIOD` | Expiry before minimum | blocking |
| `S8-GROUND8-TWO-MONTHS` | Arrears < 2 months rent | blocking |
| `S8-ARREARS-EVIDENCE` | No arrears schedule | warning |
| `S8-DATE-TOO-SOON` | Possession date too early | correction |

---

## C. Document Generation Audit

**Files:**
- `src/app/api/notice-only/preview/[caseId]/route.ts`
- `src/lib/case-facts/normalize.ts` (mapNoticeOnlyFacts)
- Template: `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs`

### C.1 Template Files

| Template | Purpose | Exists? |
|----------|---------|---------|
| `notice.hbs` | Form 3 main notice | ✅ Yes |
| `service_instructions.hbs` | Service guidance | ✅ Embedded in notice.hbs |
| `checklist.hbs` | Validity checklist | ✅ Embedded in notice.hbs |

### C.2 Data Mapping Flow

```
User Input (Wizard)
    ↓
WizardFacts (stored in collected_facts)
    ↓
mapNoticeOnlyFacts() [normalize.ts:2240-2839]
    ↓
TemplateData (flat + nested structure)
    ↓
buildGroundsArray() [normalize.ts:1958-2110]
    ↓
Handlebars Template (notice.hbs)
    ↓
HTML → Puppeteer → PDF
```

### C.3 Key Data Mappings

**From `mapNoticeOnlyFacts()` (normalize.ts:2240+):**

| Template Variable | Source Path(s) | Line |
|-------------------|----------------|------|
| `landlord_full_name` | `landlord_full_name`, `landlord.name` | 2267-2275 |
| `landlord_address` | Built from parts | 2285-2338 |
| `tenant_full_name` | `tenant_full_name`, `tenant1_name` | 2355-2362 |
| `property_address` | Built from parts | 2383-2421 |
| `service_date` | Via `resolveNoticeServiceDate()` | 2490-2494 |
| `earliest_possession_date` | Calculated from service + period | 2727-2732 |
| `grounds` | Via `buildGroundsArray()` | 2711 |
| `total_arrears` | `total_arrears`, `rent_arrears_amount` | 2654-2658 |

### C.4 Ground Text Generation

**From `SECTION8_GROUND_DEFINITIONS` (normalize.ts:1869-1953):**

```typescript
const SECTION8_GROUND_DEFINITIONS = {
  8: {
    code: 8,
    title: 'Serious rent arrears (at least 8 weeks or 2 months)',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
    full_text: 'At the date of the service of the notice and at the date of the hearing...',
  },
  // ... other grounds
};
```

**Grounds defined in code:**
| Ground | Defined? | Mandatory? |
|--------|----------|------------|
| 1 | ✅ Yes | Mandatory |
| 2 | ✅ Yes | Mandatory |
| 8 | ✅ Yes | Mandatory |
| 10 | ✅ Yes | Discretionary |
| 11 | ✅ Yes | Discretionary |
| 12 | ✅ Yes | Discretionary |
| 13 | ✅ Yes | Discretionary |
| 14 | ✅ Yes | Discretionary |
| 14A | ✅ Yes | Discretionary |
| 15 | ✅ Yes | Discretionary |
| 17 | ✅ Yes | Discretionary |

### C.5 PDF Generation

**Same Puppeteer flow as S21:**
```typescript
// From preview route (route.ts)
const html = handlebars.compile(template)(templateData);
const pdf = await puppeteer.launch().then(browser =>
  browser.newPage().then(page => {
    page.setContent(html);
    return page.pdf({ format: 'A4' });
  })
);
```

---

## D. Feature Completeness Audit

### Legal Requirements Matrix

| Legal Requirement | Implemented? | How? | Line Reference |
|-------------------|--------------|------|----------------|
| Form 3 or substantially similar | ✅ Yes | `notice.hbs` template | Template file |
| Tenant name | ✅ Yes | `tenant_full_name` | normalize.ts:2355 |
| Property address | ✅ Yes | `property_address` | normalize.ts:2416 |
| Ground(s) specified | ✅ Yes | `grounds[]` array | normalize.ts:2711 |
| Full statutory text per ground | ✅ Yes | `SECTION8_GROUND_DEFINITIONS` | normalize.ts:1869 |
| Particulars for each ground | ✅ Yes | `renderParticulars()` | normalize.ts:2023 |
| Correct notice period per ground | ⚠️ Partial | Defaults to 14 days | normalize.ts:2728 |
| Landlord name and address | ✅ Yes | `landlord_full_name`, `landlord_address` | normalize.ts:2267 |
| Date of notice | ✅ Yes | `service_date` | normalize.ts:2490 |
| 12-month validity statement | ✅ Yes | Hardcoded in template | notice.hbs:668 |

---

## E. Ground Coverage Audit

### Complete Ground Matrix

| Ground | Name | Type | Notice Period | MQS Option? | Code Defined? | Particulars? |
|--------|------|------|---------------|-------------|---------------|--------------|
| 1 | Owner-occupier | Mandatory | 2 months | ❌ No | ✅ Yes | ❌ No |
| 2 | Mortgagee | Mandatory | 2 months | ❌ No | ✅ Yes | ❌ No |
| 3 | Holiday let | Mandatory | 2 weeks | ❌ No | ❌ No | ❌ No |
| 4 | Educational let | Mandatory | 2 weeks | ❌ No | ❌ No | ❌ No |
| 5 | Minister of religion | Mandatory | 2 months | ❌ No | ❌ No | ❌ No |
| 6 | Demolition/reconstruction | Mandatory | 2 months | ❌ No | ❌ No | ❌ No |
| 7 | Death of tenant | Mandatory | 2 months | ❌ No | ❌ No | ❌ No |
| 7A | Tenant abandoned | Mandatory | 2 weeks | ❌ No | ❌ No | ❌ No |
| 7B | Tenant refused support | Mandatory | 2 weeks | ❌ No | ❌ No | ❌ No |
| **8** | **Serious rent arrears** | **Mandatory** | **2 weeks** | ✅ Yes | ✅ Yes | ✅ Yes |
| 9 | Suitable alternative | Discretionary | 2 months | ❌ No | ❌ No | ❌ No |
| **10** | **Some rent arrears** | **Discretionary** | **2 months** | ✅ Yes | ✅ Yes | ✅ Yes |
| **11** | **Persistent delay** | **Discretionary** | **2 months** | ✅ Yes | ✅ Yes | ✅ Yes |
| **12** | **Breach of obligation** | **Discretionary** | **2 weeks** | ✅ Yes | ✅ Yes | ✅ Yes |
| **13** | **Waste/neglect** | **Discretionary** | **2 weeks** | ✅ Yes | ✅ Yes | ✅ Yes |
| **14** | **Nuisance/ASB** | **Discretionary** | **Immediate*** | ✅ Yes | ✅ Yes | ✅ Yes |
| 14ZA | Riot conviction | Discretionary | 2 weeks | ❌ No | ❌ No | ❌ No |
| 14A | Domestic violence | Discretionary | Immediate* | ❌ No | ✅ Yes | ❌ No |
| 15 | Furniture deterioration | Discretionary | 2 weeks | ❌ No | ✅ Yes | ❌ No |
| 16 | Employee let ended | Discretionary | 2 months | ❌ No | ❌ No | ❌ No |
| **17** | **False statement** | **Discretionary** | **2 weeks** | ✅ Yes | ✅ Yes | ✅ Yes |

**Summary:**
- **MQS Options:** 7 grounds (8, 10, 11, 12, 13, 14, 17)
- **Code Definitions:** 11 grounds (1, 2, 8, 10, 11, 12, 13, 14, 14A, 15, 17)
- **Full Particulars Support:** 7 grounds (8, 10, 11, 12, 13, 14, 17)

---

## F. Ask Heaven Integration Audit

### F.1 Integration Status

**Location:** `src/lib/ai/ask-heaven.ts`

| Feature | Status | Details |
|---------|--------|---------|
| Ground particulars enhancement | ✅ Yes | Via `suggestion_prompt` in MQS |
| Free-text wording improvement | ✅ Yes | `enhanceAnswer()` function |
| Arrears schedule generation | ✅ Yes | `arrears_schedule_summary` field |
| Breach description help | ✅ Yes | Ground 12 particulars |
| ASB incident documentation | ✅ Yes | Ground 14 particulars |

### F.2 How It Works

**From `ask-heaven.ts:109-318`:**

1. User enters text in `textarea` field with `suggestion_prompt`
2. `enhanceAnswer()` called with question context
3. AI rewrites answer for court-friendly language
4. Returns: `suggested_wording`, `missing_information`, `evidence_suggestions`

**Jurisdiction-Aware Context (lines 336-344):**
```typescript
case 'england':
  return `
JURISDICTION-SPECIFIC CONTEXT (England):
- Section 8 (fault-based evictions) uses numbered grounds:
  Ground 8 (serious arrears, 2+ months) is mandatory if threshold met;
  Grounds 10/11 (lesser arrears, persistent late payment) are discretionary...
`;
```

### F.3 Fields with Ask Heaven Integration

| Field ID | Ground | Suggestion Prompt |
|----------|--------|-------------------|
| `arrears_schedule_summary` | 8, 10, 11 | Help write clear arrears summary |
| `ground_8_factual_summary` | 8 | Explain why Ground 8 applies |
| `ground_11_pattern_description` | 11 | Document late payment pattern |
| `ground_12_breach_details` | 12 | Describe tenancy breach |
| `ground_14_incident_details` | 14 | Document ASB incidents |
| `ground_17_false_statement` | 17 | Document false statement |

---

## G. Known Issues / Gaps

### G.1 CRITICAL Issues

| Issue | Impact | File:Line | Priority |
|-------|--------|-----------|----------|
| Notice period not ground-dependent | Invalid notices for Ground 10/11 (need 2 months, defaults to 14 days) | normalize.ts:2728 | 🔴 HIGH |
| Ground 10/11 require 2 months notice | Template may show wrong date | notice.hbs | 🔴 HIGH |

### G.2 Missing Grounds

| Ground | Impact | Priority |
|--------|--------|----------|
| 1, 2 | Landlord/mortgagee possession - uncommon | 🟡 MEDIUM |
| 3, 4, 5 | Holiday/educational/minister - rare | 🟢 LOW |
| 6 | Demolition/reconstruction - uncommon | 🟡 MEDIUM |
| 7, 7A, 7B | Death/abandonment - uncommon | 🟡 MEDIUM |
| 9 | Suitable alternative - rare | 🟢 LOW |
| 14ZA | Riot conviction - very rare | 🟢 LOW |
| 16 | Employee let - uncommon | 🟢 LOW |

### G.3 Validation Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Ground 10/11 notice period | Should enforce 2 months, not 2 weeks | 🔴 HIGH |
| Ground 14 immediate notice | No special handling for serious cases | 🟡 MEDIUM |
| Arrears at hearing date | Cannot verify at notice time | 🟢 LOW (inherent limitation) |

### G.4 Template Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Multiple signatories | Template has placeholder, not dynamic | 🟢 LOW |
| Agent acting capacity | Not clearly marked in signature | 🟢 LOW |

---

## H. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INPUT                                      │
│  Wizard UI → Question Answers → WizardFacts (stored in collected_facts)     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MQS QUESTION MAPPING                                 │
│  section8_grounds_selection → maps_to: section8_grounds                     │
│  ground_particulars.shared_arrears → maps_to: ground_particulars            │
│  ground_8.factual_summary → maps_to: ground_particulars.ground_8            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         mapNoticeOnlyFacts()                                 │
│  [normalize.ts:2240-2839]                                                   │
│                                                                              │
│  ┌─────────────────────┐    ┌──────────────────────┐                        │
│  │ Extract flat fields │ → │ Build nested objects │                        │
│  │ - landlord_*        │    │ - property {}        │                        │
│  │ - tenant_*          │    │ - tenant {}          │                        │
│  │ - property_*        │    │ - deposit {}         │                        │
│  └─────────────────────┘    └──────────────────────┘                        │
│                                     │                                        │
│                                     ▼                                        │
│                   ┌──────────────────────────────────┐                      │
│                   │       buildGroundsArray()        │                      │
│                   │   [normalize.ts:1958-2110]       │                      │
│                   │                                  │                      │
│                   │ 1. Parse selected grounds        │                      │
│                   │ 2. Lookup SECTION8_GROUND_DEFS   │                      │
│                   │ 3. Merge with ground_particulars │                      │
│                   │ 4. Return grounds[] array        │                      │
│                   └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TEMPLATE DATA                                        │
│  {                                                                           │
│    landlord_full_name: "John Smith",                                        │
│    landlord_address: "123 Main St\nLondon\nSW1A 1AA",                       │
│    tenant_full_name: "Jane Doe",                                            │
│    property_address: "456 Property Lane\nLondon\nE1 1AA",                   │
│    service_date: "2025-12-23",                                              │
│    earliest_possession_date: "2026-01-06",                                  │
│    grounds: [                                                               │
│      {                                                                       │
│        code: 8,                                                             │
│        title: "Serious rent arrears...",                                    │
│        mandatory: true,                                                     │
│        statutory_text: "At the date of service...",                         │
│        particulars: "<strong>Total amount owed:</strong> £3,000...",        │
│        type_label: "Mandatory"                                              │
│      }                                                                       │
│    ]                                                                         │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HANDLEBARS TEMPLATE                                  │
│  [config/.../form_3_section8/notice.hbs]                                    │
│                                                                              │
│  {{#each grounds}}                                                          │
│    <div class="ground-block">                                               │
│      <span class="ground-badge">Ground {{this.code}}</span>                │
│      <div class="ground-statutory-text">{{this.statutory_text}}</div>      │
│      <div class="ground-particulars-text">{{{this.particulars}}}</div>     │
│    </div>                                                                   │
│  {{/each}}                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PDF OUTPUT                                           │
│  Puppeteer renders HTML → PDF with Form 3 layout                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## I. Test Coverage

### Existing Tests

**File:** `tests/notice-only-section8-grounds.test.ts`

| Test | Status | Coverage |
|------|--------|----------|
| Maps grounds with statutory_text | ✅ Pass | Ground array structure |
| Derives arrears from shared_arrears | ✅ Pass | Fallback logic |
| Maps ground particulars | ✅ Pass | Per-ground data |
| Handles multiple grounds | ✅ Pass | Array ordering |
| Calculates Ground 8 threshold | ✅ Pass | Threshold display |
| Sets ground_descriptions | ✅ Pass | Checklist support |
| Handles unknown grounds | ✅ Pass | Graceful degradation |
| Includes mandatory metadata | ✅ Pass | Type labels |
| Normalizes internal IDs | ✅ Pass | No ground_8 leakage |

### Missing Test Coverage

| Test Needed | Priority |
|-------------|----------|
| Notice period varies by ground | 🔴 HIGH |
| Ground 10/11 require 2 months | 🔴 HIGH |
| Ground 14 immediate notice option | 🟡 MEDIUM |
| Validation blocking for missing grounds | 🟡 MEDIUM |
| End-to-end PDF generation | 🟡 MEDIUM |

---

## J. Recommendations

### Immediate Fixes (Priority 1)

1. **Ground-dependent notice periods**
   - File: `src/lib/case-facts/normalize.ts`
   - Change: Add lookup table for notice periods per ground
   - Impact: Prevents invalid notices

```typescript
const GROUND_NOTICE_PERIODS: Record<number | string, number> = {
  1: 60, 2: 60, // 2 months (mandatory owner/mortgagee)
  3: 14, 4: 14, // 2 weeks (holiday/educational)
  5: 60, 6: 60, 7: 60, // 2 months
  '7A': 14, '7B': 14, // 2 weeks (abandonment)
  8: 14, // 2 weeks (serious arrears)
  9: 60, // 2 months (suitable alternative)
  10: 60, 11: 60, // 2 MONTHS NOT 2 WEEKS!
  12: 14, 13: 14, 14: 0, // 2 weeks (14 can be immediate)
  '14ZA': 14, '14A': 0, // 2 weeks / immediate
  15: 14, 16: 60, 17: 14, // various
};
```

2. **Add validation for Ground 10/11 notice period**
   - File: `src/lib/notices/evaluate-notice-compliance.ts`
   - Add check: If Ground 10 or 11 selected, notice period must be ≥ 60 days

### Short-term Improvements (Priority 2)

3. **Add missing common grounds to MQS**
   - Ground 1 (landlord occupation)
   - Ground 2 (mortgagee)
   - Ground 6 (demolition/reconstruction)

4. **Enhance Ground 14 handling**
   - Option for immediate notice in serious cases
   - Special particulars collection for ASB

### Long-term Improvements (Priority 3)

5. **Add remaining grounds**
   - Grounds 3, 4, 5, 7, 7A, 7B, 9, 14ZA, 14A, 15, 16

6. **Smart validation UX**
   - Inline warnings during wizard completion
   - Real-time threshold calculations
   - Ground compatibility checks

---

## Appendix: File References

| File | Purpose | Key Lines |
|------|---------|-----------|
| `config/mqs/notice_only/england.yaml` | Question configuration | 220-900 |
| `src/lib/case-facts/normalize.ts` | Data mapping | 1869-2839 |
| `src/lib/notices/notice-compliance-spec.ts` | Validation rules | 1-108 |
| `src/lib/notices/evaluate-notice-compliance.ts` | Validation logic | Full file |
| `src/lib/ai/ask-heaven.ts` | AI integration | 109-384 |
| `config/.../form_3_section8/notice.hbs` | Template | Full file |
| `tests/notice-only-section8-grounds.test.ts` | Test coverage | Full file |

---

## Implementation Status

### ✅ Completed (2024-12-23)

1. **Ground-dependent notice periods** - FIXED
   - Added `GROUND_NOTICE_PERIODS` lookup table to `normalize.ts`
   - Added `calculateRequiredNoticePeriod()` function
   - Grounds 10 & 11 now correctly require 60 days
   - Maximum notice period used when multiple grounds selected

2. **Notice date calculator update** - FIXED
   - Added `SECTION8_GROUND_NOTICE_PERIODS` to `notice-date-calculator.ts`
   - Updated `calculateSection8NoticePeriod()` with ground-dependent logic
   - Proper handling of Ground 14 severity (immediate vs 14 days)

3. **MQS notice_strategy labels** - FIXED
   - Updated labels to reflect ground-dependent periods
   - Added helperText explaining Grounds 10 & 11 require 2 months

4. **Validation tests** - ADDED
   - 7 new tests for ground-dependent notice period calculation
   - All 19 tests pass

### 🔲 Remaining Work

- Add remaining grounds (3, 4, 5, 7, 7A, 7B, 9, 14ZA, 14A, 15, 16) to MQS UI
- Smart validation UX with inline warnings
- Real-time threshold calculations

---

*Audit completed. Fixes implemented on 2024-12-23.*
