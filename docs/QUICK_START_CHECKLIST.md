# ⚡ LANDLORD HEAVEN - QUICK START CHECKLIST

**Version:** 1.0  
**Purpose:** Get from zero to running in 30 minutes  
**Target:** Week 1, Day 1 setup

---

## ✅ PRE-FLIGHT CHECKLIST (5 minutes)

### Required Accounts
- [ ] GitHub account (for version control)
- [ ] Supabase account (database + auth)
- [ ] OpenAI account + API key
- [ ] Anthropic account + API key
- [ ] Stripe account (test mode for now)
- [ ] Resend account (email)
- [ ] Vercel account (deployment)

### Local Environment
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] VS Code or preferred editor
- [ ] Claude Code CLI installed (if using)

---

## 🚀 SETUP SEQUENCE (25 minutes)

### Step 1: Project Initialization (3 minutes)

```bash
# Create project
mkdir landlord-heaven
cd landlord-heaven

# Initialize Next.js
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Answer prompts:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: Yes
# ✓ App Router: Yes
# ✓ Import alias: @/*

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

**Checkpoint:** ✅ Next.js app created

---

### Step 2: Documentation Setup (2 minutes)

```bash
# Create docs folder
mkdir docs

# Copy all 8 markdown files to docs/
# - LANDLORD_HEAVEN_BLUEPRINT_v6.0.md
# - STYLE_GUIDE.md
# - CONVERSATIONAL_WIZARD_SPECIFICATION.md
# - DATABASE_SCHEMA.md
# - HMO_PRO_MEMBERSHIP_SPECIFICATION.md
# - LEGAL_AGENT_SPECIFICATION.md
# - AI_PIPELINE_ARCHITECTURE.md
# - README.md

# Verify
ls -la docs/
# Should show 8 .md files
```

**Checkpoint:** ✅ Documentation in place

---

### Step 3: Dependencies Installation (3 minutes)

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js
npm install openai anthropic-ai
npm install handlebars puppeteer
npm install resend
npm install zod date-fns
npm install react-hook-form
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
npm install lucide-react
npm install clsx tailwind-merge class-variance-authority

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier eslint-config-prettier
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

**Checkpoint:** ✅ All packages installed

---

### Step 4: Environment Setup (5 minutes)

```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

# Create .env.example (for git)
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

# Add to .gitignore
echo ".env.local" >> .gitignore
```

**Action Required:** Fill in your actual API keys in `.env.local`

**Checkpoint:** ✅ Environment configured

---

### Step 5: Supabase Database Setup (5 minutes)

```bash
# Create Supabase project at https://supabase.com
# - Project name: landlord-heaven
# - Region: Choose closest
# - Database password: Save securely

# Get your credentials:
# - Project URL: https://xxx.supabase.co
# - Anon key: eyJhbG...
# - Service role key: eyJhbG... (keep secret!)

# Update .env.local with these values

# Create initial migration
mkdir -p supabase/migrations
cat > supabase/migrations/001_initial_schema.sql << 'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial users table (basic structure)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);
EOF

# Note: Full schema will be created by Agent 2
```

**Checkpoint:** ✅ Supabase ready

---

### Step 6: Project Structure (3 minutes)

```bash
# Create folder structure
mkdir -p src/app/api
mkdir -p src/components/ui
mkdir -p src/components/wizard
mkdir -p src/components/dashboard
mkdir -p src/lib/ai
mkdir -p src/lib/supabase
mkdir -p src/lib/stripe
mkdir -p src/lib/documents
mkdir -p src/types
mkdir -p config/jurisdictions
mkdir -p config/councils
mkdir -p public/images

# Create lib utilities
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
```

**Checkpoint:** ✅ Project structure ready

---

### Step 7: Basic Configuration (4 minutes)

```bash
# Update tsconfig.json paths
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/config/*": ["./config/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Update package.json scripts
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="next lint"
npm pkg set scripts.format="prettier --write \"**/*.{js,jsx,ts,tsx,md,json}\""
```

**Checkpoint:** ✅ Configuration complete

---

## 🧪 VERIFICATION (5 minutes)

### Test 1: Dev Server
```bash
npm run dev
# Should start on http://localhost:3000
# Visit in browser - should see Next.js default page
```

### Test 2: Environment Variables
```bash
# Create quick test file
cat > src/app/api/test/route.ts << 'EOF'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    resend: !!process.env.RESEND_API_KEY,
  });
}
EOF

# Visit http://localhost:3000/api/test
# Should show: { "supabase": true, "openai": true, ... }
```

### Test 3: TypeScript
```bash
npm run build
# Should compile with no errors
```

**Checkpoint:** ✅ Everything working

---

## 📝 COMMIT PROGRESS

```bash
git add .
git commit -m "Setup complete: dependencies, structure, config"
git branch -M main
```

---

## 🎯 NEXT STEPS

You're now ready to start building! Choose your path:

### Option A: Sequential Agent Approach
```bash
# Start with Agent 6 (Legal) - Days 1-3
# Then move to other agents in parallel
```

### Option B: Claude Code Automated
```bash
# Give Claude Code the full build guide
# Let it execute all agent tasks
```

### Option C: Manual Development
```bash
# Use the build guide as a reference
# Build components one by one
```

---

## 🔍 TROUBLESHOOTING QUICK FIXES

### Issue: npm install fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
```bash
# Restart TS server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Supabase connection fails
```bash
# Verify URL and keys in .env.local
# Check Supabase project status
# Ensure no typos in environment variables
```

### Issue: Port 3000 already in use
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

---

## ✅ COMPLETION CHECKLIST

Before moving to Agent tasks, verify:

- [ ] ✅ Project initialized
- [ ] ✅ All 8 docs in `/docs` folder
- [ ] ✅ Dependencies installed (no errors)
- [ ] ✅ `.env.local` created with real API keys
- [ ] ✅ Supabase project created
- [ ] ✅ Project structure created
- [ ] ✅ Dev server runs successfully
- [ ] ✅ TypeScript compiles
- [ ] ✅ Environment variables loaded
- [ ] ✅ Git initialized and committed

---

## 🎉 SUCCESS!

**Time Elapsed:** ~30 minutes  
**Status:** Ready for Agent 6 (Legal) to begin  
**Next:** Refer to `CLAUDE_CODE_BUILD_GUIDE.md` for detailed agent tasks

---

**Pro Tip:** Create a GitHub repo now and push:
```bash
gh repo create landlord-heaven --private
git remote add origin https://github.com/yourusername/landlord-heaven.git
git push -u origin main
```

**END OF QUICK START CHECKLIST**
