# Wizard Question Audit - 21 April 2026

## Scope
- Public England product flows reviewed:
  - `Eviction Notice Generator (Section 8, May 2026)`
  - `Complete Eviction Pack`
  - `Money Claim Pack`
  - `Section 13 Rent Increase Pack`
  - `Section 13 Defence Pack`
  - England tenancy agreement flows
- Audit lens:
  - Does the wizard ask the right questions for the active public product?
  - Do those answers cover the downstream document dependencies?
  - Are any sections too loose, too late, or too generic for the outputs they feed?

## Overall View
- `Notice Only`: strong and now aligned to the post-1 May 2026 England route.
- `Complete Pack`: strong after the England Section 21 cleanup, but evidence collection is still too loose for a premium court-ready promise.
- `Money Claim`: broadly strong, but one important dependency is under-enforced.
- `Section 13 Standard / Defence`: structurally strong, but one proposal-stage dependency is under-enforced and the Defensive evidence journey is still optional too late in the flow.
- `Tenancy flows`: strong on exact standalone product flows; weaker on the generic tenancy wizard because the deposit path still assumes a deposit is always taken.

## Product-by-Product Audit

### 1. Eviction Notice Generator (Section 8, May 2026)
**Wizard path**
- `CaseBasicsSection`
- `PartiesSection`
- `PropertySection`
- `TenancySection`
- `NoticeSection`
- `ReviewSection`

**Downstream outputs**
- `Form 3A notice`
- `Service Instructions`
- `Service & Validity Checklist`
- `Pre-Service Compliance Declaration`
- `Rent Schedule / Arrears Statement`

**Dependency coverage**
- `section8_grounds` feeds the notice wording and notice-period logic.
- `notice_served_date` and `notice_service_method` feed service and validity support documents.
- arrears items / arrears totals feed the arrears statement and the rent-ground support.
- landlord / tenant / property / tenancy facts feed the official Form 3A and the support guidance.

**Assessment**
- `Status: Good`
- The active England public flow now asks the right core questions for the current notice-stage pack.
- The product boundary is now clean: no live England `Section 21`, no `N5`, no `N119`, no `PCOL` framing in Notice Only.

**Residual risk**
- Low.
- There is no major missing question in the active public England notice path.

### 2. Complete Eviction Pack
**Wizard path**
- `CaseBasicsSection`
- `PartiesSection`
- `PropertySection`
- `TenancySection`
- `NoticeSection`
- `Section8ArrearsSection`
- `EvidenceSection`
- `CourtSigningSection`
- `ReviewSection`

**Downstream outputs**
- `Form 3A notice`
- `Form N5`
- `Form N119`
- `Schedule of Arrears`
- `Evidence Collection Checklist`
- `Proof of Service Certificate`
- `Witness Statement`
- `Court Bundle Index`
- `Hearing Checklist`
- `Arrears Engagement Letter`
- `Eviction Case Summary`

**Dependency coverage**
- `notice` and `section8_grounds` feed the notice, witness statement, case summary, and court forms.
- parties / property / tenancy / signing feed `N5`, `N119`, the witness statement, and case summary.
- arrears facts feed the schedule, particulars, witness statement, and engagement letter.
- evidence and service facts feed the bundle index, checklist, and proof-of-service template.

**Assessment**
- `Status: Good, with one workflow weakness`
- After the England cleanup, the public complete-pack flow now asks the right notice-stage and court-stage questions.
- The pack split is now commercially and legally coherent.

**Residual risk**
- `EvidenceSection` is still too broad for the promise of a court-ready pack.
- Current completion is effectively: uploaded something, or marked evidence reviewed.
- That is weaker than the downstream dependency chain:
  - witness statement quality
  - proof-of-service support
  - court bundle index usefulness
  - hearing prep completeness

**Recommended next fix**
- Add structured evidence prompts for the public England complete-pack path:
  - tenancy agreement
  - rent ledger / arrears proof
  - service proof
  - correspondence
  - compliance / licence documents where relevant

### 3. Money Claim Pack
**Wizard path**
- `Claimant`
- `Defendant`
- `Tenancy`
- `Claim Details`
- `Arrears`
- `Damages`
- `Claim Statement`
- `Pre-Action`
- `Evidence`
- `Review`

**Downstream outputs**
- `Particulars of claim`
- `Schedule of arrears`
- `Interest calculation`
- `Letter Before Claim`
- `Information Sheet for Defendants`
- `Reply Form`
- `Financial Statement Form`
- `Money Claims Filing Guide`
- `Enforcement Guide`
- `Form N1`

**Dependency coverage**
- claimant / defendant / tenancy facts feed `N1`, particulars, and the pre-action documents.
- arrears items feed the schedule, particulars, and claim totals.
- damages items feed particulars and claim totals.
- `charge_interest` and `interest_start_date` feed the interest calculation.
- `basis_of_claim` feeds the particulars and claim narrative.
- pre-action answers feed the letter-before-claim path and protocol framing.

**Assessment**
- `Status: Mostly good, but not tight enough on one key dependency`

**Concrete issue**
- `ClaimStatementSection` correctly collects `basis_of_claim`, but validation only warns if it is missing.
- That is too weak for the dependency chain because:
  - the `Particulars of claim` depend on it
  - the `N1` narrative quality depends on it
  - the commercial quality of the pack drops sharply if the wizard allows a weak or empty claim narrative

**Recommended next fix**
- Make `money_claim.basis_of_claim` blocking, not just a warning, before the claim can be treated as complete.

**Secondary risk**
- The evidence step is also broad and optional in the same way as Complete Pack.
- For a premium money-claim experience, it should encourage structured proof:
  - tenancy agreement
  - rent ledger
  - invoices / receipts
  - photos / damage proof
  - guarantor / correspondence material where relevant

### 4. Section 13 Rent Increase Pack
**Wizard path**
- `tenancy`
- `landlord`
- `proposal`
- `charges`
- `comparables`
- `adjustments`
- `preview`
- `outputs`

**Downstream outputs**
- `Form 4A rent increase notice`
- `Rent increase justification report`
- `Proof of service record`
- `Rent increase cover letter`

**Dependency coverage**
- tenancy and landlord facts feed `Form 4A`, the report, the cover letter, and service record.
- proposal facts feed rent amount, service date, proposed start date, and service logic.
- comparables and adjustments feed the justification report and market-rent reasoning.

**Assessment**
- `Status: Strong, but one proposal dependency is under-enforced`

**Concrete issue**
- Step completion for `proposal` currently requires:
  - `proposedRentAmount`
  - `serviceDate`
  - `proposedStartDate`
- It does **not** require `serviceMethod`.
- That is too loose because the downstream outputs include:
  - `Proof of service record`
  - service framing in the cover letter
  - service context around the Form 4A pack

**Recommended next fix**
- Require `proposal.serviceMethod` before the proposal step is considered complete.

### 5. Section 13 Defence Pack
**Wizard path**
- same core wizard as Standard, with paid Defensive outputs and tribunal-bundle tools

**Downstream outputs**
- `Form 4A rent increase notice`
- `Rent increase justification report`
- `Tribunal Argument Summary`
- `Proof of service record`
- `Rent increase cover letter`
- `Tribunal defence guide`
- `Landlord response template`
- `Tribunal legal briefing`
- `Evidence checklist`
- `Negotiation email template`
- `Merged tribunal bundle PDF`
- `Tribunal bundle ZIP`

**Dependency coverage**
- all Standard dependencies apply
- comparables and adjustments feed the defence narrative
- uploaded evidence feeds the tribunal bundle and exhibit structure

**Assessment**
- `Status: Strong, but evidence comes in late`

**Concrete issue**
- Defensive bundle evidence is available in the outputs area after payment, but the wizard does not strongly front-load the evidence dependency.
- That is acceptable technically, but weaker than the premium tribunal-ready promise.

**Recommended next fix**
- Add a more explicit pre-output evidence readiness gate for Defensive:
  - not necessarily blocking payment
  - but clearly showing the user what they still need for a strong bundle

### 6. England Tenancy Agreement Flows
There are two different realities here.

#### A. Generic tenancy wizard (`TenancySectionFlow`)
**Assessment**
- `Status: Good on reform checks, but not fully flexible on deposits`

**Strengths**
- It asks the right broad England questions:
  - product tier
  - property
  - landlord
  - tenants
  - tenancy
  - rent
  - deposit
  - bills
  - compliance
  - premium terms
- It already contains important post-1 May 2026 England checks:
  - deposit cap
  - no more than one month rent in advance
  - no bidding above advertised rent
  - no “children / benefits” discrimination

**Concrete issue**
- The generic deposit step still assumes a deposit is always part of the flow:
  - completeness requires `deposit_amount`
  - completeness also requires `deposit_scheme_name`
- That is too rigid for no-deposit lets and weaker than the exact standalone tenancy flows.

**Recommended next fix**
- Add an explicit no-deposit branch to the generic tenancy wizard.

#### B. Exact England standalone tenancy products (`ResidentialStandaloneSectionFlow`)
**Assessment**
- `Status: Strongest tenancy question coverage in the repo`

**Why**
- These exact flows have product-specific required facts and completion rules.
- They already support the no-deposit pattern more cleanly:
  - `deposit_amount` can be `0`
  - `deposit_scheme_name` is only required when a deposit is actually taken
- They also enforce product-specific dependencies for:
  - Premium
  - Student
  - HMO / Shared House
  - Lodger

**Conclusion**
- The exact tenancy flows are stronger than the generic tenancy wizard for downstream document quality.

## Highest-Priority Issues
### P1
1. `Money Claim Pack`
   - Make `basis_of_claim` blocking, not warning-only.
2. `Section 13 Standard / Defence`
   - Require `serviceMethod` in the proposal step.
3. `Generic Tenancy Wizard`
   - Add an explicit no-deposit branch.

### P2
1. `Complete Eviction Pack`
   - Replace broad evidence completion with structured evidence categories.
2. `Money Claim Pack`
   - Make evidence prompts more claim-type-specific.
3. `Section 13 Defence Pack`
   - Surface bundle-evidence readiness earlier in the flow.

## Dependency Notes
- `Notice Only` and `Complete Pack` now have the right England product split:
  - `Notice Only` = notice-stage only
  - `Complete Pack` = notice + court stage
- `Money Claim` is strongest where the wizard already knows the claim type, because that drives section visibility and output generation.
- `Section 13` depends heavily on:
  - comparable quality
  - service details
  - whether the Defensive evidence bundle is actually populated
- Exact tenancy products depend on product-specific completion rules in `standalone-flow-config.ts`; changes there affect both wizard completeness and final document confidence.

## Bottom Line
- The active public eviction products are now asking the right questions overall.
- The strongest remaining question-coverage gaps are:
  - `Money Claim` narrative gating
  - `Section 13` service-method gating
  - generic tenancy no-deposit handling
- If those three are fixed next, the public wizard set will be in a much stronger position both legally and commercially.
