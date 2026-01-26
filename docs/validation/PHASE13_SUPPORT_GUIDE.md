# Phase 13 Support Guide

Support team runbook for handling Phase 13 validation rule inquiries.

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Phase:** 16 (UX Messaging + Help Content + Support Readiness)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference Table](#quick-reference-table)
3. [Rule Details by Jurisdiction](#rule-details-by-jurisdiction)
   - [England Section 21](#england-section-21)
   - [England Section 8](#england-section-8)
   - [Wales Section 173](#wales-section-173)
   - [Scotland Notice to Leave](#scotland-notice-to-leave)
4. [Escalation Categories](#escalation-categories)
5. [Common User Questions](#common-user-questions)
6. [Troubleshooting Decision Tree](#troubleshooting-decision-tree)

---

## Overview

Phase 13 introduced 15 new validation rules that improve legal accuracy for eviction notices. These rules were rolled out progressively via Phase 14 (controlled rollout) and fully enabled in Phase 15.

### What Phase 13 Rules Do

- Enforce statutory requirements that were not previously validated
- Prevent users from generating legally invalid notices
- Provide warnings where tribunal success may be affected

### Support Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| **High** | Within 2 hours | Retaliatory eviction blocks, licensing issues affecting multiple properties |
| **Medium** | Within 4 hours | Deposit protection, landlord registration, pre-action requirements |
| **Low** | Within 8 hours | Notice period adjustments, timing issues, documentation requirements |

---

## Quick Reference Table

| Rule ID | Jurisdiction | Severity | Category | Priority |
|---------|--------------|----------|----------|----------|
| `s21_deposit_cap_exceeded` | England | Blocker | Deposit | Medium |
| `s21_four_month_bar` | England | Blocker | Timing | Low |
| `s21_notice_period_short` | England | Blocker | Notice Period | Low |
| `s21_licensing_required_not_licensed` | England | Blocker | Licensing | Medium |
| `s21_retaliatory_improvement_notice` | England | Blocker | Retaliatory | High |
| `s21_retaliatory_emergency_action` | England | Blocker | Retaliatory | High |
| `s8_notice_period_short` | England | Blocker | Notice Period | Low |
| `s173_notice_period_short` | Wales | Blocker | Notice Period | Low |
| `s173_deposit_not_protected` | Wales | Blocker | Deposit | Medium |
| `s173_written_statement_missing` | Wales | Warning | Documentation | Low |
| `ntl_landlord_not_registered` | Scotland | Blocker | Registration | Medium |
| `ntl_pre_action_letter_not_sent` | Scotland | Blocker | Pre-Action | Medium |
| `ntl_pre_action_signposting_missing` | Scotland | Warning | Pre-Action | Medium |
| `ntl_ground_1_arrears_threshold` | Scotland | Warning | Arrears | Medium |
| `ntl_deposit_not_protected` | Scotland | Blocker | Deposit | Medium |

---

## Rule Details by Jurisdiction

### England Section 21

#### `s21_deposit_cap_exceeded`

**Error Message:** "Deposit exceeds the legal cap. Under the Tenant Fees Act 2019, excess deposits must be returned before Section 21 is valid."

**Legal Basis:** Tenant Fees Act 2019, Section 3

**Deposit Cap Calculation:**
- Annual rent £50,000 or less: **5 weeks' rent**
- Annual rent over £50,000: **6 weeks' rent**

**Resolution Steps:**
1. Calculate the legal cap: `(weekly rent) × 5` or `(weekly rent) × 6`
2. If deposit exceeds cap, refund the excess to tenant
3. Document the refund (bank transfer preferred)
4. Update wizard to confirm excess returned

**Common User Questions:**
- Q: "How do I calculate weekly rent?" A: Divide monthly rent by 4.33, or annual rent by 52
- Q: "What if I already returned the excess?" A: Select "Yes" for deposit reduced to legal cap

---

#### `s21_four_month_bar`

**Error Message:** "Section 21 cannot be served within the first four months of the tenancy."

**Legal Basis:** Housing Act 1988, Section 21(4B)

**Resolution:**
- Wait until day 121 of the tenancy to serve the notice
- Check the tenancy start date is correct

**Important Notes:**
- The 4-month bar applies to the SERVICE date, not the expiry date
- Renewal tenancies: the bar runs from the original tenancy start date

---

#### `s21_notice_period_short`

**Error Message:** "Expiry date is earlier than the statutory two-month minimum."

**Legal Basis:** Housing Act 1988, Section 21(4)

**Resolution:**
- Ensure expiry date is at least 2 months after service date
- For periodic tenancies, align expiry with the end of a rental period

---

#### `s21_licensing_required_not_licensed`

**Error Message:** "Licensing compliance issue - confirm property licensing status before serving Section 21."

**Legal Basis:** Housing Act 2004, Section 75 (HMO) and Section 98 (Selective)

**Resolution Steps:**
1. Check if property is in selective licensing area (council website)
2. If licensing required, apply for and obtain licence
3. Update wizard with correct licensing status

**Escalation:** If user disputes licensing requirement, advise checking with local council directly

---

#### `s21_retaliatory_improvement_notice` / `s21_retaliatory_emergency_action`

**Error Message:** "Section 21 notice is INVALID while an improvement/emergency notice is in effect."

**Legal Basis:** Deregulation Act 2015, Section 33

**Resolution:**
- Wait 6 months from when the notice was served
- Ensure all required works are completed
- Document compliance with local authority requirements

**IMPORTANT:** These are HIGH PRIORITY escalations. The notice is legally invalid if served during the restriction period. Advise user to wait or seek legal advice.

---

### England Section 8

#### `s8_notice_period_short`

**Error Message:** "Notice period issue - expiry date must meet statutory minimum for selected grounds."

**Legal Basis:** Housing Act 1988, Schedule 2

**Notice Periods by Ground:**
- Grounds 1, 2, 5, 6, 7, 9, 16: **2 months**
- Grounds 3, 4, 8, 10, 11, 12, 13, 14, 15, 17: **2 weeks**
- Ground 7A (anti-social behaviour): **Immediate**
- Ground 7B: **4 weeks**
- Ground 14A (domestic abuse): **2 weeks**

**Resolution:** Set expiry date to meet the longest required period for selected grounds

---

### Wales Section 173

#### `s173_notice_period_short`

**Error Message:** "Wales Section 173 requires minimum 6 months notice period."

**Legal Basis:** Renting Homes (Wales) Act 2016, Section 173

**Resolution:**
- Expiry date must be at least 6 months after service
- This is significantly longer than England's 2-month minimum

---

#### `s173_deposit_not_protected`

**Error Message:** "Wales Section 173 notice is invalid without deposit protection."

**Legal Basis:** Renting Homes (Wales) Act 2016; Deposit Schemes Regulations

**Approved Schemes for Wales:**
- Deposit Protection Service (DPS)
- MyDeposits
- Tenancy Deposit Scheme (TDS)

**Resolution:**
1. Protect deposit in approved scheme
2. Serve prescribed information to contract holder
3. Confirm protection in wizard

---

#### `s173_written_statement_missing`

**Error Message:** "Wales law requires a written statement of occupation contract to be provided."

**Legal Basis:** Renting Homes (Wales) Act 2016, Section 31

**Note:** This is a WARNING, not a blocker. User can proceed but should be aware.

**Resolution:** Provide written statement to contract holder if not already done

---

### Scotland Notice to Leave

#### `ntl_landlord_not_registered`

**Error Message:** "Scotland requires landlord registration number for Notice to Leave."

**Legal Basis:** Antisocial Behaviour etc. (Scotland) Act 2004, Part 8

**Registration Website:** landlordregistrationscotland.gov.uk

**Resolution:**
1. Register with Scottish Landlord Register
2. Wait for registration to be processed (5-10 working days)
3. Enter registration number in wizard

**Consequences of Unregistered Status:**
- Criminal offence to let property without registration
- Notice may be invalid

---

#### `ntl_pre_action_letter_not_sent`

**Error Message:** "Pre-action letter must be sent before Ground 1 Notice to Leave."

**Legal Basis:** Rent Arrears Pre-Action Requirements (Coronavirus) (Scotland) Regulations

**Resolution:**
1. Send pre-action letter to tenant
2. Letter must give at least 28 days' notice
3. Include arrears amount and payment information
4. Wait for 28-day period to expire
5. Keep evidence of posting/delivery

---

#### `ntl_pre_action_signposting_missing`

**Error Message:** "Pre-action requirements include signposting tenant to debt advice services."

**Legal Basis:** Pre-Action Requirements Regulations

**Recommended Organisations to Include:**
- Citizens Advice Scotland: 0800 028 1456
- National Debtline: 0808 808 4000
- StepChange: 0800 138 1111

---

#### `ntl_ground_1_arrears_threshold`

**Error Message:** "Ground 1 typically requires 3 or more months arrears for tribunal to grant possession."

**Note:** This is a WARNING. Ground 1 is technically valid with any arrears, but tribunals typically expect substantial arrears.

**Guidance:** User may proceed but should be aware possession may not be granted with low arrears

---

#### `ntl_deposit_not_protected`

**Error Message:** "Deposit must be protected before serving Notice to Leave."

**Legal Basis:** Tenancy Deposit Schemes (Scotland) Regulations 2011

**Approved Schemes for Scotland:**
- SafeDeposits Scotland
- MyDeposits Scotland
- Letting Protection Service Scotland

---

## Escalation Categories

### High Priority (Response within 2 hours)

- Retaliatory eviction blocks (`s21_retaliatory_*`)
- Multiple properties affected by same issue
- User claims they have completed steps but blocker persists

### Medium Priority (Response within 4 hours)

- Deposit protection issues
- Landlord registration issues
- Pre-action requirements questions
- Licensing disputes

### Low Priority (Response within 8 hours)

- Notice period calculations
- Timing/date adjustments
- Written statement requirements
- General how-to questions

---

## Common User Questions

### General

**Q: Why am I suddenly seeing these blockers?**
A: Phase 13 introduced additional legal compliance checks. These rules have always been legal requirements but were not previously validated by the system.

**Q: Can I override these blockers?**
A: No. Blockers indicate legal requirements that must be met before a valid notice can be served. Proceeding would result in an invalid notice.

**Q: The rules are wrong for my situation.**
A: If you believe the rule is incorrectly applied, please provide details. We can review whether there's a data entry issue or system bug.

### Deposits

**Q: My deposit was taken before the Tenant Fees Act.**
A: The deposit cap applies to AST tenancies starting on or after 1 June 2019. If your tenancy started before this date, the cap may not apply. Please verify your tenancy start date.

**Q: I returned the excess deposit but the blocker persists.**
A: Ensure you have selected "Yes" for the question about whether excess deposit has been returned. If you have and the blocker persists, please escalate.

### Timing

**Q: Can I backdate the service date?**
A: No. The service date should be the actual date the notice is/was served. Backdating could make the notice invalid.

**Q: My tenancy is over 4 months old but I'm still blocked.**
A: Check the tenancy start date in the wizard. If it's incorrect, update it. If correct and you're still blocked, please escalate.

---

## Troubleshooting Decision Tree

```
User reports Phase 13 blocker
│
├─ Is the blocker correctly applied?
│  │
│  ├─ YES → Guide user through resolution steps
│  │        (see Rule Details section)
│  │
│  └─ NO → Possible causes:
│          ├─ Incorrect data entry → Have user verify/correct
│          ├─ System bug → Escalate to development
│          └─ Rule interpretation dispute → Escalate to legal review
│
├─ Has user completed resolution steps?
│  │
│  ├─ YES but blocker persists → Check:
│  │   ├─ Was the correct field updated?
│  │   ├─ Was the page refreshed/form resubmitted?
│  │   └─ If both yes → Escalate to development
│  │
│  └─ NO → Provide specific guidance for their rule
│
└─ Is this a warning (not a blocker)?
   │
   ├─ YES → User can proceed but should understand implications
   │
   └─ NO → User must resolve before proceeding
```

---

## Contact Information

- **Technical Support Email:** support@landlord-heaven.co.uk
- **Development Escalation:** dev-escalation@landlord-heaven.co.uk
- **Legal Review Requests:** legal@landlord-heaven.co.uk

---

## Appendix: Related Documentation

- [CUTOVER_PLAN.md](./CUTOVER_PLAN.md) - Full validation system cutover documentation
- [Phase 13 Message Catalog](../../config/validation/phase13-messages.yaml) - Standardized messaging
- [Eviction Rules YAML](../../config/legal-requirements/) - Rule definitions

---

*Document maintained by Engineering. Report errors or updates to dev-escalation@landlord-heaven.co.uk*
