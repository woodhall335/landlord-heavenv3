# HMO LICENSING PACK TECHNICAL AUDIT

**Date:** 2025-12-27
**Auditor:** Claude (Opus 4.5)
**Scope:** England HMO Licensing Pack feasibility assessment
**Status:** Decision-grade technical audit

---

## Executive Summary

The codebase has **scaffolding** for HMO functionality (database schema, HMO detection, compliance audit framework) but **no production-ready HMO product**. The specification document (`docs/HMO_LICENSING_SUITE_SPECIFICATION.md`) explicitly states:

> "Implementation has not started in this codebase: there are no HMO MQS YAMLs, no wizard wiring, and no document generators yet."

**Verdict:** Do NOT ship any HMO licensing packs at premium pricing (£249.99+) until minimum 2-3 weeks of engineering work.

---

## 1. ASSET INVENTORY

| Asset / Feature | Exists Now? | File Path | Notes |
|-----------------|-------------|-----------|-------|
| **Council Data (London)** | Partial | `scripts/councils-data.ts` | 33 London councils with full HMO licensing data - NOT connected to frontend |
| **Council Data (Rest of England)** | No | `src/config/jurisdictions/uk/england/councils.json` | Only 8 placeholder councils |
| **Council Postcode Lookup** | Partial | `src/app/tools/hmo-license-checker/page.tsx` | Basic lookup works for London only |
| **HMO Detection Utility** | Yes | `src/lib/utils/hmo-detection.ts` | Functional - detects HMO based on tenant count/facilities |
| **HMO License Checker (Free Tool)** | Yes | `src/app/tools/hmo-license-checker/page.tsx` | Generates PDF assessment, educational content |
| **HMO Dashboard UI** | Partial | `src/app/dashboard/hmo/page.tsx` | Gated with `V1_BLOCK_HMO = true` - non-functional |
| **HMO Properties API** | Partial | `src/app/api/hmo/properties/route.ts` | Disabled via `HMO_PRO_ENABLED = false` |
| **HMO Database Schema** | Yes | `supabase/schema.sql` | `hmo_properties` and `hmo_tenants` tables with fire safety fields |
| **Compliance Audit Generator** | Yes | `src/lib/ai/compliance-audit-generator.ts` | Checks HMO licensing, gas, electrical, EPC, deposit |
| **Risk Assessment Engine** | Yes | `src/lib/case-intel/risk-assessment.ts` | Includes HMO licensing check |
| **Ask Heaven AI** | Partial | `src/lib/ai/ask-heaven.ts` | Prompt mentions HMO, no HMO-specific training |
| **HMO Tenancy Agreement Fields** | Yes | `config/mqs/tenancy_agreement/england.yaml:1200-1256` | Premium AST collects: is_hmo, licence_status, licence_number, expiry |
| **Fire Safety in Templates** | Partial | Various `.hbs` files | AST/inventory templates mention smoke alarms |
| **HMO MQS Wizard YAML** | No | — | No `/config/mqs/hmo/*.yaml` exists |
| **HMO Document Generator** | No | — | No floor plan, fire map, or application form generator |
| **Council Forms (HMO)** | No | — | No `/public/official-hmo-forms/` directory |
| **Fire Risk Scoring** | No | — | No scoring algorithm exists |
| **Floor Plan Generator** | No | — | Not built |
| **Fire Map Generator** | No | — | Not built |
| **Evidence Bundler (HMO)** | No | — | Not built |
| **Amenity Standards Checker** | No | — | No room size validation, bathroom ratio checks |
| **Room Size Validation** | No | — | No minimum bedroom size logic |
| **Council-Specific Rules Engine** | No | — | No council-specific licensing rules enforcement |
| **HMO Pro Subscription Flow** | No | `src/lib/feature-flags.ts` | Stripe products defined but not active |

---

## 2. WHAT CAN BE BUILT TODAY

### Immediately (0 work)
**Nothing** — No HMO document generators exist

### ≤1 Day Work

| Item | Effort | Notes |
|------|--------|-------|
| HMO Compliance Checklist PDF | <1 day | Adapt existing compliance-audit-generator output to HMO-specific PDF template |
| HMO Status Summary | <1 day | Extend free HMO License Checker PDF with more detail |
| Fire Safety Self-Audit Template | <1 day | Create static `.hbs` template from fire safety fields in schema |
| HMO Tenancy Agreement Addendum | <1 day | Extract HMO clauses from Premium AST into standalone document |
| Certificate Expiry Checklist | <1 day | List gas/EICR/EPC/license dates — trivial template |

### ≤1 Week Work

| Item | Effort | Notes |
|------|--------|-------|
| Council Requirement Lookup Report | 3-5 days | Seed all 317 England councils into Supabase, API endpoint, PDF template |
| HMO Wizard Flow | 3-5 days | Create `/config/mqs/hmo/england.yaml` with property, rooms, facilities, certificates questions |
| Pre-Application Risk Report | 3-5 days | Extend risk-assessment.ts for HMO-specific scoring, create PDF template |
| Evidence Checklist (What to Upload) | 2-3 days | Static checklist based on council requirements |

### Not Feasible Without New System

| Item | Reason |
|------|--------|
| AI Floor Plan Generator | Requires new SVG/canvas rendering engine (~2-4 weeks) |
| Fire Escape Map Generator | Requires floor plan system first |
| Auto-Fill Council Application Forms | Requires sourcing 317+ council PDF forms + field mapping (~months) |
| Council-Specific Rule Enforcement | Requires research and encoding of each council's unique rules |
| Real-Time Compliance Scoring | Requires full council rule matrix (selective/additional schemes vary by ward) |

---

## 3. PRICE-FIT ASSESSMENT

### £249.99 England-Wide HMO Licensing Pack

**Is this defensible right now?**

**NO.**

**Reasoning:**
- Zero HMO-specific document generators
- No council application form auto-fill
- No floor plans or fire maps
- Council data covers only 33/317 councils (10%)
- The only functional HMO tool is the FREE license checker
- Compliance audit exists but isn't HMO-specific

**What we could ship in 1 day:** A checklist, a self-audit template, and a tenancy addendum — worth **£29.99-£49.99 max**, not £249.99.

**To justify £249.99 we would need:**
- Full HMO MQS wizard (3-5 days)
- Council lookup for all 317 councils (5+ days)
- HMO-specific risk/compliance report (3-5 days)
- Evidence checklist per council type (2-3 days)
- Basic PDF pack generation (2-3 days)

**Minimum viable £249.99 pack = 2-3 weeks engineering**

---

### £499.99 Council-Specific HMO Pack

**Is this realistic with what we have?**

**NO.**

**Reasoning:**
- Council-specific requires:
  - All 317+ England council forms sourced and mapped
  - Each council's unique HMO standards encoded
  - Selective/additional licensing ward boundaries
  - Current fee schedules (change frequently)
- This is **not a product build**, it's a **data infrastructure project**
- Estimated: **2-4 months** to build properly
- Ongoing maintenance: councils change schemes quarterly

**Council-specific pack requires new data systems that don't exist.**

---

## 4. RECOMMENDATION

### Verdict: Ship NO HMO Packs Yet

| Risk Category | Level | Notes |
|---------------|-------|-------|
| Support Impact | HIGH | Users expecting council-ready applications will get generic checklists |
| Legal/Compliance Risk | HIGH | Missing council-specific requirements could lead to failed applications |
| Reputation Risk | HIGH | £249.99 for what's essentially an expanded version of the free tool |

### Alternative Path

| Phase | Product | Price | Effort | Timeline |
|-------|---------|-------|--------|----------|
| 1 | HMO Self-Assessment Kit | £29.99 | 1-2 days | Immediate |
| 2 | HMO Compliance Pack | £149.99 | 2-3 weeks | Q1 2026 |
| 3 | Council-Specific Pack | £499.99 | 2-4 months | V2 |

#### Phase 1: HMO Self-Assessment Kit (£29.99)
- Expanded version of free checker
- Fire safety self-audit template
- Certificate expiry tracker
- HMO tenancy addendum clauses
- **No council-specific claims**

#### Phase 2: HMO Compliance Pack (£149.99)
- Full HMO wizard
- Council lookup (all 317 councils seeded)
- Generic HMO compliance report
- Evidence checklist
- **NO council form auto-fill** (too risky)

#### Phase 3: Council-Specific Pack (£499.99) — V2
- Requires council forms project
- Requires ongoing data maintenance
- Consider partnership with council data provider

---

## 5. KEY FILE REFERENCES

### Existing HMO Infrastructure
- `src/lib/utils/hmo-detection.ts` — HMO detection logic
- `src/app/tools/hmo-license-checker/page.tsx` — Free HMO checker tool
- `scripts/councils-data.ts` — London council data with licensing details
- `supabase/schema.sql:225-262` — `hmo_properties` table schema
- `supabase/schema.sql:292-300` — `hmo_tenants` table schema
- `src/lib/ai/compliance-audit-generator.ts` — Compliance audit with HMO check
- `src/lib/case-intel/risk-assessment.ts` — Risk assessment with HMO licensing
- `config/mqs/tenancy_agreement/england.yaml:1200-1256` — Premium AST HMO questions

### Blocked/Gated Features
- `src/lib/feature-flags.ts` — `HMO_PRO_ENABLED = false`
- `src/app/dashboard/hmo/page.tsx:51` — `V1_BLOCK_HMO = true`
- `src/app/api/hmo/properties/route.ts:18` — Feature flag check

### Specification (Roadmap Only)
- `docs/HMO_LICENSING_SUITE_SPECIFICATION.md` — Full product vision (not implemented)

---

## 6. CONCLUSION

**Bottom line:** The codebase has scaffolding but no production-ready HMO product. The spec document explicitly states implementation has not started. Shipping at £249.99+ now would be selling vaporware.

**Recommended action:**
1. Ship £29.99 self-assessment kit immediately (1-2 days)
2. Plan £149.99 compliance pack for Q1 (2-3 weeks)
3. Defer council-specific pack to V2

---

*Audit completed 2025-12-27*
