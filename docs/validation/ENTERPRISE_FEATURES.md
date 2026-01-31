# Validation Enterprise Features

Phase 20: Validation Platform Productization & Visibility

This document defines the enterprise-tier validation features available to paying customers.

## Table of Contents

1. [Overview](#overview)
2. [Feature Matrix](#feature-matrix)
3. [Custom Rules](#custom-rules)
4. [Rule Overrides](#rule-overrides)
5. [Audit Exports](#audit-exports)
6. [Portfolio Validation History](#portfolio-validation-history)
7. [API Access](#api-access)
8. [Commercial Terms](#commercial-terms)
9. [Support SLAs](#support-slas)

---

## Overview

### Enterprise Tier Benefits

Enterprise customers receive:
- **Custom validation rules** tailored to their business processes
- **Rule overrides** for specific compliance workflows
- **Audit exports** for compliance documentation
- **Validation history** for portfolio management
- **Priority support** with dedicated account management
- **API access** for system integration

### Qualification

Enterprise tier is available to customers who:
- Process 100+ notices per month, OR
- Require custom validation rules, OR
- Need compliance audit exports, OR
- Require API integration

---

## Feature Matrix

### Validation Features by Tier

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Core Validation** | | | |
| Real-time validation | Yes | Yes | Yes |
| Jurisdiction coverage | All | All | All |
| Blocker rules | Yes | Yes | Yes |
| Warning rules | Yes | Yes | Yes |
| **Enhanced Validation** | | | |
| Detailed error messages | Basic | Enhanced | Full |
| How-to-fix guidance | No | Yes | Yes |
| Legal references | No | Simplified | Full citation |
| Help article links | No | Yes | Yes |
| **Enterprise Features** | | | |
| Custom rules | No | No | Yes |
| Rule overrides | No | No | Yes |
| Audit exports | No | No | Yes |
| Validation history | No | No | Yes |
| API access | No | Limited | Full |
| Explainability mode | No | No | Yes |
| Technical rule details | No | No | Yes |

### What's Configurable vs Fixed

| Category | Configurable | Fixed by Law |
|----------|--------------|--------------|
| **Blockers** | | |
| Deposit protection | Override severity only | Must validate |
| Gas safety certificate | Override severity only | Must validate |
| Notice period | No | Fixed by statute |
| Licensing requirements | Can suppress for verified clients | Must validate |
| **Warnings** | | |
| EPC validity | Can suppress | Should validate |
| Written statement (Wales) | Can suppress | Should validate |
| Pre-action requirements | Can modify message | Should validate |
| **Custom Rules** | | |
| Internal compliance checks | Fully configurable | N/A |
| Data quality checks | Fully configurable | N/A |
| Workflow requirements | Fully configurable | N/A |

---

## Custom Rules

### What Can Be Customized

Enterprise customers can add tenant-specific rules for:

1. **Internal Compliance**
   - Manager approval workflows
   - Internal policy checks
   - Document verification requirements

2. **Data Quality**
   - Minimum field lengths
   - Format validation
   - Cross-field consistency

3. **Business Process**
   - Required review steps
   - Approval gates
   - External system integration checks

### What Cannot Be Customized

These are **fixed by law** and cannot be overridden:

| Requirement | Jurisdiction | Why Fixed |
|-------------|--------------|-----------|
| Notice period minimums | All | Statutory minimum |
| Deposit protection check | England/Wales | Legal requirement |
| Prescribed information | England | Deregulation Act 2015 |
| Landlord registration | Scotland | Legal requirement |
| Gas safety certificate | All | Safety legislation |

### Custom Rule Structure

```yaml
# Example custom rule
id: "acme-corp_manager_approval"
severity: blocker
applies_to:
  - section_21
  - section_8
applies_when:
  - condition: "!facts.internal_approval_complete"
message: "Manager approval required before proceeding"
rationale: "Acme Corp policy requires manager sign-off"
field: internal_approval
```

### Implementation Process

1. **Request**: Submit custom rule request via account manager
2. **Review**: Legal review for conflicts with statutory requirements
3. **Development**: Rule configuration by validation team
4. **Testing**: UAT in staging environment
5. **Deployment**: Enable in production
6. **Monitoring**: Track rule performance and impact

---

## Rule Overrides

### Override Types

| Action | Description | Requirements |
|--------|-------------|--------------|
| `suppress` | Remove rule from evaluation | Legal signoff |
| `downgrade` | Blocker → Warning | Legal signoff |
| `upgrade` | Warning → Blocker | None |
| `modify` | Change message text | Product signoff |

### What Requires Legal Signoff

Overrides affecting legal enforcement rules require documented legal approval:

```typescript
// Requires legal signoff
{
  ruleId: 's21_deposit_not_protected',
  action: 'downgrade',
  newSeverity: 'warning',
  reason: 'Client has external deposit verification process',
  approvedBy: 'legal@client.com',  // Required
  expiresAt: '2026-12-31',         // Required for legal rules
}
```

### What Does Not Require Legal Signoff

Non-enforcement overrides can be configured directly:

```typescript
// No legal signoff needed
{
  ruleId: 's21_epc_validity_warning',
  action: 'modify',
  newMessage: 'Please verify EPC status in your compliance portal',
  reason: 'Custom messaging for internal workflow',
}
```

### Override Documentation

All overrides are:
- Logged with timestamp, actor, and reason
- Exportable for audit purposes
- Reviewed quarterly for continued relevance
- Subject to expiration for legal-impact overrides

---

## Audit Exports

### Available Reports

| Report | Format | Contents |
|--------|--------|----------|
| Validation Summary | CSV/JSON | All validations with outcomes |
| Override Usage | CSV/JSON | Applied overrides by rule |
| Custom Rule Performance | CSV/JSON | Custom rule firing statistics |
| Compliance Status | PDF | Summary for regulators |

### Report Fields

```typescript
interface ValidationAuditRecord {
  // Identification
  validation_id: string;
  timestamp: string;
  case_id?: string;

  // Context
  jurisdiction: string;
  product: string;
  route: string;
  tenant_id: string;

  // Outcome
  is_valid: boolean;
  blocker_count: number;
  warning_count: number;
  blocker_ids: string[];
  warning_ids: string[];

  // Overrides applied
  overrides_applied: Array<{
    rule_id: string;
    action: string;
    reason: string;
  }>;

  // Suppressions active
  suppressions_active: string[];

  // Duration
  duration_ms: number;
}
```

### Export API

```typescript
// Generate audit export
GET /api/admin/validation-audit-export
  ?start_date=2026-01-01
  &end_date=2026-01-31
  &format=csv
  &include_overrides=true

// Response: CSV file download
```

### Data Retention

- Validation records: 2 years
- Audit logs: 7 years
- Override history: Permanent

---

## Portfolio Validation History

### Features

Enterprise customers can track validation history across their portfolio:

1. **Property-Level History**
   - All validations for a property
   - Trend analysis
   - Recurring issues identification

2. **Portfolio Overview**
   - Aggregate validation statistics
   - Common blocker identification
   - Compliance rate tracking

3. **Alerts & Notifications**
   - Configurable alert thresholds
   - Email/webhook notifications
   - Scheduled reports

### Dashboard Widgets

```typescript
interface PortfolioDashboard {
  // Summary metrics
  total_properties: number;
  validations_this_month: number;
  compliance_rate: number;  // % passing validation

  // Trend data
  trend_30_days: Array<{
    date: string;
    validations: number;
    pass_rate: number;
  }>;

  // Top issues
  top_blockers: Array<{
    rule_id: string;
    count: number;
    affected_properties: number;
  }>;

  // Properties requiring attention
  properties_with_recurring_issues: Array<{
    property_id: string;
    address: string;
    failed_validations: number;
    common_issue: string;
  }>;
}
```

---

## API Access

### Endpoints

| Endpoint | Description | Rate Limit |
|----------|-------------|------------|
| `POST /api/validate` | Run validation | 100/min |
| `GET /api/rules` | List configured rules | 60/min |
| `GET /api/history/{case_id}` | Get validation history | 60/min |
| `GET /api/audit-export` | Generate audit report | 10/day |

### Authentication

```bash
# API key authentication
curl -H "Authorization: Bearer $API_KEY" \
     -H "X-Tenant-ID: acme-corp" \
     https://api.landlord-heaven.co.uk/api/validate
```

### Validation Request

```typescript
// Request
POST /api/validate
{
  "jurisdiction": "england",
  "product": "notice_only",
  "route": "section_21",
  "facts": {
    "landlord_name": "John Smith",
    "tenant_name": "Jane Doe",
    // ... other facts
  },
  "options": {
    "include_explanations": true,
    "include_technical_details": true  // Enterprise only
  }
}

// Response
{
  "is_valid": false,
  "blockers": [
    {
      "id": "s21_deposit_not_protected",
      "severity": "blocker",
      "message": "The deposit must be protected",
      "title": "Deposit Protection Required",
      "how_to_fix": ["Protect deposit with scheme", "..."],
      "legal_ref": "Housing Act 2004, Section 213",
      "technical": {
        "condition": "facts.deposit_protected !== true",
        "override_status": "none"
      }
    }
  ],
  "warnings": [],
  "metadata": {
    "duration_ms": 12,
    "rules_evaluated": 45,
    "phase13_enabled": true
  }
}
```

### Webhooks

Enterprise customers can configure webhooks for:

- Validation completed
- Override applied
- Emergency suppression activated
- Custom rule triggered

```typescript
// Webhook payload
{
  "event": "validation.completed",
  "timestamp": "2026-01-26T12:00:00Z",
  "tenant_id": "acme-corp",
  "data": {
    "case_id": "case_123",
    "is_valid": false,
    "blocker_count": 2
  }
}
```

---

## Commercial Terms

### Pricing Model

| Component | Included | Overage |
|-----------|----------|---------|
| Validations | 1,000/month | Contact sales |
| Custom rules | 10 rules | $50/rule/month |
| API calls | 10,000/month | $0.01/call |
| Audit exports | 12/year | $25/export |
| Support hours | 4 hours/month | $150/hour |

### Contract Terms

- Minimum term: 12 months
- Billing: Monthly or annual (10% discount)
- SLA: 99.9% uptime guarantee
- Data processing: GDPR compliant

---

## Support SLAs

### Response Times

| Severity | Response | Resolution |
|----------|----------|------------|
| Critical (production down) | 1 hour | 4 hours |
| High (major feature broken) | 4 hours | 1 business day |
| Medium (partial impact) | 1 business day | 3 business days |
| Low (minor issue) | 2 business days | 5 business days |

### Dedicated Support

Enterprise customers receive:
- Dedicated account manager
- Quarterly business reviews
- Priority feature requests
- Direct engineering escalation path

### Support Channels

- Email: enterprise-support@landlord-heaven.co.uk
- Phone: Available 9am-6pm UK time
- Slack: Dedicated channel (on request)
- Emergency: 24/7 on-call for critical issues

---

## Appendix: Implementation Checklist

### Onboarding New Enterprise Customer

- [ ] Account setup in admin panel
- [ ] Tenant context configured
- [ ] Default feature flags set
- [ ] Custom rules requested/documented
- [ ] Overrides requested/documented
- [ ] Legal signoff obtained (if needed)
- [ ] API credentials generated
- [ ] Webhook endpoints configured
- [ ] Training session scheduled
- [ ] Documentation provided
- [ ] Go-live verification complete
