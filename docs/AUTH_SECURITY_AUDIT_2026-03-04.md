# Supabase Auth / Session Security Follow-up (Evidence Pack)

Date: 2026-03-04  
Scope for this follow-up: anonymous session token capability path, redirect parameter usage, and Stripe checkout session creation locations.

---

## 1) Anonymous session token / capability mechanism

### 1.1 Where is the token generated?

**Generation + browser storage helper exists in `src/lib/session-token.ts`:**

```ts
const SESSION_TOKEN_KEY = 'lh_session_token';

export function generateSessionToken(): string {
  const token = crypto.randomUUID();
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}
```

```ts
export function getOrCreateSessionToken(): string {
  const existing = getSessionToken();
  if (existing) return existing;
  return generateSessionToken();
}
```

Also defined for request propagation:

```ts
export function getSessionTokenHeaders(): Record<string, string> {
  const token = getSessionToken();
  if (token) return { 'x-session-token': token };
  return {};
}
```

### 1.2 Where is it stored?

#### In browser
- Local storage key: `lh_session_token` in `src/lib/session-token.ts`.

#### In DB schema
- `public.cases.session_token TEXT` in migration schema.
- `public.documents.session_token TEXT` in migration schema.

Migration snippets:

```sql
-- Anonymous session token (for security)
session_token TEXT,
```

```sql
-- Anonymous session token
session_token TEXT,
```

#### RLS references
The migrations enforce token-based access for anonymous rows using request header `x-session-token`:

```sql
OR (user_id IS NULL AND session_token = current_setting('request.headers.x-session-token', true))
```

### 1.3 Where is `session_token` written in app code?

- In the TypeScript app/API routes, this follow-up found **no explicit write path** assigning `session_token` into `cases` or `documents`.
- The app has token utility helpers, but they are not referenced outside `src/lib/session-token.ts`.

### 1.4 Which routes validate token today?

#### Explicit route-level validation found
- `src/app/api/evidence/download/route.ts` validates `x-session-token` against `caseRow.session_token` for anonymous + unauthenticated access.

Snippet:

```ts
const requestSessionToken = getSessionTokenFromRequest(request);
const caseSessionToken = (caseRow as any).session_token;
if (caseSessionToken) {
  if (!requestSessionToken || requestSessionToken !== caseSessionToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

#### Not validating token at route level
- `src/app/api/wizard/case/[id]/route.ts` allows anonymous case read when `user_id === null` and does not check `session_token`.

Snippet:

```ts
const isOwner = user && caseRecord.user_id === user.id;
const isAnonymousCase = caseRecord.user_id === null;
if (!isOwner && !isAnonymousCase) {
  return NextResponse.json({ error: 'Case not found' }, { status: 404 });
}
```

- `src/app/api/wizard/save-facts/route.ts` and `src/app/api/wizard/answer/route.ts` use admin client for case mutations and do not show token-based anonymous capability checks.

---

## 2) Redirect parameters + `localStorage.auth_redirect` usage (safe/unsafe)

### 2.1 Signup page (`/auth/signup`) — **Unsafe**
File: `src/app/(app)/auth/signup/page.tsx`

```ts
const redirectUrl = searchParams.get('redirect');
const caseId = searchParams.get('case_id');
...
localStorage.setItem('auth_redirect', JSON.stringify({
  url: redirectUrl || null,
  caseId: caseId || null,
  timestamp: Date.now(),
}));
```

**Why unsafe:** untrusted query param is persisted for later redirect with no allowlist/sanitization at write time.

### 2.2 Login page (`/auth/login`) — **Unsafe**
File: `src/app/(app)/auth/login/page.tsx`

Stores `redirect` in local storage:

```ts
const redirectUrl = searchParams.get('redirect');
...
localStorage.setItem('auth_redirect', JSON.stringify({ url: redirectUrl || null, ... }));
```

Uses stored/query URL directly for navigation:

```ts
if (targetUrl) {
  router.push(targetUrl);
}
```

**Why unsafe:** dynamic redirect target is pushed directly.

### 2.3 Confirm page (`/auth/confirm`) — **Unsafe**
File: `src/app/(app)/auth/confirm/page.tsx`

Reads `auth_redirect` and returns arbitrary URL:

```ts
const stored = localStorage.getItem('auth_redirect');
...
if (parsed.url) {
  return parsed.url;
}
```

**Why unsafe:** redirects after confirmation can be influenced by previously stored untrusted values.

### 2.4 Auth callback route (`/api/auth/callback`) — **Unsafe pattern**
File: `src/app/api/auth/callback/route.ts`

```ts
const next = requestUrl.searchParams.get('next') || '/dashboard';
...
return NextResponse.redirect(`${requestUrl.origin}${next}`);
```

**Classification note:** concatenating origin reduces classic cross-origin open redirect, but `next` is still unsanitized/un-normalized and should be allowlisted to internal path format.

---

## 3) All Stripe checkout session creations

### 3.1 `src/app/api/checkout/create/route.ts`

Session creation:

```ts
const session = await stripe.checkout.sessions.create({
  ...
  success_url: success_url || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: cancel_url || `${baseUrl}/dashboard`,
});
```

Client inputs accepted in schema:

```ts
success_url: z.string().url().optional(),
cancel_url: z.string().url().optional(),
```

**Accepts success/cancel URL from client:** **Yes**.

### 3.2 `src/app/api/checkout/subscription/route.ts`

Session creation:

```ts
const session = await stripe.checkout.sessions.create({
  ...
  success_url: success_url || `${baseUrl}/dashboard/hmo?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: cancel_url || `${baseUrl}/dashboard/hmo`,
});
```

Client inputs accepted in schema:

```ts
success_url: z.string().url().optional(),
cancel_url: z.string().url().optional(),
```

**Accepts success/cancel URL from client:** **Yes**.

### 3.3 `src/lib/stripe/index.ts` (library wrappers)

One-time helper:

```ts
const session = await stripe.checkout.sessions.create({
  ...
  success_url: successUrl,
  cancel_url: cancelUrl,
});
```

Subscription helper:

```ts
const session = await stripe.checkout.sessions.create({
  ...
  success_url: successUrl,
  cancel_url: cancelUrl,
});
```

**Accepts success/cancel URL from caller:** **Yes** (function parameters). Whether caller is trusted depends on the route/service invoking these helpers.

---

## Command log used for this evidence pass

- `rg -n "generateSessionToken|getOrCreateSessionToken|session_token|x-session-token|getSessionTokenFromRequest|getSessionTokenHeaders" src`
- `rg -n "session_token" supabase src`
- `rg -n "getOrCreateSessionToken\(|generateSessionToken\(|getSessionTokenHeaders\(" src`
- `rg -n "stripe\.checkout\.sessions\.create\(" src`
- `nl -ba ...` on each cited file to extract exact snippets.


---

## Status (implemented)

- ✅ `fix(session-token): persist capability token for anonymous cases/documents`
  - Anonymous case creation paths now persist `session_token` from `x-session-token`.
  - Anonymous document persistence writes `documents.session_token` from request header.
- ✅ `fix(wizard): enforce ownership/capability token on wizard read/write`
  - Added shared access helper and applied to wizard read/write routes.
  - Client wizard calls now send `x-session-token` headers.
  - Added auth/capability unit tests.
- ✅ `fix(auth): prevent open redirects in signup/login/confirm/callback`
  - Added internal redirect sanitizer and applied to auth pages + callback.
- ✅ `fix(checkout): restrict Stripe success/cancel redirect URLs`
  - Checkout endpoints now always use canonical first-party dashboard URLs.
- ✅ `fix(auth): route login through rate-limited backend`
  - Login page now routes credentials through `/api/auth/login`.
- ✅ `fix(auth): update signup flow for confirm-email-off and reduce friction`
  - Signup flow no longer routes users to `/auth/verify-email` by default.
- ✅ `docs: update auth security audit status`
  - This status section + checklist added.

### Manual verification checklist

1. Anonymous preview journey:
   - Start wizard anonymously, confirm requests include `x-session-token`, and case mutations/reads work only with matching token.
2. Auth redirect safety:
   - Attempt `?redirect=https://evil.test` and confirm post-auth navigation falls back to `/dashboard`.
3. Login rate limiting:
   - Confirm login is performed via `POST /api/auth/login` and repeated failures trigger backend limiter.
4. Checkout redirect safety:
   - Attempt client `success_url/cancel_url` override and verify Stripe session uses canonical dashboard URLs.
5. Signup flow (confirm-email off):
   - Complete signup and confirm no forced `/auth/verify-email` step.
