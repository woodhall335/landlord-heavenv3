# Validation Rule Authoring Guide

Phase 18: Rule Authoring, Explainability & Platform Expansion

This guide covers how to create, test, and maintain YAML validation rules for the eviction validation engine.

## Table of Contents

1. [Rule File Structure](#rule-file-structure)
2. [Writing Rules](#writing-rules)
3. [Condition Syntax](#condition-syntax)
4. [Allowed Identifiers](#allowed-identifiers)
5. [Feature Flags](#feature-flags)
6. [Testing Rules](#testing-rules)
7. [Linting & CI](#linting--ci)
8. [Message Coverage](#message-coverage)
9. [Performance Considerations](#performance-considerations)
10. [Explainability Mode](#explainability-mode)

---

## Rule File Structure

Rules are defined in YAML files located in `config/legal-requirements/{jurisdiction}/`:

```
config/legal-requirements/
├── england/
│   ├── notice_only_rules.yaml
│   └── complete_pack_rules.yaml
├── wales/
│   └── notice_only_rules.yaml
└── scotland/
    └── notice_only_rules.yaml
```

### Top-Level Schema

```yaml
version: "1.2"
jurisdiction: england  # england | wales | scotland
product: notice_only   # notice_only | complete_pack
last_updated: "2026-01-26"

metadata:
  effective_from: "2024-01-01"
  source:
    - "Housing Act 1988"
    - "Deregulation Act 2015"
  notes: "Phase 13 correctness improvements"

routes:
  - section_21
  - section_8

# Route-specific rule lists
common_rules: []
section_21_rules: []
section_8_rules: []
section_173_rules: []
fault_based_rules: []
notice_to_leave_rules: []

# Optional summary configuration
summary:
  blocker_prevents_generation: true
  warning_shown_in_review: true
  suggestion_shown_as_tips: true
  group_by_section: true
  sections:
    - id: deposit
      label: Deposit Protection
      rules:
        - s21_deposit_not_protected
        - s21_prescribed_info_not_served
```

---

## Writing Rules

### Basic Rule Structure

```yaml
- id: s21_deposit_not_protected
  severity: blocker  # blocker | warning | suggestion
  applies_to:
    - section_21
  applies_when:
    - condition: "facts.deposit_taken === true && !facts.deposit_protected"
  message: "Deposit is taken but not protected in a government-approved scheme."
  rationale: "Under the Housing Act 2004, Section 21 notices cannot be served if the deposit is not protected."
  field: deposit_protected  # Optional: field causing the issue
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (use prefix: `s21_`, `s8_`, `s173_`, `ntl_`) |
| `severity` | string | `blocker`, `warning`, or `suggestion` |
| `applies_to` | array | Routes where rule applies (`section_21`, `section_8`, etc. or `all`) |
| `applies_when` | array | Conditions that trigger the rule (OR logic) |
| `message` | string | User-facing message when rule fires |
| `rationale` | string | Legal/technical explanation for the rule |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Form field associated with the issue |
| `requires_feature` | string | Feature flag required for rule to be evaluated |

### Severity Levels

- **blocker**: Prevents document generation. Use for legally invalid notices.
- **warning**: Shown in review step. Use for potential issues that may cause problems.
- **suggestion**: Shown as tips. Use for best practices and recommendations.

---

## Condition Syntax

Conditions are JavaScript expressions evaluated against the context. They support:

### Available Context Objects

1. **`facts`**: User-provided form data
2. **`computed`**: Engine-calculated derived values
3. **`route`**: Current eviction route string

### Basic Comparisons

```yaml
# Equality
- condition: "facts.deposit_taken === true"
- condition: "facts.deposit_amount !== null"

# Negation
- condition: "!facts.deposit_protected"

# Numeric comparisons
- condition: "facts.deposit_amount > 5000"
- condition: "computed.arrears_months >= 3"
```

### Logical Operators

```yaml
# AND
- condition: "facts.deposit_taken === true && !facts.deposit_protected"

# OR (use multiple conditions instead for clarity)
- condition: "facts.ground14_severity === 'serious' || facts.ground14_severity === 'severe'"

# Nested logic
- condition: "(facts.has_gas_appliances === true) && (!facts.gas_certificate_provided)"
```

### Array Operations

```yaml
# Check if array includes value
- condition: "facts.section8_grounds && facts.section8_grounds.includes('ground_8')"

# Array length
- condition: "facts.arrears_items && facts.arrears_items.length > 0"

# Some/every (use sparingly)
- condition: "facts.section8_grounds && facts.section8_grounds.some(g => g.includes('mandatory'))"
```

### Computed Values

The engine provides pre-computed values for complex calculations:

```yaml
# Date-based computations
- condition: "computed.within_four_month_bar === true"
- condition: "computed.notice_period_too_short === true"
- condition: "computed.expiry_before_service === true"

# Deposit calculations
- condition: "computed.deposit_exceeds_cap === true"

# Ground checks
- condition: "computed.has_ground_8 === true"
- condition: "computed.ground_8_eligible === false"
```

### Available Computed Values

| Value | Type | Description |
|-------|------|-------------|
| `within_four_month_bar` | boolean | Service date within 4 months of tenancy start |
| `within_six_month_bar` | boolean | Service date within 6 months of contract start |
| `notice_period_too_short` | boolean | S21 notice period < 2 months |
| `s173_notice_period_too_short` | boolean | Wales S173 notice period < 6 months |
| `ntl_notice_period_too_short` | boolean | Scotland NTL notice period < 28 days |
| `deposit_exceeds_cap` | boolean | Deposit > legal cap (5/6 weeks rent) |
| `expiry_before_service` | boolean | Expiry date is before service date |
| `has_ground_8` | boolean | S8 Ground 8 (rent arrears) selected |
| `has_ground_14` | boolean | S8 Ground 14 (ASB) selected |
| `ground_8_eligible` | boolean | Arrears meet Ground 8 threshold |
| `arrears_months` | number | Calculated months of arrears |

---

## Allowed Identifiers

All identifiers in conditions must be on the allowlist. Run the linter to check.

### Facts Identifiers (Partial List)

```
landlord_name, tenant_name, property_address_line1, property_address_postcode,
tenancy_start_date, notice_service_date, notice_expiry_date,
deposit_taken, deposit_protected, deposit_amount, prescribed_info_given,
gas_safety_cert_provided, epc_provided, how_to_rent_provided,
section8_grounds, section8_grounds_selection, ground_particulars,
scotland_ground_codes, landlord_registration_number,
pre_action_letter_sent, pre_action_signposting
```

### Adding New Identifiers

1. Add to `src/lib/validation/eviction-rules-allowlist.ts`
2. Add corresponding type to `EvictionFacts` interface in the engine
3. Run `npm run validation:lint-rules` to verify

---

## Feature Flags

Rules can be gated behind feature flags for phased rollout:

```yaml
- id: s21_new_compliance_check
  severity: blocker
  requires_feature: phase13  # Only evaluated when Phase 13 is enabled
  applies_to:
    - section_21
  applies_when:
    - condition: "facts.new_compliance_field === false"
  message: "New compliance requirement not met."
  rationale: "Phase 13 correctness improvement."
```

### Valid Feature Flags

| Flag | Description |
|------|-------------|
| `phase13` | Phase 13 correctness improvements |
| `smart` | Smart validation features |
| `enhanced_messages` | Enhanced UX messages |
| `shadow_mode` | Shadow mode comparison |
| `strict_mode` | Strict validation mode |
| `debug_mode` | Debug/development features |

---

## Testing Rules

### Unit Tests

Create tests in `tests/validation/` using Vitest:

```typescript
import { evaluateEvictionRules } from '../../src/lib/validation/eviction-rules-engine';

describe('S21 Deposit Rules', () => {
  it('should block when deposit not protected', () => {
    const result = evaluateEvictionRules(
      {
        landlord_name: 'Test Landlord',
        tenant_name: 'Test Tenant',
        property_address_line1: '123 Test St',
        property_address_postcode: 'TE1 1ST',
        deposit_taken: true,
        deposit_protected: false,
      },
      'england',
      'notice_only',
      'section_21'
    );

    expect(result.blockers.some(b => b.id === 's21_deposit_not_protected')).toBe(true);
  });
});
```

### Explainability Mode for Debugging

Use explainability mode to understand why rules fire:

```typescript
import { evaluateEvictionRulesExplained, getValidationSummary } from '../../src/lib/validation/eviction-rules-engine';

const result = evaluateEvictionRulesExplained(facts, 'england', 'notice_only', 'section_21');

// Print summary
console.log(getValidationSummary(result));

// Check specific rule
const explanation = result.explanations.find(e => e.ruleId === 's21_deposit_not_protected');
console.log(explanation);
// {
//   ruleId: 's21_deposit_not_protected',
//   evaluated: true,
//   fired: true,
//   firingCondition: 'facts.deposit_taken === true && !facts.deposit_protected',
//   conditions: [
//     { condition: '...', result: true, explanation: 'Deposit taken is true AND Deposit protected is not set' }
//   ]
// }
```

---

## Linting & CI

### Run the Linter

```bash
npm run validation:lint-rules
```

The linter checks:
- YAML schema and required fields
- Phase 17 safeguards (max rules, max conditions per rule)
- Valid feature flag values
- Phase 16 message coverage (Phase 13 rules must have UX messages)
- Condition allowlist validation

### CI Integration

The linter runs automatically in CI:

```bash
npm run ci  # Includes validation:lint-rules
```

### Safeguard Limits

| Safeguard | Default | Description |
|-----------|---------|-------------|
| `maxRulesPerFile` | 500 | Maximum rules in a single YAML file |
| `maxConditionsPerRule` | 20 | Maximum conditions per rule |
| `maxMessageLength` | 500 | Recommended max message length |
| `maxRationaleLength` | 1000 | Recommended max rationale length |

---

## Message Coverage

Phase 13 rules require enhanced UX messaging in `config/validation/phase13-messages.yaml`:

```yaml
england_s21:
  s21_deposit_cap_exceeded:
    title: "Deposit Exceeds Legal Cap"
    description: >
      The deposit amount exceeds the legal maximum under the Tenant Fees Act 2019...
    howToFix:
      - "Calculate the legal deposit cap based on the annual rent"
      - "Return the excess amount to the tenant"
    legalRef: "Tenant Fees Act 2019, Section 3"
    helpLink: "/help/validation/deposit-cap"
    supportTags: ["deposit", "tenant-fees-act", "s21", "england"]
```

### Required Message Fields

| Field | Description |
|-------|-------------|
| `title` | Short, actionable title |
| `description` | Full explanation of the issue |
| `howToFix` | Array of step-by-step resolution steps |
| `legalRef` | Legal citation |
| `helpLink` | Relative URL to help documentation |
| `supportTags` | Array of tags for support filtering |

---

## Performance Considerations

### Condition Caching

Conditions are compiled and cached. Write identical conditions for cache hits:

```yaml
# Good: identical conditions share cache entry
- condition: "facts.deposit_taken === true"
- condition: "facts.deposit_taken === true"  # Cache hit

# Bad: slightly different whitespace creates new cache entry
- condition: "facts.deposit_taken===true"  # Cache miss
```

### Early Exit

Rules use OR logic for conditions. Put most likely true conditions first:

```yaml
# Good: common case first
applies_when:
  - condition: "!facts.deposit_protected"  # Most common
  - condition: "facts.deposit_scheme_name === null"

# Less efficient: rare case first
applies_when:
  - condition: "facts.deposit_scheme_name === null"  # Rare
  - condition: "!facts.deposit_protected"
```

### Avoid Complex Expressions

Keep conditions simple. Use computed values for complex calculations:

```yaml
# Good: use computed value
- condition: "computed.deposit_exceeds_cap === true"

# Bad: complex inline calculation
- condition: "facts.deposit_amount > (facts.rent_amount * 52 / 12 * 5)"
```

---

## Explainability Mode

Phase 18 adds explainability mode for debugging and support:

### API

```typescript
import {
  evaluateEvictionRulesExplained,
  getValidationSummary,
  explainRule,
} from '../../src/lib/validation/eviction-rules-engine';

// Get full explainable result
const result = evaluateEvictionRulesExplained(facts, jurisdiction, product, route);

// Print human-readable summary
console.log(getValidationSummary(result));

// Get explanation for specific rule
const ruleExplanation = explainRule(result, 's21_deposit_not_protected');
```

### ExplainableResult Structure

```typescript
interface ExplainableResult extends ValidationEngineResult {
  explanations: RuleExplanation[];  // All rules with evaluation details
  computedContext: Record<string, unknown>;  // Computed values used
  timing: {
    totalMs: number;
    rulesEvaluated: number;
    conditionsEvaluated: number;
  };
}

interface RuleExplanation {
  ruleId: string;
  severity: RuleSeverity;
  message: string;
  evaluated: boolean;  // Was rule evaluated?
  skipReason?: 'feature_flag_disabled' | 'route_mismatch' | 'condition_count_exceeded';
  fired: boolean;  // Did rule trigger an issue?
  conditions: ConditionExplanation[];  // Per-condition results
  firingCondition?: string;  // The condition that caused firing
}
```

---

## Checklist for New Rules

1. [ ] Rule ID follows naming convention (`s21_`, `s8_`, `s173_`, `ntl_`)
2. [ ] Severity appropriate for legal impact
3. [ ] `applies_to` lists correct routes
4. [ ] Conditions use only allowed identifiers
5. [ ] Message is clear and actionable
6. [ ] Rationale includes legal reference
7. [ ] `field` set if applicable
8. [ ] Feature flag added if needed
9. [ ] Unit tests written
10. [ ] Message coverage added (Phase 13 rules)
11. [ ] Linter passes: `npm run validation:lint-rules`
