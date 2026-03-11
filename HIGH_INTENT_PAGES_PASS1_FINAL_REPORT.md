# High Intent Pages Pass 1 Final Report

## Validation Method
- Rendered each route from the running Next.js app (`npm run dev`) and measured the delivered HTML text word count from localhost pages.
- Counts are **actual rendered page text counts** from route responses, not estimates.

## Page-by-page Status

| Page | Rendered word count | Threshold | Status | Bespoke/shared status | CTA route summary | Metadata/schema confirmation | Sitemap confirmation | Blockers remaining |
|---|---:|---:|---|---|---|---|---|---|
| `/tenant-stopped-paying-rent` | 3092 | 1800 | Complete | **Bespoke** (`HighIntentPageShell` with page-specific long-form content) | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/tenant-abandoned-property` | 3096 | 1800 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/tenant-damaging-property` | 3078 | 1800 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; explicit canonical + OG in page metadata; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/tenant-refusing-access` | 3046 | 1800 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/tenant-anti-social-behaviour` | 3060 | 1800 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/how-long-does-eviction-take` | 3091 | 2200 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/eviction-timeline-uk` | 3119 | 2200 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/section-8-grounds-explained` | 3089 | 1800 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/accelerated-possession-guide` | 3054 | 2000 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |
| `/warrant-of-possession-guide` | 3080 | 2000 | Complete | **Bespoke** | Primary CTA: Notice Only; secondary CTA: Complete Pack | Metadata present; canonical + OG via metadata helper; Article + FAQPage + BreadcrumbList via `HighIntentPageShell` | Included in `src/app/sitemap.ts` | None |

## Final outcome
All required Pass 1 pages are now bespoke and above the required rendered word-count thresholds.
