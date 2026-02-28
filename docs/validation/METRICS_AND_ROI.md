# Validation Platform Metrics & ROI Framework

Phase 21: Adoption, Measurement & ROI Validation

This document defines the metrics framework for measuring adoption, impact, and return on investment of the validation platform.

## Table of Contents

1. [Overview](#overview)
2. [Adoption Metrics](#adoption-metrics)
3. [Support Impact Metrics](#support-impact-metrics)
4. [Enterprise Feature Metrics](#enterprise-feature-metrics)
5. [ROI Calculation](#roi-calculation)
6. [Reporting Cadence](#reporting-cadence)
7. [Data Collection](#data-collection)

---

## Overview

### Purpose

This framework enables:
- **Quantified impact** of validation improvements
- **Data-driven decisions** on future investment
- **Executive visibility** into platform value
- **Support planning** based on actual usage

### Key Questions Answered

1. Are validation improvements reducing support burden?
2. Are users successfully resolving issues without help?
3. Are enterprise features delivering value?
4. What is the ROI of continued platform investment?

---

## Adoption Metrics

### A1: Phase 13 Blocker Encounter Rate

**Definition**: Percentage of validations that trigger at least one Phase 13 blocker

**Formula**:
```
Phase13BlockerRate = (Validations with ≥1 Phase 13 blocker) / (Total validations with Phase 13 enabled) × 100
```

**Target**: 5-15% (rules are catching real issues but not overly aggressive)

**Collection**: Telemetry field `phase13BlockerIds.length > 0`

---

### A2: Self-Resolution Rate

**Definition**: Percentage of blocked validations that subsequently pass without support contact

**Formula**:
```
SelfResolutionRate = (Blocked → Passed without ticket) / (Total blocked validations) × 100
```

**Target**: >80%

**Collection**: Track validation sequences per user/case:
- Validation fails at T₀
- Validation passes at T₁ (same case/user)
- No support ticket opened between T₀ and T₁

---

### A3: Time-to-Fix by Category

**Definition**: Average time between first blocker and successful validation, grouped by blocker category

**Categories**:
| Category | Rules | Target TTF |
|----------|-------|------------|
| Deposit Issues | s21_deposit_*, s173_deposit_*, ntl_deposit_* | <2 hours |
| Documentation | s21_gas_cert, s21_epc, s173_written_statement | <4 hours |
| Timing | s21_four_month_bar, s21_notice_period_short | <1 hour |
| Licensing | s21_licensing_required_not_licensed | <24 hours |
| Registration | ntl_landlord_not_registered | <24 hours |

**Formula**:
```
TTF_category = Average(T_pass - T_first_block) for blockers in category
```

**Collection**: Timestamp tracking on validation events

---

### A4: Help Link Click-Through Rate

**Definition**: Percentage of displayed help links that are clicked

**Formula**:
```
HelpLinkCTR = (Help link clicks) / (Help links displayed) × 100
```

**Target**: >20%

**Collection**: Frontend event tracking on help link clicks

---

### A5: Explainability Tier Usage

**Definition**: Distribution of explainability levels served to users

**Tiers**:
- Basic (Free tier)
- Enhanced (Pro tier)
- Full (Enterprise tier)

**Target**: Increasing proportion of Enhanced/Full over time indicates tier upgrades

**Collection**: Tenant context tier at validation time

---

### A6: Support Tool Adoption

**Definition**: Usage frequency of Phase 20 support tools

**Tools**:
- `validation:dashboard` - Internal insights
- `validation:rule-lookup` - Rule reference

**Metrics**:
| Tool | Metric | Target |
|------|--------|--------|
| Dashboard | Weekly runs | >10 |
| Rule Lookup | Weekly lookups | >50 |
| Rule Lookup | Unique rules queried | >20 |

**Collection**: Script execution logging

---

## Support Impact Metrics

### S1: Validation-Related Tickets

**Definition**: Support tickets tagged with validation-related categories

**Categories**:
- `validation_blocker`
- `validation_confusion`
- `validation_false_positive`
- `validation_missing_rule`

**Formula**:
```
WeeklyValidationTickets = Count(tickets where category in validation_categories) per week
```

**Target**: 20% reduction from baseline within 90 days of Phase 13 rollout

**Collection**: Support ticket system tagging + weekly export

---

### S2: Average Handling Time (AHT)

**Definition**: Average time to resolve validation-related support tickets

**Formula**:
```
AHT_validation = Sum(resolution_time) / Count(validation_tickets)
```

**Target**: <15 minutes (with rule lookup tool)

**Collection**: Support ticket system metrics

---

### S3: Engineering Escalation Rate

**Definition**: Percentage of validation tickets requiring engineering involvement

**Formula**:
```
EscalationRate = (Tickets escalated to engineering) / (Total validation tickets) × 100
```

**Target**: <5%

**Collection**: Support ticket escalation tracking

---

### S4: Emergency Suppression Frequency

**Definition**: Number of emergency rule suppressions per month

**Target**: <1 per month (indicates stable, well-tested rules)

**Collection**: Suppression audit log

---

### S5: False Positive Rate

**Definition**: Validated false positive reports as percentage of blocker triggers

**Formula**:
```
FalsePositiveRate = (Confirmed false positives) / (Total blocker triggers) × 100
```

**Target**: <0.1%

**Collection**: Support ticket analysis + confirmed false positive counter

---

## Enterprise Feature Metrics

### E1: Tenant Override Usage

**Definition**: Active overrides per enterprise tenant

**Metrics**:
| Metric | Definition |
|--------|------------|
| Overrides per tenant | Average active overrides |
| Override actions | Distribution: suppress/downgrade/modify |
| Override expiration compliance | % with expiration dates |

**Target**: Overrides are used thoughtfully (avg <5 per tenant)

**Collection**: Tenant context audit

---

### E2: Custom Rule Adoption

**Definition**: Custom rules deployed per enterprise tenant

**Metrics**:
| Metric | Definition |
|--------|------------|
| Custom rules per tenant | Average deployed rules |
| Custom rule trigger rate | % of validations triggering custom rules |
| Custom rule categories | Internal compliance vs data quality |

**Target**: Demonstrates feature value (avg 2-5 per tenant)

**Collection**: Tenant context analysis

---

### E3: Audit Export Usage

**Definition**: Audit exports generated per enterprise tenant

**Metrics**:
| Metric | Definition |
|--------|------------|
| Exports per month | Average monthly exports |
| Export formats | CSV vs JSON vs PDF |
| Export triggers | Manual vs scheduled |

**Target**: Regular usage indicates compliance value (≥1/month)

**Collection**: Audit export request logging

---

### E4: API/Webhook Usage

**Definition**: API and webhook activity per enterprise tenant

**Metrics**:
| Metric | Definition |
|--------|------------|
| API calls/month | Average monthly validation API calls |
| Webhook deliveries | Webhook events sent |
| Integration depth | Unique endpoints configured |

**Target**: Active API usage indicates deep integration

**Collection**: API gateway metrics

---

### E5: Enterprise Retention Correlation

**Definition**: Correlation between enterprise feature usage and retention

**Analysis**:
- Segment tenants by feature usage
- Compare churn rates
- Identify high-value feature combinations

**Target**: Higher feature usage = lower churn

**Collection**: CRM data correlation (external)

---

## ROI Calculation

### Cost Savings

#### Support Cost Reduction

```
Annual Support Savings =
  (Baseline tickets/week - Current tickets/week) × 52 × Cost per ticket
  + (Baseline AHT - Current AHT) × Current tickets × Cost per minute
```

**Cost assumptions**:
- Cost per ticket: £8-12
- Cost per minute (support time): £0.50

#### Engineering Time Savings

```
Annual Engineering Savings =
  (Baseline escalations/week - Current escalations/week) × 52 × Eng hours per escalation × Eng hourly rate
```

**Cost assumptions**:
- Eng hours per escalation: 2-4 hours
- Eng hourly rate: £75-100

#### User Time Savings

```
Annual User Time Savings =
  (Baseline TTF - Current TTF) × Blockers/year × User hourly value
```

**Value assumptions**:
- User hourly value: £25-50 (opportunity cost)

### Revenue Impact

#### Conversion Improvement

```
Revenue from Improved Conversion =
  (Current conversion - Baseline conversion) × Total opportunities × Average order value
```

#### Enterprise Feature Revenue

```
Enterprise Feature Revenue =
  Enterprise customers × Monthly fee × 12
  + Overage charges (API, exports, custom rules)
```

### Risk Reduction

#### Compliance Risk Reduction

```
Risk Reduction Value =
  Probability(compliance issue) × Cost(compliance issue) × Risk reduction factor
```

**Assumptions**:
- Cost of compliance issue: £10,000-50,000 (legal, remediation, reputation)
- Risk reduction factor: Estimate based on rule coverage improvement

---

## Reporting Cadence

### Weekly Report (Automated)

**Audience**: Validation team, Support leads

**Contents**:
- Validation volume and error rate
- Top 10 blockers (7-day)
- Phase 13 impact metrics
- Emergency suppressions active
- Tool usage stats

**Delivery**: Slack/email, Monday morning

---

### Monthly Report (Semi-automated)

**Audience**: Product, Engineering leads

**Contents**:
- All weekly metrics (30-day roll-up)
- Support impact analysis
- Enterprise feature usage
- Trend analysis (MoM comparison)
- Recommendations

**Delivery**: Dashboard + PDF, first week of month

---

### Quarterly Business Review (Manual)

**Audience**: Leadership, Finance

**Contents**:
- Executive summary (1-2 pages)
- ROI calculation
- Cost savings quantified
- Revenue impact
- Recommendations for next quarter

**Delivery**: Presentation + document, end of quarter

---

## Data Collection

### Telemetry Schema

```typescript
interface ValidationMetricsEvent {
  // Identity
  event_id: string;
  timestamp: string;

  // Context
  tenant_id: string;
  user_id?: string;
  case_id?: string;
  jurisdiction: string;
  product: string;
  route: string;

  // Outcome
  is_valid: boolean;
  blocker_count: number;
  warning_count: number;
  blocker_ids: string[];

  // Phase 13
  phase13_enabled: boolean;
  phase13_blocker_ids: string[];
  phase13_warning_ids: string[];

  // Performance
  duration_ms: number;

  // Tier
  tenant_tier: 'free' | 'pro' | 'enterprise';
  explainability_level: 'basic' | 'enhanced' | 'full';

  // Enterprise features used
  overrides_applied: number;
  custom_rules_triggered: number;
}
```

### Support Ticket Schema

```typescript
interface SupportTicketMetrics {
  ticket_id: string;
  created_at: string;
  resolved_at?: string;

  // Categorization
  category: string;
  is_validation_related: boolean;
  validation_subcategory?: string;

  // Resolution
  resolution_time_minutes?: number;
  escalated_to_engineering: boolean;

  // Context
  rule_id_mentioned?: string;
  tenant_id?: string;
}
```

### Tool Usage Schema

```typescript
interface ToolUsageEvent {
  tool: 'dashboard' | 'rule-lookup' | 'governance-check';
  timestamp: string;
  user?: string;

  // Tool-specific
  args?: string[];
  rule_id_queried?: string;
  search_term?: string;
  output_format?: 'text' | 'json';
}
```

---

## Baseline Establishment

### Pre-Phase 13 Baseline (Capture Before Rollout)

| Metric | Baseline Value | Date Captured |
|--------|----------------|---------------|
| Weekly validation tickets | ___ | ___ |
| Average handling time | ___ min | ___ |
| Escalation rate | ___% | ___ |
| Self-resolution rate | ___% | ___ |

### Phase 13 Rollout Comparison Points

| Metric | Week 1 | Week 4 | Week 12 | Target |
|--------|--------|--------|---------|--------|
| Phase 13 blocker rate | | | | 5-15% |
| Self-resolution rate | | | | >80% |
| Weekly tickets (delta) | | | | -20% |
| AHT (delta) | | | | -30% |

---

## Appendix: Metric Formulas Summary

| Metric ID | Name | Formula |
|-----------|------|---------|
| A1 | Phase 13 Blocker Rate | Phase13Blockers / Phase13Validations × 100 |
| A2 | Self-Resolution Rate | (Blocked→Passed no ticket) / Blocked × 100 |
| A3 | Time-to-Fix | Avg(T_pass - T_block) |
| A4 | Help Link CTR | Clicks / Displayed × 100 |
| S1 | Weekly Tickets | Count(validation tickets) per week |
| S2 | AHT | Sum(resolution_time) / Count(tickets) |
| S3 | Escalation Rate | Escalated / Total × 100 |
| S4 | Suppression Frequency | Count(suppressions) per month |
| E1 | Overrides/Tenant | Avg(active overrides) |
| E2 | Custom Rules/Tenant | Avg(deployed rules) |
