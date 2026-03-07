---
name: Validation - Legal-Critical Change
about: Changes affecting legal enforcement or statutory compliance (new blockers, severity changes)
title: '[validation:legal-critical] '
labels: 'validation, legal-critical, requires-legal-review'
---

## Classification: Legal-Critical

**This PR affects legal enforcement or statutory compliance. Legal review is REQUIRED.**

## Change Summary

<!-- Describe what this PR changes and the legal reasoning -->

## Legal Basis

**Legislation/Regulation:**
<!-- e.g., Housing Act 1988, Section 21(4B) -->

**Effective Date:**
<!-- When did/does this requirement take effect? -->

**Source Documentation:**
<!-- Link to legislation, guidance, or legal memo -->

## Affected Rules

| Rule ID | Change Type | Current Severity | New Severity | Jurisdiction |
|---------|-------------|------------------|--------------|--------------|
| `rule_id` | new/modified | N/A | blocker | england |

## Change Type

- [ ] New blocker rule
- [ ] Severity upgrade (warning/suggestion → blocker)
- [ ] Severity downgrade (blocker → warning/suggestion)
- [ ] Rule condition change
- [ ] Legal reference update
- [ ] Feature flag change for correctness phase
- [ ] Other: _________

## Impact Assessment

**Expected impact on validation results:**

| Metric | Current | Expected After |
|--------|---------|----------------|
| Blocker rate | X% | Y% |
| Affected users/day | ~N | ~M |

**Jurisdictions affected:**
- [ ] England
- [ ] Wales
- [ ] Scotland

**Products affected:**
- [ ] notice_only
- [ ] complete_pack

## Test Evidence

### Golden Tests (Minimum 3 per rule)

<!-- List the test cases -->

1. **Positive case**: [description] - Rule should fire
2. **Negative case**: [description] - Rule should not fire
3. **Edge case**: [description] - Boundary condition

### Explainability Output

<!-- Paste explainability output for ALL affected rules -->

```typescript
// For each affected rule, run:
// evaluateEvictionRulesExplained(facts, jurisdiction, product, route)
```

### CI Checks

- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run validation:lint-rules`)
- [ ] Golden tests added (minimum 3 per rule)

## Rollout Plan

- [ ] **Staging**: 24 hours minimum validation
- [ ] **Production rollout**:
  - [ ] Feature-flagged at 10% (1 week)
  - [ ] Feature-flagged at 50% (1 week)
  - [ ] Full enablement (100%)

## Checklist

### Required for Legal-Critical Changes

- [ ] Engineering review obtained
- [ ] **Legal review obtained** (jurisdiction-specific owner)
- [ ] Product sign-off obtained
- [ ] Golden test coverage (minimum 3 cases per rule)
- [ ] Explainability output for all affected rules
- [ ] Impact assessment completed
- [ ] All tests pass
- [ ] Lint passes
- [ ] Staging validation (24 hours minimum)

### Reviewer Checklist

**Engineering Reviewer:**
- [ ] Code follows existing patterns
- [ ] No security vulnerabilities
- [ ] Performance impact acceptable
- [ ] Tests are comprehensive

**Legal Reviewer:**
- [ ] Legal reference is accurate and current
- [ ] Rule logic matches statutory requirements
- [ ] Severity is appropriate for legal consequence
- [ ] No unintended legal implications

**Product Reviewer:**
- [ ] Message is clear and actionable
- [ ] UX impact is acceptable
- [ ] Support team is prepared
- [ ] Rollout plan is appropriate

## Sign-Off

**Legal Approval:**
- Reviewer: @_________
- Date: _________
- Comments: _________

**Product Approval:**
- Reviewer: @_________
- Date: _________
- Comments: _________
