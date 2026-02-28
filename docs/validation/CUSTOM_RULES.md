# Custom Rules & Multi-Tenant Configuration

Phase 18A: Enterprise Features for Custom Validation

This document covers how to configure tenant-specific rules and overrides for enterprise customers.

## Table of Contents

1. [Overview](#overview)
2. [Tenant Context](#tenant-context)
3. [Rule Overrides](#rule-overrides)
4. [Custom Rules](#custom-rules)
5. [Tier-Based Features](#tier-based-features)
6. [Audit Logging](#audit-logging)
7. [API Reference](#api-reference)

---

## Overview

The rule targeting system allows:

- **Multi-tenant deployments**: Different rule sets for different customers
- **Rule overrides**: Suppress, downgrade, or modify existing rules
- **Custom rules**: Add tenant-specific validation rules
- **Audit trail**: Track all override applications

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tenant Context                               │
├─────────────────────────────────────────────────────────────────┤
│  tenantId: "acme-corp"                                          │
│  tier: "enterprise"                                             │
│  features: ["enhanced_messages", "explainability"]              │
│                                                                 │
│  ┌─────────────────────┐   ┌─────────────────────────────────┐ │
│  │   Rule Overrides    │   │        Custom Rules              │ │
│  │                     │   │                                   │ │
│  │ • suppress s21_xyz  │   │ • acme-corp_compliance_check     │ │
│  │ • downgrade s8_abc  │   │ • acme-corp_internal_policy      │ │
│  └─────────────────────┘   └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Base Rule Evaluation                          │
│                                                                  │
│  1. Load base rules from YAML                                   │
│  2. Evaluate conditions                                          │
│  3. Apply overrides (suppress/modify)                           │
│  4. Merge custom rules                                           │
│  5. Return combined results                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tenant Context

### Setting Up Tenant Context

```typescript
import {
  setTenantContext,
  getTenantContext,
  resetTenantContext,
} from '@/lib/validation/rule-targeting';

// Set context at request start
setTenantContext({
  tenantId: 'acme-corp',
  tenantName: 'Acme Corporation',
  tier: 'enterprise',
  features: ['enhanced_messages', 'explainability'],
  ruleOverrides: [...],
  customRules: [...],
});

// Use throughout request
const context = getTenantContext();
console.log(context.tenantId); // 'acme-corp'

// Reset at request end
resetTenantContext();
```

### Tenant Context Fields

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | string | Unique identifier (required) |
| `tenantName` | string | Human-readable name |
| `tier` | enum | `free`, `pro`, or `enterprise` |
| `features` | string[] | Enabled feature flags |
| `ruleOverrides` | RuleOverride[] | Override configurations |
| `customRules` | TenantRule[] | Tenant-specific rules |

### Creating from Configuration

```typescript
import { createTenantContext } from '@/lib/validation/rule-targeting';

// From database/config
const context = createTenantContext({
  tenantId: 'acme-corp',
  tenantName: 'Acme Corporation',
  tier: 'enterprise',
  features: ['enhanced_messages'],
  overridesJson: JSON.stringify([...]),
  customRulesJson: JSON.stringify([...]),
});

setTenantContext(context);
```

---

## Rule Overrides

### Override Actions

| Action | Description | Required Fields |
|--------|-------------|-----------------|
| `suppress` | Remove rule from results | `ruleId`, `reason` |
| `downgrade` | Reduce severity (e.g., blocker → warning) | `ruleId`, `reason`, `newSeverity` |
| `upgrade` | Increase severity (e.g., warning → blocker) | `ruleId`, `reason`, `newSeverity` |
| `modify` | Change message and/or severity | `ruleId`, `reason`, `newMessage`/`newSeverity` |

### Override Configuration

```typescript
const override: RuleOverride = {
  ruleId: 's21_deposit_cap_exceeded',
  action: 'downgrade',
  newSeverity: 'warning',
  reason: 'Client has separate deposit compliance process',
  approvedBy: 'compliance-team@acme.com',
  expiresAt: '2026-12-31',
  conditions: {
    jurisdictions: ['england'],
    products: ['notice_only'],
    routes: ['section_21'],
  },
};
```

### Override Examples

#### Suppress a Rule

```typescript
{
  ruleId: 's21_how_to_rent_not_served',
  action: 'suppress',
  reason: 'Client uses alternative compliance method verified by legal',
  approvedBy: 'legal@acme.com',
}
```

#### Downgrade Severity

```typescript
{
  ruleId: 's21_licensing_required_not_licensed',
  action: 'downgrade',
  newSeverity: 'warning',
  reason: 'Licensing check is advisory only for this client',
  approvedBy: 'product@landlord-heaven.co.uk',
  expiresAt: '2026-06-30',  // Auto-expires
}
```

#### Modify Message

```typescript
{
  ruleId: 's21_deposit_not_protected',
  action: 'modify',
  newMessage: 'Please verify deposit protection in the Acme Compliance Portal before proceeding.',
  reason: 'Custom workflow integration with client system',
  approvedBy: 'integrations@landlord-heaven.co.uk',
}
```

### Conditional Overrides

Overrides can be scoped to specific contexts:

```typescript
{
  ruleId: 's8_notice_period_short',
  action: 'suppress',
  reason: 'Client operates under different notice requirements',
  conditions: {
    jurisdictions: ['england'],
    products: ['complete_pack'],
    routes: ['section_8'],
  },
}
```

### Expiring Overrides

Set `expiresAt` for time-limited overrides:

```typescript
{
  ruleId: 's21_four_month_bar',
  action: 'downgrade',
  newSeverity: 'warning',
  reason: 'Temporary relaxation during system migration',
  approvedBy: 'cto@acme.com',
  expiresAt: '2026-03-31',  // Override expires after this date
}
```

---

## Custom Rules

### Custom Rule Structure

```typescript
const customRule: TenantRule = {
  id: 'acme-corp_compliance_check',  // Must be prefixed with tenantId
  severity: 'blocker',
  applies_to: ['section_21', 'section_8'],
  applies_when: [
    { condition: 'facts.acme_compliance_verified !== true' },
  ],
  message: 'Acme compliance verification required before proceeding.',
  rationale: 'Internal compliance policy requires verification step.',
  field: 'acme_compliance_verified',
};
```

### Rule ID Naming

Custom rule IDs **must** be prefixed with the tenant ID:

```
✅ acme-corp_compliance_check
✅ acme-corp_internal_policy
❌ custom_compliance_check (missing tenant prefix)
❌ s21_custom_rule (using system prefix)
```

### Adding Custom Rules

```typescript
setTenantContext({
  tenantId: 'acme-corp',
  tier: 'enterprise',
  customRules: [
    {
      id: 'acme-corp_mandatory_review',
      severity: 'blocker',
      applies_to: ['all'],
      applies_when: [
        { condition: '!facts.internal_review_completed' },
      ],
      message: 'Internal review must be completed before generating documents.',
      rationale: 'Acme policy requires manager approval.',
    },
    {
      id: 'acme-corp_data_quality',
      severity: 'warning',
      applies_to: ['section_21'],
      applies_when: [
        { condition: 'facts.tenant_name.length < 3' },
      ],
      message: 'Tenant name may be incomplete. Please verify.',
      rationale: 'Data quality check for CRM integration.',
    },
  ],
});
```

### Validating Custom Rules

```typescript
import { validateTenantRule } from '@/lib/validation/rule-targeting';

const rule = { ... };
const { valid, errors } = validateTenantRule(rule);

if (!valid) {
  console.error('Invalid rule:', errors);
}
```

---

## Tier-Based Features

### Available Features by Tier

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| `basic_validation` | ✅ | ✅ | ✅ |
| `enhanced_messages` | ❌ | ✅ | ✅ |
| `explainability` | ❌ | ✅ | ✅ |
| `custom_rules` | ❌ | ❌ | ✅ |
| `rule_overrides` | ❌ | ❌ | ✅ |

### Checking Feature Availability

```typescript
import {
  isFeatureAvailableForTier,
  canUseCustomRules,
  canUseRuleOverrides,
} from '@/lib/validation/rule-targeting';

// Check specific feature
if (isFeatureAvailableForTier('explainability')) {
  // Return detailed explanations
}

// Check enterprise features
if (canUseCustomRules()) {
  // Process custom rules
}

if (canUseRuleOverrides()) {
  // Apply rule overrides
}
```

---

## Audit Logging

All override applications are logged for compliance:

### Audit Entry Structure

```typescript
interface OverrideAuditEntry {
  timestamp: string;      // ISO timestamp
  tenantId: string;       // Which tenant
  ruleId: string;         // Which rule was overridden
  action: string;         // suppress, downgrade, etc.
  reason: string;         // Why override was applied
  approvedBy?: string;    // Who approved
  jurisdiction?: string;  // Context
  product?: string;       // Context
  route?: string;         // Context
}
```

### Accessing Audit Log

```typescript
import { getOverrideAuditLog, clearOverrideAuditLog } from '@/lib/validation/rule-targeting';

// Get all audit entries
const auditLog = getOverrideAuditLog();
console.log(auditLog);
// [
//   {
//     timestamp: '2026-01-26T12:00:00.000Z',
//     tenantId: 'acme-corp',
//     ruleId: 's21_deposit_cap_exceeded',
//     action: 'downgrade',
//     reason: 'Client has separate compliance process',
//     approvedBy: 'compliance@acme.com',
//     jurisdiction: 'england',
//     product: 'notice_only',
//     route: 'section_21',
//   }
// ]

// Clear log (for testing)
clearOverrideAuditLog();
```

### Production Audit Integration

In production, extend the audit log to persist entries:

```typescript
// Example: Send to audit service
import { processRuleOverrides } from '@/lib/validation/rule-targeting';
import { sendToAuditService } from '@/lib/audit';

const results = processRuleOverrides(
  validationResults,
  jurisdiction,
  product,
  route
);

// After processing, send audit entries
const auditLog = getOverrideAuditLog();
for (const entry of auditLog) {
  await sendToAuditService(entry);
}
```

---

## API Reference

### Tenant Context Functions

```typescript
// Set tenant context for current request
setTenantContext(context: TenantContext): void

// Get current tenant context
getTenantContext(): TenantContext

// Reset to default context
resetTenantContext(): void

// Check if feature is enabled for tenant
isTenantFeatureEnabled(feature: string): boolean
```

### Override Functions

```typescript
// Find override for a rule
findRuleOverride(
  ruleId: string,
  jurisdiction?: string,
  product?: string,
  route?: string
): RuleOverride | null

// Apply override to a result
applyRuleOverride<T>(
  result: T,
  override: RuleOverride,
  jurisdiction?: string,
  product?: string,
  route?: string
): T | null

// Process all results through override system
processRuleOverrides<T>(
  results: T[],
  jurisdiction?: string,
  product?: string,
  route?: string
): T[]
```

### Custom Rules Functions

```typescript
// Get all custom rules for tenant
getTenantCustomRules(): TenantRule[]

// Get custom rules for specific route
getTenantRulesForRoute(route: string): TenantRule[]

// Validate a custom rule
validateTenantRule(rule: TenantRule): { valid: boolean; errors: string[] }
```

### Tier Functions

```typescript
// Check if feature available for tier
isFeatureAvailableForTier(feature: string): boolean

// Check if custom rules allowed
canUseCustomRules(): boolean

// Check if overrides allowed
canUseRuleOverrides(): boolean
```

### Serialization Functions

```typescript
// Create context from config
createTenantContext(config: {...}): TenantContext

// Serialize for storage
serializeTenantContext(context: TenantContext): string

// Deserialize from storage
deserializeTenantContext(json: string): TenantContext
```

---

## Best Practices

1. **Always require a reason** for overrides - this is audited
2. **Set expiry dates** for temporary overrides
3. **Prefix custom rule IDs** with tenant ID
4. **Test custom rules** before deploying to production
5. **Review audit logs** regularly for compliance
6. **Use conditional overrides** to limit scope
7. **Document approvers** for accountability
