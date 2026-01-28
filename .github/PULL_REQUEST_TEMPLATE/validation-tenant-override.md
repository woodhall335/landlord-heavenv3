---
name: Validation - Tenant Override
about: Add or modify tenant-specific rule overrides
title: '[validation:tenant-override] '
labels: 'validation, tenant-override, enterprise'
---

## Classification: Tenant Override

This PR adds or modifies rule overrides for a specific tenant.

## Tenant Information

**Tenant ID:** _________

**Tenant Name:** _________

**Account Manager:** @_________

**Tier:** Enterprise

## Override Details

### Overrides Being Added/Modified

| Rule ID | Action | New Severity | Reason |
|---------|--------|--------------|--------|
| `rule_id` | suppress/downgrade/upgrade/modify | N/A or severity | Brief reason |

### Override Configuration

```typescript
// Paste the override configuration
{
  ruleId: 'rule_id_here',
  action: 'suppress',
  reason: 'Client has alternative compliance process',
  approvedBy: 'approver@company.com',
  expiresAt: '2026-12-31',  // Optional
  conditions: {
    jurisdictions: ['england'],
    products: ['notice_only'],
    routes: ['section_21'],
  },
}
```

## Business Justification

**Why is this override needed?**
<!-- Explain the business reason for this tenant-specific override -->

**Compliance verification:**
<!-- How does the tenant ensure compliance outside of this rule? -->

**Expiration:**
- [ ] This override has an expiration date: _________
- [ ] This override is permanent (requires additional approval)

## Approval Chain

### Required Approvals

- [ ] Engineering review
- [ ] Product review
- [ ] Account manager approval
- [ ] Legal consulted (if blocker rule): @_________

### Tenant Approval

- [ ] Tenant has acknowledged the override and its implications
- [ ] Tenant agreement/contract updated (if needed)

## Audit Trail

This override will be logged in the tenant audit trail:

```json
{
  "timestamp": "2026-01-26T12:00:00Z",
  "tenantId": "tenant_id",
  "ruleId": "rule_id",
  "action": "suppress",
  "reason": "Reason here",
  "approvedBy": "approver@company.com",
  "prNumber": 123
}
```

## Checklist

### Required for Tenant Overrides

- [ ] Business justification documented
- [ ] Tenant tier is Enterprise
- [ ] Engineering review obtained
- [ ] Product review obtained
- [ ] Legal consulted (if blocker rule)
- [ ] Expiration date set (or permanent override approved)
- [ ] All tests pass
- [ ] Lint passes

### Reviewer Checklist

**Engineering Reviewer:**
- [ ] Override configuration is valid
- [ ] No security implications
- [ ] Audit logging will work correctly

**Product Reviewer:**
- [ ] Business justification is sound
- [ ] Tenant communication is complete
- [ ] Support team is aware

**Account Manager:**
- [ ] Tenant has requested this override
- [ ] Tenant understands implications
- [ ] Contract/agreement covers this customization
