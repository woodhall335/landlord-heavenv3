# Phase 6 SERP Optimization Report

## Pages updated
- `src/components/seo/EvictionIntentLandingPage.tsx`
  - Updated shared high-intent landing template used by eviction intent pages (e.g., Section 21, Section 8, eviction notice, timeline and court pages).
  - Added structured “Quick answer” block near the top with Question, 40–60 word short answer, and numbered steps.
  - Added image captions for scenario images.
- `src/components/seo/HighIntentPageShell.tsx`
  - Updated shared longform high-intent shell used by advanced guides.
  - Added “Quick answer” block near the top with Question, short answer, and numbered steps.
  - Added HowTo schema output for process-oriented pages.
  - Added captions for diagram images.
- `src/app/eviction-guides/page.tsx`
  - Expanded hub page sections to include:
    - Core eviction guides
    - Landlord problems
    - Notice guides
    - Court process
    - Tools

## Schema additions
- Added reusable `HowTo` JSON-LD to `EvictionIntentLandingPage` pages.
- Added reusable `HowTo` JSON-LD to `HighIntentPageShell` pages.
- No FAQ schema duplication changes introduced; existing FAQ schema remains as-is and separate from HowTo schema output.

## Internal linking improvements
- Increased contextual internal links via shared templates and hub expansion:
  - `EvictionIntentLandingPage` retains broad internal link coverage to pillar pages, cluster pages, tools, and products.
  - `HighIntentPageShell` retains authority link blocks and related-links modules.
  - `/eviction-guides` now includes dedicated grouped link sections across core guides, problems, notices, court process, and tools.

## Featured snippet blocks added
- Added consistent “Quick answer” snippet blocks to both shared high-intent page templates:
  - `EvictionIntentLandingPage`
  - `HighIntentPageShell`
- Blocks follow required format:
  - Question
  - Short answer
  - Numbered steps
