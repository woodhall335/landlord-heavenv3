# Validation Platform Governance

Phase 19: Governance, Ownership & Change Management

This document establishes formal governance, ownership, and change controls for the validation rules platform to ensure long-term safety, consistency, and compliance.

---

## Table of Contents

1. [Ownership Model](#ownership-model)
2. [Change Classification](#change-classification)
3. [Review Requirements](#review-requirements)
4. [PR Process](#pr-process)
5. [Audit & Traceability](#audit--traceability)
6. [Emergency Procedures](#emergency-procedures)
7. [Compliance Checklist](#compliance-checklist)

---

## Ownership Model

### Primary Owners

| Component | Owner | Backup | Escalation |
|-----------|-------|--------|------------|
| **Engine Code** | Engineering Lead | Senior Engineer | CTO |
| **England Rules** | Legal Team (England) | Product Lead | Legal Director |
| **Wales Rules** | Legal Team (Wales) | Product Lead | Legal Director |
| **Scotland Rules** | Legal Team (Scotland) | Product Lead | Legal Director |
| **Message Catalog** | Product/UX Team | Content Lead | Product Director |
| **Tenant Overrides** | Enterprise Account Manager | Engineering Lead | CTO |
| **Feature Flags** | Engineering Lead | Product Lead | CTO |

### Responsibility Matrix (RACI)

| Activity | Engineering | Legal | Product | Support |
|----------|-------------|-------|---------|---------|
| Add new rule | C | A/R | C | I |
| Modify rule logic | R | A | C | I |
| Change severity | C | A | R | I |
| Update message | R | C | A | I |
| Tenant override | R | C | A | I |
| Emergency suppression | R | C | A | I |
| Feature flag change | A/R | I | C | I |

**Legend**: R = Responsible, A = Accountable, C = Consulted, I = Informed

### Contact Information

```yaml
# .github/CODEOWNERS (validation section)
/config/legal-requirements/england/ @legal-team-england @engineering-lead
/config/legal-requirements/wales/ @legal-team-wales @engineering-lead
/config/legal-requirements/scotland/ @legal-team-scotland @engineering-lead
/config/validation/phase13-messages.yaml @product-team @content-lead
/src/lib/validation/ @engineering-lead @senior-engineer
/scripts/validation-*.ts @engineering-lead
```

---

## Change Classification

All validation changes must be classified before submission.

### Class 1: Safe Changes

Low-risk changes that don't affect validation behavior.

**Examples**:
- Typo fixes in messages or rationale
- Comment updates
- Documentation improvements
- Code formatting/refactoring (no logic changes)

**Requirements**:
- [ ] Standard code review (1 engineer)
- [ ] All tests pass
- [ ] Lint passes

**Turnaround**: Same day

---

### Class 2: Behavioral Changes

Changes that modify validation behavior but don't affect legal enforcement.

**Examples**:
- New suggestion-level rules
- Warning severity changes (warning ↔ suggestion)
- Field mapping changes
- Condition optimizations (same logic, different expression)
- Message wording improvements

**Requirements**:
- [ ] Engineering review (1 engineer)
- [ ] Product review (1 product member)
- [ ] Golden test coverage for new behavior
- [ ] Explainability output reviewed
- [ ] All tests pass
- [ ] Lint passes

**Turnaround**: 1-2 business days

---

### Class 3: Legal-Critical Changes

Changes that affect legal enforcement or statutory compliance.

**Examples**:
- New blocker rules
- Severity changes involving blockers (warning → blocker or blocker → warning)
- Rule condition changes
- Legal reference updates
- Jurisdiction-specific rule additions
- Feature flag changes for correctness phases

**Requirements**:
- [ ] Engineering review (1 engineer)
- [ ] Legal review (jurisdiction-specific legal owner)
- [ ] Product sign-off
- [ ] Golden test coverage (minimum 3 cases per rule)
- [ ] Explainability output for all affected rules
- [ ] Impact assessment (expected change in blocker rate)
- [ ] All tests pass
- [ ] Lint passes
- [ ] Staging validation (24 hours minimum)

**Turnaround**: 3-5 business days (expedited: 1-2 days with legal approval)

---

### Class 4: Emergency Changes

Critical fixes required immediately to prevent harm.

**Examples**:
- Rule causing false positives blocking valid notices
- Security vulnerability in condition evaluation
- Production outage related to validation

**Requirements**:
- [ ] Engineering approval (any 2 engineers)
- [ ] Documented reason and impact
- [ ] Post-incident review within 48 hours
- [ ] Follow-up PR to add proper test coverage

**Turnaround**: Immediate (with retrospective review)

---

## Review Requirements

### Required Reviewers by Change Type

| Change Type | Engineering | Legal | Product | Min Approvals |
|-------------|-------------|-------|---------|---------------|
| Engine code | Required | - | - | 2 |
| New rule (suggestion) | Required | - | Required | 2 |
| New rule (warning) | Required | Consulted | Required | 2 |
| New rule (blocker) | Required | Required | Required | 3 |
| Severity upgrade (→blocker) | Required | Required | Required | 3 |
| Severity downgrade (blocker→) | Required | Required | Required | 3 |
| Message/rationale | Required | Consulted | Required | 2 |
| Tenant override | Required | Consulted | Required | 2 |
| Feature flag | Required | Informed | Required | 2 |
| Emergency fix | Required x2 | Informed | Informed | 2 |

### Review Checklist for Reviewers

**Engineering Reviewer**:
- [ ] Code follows existing patterns
- [ ] No security vulnerabilities (condition injection, etc.)
- [ ] Performance impact acceptable
- [ ] Tests are comprehensive and passing
- [ ] Lint rules pass

**Legal Reviewer**:
- [ ] Legal reference is accurate and current
- [ ] Rule logic matches statutory requirements
- [ ] Severity is appropriate for legal consequence
- [ ] No unintended legal implications

**Product Reviewer**:
- [ ] Message is clear and actionable for users
- [ ] UX impact is acceptable
- [ ] Support team is prepared (if needed)
- [ ] Rollout plan is appropriate

---

## PR Process

### PR Title Format

```
[validation:{class}] {type}: {description}

Examples:
[validation:safe] fix: typo in s21_deposit_not_protected message
[validation:behavioral] feat: add s21_tenant_notification_reminder suggestion
[validation:legal-critical] feat: add s21_abolition_2025 blocker for Renters Reform Act
[validation:emergency] fix: disable broken s21_four_month_bar condition
```

### PR Body Requirements

All validation PRs must include:

1. **Change Classification**
   ```
   ## Classification: [Safe | Behavioral | Legal-Critical | Emergency]
   ```

2. **Affected Rules** (if applicable)
   ```
   ## Affected Rules
   - s21_deposit_cap_exceeded (modified condition)
   - s21_deposit_not_protected (message update)
   ```

3. **Legal Basis** (for Legal-Critical changes)
   ```
   ## Legal Basis
   Tenant Fees Act 2019, Section 3
   Effective: June 1, 2019
   ```

4. **Test Evidence**
   ```
   ## Test Evidence
   - [ ] Golden tests added/updated
   - [ ] Explainability output reviewed
   - [ ] Lint passes

   Explainability output for affected rules:
   [paste output from evaluateEvictionRulesExplained]
   ```

5. **Rollout Plan** (for Behavioral/Legal-Critical)
   ```
   ## Rollout Plan
   - [ ] Staging: 24 hours
   - [ ] Production: Feature-flagged at 10% → 50% → 100%
   ```

### PR Templates

PR templates are located in `.github/PULL_REQUEST_TEMPLATE/`:

- `validation-safe.md` - Safe changes
- `validation-behavioral.md` - Behavioral changes
- `validation-legal-critical.md` - Legal-critical changes
- `validation-emergency.md` - Emergency changes
- `validation-tenant-override.md` - Tenant override changes

---

## Audit & Traceability

### Rule Change Log

Every rule must have traceable history:

```yaml
# Example rule with audit metadata
- id: s21_deposit_cap_exceeded
  severity: blocker
  # ... rule definition ...

  # Audit metadata (in comments or separate tracking)
  # Created: 2024-01-15 by @legal-team (PR #123)
  # Modified: 2024-06-01 - Updated threshold (PR #456)
  # Legal basis: Tenant Fees Act 2019, Section 3
  # Last legal review: 2024-01-15 by @legal-reviewer
```

### Audit Log Format

All significant changes are logged:

```json
{
  "timestamp": "2026-01-26T12:00:00Z",
  "changeType": "rule_modification",
  "classification": "legal-critical",
  "ruleId": "s21_deposit_cap_exceeded",
  "actor": "engineer@company.com",
  "reviewers": ["legal@company.com", "product@company.com"],
  "prNumber": 123,
  "legalBasis": "Tenant Fees Act 2019, Section 3",
  "summary": "Updated deposit cap calculation for annual rent threshold",
  "impactAssessment": {
    "expectedBlockerRateChange": "+0.5%",
    "affectedJurisdictions": ["england"],
    "affectedProducts": ["notice_only", "complete_pack"]
  }
}
```

### Tenant Override Audit

All tenant overrides are audited automatically (see Phase 18):

```typescript
import { getOverrideAuditLog } from '@/lib/validation/rule-targeting';

// Audit log includes:
// - timestamp
// - tenantId
// - ruleId
// - action (suppress/downgrade/upgrade/modify)
// - reason
// - approvedBy
// - jurisdiction/product/route context
```

### Compliance Reports

Generate compliance reports:

```bash
# Generate rule change report for time period
npm run validation:audit-report --from 2026-01-01 --to 2026-01-31

# Generate tenant override report
npm run validation:override-report --tenant acme-corp
```

---

## Emergency Procedures

### Break Glass: Emergency Rule Suppression

When a rule must be immediately disabled to prevent harm:

#### Step 1: Identify and Assess

- Confirm the issue (false positives, incorrect logic, etc.)
- Assess impact (how many users affected, severity of harm)
- Document the symptoms

#### Step 2: Execute Suppression

**Option A: Environment Variable (fastest)**

```bash
# Disable specific rule via environment
export VALIDATION_SUPPRESS_RULES=s21_problematic_rule,s21_another_rule
```

**Option B: Feature Flag Rollback**

```bash
# Disable entire correctness phase
unset VALIDATION_PHASE13_ENABLED
export VALIDATION_PHASE13_ROLLOUT_PERCENT=0
```

**Option C: Code Change (if above not sufficient)**

```typescript
// In emergency-suppressions.ts
export const EMERGENCY_SUPPRESSED_RULES = [
  's21_problematic_rule',  // Suppressed 2026-01-26 - Ticket #123
];
```

#### Step 3: Notify Stakeholders

Immediately notify:
- [ ] Engineering on-call
- [ ] Product owner
- [ ] Legal team (if blocker rule)
- [ ] Support team

Use template:

```
EMERGENCY: Validation Rule Suppressed

Rule ID: s21_problematic_rule
Suppressed at: 2026-01-26 12:00 UTC
Suppressed by: @engineer
Reason: False positives blocking valid Section 21 notices

Impact: ~100 users/day affected
Rollback method: Environment variable

Next steps:
1. Root cause analysis
2. Fix development
3. Review and restore
```

#### Step 4: Post-Incident Review (within 48 hours)

- [ ] Root cause identified
- [ ] Fix PR submitted with proper tests
- [ ] Incident documented
- [ ] Process improvements identified

### Emergency Suppression Log

All emergency suppressions are logged:

```json
{
  "timestamp": "2026-01-26T12:00:00Z",
  "type": "emergency_suppression",
  "ruleId": "s21_problematic_rule",
  "suppressedBy": "engineer@company.com",
  "approvedBy": ["oncall@company.com", "lead@company.com"],
  "reason": "False positives blocking valid notices",
  "method": "environment_variable",
  "ticketNumber": "INC-123",
  "restoredAt": null,
  "postIncidentReviewUrl": null
}
```

### Restoration Procedure

When restoring a suppressed rule:

1. **Verify fix is deployed** and tested
2. **Gradual restoration**:
   - Remove from suppression list
   - Monitor for 1 hour
   - Confirm no recurrence
3. **Update audit log** with restoration timestamp
4. **Close incident ticket**

---

## Compliance Checklist

### Before Any Rule Change

- [ ] Change classification determined
- [ ] Required reviewers identified
- [ ] Legal basis documented (if applicable)
- [ ] Test cases prepared

### Before Merge

- [ ] All required approvals obtained
- [ ] All CI checks pass
- [ ] Lint rules pass
- [ ] Golden tests pass
- [ ] Explainability output reviewed (for behavioral/legal-critical)

### Before Production Deployment

- [ ] Staging validation complete
- [ ] Rollout plan confirmed
- [ ] Support team notified (if user-facing)
- [ ] Monitoring in place

### After Deployment

- [ ] Verify rule behavior in production
- [ ] Monitor error rates and blocker rates
- [ ] Document in changelog

---

## Appendix: Governance CI Checks

The following CI checks enforce governance requirements:

| Check | Enforces | Fails On |
|-------|----------|----------|
| `validation:lint-rules` | YAML validity, safeguards | Any lint error |
| `validation:governance` | PR template, classification | Missing required fields |
| `validation:legal-review` | Legal reviewer for blockers | Missing legal approval |
| `validation:test-coverage` | Golden tests for new rules | Insufficient coverage |

### Running Governance Checks Locally

```bash
# Run all governance checks
npm run validation:governance-check

# Check specific PR
npm run validation:governance-check --pr 123
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Engineering | Initial governance framework |
