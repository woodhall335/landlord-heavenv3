---
name: Validation - Safe Change
about: Low-risk validation changes (typos, comments, formatting)
title: '[validation:safe] '
labels: 'validation, safe-change'
---

## Classification: Safe

This is a **safe change** that does not affect validation behavior.

## Change Summary

<!-- Brief description of what this PR changes -->

## Affected Files

- [ ] YAML rules (`config/legal-requirements/`)
- [ ] Message catalog (`config/validation/phase13-messages.yaml`)
- [ ] Engine code (`src/lib/validation/`)
- [ ] Documentation (`docs/validation/`)
- [ ] Tests (`tests/validation/`)

## Change Type

- [ ] Typo fix
- [ ] Comment update
- [ ] Documentation improvement
- [ ] Code formatting/refactoring (no logic changes)
- [ ] Other: _________

## Checklist

### Required for Safe Changes

- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run validation:lint-rules`)
- [ ] No behavioral changes (same inputs produce same outputs)

### Reviewer Checklist

- [ ] Change is correctly classified as "Safe"
- [ ] No hidden behavioral changes
- [ ] Code follows existing patterns
