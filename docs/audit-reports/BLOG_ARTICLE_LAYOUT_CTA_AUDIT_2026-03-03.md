# Blog Article CTA Audit Report

## Scope
- Route entry: `src/app/(marketing)/blog/[slug]/page.tsx`
- Data/content source: `src/lib/blog/posts.tsx` (contains inline JSX CTA inserts)
- CTA components: `src/components/blog/BlogCTA.tsx`, `src/components/seo/CommercialWizardLinks.tsx`, `src/components/journey/NextStepWidget.tsx`, `src/components/blog/NextSteps.tsx`

## Existing CTA Inventory (Before)

| Source file | CTA | Placement | Trigger | Analytics wiring |
|---|---|---|---|---|
| `src/app/(marketing)/blog/[slug]/page.tsx` | Urgency banner link (`/products/notice-only`) | Below hero | Always visible when `post.showUrgencyBanner` | None explicit |
| `src/app/(marketing)/blog/[slug]/page.tsx` | "Start with the right landlord pack" link + supporting links | Top of article | Always visible | None explicit |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `CommercialWizardLinks` inline | Mid article | Always visible | Component-managed (none in page) |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `NextStepWidget` (`blog_mid_article`) | Mid article | Always visible | Journey tracking helper |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `NextLegalSteps` primary/secondary CTA | Lower article | Always visible if resolved | None explicit in page |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `NextStepWidget` (`blog_end`) | End article | Always visible | Journey tracking helper |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `NextSteps` card CTAs | End article | Always visible | Component-managed |
| `src/app/(marketing)/blog/[slug]/page.tsx` | `BlogCTA variant="default"` | End article | Always visible | None explicit |
| `src/app/(marketing)/blog/[slug]/page.tsx` | Sidebar `CommercialWizardLinks` | Sidebar | Always visible desktop | Component-managed |
| `src/lib/blog/posts.tsx` + `src/components/blog/BlogCTA.tsx` | Inline/urgency/default CTA blocks embedded directly in article content | Inside article body | Always visible where inserted | None explicit |

## Duplicate CTA Risk (Before)
- Multiple primary product CTAs could appear simultaneously from page-level cards + post-content `<BlogCTA/>` inserts + next-step widgets.
- No explicit slot governance existed to guarantee one-per-slot rendering.

## Allowed Unique Slots (Enforced in this refactor)
- **Slot A**: Desktop sidebar sticky CTA (after hero scroll) — max 1
- **Slot B**: Mobile bottom sticky bar CTA — max 1
- **Slot C**: Lead magnet card (download/email capture) — max 1
- **Slot D**: Inline product card in article flow — max 1
- **Slot E**: Related posts links only (non-primary CTA), tracked separately

## What was removed/converted
- Removed page-level stacked CTA surfaces (`CommercialWizardLinks`, `NextStepWidget`, `NextLegalSteps`, `NextSteps`, bottom `BlogCTA`).
- Deprecated `BlogCTA` component output to prevent post-content duplicate CTA renderings.
- Introduced controlled slot components: `BlogStickySlots`, `BlogLeadMagnetCard`, `BlogInlineProductCard`.

## Analytics events now wired
- `click_blog_sticky_cta` (desktop + mobile sticky)
- `click_blog_inline_product_card`
- `submit_blog_checklist_email`
- `click_blog_download_pdf`
- `click_related_post`

## Slot uniqueness implementation notes
- Desktop and mobile sticky are rendered from the same component with explicit flags (`showDesktop`, `showMobile`) and each mounted once.
- Lead magnet and inline product card are mounted once in page template.
- Related posts remain a non-primary conversion surface.
