# Launch Readiness Fixes

**Date:** December 29, 2025
**Branch:** `claude/audit-launch-readiness-QdUhB`

This document summarises the fixes implemented to address the launch readiness audit findings.

---

## Summary of Changes

| Area | Files Changed | Status |
|------|---------------|--------|
| Error Handling | 3 new files | Complete |
| SEO | 2 new files | Complete |
| CORS | 2 files modified | Complete |
| Logging | 5 files modified | Complete |
| Rate Limiting | 4 files modified | Complete |

---

## 1. Error Handling (App Router)

### New Files Created

| File | Purpose |
|------|---------|
| `src/app/error.tsx` | Global error boundary with "Try Again" and "Go Home" buttons |
| `src/app/not-found.tsx` | Custom 404 page with navigation to homepage/dashboard |
| `src/app/loading.tsx` | Skeleton loading state with animated placeholders |

### Features

- **error.tsx**: Client component that catches runtime errors
  - Shows error digest/ID for support reference
  - Development mode shows full error stack trace
  - Production mode shows user-friendly message only
  - "Try Again" button uses `reset()` callback

- **not-found.tsx**: Static 404 page
  - SEO metadata with `noindex,nofollow`
  - Links to homepage and dashboard
  - Help/support link

- **loading.tsx**: Lightweight skeleton
  - No external dependencies
  - Tailwind CSS animations only
  - Responsive grid layout

---

## 2. SEO Files

### New Files Created

| File | Purpose |
|------|---------|
| `src/app/robots.ts` | Dynamic robots.txt using Next.js metadata API |
| `src/app/sitemap.ts` | Dynamic sitemap.xml with all public pages |

### robots.txt Behaviour

| Environment | Behaviour |
|-------------|-----------|
| Production (`VERCEL_ENV=production`) | Allow crawlers, block `/api/`, `/dashboard/`, `/auth/`, `/wizard/`, `/admin/` |
| Preview/Staging | Disallow all crawlers |
| Development | Disallow all crawlers |

### Sitemap Coverage

- Core marketing pages (homepage, pricing, about, contact, help)
- Legal pages (terms, privacy, cookies)
- Product pages (notice-only, complete-pack, money-claim, tenancy-agreements)
- Auth entry points (login, signup)

---

## 3. CORS Configuration

### Files Modified

| File | Change |
|------|--------|
| `vercel.json` | Removed static `Access-Control-Allow-Origin: *` header block |
| `src/middleware.ts` | NEW - Dynamic CORS middleware |
| `.env.example` | Added `ALLOWED_ORIGINS` variable |

### CORS Behaviour

| Environment | Allowed Origins |
|-------------|-----------------|
| Production | `ALLOWED_ORIGINS` env var, or defaults to `landlordheaven.co.uk` |
| Preview | Localhost ports + `*.vercel.app` |
| Development | Localhost ports (3000, 5000) |

### Middleware Features

- Handles preflight OPTIONS requests
- Sets proper CORS headers dynamically
- Matches on `/api/*` routes only
- Preserves security headers from vercel.json

---

## 4. Logging

### New Files Created

| File | Purpose |
|------|---------|
| `src/lib/logger.ts` | Production-safe logger utility |

### Logger Features

- Log levels: `debug`, `info`, `warn`, `error`
- Environment-aware defaults:
  - Production: `warn` (suppresses debug/info)
  - Development: `debug` (shows all)
- Automatic sensitive data redaction (passwords, tokens, API keys)
- Structured JSON output with timestamps
- Configurable via `LOG_LEVEL` env var

### Files Updated

| File | Changes |
|------|---------|
| `src/app/api/auth/signup/route.ts` | Replaced `console.log/error` with `logger` |
| `src/app/api/auth/login/route.ts` | Replaced `console.log/error` with `logger` |
| `src/app/api/webhooks/stripe/route.ts` | Key error paths use `logger` |
| `src/app/api/ask-heaven/chat/route.ts` | Added error logging |

### Usage

```typescript
import { logger } from '@/lib/logger';

logger.info('User signed up', { userId: '123' });
logger.warn('Rate limit approaching', { count: 45, limit: 50 });
logger.error('Payment failed', { error: err.message });
```

---

## 5. Rate Limiting

### New Files Created

| File | Purpose |
|------|---------|
| `src/lib/rate-limit.ts` | In-memory rate limiter |

### Rate Limiter Features

- Memory-based (single instance) with automatic cleanup
- Configurable via env vars (`RATE_LIMIT_*`)
- Pre-configured limiters for common use cases
- HOC wrapper `withRateLimit()` for easy integration
- Proper 429 responses with `Retry-After` header
- Rate limit headers on all responses (`X-RateLimit-*`)

### Pre-configured Limiters

| Limiter | Default | Env Var |
|---------|---------|---------|
| `auth` | 5 per minute | N/A (fixed for security) |
| `wizard` | 50 per 15 minutes | `RATE_LIMIT_WIZARD` |
| `generation` | 10 per hour | `RATE_LIMIT_GENERATION` |
| `api` | 100 per 15 minutes | `RATE_LIMIT_API` |

### Files Updated

| File | Changes |
|------|---------|
| `src/app/api/auth/signup/route.ts` | Added `rateLimiters.auth` |
| `src/app/api/auth/login/route.ts` | Added `rateLimiters.auth` |
| `src/app/api/ask-heaven/chat/route.ts` | Added `rateLimiters.wizard` |

### Note on Scaling

The current implementation uses in-memory storage, which:
- Works for single-instance deployments
- Resets on server restart
- Does NOT share state across instances

For multi-instance/serverless deployments, consider upgrading to:
- Upstash Redis (`@upstash/ratelimit`)
- Vercel KV

---

## Required Environment Variables

Add these to your production environment:

```env
# CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS="https://landlordheaven.co.uk,https://www.landlordheaven.co.uk"

# Logging level (debug | info | warn | error)
LOG_LEVEL="warn"

# Rate limiting (already in .env.example)
RATE_LIMIT_WIZARD="50 per 15 minutes"
RATE_LIMIT_GENERATION="10 per hour"
RATE_LIMIT_API="100 per 15 minutes"
```

---

## Manual Test Checklist

### Error Pages

- [ ] Navigate to `/nonexistent-page` → See 404 page
- [ ] Trigger a runtime error → See error page with "Try Again" button
- [ ] Navigate during loading → See skeleton loading state

### SEO

- [ ] Visit `/robots.txt` → Should show crawl rules
- [ ] Visit `/sitemap.xml` → Should list all public pages
- [ ] In preview deploy → robots.txt should disallow all

### CORS

- [ ] Make API request from allowed origin → Success
- [ ] Make API request from disallowed origin → CORS error
- [ ] Test OPTIONS preflight request → 204 response

### Rate Limiting

- [ ] Make 6 rapid login attempts → Get 429 on 6th
- [ ] Check response headers for `X-RateLimit-*`
- [ ] Wait for window reset → Requests succeed again

### Logging

- [ ] In development → See debug/info logs
- [ ] Set `LOG_LEVEL=error` → Only see errors
- [ ] Check logs don't contain passwords/tokens

---

## Files Changed Summary

```
New files:
  src/app/error.tsx
  src/app/not-found.tsx
  src/app/loading.tsx
  src/app/robots.ts
  src/app/sitemap.ts
  src/lib/logger.ts
  src/lib/rate-limit.ts
  src/middleware.ts

Modified files:
  vercel.json
  .env.example
  src/app/api/auth/signup/route.ts
  src/app/api/auth/login/route.ts
  src/app/api/webhooks/stripe/route.ts
  src/app/api/ask-heaven/chat/route.ts
```

---

## Next Steps (Optional Enhancements)

1. **Redis Rate Limiting**: For serverless/multi-instance scaling
2. **Error Monitoring**: Integrate Sentry for production error tracking
3. **Console.log Cleanup**: Remaining ~200 console.log statements could be migrated incrementally
4. **Cookie Consent Banner**: Add GDPR-compliant cookie consent UI
