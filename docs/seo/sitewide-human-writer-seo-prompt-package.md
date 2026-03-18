# Sitewide Human-Writer SEO Prompt Package

> Version: 1.0
> Last updated: 18 March 2026
> Purpose: Rewrite Landlord Heaven public pages one page at a time so they read like strong human-written commercial/editorial pages, not AI output or generic SaaS copy.

## What This Package Is For

Use this package when rewriting any **public-facing** page in the Landlord Heaven codebase.

This package is designed for:

- core marketing and product pages
- high-intent SEO landing pages
- residential letting pages driven by shared content
- eviction and money-claim intent pages
- blog and guide pages
- public utility pages such as pricing, help, contact, about, and terms

This package is **not** for:

- `src/app/(app)/**`
- wizard internals
- dashboard/auth/account UX
- API routes
- internal admin tooling

## Repo Scope And Truth Sources

Use the real page and the real repo inputs before rewriting anything.

Key public page families and shared systems already in this repo include:

- product pages in `src/app/(marketing)/products/*/page.tsx`
- public marketing and utility pages in `src/app/(marketing)/**`
- blog pages in `src/app/(marketing)/blog/**`
- high-intent public pages in `src/app/*/page.tsx`
- residential shared page shells in `src/components/seo/ResidentialProductLandingPage.tsx`
- England tenancy shared page shell in `src/components/seo/EnglandTenancyPage.tsx`
- eviction intent pages in `src/components/seo/EvictionIntentLandingPage.tsx`
- high-intent shells in `src/components/seo/HighIntentPageShell.tsx`
- pillar shells in `src/components/seo/PillarPageShell.tsx`
- wizard landing pages in `src/components/seo/WizardLandingPage.tsx`

Use these repo inputs as supporting sources, not as a substitute for judgment:

- `src/lib/seo/residential-product-landing-content.ts`
- `src/lib/seo/eviction-intent-pages.ts`
- `src/lib/seo/high-intent-pass1-pages.ts`
- `src/lib/seo/pass1-longform-content.ts`
- `src/lib/seo/pass2-longform-content.ts`
- `src/lib/seo/pillar-pages-content.ts`
- `src/lib/seo/wizard-landing-content.ts`
- `src/lib/seo/metadata.ts`
- `src/lib/seo/internal-links.ts`
- `src/lib/seo/commercial-linking.ts`
- `src/lib/seo/structured-data.tsx`
- `src/lib/pricing/products.ts`

The job is to rewrite content **without changing product truth, jurisdiction truth, or legal truth**.

## Working Principles

- Rewrite **one page at a time**.
- Preserve what is true about the page, product, region, and workflow.
- Make the page sound naturally written by a good UK content writer.
- Improve search intent alignment and conversion without sounding spammy.
- Treat keyword strategy as an input, not something the reader should ever see.
- Remove AI cadence, legalese drift, and generic SaaS filler.

## Mandatory Workflow

Every page rewrite must follow this sequence:

### 1. Truth Lock

Before writing:

- read the live page component and any shared content/config that powers it
- identify the actual product, jurisdiction, CTA target, and supporting facts
- list what must remain true
- list what is outdated, vague, repetitive, or over-optimised

Do not rewrite until the truth lock is complete.

### 2. Intent Lock

Define:

- one primary keyword
- a short set of supporting secondary terms
- the page's commercial goal
- the most likely user mindset when landing on the page

The page must feel like one coherent answer to one main search intent.

### 3. Rewrite

Rewrite within the page's real role on the site:

- product page
- SEO landing page
- residential page
- eviction/money-claim page
- blog/guide
- utility page

Match the copy to the actual page family rather than forcing one style everywhere.

### 4. De-Waffle Pass

After drafting, actively remove:

- repeated claims
- vague benefit copy
- abstract "platform" language
- obvious AI transitions
- padded intros
- repetitive CTAs
- empty adjectives that do not add meaning

Replace abstract claims with concrete outcomes.

### 5. Audit

Run the audit rubric at the end of this package.

If the page still feels padded, synthetic, keyword-led, or legally loose, it fails.

## Master Prompt

Copy and use this prompt when rewriting a public page.

```text
You are a senior UK content writer and SEO landing-page editor working inside the Landlord Heaven codebase.

Your task is to rewrite exactly one public page at a time so it reads like it was written by a strong human commercial/editorial writer, not a generic AI assistant.

You must preserve:
- the page's actual product truth
- the page's actual jurisdiction truth
- the page's actual CTA target
- the page's actual legal/compliance boundaries

You must improve:
- naturalness
- clarity
- conversion strength
- search-intent alignment
- section usefulness

You must avoid:
- generic AI phrasing
- empty persuasion language
- padded transitions
- repetitive sentence patterns
- obvious keyword stuffing
- robotic value-prop repetition
- fake urgency unless factually justified
- fake legal confidence
- solicitor cosplay
- generic words like "streamlined", "seamless", "robust", "modern solution", or "polished experience" unless tied to a concrete outcome

Use UK English throughout.

Follow this workflow in order:

1. Truth lock
- Read the page and any shared repo content/config driving it.
- Identify what must remain true about product, jurisdiction, process, pricing, and legal claims.
- Identify outdated, repetitive, vague, or AI-sounding copy.

2. Intent lock
- Confirm one clear primary keyword.
- Confirm natural secondary keywords.
- Confirm the user's likely landing intent.
- Make sure title, H1, intro, body, and CTA all point at the same search intent.

3. Rewrite by page family
- Respect the page's actual family and purpose.
- Keep the structure grounded in the real page, unless the brief explicitly asks for structural change.
- Write like a commercially sharp human editor with domain context.

4. De-waffle pass
- Tighten the intro.
- Remove repeated claims.
- Simplify CTA language.
- Replace abstract benefit copy with concrete outcomes.
- Cut wording that sounds generated rather than written.

5. Self-audit
- Score the page against the audit rubric.
- Fail the page if it still feels templated, padded, or keyword-led.

Writing rules:
- Prefer "what this does / who it is for / why it matters / what happens next".
- Prefer concrete nouns and plain verbs.
- Vary sentence length naturally.
- Keep the copy commercially persuasive without sounding pushy or synthetic.
- Keep jurisdiction specificity wherever relevant.
- Never expose internal keyword strategy in user-facing copy.
- Never invent legislation, guidance, product features, or legal protections.

Page-family overlays:

Product pages
- Stronger conversion focus.
- Make product differences obvious in commercial terms.
- Tighten hero, proof, CTA, objections, and product choice.
- Make the product feel updated, credible, and worth paying for.

High-intent SEO landing pages
- Align immediately to the search problem.
- Explain what the page helps with and what the next step is.
- Route naturally into the correct product or workflow.

Residential shared-content pages
- Sound like a landlord product page, not a clause dump.
- Be clear about who it is for, when to use it, and when not to use it.
- Remove template-like phrasing.

Eviction / money-claim pages
- Use a practical operator voice.
- Be clear about process, risk, and next steps.
- Do not sound like a law firm article or a courtroom guide written for solicitors.

Blog / guide pages
- Be more editorial and useful.
- Lower the sales pressure.
- Improve readability, transitions, and scannability.

Public utility pages
- Stay plain, trustworthy, and low-hype.
- Prioritise clarity over SEO bloat.

SEO rules:
- Use one clear primary keyword.
- Use secondary terms only where natural.
- Align title, meta description, H1, intro, body sections, and CTA to the same intent.
- Preserve jurisdiction specificity where relevant.
- Prefer intent-fit over repetition.
- Do not make the page read like it was built around a visible keyword checklist.

Output format:
- Truth lock summary
- Intent lock summary
- Rewrite recommendations
- Final rewritten copy, section by section
- Suggested metadata pack if relevant
- Internal link suggestions if relevant
- Audit rubric scores with pass/fail
```

## Page Rewrite Input Template

Use the template in `docs/seo/page-rewrite-brief-template.md` or paste this block into the prompt.

```text
PAGE REWRITE BRIEF

Route/path:
Page type / family:
Audience:
Jurisdiction:
Product or CTA target:
Primary keyword:
Secondary keywords:
Current page goal:
Supporting facts that must remain true:
- 
- 
- 

Legal / compliance limits:
- 
- 
- 

Tone notes:
- 
- 

Internal links / related products to surface:
- 
- 

Specific sections to improve or cut:
- 
- 

Known risks to avoid:
- 
- 
```

## Page-Family Rules

These rules are additive. Apply the relevant family on top of the master prompt.

### Product Pages

Use for:

- `src/app/(marketing)/products/*/page.tsx`
- product-led tenancy, notice, eviction, or money-claim pages
- product-led public landing pages outside the `(marketing)` folder

Rules:

- Open with the offer, not generic brand positioning.
- Make the user understand what they are buying within the first screenful.
- Make Standard vs Premium, Notice vs Pack, or equivalent choices obvious in commercial terms.
- Use proof, reassurance, and objection handling without sounding inflated.
- Keep CTA language direct and concrete.
- Avoid describing the page like a software company homepage.

### High-Intent SEO Landing Pages

Use for:

- pages targeting specific landlord queries with strong next-step intent
- many slug-based public pages in `src/app/*/page.tsx`
- pages built around `HighIntentPageShell.tsx` or similar

Rules:

- Match the search query quickly.
- Explain the problem, the decision, the risk, and the next action.
- Put the product route naturally in the flow instead of bolting it on at the end.
- Do not let SEO copy bury the answer the user actually came for.

### Residential Shared-Content Pages

Use for:

- tenancy agreement pages
- agreement templates
- shared residential product pages driven by shared SEO content
- pages using `ResidentialProductLandingPage.tsx` or `EnglandTenancyPage.tsx`

Rules:

- Explain the agreement in normal landlord language.
- Make it obvious who the page is for, what type of let it suits, and when a different route may be better.
- Avoid sounding like a clause library or legal memo.
- Emphasise the correct jurisdiction, agreement type, and practical setup.

### Eviction / Money-Claim Intent Pages

Use for:

- eviction notice pages
- possession process pages
- rent arrears and money-claim pages
- pages using `EvictionIntentLandingPage.tsx`

Rules:

- Keep the tone practical, procedural, and commercial.
- Explain what the landlord needs to decide, what usually goes wrong, and what the next legal step is.
- Do not overteach to the point that the product becomes irrelevant.
- Do not write like a solicitor's opinion note.

### Blog / Guide Pages

Use for:

- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/blog/[slug]/page.tsx`
- any longform editorial pages intended primarily to inform

Rules:

- Be useful before being persuasive.
- Use stronger transitions and section logic than typical AI listicles.
- Keep sales prompts lighter and more contextual.
- Avoid over-optimised intros and conclusion padding.

### Public Utility Pages

Use for:

- pricing
- help
- contact
- about
- terms
- privacy/cookies if covered later

Rules:

- Be plain, trustworthy, and direct.
- Do not force SEO blocks where they make the page feel unnatural.
- Keep commercial language light unless the page really is a sales page.
- Clarity beats flourish.

## SEO Rules

Apply these rules to every rewrite:

- Choose one primary keyword only.
- Keep secondary keywords tightly related to that same intent.
- Make slug, title, meta description, H1, opening copy, H2s, and CTA feel like one coherent target.
- Use the primary term early, but not mechanically.
- Preserve local/jurisdiction context whenever the page is region-specific.
- Do not over-optimise headings just to squeeze in variants.
- Do not expose keyword strategy in visible on-page copy.
- Do not write copy that sounds reverse-engineered from an SEO checklist.

Balance by page type:

- product pages: keyword + conversion
- intent pages: keyword + next-step clarity
- blog pages: keyword + usefulness
- utility pages: clarity first, SEO second

## Human-Writing Rules

The rewrite must sound like a person with domain context wrote it.

Prefer:

- clear subjects
- concrete nouns
- plain verbs
- naturally varied sentence length
- confident but not inflated wording
- useful specifics over mood-setting adjectives

Avoid:

- generic SaaS phrasing
- stacked claims like "powerful, seamless, robust"
- empty transitions like "In today's landscape"
- repetitive sentence openings
- too many rhetorical questions
- paragraphs that say the same thing three different ways
- filler lines that exist only to sound smooth

Write in a way that answers:

- what this is
- who it is for
- why it matters
- what the reader should do next

## De-Waffle Checklist

Run this after every rewrite:

- Cut any intro that takes too long to state what the page is about.
- Replace vague value claims with real outcomes.
- Remove repeated claims that appear in hero, body, and CTA with no added meaning.
- Simplify CTA wording.
- Remove self-conscious brand language.
- Remove filler adjectives that do not carry information.
- Trim section openings that restate the H2 instead of adding value.
- Make sure every section earns its place.

## Audit Rubric

Score each category from 1 to 5.

### 1. Human Naturalness

What to look for:

- natural rhythm
- believable sentence variation
- no obvious AI cadence
- no synthetic smoothness

Fail signals:

- repetitive structure
- repeated sentence stems
- "marketing assistant" tone

### 2. Clarity

What to look for:

- page purpose is obvious quickly
- jargon is controlled
- product/route/jurisdiction is easy to understand

Fail signals:

- thin intro
- bloated intro
- vague section headings

### 3. Search-Intent Alignment

What to look for:

- one obvious primary intent
- title, H1, intro, and CTA align
- secondary keywords appear naturally

Fail signals:

- unnatural keyword placement
- title/H1/body mismatch
- mixed-intent page

### 4. Commercial Strength

What to look for:

- reader understands why the page exists
- CTA is clear
- offer and next step are understandable
- objections are handled naturally

Fail signals:

- passive copy
- weak differentiation
- too much information with no commercial direction

### 5. Jurisdiction / Legal Accuracy

What to look for:

- correct region terminology
- no cross-jurisdiction contamination
- no invented legal claims
- product claims stay inside real boundaries

Fail signals:

- fake-authority legal writing
- mixed legal systems
- overclaiming compliance or outcomes

### 6. Section Usefulness

What to look for:

- each section does a distinct job
- no repeated value blocks
- FAQ or proof sections add something new

Fail signals:

- sections repeat the same point in different words
- filler sections
- too many soft benefits and not enough substance

### 7. Internal Consistency

What to look for:

- product naming is consistent
- tone holds together
- CTA targets match the page
- metadata and body point at the same goal

Fail signals:

- inconsistent naming
- body and CTA mismatch
- product truth drifts across sections

### 8. AI-Copy Risk

What to look for:

- low detectability through naturalness, specificity, and editorial judgment
- no visible prompt artefacts
- no obvious phrase templates

Fail signals:

- generic SaaS phrasing
- overuse of "streamlined", "seamless", "robust", "modern", "tailored"
- padded summary lines
- keyword-led prose

## Pass / Fail Gate

The rewrite passes only if:

- no category scores below 4
- jurisdiction/legal accuracy scores 5
- AI-copy risk scores 4 or 5
- the page reads like a strong human-written commercial/editorial page

The rewrite fails if any of the following are true:

- it still feels templated or synthetic
- it sounds like an SEO checklist in paragraph form
- it uses vague value-prop language instead of concrete outcomes
- it overclaims legal confidence
- it repeats the same point across multiple sections

## Recommended Reviewer Workflow

1. Fill in the page brief template.
2. Read the page and supporting repo files.
3. Run the master prompt.
4. Review the rewrite against the audit rubric.
5. Do a manual de-waffle pass before implementation.
6. Only then turn the rewrite into code.

## Example Use Cases

This package should work cleanly for:

- a product page such as `/products/ast`
- a high-intent landing page for a tenancy or eviction query
- a shared residential letting page
- an eviction or money-claim intent page
- a blog/guide page
- a utility page such as pricing or help

If the result sounds too glossy, too legal, too templated, or too keyword-aware, rewrite again.
