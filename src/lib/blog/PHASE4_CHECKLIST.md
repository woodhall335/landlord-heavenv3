# Phase 4 Checklist (Blog Funnel Hardening)

- [x] SEO done
- [x] OG image done
- [x] A11y done
- [x] Funnel mapping done
- [x] Analytics verified
- [x] Stability verified

## Assumptions

- Analytics helper path remains `@/lib/analytics` and accepts custom event properties.
- Canonical base URL is provided by `SITE_ORIGIN` + `getCanonicalUrl`.
- FAQ source of truth is `post.faqs` in `src/lib/blog/posts.tsx`.
- Lead magnet email flow is local submit tracking only (no backend toggle/config was changed in this phase).
