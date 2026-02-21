# Ask Heaven SEO Guide

This document explains the SEO infrastructure for Ask Heaven Q&A pages.

**CRITICAL: Read this before adding or modifying content.**

---

## Table of Contents

1. [Why noindex by Default](#why-noindex-by-default)
2. [Question Status Workflow](#question-status-workflow)
3. [Quality Gates](#quality-gates)
4. [Avoiding Duplicates](#avoiding-duplicates)
5. [When It's Safe to Scale](#when-its-safe-to-scale)
6. [What NOT to Do](#what-not-to-do)
7. [Technical Reference](#technical-reference)

---

## Why noindex by Default

All Ask Heaven Q&A pages are **noindex by default**. This is a deliberate safety measure.

### Reasons:

1. **Thin content risk**: AI-generated answers may be too short or lack depth
2. **Accuracy concerns**: Unreviewed content may contain errors or outdated information
3. **Duplicate content**: Similar questions can cannibalize each other's rankings
4. **Google quality guidelines**: Mass low-quality content can trigger site-wide penalties

### How noindex is enforced:

```typescript
// In quality-gates.ts
function getMetaRobots(question: AskHeavenQuestion): string {
  const result = validateQualityGates(question);

  if (result.forceNoindex) {
    return 'noindex, follow';  // ← Default state
  }

  if (question.canonical_slug !== null) {
    return 'noindex, follow';  // ← Duplicate
  }

  return 'index, follow';  // ← Only for approved, passing content
}
```

---

## Question Status Workflow

Questions must progress through three stages before indexing:

```
draft → review → approved
```

### Status definitions:

| Status | Description | Indexable | Visible |
|--------|-------------|-----------|---------|
| `draft` | Initial state, work in progress | No | No |
| `review` | Pending editorial review | No | Yes (with warning banner) |
| `approved` | Reviewed and approved | Yes (if gates pass) | Yes |

### Moving between statuses:

1. **draft → review**: Content is ready for editorial review
2. **review → approved**: Editor has verified:
   - Legal accuracy
   - Completeness (all sections filled)
   - Word count ≥ 500
   - Disclaimer present
   - No duplicate exists (or canonical is set)
3. **approved → review**: Content needs updates (e.g., law change)

### Who can change status:

- **draft → review**: Content author
- **review → approved**: Editor/SEO lead only
- **approved → review**: Anyone (flag for re-review)

---

## Quality Gates

The following checks must ALL pass for a page to be indexed:

### 1. Status Check
- Question must have `status === 'approved'`

### 2. Word Count
- Answer must have ≥ 500 words
- Measured after stripping markdown formatting

### 3. Disclaimer Required
- Answer must include a legal disclaimer
- Acceptable phrases:
  - "not legal advice"
  - "not a substitute for legal advice"
  - "consult a solicitor"
  - "seek legal advice"
  - "this is general information only"

### 4. Summary Required
- Summary must be ≥ 50 characters
- Used for meta description and TL;DR

### 5. Jurisdiction Required
- At least one jurisdiction must be specified

### 6. Canonical Check
- If `canonical_slug` is set, page is noindex (it's a duplicate)

### Checking gate results:

```typescript
import { validateQualityGates } from '@/lib/ask-heaven/questions';

const result = validateQualityGates(question);

if (!result.passed) {
  console.log('Failed gates:', result.failures);
}
```

---

## Avoiding Duplicates

Duplicate content is a major SEO risk. Follow these rules:

### Before creating a new question:

1. Search existing questions for similar topics
2. Run semantic similarity check (when implemented)
3. If similarity > 85%, either:
   - Don't create the new question
   - Set `canonical_slug` to point to the existing question

### Canonical clustering:

When multiple questions cover the same topic:

1. Choose ONE canonical question (the best/most comprehensive)
2. Set `canonical_slug` on all variants to point to the canonical
3. Variants will redirect to the canonical URL

Example:
```
Canonical: "how-to-serve-section-21-notice-england"

Variants (canonical_slug = "how-to-serve-section-21-notice-england"):
- "section-21-notice-service-methods"
- "serving-eviction-notice-england"
- "form-6a-service-guide"
```

### Related vs. duplicate:

- **Related**: Different questions on similar topics → Link with `related_slugs`
- **Duplicate**: Same question, different wording → Use `canonical_slug`

---

## When It's Safe to Scale

**DO NOT mass-generate content until:**

1. ✅ Pilot proven successful
   - Create 50-100 curated questions
   - Monitor Google Search Console for 30+ days
   - Verify indexing, impressions, and click-through

2. ✅ Duplicate detection implemented
   - Semantic similarity check working
   - Automatic canonical suggestions

3. ✅ Review workflow established
   - Clear ownership for approvals
   - SLA for review turnaround

4. ✅ Quality metrics defined
   - Minimum engagement thresholds
   - Bounce rate monitoring
   - User feedback collection

### Scaling checklist:

```
[ ] Pilot batch indexed and performing well
[ ] No thin content warnings in GSC
[ ] Duplicate detection operational
[ ] Editorial review capacity confirmed
[ ] Monitoring dashboard set up
```

---

## What NOT to Do

### ❌ Auto-index AI answers

Never set `status = 'approved'` automatically after AI generation.

```typescript
// WRONG - Never do this
const question = await generateAIAnswer(userQuestion);
question.status = 'approved';  // ❌ DANGEROUS
await repository.create(question);
```

### ❌ Skip editorial review

Every question must be reviewed by a human before approval.

### ❌ Create questions without checking for duplicates

Always check for existing similar questions first.

### ❌ Use thin content

If the answer is short, either:
- Expand with more detail
- Don't create the page
- Keep as draft/review (noindex)

### ❌ Ignore jurisdiction restrictions

Don't show product CTAs for unavailable regions:
- Northern Ireland: Only tenancy agreements available
- Wales/Scotland: No complete_pack or money_claim

### ❌ Hardcode product URLs

Always use the linking utilities:

```typescript
// WRONG
<a href="/money-claim">Start Claim</a>

// RIGHT
import { buildProductUrl } from '@/lib/ask-heaven/questions/linking';
<a href={buildProductUrl('/money-claim', 'ask_heaven_qa', topic)}>Start Claim</a>
```

---

## Technical Reference

### File locations:

| File | Purpose |
|------|---------|
| `src/lib/ask-heaven/questions/types.ts` | Data model definitions |
| `src/lib/ask-heaven/questions/repository.ts` | Persistence abstraction |
| `src/lib/ask-heaven/questions/quality-gates.ts` | Indexability checks |
| `src/lib/ask-heaven/questions/linking.ts` | Internal linking utilities |
| `src/app/ask-heaven/[slug]/page.tsx` | SSR question page |
| `src/app/sitemap.ts` | Sitemap generation |

### Key types:

```typescript
interface AskHeavenQuestion {
  id: string;
  slug: string;
  question: string;
  answer_md: string;
  summary: string;
  primary_topic: AskHeavenPrimaryTopic;
  jurisdictions: AskHeavenJurisdiction[];
  status: 'draft' | 'review' | 'approved';
  canonical_slug: string | null;
  related_slugs: string[];
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}
```

### Quality gate constants:

```typescript
MIN_ANSWER_WORD_COUNT = 500
DUPLICATE_SIMILARITY_THRESHOLD = 0.85
```

### Sitemap behavior:

- Only `status === 'approved'` questions included
- Only canonical questions included (`canonical_slug === null`)
- Priority: 0.7 (lower than product pages)
- Change frequency: monthly

---

## Questions?

Contact the SEO team or check the existing audit reports:
- `/docs/audit-reports/seo-ask-heaven.md`
- `/docs/audit-reports/PRODUCT_TOOLS_AI_SEO_AUDIT.md`

---

*Last updated: 2026-02-03*
