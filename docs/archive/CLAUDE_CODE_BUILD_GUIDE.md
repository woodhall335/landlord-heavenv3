# 🚀 LANDLORD HEAVEN - CLAUDE CODE BUILD GUIDE

**Version:** 1.0  
**Date:** November 2024  
**Purpose:** Step-by-step commands for Claude Code to build the entire project

---

## 📋 OVERVIEW

This guide uses the **6-Agent Approach** where each agent has a specialized role:

- **Agent 1:** Frontend Developer (UI/UX)
- **Agent 2:** Backend Developer (Database/API)
- **Agent 3:** AI Pipeline Engineer (GPT/Claude integration)
- **Agent 4:** Payment Systems (Stripe integration)
- **Agent 5:** DevOps/Config (Deployment/Environment)
- **Agent 6:** Legal Architect (Document templates/Legal logic)

Each agent references the `/docs` folder at every step for consistency.

---

## 🎯 SETUP PHASE

### Step 1: Project Initialization

```bash
# Create project structure
mkdir -p landlord-heaven/{src,docs,public,tests,config}
cd landlord-heaven

# Initialize Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Initialize git
git init
git add .
git commit -m "Initial commit - Project setup"
```

### Step 2: Copy Documentation

```bash
# Create docs directory
mkdir -p docs

# Copy all documentation files to /docs
# (You'll need to manually copy the 8 markdown files from the project)
```

**Required files in `/docs`:**
- LANDLORD_HEAVEN_BLUEPRINT_v6.0.md
- STYLE_GUIDE.md
- CONVERSATIONAL_WIZARD_SPECIFICATION.md
- DATABASE_SCHEMA.md
- HMO_PRO_MEMBERSHIP_SPECIFICATION.md
- LEGAL_AGENT_SPECIFICATION.md
- AI_PIPELINE_ARCHITECTURE.md
- README.md

### Step 3: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js
npm install openai anthropic-ai
npm install handlebars puppeteer
npm install resend
npm install zod
npm install date-fns
npm install react-hook-form
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react
npm install clsx tailwind-merge

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint prettier
npm install -D @testing-library/react @testing-library/jest-dom
```

---

## 👤 AGENT 1: FRONTEND DEVELOPER

**Role:** Build all UI components and pages  
**References:** STYLE_GUIDE.md, CONVERSATIONAL_WIZARD_SPECIFICATION.md

### Task 1.1: Setup Design System

```bash
# Claude Code command:
"Agent 1 - Read /docs/STYLE_GUIDE.md and create the following:
1. Create /src/lib/design-system/colors.ts with the complete color palette
2. Create /src/lib/design-system/typography.ts with font configurations
3. Create /src/components/ui/ folder with these base components:
   - Button.tsx (primary, secondary, large variants)
   - Card.tsx
   - Input.tsx (with label, helper text, error states)
   - Badge.tsx (including HMO Pro badge)
4. Update tailwind.config.ts with the custom theme
5. Ensure all components follow the 44px minimum touch target rule
6. Add proper TypeScript types for all props"
```

### Task 1.2: Landing Page

```bash
# Claude Code command:
"Agent 1 - Read /docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md section on products and create:
1. /src/app/page.tsx - Landing page with:
   - Hero section (explain the value proposition)
   - Product cards (5 one-time products + HMO Pro)
   - Pricing display
   - CTA buttons leading to wizard
   - Trust indicators (legal compliance, secure, etc.)
2. Use components from /src/components/ui/
3. Follow STYLE_GUIDE.md for colors and spacing
4. Mobile-first responsive design
5. Include proper meta tags for SEO"
```

### Task 1.3: Conversational Wizard UI

```bash
# Claude Code command:
"Agent 1 - Read /docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md completely and create:
1. /src/app/wizard/page.tsx - Main wizard container
2. /src/components/wizard/ folder with:
   - ConversationPanel.tsx (left side, 60% width)
   - ContextPanel.tsx (right side, 40% width)
   - QuestionRenderer.tsx (renders different input types)
   - ProgressBar.tsx
   - InputTypes/ folder with:
     * MultipleChoice.tsx
     * CurrencyInput.tsx
     * DatePicker.tsx
     * YesNoToggle.tsx
     * TextInput.tsx
     * MultipleSelection.tsx
     * FileUpload.tsx
     * ScaleSlider.tsx
3. Implement the 2-column layout (conversation + context)
4. All inputs must follow the specification exactly
5. Mobile layout: stack vertically with collapsible context
6. Follow STYLE_GUIDE.md for all styling"
```

### Task 1.4: HMO Pro Dashboard

```bash
# Claude Code command:
"Agent 1 - Read /docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md section on 'HMO Portfolio Dashboard' and create:
1. /src/app/dashboard/page.tsx - Main dashboard
2. /src/components/dashboard/ folder with:
   - PortfolioSummary.tsx (overview stats)
   - PropertyCard.tsx (individual HMO property card)
   - ComplianceStatus.tsx (traffic light indicators)
   - UpcomingDeadlines.tsx (calendar view)
   - TenantList.tsx (tenant management)
   - DocumentLibrary.tsx
3. Include all 3 tabs: Overview, Properties, Compliance
4. Property card must show all compliance dates with color coding
5. Follow the exact layout shown in the specification
6. Mobile-optimized card layout"
```

### Task 1.5: Payment Pages

```bash
# Claude Code command:
"Agent 1 - Read /docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md pricing section and create:
1. /src/app/checkout/page.tsx - Checkout page for one-time products
2. /src/app/hmo-pro/upgrade/page.tsx - HMO Pro subscription page
3. /src/components/checkout/ folder with:
   - PricingCard.tsx (displays product price and features)
   - OrderSummary.tsx (itemized list)
   - StripeCheckoutButton.tsx
4. Display pricing exactly as specified: £29.99, £149.99, etc.
5. HMO Pro page must show tiered pricing (£19.99-£44.99)
6. Include 7-day trial messaging for HMO Pro
7. Trust badges and security indicators"
```

---

## 🗄️ AGENT 2: BACKEND DEVELOPER

**Role:** Database, API routes, business logic  
**References:** DATABASE_SCHEMA.md, LANDLORD_HEAVEN_BLUEPRINT_v6.0.md

### Task 2.1: Supabase Setup

```bash
# Claude Code command:
"Agent 2 - Read /docs/DATABASE_SCHEMA.md completely and:
1. Create /supabase/migrations/001_initial_schema.sql with:
   - All tables exactly as specified
   - All indexes
   - All RLS policies
   - All triggers and functions
2. Create /src/lib/supabase/client.ts - Supabase client configuration
3. Create /src/lib/supabase/server.ts - Server-side Supabase client
4. Create /src/types/database.ts - TypeScript types for all tables
5. Ensure RLS is enabled on all user-facing tables
6. Test that multi-tenant isolation works correctly"
```

### Task 2.2: API Routes - Wizard

```bash
# Claude Code command:
"Agent 2 - Read /docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md and create:
1. /src/app/api/wizard/ folder with routes:
   - start/route.ts - Initialize new case
   - question/route.ts - Get next question
   - answer/route.ts - Submit answer
   - validate/route.ts - Validate input
   - complete/route.ts - Finalize case
2. Each route should:
   - Validate authentication (user_id)
   - Store data in case_facts table
   - Track progress in cases table
   - Return proper error responses
3. Implement branching logic based on answers
4. Detect HMO properties (3+ unrelated tenants)
5. Follow REST best practices"
```

### Task 2.3: API Routes - HMO Pro

```bash
# Claude Code command:
"Agent 2 - Read /docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md and create:
1. /src/app/api/hmo/ folder with routes:
   - properties/route.ts - CRUD for HMO properties
   - tenants/route.ts - CRUD for tenants (unlimited updates)
   - councils/lookup/route.ts - Postcode → council lookup
   - reminders/route.ts - Get/set compliance reminders
   - documents/regenerate/route.ts - Trigger doc regeneration
2. /src/app/api/cron/reminders/route.ts - Daily reminder checker
3. Implement tenant version control (superseded_by pattern)
4. Council lookup must return full council data
5. Add proper authentication checks
6. Log all tenant updates for audit trail"
```

### Task 2.4: User Management

```bash
# Claude Code command:
"Agent 2 - Create user management API routes:
1. /src/app/api/auth/ folder with:
   - signup/route.ts
   - login/route.ts
   - logout/route.ts
   - profile/route.ts
2. /src/app/api/user/ folder with:
   - subscription/route.ts - Get subscription status
   - usage/route.ts - Get usage stats
   - upgrade/route.ts - Upgrade HMO Pro tier
3. Implement proper password hashing
4. Return JWT tokens
5. Update users.last_login_at on login
6. Track users.total_cases and users.total_spent"
```

---

## 🤖 AGENT 3: AI PIPELINE ENGINEER

**Role:** AI integrations, document generation, QA  
**References:** AI_PIPELINE_ARCHITECTURE.md, LEGAL_AGENT_SPECIFICATION.md

### Task 3.1: AI Configuration

```bash
# Claude Code command:
"Agent 3 - Read /docs/AI_PIPELINE_ARCHITECTURE.md and create:
1. /src/lib/ai/ folder with:
   - openai-client.ts - OpenAI client setup
   - anthropic-client.ts - Claude client setup
   - models.ts - Model configs (GPT-4.1 mini, GPT-4, Claude Sonnet 4)
   - token-tracker.ts - Track usage and costs
2. /src/lib/ai/prompts/ folder with:
   - fact-finder.ts - Conversational wizard prompts
   - decision-engine.ts - Route selection prompts
   - doc-generator.ts - Document generation prompts
   - qa-checker.ts - Legal validation prompts
3. Configure temperatures correctly:
   - 0.7 for conversation
   - 0.3 for legal documents
4. Implement retry logic with exponential backoff
5. Log all AI calls for debugging"
```

### Task 3.2: Fact-Finding Pipeline

```bash
# Claude Code command:
"Agent 3 - Read /docs/AI_PIPELINE_ARCHITECTURE.md section 'Step 1: Fact-Finding' and create:
1. /src/lib/ai/fact-finder.ts with functions:
   - getNextQuestion(caseId, collectedFacts, jurisdiction)
   - validateAnswer(questionId, answer, caseId)
   - updateCaseProgress(caseId, progress)
2. Use GPT-4.1 mini (fast and cheap)
3. Temperature: 0.7
4. Implement branching logic:
   - IF rent_arrears → ask amount, duration
   - IF antisocial → ask severity, frequency
   - IF 3+ tenants → detect HMO, show upsell
5. Store conversation in conversations table
6. Return structured JSON responses"
```

### Task 3.3: Decision Engine

```bash
# Claude Code command:
"Agent 3 - Read /docs/AI_PIPELINE_ARCHITECTURE.md section 'Step 2: Decision Engine' and create:
1. /src/lib/ai/decision-engine.ts with functions:
   - analyzeCase(caseFacts, jurisdiction)
   - selectRoute(caseFacts, decisionRules)
   - calculateNoticePeriod(ground, dates)
   - detectRedFlags(caseFacts)
   - estimateSuccessProbability(case)
2. Use GPT-4.1 mini
3. Temperature: 0.3 (precise)
4. Load decision rules from /config/jurisdictions/
5. Return recommended route + grounds
6. Flag compliance issues (e.g., deposit not protected)
7. Store analysis in cases.analysis_result"
```

### Task 3.4: Document Generation

```bash
# Claude Code command:
"Agent 3 - Read /docs/AI_PIPELINE_ARCHITECTURE.md section 'Step 3: Document Generation' and create:
1. /src/lib/documents/ folder with:
   - generator.ts - Main document generation
   - template-loader.ts - Load Handlebars templates
   - pdf-generator.ts - Puppeteer PDF generation
   - watermark.ts - Add 'PREVIEW' watermark
2. /src/lib/documents/generator.ts should:
   - Use GPT-4 (high accuracy)
   - Temperature: 0.3
   - Load template from /config/jurisdictions/
   - Fill template with AI-generated content
   - Compile Handlebars
   - Generate PDF
   - Store in documents table
3. Support formats: PDF, DOCX
4. Add watermark if is_preview = true
5. Track generation_time_ms"
```

### Task 3.5: QA Validation

```bash
# Claude Code command:
"Agent 3 - Read /docs/AI_PIPELINE_ARCHITECTURE.md section 'Step 4: QA Validation' and create:
1. /src/lib/ai/qa-checker.ts with functions:
   - validateDocument(documentId, caseFacts)
   - checkLegalAccuracy(document, jurisdiction)
   - verifyFactConsistency(document, inputFacts)
   - calculateQualityScore(document)
2. Use Claude Sonnet 4 (best for legal review)
3. Temperature: 0.3
4. Check:
   - All required sections present
   - Facts match input
   - Legal language correct
   - No prohibited content
   - Statute citations accurate
5. Return quality score (0-100)
6. If score < 85, regenerate document
7. Store qa_score and qa_issues in documents table"
```

---

## 💳 AGENT 4: PAYMENT SYSTEMS

**Role:** Stripe integration, subscriptions, webhooks  
**References:** LANDLORD_HEAVEN_BLUEPRINT_v6.0.md, HMO_PRO_MEMBERSHIP_SPECIFICATION.md

### Task 4.1: Stripe Setup

```bash
# Claude Code command:
"Agent 4 - Read /docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md pricing section and create:
1. /src/lib/stripe/ folder with:
   - client.ts - Stripe client setup
   - products.ts - Product definitions
   - prices.ts - Price IDs
   - checkout.ts - Create checkout sessions
   - subscriptions.ts - Subscription management
2. Define all products in products.ts:
   - Notice Only: £29.99
   - Complete Eviction Pack: £149.99
   - Money Claim Pack: £129.99
   - Standard AST: £39.99
   - Premium AST: £59.00
   - HMO Pro: £19.99-£44.99/month (6 tiers)
3. Create Stripe products (run once to initialize)
4. Store product IDs in environment variables
5. Add error handling for failed payments"
```

### Task 4.2: One-Time Checkout

```bash
# Claude Code command:
"Agent 4 - Create one-time product checkout:
1. /src/app/api/checkout/create/route.ts:
   - Accept: productType, caseId, userId
   - Create Stripe Checkout session
   - Set success_url and cancel_url
   - Store order in orders table (status: 'pending')
   - Return checkout URL
2. /src/app/checkout/success/page.tsx:
   - Display success message
   - Show order number
   - Link to download documents
3. Handle edge cases:
   - User already owns product
   - Invalid product type
   - Payment failed
4. Log all transactions"
```

### Task 4.3: HMO Pro Subscription

```bash
# Claude Code command:
"Agent 4 - Read /docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md section '7-DAY FREE TRIAL' and create:
1. /src/app/api/hmo-pro/subscribe/route.ts:
   - Accept: userId, hmoCount
   - Calculate tier based on hmoCount
   - Create Stripe subscription with:
     * trial_period_days: 7
     * Card required to start
   - Update users table:
     * hmo_pro_active: true
     * hmo_pro_trial_ends_at: +7 days
     * stripe_subscription_id
   - Send welcome email
2. /src/app/api/hmo-pro/cancel/route.ts:
   - Cancel subscription
   - Set cancel_at_period_end
   - Update user record
3. /src/app/api/hmo-pro/upgrade/route.ts:
   - Change subscription tier
   - Prorate charges
4. Include proper error handling"
```

### Task 4.4: Webhook Handler

```bash
# Claude Code command:
"Agent 4 - Create comprehensive webhook handler:
1. /src/app/api/webhooks/stripe/route.ts:
   - Verify webhook signature
   - Handle events:
     * checkout.session.completed → Fulfill order
     * customer.subscription.created → Activate HMO Pro
     * customer.subscription.updated → Update tier
     * customer.subscription.deleted → Cancel HMO Pro
     * customer.subscription.trial_will_end → Send reminder (Day 5)
     * invoice.paid → Record payment
     * invoice.payment_failed → Handle failure
2. Update database based on event type
3. Send transactional emails
4. Log all webhook events
5. Return 200 status immediately
6. Process asynchronously if needed"
```

---

## ⚙️ AGENT 5: DEVOPS/CONFIG

**Role:** Environment setup, deployment, config management  
**References:** LANDLORD_HEAVEN_BLUEPRINT_v6.0.md

### Task 5.1: Environment Configuration

```bash
# Claude Code command:
"Agent 5 - Create environment configuration:
1. Create .env.example with all required variables:
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
   STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=
   STRIPE_PRICE_ID_NOTICE_ONLY=
   STRIPE_PRICE_ID_COMPLETE_PACK=
   STRIPE_PRICE_ID_MONEY_CLAIM=
   STRIPE_PRICE_ID_STANDARD_AST=
   STRIPE_PRICE_ID_PREMIUM_AST=
   STRIPE_PRICE_ID_HMO_PRO_1_5=
   STRIPE_PRICE_ID_HMO_PRO_6_10=
   # ... other tiers
   
   # Email
   RESEND_API_KEY=
   
   # App
   NEXT_PUBLIC_APP_URL=
   
2. Create .env.local (git-ignored, for local dev)
3. Document each variable in comments"
```

### Task 5.2: Config Files

```bash
# Claude Code command:
"Agent 5 - Create configuration files:
1. /config/jurisdictions/ folder structure:
   - uk/england-wales/
   - uk/scotland/
   - uk/northern-ireland/
   (These will be populated by Agent 6)
2. /config/app.ts - App-wide constants:
   - Product names
   - Pricing (for display)
   - Feature flags
   - Rate limits
3. /config/email.ts - Email templates config
4. next.config.js optimizations:
   - Image optimization
   - Bundle size optimization
   - API routes configuration
5. tsconfig.json - TypeScript paths:
   - @/components
   - @/lib
   - @/config"
```

### Task 5.3: Deployment Setup

```bash
# Claude Code command:
"Agent 5 - Setup deployment configuration:
1. Create vercel.json:
   - Environment variables mapping
   - Build configuration
   - Cron jobs (daily reminders)
   - Function timeouts
2. Create Dockerfile (for alternative hosting):
   - Node 18+
   - Next.js build
   - Production optimizations
3. Create .github/workflows/ci.yml:
   - Run on: push to main
   - Steps: lint, type-check, test, build
4. Add deployment scripts to package.json:
   - npm run build
   - npm run start
   - npm run deploy"
```

### Task 5.4: Monitoring & Logging

```bash
# Claude Code command:
"Agent 5 - Setup monitoring:
1. /src/lib/logger.ts - Structured logging:
   - Log levels: debug, info, warn, error
   - Context inclusion (userId, caseId)
   - Performance metrics
2. /src/lib/analytics.ts - Event tracking:
   - Page views
   - Wizard progress
   - Conversions
   - Errors
3. /src/lib/monitoring/ folder:
   - error-tracker.ts - Capture exceptions
   - performance.ts - Track response times
   - ai-usage.ts - Monitor AI costs
4. Create dashboard for key metrics:
   - Daily signups
   - Conversion rate
   - AI costs
   - Error rate"
```

---

## ⚖️ AGENT 6: LEGAL ARCHITECT

**Role:** Legal frameworks, document templates, compliance  
**References:** LEGAL_AGENT_SPECIFICATION.md

### Task 6.1: Legal Framework Generation (Days 1-3)

```bash
# Claude Code command:
"Agent 6 - Read /docs/LEGAL_AGENT_SPECIFICATION.md completely and generate:

DAY 1 - Legal Frameworks:
1. /config/jurisdictions/uk/england-wales/
   - law_summary.md (50 pages covering Housing Acts 1985-2004)
   - facts_schema.json (all required fields per ground)
   - decision_rules.yaml (eligibility logic, notice periods)
   - eviction_grounds.json (all 17 Section 8 grounds)
2. /config/jurisdictions/uk/scotland/
   - [Same structure for PRT law]
3. /config/jurisdictions/uk/northern-ireland/
   - [Same structure for NI law]

DAY 2 - Court Forms & Templates:
1. /config/jurisdictions/uk/england-wales/templates/
   - eviction/ (Section 8, Section 21, N5, N5B, N119)
   - money_claims/ (N1, Letter Before Action)
   - tenancy/ (Standard AST, Premium AST, HMO AST)
   - hmo/ (License applications, House rules, etc.)
2. All templates in Handlebars format (.hbs)
3. Follow exact court form requirements

DAY 3 - AI Prompts & Council Data:
1. /config/jurisdictions/uk/*/prompts/
   - fact_finder_conversational.txt
   - decision_engine.txt
   - doc_generator.txt
   - qa_checker.txt
2. /config/councils/council_data.json
   - 380+ UK councils
   - HMO licensing requirements
   - Contact details
   - Fee structures

Generate all of this content following the specifications exactly.
Base all legal content on current statute and case law.
Include citations for all legal statements."
```

### Task 6.2: HMO Council Database

```bash
# Claude Code command:
"Agent 6 - Read /docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md and create:
1. /config/councils/council_data.json with all 380+ UK councils:
   - Council code and name
   - Postcode areas covered
   - Licensing types (Mandatory/Additional/Selective)
   - Room size requirements
   - Occupancy limits
   - Contact details
   - Application URLs
   - Fees
2. Create SQL seed script:
   - /supabase/seed/councils.sql
   - INSERT statements for all councils
3. Create lookup API:
   - /src/app/api/councils/lookup/route.ts
   - Postcode → Council mapping
   - Return full council data"
```

### Task 6.3: Document Templates

```bash
# Claude Code command:
"Agent 6 - Create all document templates following court requirements:

Eviction Templates:
1. section8_notice.hbs (adaptive to grounds)
2. section21_form6a.hbs (strict compliance)
3. n5_claim.hbs (possession claim)
4. n5b_accelerated.hbs (accelerated procedure)
5. n119_particulars.hbs (particulars of claim)

Money Claim Templates:
1. letter_before_action.hbs
2. n1_money_claim.hbs
3. particulars_money.hbs

Tenancy Templates:
1. standard_ast.hbs (35 pages)
2. premium_ast.hbs (45 pages)
3. hmo_ast.hbs (50 pages)
4. guarantor_agreement.hbs

HMO Templates:
1. mandatory_license_application.hbs
2. house_rules.hbs
3. shared_facilities_schedule.hbs
4. fire_safety_documentation.hbs

All templates must:
- Use Handlebars syntax
- Include all required legal clauses
- Follow court formatting
- Support conditional content
- Be QA-validated"
```

### Task 6.4: Compliance Validation

```bash
# Claude Code command:
"Agent 6 - Create compliance validation system:
1. /src/lib/compliance/ folder with:
   - validator.ts - Main validation logic
   - unfair-terms.ts - Check for unfair contract terms
   - prohibited-fees.ts - Tenant Fees Act compliance
   - deposit-protection.ts - Verify deposit rules
   - right-to-rent.ts - Immigration checks
   - hmo-licensing.ts - HMO compliance checks
2. Each validator should:
   - Accept case facts or document
   - Check against legal requirements
   - Return violations array
   - Include citations
3. /validation/rules.yaml - All validation rules
4. Integration with QA checker (Agent 3)"
```

---

## 🔄 INTEGRATION PHASE

### Integration 1: Frontend ↔ Backend

```bash
# Claude Code command:
"Integrate Agent 1 (Frontend) with Agent 2 (Backend):
1. Update wizard components to call API routes
2. Implement proper error handling
3. Add loading states
4. Test full wizard flow:
   - Start case → Answer questions → Complete
5. Verify data is stored correctly in Supabase
6. Test HMO detection and upsell display
7. Ensure mobile experience works"
```

### Integration 2: AI Pipeline ↔ Document Generation

```bash
# Claude Code command:
"Integrate Agent 3 (AI) with Agent 6 (Legal):
1. Load legal configs from /config/jurisdictions/
2. Test fact-finding with real questions
3. Test decision engine with sample cases
4. Generate test documents for all grounds
5. Run QA validation on generated documents
6. Verify quality scores >85
7. Test document regeneration on failure
8. Ensure AI costs are tracked"
```

### Integration 3: Payments ↔ Document Delivery

```bash
# Claude Code command:
"Integrate Agent 4 (Payments) with full system:
1. Test one-time product purchase flow:
   - Select product → Checkout → Payment → Document delivery
2. Test HMO Pro subscription flow:
   - Start trial → Add property → Add tenants → Generate docs
3. Test webhook handling:
   - Trial ending reminder (Day 5)
   - Successful payment
   - Failed payment
   - Subscription cancellation
4. Verify orders table is updated correctly
5. Test document access permissions (RLS)
6. Ensure documents are only visible after payment"
```

---

## 🧪 TESTING PHASE

### Test 1: End-to-End Wizard

```bash
# Claude Code command:
"Run complete wizard test for each scenario:

Scenario 1 - Rent Arrears (Section 8 Ground 8):
- Location: England & Wales
- Issue: Rent arrears
- Amount: £2,400
- Duration: 3 months
- Expected: Section 8 notice with Ground 8
- Documents: Section 8 notice, N5, N119
- Price: £149.99

Scenario 2 - End of Fixed Term (Section 21):
- Location: England & Wales
- Issue: Fixed term ending
- Deposit: Protected
- Compliance: All met
- Expected: Section 21 Form 6A
- Documents: Section 21, N5B
- Price: £149.99

Scenario 3 - HMO Property:
- Tenants: 5 unrelated people
- Shared facilities: Yes
- Expected: HMO detection, Pro upsell shown
- If subscribed: Generate HMO AST for all tenants

Verify each test:
✅ Correct questions asked
✅ Branching logic works
✅ Documents generated correctly
✅ QA score >85
✅ PDF downloadable
✅ Watermark on preview
✅ No watermark after purchase"
```

### Test 2: HMO Pro Subscription

```bash
# Claude Code command:
"Test complete HMO Pro subscription flow:

1. Trial Signup:
   - User enters card details
   - Subscription created with 7-day trial
   - User redirected to dashboard
   - Welcome email sent
   - users.hmo_pro_active = true

2. Add Property:
   - Enter address
   - Postcode lookup → Council detected
   - License requirements shown
   - Property saved in hmo_properties table

3. Add Tenants:
   - Add 5 tenants
   - Assign rooms
   - Add guarantors
   - Documents auto-generated

4. Update Tenant:
   - Remove tenant 1
   - Add new tenant 6
   - Verify version control (superseded_by)
   - Documents regenerated

5. Compliance Reminders:
   - Set license expiry date (60 days away)
   - Verify reminder scheduled (90, 30, 7 days)
   - Test cron job triggers email

6. Trial End:
   - Day 5: Trial ending email sent
   - Day 7: Payment processed
   - Subscription continues
   - hmo_pro_trial_ends_at cleared

7. Cancellation:
   - User cancels
   - Access continues until period end
   - No future charges
   - hmo_pro_active = false after period end"
```

### Test 3: Payment & Security

```bash
# Claude Code command:
"Test payment security and edge cases:

1. Payment Success:
   ✅ Order created
   ✅ Payment processed
   ✅ Documents delivered
   ✅ Email sent
   ✅ Order marked as fulfilled

2. Payment Failed:
   ✅ Order marked as failed
   ✅ User notified
   ✅ Documents not accessible
   ✅ Retry option available

3. Webhook Security:
   ✅ Signature verification works
   ✅ Invalid signatures rejected
   ✅ Replay attacks prevented

4. RLS (Row Level Security):
   ✅ User A cannot access User B's cases
   ✅ User A cannot access User B's documents
   ✅ User A cannot access User B's HMO data
   ✅ Admin override works (if implemented)

5. Rate Limiting:
   ✅ 50 wizard requests / 15 min
   ✅ 10 document generations / hour
   ✅ Exceeded limits return 429"
```

---

## 🚀 DEPLOYMENT

### Pre-Deployment Checklist

```bash
# Claude Code command:
"Verify deployment readiness:

✅ All environment variables set in Vercel
✅ Supabase project created and configured
✅ Database migrations run successfully
✅ Council data seeded
✅ Stripe products created in live mode
✅ Stripe webhook endpoint configured
✅ Domain configured (e.g., landlordheaven.co.uk)
✅ SSL certificate active
✅ Email DNS records configured (SPF, DKIM)
✅ Analytics tracking working
✅ Error tracking active (Sentry or similar)
✅ Cron job configured for reminders
✅ All tests passing
✅ Legal disclaimer present
✅ Terms & privacy policy published
✅ GDPR compliance verified"
```

### Deploy to Vercel

```bash
# Manual commands:
vercel login
vercel link
vercel env pull .env.local
vercel --prod

# Or automatic via GitHub:
git push origin main
# (Vercel auto-deploys)
```

### Post-Deployment Verification

```bash
# Claude Code command:
"Test production deployment:

1. Public Pages:
   ✅ Landing page loads
   ✅ Pricing visible
   ✅ SEO meta tags present
   ✅ Mobile responsive

2. Wizard Flow:
   ✅ Can start new case
   ✅ Questions display correctly
   ✅ Can complete wizard
   ✅ Documents preview shown

3. Payments:
   ✅ Stripe checkout works
   ✅ Payment processes
   ✅ Documents unlock
   ✅ Webhooks received

4. HMO Pro:
   ✅ Can start trial
   ✅ Card authorization works
   ✅ Dashboard accessible
   ✅ Can add properties/tenants

5. Emails:
   ✅ Welcome emails sent
   ✅ Document delivery emails sent
   ✅ Trial reminder sent
   ✅ Reminder cron job runs

6. Performance:
   ✅ Page load < 3s
   ✅ API response < 500ms
   ✅ Document generation < 10s
   ✅ No console errors"
```

---

## 📊 MONITORING & MAINTENANCE

### Daily Monitoring

```bash
# Claude Code command:
"Create monitoring dashboard showing:

1. User Metrics:
   - New signups today
   - Active trials
   - Trial conversions
   - Churn rate

2. Revenue Metrics:
   - Daily revenue (one-time)
   - MRR (subscriptions)
   - Average order value
   - Revenue by product

3. System Health:
   - API response times
   - Error rate
   - AI cost per case
   - Database query performance

4. AI Metrics:
   - Fact-finding calls
   - Document generations
   - QA validations
   - Average quality score
   - Token usage
   - Cost per document

5. HMO Pro Metrics:
   - Active subscribers
   - Properties managed
   - Tenants added this week
   - Reminders sent
   - Document regenerations

6. Alerts (notify if):
   ⚠️ Error rate > 1%
   ⚠️ API response time > 2s
   ⚠️ AI quality score < 85
   ⚠️ Payment failure rate > 5%
   ⚠️ Daily AI cost > £50"
```

### Weekly Tasks

```bash
# Manual review:
1. Review user feedback
2. Check error logs
3. Analyze conversion funnel
4. Review AI quality scores
5. Check for failed payments
6. Monitor competitor pricing
7. Update legal templates if needed
```

### Quarterly Updates (Agent 6)

```bash
# Claude Code command:
"Agent 6 - Quarterly legal review:
1. Check for law changes:
   - Housing Act amendments
   - Court procedure updates
   - Fee changes
   - New case law
2. Update affected templates
3. Modify decision rules if needed
4. Update council data (fees, requirements)
5. Test all affected flows
6. Deploy updates
7. Notify users of changes (if material)"
```

---

## 📚 DOCUMENTATION REFERENCES

Every agent should reference documentation before starting work:

### Agent 1 (Frontend):
- Primary: `/docs/STYLE_GUIDE.md`
- Secondary: `/docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md`
- Reference: `/docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md`

### Agent 2 (Backend):
- Primary: `/docs/DATABASE_SCHEMA.md`
- Secondary: `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md`

### Agent 3 (AI Pipeline):
- Primary: `/docs/AI_PIPELINE_ARCHITECTURE.md`
- Secondary: `/docs/LEGAL_AGENT_SPECIFICATION.md`

### Agent 4 (Payments):
- Primary: `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md` (pricing)
- Secondary: `/docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md` (subscription)

### Agent 5 (DevOps):
- Primary: All docs (needs overview)
- Reference: `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md`

### Agent 6 (Legal):
- Primary: `/docs/LEGAL_AGENT_SPECIFICATION.md`
- Secondary: All legal sections from other docs

---

## 🎯 SUCCESS CRITERIA

### Week 1 Complete When:
✅ All 6 agents have completed their tasks
✅ Core platform works end-to-end
✅ Documents generate correctly
✅ Payments process successfully
✅ Tests pass
✅ Deployed to production

### Week 2 Complete When:
✅ HMO Pro fully implemented
✅ 7-day trial works
✅ Dashboard functional
✅ Reminders sending
✅ Council data loaded
✅ All 380+ councils accessible

### Launch Ready When:
✅ All products purchasable
✅ All features working
✅ No critical bugs
✅ Performance optimized
✅ Security verified
✅ Legal compliance confirmed

---

## 🚦 GETTING STARTED

**Step 1:** Copy all 8 markdown files to `/docs` folder

**Step 2:** Run setup commands (Step 1-3 above)

**Step 3:** Start with Agent 6 (Legal) - Days 1-3

**Step 4:** Agents 1, 2, 3, 4, 5 work in parallel - Days 4-7

**Step 5:** Integration - Days 8-10

**Step 6:** Testing - Days 11-12

**Step 7:** HMO Pro features - Days 13-14

**Step 8:** Deploy! 🚀

---

**END OF CLAUDE CODE BUILD GUIDE**

With this guide, Claude Code can systematically build the entire Landlord Heaven platform using the 6-agent approach with consistent documentation references.
