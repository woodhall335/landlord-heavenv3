# 🤖 AGENTS 3-6: COMPLETE INSTRUCTION FILES

**Version:** 1.0  
**Purpose:** Detailed instructions for AI Pipeline, Payments, DevOps, and Legal agents  
**Status:** Ready for implementation

---

## 📦 CONTENTS

1. [Agent 3: AI Pipeline Engineer](#agent-3-ai-pipeline-engineer)
2. [Agent 4: Payment Systems](#agent-4-payment-systems)
3. [Agent 5: DevOps/Config](#agent-5-devopsconfig)
4. [Agent 6: Legal Architect](#agent-6-legal-architect)

---

# 🤖 AGENT 3: AI PIPELINE ENGINEER

**Role:** AI Integration, Document Generation, QA Validation  
**Duration:** Days 4-7 (parallel)  
**Primary Docs:** `/docs/AI_PIPELINE_ARCHITECTURE.md`, `/docs/LEGAL_AGENT_SPECIFICATION.md`

## 🎯 YOUR MISSION

Build the complete AI pipeline:
- ✅ OpenAI/Claude integration
- ✅ Conversational fact-finding
- ✅ Decision engine (route selection)
- ✅ Document generation
- ✅ QA validation (Claude Sonnet 4)
- ✅ Cost tracking

## 📦 DELIVERABLES

### Phase 1: AI Client Setup (Day 4)
- [ ] OpenAI client configured
- [ ] Claude client configured
- [ ] Token tracking system
- [ ] Cost calculator
- [ ] Retry logic with exponential backoff

### Phase 2: Fact-Finding Pipeline (Day 5)
- [ ] Conversational wizard AI
- [ ] Question generation (GPT-4.1 mini)
- [ ] Branching logic
- [ ] HMO detection
- [ ] Context management

### Phase 3: Document Generation (Day 6)
- [ ] Template loader
- [ ] GPT-4 document generation
- [ ] Handlebars compilation
- [ ] PDF generation (Puppeteer)
- [ ] Watermarking for previews

### Phase 4: QA & Polish (Day 7)
- [ ] Claude Sonnet 4 QA validation
- [ ] Quality scoring (0-100)
- [ ] Regeneration on failure
- [ ] Performance optimization

---

## 🔧 KEY IMPLEMENTATIONS

### 1. AI Client Setup

**Create:** `/src/lib/ai/clients.ts`

```typescript
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const AI_MODELS = {
  FACT_FINDING: "gpt-4-1106-preview", // GPT-4.1 mini
  DOCUMENT_GEN: "gpt-4",
  QA_VALIDATION: "claude-sonnet-4-20250514",
} as const;

export const AI_TEMPERATURES = {
  CONVERSATIONAL: 0.7,
  PRECISE: 0.3,
} as const;
```

### 2. Token Tracker

**Create:** `/src/lib/ai/token-tracker.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/server";

interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
}

export async function trackTokenUsage(usage: TokenUsage) {
  const supabase = createAdminClient();
  
  await supabase.from("ai_usage_logs").insert({
    model: usage.model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_cost: usage.total_cost,
    timestamp: new Date().toISOString(),
  });
}

export function calculateCost(usage: any, model: string): number {
  const PRICING = {
    "gpt-4-1106-preview": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
    "gpt-4": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
    "claude-sonnet-4-20250514": { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
  };

  const pricing = PRICING[model] || { input: 0, output: 0 };
  return (usage.prompt_tokens * pricing.input) + (usage.completion_tokens * pricing.output);
}
```

### 3. Fact-Finding AI

**Create:** `/src/lib/ai/fact-finder.ts`

```typescript
import { openai, AI_MODELS, AI_TEMPERATURES } from "./clients";
import { trackTokenUsage, calculateCost } from "./token-tracker";

export async function getNextQuestion(
  caseId: string,
  collectedFacts: any,
  jurisdiction: string
) {
  const prompt = `You are a conversational wizard for Landlord Heaven.

RULES:
- Ask ONE question at a time
- Use plain English (no legal jargon)
- Be empathetic and friendly
- Explain why you're asking
- Never ask for information you already have

CURRENT STATE:
- Collected: ${JSON.stringify(collectedFacts)}
- Jurisdiction: ${jurisdiction}

Determine the next question to ask based on what's been collected.

OUTPUT JSON:
{
  "question": {
    "id": "question_id",
    "text": "The question to ask",
    "input_type": "currency|date|text|multiple_choice|yes_no",
    "help_text": "Why we need this",
    "required": true,
    "options": [] // if multiple_choice
  },
  "progress": 45 // percentage complete
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODELS.FACT_FINDING,
    messages: [{ role: "user", content: prompt }],
    temperature: AI_TEMPERATURES.CONVERSATIONAL,
    response_format: { type: "json_object" },
    max_tokens: 500,
  });

  // Track usage
  await trackTokenUsage({
    model: AI_MODELS.FACT_FINDING,
    input_tokens: response.usage?.prompt_tokens || 0,
    output_tokens: response.usage?.completion_tokens || 0,
    total_cost: calculateCost(response.usage, AI_MODELS.FACT_FINDING),
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    question: result.question,
    progress: result.progress,
    model: AI_MODELS.FACT_FINDING,
  };
}
```

### 4. Decision Engine

**Create:** `/src/lib/ai/decision-engine.ts`

```typescript
import { openai, AI_MODELS, AI_TEMPERATURES } from "./clients";

export async function analyzeCase(caseFacts: any, jurisdiction: string) {
  // Load decision rules from config (Agent 6 provides these)
  const decisionRules = await loadDecisionRules(jurisdiction);

  const prompt = `You are a legal decision engine for UK landlord-tenant cases.

DECISION RULES:
${JSON.stringify(decisionRules, null, 2)}

CASE FACTS:
${JSON.stringify(caseFacts, null, 2)}

Analyze the case and recommend the best legal route.

OUTPUT JSON:
{
  "recommended_route": "section_8" | "section_21" | "money_claim",
  "grounds": ["ground_8", "ground_10"],
  "mandatory_grounds": ["ground_8"],
  "notice_period_days": 14,
  "success_probability": 85,
  "red_flags": [],
  "compliance_issues": [],
  "reasoning": "Explanation here"
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODELS.FACT_FINDING,
    messages: [{ role: "user", content: prompt }],
    temperature: AI_TEMPERATURES.PRECISE,
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

async function loadDecisionRules(jurisdiction: string) {
  // Load from /config/jurisdictions/{jurisdiction}/decision_rules.yaml
  // Agent 6 will provide these files
  return {}; // Placeholder
}
```

### 5. Document Generator

**Create:** `/src/lib/documents/generator.ts`

```typescript
import { openai, AI_MODELS, AI_TEMPERATURES } from "@/lib/ai/clients";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";

export async function generateDocument(
  caseId: string,
  caseFacts: any,
  documentType: string,
  isPreview: boolean = false
) {
  // Load template
  const template = await loadTemplate(documentType, caseFacts.jurisdiction);

  // Generate content with GPT-4
  const prompt = `You are a legal document generator for UK landlord-tenant law.

TEMPLATE:
${template}

CASE FACTS:
${JSON.stringify(caseFacts, null, 2)}

INSTRUCTIONS:
- Fill template with case facts
- Use precise legal language
- Include all required sections
- Follow court formatting rules
- Do NOT add information not in case facts
- Do NOT use placeholder text

OUTPUT: Complete filled template (Handlebars format)`;

  const response = await openai.chat.completions.create({
    model: AI_MODELS.DOCUMENT_GEN,
    messages: [{ role: "user", content: prompt }],
    temperature: AI_TEMPERATURES.PRECISE,
    max_tokens: 8000,
  });

  const filledTemplate = response.choices[0].message.content || "";

  // Compile Handlebars
  const compiled = Handlebars.compile(filledTemplate);
  const html = compiled(caseFacts);

  // Generate PDF
  const pdf = await generatePDF(html, {
    watermark: isPreview ? "PREVIEW - NOT FOR COURT USE" : null,
  });

  return {
    html,
    pdf,
    metadata: {
      model: AI_MODELS.DOCUMENT_GEN,
      tokens: response.usage,
    },
  };
}

async function generatePDF(html: string, options: any) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html);
  
  if (options.watermark) {
    await page.evaluate((watermarkText) => {
      const watermark = document.createElement('div');
      watermark.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        opacity: 0.1;
        pointer-events: none;
        z-index: 9999;
      `;
      watermark.textContent = watermarkText;
      document.body.appendChild(watermark);
    }, options.watermark);
  }
  
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
  });
  
  await browser.close();
  
  return pdf;
}

async function loadTemplate(documentType: string, jurisdiction: string) {
  // Load from /config/jurisdictions/{jurisdiction}/templates/{documentType}.hbs
  // Agent 6 will provide these
  return ""; // Placeholder
}
```

### 6. QA Validator (Claude Sonnet 4)

**Create:** `/src/lib/ai/qa-validator.ts`

```typescript
import { anthropic, AI_MODELS, AI_TEMPERATURES } from "./clients";

export async function validateDocument(
  documentHtml: string,
  caseFacts: any
) {
  const prompt = `You are a legal QA specialist for UK landlord-tenant documents.

DOCUMENT TO REVIEW:
${documentHtml}

ORIGINAL FACTS:
${JSON.stringify(caseFacts, null, 2)}

CHECKLIST:
- All required sections present?
- Facts match input data?
- Legal language correct?
- Statute citations accurate?
- Notice periods correct?
- No prohibited content?
- No unfair terms?
- Court format compliant?

SCORING:
- 100: Perfect, no issues
- 85-99: Minor issues (acceptable)
- 70-84: Moderate issues (needs fixes)
- <70: Major issues (regenerate)

OUTPUT JSON:
{
  "quality_score": 92,
  "issues": [],
  "warnings": [],
  "recommendations": [],
  "pass": true
}`;

  const response = await anthropic.messages.create({
    model: AI_MODELS.QA_VALIDATION,
    max_tokens: 2000,
    temperature: AI_TEMPERATURES.PRECISE,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return JSON.parse(content.text);
}
```

---

# 💳 AGENT 4: PAYMENT SYSTEMS

**Role:** Stripe Integration, Webhooks, Subscriptions  
**Duration:** Days 4-7 (parallel)  
**Primary Docs:** `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md`, `/docs/HMO_PRO_MEMBERSHIP_SPECIFICATION.md`

## 🎯 YOUR MISSION

Implement complete payment system:
- ✅ Stripe Checkout (one-time products)
- ✅ Stripe Subscriptions (HMO Pro)
- ✅ 7-day free trial flow
- ✅ Webhook handling
- ✅ Order fulfillment

## 📦 DELIVERABLES

### Phase 1: Stripe Setup (Day 4)
- [ ] Stripe client configured
- [ ] Product definitions
- [ ] Price IDs stored
- [ ] Test mode working

### Phase 2: One-Time Checkout (Day 5)
- [ ] Checkout session creation
- [ ] Success/cancel pages
- [ ] Order recording
- [ ] Document delivery

### Phase 3: HMO Pro Subscription (Day 6)
- [ ] 7-day trial setup
- [ ] Tiered pricing
- [ ] Upgrade/downgrade logic
- [ ] Cancellation flow

### Phase 4: Webhooks & Fulfillment (Day 7)
- [ ] Webhook signature verification
- [ ] All event handlers
- [ ] Automatic fulfillment
- [ ] Error recovery

---

## 🔧 KEY IMPLEMENTATIONS

### 1. Stripe Client

**Create:** `/src/lib/stripe/client.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const STRIPE_PRICES = {
  NOTICE_ONLY: process.env.STRIPE_PRICE_ID_NOTICE_ONLY!,
  COMPLETE_PACK: process.env.STRIPE_PRICE_ID_COMPLETE_PACK!,
  MONEY_CLAIM: process.env.STRIPE_PRICE_ID_MONEY_CLAIM!,
  STANDARD_AST: process.env.STRIPE_PRICE_ID_STANDARD_AST!,
  PREMIUM_AST: process.env.STRIPE_PRICE_ID_PREMIUM_AST!,
  HMO_PRO_1_5: process.env.STRIPE_PRICE_ID_HMO_PRO_1_5!,
  HMO_PRO_6_10: process.env.STRIPE_PRICE_ID_HMO_PRO_6_10!,
  // Add other tiers...
};

export const PRODUCT_PRICES = {
  notice_only: { amount: 29.99, stripe_price: STRIPE_PRICES.NOTICE_ONLY },
  complete_pack: { amount: 149.99, stripe_price: STRIPE_PRICES.COMPLETE_PACK },
  money_claim: { amount: 129.99, stripe_price: STRIPE_PRICES.MONEY_CLAIM },
  standard_ast: { amount: 39.99, stripe_price: STRIPE_PRICES.STANDARD_AST },
  premium_ast: { amount: 59.00, stripe_price: STRIPE_PRICES.PREMIUM_AST },
};
```

### 2. One-Time Checkout

**Create:** `/src/app/api/checkout/create/route.ts`

```typescript
import { stripe, PRODUCT_PRICES } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productType, caseId } = body;

    const product = PRODUCT_PRICES[productType];
    if (!product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        case_id: caseId,
        product_type: productType,
        product_name: productType.replace(/_/g, " ").toUpperCase(),
        amount: product.amount,
        total_amount: product.amount,
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: product.stripe_price,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: order.id,
      metadata: {
        order_id: order.id,
        case_id: caseId,
        user_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. HMO Pro Subscription

**Create:** `/src/app/api/hmo-pro/subscribe/route.ts`

```typescript
import { stripe, STRIPE_PRICES } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";

function getHMOProPriceId(hmoCount: number): string {
  if (hmoCount <= 5) return STRIPE_PRICES.HMO_PRO_1_5;
  if (hmoCount <= 10) return STRIPE_PRICES.HMO_PRO_6_10;
  // Add logic for other tiers...
  return STRIPE_PRICES.HMO_PRO_1_5;
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { hmoCount } = body;

    const priceId = getHMOProPriceId(hmoCount);
    const supabase = createServerSupabaseClient();

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create Checkout session with trial
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
        metadata: {
          user_id: user.id,
          hmo_count: hmoCount,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/hmo-pro/welcome`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/hmo-pro/upgrade`,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4. Webhook Handler

**Create:** `/src/app/api/webhooks/stripe/route.ts`

```typescript
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabase);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  if (session.mode === "payment") {
    // One-time product
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", session.id);

    // Trigger document delivery
    await deliverDocuments(session.metadata?.order_id);
  } else if (session.mode === "subscription") {
    // HMO Pro subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    await supabase
      .from("users")
      .update({
        hmo_pro_active: true,
        hmo_pro_trial_ends_at: new Date(subscription.trial_end! * 1000).toISOString(),
        stripe_subscription_id: subscription.id,
      })
      .eq("id", session.metadata?.user_id);

    // Send welcome email
    await sendEmail({
      template: "hmo_pro_trial_started",
      to: session.customer_email!,
    });
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  // Send reminder email 2 days before trial ends
  const { data: user } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (user) {
    await sendEmail({
      template: "hmo_pro_trial_ending",
      to: user.email,
      data: {
        trial_ends_at: new Date(subscription.trial_end! * 1000),
        amount: subscription.items.data[0].price.unit_amount! / 100,
      },
    });
  }
}

async function deliverDocuments(orderId: string) {
  // Implementation by Agent 3
  console.log(`Delivering documents for order: ${orderId}`);
}

async function sendEmail(options: any) {
  // Implementation by Agent 5
  console.log(`Sending email:`, options);
}
```

---

# ⚙️ AGENT 5: DEVOPS/CONFIG

**Role:** Deployment, Configuration, Monitoring  
**Duration:** Days 4-7 (parallel)  
**Primary Docs:** All docs (overview needed)

## 🎯 YOUR MISSION

Set up production infrastructure:
- ✅ Environment configuration
- ✅ Vercel deployment
- ✅ Email system (Resend)
- ✅ Monitoring & logging
- ✅ Error tracking
- ✅ Performance optimization

## 📦 DELIVERABLES

### Phase 1: Configuration (Day 4)
- [ ] All environment variables documented
- [ ] Config files created
- [ ] Email templates
- [ ] Logging system

### Phase 2: Deployment (Day 5)
- [ ] Vercel configuration
- [ ] Domain setup
- [ ] SSL certificates
- [ ] Cron jobs configured

### Phase 3: Monitoring (Day 6)
- [ ] Error tracking (Sentry/similar)
- [ ] Performance monitoring
- [ ] Cost tracking dashboard
- [ ] Alert system

### Phase 4: Email System (Day 7)
- [ ] Resend integration
- [ ] All email templates
- [ ] Transactional emails
- [ ] Marketing emails

---

## 🔧 KEY IMPLEMENTATIONS

### 1. Email System (Resend)

**Create:** `/src/lib/email/client.ts`

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(options: {
  to: string;
  template: string;
  data?: any;
}) {
  const templates = {
    welcome: {
      subject: "Welcome to Landlord Heaven",
      html: `<h1>Welcome, ${options.data?.name}!</h1>`,
    },
    order_confirmation: {
      subject: "Order Confirmation - {{order_number}}",
      html: `<h1>Thank you for your order!</h1>`,
    },
    hmo_pro_trial_started: {
      subject: "Your HMO Pro trial has started",
      html: `<h1>Welcome to HMO Pro!</h1>`,
    },
    hmo_pro_trial_ending: {
      subject: "Your HMO Pro trial ends in 2 days",
      html: `<h1>Your trial is ending soon</h1>`,
    },
    compliance_reminder: {
      subject: "Compliance Reminder: {{reminder_type}}",
      html: `<h1>Reminder: {{reminder_type}} due soon</h1>`,
    },
  };

  const template = templates[options.template];
  if (!template) {
    throw new Error(`Template not found: ${options.template}`);
  }

  const { data, error } = await resend.emails.send({
    from: "Landlord Heaven <noreply@landlordheaven.co.uk>",
    to: options.to,
    subject: template.subject,
    html: template.html,
  });

  if (error) {
    throw new Error(`Email failed: ${error.message}`);
  }

  return data;
}
```

### 2. Vercel Configuration

**Create:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["lhr1"],
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret",
    "RESEND_API_KEY": "@resend-api-key",
    "CRON_SECRET": "@cron-secret"
  }
}
```

### 3. Monitoring Dashboard

**Create:** `/src/app/admin/dashboard/page.tsx`

```typescript
export default async function AdminDashboard() {
  // Fetch metrics from database
  const metrics = await getMetrics();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">System Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          title="Users"
          value={metrics.totalUsers}
          change="+12% this week"
        />
        <MetricCard
          title="Revenue (Today)"
          value={`£${metrics.dailyRevenue}`}
          change="+8% vs yesterday"
        />
        <MetricCard
          title="AI Cost (Today)"
          value={`£${metrics.dailyAICost}`}
          change="Within budget"
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate}%`}
          change="Normal"
        />
      </div>
    </div>
  );
}
```

---

# ⚖️ AGENT 6: LEGAL ARCHITECT

**Role:** Legal Frameworks, Templates, Compliance  
**Duration:** Days 1-3 (First to start!)  
**Primary Docs:** `/docs/LEGAL_AGENT_SPECIFICATION.md`

## 🎯 YOUR MISSION

Create complete legal framework:
- ✅ Jurisdiction configurations (3 jurisdictions)
- ✅ 180+ document templates
- ✅ Council data (380+ UK councils)
- ✅ Decision rules
- ✅ Compliance checkers
- ✅ AI prompts

## 📦 DELIVERABLES

### Day 1: Legal Frameworks
- [ ] England & Wales config complete
- [ ] Scotland config complete
- [ ] Northern Ireland config complete
- [ ] All decision rules documented

### Day 2: Document Templates
- [ ] All eviction templates (Section 8, 21, N5, etc.)
- [ ] Money claim templates
- [ ] Tenancy agreements (Standard, Premium, HMO)
- [ ] HMO licensing templates
- [ ] Handlebars format, court-ready

### Day 3: Council Data & AI Prompts
- [ ] 380+ UK councils in database
- [ ] Licensing requirements per council
- [ ] Contact details and fees
- [ ] AI prompts for all agents
- [ ] Validation rules

---

## 🔧 KEY DELIVERABLES

### 1. Jurisdiction Config Structure

**Create:** `/config/jurisdictions/uk/england-wales/law_summary.md`

50-page comprehensive summary including:
- Housing Act 1985, 1988, 1996, 2004
- All Section 8 grounds (17 total)
- Section 21 compliance requirements
- Court procedures
- Evidence requirements
- Timeline expectations

### 2. Decision Rules

**Create:** `/config/jurisdictions/uk/england-wales/decision_rules.yaml`

```yaml
section_8_grounds:
  ground_8:
    name: "Serious rent arrears"
    type: "mandatory"
    conditions:
      - rent_overdue_months >= 2
      - rent_owed >= rent_per_month * 2
    notice_period_days: 14
    success_probability: 95

  ground_10:
    name: "Some rent arrears"
    type: "discretionary"
    conditions:
      - rent_overdue_months >= 1
    notice_period_days: 14
    success_probability: 70

section_21_eligibility:
  conditions:
    - deposit_protected: true
    - prescribed_info_served: true
    - how_to_rent_provided: true
    - gas_safety_valid: true
    - epc_provided: true
    - tenancy_type: "ast"
    - notice_timing: "after_fixed_term_or_4months"
  notice_period_days: 60

red_flags:
  - condition: "deposit_protected == false"
    severity: "critical"
    message: "Deposit not protected - Section 21 unavailable"
    
  - condition: "vulnerable_tenant == true"
    severity: "warning"
    message: "Vulnerable tenant - seek legal advice"
```

### 3. Council Data

**Create:** `/config/councils/council_data.json`

```json
{
  "councils": [
    {
      "council_code": "manchester",
      "council_name": "Manchester City Council",
      "region": "England",
      "postcode_areas": ["M1", "M2", "M3", "M4", "M5", "M11", "M12", "M13", "M14", "M15"],
      "licensing": {
        "has_mandatory_licensing": true,
        "has_additional_licensing": true,
        "has_selective_licensing": false,
        "additional_areas": ["City Centre", "Moss Side", "Rusholme"]
      },
      "requirements": {
        "min_room_size_sqm": 6.51,
        "max_occupants_per_bathroom": 5,
        "requires_fire_alarm": true,
        "requires_fire_blanket": true
      },
      "contact": {
        "licensing_team_email": "hmo@manchester.gov.uk",
        "licensing_team_phone": "0161 234 5000",
        "application_url": "https://www.manchester.gov.uk/hmo",
        "guidance_url": "https://www.manchester.gov.uk/hmo-guidance"
      },
      "fees": {
        "mandatory_license_new": 1043.00,
        "mandatory_license_renewal": 868.00
      }
    }
    // ... 379 more councils
  ]
}
```

### 4. Document Template Example

**Create:** `/config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs`

```handlebars
<!DOCTYPE html>
<html>
<head>
  <title>Section 8 Notice Seeking Possession</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2cm; }
    h1 { text-align: center; font-size: 18pt; }
    .section { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>NOTICE SEEKING POSSESSION OF A PROPERTY LET ON AN ASSURED TENANCY OR AN ASSURED AGRICULTURAL OCCUPANCY</h1>
  <h2>Housing Act 1988 Section 8 as amended by Section 151 of the Housing Act 1996</h2>

  <div class="section">
    <h3>To:</h3>
    <p><strong>{{tenant.fullName}}</strong></p>
    <p>{{property.address}}</p>
  </div>

  <div class="section">
    <h3>From:</h3>
    <p><strong>{{landlord.fullName}}</strong></p>
    <p>{{landlord.address}}</p>
  </div>

  <div class="section">
    <h3>GROUNDS FOR POSSESSION</h3>
    {{#each grounds}}
      <h4>Ground {{this.number}}: {{this.title}}</h4>
      <p>{{this.description}}</p>
      <p><strong>Particulars:</strong></p>
      <p>{{this.particulars}}</p>
    {{/each}}
  </div>

  <div class="section">
    <h3>NOTICE PERIOD</h3>
    <p>This notice gives you <strong>{{noticePeriod}} days</strong> notice that possession is required.</p>
    <p>Service date: {{dates.serviceDate}}</p>
    <p>Earliest date for possession: {{dates.expiryDate}}</p>
  </div>

  <div class="section">
    <h3>SIGNATURE</h3>
    <p>_________________________</p>
    <p>{{landlord.fullName}}</p>
    <p>Date: {{dates.signatureDate}}</p>
  </div>
</body>
</html>
```

---

## ✅ MASTER COMPLETION CHECKLIST

When all 6 agents complete their work:

### Integration Checkpoints
- [ ] Frontend calls Backend APIs successfully
- [ ] Backend stores data in Supabase correctly
- [ ] AI Pipeline generates documents
- [ ] QA validation scoring >85
- [ ] Payments process end-to-end
- [ ] Webhooks received and processed
- [ ] HMO Pro subscription works with trial
- [ ] Emails send correctly
- [ ] Reminders trigger daily
- [ ] Error tracking captures issues
- [ ] All 380 councils searchable

### Quality Gates
- [ ] All TypeScript compiles with no errors
- [ ] All tests passing
- [ ] No console errors in browser
- [ ] Mobile responsive on all pages
- [ ] API response times <500ms
- [ ] Document generation <10s
- [ ] QA validation >85 score
- [ ] RLS prevents cross-user access
- [ ] Rate limiting working

### Production Readiness
- [ ] Environment variables in Vercel
- [ ] Domain configured with SSL
- [ ] Stripe webhooks configured
- [ ] Email DNS records set (SPF, DKIM)
- [ ] Monitoring dashboard live
- [ ] Error alerts configured
- [ ] Backup strategy documented
- [ ] Legal disclaimer present
- [ ] Terms & Privacy published

---

## 🎯 AGENT COORDINATION

**Communication Protocol:**

1. **Agent 6 goes first** (Days 1-3)
   - Generates all legal configs
   - Provides templates to Agent 3
   - Provides council data to Agent 2

2. **Agents 1, 2, 3, 4, 5 in parallel** (Days 4-7)
   - Agent 1: Builds UI (needs Agent 2's API shapes)
   - Agent 2: Builds APIs (needs Agent 6's configs)
   - Agent 3: Implements AI (needs Agent 6's templates)
   - Agent 4: Integrates payments (needs Agent 2's order system)
   - Agent 5: Sets up infrastructure (needs everyone's env vars)

3. **Integration Phase** (Days 8-10)
   - Connect all pieces
   - Test end-to-end flows
   - Fix integration bugs

4. **HMO Pro Phase** (Days 11-14)
   - HMO-specific features
   - Subscription flows
   - Dashboard polish

5. **Launch!** (Day 15) 🚀

---

**END OF AGENTS 3-6 INSTRUCTIONS**

With these 6 agents working together, you'll have a complete, production-ready Landlord Heaven platform in 2 weeks!
