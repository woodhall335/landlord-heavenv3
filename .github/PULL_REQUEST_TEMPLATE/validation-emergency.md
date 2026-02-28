---
name: Validation - Emergency Fix
about: Critical fixes required immediately to prevent harm
title: '[validation:emergency] '
labels: 'validation, emergency, urgent'
---

## Classification: Emergency

**This is an emergency fix requiring immediate deployment.**

## Incident Summary

**Incident ID/Ticket:** _________

**Severity:** Critical / High

**Discovered at:** YYYY-MM-DD HH:MM UTC

**Reported by:** @_________

## Problem Description

<!-- Describe the issue and its impact -->

**Symptoms:**
-

**User Impact:**
- Affected users: ~N
- Impact type: False positives / False negatives / System error / Other

**Root Cause:**
<!-- Brief description of what went wrong -->

## Fix Description

<!-- What does this PR change to fix the issue? -->

## Affected Rules

| Rule ID | Change | Reason |
|---------|--------|--------|
| `rule_id` | suppressed/modified | Brief reason |

## Emergency Approvals

**Required: 2 engineering approvals**

- [ ] Engineer 1: @_________ (approved at HH:MM UTC)
- [ ] Engineer 2: @_________ (approved at HH:MM UTC)

## Notifications Sent

- [ ] Engineering on-call
- [ ] Product owner
- [ ] Legal team (if blocker rule affected)
- [ ] Support team

## Checklist

### Required for Emergency Fixes

- [ ] Two engineering approvals obtained
- [ ] Basic tests pass (or acknowledged as skip with reason)
- [ ] Fix is minimal and targeted
- [ ] Rollback plan documented

### Post-Merge Requirements

- [ ] Post-incident review scheduled (within 48 hours)
- [ ] Follow-up PR for proper test coverage
- [ ] Incident documentation updated

## Rollback Plan

<!-- How to rollback if the fix causes new issues -->

```bash
# Environment variable rollback
export VALIDATION_SUPPRESS_RULES=rule_id_1,rule_id_2

# Or git rollback
git revert <this-commit-sha>
```

## Post-Incident Follow-Up

**Follow-up PR:** #_________ (to be created)

**Post-incident review:** Scheduled for YYYY-MM-DD

**Action items:**
1.
2.
3.
