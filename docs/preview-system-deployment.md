# Preview System Deployment Guide

This document covers the production-hardened, WebP-enabled preview system for tenancy agreements.

## Overview

The preview system generates multi-page, watermarked document previews rendered as images. Key features:

- **WebP by default** with JPEG fallback (~30% smaller file sizes)
- **Facts-based cache invalidation** (cache keys include facts hash)
- **Concurrency guards** (prevents duplicate parallel generation)
- **Rate limiting** (30 requests per 5 minutes per user)
- **Signed URLs** with 15-minute expiry
- **Unguessable storage paths** (HMAC-based)
- **Server-side watermark hashing** (non-PII user identification)
- **Automatic cleanup** (removes assets older than 24 hours)

## Environment Variables

Add these to your deployment environment:

```bash
# Required for watermark security (use a strong random string)
PREVIEW_WATERMARK_SECRET=your-secure-random-secret-min-32-chars

# Required for storage path security (use a different random string)
PREVIEW_PATH_SECRET=another-secure-random-secret-min-32-chars

# Optional: Customize rate limits (format: "N per M minutes")
RATE_LIMIT_PREVIEW=30 per 5 minutes

# Optional: Set Puppeteer executable path (only if not using @sparticuz/chromium)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### Generating Secrets

```bash
# Generate secure secrets
openssl rand -hex 32  # For PREVIEW_WATERMARK_SECRET
openssl rand -hex 32  # For PREVIEW_PATH_SECRET
```

## Dependencies

### Required npm packages

```json
{
  "dependencies": {
    "sharp": "^0.34.5",
    "puppeteer-core": "^24.34.0",
    "@sparticuz/chromium": "^143.0.4"
  }
}
```

### Chromium / Puppeteer

**Vercel / AWS Lambda:**
- Uses `@sparticuz/chromium` automatically
- No additional configuration needed
- Chromium binary is bundled and optimized for serverless

**Traditional Server:**
- Install Chrome or Chromium system-wide
- Set `PUPPETEER_EXECUTABLE_PATH` if not in standard location

```bash
# Ubuntu/Debian
apt-get install chromium-browser

# CentOS/RHEL
yum install chromium

# macOS
brew install --cask chromium
```

## Storage Bucket Configuration

### Supabase Storage

1. **Create bucket** named `documents` if not exists
2. **Set bucket to private** (no public access)
3. **Enable signed URLs** (default in Supabase)

```sql
-- Verify bucket is private (RLS should block public access)
SELECT * FROM storage.buckets WHERE name = 'documents';
```

### Bucket Policy

The preview images are stored in `previews/` subdirectory within the `documents` bucket. Ensure:

- Only authenticated users with valid signed URLs can access
- Objects are not publicly listable
- Signed URLs expire after 15 minutes

## API Endpoints

### GET /api/wizard/preview/[caseId]

Generates or returns cached preview manifest.

**Query Parameters:**
- `product`: `ast_standard`, `ast_premium`, etc.
- `tier`: `standard` | `premium`
- `force`: `true` to bypass cache and regenerate

**Response Headers:**
- `X-RateLimit-Limit`: Max requests in window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset timestamp
- `X-Preview-Source`: `cache` or `generated`
- `X-Facts-Hash`: Current facts hash

**Response:**
```json
{
  "status": "ready",
  "caseId": "...",
  "product": "ast_standard",
  "jurisdiction": "england",
  "pageCount": 12,
  "factsHash": "abc1234567890def",
  "pages": [
    {
      "page": 0,
      "width": 800,
      "height": 1131,
      "url": "https://...signed-url...",
      "mimeType": "image/webp",
      "expiresAt": "2026-01-30T12:15:00Z"
    }
  ],
  "generatedAt": "2026-01-30T12:00:00Z",
  "expiresAt": "2026-01-30T12:15:00Z"
}
```

### POST /api/wizard/preview/[caseId]

Triggers background preview generation (returns 202 immediately).

**Body:**
```json
{
  "product": "ast_standard",
  "tier": "standard",
  "force": false
}
```

## Caching Strategy

### Facts-Based Cache Invalidation

1. Each cached preview stores a `factsHash` (SHA-256 of sorted facts JSON)
2. On request, current facts are fetched and hashed
3. If hashes match, cached manifest is returned
4. If hashes differ, preview is regenerated

### Cache TTL

- **In-memory cache**: 2 hours
- **Signed URLs**: 15 minutes
- **Cleanup threshold**: 24 hours

### Multi-Instance Considerations

The current implementation uses in-memory caching. For multi-instance deployments:

1. **Redis recommended** for distributed cache
2. Implement Redis wrapper around the preview cache
3. Use Redis pub/sub for cache invalidation

## Rate Limiting

- **Limit**: 30 requests per 5 minutes
- **Scope**: Per user (authenticated) or per IP (unauthenticated)
- **Response**: 429 with `Retry-After` header

Override via environment:
```bash
RATE_LIMIT_PREVIEW="50 per 10 minutes"
```

## Security Considerations

### Watermark Hash

- Uses HMAC-SHA256 with server-side secret
- Produces 8-character non-PII identifier
- Allows tracing leaked previews to user
- Cannot be reversed to reveal user identity

### Storage Paths

- Uses HMAC-SHA256 to generate unguessable paths
- Format: `previews/{24-char-hash}/page_N.webp`
- Case ID not exposed in path

### Signed URLs

- 15-minute expiry
- Generated per-request (not cached)
- Supabase handles signature validation

## Monitoring

### Key Metrics

- Preview generation time (target: <10s)
- Cache hit rate (target: >80%)
- WebP conversion success rate
- Rate limit triggers
- Storage cleanup success

### Logging

```
[Preview] Generating preview for case {caseId}, product {product}, tier {tier}
[Preview] Document height: {height}px, pages: {count}
[Preview] Generated {pageCount} pages for case {caseId}
[Preview] Cache hit for {cacheKey}
[Preview] Cache stale for {caseKey} (facts changed)
[Preview] Cleanup complete: {deleted} files deleted
```

## Troubleshooting

### Preview Generation Fails

1. Check Chromium installation
2. Verify `PUPPETEER_EXECUTABLE_PATH` is correct
3. Check available memory (Puppeteer needs ~500MB)
4. Check storage bucket permissions

### WebP Conversion Fails

1. Verify sharp is installed: `pnpm list sharp`
2. Check native dependencies: `node -e "require('sharp')"`
3. Falls back to JPEG automatically

### Cache Not Invalidating

1. Verify facts are being updated in database
2. Check `factsHash` in manifest matches expected
3. Use `?force=true` to bypass cache

### Rate Limiting Too Strict

1. Adjust `RATE_LIMIT_PREVIEW` environment variable
2. For authenticated users, rate limit is per-user
3. For unauthenticated, rate limit is per-IP

## Performance Optimization

### Image Quality Settings

```typescript
// Current settings
WEBP_QUALITY = 80;  // Good quality, ~30% smaller than JPEG
JPEG_QUALITY = 75;  // Fallback quality

// Adjust if needed in preview-generator.ts
```

### Page Limits

```typescript
MAX_PAGES = 50;  // Safety limit per document
```

### Cleanup Schedule

- Runs during API requests (non-blocking)
- Triggered once per hour
- Removes files older than 24 hours

## Integration Testing

Run the preview tests:

```bash
pnpm test tests/unit/preview-generator.test.ts
pnpm test tests/integration/wizard-preview-api.test.ts
```

Test the live endpoint:

```bash
# Get preview (replace with real case ID)
curl -H "Authorization: Bearer $TOKEN" \
  "https://your-domain.com/api/wizard/preview/{caseId}?product=ast_standard"

# Force regeneration
curl -H "Authorization: Bearer $TOKEN" \
  "https://your-domain.com/api/wizard/preview/{caseId}?product=ast_standard&force=true"
```
