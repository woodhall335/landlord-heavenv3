# Wizard Experience Audit Report
## Messaging, Capability, Trust & Value Communication

**Date:** 2026-01-27
**Audit Scope:** Notice Only, Eviction Complete Pack, Money Claim, Tenancy Agreements
**Overall Assessment:** **MOSTLY** - We are clearly communicating some value, but significant opportunities exist to surface our legal-grade capabilities.

---

## Executive Summary

After comprehensive analysis of the codebase, I found that **Landlord Heaven provides solicitor-grade legal protection that users do not realize they are getting**. The system enforces complex, jurisdiction-specific legal rules in ways that generic form builders cannot, but this value is largely implicit.

### Key Findings

| Area | Current State | Opportunity |
|------|---------------|-------------|
| **Legal Validation** | Sophisticated - 15+ England S21 rules, 6+ Wales S173 rules, 8+ Scotland NTL rules | Under-communicated |
| **Jurisdiction Routing** | Automatic, rule-based | Silent to user |
| **Document Analysis** | Active for Complete Pack (England only) | Not extended to other products |
| **Cost Savings Messaging** | Landing page only | Missing in wizard journey |
| **"Why Us vs DIY" Messaging** | Minimal | Major gap |

### The Fundamental Problem

We have built **solicitor-grade validation** but present ourselves like a **form builder**. Users filling out the wizard have no idea that:
- We're checking 20+ legal preconditions before allowing document generation
- We calculate notice periods using jurisdiction-specific legislation
- We enforce deposit caps under the Tenant Fees Act 2019
- We block retaliatory eviction scenarios automatically
- We verify Ground 8 arrears thresholds at hearing date

---

## Section A: Capability Truth Map

### A.1 Notice Only Product

#### Legal Validation Performed
| Validation | File Reference | What It Does |
|------------|----------------|--------------|
| Deposit protection check | `src/lib/decision-engine/engine.ts:351-360` | Validates deposit is protected in government scheme |
| Prescribed information check | `src/lib/decision-engine/engine.ts:363-369` | Ensures tenant received deposit info within 30 days |
| Gas safety certificate | `src/lib/decision-engine/engine.ts:373-383` | Verifies CP12 provided at tenancy start |
| EPC rating check | `src/lib/decision-engine/engine.ts:386-393` | Validates EPC provided with minimum rating E |
| How to Rent guide | `src/lib/decision-engine/engine.ts:396-403` | Ensures How to Rent guide served |
| HMO/selective licensing | `src/lib/decision-engine/engine.ts:406-416` | Blocks S21 for unlicensed HMOs |
| Tenant Fees Act compliance | `src/lib/decision-engine/engine.ts:419-425` | Checks no prohibited fees charged |
| Retaliatory eviction check | `src/lib/decision-engine/engine.ts:428-436` | Blocks if within 6 months of tenant complaint |
| Four-month bar | `config/validation/phase13-messages.yaml:39-52` | Prevents S21 in first 4 months of tenancy |
| Deposit cap calculation | `config/validation/phase13-messages.yaml:23-37` | Enforces 5/6 week deposit limit per TFA 2019 |

#### Jurisdiction-Specific Logic
- **England:** Section 21 + Section 8 routes, Housing Act 1988 compliance
- **Wales:** Section 173 (6-month minimum notice), Renting Homes (Wales) Act 2016 compliance
- **Scotland:** Notice to Leave, PRT grounds, landlord registration requirement

#### What a Generic Form Builder Would NOT Do
1. Calculate whether arrears meet Ground 8 threshold at projected hearing date
2. Block document generation for unprotected deposits
3. Know that Wales requires 6 months notice vs England's 2 months
4. Enforce the four-month bar on new tenancies
5. Check for retaliatory eviction scenarios
6. Calculate correct notice expiry dates for periodic vs fixed tenancies

---

### A.2 Eviction Complete Pack

#### Legal Validation Performed
All Notice Only validations PLUS:

| Validation | File Reference | What It Does |
|------------|----------------|--------------|
| Ground eligibility scoring | `src/lib/decision-engine/engine.ts:194-213` | Calculates success probability per ground |
| Section 21 vs Section 8 recommendation | `src/lib/decision-engine/engine.ts:546-573` | Recommends optimal legal route |
| Evidence requirements by ground | `src/lib/decision-engine/engine.ts:237-274` | Lists required evidence per ground |
| Ground-specific red flag detection | `src/lib/decision-engine/engine.ts:279-311` | Warns of Ground 1 notice issues, G8 threshold risks |
| Court form selection | `config/legal-requirements/england/section_21.yaml` | Auto-selects N5, N119, N5b forms |
| Witness statement generation | `src/lib/documents/witness-statement-sections.ts` | Generates deterministic court-ready statements |
| Smart Review document analysis | `src/lib/evidence/smart-review/orchestrator.ts` | AI-compares uploaded documents vs wizard facts |

#### Server-Side Enforcement Guarantees
- **Pre-generation validation** blocks documents if critical compliance fails
- **Compliance timing checks** prevent serving invalid notices
- **Ground 8 arrears recalculation** at multiple stages

---

### A.3 Money Claim Product

#### Legal Validation Performed
| Validation | File Reference | What It Does |
|------------|----------------|--------------|
| Pre-Action Protocol (PAP) compliance | `src/components/wizard/money-claim/PreActionSection.tsx:32` | Ensures PAP-DEBT letter sent |
| Arrears schedule calculation | `src/lib/arrears-engine.ts` | Calculates exact arrears with interest |
| Interest calculation | Review page line 496-498 | 8% statutory interest if opted in |
| Enforcement preference tracking | Money claim flow | Records bailiff/wage attachment preference |
| Timeline validation | Timeline section | Validates events are in correct order |

---

### A.4 Tenancy Agreements

#### Jurisdiction-Specific Terminology Applied
| Jurisdiction | Agreement Type | Governing Legislation |
|--------------|----------------|----------------------|
| England | Assured Shorthold Tenancy (AST) | Housing Act 1988 |
| Wales | Occupation Contract | Renting Homes (Wales) Act 2016 |
| Scotland | Private Residential Tenancy (PRT) | Private Housing (Tenancies) (Scotland) Act 2016 |
| Northern Ireland | Private Tenancy | Private Tenancies (NI) Order 2006 |

#### Legal Compliance Features
- Deposit cap enforcement (5/6 weeks)
- Required prescribed information inclusion
- Jurisdiction-appropriate break clause handling
- Premium tier upsell with enhanced clauses

---

## Section B: "Why Use Us" Messaging Audit

### B.1 Landing Page (`src/components/landing/CostComparison.tsx`)

#### Currently Communicated
- Price comparison: "Save 80%+ on Legal Fees"
- Speed: "Instant download — get documents in minutes"
- Availability: "24/7 — including evenings & weekends"
- Cost anchoring: £39.99 vs £200-300 solicitor

#### What's Missing
- **No mention of legal validation** - we just look like a PDF generator
- **No differentiation from form builders** like JotForm, Typeform
- **No mention of jurisdiction intelligence**

#### Recommended Single Sentence
> "Unlike form builders, we validate 20+ legal requirements before generating court-ready documents — the same checks a solicitor would perform."

---

### B.2 Wizard Entry/First Step

#### Currently Communicated
From `WizardContainer.tsx:164`:
> "Hi! I'm here to help you create the right eviction documents for {jurisdiction}. I'll ask you some questions to understand your situation, then recommend the best legal route and generate court-ready documents."

#### What's Implicit (Not Explicit)
- "Recommend the best legal route" is mentioned but not explained
- No mention of what legal checks we perform
- No mention of cost savings at this point

#### What's Missing
- Why the user should answer truthfully (to protect their case)
- What happens if they get it wrong with a solicitor vs with us
- Confidence builders ("Used by 10,000+ landlords")

#### Recommended Addition
> "I'll check your case against {jurisdiction} housing law before generating anything — if there's a compliance issue, I'll catch it now, not when you're in court."

---

### B.3 Complex Legal Sections (S21 Compliance, Ground Selection)

#### Current State: SIGNIFICANTLY UNDER-MESSAGED

The wizard asks critical questions like:
- "Is the deposit protected?"
- "Was the How to Rent guide served?"
- "Has the tenant complained about disrepair?"

But it does NOT tell users:
- **Why** this matters (e.g., "Answering 'No' means Section 21 is unavailable")
- **What law** requires this
- **What could go wrong** if they guess

#### Example from `StructuredWizard.tsx:2805`:
> "Section 21 has strict compliance requirements. If you have grounds for possession..."

This is vague. Users need specific, actionable legal context.

#### Recommended Pattern
For each compliance question, show:
```
[ Why This Matters ]
An unprotected deposit invalidates your Section 21 notice. Courts routinely
dismiss cases for this reason. If unsure, check with DPS/TDS/MyDeposits.

Legal Reference: Housing Act 2004, s.213-214
```

---

### B.4 Review / Smart Review Page

#### Currently Communicated
From `src/app/wizard/review/page.tsx`:
- Case strength widget (bands: strong, moderate, weak)
- "Court-ready" / "Not court-ready yet" badges
- Blocking issues list
- Smart Review warnings (for Complete Pack)

#### What's Explicit
- List of blocking issues with "How to fix" steps
- Legal references in Phase 13 messages

#### What's Implicit
- How much time this analysis would take with a solicitor
- What these checks are worth in £ terms
- That we're doing continuous legal monitoring, not just form filling

#### What's Missing
- **Value summary box**: "We checked 14 legal requirements. 12 passed, 2 need attention."
- **Time saved callout**: "Estimated 2-3 hours of solicitor review time saved"
- **Confidence builder**: "These checks match what a property solicitor would review"

---

### B.5 Checkout Page

#### Currently Communicated
From `cta-mapper.ts`:
- Prices (£39.99 / £149.99 / £99.99)
- Product labels ("Start Notice Only", etc.)

#### What's Missing at the Critical Conversion Moment
1. **No reminder of value delivered** — user has forgotten the 20 checks we ran
2. **No solicitor comparison** — landing page says "Save £160+" but checkout doesn't
3. **No trust reinforcement** — no testimonials, no guarantee reminder
4. **No urgency/relevance** — no "Your case is ready to file"

#### Recommended Checkout Summary Box
```
Your Complete Eviction Pack includes:
✓ Section 8 Notice (Ground 8, Ground 10)
✓ Court form N5 (pre-filled)
✓ Witness statement template
✓ 14 legal compliance checks passed

A solicitor would charge £1,500-2,500 for this.
You pay: £149.99

[Download Now]
```

---

## Section C: Trust & Legal Grounding Audit

### C.1 Where Validation Could Be Reframed as Reassurance

| Current Framing | Better Framing |
|-----------------|----------------|
| "Error: Deposit not protected" | "We caught this: Your deposit isn't protected, which would invalidate a Section 21 notice. Here's how to fix it..." |
| "Notice period too short" | "Your notice would be invalid if served today. We've calculated the earliest valid date: {date}" |
| "Four-month bar applies" | "Housing Act 1988 prevents Section 21 during the first 4 months. You can serve from {date}." |

### C.2 Where Legal References Could Build Confidence

The Phase 13 messages (`config/validation/phase13-messages.yaml`) already include excellent `legalRef` fields:
- `"Tenant Fees Act 2019, Section 3"`
- `"Housing Act 1988, Section 21(4B)"`
- `"Renting Homes (Wales) Act 2016, Section 173"`

**BUT these are not shown prominently in the UI.**

#### Recommendation
Show legal references inline during the wizard, not just in error messages:
```
[ Deposit Question ]
"Is the deposit protected in a government-approved scheme?"

Legal context: Section 21 requires deposit protection within 30 days.
(Housing Act 2004, s.213-214)
```

### C.3 Where Jurisdiction Routing Could Be Made Explicit

Currently, jurisdiction routing is **invisible** to users. The system silently:
- Loads different MQS YAML files
- Applies different validation rules
- Generates different document types

**Users should see this happening.** Example:
```
[ Jurisdiction Detected: Wales ]
Because your property is in Wales, we're using the Renting Homes (Wales) Act 2016.
This means:
• 6-month minimum notice period (vs 2 months in England)
• "Occupation Contract" terminology (not "tenancy agreement")
• Section 173 notice format required
```

### C.4 Avoiding Incorrect Legal Advice Implications

The codebase correctly avoids making legal promises:

From `src/lib/evidence/warnings.ts:521-536`:
```typescript
const FORBIDDEN_PHRASES = [
  'invalid',
  'guarantee',
  'court will',
  'legal advice',
  'legally',
  'will be rejected',
  ...
];
```

This is good. The Smart Review panel correctly uses language like:
- "Possible mismatch"
- "Could not verify"
- "This is an automated check"

**No changes needed here** — the safe language policy is well-implemented.

---

## Section D: Document Analysis Audit

### D.1 How Document Analysis Currently Works (Money Claim/Complete Pack)

#### Architecture
```
Evidence Bundle → Orchestrator → Classification → Extract → Compare → Warnings
     ↓                              ↓
  Upload PDFs              Text vs Vision routing
```

#### Key Files
- `src/lib/evidence/smart-review/orchestrator.ts` — Main pipeline
- `src/lib/evidence/smart-review/classify.ts` — Document classification
- `src/lib/evidence/smart-review/text-extract.ts` — PDF text extraction
- `src/lib/evidence/smart-review/vision-extract.ts` — OCR via Vision API
- `src/lib/evidence/smart-review/compare.ts` — Fact comparison engine
- `src/lib/evidence/warnings.ts` — Warning taxonomy

#### Inputs
- Uploaded documents (PDF, images)
- Wizard-entered facts
- Evidence bundle metadata

#### Outputs
- `SmartReviewWarning[]` with codes like:
  - `FACT_MISMATCH_LANDLORD_NAME`
  - `FACT_MISMATCH_TENANT_NAME`
  - `FACT_MISMATCH_RENT_AMOUNT`
  - `UPLOAD_MISSING_CATEGORY_TENANCY_AGREEMENT`

#### Current Limitations
1. **Only enabled for `complete_pack` and `eviction_pack`** (`orchestrator.ts:761-770`)
2. **Only enabled for England** (`orchestrator.ts:773-781`)
3. **Max 10 files, 3 pages per PDF** (cost control)
4. **30-second throttle between runs**

### D.2 User Experience Today

Users see the `SmartReviewPanel` component on the Review page:
- Collapsible panel with warning count
- Filter by severity (Blocker, Warning, Info)
- Comparison view showing "Your Answer" vs "Found in Document"
- Suggested actions per warning

The UX is well-designed but **users may not understand the value** because there's no messaging explaining that we're doing AI-powered document analysis.

### D.3 Can Document Analysis Be Extended to Notice Only?

**Yes, with modifications.**

#### What Would Be Required

1. **Enable product flag** (`orchestrator.ts:761-770`)
   ```typescript
   const supportedProducts = ['complete_pack', 'eviction_pack', 'notice_only'];
   ```

2. **Add relevant warning codes** (`warnings.ts`)
   - Notice-specific codes already exist for deposit protection, EPC, gas safety
   - Would need to add: `FACT_MISMATCH_NOTICE_EXPIRY_DATE`, `FACT_MISSING_NOTICE_SERVICE_PROOF`

3. **Update comparison config** (`compare.ts`)
   - Add notice-specific fact paths to compare

4. **Extend to other jurisdictions**
   - Wales and Scotland have different document requirements
   - Would need jurisdiction-specific comparison configs

#### UX Surfaces That Already Exist
- `SmartReviewPanel` — Already works for any product
- Evidence upload component — Already in notice_only flow
- Review page — Already handles notice_only cases

### D.4 Suggested Rollout Strategy

| Phase | Scope | Risk | Timeline |
|-------|-------|------|----------|
| **Pilot** | Enable for notice_only England only, warning-only (no blockers) | Low | 1-2 weeks |
| **Validation** | Monitor false positive rate, user feedback | Low | 2-4 weeks |
| **Expand** | Add Wales, Scotland; promote warnings to blockers if FP rate <5% | Medium | 4-8 weeks |
| **Full** | Enable for all products, all jurisdictions | Medium | 8-12 weeks |

---

## Section E: Recommendations

### P0: High-Impact Messaging Fixes (Copy Only)

| ID | Location | Current | Recommended | Why |
|----|----------|---------|-------------|-----|
| **P0-1** | Wizard entry (`WizardContainer.tsx:164`) | "I'll recommend the best legal route" | "I'll check your case against 20+ legal requirements before generating documents — if something would invalidate your notice, I'll catch it now" | Sets expectation that we're doing real legal work |
| **P0-2** | Review page header | "Case Analysis" | "Legal Compliance Check Complete: {X} requirements verified" | Quantifies the value we delivered |
| **P0-3** | Checkout page | Price only | Add: "A property solicitor would charge £{X}-£{Y} for this level of review. You pay: £{price}" | Anchors value at decision point |
| **P0-4** | Compliance questions | Question only | Add inline: "Why this matters: {consequence}. Legal basis: {statute}" | Educates user during input |
| **P0-5** | Trust bar | "Court-Ready Guarantee" | "Court-Ready Guarantee: We check the same requirements a property solicitor would verify" | Explains what the guarantee means |

### P1: Small UX Changes to Surface Value

| ID | Location | Change | Why | Risk |
|----|----------|--------|-----|------|
| **P1-1** | Review page | Add "Checks Performed" summary box showing pass/fail count | Users see the work we did | Low |
| **P1-2** | Jurisdiction selection | Show "Because your property is in {jurisdiction}, we'll use {law}" explainer | Surfaces jurisdiction intelligence | Low |
| **P1-3** | Blocking issue display | Reframe errors as "We caught this issue" with legal reference | Converts frustration to gratitude | Low |
| **P1-4** | Notice date picker | Show "Earliest valid date: {date}" with legal basis | Demonstrates calculation value | Low |
| **P1-5** | Ground recommendation | Add "Why we recommend Ground {X}" with success probability | Shows decision engine value | Medium |

### P2: Feature Extensions

| ID | Feature | Scope | Why | Risk |
|----|---------|-------|-----|------|
| **P2-1** | Extend Smart Review to notice_only | Enable document analysis for notice-only product | High user value, catches AST mismatches | Medium |
| **P2-2** | Add Scotland/Wales to Smart Review | Expand jurisdiction support | Larger market coverage | Medium |
| **P2-3** | "Legal Confidence Score" badge | Show 0-100 score based on compliance checks | Gamifies compliance, creates urgency to fix issues | Medium |
| **P2-4** | Progress comparison emails | "Your case: 85% ready. Fix 2 issues to reach 100%" | Re-engagement for abandoned carts | Low |
| **P2-5** | Ask Heaven integration messaging | When AI assists, show "Ask Heaven reviewed your case" | Surfaces AI value | Low |

---

## Appendix: Key File References

| Component | File | Lines of Interest |
|-----------|------|-------------------|
| Decision Engine | `src/lib/decision-engine/engine.ts` | 32-110 (analyzeCase), 320-457 (S21 checks) |
| Phase 13 Messages | `config/validation/phase13-messages.yaml` | All — jurisdiction-specific legal messaging |
| Smart Review Orchestrator | `src/lib/evidence/smart-review/orchestrator.ts` | 322-720 (main pipeline) |
| Smart Review Warnings | `src/lib/evidence/warnings.ts` | 52-102 (warning codes), 154-420 (templates) |
| Smart Review Panel UI | `src/components/wizard/SmartReviewPanel.tsx` | 93-264 (component rendering) |
| Review Page | `src/app/wizard/review/page.tsx` | 55-442 (main logic) |
| Cost Comparison | `src/components/landing/CostComparison.tsx` | 36-178 (solicitor comparison) |
| CTA Mapper | `src/lib/checkout/cta-mapper.ts` | 31-133 (pricing and routing) |
| Notice Only Flow | `src/components/wizard/flows/NoticeOnlySectionFlow.tsx` | Full file |
| Eviction Flow | `src/components/wizard/flows/EvictionSectionFlow.tsx` | Full file |

---

## Conclusion

Landlord Heaven has built a sophisticated, solicitor-grade legal validation system. The technical implementation is strong. The gap is in **communication**:

1. **Users don't know we're doing real legal work** — we look like a form builder
2. **Value is front-loaded on landing page, absent during journey** — checkout has no value reminder
3. **Legal context is hidden** — users don't see why questions matter
4. **Document analysis is siloed** — only Complete Pack England benefits

The recommendations in Section E can be implemented incrementally, starting with P0 copy changes that require no code modifications. P1 and P2 items would further differentiate us from generic alternatives and build the trust that converts browsers into buyers.

**Bottom line:** We have the capability of a solicitor. We need to communicate like one.
