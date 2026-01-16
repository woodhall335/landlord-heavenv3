# SmartReviewPanel Component Audit

**Date:** 2026-01-06
**Component:** `src/components/wizard/SmartReviewPanel.tsx`

---

## 1. COMPONENT OVERVIEW

| Aspect | Details |
|--------|---------|
| **File location** | `src/components/wizard/SmartReviewPanel.tsx` |
| **Line count** | 416 lines |
| **Purpose** | Display AI-extracted document analysis warnings - compares uploaded evidence against wizard answers to surface mismatches |
| **Props it accepts** | `warnings: SmartReviewWarningItem[]`, `summary: SmartReviewSummary`, `defaultCollapsed?: boolean` |
| **API it calls** | None directly - data comes from `/api/wizard/answer` response via `smart_review` field |
| **AI/ML involved?** | Yes - GPT-4o Vision API for document extraction |
| **Backend library** | `src/lib/evidence/smart-review/` (7 files, ~120KB total) |

---

## 2. WHAT IT DISPLAYS

The SmartReviewPanel is a collapsible card that shows:

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Document Review (X items to review)                  ▼   │
│    Last checked: 5 minutes ago (3 documents)                │
├─────────────────────────────────────────────────────────────┤
│ [All (5)] [Attention (1)] [Possible Issues (2)] [Notes (2)] │ ← Filter buttons
├─────────────────────────────────────────────────────────────┤
│ ⚠️ ATTENTION REQUIRED                                        │
│ Possible rent amount mismatch                                │
│ The rent amount in your tenancy agreement appears to         │
│ differ from what you entered...                          ▼   │
│ ├─────────────────────────────────────────────────────────── │
│ │ Your Answer          │ Found in Document                   │
│ │ £1,200/month         │ £1,150/month                        │
│ │                      │ Source: tenancy-agreement.pdf       │
│ ├─────────────────────────────────────────────────────────── │
│ │ Suggested Action: Review your tenancy agreement...         │
│ └─────────────────────────────────────────────────────────── │
│                                                              │
│ ⚠️ POSSIBLE ISSUE                                            │
│ Tenant name variation detected                               │
│ [collapsed...]                                               │
│                                                              │
│ ℹ️ NOTE                                                       │
│ Missing deposit protection certificate                       │
│ [collapsed...]                                               │
├─────────────────────────────────────────────────────────────┤
│ These are automated checks... They are informational only    │
│ and do not predict outcomes.                                 │
└─────────────────────────────────────────────────────────────┘
```

### Sections Displayed:

1. **Header** - Collapsible button with title, warning count, last checked time, documents processed
2. **Filter Buttons** - All, Attention (blockers), Possible Issues (warnings), Notes (info)
3. **Warning Cards** - Each expandable with:
   - Severity badge and icon
   - Title and message
   - Comparison panel (wizard value vs. extracted value)
   - Suggested user action
   - Confidence indicator (if < 80%)
4. **Disclaimer** - Standard "automated checks, informational only" notice

### "All Clear" State:
If no warnings but documents were processed, shows:
- ✓ Green checkmark
- "No issues found"
- "Your documents appear to match the information you provided."

---

## 3. DATA SOURCES

| Data | Source | When Fetched |
|------|--------|--------------|
| `warnings[]` | `/api/wizard/answer` → `response.smart_review.warnings` | After each wizard answer is saved |
| `summary` | `/api/wizard/answer` → `response.smart_review.summary` | Same as warnings |
| Persisted data | `case_facts.__smart_review` | On page load (survives refresh) |

### Data Flow:

```
1. User uploads evidence document
2. User submits wizard answer
3. /api/wizard/answer checks:
   - Is ENABLE_SMART_REVIEW=true?
   - Is product=complete_pack?
   - Is jurisdiction=england?
   - Were evidence files uploaded this answer?
4. If yes → runSmartReview() orchestrator:
   a. classifyDocument() - detect PDF/image/text
   b. extractFromText() OR extractFromImage() (GPT-4o Vision)
   c. compareFacts() - compare extracted vs wizard facts
   d. Generate SmartReviewWarning[] array
5. Response includes smart_review { warnings, summary, cost_usd }
6. StructuredWizard updates state + persists to case_facts.__smart_review
7. SmartReviewPanel renders warnings
```

---

## 4. CURRENT USAGE

### Where Currently Used:

| Location | Used? | Conditions |
|----------|-------|------------|
| `StructuredWizard.tsx` (legacy) | ✅ Yes | `product === 'complete_pack' && jurisdiction === 'england'` |
| `EvictionSectionFlow.tsx` | ❌ No | Not integrated |
| `MoneyClaimSectionFlow.tsx` | ❌ No | Not integrated |
| `NoticeOnlySectionFlow.tsx` | ❌ No | Not integrated |
| `TenancySectionFlow.tsx` | ❌ No | Not integrated |
| Review page (`/wizard/review`) | ❌ No | Not integrated |

### Import Status:
```typescript
// In StructuredWizard.tsx:
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';

// Rendered at line 3301:
{product === 'complete_pack' && jurisdiction === 'england' && (
  <SmartReviewPanel
    warnings={smartReviewWarnings}
    summary={smartReviewSummary}
    defaultCollapsed={!currentQuestion?.id?.startsWith('evidence_')}
  />
)}
```

### Feature Flag Status:
```bash
# In .env.example:
ENABLE_SMART_REVIEW="false"    # Currently DISABLED in production
ENABLE_VISION_OCR="false"      # Currently DISABLED in production
```

---

## 5. PRODUCTION READINESS

| Check | Status | Notes |
|-------|--------|-------|
| Error handling | ✅ Good | Pipeline has try/catch, graceful fallback on errors |
| Loading states | ⚠️ Partial | No loading spinner in panel - data arrives with answer response |
| Empty states | ✅ Good | Shows "No issues found" when no warnings |
| API dependency works | ✅ Yes | Pipeline fully implemented with timeouts and limits |
| Styling complete | ✅ Good | Proper Tailwind styling, matches design system |
| No console errors | ✅ Yes | Clean rendering |
| TypeScript types | ✅ Full | All interfaces properly typed and exported |
| Feature flagged | ✅ Yes | Controlled by `ENABLE_SMART_REVIEW` env var |
| Cost controls | ✅ Yes | File limits, page limits, timeouts, throttling |
| Tests | ❌ Missing | No unit tests found for component or pipeline |
| Documentation | ✅ Good | JSDoc comments throughout |

### Cost/Performance Safeguards (v1 Hardening):
```typescript
// Configured via environment variables:
SMART_REVIEW_MAX_FILES_PER_RUN = 10      // Max files per run
SMART_REVIEW_MAX_PAGES_PER_PDF = 3       // Max pages per PDF
SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN = 12 // Max total pages
SMART_REVIEW_TIMEOUT_MS = 15000          // Per-document timeout
SMART_REVIEW_THROTTLE_MS = 30000         // Min interval between runs
```

---

## 6. ISSUES FOUND

### Critical Issues:
| Issue | Severity | Description |
|-------|----------|-------------|
| **Not in new flows** | High | SmartReviewPanel is only in legacy StructuredWizard, not in new section-based flows (EvictionSectionFlow, etc.) |
| **Feature disabled** | High | `ENABLE_SMART_REVIEW=false` in production - system is built but not active |
| **England-only** | Medium | Hardcoded to only work for `jurisdiction === 'england'` |

### Minor Issues:
| Issue | Severity | Description |
|-------|----------|-------------|
| No loading indicator | Low | When Smart Review is running, user doesn't see a spinner |
| No tests | Medium | No unit/integration tests for component or pipeline |
| Icon inconsistency | Low | Header always shows `RiCheckboxCircleLine` regardless of warning status (lines 162-166) |

### Code Issue Found:
```typescript
// Lines 162-166 - Same icon shown whether hasWarnings or not:
{hasWarnings ? (
  <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />  // Should be warning icon
) : (
  <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />  // Correct
)}
```

---

## 7. BACKEND PIPELINE DETAILS

### Files in `src/lib/evidence/smart-review/`:

| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | 80 | Module exports |
| `orchestrator.ts` | 1,135 | Main pipeline coordinator |
| `classify.ts` | 400 | Document type detection |
| `compare.ts` | 750 | Fact comparison and warning generation |
| `text-extract.ts` | 500 | PDF text extraction |
| `vision-extract.ts` | 480 | GPT-4o Vision extraction |
| `storage.ts` | 420 | Supabase storage utilities |

### What It Compares:
- **Parties**: Landlord name, tenant name
- **Property**: Address, postcode
- **Tenancy**: Start date, rent amount, rent frequency
- **Deposit**: Amount, protection scheme
- **Notice**: Served date, expiry date

### Warning Types:
- `UPLOAD_MISSING_CATEGORY_*` - Missing evidence categories
- `FACT_MISMATCH_*` - Extracted value differs from wizard answer
- `FACT_MISSING_PROOF_*` - Claimed something without uploading proof
- `FACT_CONTRADICTION_*` - Logical inconsistencies detected
- `EXTRACT_*` - Document couldn't be read properly

---

## 8. RECOMMENDATION

### Decision: ✅ YES - Ready to use WITH fixes

The SmartReviewPanel is **production-ready** from a code quality perspective. The component is well-designed, properly typed, and the backend pipeline has robust safeguards.

**However**, there are integration gaps that should be addressed:

### Required Before Wider Use:

1. **Enable in production** - Set `ENABLE_SMART_REVIEW=true` in environment
2. **Integrate into new flows** - Add to EvictionSectionFlow and MoneyClaimSectionFlow
3. **Fix icon bug** - Show warning icon when hasWarnings is true
4. **Expand jurisdiction** - Remove England-only restriction

### Optional Improvements:

5. Add loading state indicator
6. Write unit tests for pipeline
7. Add to Review page (`/wizard/review/page.tsx`)

---

## 9. HOW TO INTEGRATE

### Props Required:
```typescript
interface SmartReviewPanelProps {
  warnings: SmartReviewWarningItem[];  // From API response or persisted state
  summary: SmartReviewSummary | null;   // From API response or persisted state
  defaultCollapsed?: boolean;           // true = start collapsed
}
```

### Integration Steps for EvictionSectionFlow:

```typescript
// 1. Import component
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';

// 2. Add state for warnings
const [smartReviewWarnings, setSmartReviewWarnings] = useState<SmartReviewWarningItem[]>([]);
const [smartReviewSummary, setSmartReviewSummary] = useState<SmartReviewSummary | null>(null);

// 3. Hydrate from persisted facts on load
useEffect(() => {
  if (facts.__smart_review?.warnings) {
    setSmartReviewWarnings(facts.__smart_review.warnings);
    setSmartReviewSummary(facts.__smart_review.summary);
  }
}, [facts.__smart_review]);

// 4. Update after answer API response
// In your handleSaveAnswer function:
if (response.smart_review?.warnings) {
  setSmartReviewWarnings(response.smart_review.warnings);
  setSmartReviewSummary({
    ...response.smart_review.summary,
    ranAt: new Date().toISOString(),
  });
}

// 5. Render in the wizard UI (e.g., after question content)
{smartReviewWarnings.length > 0 && (
  <SmartReviewPanel
    warnings={smartReviewWarnings}
    summary={smartReviewSummary}
    defaultCollapsed={currentSection !== 'evidence'}
  />
)}
```

### Integration for Review Page:

```typescript
// In /wizard/review/page.tsx - Add to EvictionReviewContent:

// 1. Extract from analysis response
const smartReviewData = analysis.case_facts?.__smart_review || null;

// 2. Render panel
{smartReviewData?.warnings?.length > 0 && (
  <Card className="p-6">
    <h2 className="text-lg font-semibold mb-4">Document Analysis</h2>
    <SmartReviewPanel
      warnings={smartReviewData.warnings}
      summary={smartReviewData.summary}
      defaultCollapsed={false}
    />
  </Card>
)}
```

---

## 10. FILE REFERENCES

| File | Purpose |
|------|---------|
| `src/components/wizard/SmartReviewPanel.tsx` | UI Component (416 lines) |
| `src/lib/evidence/smart-review/` | Backend pipeline (7 files) |
| `src/lib/evidence/warnings.ts` | Warning taxonomy and codes |
| `src/lib/evidence/schema.ts` | Evidence types and schema |
| `src/app/api/wizard/answer/route.ts` | API that triggers Smart Review |
| `src/components/wizard/StructuredWizard.tsx` | Only current integration point |
| `src/lib/case-facts/schema.ts` | Defines `__smart_review` persistence |

---

## SUMMARY

**SmartReviewPanel is a sophisticated, well-built component with a robust AI pipeline behind it.** It's currently feature-flagged off and only integrated into the legacy wizard. The main work needed is:

1. Enable the feature flag
2. Integrate into new section-based flows
3. Fix minor icon bug

The cost controls and safeguards are already in place, making it safe to enable in production.
