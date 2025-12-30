# Supabase Database Setup

This directory contains the complete database schema for Landlord Heaven.

## Quick Start

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### Option 2: Manual SQL Execution

Run each migration file in order in the Supabase SQL Editor:

1. `001_core_schema.sql` - Users, cases, case_facts, documents
2. `002_orders_payments.sql` - Orders, webhook_logs
3. `003_hmo_pro.sql` - HMO properties, tenants, compliance
4. `004_ai_conversations.sql` - AI usage tracking, conversations
5. `005_councils.sql` - UK councils reference data
6. `006_email_leads.sql` - Email subscribers, events
7. `007_seo_automation.sql` - SEO pages, keywords, queue
8. `008_storage.sql` - Storage bucket setup

## Database Schema

### Core Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `users` | User profiles (extends auth.users) | User-owned |
| `cases` | Legal cases / wizard sessions | User-owned + anonymous |
| `case_facts` | Wizard facts storage (JSONB) | Via case ownership |
| `documents` | Generated legal documents | User-owned + anonymous |
| `conversations` | Ask Heaven chat history | Via case ownership |

### Orders & Payments

| Table | Description | RLS |
|-------|-------------|-----|
| `orders` | One-time purchases | User-owned |
| `webhook_logs` | Stripe webhook logs | Service role only |

### HMO Pro

| Table | Description | RLS |
|-------|-------------|-----|
| `hmo_properties` | HMO property management | User-owned |
| `hmo_tenants` | Tenant records | User-owned |
| `hmo_compliance_items` | Compliance tracking | User-owned |

### Reference Data

| Table | Description | RLS |
|-------|-------------|-----|
| `councils` | UK councils with HMO info | Public read |
| `ai_usage` | AI token tracking | User-owned |
| `ai_usage_logs` | View for backwards compat | - |

### Email & SEO

| Table | Description | RLS |
|-------|-------------|-----|
| `email_subscribers` | Lead capture | Service role only |
| `email_events` | Email event tracking | Service role only |
| `seo_pages` | SEO landing pages | Public read (published) |
| `seo_keywords` | Keyword tracking | Service role only |
| `seo_content_queue` | Content generation queue | Service role only |
| `seo_automation_log` | Automation task logs | Service role only |

## Storage Buckets

Create these buckets in Supabase Dashboard > Storage:

| Bucket | Purpose | Public | Size Limit |
|--------|---------|--------|------------|
| `documents` | Generated PDFs | No | 10MB |
| `evidence` | Uploaded evidence | No | 25MB |
| `certificates` | HMO certificates | No | 10MB |

## Row Level Security (RLS)

All tables have RLS enabled with these patterns:

- **User-owned**: Users can CRUD their own records
- **Anonymous access**: Via session_token header for anonymous wizard
- **Service role**: Full access for server-side operations
- **Public read**: For reference data (councils, published SEO)

## Anonymous Wizard Flow

The schema supports anonymous users completing the wizard before signup:

1. Anonymous case created with `user_id = NULL` and `session_token`
2. Session token stored in browser localStorage
3. Passed via `x-session-token` header for RLS validation
4. After signup, case gets linked to user account

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Seeding Data

After running migrations, seed the councils table:

```bash
npm run seed:councils
```

This populates the `councils` table with 380+ UK councils and HMO licensing data.

## Maintenance

### Adding New Migrations

1. Create new file: `XXX_description.sql`
2. Use next number in sequence
3. Include proper RLS policies
4. Add indexes for common queries
5. Update this README

### Checking Migration Status

```bash
supabase db diff
```

### Rolling Back

Supabase doesn't support automatic rollbacks. Create a new migration to undo changes.
