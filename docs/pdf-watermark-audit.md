# PDF Watermark Audit

**Date:** 2025-12-22
**Purpose:** Document where and how PDF watermarks are applied in the system.

---

## 1. Watermark Locations Overview

There are **two primary watermarking systems** in the codebase:

1. **Puppeteer CSS Injection** - Used in `generator.ts`
2. **PDF-Lib Direct Stamping** - Used in `notice-only-preview-merger.ts`

---

## 2. Puppeteer-Based Watermarks

### File: `src/lib/documents/generator.ts`

#### Function: `htmlToPdf()` (Lines 685-1024)

**Implementation:** CSS injection with `position: fixed`, opacity overlay, and 45-degree rotation.

**CSS Watermark (Lines 961-994):**
```css
body::before {
  content: "PREVIEW - NOT FOR COURT USE";
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 80px;
  font-weight: bold;
  color: rgba(255, 0, 0, 0.15);  /* Light red at 15% opacity */
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 5px;
}
```

**Dual CSS Rules:** Both `@media print` and screen versions for PDF rendering compatibility.

#### Function: `generateDocument()` (Lines 1033-1077)

**Control Logic (Lines 1061-1062):**
```typescript
const watermark = isPreview ? 'PREVIEW - NOT FOR COURT USE' : undefined;
pdf = await htmlToPdf(html, { watermark });
```

---

## 3. PDF-Lib Direct Watermarks

### File: `src/lib/documents/notice-only-preview-merger.ts`

#### Function: `generateNoticeOnlyPreview()` (Lines 40-148)

**Implementation:** Three-layer watermark system using pdf-lib:

**Layer 1: Diagonal Center Watermark (Lines 98-106):**
```typescript
page.drawText(watermarkText, {
  x: width / 2 - 180,
  y: height / 2 - 50,
  size: 36,
  font: font,
  color: rgb(0.88, 0.88, 0.88),  // Light gray
  rotate: degrees(45),
  opacity: 0.15,
});
```
Default text: `"PREVIEW - Complete Purchase to Download"`

**Layer 2: Header Watermark Band (Lines 109-116):**
```typescript
page.drawText('PREVIEW - NOT FOR COURT USE', {
  x: width / 2 - 120,
  y: height - 15,
  size: 11,
  color: rgb(0.75, 0.75, 0.75),
  opacity: 0.6,
});
```

**Layer 3: Footer Watermark (Lines 119-126):**
```typescript
page.drawText('PREVIEW ONLY', {
  x: 20,
  y: 20,
  size: 10,
  color: rgb(0.7, 0.7, 0.7),
  opacity: 0.5,
});
```

---

## 4. Preview HTML Preparation

### File: `src/lib/documents/generator.ts`

#### Function: `preparePreviewHtml()` (Lines 613-680)

- Limits content to 2 pages (configurable `maxPages` parameter)
- Adds colored header: `"🔒 PREVIEW ONLY - LIMITED VIEW"` (red background #ffebee)
- Adds blue information footer with purchase benefits

---

## 5. API Routes Applying Watermarks

### 5.1 Notice-Only Preview API

**File:** `src/app/api/notice-only/preview/[caseId]/route.ts` (Lines 1012-1017)

```typescript
const previewPdf = await generateNoticeOnlyPreview(documents, {
  jurisdiction,
  notice_type: selected_route as any,
  includeTableOfContents: true,
  watermarkText: 'PREVIEW - Complete Purchase (£29.99) to Download',
});
```

### 5.2 Documents Preview API

**File:** `src/app/api/documents/preview/[id]/route.ts` (Lines 83-85)

```typescript
const previewPdf = await htmlToPdf(previewHtml, {
  watermark: 'PREVIEW - NOT FOR COURT USE',
});
```

---

## 6. Post-Payment Watermark Removal

### File: `src/app/api/webhooks/stripe/route.ts` (Lines 87-153)

**Mechanism:**
- Payment webhook generates documents with `isPreview: false`
- Calls `generateNoticeOnlyPack()` or `generateCompleteEvictionPack()`
- All calls use `isPreview: false`
- Documents saved with `is_preview: false`
- Result: Clean, unwatermarked PDFs

---

## 7. Feature Flags & Environment Variables

**Debug Flag:**
- `PDF_DEBUG` environment variable (lines 504, 695-952)
- Set via `process.env.PDF_DEBUG === '1'`
- Only enables logging, does NOT control watermarks

**No explicit feature flag for enabling/disabling watermarks** - controlled by:
- `isPreview` parameter in code
- API endpoint routing (preview vs. full pack)

---

## 8. Watermark Flow Diagram

```
User Preview Request
    ↓
API Route (/api/notice-only/preview or /api/documents/preview)
    ↓
generateDocument(..., { isPreview: true })
    ↓
htmlToPdf(html, { watermark: 'PREVIEW - NOT FOR COURT USE' })
    ↓
Puppeteer injects CSS watermark (position: fixed, opacity 0.15)
    ↓
PDF with watermark returned to user
    ↓
User purchases → Stripe webhook
    ↓
generateNoticeOnlyPack/generateCompleteEvictionPack() (isPreview: false)
    ↓
Documents generated WITHOUT watermark
    ↓
Saved to database with is_preview: false
    ↓
Clean PDF delivered to customer
```

---

## 9. Files to Modify for Watermark Removal

| File | Function | Change Required |
|------|----------|-----------------|
| `src/lib/documents/generator.ts` | `htmlToPdf()` | Remove CSS watermark injection |
| `src/lib/documents/generator.ts` | `generateDocument()` | Remove watermark parameter |
| `src/lib/documents/generator.ts` | `preparePreviewHtml()` | Remove preview header/footer overlays |
| `src/lib/documents/notice-only-preview-merger.ts` | `generateNoticeOnlyPreview()` | Remove all three watermark layers |
| `src/app/api/notice-only/preview/[caseId]/route.ts` | API handler | Remove watermarkText option |
| `src/app/api/documents/preview/[id]/route.ts` | API handler | Remove watermark option |

---

## 10. Impact Analysis

### Products Affected:
- **notice_only** - Preview and final PDFs
- **complete_pack** - Uses same generator, but typically isPreview=false after payment
- **money_claim** - Returns HTML preview, no PDF watermark at preview stage
- **tenancy_agreement** - Uses same generator

### Scope Decision:
Since the requirement is to remove ALL watermarks (preview and final), the changes should:
1. Remove watermark logic globally from `htmlToPdf()`
2. Remove all three layers from `generateNoticeOnlyPreview()`
3. Remove preview HTML overlays from `preparePreviewHtml()` OR keep them as they are informational, not legal watermarks

### Verification Required:
- Margins remain correct (especially Form 6A)
- No layout regressions
- Headers/footers (page numbers, legal text) remain intact
