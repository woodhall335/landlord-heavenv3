# Comprehensive Audit: Review Pages Across All Wizard Flows

**Date:** 2026-01-06
**Scope:** All review pages, inline review sections, and analysis endpoints

---

## 1. REVIEW PAGE MATRIX

| Product Type | Wizard Flow | Review Page? | Inline Review? | What It Shows | Destination |
|--------------|-------------|--------------|----------------|---------------|-------------|
| `complete_pack` (England) | EvictionSectionFlow | ✅ Yes | ✅ Yes | Full case analysis, decision engine, blocking issues, documents | `/wizard/review?case_id=X&product=complete_pack` |
| `complete_pack` (Wales) | EvictionSectionFlow | ✅ Yes | ✅ Yes | Same as England with Wales-specific notices | `/wizard/review?case_id=X&product=complete_pack` |
| `complete_pack` (Scotland) | StructuredWizard (legacy) | ✅ Yes | ❌ No | Notice to Leave, Form E, roadmap | `/wizard/review?case_id=X&product=complete_pack` |
| `notice_only` (England) | NoticeOnlySectionFlow | ❌ No | ✅ Inline only | Section completion, blockers/warnings, docs list | `/wizard/preview/{caseId}` (skips review) |
| `notice_only` (Wales) | NoticeOnlySectionFlow | ❌ No | ✅ Inline only | Same as England | `/wizard/preview/{caseId}` |
| `notice_only` (Scotland) | StructuredWizard (legacy) | ❌ No | ❌ No | Basic completion | `/wizard/preview/{caseId}` |
| `money_claim` (England) | MoneyClaimSectionFlow | ✅ Yes | ✅ Yes | PAP-DEBT analysis, claim summary, case health | `/wizard/review?case_id=X&product=money_claim` |
| `money_claim` (Wales) | MoneyClaimSectionFlow | ✅ Yes | ✅ Yes | Same as England | `/wizard/review?case_id=X&product=money_claim` |
| `sc_money_claim` (Scotland) | MoneyClaimSectionFlow | ✅ Yes | ✅ Yes | Simple Procedure Form 3A | `/wizard/review?case_id=X&product=money_claim` |
| `ast_standard` | TenancySectionFlow | ❌ No | ✅ Inline only | Basic review of information entered | `/wizard/preview/{caseId}` |
| `ast_premium` | TenancySectionFlow | ❌ No | ✅ Inline only | Same as standard | `/wizard/preview/{caseId}` |
| Tenancy (Scotland) | TenancySectionFlow | ❌ No | ✅ Inline only | PRT-specific terminology | `/wizard/preview/{caseId}` |
| Tenancy (NI) | TenancySectionFlow | ❌ No | ✅ Inline only | NI Private Tenancy | `/wizard/preview/{caseId}` |

---

## 2. DETAILED BREAKDOWN: EVICTION REVIEW PAGE

**File:** `src/app/wizard/review/page.tsx` → `EvictionReviewContent` component (lines 667-1065)

```
EVICTION REVIEW PAGE CONTENT:
├── Header
│   ├── Title: "Final Case Analysis"
│   ├── Jurisdiction label (England/Wales/Scotland/NI)
│   ├── Recommended route label
│   ├── Readiness badge (Court-ready / Not court-ready yet)
│   └── Case strength score (X/100) with band (strong/medium/weak)
│
├── Readiness Summary Card (blue)
│   ├── "What this means in practice"
│   └── Explanation of readiness status
│
├── Blocking Issues Card (red) - CONDITIONAL
│   ├── "Critical Issues Affecting Court Readiness"
│   ├── List of blocking issues from decision engine
│   └── Action required for each
│
├── Case Strength Widget
│   └── Visual score report from analysis
│
├── Legal Assessment Card
│   ├── Available routes (section_8, section_21, etc.)
│   │   └── Each route shown as badge
│   └── Recommended grounds
│       ├── Ground code and title
│       ├── Description
│       └── Type badge (mandatory/discretionary)
│
├── Things to Fix or Improve Card - CONDITIONAL
│   ├── Red flags list
│   └── Compliance issues list
│
├── Evidence & Documents Checklist Card
│   ├── Tenancy agreement (✓/⚠)
│   ├── Rent/arrears schedule (✓/⚠)
│   ├── Bank statements (✓/⚠)
│   └── Other supporting evidence (✓/⚠)
│
├── Documents to be Generated Card
│   ├── Route-specific notices (Form 3/Form 6A)
│   ├── Court forms (N5/N119/N5B)
│   └── Guidance documents
│
├── Warnings Card (yellow) - CONDITIONAL
│   └── Non-blocking warnings from decision engine
│
└── Action Buttons
    ├── "Go back & edit answers" → /wizard/flow
    └── "Proceed to payment & pack" → /wizard/preview/{caseId}
```

### Data Sources for Eviction Review:

| Field | Source |
|-------|--------|
| `jurisdiction` | `/api/wizard/analyze` → `analysis.jurisdiction` |
| `case_strength_score` | `/api/wizard/analyze` → `analysis.case_strength_score` |
| `case_strength_band` | `/api/wizard/analyze` → `analysis.case_strength_band` |
| `is_court_ready` | `/api/wizard/analyze` → `analysis.is_court_ready` |
| `readiness_summary` | `/api/wizard/analyze` → `analysis.readiness_summary` |
| `recommended_route` | `/api/wizard/analyze` → `analysis.recommended_route` |
| `recommended_route_label` | `/api/wizard/analyze` → `analysis.recommended_route_label` |
| `blocking_issues` | `/api/wizard/analyze` → `analysis.decision_engine.blocking_issues` |
| `recommended_routes` | `/api/wizard/analyze` → `analysis.decision_engine.recommended_routes` |
| `recommended_grounds` | `/api/wizard/analyze` → `analysis.decision_engine.recommended_grounds` |
| `red_flags` | `/api/wizard/analyze` → `analysis.red_flags` |
| `compliance_issues` | `/api/wizard/analyze` → `analysis.compliance_issues` |
| `evidence_overview` | `/api/wizard/analyze` → `analysis.evidence_overview` |
| `preview_documents` | `/api/wizard/analyze` → `analysis.preview_documents` |
| `warnings` | `/api/wizard/analyze` → `analysis.decision_engine.warnings` |
| `score_report` | `/api/wizard/analyze` → `analysis.score_report` |

---

## 3. DETAILED BREAKDOWN: MONEY CLAIM REVIEW PAGE

**File:** `src/app/wizard/review/page.tsx` → `MoneyClaimReviewContent` component (lines 233-646)

```
MONEY CLAIM REVIEW PAGE CONTENT:
├── Header
│   ├── Title: "Money Claim Analysis"
│   ├── Jurisdiction label (England/Wales/Scotland Simple Procedure)
│   ├── Readiness badge (Ready to issue / Needs attention)
│   └── Claim strength score with band
│
├── Readiness Summary Card (blue)
│   ├── "What this means for your claim"
│   └── Explanation text
│
├── Claim Summary Card
│   ├── Rent Arrears amount (£)
│   ├── Damages amount (£)
│   ├── Interest (8%) estimated (£)
│   └── Total Claim (£) - highlighted
│
├── Blockers Card (red) - CONDITIONAL
│   ├── "Issues to Fix Before Proceeding"
│   └── List of blocker items with title and message
│
├── Risks Card (amber) - CONDITIONAL
│   ├── "Risks to Consider"
│   └── List of risk items
│
├── Pre-Action Protocol Status Card
│   ├── Letter Before Claim sent (✓/⚠)
│   │   └── Status explanation
│   ├── 14-day response period (✓/⚠)
│   │   └── Status explanation
│   └── Footer note about PAP-DEBT requirements
│
├── Evidence Checklist Card
│   ├── Tenancy Agreement (✓/⚠)
│   ├── Rent Schedule (✓/⚠)
│   ├── Bank Statements (✓/○)
│   └── Correspondence (✓/○)
│
├── Positives Card (green) - CONDITIONAL
│   ├── "What's Looking Good"
│   └── List of positive items
│
├── Things to Fix or Improve Card - CONDITIONAL
│   ├── Red flags list
│   └── Compliance issues list
│
├── Documents in Your Pack Card
│   ├── England/Wales:
│   │   ├── Form N1 - Money Claim Form (Required)
│   │   ├── Particulars of Claim (Required)
│   │   ├── Schedule of Arrears (Required)
│   │   ├── Interest Calculation
│   │   ├── Letter Before Claim (PAP-DEBT) (Required)
│   │   ├── Information Sheet for Defendants (Required)
│   │   ├── Reply Form
│   │   ├── Financial Statement Form
│   │   ├── Evidence Index
│   │   ├── Court Filing Guide
│   │   └── Enforcement Guide
│   └── Scotland:
│       ├── Form 3A - Simple Procedure Claim (Required)
│       ├── Particulars of Claim (Required)
│       ├── Schedule of Arrears (Required)
│       ├── Interest Calculation
│       ├── Letter Before Claim
│       └── Filing Guide
│
├── Warnings Card (yellow) - CONDITIONAL
│   └── Important warnings list
│
└── Action Buttons
    ├── "Go back & edit answers" → /wizard/flow
    └── "Proceed to payment & pack" → /wizard/preview/{caseId}
```

### Data Sources for Money Claim Review:

| Field | Source |
|-------|--------|
| `total_arrears` | `/api/wizard/analyze` → `analysis.case_summary.total_arrears` |
| `damages` | `/api/wizard/analyze` → `analysis.case_summary.damages` |
| `other_charges` | `/api/wizard/analyze` → `analysis.case_summary.other_charges` |
| `interest_rate` | `/api/wizard/analyze` → `analysis.case_summary.interest_rate` |
| `pre_action_status` | `/api/wizard/analyze` → `analysis.case_summary.pre_action_status` |
| `blockers` | `/api/wizard/analyze` → `analysis.case_health.blockers` |
| `risks` | `/api/wizard/analyze` → `analysis.case_health.risks` |
| `warnings` | `/api/wizard/analyze` → `analysis.case_health.warnings` |
| `positives` | `/api/wizard/analyze` → `analysis.case_health.positives` |
| `evidence_overview` | `/api/wizard/analyze` → `analysis.evidence_overview` |

---

## 4. INLINE REVIEW SECTIONS

### 4.1 Eviction Inline Review (EvictionSectionFlow)

**File:** `src/components/wizard/sections/eviction/ReviewSection.tsx`

**Purpose:** Validates section completion and shows blockers before navigating to full review page.

**Displays:**
- Summary header (Ready to Generate / Please Resolve Issues)
- Case ID and jurisdiction
- Incomplete sections list with "Complete →" links
- Blockers - Must Fix (red cards)
- Warnings - Review Recommended (amber cards)
- Section status grid with edit links
- Documents to generate list
- "Generate Complete Pack" button (disabled if blockers exist)

**Key Logic:**
- Collects blockers from all sections via `hasBlockers()` function
- Ground 8 specific validation via `validateGround8Eligibility()`
- `canProceed = blockers.length === 0 && incompleteRequired.length === 0`
- On complete → navigates to `/wizard/review?case_id=X&product=complete_pack`

### 4.2 Money Claim Inline Review (MoneyClaimSectionFlow)

**File:** `src/components/wizard/money-claim/ReviewSection.tsx`

**Purpose:** Shows what pack includes and provides preview before full analysis.

**Displays:**
- Completion message
- Case ID and jurisdiction
- Ask Heaven features banner
- Pack contents list (jurisdiction-specific)
- "Preview draft documents" button → opens `/api/money-claim/preview/{caseId}` in new tab
- "Continue to Full Analysis" button → navigates to `/wizard/review?case_id=X&product=money_claim`

### 4.3 Notice Only Inline Review (NoticeOnlySectionFlow)

**File:** Part of `NoticeOnlySectionFlow.tsx` → `renderReviewSection()` function

**Purpose:** Simple completion check before going straight to preview (no full review page).

**Displays:**
- Incomplete sections warning (if any)
- Section status summary
- Documents to generate (Form 3/Form 6A based on route)
- "Generate Notice" button → navigates to `/wizard/preview/{caseId}`

**Key Difference:** Skips the full review page entirely - goes directly to preview/checkout.

### 4.4 Tenancy Inline Review (TenancySectionFlow)

**File:** Part of `TenancySectionFlow.tsx` → `ReviewSection` component

**Purpose:** Basic information review before generating agreement.

**Displays:**
- "Review Your Information" heading
- All entered facts in read-only format
- "Generate Agreement" button → navigates to `/wizard/preview/{caseId}`

**Key Difference:** Minimal analysis - no blockers/warnings, no case health assessment.

---

## 5. GAPS AND INCONSISTENCIES

| Gap | Products Affected | Severity | Description |
|-----|-------------------|----------|-------------|
| No full review page for notice_only | notice_only (all jurisdictions) | **Medium** | Users go directly to preview without seeing decision engine analysis, blocking issues, or compliance warnings |
| No case health for tenancy agreements | ast_standard, ast_premium | **Low** | No structured blockers/risks/warnings system - only basic field validation |
| Inconsistent review UX between flows | All | **Medium** | Eviction/Money claim have full analysis pages; Notice-only/AST skip to preview |
| No Scotland-specific eviction flow | complete_pack (Scotland) | **Medium** | Uses legacy StructuredWizard instead of EvictionSectionFlow - less consistent UX |
| Missing inline review for Scotland eviction | complete_pack (Scotland) | **Low** | Scotland eviction uses legacy flow without inline ReviewSection component |
| No Northern Ireland eviction/money claim | All NI except tenancy | **High** | Returns error - only tenancy_agreement supported for NI |
| Tenancy review lacks analysis | All tenancy products | **Medium** | No solicitor-style case analysis, no PAP compliance checks, no risk assessment |
| SmartReviewPanel not integrated in review page | All products | **Low** | AI document analysis warnings panel exists but not shown on main review page |
| Decision engine not run for money claims | money_claim, sc_money_claim | **Low** | Uses case_health instead - less sophisticated than eviction decision engine |

---

## 6. JURISDICTION HANDLING

| Jurisdiction | Eviction Review | Money Claim Review | Notice Only Review | AST Review |
|--------------|-----------------|--------------------|--------------------|------------|
| **England** | ✅ Full (Decision Engine) | ✅ Full (Case Health) | ❌ Inline only → Preview | ❌ Inline only → Preview |
| **Wales** | ✅ Full (Decision Engine) | ✅ Full (Case Health) | ❌ Inline only → Preview | ❌ Inline only → Preview |
| **Scotland** | ✅ Full (via legacy wizard) | ✅ Full (Simple Procedure) | ❌ Legacy → Preview | ❌ Inline only → Preview |
| **Northern Ireland** | ❌ Not supported | ❌ Not supported | ❌ Not supported | ❌ Inline only → Preview |

### Jurisdiction-Specific Content:

**England Eviction:**
- Routes: section_8, section_21, accelerated_possession
- Notices: Form 3 (S8), Form 6A (S21)
- Court Forms: N5, N119, N5B

**Wales Eviction:**
- Routes: wales_section_173, wales_fault_based
- Notices: RHW16/17 (S173), RHW23 (breach)
- Documents: Service checklist

**Scotland Eviction:**
- Route: notice_to_leave
- Documents: Notice to Leave, Form E (Tribunal)

**England/Wales Money Claim:**
- Form N1, Particulars, Schedule, Interest Calc
- PAP-DEBT Letter Before Claim (mandatory)
- Information Sheet for Defendants

**Scotland Money Claim:**
- Form 3A (Simple Procedure)
- Particulars, Schedule, Interest
- Pre-action letter

---

## 7. API DATA SOURCES

| API Endpoint | What It Returns | Used By |
|--------------|-----------------|---------|
| `POST /api/wizard/analyze` | Complete case analysis including decision engine output, case health, evidence overview, document list, strength score | Review page (both eviction and money claim) |
| `GET /api/cases/[id]` | Raw case data from database | Preview page for loading case |
| `POST /api/wizard/start` | Creates new case, returns case_id and first question | Flow page initialization |
| `POST /api/wizard/answer` | Saves answer, returns next question | All wizard flows |
| `GET /api/money-claim/preview/[id]` | HTML preview of money claim documents | Inline review preview button |

### `/api/wizard/analyze` Response Shape:

```typescript
{
  case_id: string;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  case_type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  product: string;

  // Route recommendation
  recommended_route: string;
  recommended_route_label: string;
  route_override: { from?: string; to: string; reason: string; } | null;

  // Strength scoring
  case_strength_score: number; // 0-100
  case_strength_band: 'strong' | 'medium' | 'weak' | 'unknown';

  // Readiness
  is_court_ready: boolean | null;
  readiness_summary: string | null;

  // Issues
  red_flags: string[];
  compliance_issues: string[];

  // Evidence
  evidence_overview: {
    tenancy_agreement_uploaded: boolean;
    rent_schedule_uploaded: boolean;
    correspondence_uploaded: boolean;
    damage_photos_uploaded: boolean;
    authority_letters_uploaded: boolean;
    bank_statements_uploaded: boolean;
    other_evidence_uploaded: boolean;
    files: Array<{...}>;
  };

  // Documents
  preview_documents: Array<{
    id: string;
    document_type: string;
    document_title: string;
    requiredToFile?: boolean;
  }>;

  // Money claim specific
  case_summary: {
    total_arrears: number;
    damages: number;
    other_charges: number;
    interest_rate: number;
    pre_action_status: 'complete' | 'partial' | 'missing';
    ready_for_issue: boolean;
    missing_prerequisites: string[];
    // ...
  };

  case_health: {
    product: string;
    jurisdiction: string;
    overall_status: 'ready_to_issue' | 'needs_work' | 'cannot_issue_yet';
    can_issue: boolean;
    strength: 'strong' | 'medium' | 'weak' | 'unknown';
    blockers: Array<{code, severity, title, message}>;
    risks: Array<{...}>;
    warnings: Array<{...}>;
    positives: string[];
  } | null;

  // Eviction specific
  decision_engine: {
    recommended_routes: string[];
    allowed_routes: string[];
    blocked_routes: string[];
    recommended_grounds: Array<{code, title, description, type}>;
    blocking_issues: Array<{route, severity, description, action_required}>;
    warnings: string[];
    route_explanations: Record<string, string>;
  } | null;

  // Metadata
  law_profile: {...};
  ask_heaven_answer: string | null;
}
```

---

## 8. COMPONENT HIERARCHY

```
Review Page (src/app/wizard/review/page.tsx)
├── Detects product type via: searchParams.get('product') || analysis.product || 'complete_pack'
├── Detects money claim via: product === 'money_claim' || product === 'sc_money_claim' || caseType === 'money_claim'
├── Fetches data from: POST /api/wizard/analyze { case_id }
│
├── Renders for money_claim:
│   └── MoneyClaimReviewContent (line 233-646)
│       ├── Header with readiness badge
│       ├── Claim Summary (arrears, damages, interest, total)
│       ├── Blockers Card
│       ├── Risks Card
│       ├── Pre-Action Protocol Status
│       ├── Evidence Checklist
│       ├── Positives Card
│       ├── Things to Fix Card
│       ├── Documents in Pack
│       ├── Warnings Card
│       └── Action Buttons
│
└── Renders for eviction (default):
    └── EvictionReviewContent (line 667-1065)
        ├── Header with recommended route
        ├── Readiness Summary
        ├── Blocking Issues Card
        ├── CaseStrengthWidget
        ├── Legal Assessment (routes + grounds)
        ├── Things to Fix Card
        ├── Evidence Checklist
        ├── Documents to Generate
        ├── Warnings Card
        └── Action Buttons

Flow Page Navigation (src/app/wizard/flow/page.tsx):
├── handleComplete(caseId):
│   ├── eviction + complete_pack → /wizard/review?case_id=X&product=complete_pack
│   ├── eviction + notice_only → /wizard/preview/{caseId} (SKIPS REVIEW)
│   ├── money_claim → /wizard/review?case_id=X&product=money_claim
│   └── tenancy_agreement → /wizard/preview/{caseId} (SKIPS REVIEW)
│
└── Flow Components:
    ├── EvictionSectionFlow → ReviewSection → /wizard/review
    ├── NoticeOnlySectionFlow → inline review → /wizard/preview (SKIPS)
    ├── MoneyClaimSectionFlow → ReviewSection → /wizard/review
    └── TenancySectionFlow → inline review → /wizard/preview (SKIPS)
```

---

## 9. RECOMMENDATIONS

### Priority 1 - Critical Fixes

1. **Add review page for notice_only flows**
   - File: `src/app/wizard/review/page.tsx`
   - Currently notice_only skips review entirely
   - Users should see S21 compliance issues before paying
   - Create `NoticeOnlyReviewContent` component showing decision engine results

2. **Migrate Scotland eviction to EvictionSectionFlow**
   - Files: `src/app/wizard/flow/page.tsx`, create Scotland-specific sections
   - Currently uses legacy StructuredWizard
   - Should match England/Wales UX consistency

### Priority 2 - Enhancements

3. **Add case analysis for tenancy agreements**
   - File: Create `src/lib/tenancy-engine/index.ts`
   - Currently no blockers/warnings for AST products
   - Should validate: deposit protection, prescribed info, landlord residence checks

4. **Integrate SmartReviewPanel into review page**
   - File: `src/app/wizard/review/page.tsx`
   - SmartReviewPanel exists but isn't used on main review page
   - Should show AI document extraction warnings

5. **Standardize inline review sections**
   - All flows have different inline review implementations
   - Create shared `WizardReviewSummary` component

### Priority 3 - Technical Debt

6. **Create unified review page component**
   - Current: Two large inline components (EvictionReviewContent, MoneyClaimReviewContent)
   - Better: Separate files with shared base layout

7. **Add TypeScript types for analysis response**
   - Current: `analysis: any` throughout
   - Better: Type-safe interface matching API response

8. **Add loading states for review page**
   - Current: Basic spinner
   - Better: Skeleton loading for each section

---

## 10. QUESTIONS/CLARIFICATIONS NEEDED

1. **Should notice_only have a full review page?**
   - Currently goes straight to preview
   - Decision engine analysis is computed but never shown to user
   - Recommendation: Yes, show S21 compliance issues

2. **Should tenancy agreements have case health analysis?**
   - Currently no PAP compliance, no risk assessment
   - Could add checks for: deposit protection, EPC requirements, gas safety

3. **What's the plan for Northern Ireland eviction/money claim support?**
   - API returns: "planned for Q2 2026"
   - Will it use shared review components or NI-specific?

4. **Should the CaseStrengthWidget be used on money claim review?**
   - Currently only used for eviction
   - Money claim uses case_health.strength instead

5. **Route override UX: Should it be more prominent?**
   - Currently `route_override` is returned but not obviously displayed
   - When S21 is blocked and falls back to S8, user should clearly understand why

---

## File References

| File | Purpose |
|------|---------|
| `src/app/wizard/review/page.tsx` | Main review page (1083 lines) |
| `src/app/wizard/flow/page.tsx` | Flow orchestration and routing |
| `src/app/wizard/preview/[caseId]/page.tsx` | Preview/checkout page |
| `src/app/api/wizard/analyze/route.ts` | Analysis API endpoint (1124 lines) |
| `src/components/wizard/flows/EvictionSectionFlow.tsx` | England/Wales eviction wizard |
| `src/components/wizard/flows/NoticeOnlySectionFlow.tsx` | Notice-only wizard |
| `src/components/wizard/flows/MoneyClaimSectionFlow.tsx` | Money claim wizard |
| `src/components/wizard/flows/TenancySectionFlow.tsx` | Tenancy agreement wizard |
| `src/components/wizard/sections/eviction/ReviewSection.tsx` | Inline eviction review |
| `src/components/wizard/money-claim/ReviewSection.tsx` | Inline money claim review |
| `src/components/wizard/SmartReviewPanel.tsx` | AI document analysis warnings |
| `src/lib/decision-engine/index.ts` | Eviction decision engine |
| `src/lib/wizard/review-navigation.ts` | Review navigation utilities |
