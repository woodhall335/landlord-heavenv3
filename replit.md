# Landlord Heaven v3 - Project Documentation

## Overview
Full-stack AI legal automation platform for UK landlords built with Next.js 16, Supabase, Stripe, and AI services (OpenAI & Anthropic).

**Purpose**: Automated legal document generation for UK tenancies including eviction notices, tenancy agreements, money claims, and HMO compliance.

**Current State**: Development setup complete and running on Replit. Requires API keys and database configuration.

## Recent Changes
- **2025-11-23**: Updated theme to match PandaDoc design
  - Changed primary color from teal (#16A085) to purple (#7C3AED)
  - Changed secondary color to emerald green (#10B981)
  - Updated all buttons to have more rounded corners (lg = 12px)
  - Updated hero section with larger, bolder typography (7xl font size)
  - Redesigned navigation with cleaner spacing and hover effects
  - Updated footer with better spacing and modern styling
  - Enhanced card designs with rounded corners and better shadows
  - Updated CTA sections with gradient backgrounds matching PandaDoc style

- **2025-11-22**: Initial Replit environment setup
  - Configured Next.js to run on port 5000 with host 0.0.0.0
  - Added experimental serverActions with allowedOrigins: ["*"] for Replit proxy
  - Set up workflow "Start application" running on port 5000
  - Installed all npm dependencies (532 packages)

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router, React 19, React Compiler enabled)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Payments**: Stripe (one-time products + HMO Pro subscriptions)
- **AI Services**:
  - OpenAI GPT-4/4.1 (conversational wizard, decision engine, document generation)
  - Anthropic Claude Sonnet 3.5/4 (QA validation)
- **Templating**: Handlebars
- **PDF Generation**: Puppeteer + pdf-lib
- **Email**: Resend
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI

### Directory Structure
```
src/
├── app/                  # Next.js 16 App Router pages and API routes
│   ├── api/             # Backend API endpoints
│   ├── dashboard/       # User dashboard pages
│   ├── wizard/          # Conversational wizard UI
│   └── auth/            # Authentication pages
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   ├── wizard/          # Wizard-specific components
│   └── layout/          # Layout components
├── lib/                 # Core business logic
│   ├── ai/              # AI client wrappers (OpenAI, Anthropic)
│   ├── decision-engine/ # Legal decision engine
│   ├── documents/       # Document generators (England/Wales, Scotland, NI)
│   ├── supabase/        # Database clients
│   └── stripe/          # Payment integration
config/
└── jurisdictions/       # Legal templates and rules for UK regions
supabase/
└── migrations/          # Database schema migrations
```

### Key Features
1. **Multi-jurisdiction Support**: England/Wales, Scotland, Northern Ireland
2. **Legal Workflows**: Section 8, Section 21, Money Claims, AST drafting
3. **HMO Pro**: Subscription tiers for HMO landlords (1-20 properties)
4. **AI Pipeline**: Conversational wizard → decision engine → document generation → QA
5. **Council Database**: 400+ UK councils with local rules
6. **Document Storage**: Generated documents stored in Supabase

## Environment Configuration

### Required Services
1. **Supabase**: Database, authentication, storage
2. **Stripe**: Payment processing (sandbox for development)
3. **OpenAI**: GPT-4 API access
4. **Anthropic**: Claude API access
5. **Resend** (optional): Email delivery

### Environment Variables
See `.env.example` for complete list. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Stripe product/price IDs for 9 products (5 one-time + 4 subscriptions)

## Development Setup

### Running Locally
```bash
npm run dev  # Runs on http://0.0.0.0:5000
```

### Database Setup
1. Create Supabase project
2. Run migrations in `supabase/migrations/` in order
3. Enable Row Level Security (RLS) on all tables
4. Configure auth settings

### Stripe Setup
1. Create products in Stripe Dashboard (test mode)
2. Configure webhook endpoint
3. Add price IDs to environment variables

## Deployment Notes
- Configured for Vercel deployment (see `vercel.json`)
- Includes cron jobs for SEO automation and compliance checks
- Production deployment requires all API keys and Stripe webhook configuration
- Frontend runs on port 5000 in Replit environment

## User Preferences
- None configured yet

## Known Issues
- Requires API keys setup before full functionality
- Database schema needs to be initialized
- Stripe products need to be created and configured
