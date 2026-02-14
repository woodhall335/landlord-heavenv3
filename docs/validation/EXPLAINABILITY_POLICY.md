# Customer-Facing Explainability Policy

Phase 20: Validation Platform Productization & Visibility

This document defines which validation explainability features can be surfaced to end users and under what conditions.

## Table of Contents

1. [Overview](#overview)
2. [Explainability Tiers](#explainability-tiers)
3. [User-Facing Content](#user-facing-content)
4. [Restricted Content](#restricted-content)
5. [Tier-Based Gating](#tier-based-gating)
6. [Jurisdiction-Specific Rules](#jurisdiction-specific-rules)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

### Purpose

Validation explainability helps users understand:
- **Why** their notice was blocked or flagged
- **What** they need to fix
- **How** to resolve the issue

### Principles

1. **Clarity over detail**: Users need actionable guidance, not technical specifications
2. **Legal accuracy**: All explanations must be legally accurate without constituting legal advice
3. **Appropriate scope**: Different user tiers receive different levels of detail
4. **Safety first**: Never expose information that could help users circumvent valid legal requirements

---

## Explainability Tiers

### Tier 1: Basic (All Users)

| Feature | Included | Example |
|---------|----------|---------|
| Issue severity | Yes | "This issue must be resolved before proceeding" |
| User-friendly message | Yes | "A valid gas safety certificate is required" |
| Affected field | Yes | "Gas Safety Certificate" |
| General guidance | Yes | "Please provide a current gas safety certificate" |

### Tier 2: Enhanced (Pro Tier)

| Feature | Included | Example |
|---------|----------|---------|
| Everything in Tier 1 | Yes | |
| Step-by-step fix instructions | Yes | "1. Obtain certificate 2. Upload to form 3. Verify date" |
| Legal reference (simplified) | Yes | "Required under the Gas Safety Regulations" |
| Help article link | Yes | Link to knowledge base |

### Tier 3: Full (Enterprise Tier)

| Feature | Included | Example |
|---------|----------|---------|
| Everything in Tier 2 | Yes | |
| Complete legal citation | Yes | "Gas Safety (Installation and Use) Regulations 1998, reg 36" |
| Technical rule ID | Yes | "s21_gas_cert" |
| Condition explanation | Yes | "Triggered when gas_cert_valid = false" |
| Override status | Yes | "This rule is active for your organization" |

---

## User-Facing Content

### Always Show

These elements are safe and helpful for all users:

```typescript
interface UserVisibleExplanation {
  // Severity indicator (required)
  severity: 'error' | 'warning' | 'info';

  // User-friendly title (required)
  title: string;

  // Plain language description (required)
  description: string;

  // Affected form field (if applicable)
  field?: string;
}
```

### Conditionally Show

These elements require tier gating:

```typescript
interface TierGatedExplanation {
  // Step-by-step resolution (Pro+)
  howToFix?: string[];

  // Simplified legal reference (Pro+)
  legalReference?: string;

  // Help article URL (Pro+)
  helpUrl?: string;

  // Full legal citation (Enterprise)
  fullLegalCitation?: string;

  // Technical details (Enterprise)
  technicalDetails?: {
    ruleId: string;
    condition: string;
    overrideStatus?: string;
  };
}
```

---

## Restricted Content

### Never Show to Users

The following must never be exposed to end users:

| Content | Reason |
|---------|--------|
| Rule condition syntax | Could enable circumvention |
| Internal rule IDs (for non-enterprise) | Not actionable for users |
| Emergency suppression status | Internal operational detail |
| Tenant override details (to non-admin) | Security/privacy |
| System error details | Security risk |
| Performance metrics | Not relevant to users |
| Audit trail entries | Internal compliance only |

### Admin-Only Content

Available to tenant administrators only:

- Tenant override configurations
- Custom rule definitions
- Audit log access
- Rule suppression notifications

---

## Tier-Based Gating

### Implementation

```typescript
import { getTenantContext } from '@/lib/validation/rule-targeting';

function getExplainabilityLevel(): 'basic' | 'enhanced' | 'full' {
  const context = getTenantContext();

  switch (context.tier) {
    case 'enterprise':
      return 'full';
    case 'pro':
      return 'enhanced';
    default:
      return 'basic';
  }
}

function formatExplanation(
  issue: ValidationIssue,
  level: 'basic' | 'enhanced' | 'full'
): UserExplanation {
  const base = {
    severity: issue.severity,
    title: issue.title || issue.message,
    description: getSimplifiedMessage(issue),
    field: issue.field,
  };

  if (level === 'basic') {
    return base;
  }

  const enhanced = {
    ...base,
    howToFix: issue.howToFix,
    legalReference: getSimplifiedLegalRef(issue.legalRef),
    helpUrl: issue.helpUrl,
  };

  if (level === 'enhanced') {
    return enhanced;
  }

  // Full (Enterprise)
  return {
    ...enhanced,
    fullLegalCitation: issue.legalRef,
    technicalDetails: {
      ruleId: issue.id,
      condition: getConditionExplanation(issue.id),
      overrideStatus: getOverrideStatus(issue.id),
    },
  };
}
```

---

## Jurisdiction-Specific Rules

### England

| Content Type | Permitted | Notes |
|--------------|-----------|-------|
| Housing Act references | Yes | Public legislation |
| Tenant Fees Act references | Yes | Public legislation |
| Deposit protection status | Yes | User needs to know |
| Licensing requirements | Yes | User needs to know |

### Wales

| Content Type | Permitted | Notes |
|--------------|-----------|-------|
| Renting Homes Act references | Yes | Public legislation |
| Written statement requirement | Yes | User needs to know |
| Landlord registration | Yes | User needs to know |

### Scotland

| Content Type | Permitted | Notes |
|--------------|-----------|-------|
| Private Housing Act references | Yes | Public legislation |
| Pre-action requirements | Yes | User needs to know |
| Landlord registration | Yes | User needs to know |

---

## Implementation Guidelines

### UI Components

#### Basic Tier Display

```tsx
function BasicValidationMessage({ issue }) {
  return (
    <Alert severity={issue.severity}>
      <AlertTitle>{issue.title}</AlertTitle>
      <p>{issue.description}</p>
      {issue.field && <p>Check: {issue.field}</p>}
    </Alert>
  );
}
```

#### Pro Tier Display

```tsx
function ProValidationMessage({ issue }) {
  return (
    <Alert severity={issue.severity}>
      <AlertTitle>{issue.title}</AlertTitle>
      <p>{issue.description}</p>

      {issue.howToFix && (
        <div>
          <h4>How to Fix</h4>
          <ol>
            {issue.howToFix.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {issue.legalReference && (
        <p className="text-sm">
          Legal basis: {issue.legalReference}
        </p>
      )}

      {issue.helpUrl && (
        <a href={issue.helpUrl}>Learn more</a>
      )}
    </Alert>
  );
}
```

### API Response Formatting

```typescript
// API endpoint should filter based on tier
export async function GET(request: Request) {
  const validation = await runValidation(params);
  const level = getExplainabilityLevel();

  return Response.json({
    isValid: validation.isValid,
    issues: validation.blockers.map(issue =>
      formatExplanation(issue, level)
    ),
  });
}
```

### Logging & Telemetry

Always log full technical details server-side, even when not shown to users:

```typescript
function logValidationResult(result: ValidationResult) {
  // Full logging for internal use
  console.log('[Validation]', JSON.stringify({
    ruleIds: result.blockers.map(b => b.id),
    severity: result.blockers.map(b => b.severity),
    // ... full technical details
  }));

  // Telemetry for metrics
  recordTelemetry(result);
}
```

---

## Recent Changes Communication

### What Changed Policy

Users may ask "What changed?" when validation behavior differs from their previous experience.

#### Permitted Responses

- "We've improved our validation to better reflect current legal requirements"
- "This check was added based on [public legislation name]"
- "Our system now validates [specific requirement] more accurately"

#### Not Permitted

- Technical details about rule changes
- Phase 13+ implementation details
- Internal feature flag information
- Specific dates of rule changes

### UI Pattern

```tsx
function ValidationChangeNotice() {
  return (
    <Notice type="info">
      <p>
        Our validation system has been updated to reflect current
        legal requirements. If you have questions about a specific
        validation result, please contact support.
      </p>
      <a href="/help/validation-updates">Learn more about validation updates</a>
    </Notice>
  );
}
```

---

## Review & Approval

### New Explainability Content

All new user-facing explainability content must be reviewed by:

1. **Product**: Clarity and user experience
2. **Legal**: Accuracy and appropriateness
3. **Engineering**: Technical feasibility

### Change Process

1. Draft proposed content
2. Product review for clarity
3. Legal review for accuracy
4. Engineering implementation
5. QA verification
6. Release

---

## Appendix: Content Templates

### Message Templates

```yaml
# Standard blocker message
title: "[Requirement] Required"
description: "A valid [document/certificate] is required to proceed."
howToFix:
  - "Obtain a current [document/certificate]"
  - "Upload it to the [field name] field"
  - "Ensure the date is within the required validity period"
legalReference: "Required under [Act/Regulation name]"

# Standard warning message
title: "[Issue] May Affect Your Notice"
description: "[Description of the potential issue]"
howToFix:
  - "[Recommended action]"
  - "[Alternative if applicable]"
```

### Legal Reference Simplification

| Full Citation | Simplified |
|---------------|------------|
| Housing Act 1988, Section 21(1)(b) | Housing Act 1988 |
| Tenant Fees Act 2019, Section 3(1) | Tenant Fees Act 2019 |
| Deregulation Act 2015, Schedule 4, paragraph 3 | Deregulation Act 2015 |
