---
name: Validation - Behavioral Change
about: Changes that modify validation behavior (new suggestions/warnings, message improvements)
title: '[validation:behavioral] '
labels: 'validation, behavioral-change'
---

## Classification: Behavioral

This PR modifies validation behavior but does not affect legal enforcement.

## Change Summary

<!-- Describe what this PR changes and why -->

## Affected Rules

<!-- List all affected rule IDs -->

| Rule ID | Change Type | Current Severity | New Severity |
|---------|-------------|------------------|--------------|
| `rule_id_here` | new/modified/removed | N/A | suggestion |

## Change Type

- [ ] New suggestion-level rule
- [ ] New warning-level rule
- [ ] Severity change (warning ↔ suggestion)
- [ ] Field mapping change
- [ ] Condition optimization (same logic, different expression)
- [ ] Message wording improvement
- [ ] Other: _________

## Impact Assessment

<!-- Describe expected impact -->

**Expected change in validation results:**
- New warnings/suggestions triggered: ~X per day
- User flow impact: None / Minor / Moderate

## Test Evidence

### Golden Tests

- [ ] Golden test cases added for new behavior
- [ ] Existing tests updated (if modifying behavior)

### Explainability Output

<!-- Paste output from evaluateEvictionRulesExplained for affected rules -->

```
// Run: npm run validation:explain -- --rule <rule_id>
```

### CI Checks

- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run validation:lint-rules`)

## Rollout Plan

- [ ] **Staging**: Test for 24 hours minimum
- [ ] **Production**: Direct deployment (non-blocking change)

## Checklist

### Required for Behavioral Changes

- [ ] Engineering review obtained
- [ ] Product review obtained
- [ ] Golden test coverage for new behavior
- [ ] Explainability output reviewed
- [ ] All tests pass
- [ ] Lint passes

### Reviewer Checklist

**Engineering Reviewer:**
- [ ] Code follows existing patterns
- [ ] No security vulnerabilities
- [ ] Performance impact acceptable
- [ ] Tests are comprehensive

**Product Reviewer:**
- [ ] Message is clear and actionable
- [ ] UX impact is acceptable
- [ ] Support team prepared (if needed)
