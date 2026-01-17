# SEO Technical Fix Pass

**Date:** January 2026
**Scope:** Technical SEO fixes for crawlability, structured data safety, and pricing consistency

---

## Summary

This fix pass addresses 5 technical SEO issues that could impact search visibility and rich results eligibility.

---

## Changes Made

### A) robots.txt - /_next/ Allowed

**File:** `src/app/robots.ts`

**Issue:** `/_next/` was in the disallow list, blocking Google from accessing JavaScript bundles needed for rendering.

**Fix:** Moved `/_next/` from disallow to allow list.

```typescript
// Before
disallow: ['/api/', '/dashboard/', '/_next/', ...]

// After
allow: ['/', '/blog/', '/_next/'],
disallow: ['/api/', '/dashboard/', ...]
```

**Why it matters:** Next.js apps require `/_next/static/` for client-side rendering. Blocking it can cause Google to see incomplete pages.

---

### B) Structured Data - Hardcoded Ratings Removed

**File:** `src/lib/seo/structured-data.tsx`

**Issue:** `productSchema()` and `softwareApplicationSchema()` included hardcoded `aggregateRating` values:
- `ratingValue: "4.8"`
- `reviewCount: "247"`

These are fabricated ratings with no real review data source.

**Fix:** Ratings are now gated behind `ENABLE_STRUCTURED_RATINGS` environment variable (default: `false`).

```typescript
// Only included when ENABLE_STRUCTURED_RATINGS=true
if (ENABLE_STRUCTURED_RATINGS) {
  return { ...baseSchema, aggregateRating: {...} };
}
return baseSchema;
```

**Why it matters:** Google may issue manual actions against sites with fake ratings. Only enable when you have verifiable review data from Trustpilot, Google Reviews, etc.

---

### C) softwareApplicationSchema Pricing Fixed

**File:** `src/lib/seo/structured-data.tsx`

**Issue:** Price range was hardcoded as `lowPrice: "19.99"`, `highPrice: "149.99"` - outdated values.

**Fix:** Prices now calculated from `PRODUCTS` (single source of truth):

```typescript
const prices = [
  PRODUCTS.ast_standard.price,  // £9.99
  PRODUCTS.notice_only.price,   // £39.99
  PRODUCTS.complete_pack.price, // £199.99
  PRODUCTS.money_claim.price,   // £199.99
];
const lowPrice = Math.min(...prices);  // 9.99
const highPrice = Math.max(...prices); // 199.99
```

---

### D) Blog CTA Prices Centralized

**Files:**
- `src/components/blog/BlogCTA.tsx`
- `src/app/blog/page.tsx`

**Issue:** Hardcoded price strings like `"£39.99"` and `"£199.99"` that could drift from actual prices.

**Fix:** All CTA price strings now use `PRODUCTS.{sku}.displayPrice`:

```tsx
// Before
Section 21 Notice — £39.99

// After
Section 21 Notice — {PRODUCTS.notice_only.displayPrice}
```

---

### E) Sitemap lastModified Stabilized

**File:** `src/app/sitemap.ts`

**Issue:** All pages used `lastModified: now` creating false freshness signals.

**Fix:**
- Blog posts: Keep actual `post.updatedDate || post.date`
- Legal pages (terms, privacy, cookies): Omit `lastModified` entirely
- Product/tool pages: Use stable quarterly date `STABLE_PRODUCT_DATE`

```typescript
const STABLE_PRODUCT_DATE = new Date('2026-01-01');
// Update quarterly when making significant changes
```

**Why it matters:** Setting lastModified to "now" on every request tells Google pages are constantly changing, which may reduce crawl efficiency for actually-new content.

---

### F) Regression Tests Added

**File:** `tests/seo/seo-regression.test.ts`

New test suite verifies:
1. robots.txt allows `/_next/` and doesn't disallow it
2. `productSchema()` excludes aggregateRating unless `ENABLE_STRUCTURED_RATINGS=true`
3. `softwareApplicationSchema()` uses correct prices from PRODUCTS
4. BlogCTA.tsx uses centralized PRODUCTS pricing, not hardcoded strings
5. sitemap.ts uses stable dates, not "now" for all entries

Run tests:
```bash
npx vitest run tests/seo/seo-regression.test.ts
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/robots.ts` | Allow /_next/, remove from disallow |
| `src/lib/seo/structured-data.tsx` | Gate ratings behind env flag, fix prices |
| `src/components/blog/BlogCTA.tsx` | Use PRODUCTS for prices |
| `src/app/blog/page.tsx` | Use PRODUCTS for prices |
| `src/app/sitemap.ts` | Use stable dates, not "now" |
| `tests/seo/seo-regression.test.ts` | New regression tests |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_STRUCTURED_RATINGS` | `false` | Enable aggregateRating in Product/SoftwareApplication schema. Only set to `true` when you have real, verifiable review data. |

---

## Validation

After deployment, verify:

1. **robots.txt:** Visit `/robots.txt` and confirm `Allow: /_next/`
2. **Structured data:** Use [Google Rich Results Test](https://search.google.com/test/rich-results) to check Product pages don't show aggregateRating
3. **Sitemap:** Verify lastModified dates are stable, not current timestamp
4. **Search Console:** Monitor for structured data warnings

---

## Related Audit

See `docs/REVENUE_FUNNEL_AUDIT.md` for the broader revenue funnel analysis that identified some of these pricing consistency issues.
