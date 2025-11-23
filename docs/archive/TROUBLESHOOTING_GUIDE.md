# 🔧 LANDLORD HEAVEN - TROUBLESHOOTING GUIDE

**Version:** 1.0  
**Purpose:** Quick solutions to common development issues  
**Last Updated:** November 2024

---

## 📋 TABLE OF CONTENTS

1. [Setup & Installation Issues](#setup--installation-issues)
2. [Environment & Configuration](#environment--configuration)
3. [Database & Supabase](#database--supabase)
4. [AI Integration](#ai-integration)
5. [Stripe & Payments](#stripe--payments)
6. [Build & Deployment](#build--deployment)
7. [Performance Issues](#performance-issues)
8. [Common Error Messages](#common-error-messages)

---

## 🚧 SETUP & INSTALLATION ISSUES

### Issue: `npm install` fails with ERESOLVE

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Try legacy peer deps:**
```bash
npm install --legacy-peer-deps
```

2. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **Use correct Node version:**
```bash
node --version
# Should be 18.x or higher
# If not, install using nvm:
nvm install 18
nvm use 18
```

---

### Issue: TypeScript version conflicts

**Error:**
```
The project's TypeScript version (5.x) doesn't match the VS Code version (4.x)
```

**Solution:**
```bash
# Use workspace TypeScript version
# In VS Code: Cmd+Shift+P → "TypeScript: Select TypeScript Version"
# Choose "Use Workspace Version"

# Or update VS Code TypeScript:
npm install -g typescript@latest
```

---

### Issue: Tailwind CSS not working

**Error:**
- No styles applied
- `className` has no effect

**Solutions:**

1. **Check `tailwind.config.ts` content paths:**
```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Must match your structure
]
```

2. **Verify `globals.css` includes Tailwind:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **Restart dev server:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## ⚙️ ENVIRONMENT & CONFIGURATION

### Issue: Environment variables not loading

**Error:**
```
process.env.SUPABASE_URL is undefined
```

**Solutions:**

1. **Check file name:**
```bash
# Must be .env.local (not .env or .env.development)
ls -la | grep env
```

2. **Verify variable names:**
```bash
# Public vars must start with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=...  # ✅ Accessible in browser
SUPABASE_URL=...               # ❌ Only on server
```

3. **Restart dev server after changes:**
```bash
# .env changes require restart
npm run dev
```

4. **Check syntax:**
```bash
# No spaces around =
NEXT_PUBLIC_API_URL=https://example.com  # ✅
NEXT_PUBLIC_API_URL = https://example.com  # ❌
```

---

### Issue: CORS errors in development

**Error:**
```
Access to fetch at 'https://api.example.com' blocked by CORS policy
```

**Solutions:**

1. **Use Next.js API routes as proxy:**
```typescript
// /src/app/api/proxy/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(process.env.EXTERNAL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response;
}
```

2. **Configure `next.config.js` rewrites:**
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'https://external-api.com/:path*',
      },
    ];
  },
};
```

---

## 🗄️ DATABASE & SUPABASE

### Issue: Supabase connection refused

**Error:**
```
Error: connect ECONNREFUSED
```

**Solutions:**

1. **Verify Supabase project is active:**
```bash
# Check project status at: https://app.supabase.com
# Ensure project isn't paused (free tier)
```

2. **Check environment variables:**
```bash
# Verify URL format:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # ✅
NEXT_PUBLIC_SUPABASE_URL=xxx.supabase.co          # ❌ Missing https://
```

3. **Test connection:**
```typescript
// Create test endpoint: /src/app/api/test-db/route.ts
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase.from("users").select("count");
  
  return Response.json({ connected: !error, error });
}
```

---

### Issue: RLS (Row Level Security) blocks queries

**Error:**
```
Error: new row violates row-level security policy
```

**Solutions:**

1. **Check RLS policies exist:**
```sql
-- In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. **Verify authentication:**
```typescript
// Ensure user is authenticated:
const { data: { user } } = await supabase.auth.getUser();
console.log("User:", user);  // Should not be null
```

3. **Use service role for admin operations:**
```typescript
// Server-side only:
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Bypasses RLS
);
```

4. **Temporarily disable RLS for testing:**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- DON'T FORGET TO RE-ENABLE!
```

---

### Issue: Database migrations fail

**Error:**
```
relation "users" already exists
```

**Solutions:**

1. **Reset database (development only):**
```sql
-- In Supabase SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. **Use proper migration order:**
```bash
# Migrations must be numbered sequentially:
001_initial_schema.sql
002_add_hmo_tables.sql
003_add_indexes.sql
```

3. **Check for duplicate table names:**
```sql
-- List all tables:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🤖 AI INTEGRATION

### Issue: OpenAI API key invalid

**Error:**
```
Error: Incorrect API key provided
```

**Solutions:**

1. **Verify API key format:**
```bash
# Should start with sk-
OPENAI_API_KEY=sk-proj-...  # ✅
OPENAI_API_KEY=proj-...      # ❌
```

2. **Check account status:**
```bash
# Visit: https://platform.openai.com/account/billing
# Ensure you have credits
```

3. **Test with curl:**
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

### Issue: Rate limit exceeded

**Error:**
```
Error: Rate limit reached for requests
```

**Solutions:**

1. **Implement rate limiting:**
```typescript
// /src/lib/ai/rate-limiter.ts
const rateLimit = new Map();

export async function checkRateLimit(userId: string) {
  const now = Date.now();
  const userLimits = rateLimit.get(userId) || [];
  
  // Remove old requests (>1 hour)
  const recentRequests = userLimits.filter(
    (time: number) => now - time < 3600000
  );
  
  if (recentRequests.length >= 50) {
    throw new Error("Rate limit exceeded");
  }
  
  recentRequests.push(now);
  rateLimit.set(userId, recentRequests);
}
```

2. **Add retry logic with exponential backoff:**
```typescript
async function callAIWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await openai.chat.completions.create({...});
    } catch (error: any) {
      if (error.code === 'rate_limit_exceeded' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

### Issue: AI responses are inconsistent

**Problem:**
- Sometimes works, sometimes returns gibberish
- Quality varies dramatically

**Solutions:**

1. **Set temperature correctly:**
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  temperature: 0.3,  // Lower = more consistent (use for legal docs)
  // temperature: 0.7,  // Higher = more creative (use for conversation)
});
```

2. **Use JSON mode for structured outputs:**
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  response_format: { type: "json_object" },  // Forces valid JSON
});
```

3. **Add validation layer:**
```typescript
async function generateDocument(facts: any) {
  const document = await callAI(facts);
  const qaScore = await validateWithClaude(document);
  
  if (qaScore < 85) {
    // Regenerate with corrections
    return generateDocument(facts);
  }
  
  return document;
}
```

---

## 💳 STRIPE & PAYMENTS

### Issue: Stripe webhook not receiving events

**Error:**
- Checkout completes but no webhook received
- Orders not fulfilled

**Solutions:**

1. **Use Stripe CLI for local testing:**
```bash
# Install Stripe CLI:
brew install stripe/stripe-cli/stripe

# Login:
stripe login

# Forward webhooks to local:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret to .env.local
```

2. **Verify webhook signature:**
```typescript
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    // Process event...
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
}
```

3. **Check endpoint configuration:**
```bash
# In Stripe Dashboard → Developers → Webhooks
# Endpoint URL: https://yourdomain.com/api/webhooks/stripe
# Events to send:
#   - checkout.session.completed
#   - customer.subscription.created
#   - customer.subscription.updated
#   - customer.subscription.deleted
```

---

### Issue: Payment intent creation fails

**Error:**
```
Error: A payment method must be provided
```

**Solutions:**

1. **Use Checkout Session (recommended):**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{
    price_data: {
      currency: "gbp",
      product_data: { name: "Notice Only" },
      unit_amount: 2999,  // £29.99 in pence
    },
    quantity: 1,
  }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
});
```

2. **For subscriptions, use trial period:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{
    price: "price_xxx",  // Your Stripe price ID
    quantity: 1,
  }],
  subscription_data: {
    trial_period_days: 7,
  },
  success_url: "...",
});
```

---

### Issue: Test mode vs Live mode confusion

**Problem:**
- Payments work in test but fail in production
- Keys mixed up

**Solutions:**

1. **Use environment-specific keys:**
```bash
# .env.local (development)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# .env.production (Vercel)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

2. **Check key prefix:**
```typescript
// Add validation:
if (process.env.NODE_ENV === 'production') {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    throw new Error('Production must use live Stripe key');
  }
}
```

3. **Use test cards in development:**
```
Test Card: 4242 4242 4242 4242
Any future expiry date
Any 3-digit CVC
Any 5-digit postal code
```

---

## 🚀 BUILD & DEPLOYMENT

### Issue: Build fails on Vercel

**Error:**
```
Error: Failed to compile
```

**Solutions:**

1. **Check build locally first:**
```bash
npm run build
# Fix any errors shown
```

2. **Common build errors:**

**TypeScript errors:**
```bash
# Run type check:
npx tsc --noEmit

# Fix all type errors before deploying
```

**Missing environment variables:**
```bash
# In Vercel dashboard → Settings → Environment Variables
# Add all variables from .env.local
# Select: Production, Preview, Development
```

**Module not found:**
```bash
# Verify all imports use correct paths:
import { Button } from "@/components/ui/Button";  # ✅
import { Button } from "components/ui/Button";     # ❌
```

---

### Issue: Deployed site shows 404 for routes

**Error:**
- `/wizard` works locally but 404 on Vercel
- Dynamic routes not working

**Solutions:**

1. **Verify file structure:**
```
src/app/
  ├── page.tsx              → /
  ├── wizard/
  │   └── page.tsx          → /wizard
  └── api/
      └── test/
          └── route.ts      → /api/test
```

2. **Check output configuration:**
```javascript
// next.config.js
module.exports = {
  output: 'standalone',  // For Vercel
};
```

3. **Clear Vercel cache:**
```bash
# In Vercel dashboard → Deployments → ...
# Click "Redeploy" (without cache)
```

---

### Issue: Functions timing out

**Error:**
```
Error: Function execution timeout exceeded
```

**Solutions:**

1. **Increase timeout (Vercel Pro only):**
```javascript
// next.config.js
export const config = {
  maxDuration: 60,  // 60 seconds
};
```

2. **Optimize slow operations:**
```typescript
// Instead of:
const result = await generateLargeDocument();  // Takes 20s

// Do:
const result = await Promise.race([
  generateLargeDocument(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 10000)
  )
]);
```

3. **Use background jobs:**
```typescript
// Queue long operations:
await queueJob("generate_document", { caseId });
// Return immediately
return Response.json({ status: "queued" });
```

---

## ⚡ PERFORMANCE ISSUES

### Issue: Slow page loads

**Problem:**
- Pages take >3 seconds to load
- Poor Lighthouse scores

**Solutions:**

1. **Optimize images:**
```typescript
import Image from "next/image";

// Instead of:
<img src="/logo.png" alt="Logo" />

// Use:
<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority  // For above-fold images
/>
```

2. **Enable caching:**
```typescript
// API routes:
export async function GET(request: Request) {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

3. **Use dynamic imports:**
```typescript
// Instead of:
import HeavyComponent from "./HeavyComponent";

// Use:
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
});
```

---

### Issue: High API costs (OpenAI/Claude)

**Problem:**
- AI costs exceeding budget
- Unexpected charges

**Solutions:**

1. **Track token usage:**
```typescript
async function callAI(prompt: string) {
  const response = await openai.chat.completions.create({...});
  
  // Log usage:
  await db.insert({
    model: "gpt-4",
    input_tokens: response.usage.prompt_tokens,
    output_tokens: response.usage.completion_tokens,
    cost: calculateCost(response.usage),
  });
  
  return response;
}
```

2. **Set max_tokens limits:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  max_tokens: 2000,  // Prevent runaway costs
  messages: [...],
});
```

3. **Use cheaper models where possible:**
```typescript
// Fact-finding: GPT-4.1 mini ($0.15/1M tokens)
// Document gen: GPT-4 ($2.50/1M tokens)
// QA check: Claude Sonnet 4 ($3.00/1M tokens)
```

---

## 🐛 COMMON ERROR MESSAGES

### "Cannot find module '@/...'

**Solution:**
```typescript
// Check tsconfig.json has paths:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Restart TS server in VS Code
```

---

### "Hydration failed because the initial UI does not match"

**Solution:**
```typescript
// Caused by server/client mismatch

// Bad:
<div>{Math.random()}</div>  // Different on server/client

// Good:
const [random] = useState(() => Math.random());  // Same value
<div>{random}</div>
```

---

### "Too many re-renders. React limits the number of renders"

**Solution:**
```typescript
// Bad:
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // Infinite loop!
  return <div>{count}</div>;
}

// Good:
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, []);  // Run once on mount
  return <div>{count}</div>;
}
```

---

### "Module not found: Can't resolve 'fs'"

**Solution:**
```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

---

## 📞 GETTING HELP

### Before asking for help:

1. **Check logs:**
```bash
# Browser console (F12)
# Vercel logs (Dashboard → Functions → Logs)
# Supabase logs (Dashboard → Logs)
```

2. **Search error message:**
- Google: `[exact error message] next.js`
- Stack Overflow
- GitHub Issues

3. **Create minimal reproduction:**
```bash
# Isolate the problem
# Remove unrelated code
# Test in isolation
```

### When asking for help:

Include:
- ✅ Full error message
- ✅ Code snippet causing issue
- ✅ What you've already tried
- ✅ Environment (Node version, OS, etc.)
- ✅ Relevant configuration files

Don't:
- ❌ Just say "it doesn't work"
- ❌ Screenshot entire screen
- ❌ Share unformatted code dumps

---

## 🔍 DEBUGGING TIPS

### Enable verbose logging:

```typescript
// .env.local
DEBUG=true
LOG_LEVEL=debug

// /src/lib/logger.ts
export function log(level: string, message: string, data?: any) {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log(`[${level}] ${message}`, data);
  }
}
```

### Use debugger:

```typescript
function problematicFunction() {
  const data = fetchData();
  debugger;  // Execution pauses here in browser/VSCode
  return processData(data);
}
```

### Test in isolation:

```typescript
// Create test API route:
// /src/app/api/debug/route.ts
export async function GET() {
  const result = await problematicFunction();
  return Response.json({
    success: true,
    result,
    env: process.env.NODE_ENV,
  });
}
```

---

## ✅ PREVENTION CHECKLIST

Before deploying:

- [ ] Run `npm run build` locally (no errors)
- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] API keys valid
- [ ] No console errors in browser
- [ ] Mobile layout tested
- [ ] Performance acceptable (<3s load)
- [ ] Error handling in place
- [ ] Logging configured

---

**END OF TROUBLESHOOTING GUIDE**

Most issues can be solved by:
1. Reading error messages carefully
2. Checking environment variables
3. Restarting dev server
4. Clearing cache
5. Consulting documentation

Good luck! 🚀
