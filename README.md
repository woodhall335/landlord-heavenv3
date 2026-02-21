# Landlord Heaven v3  
Full-stack AI legal automation platform for UK landlords.

This repository contains the full source code for **Landlord Heaven v3**, including:

- AI-powered legal wizard (evictions, arrears, notices, ASTs)
- Decision engine (multi-jurisdiction)
- Document generation pipeline (GPT-4 + Claude + Handlebars + PDF generator)
- Stripe one-time products and HMO Pro subscription tiers
- HMO compliance system (council data, licence docs, reminders)
- Supabase backend (auth, RLS, storage, SQL schema)
- Next.js 14 App Router frontend (React Compiler enabled)

---

## 🚀 Getting Started (Development)

### 1. Install dependencies

```bash
npm install
2. Create .env.local
Copy the template:

bash
Copy code
cp .env.example .env.local
Then fill in:

Supabase keys

Stripe keys

OpenAI + Anthropic keys

Resend (optional)

Analytics (optional)

3. Run the development server
bash
Copy code
npm run dev
Your app will be available at:

arduino
Copy code
http://localhost:3000

---

## ✅ Testing

- Run the full suite (legacy failures may still exist): `pnpm test`
- Run the SEO single-H1 guardrail: `pnpm test:seo`

🧠 Project Architecture
Full documentation is located in /docs.

Key files:

/docs/MASTER_DOCUMENTATION_INDEX.md

/docs/AI_PIPELINE_ARCHITECTURE.md

/docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md

/docs/DATABASE_SCHEMA.md

/docs/LEGAL_AGENT_SPECIFICATION.md

These describe:

Multi-agent code generation workflow

AI model selection

Fact-finding → decision → document generation pipeline

Full database schema (cases, facts, documents, orders, HMO tables, councils, reminders)

Stripe integration strategy

🛠 Tech Stack
Next.js 14 (App Router, React Compiler)

Supabase (Postgres, Auth, RLS, Storage)

Stripe (one-offs + subscriptions)

OpenAI GPT-4 / 4.1 (generation + routing)

Anthropic Claude Sonnet 3.5 (QA + consistency checks)

Handlebars (templating)

Puppeteer / Playwright (PDF generation)

Tailwind CSS (UI)

Radix UI (components)

📦 Features
Core Legal Workflows
Section 8

Section 21

Money claims

AST drafting (Standard & Premium)

Pre-action notices

Court form automation

Document storage and download

HMO Pro (Full Feature Set)
Tiered subscription (1–5, 6–10, 11–15, 16–20 units)

Council database + local rules

HMO licence pack generation

Reminders (renewal, inspections, compliance)

Property portfolio dashboard
