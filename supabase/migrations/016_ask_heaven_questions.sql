-- Ask Heaven Questions schema + pilot seed

CREATE TABLE IF NOT EXISTS public.ask_heaven_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  question text NOT NULL,
  summary text NOT NULL,
  answer_md text NOT NULL,
  primary_topic text NOT NULL,
  jurisdictions text[] NOT NULL,
  status text NOT NULL CHECK (status IN ('draft','review','approved')),
  canonical_slug text NULL,
  related_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz NULL
);

CREATE TRIGGER update_ask_heaven_questions_updated_at
BEFORE UPDATE ON public.ask_heaven_questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.ask_heaven_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ask Heaven questions are publicly readable"
  ON public.ask_heaven_questions
  FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.ask_heaven_add_utm(url text, slug text)
RETURNS text
LANGUAGE sql
AS $$
  SELECT url
    || CASE WHEN POSITION('?' IN url) > 0 THEN '&' ELSE '?' END
    || 'utm_source=ask_heaven&utm_medium=seo&utm_campaign=pilot&utm_content='
    || slug;
$$;

CREATE OR REPLACE FUNCTION public.ask_heaven_template_england_eviction(question text, slug text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  wizard_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction', slug);
  s21_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/free-section-21-notice-generator', slug);
  s8_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/free-section-8-notice-generator', slug);
  validator_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/validators', slug);
  pack_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/complete-pack', slug);
  tenancy_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/ast', slug);
BEGIN
  RETURN format($template$
## TL;DR
You asked: "%s". In England, possession usually starts with the right notice and clean compliance records. If you have a straightforward no‑fault route, a Section 21 notice (Form 6A) can be right, but only if the tenancy is an AST and you have complied with deposit protection, prescribed information, EPC, gas safety, and How to Rent requirements. If the tenant has breached the tenancy (rent arrears or other grounds), a Section 8 notice (Form 3) may be the correct route. Use the free tools to sense‑check before you serve anything: [Free Section 21 generator](%s), [Free Section 8 generator](%s), and the [Free eviction notice checker](%s). When you need a full court bundle for England, the [Complete eviction pack](%s) keeps everything consistent. If you want a guided flow, start with the [notice‑only wizard](%s). You can always [Ask a follow‑up in Ask Heaven](/ask-heaven).

## What the law generally says
Possession in England is a legal process. You cannot change locks, remove belongings, or pressure a tenant to leave without a court order. Notices must be valid and served correctly, and the court will dismiss or delay cases when compliance is missing or the notice period is wrong. A Section 21 claim is usually “accelerated” (N5B) if it is genuinely no‑fault and no rent arrears are claimed in the same action. A Section 8 claim is “standard” possession and requires you to prove the ground(s). Both routes require documentary evidence such as the tenancy agreement, deposit compliance certificate, prescribed information, gas safety records, and EPCs. Always keep a clear paper trail. For practical comparisons, see [Section 21 validity checklist (Form 6A)](/ask-heaven/section-21-validity-checklist-form-6a) and [Section 8 Ground 8 mandatory arrears](/ask-heaven/section-8-ground-8-mandatory-arrears).

## England‑specific notes (AST, Section 21, Section 8)
England uses assured shorthold tenancy (AST) terminology. Section 21 is served on Form 6A and is the usual no‑fault route when the tenancy is periodic or a fixed term has ended. Section 8 is served on Form 3 and relies on specific grounds. Common grounds include Ground 8 (mandatory rent arrears), Ground 10 (some arrears), Ground 11 (persistent late payment), and discretionary grounds like nuisance or damage. If your facts depend on evidence (rent schedule, tenancy clauses, complaint logs), prepare those early. If the tenant defends the claim, a hearing may be required even for Section 21. For court timing, see [accelerated possession timetable](/ask-heaven/accelerated-possession-timetable-england).

## What to do next (step‑by‑step)
1. Identify the correct route. Use Section 21 for no‑fault if your compliance is clean. Use Section 8 if a breach exists and you want to rely on grounds. If you are unsure, begin with the [notice‑only wizard](%s).
2. Review compliance documents: deposit protection, prescribed information, EPC, gas safety, and How to Rent. Fix gaps before serving a Section 21.
3. Build a clear rent schedule if you are claiming arrears. This helps with Ground 8 and later money claims.
4. Choose the right form: Form 6A for Section 21, Form 3 for Section 8. If you are at all unsure, generate a draft with the free tools.
5. Serve the notice correctly: follow the service clause in the AST, keep proof of posting or delivery, and record the date.
6. Diary the expiry date and prepare your court bundle early. If you need a straightforward Section 21 court route, prepare N5B.
7. If no possession is obtained after the notice, file the claim promptly to avoid timing issues.
8. At every stage, keep a clear paper trail and keep communication professional.

## Common mistakes
- Serving Section 21 without valid deposit protection or prescribed information.
- Using the wrong form or notice period.
- Mixing Section 21 and Section 8 evidence without clarity on the primary route.
- Failing to keep a rent schedule or proof of service.
- Relying on informal communications instead of formal notices.
- Missing gas safety or EPC service dates and then trying to back‑fill.
- Not checking that the tenancy is an AST and that the notice is signed and dated correctly.
- Ignoring the possibility of a tenant defense or a disrepair counterclaim.

## What happens if you get it wrong
Invalid notices waste time and money, and the court may dismiss your claim. You might have to re‑serve a notice and wait out a new notice period. A poor paper trail can also create risks if the tenant raises issues such as disrepair, deposit non‑compliance, or retaliatory eviction. In some cases, failing to follow the correct legal steps could expose you to claims of unlawful eviction or harassment. That is why it is worth sense‑checking the notice with the [Free eviction notice checker](%s) before you serve.

## Next steps + tools/templates
- Start with the guided [notice‑only wizard](%s) if you want the flow to ask you the right questions.
- Draft the correct notice: [Free Section 21 generator](%s) or [Free Section 8 generator](%s).
- Validate your draft notice with the [Free eviction notice checker](%s).
- If your case is England and you want a full bundle, the [Complete eviction pack](%s) includes court forms and checklists.
- Keep your tenancy paperwork tight with a compliant [tenancy agreement](%s).
- For related guidance, see [Section 21 validity checklist](/ask-heaven/section-21-validity-checklist-form-6a), [Section 8 notice periods](/ask-heaven/section-8-notice-periods-england-2025), and [accelerated possession costs](/ask-heaven/accelerated-possession-costs-fees).
- Ask follow‑ups in the hub: [Ask a follow‑up in Ask Heaven](/ask-heaven).

## Evidence checklist (England)
Before serving or issuing a claim, make sure you can produce the following if asked by a court:
- A signed AST or clear evidence of the tenancy terms.
- Deposit protection certificate and prescribed information service proof.
- Current EPC and proof it was given to the tenant.
- Gas safety certificates covering the tenancy period.
- How to Rent guide service evidence (if required).
- A rent schedule showing payments and arrears.
- Proof of notice service (postal receipt, witness statement, or signed acknowledgment).
- Any communications relevant to breaches or arrears.

## Disclaimer
This answer is general information for England and is not legal advice. It does not replace advice from a solicitor or qualified adviser. If you are unsure about your specific circumstances, seek legal advice before serving notices or starting court action.
$template$, question, s21_url, s8_url, validator_url, pack_url, wizard_url, wizard_url, validator_url, wizard_url, s21_url, s8_url, validator_url, pack_url, tenancy_url);
END;
$$;

CREATE OR REPLACE FUNCTION public.ask_heaven_template_england_arrears(question text, slug text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  arrears_calc_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/rent-arrears-calculator', slug);
  demand_letter_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/free-rent-demand-letter', slug);
  money_claim_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/money-claim', slug);
  s8_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/free-section-8-notice-generator', slug);
  wizard_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction', slug);
BEGIN
  RETURN format($template$
## TL;DR
You asked: "%s". For England rent arrears, start with clear numbers, then decide whether you need a repayment plan, a Section 8 notice, or a money claim. Use the [rent arrears calculator](%s) to build a precise schedule and send a [free rent demand letter](%s) to document the arrears. If the arrears meet Ground 8, a Section 8 notice (Form 3) can be appropriate; you can draft it with the [Free Section 8 generator](%s). If you need the court to order payment, the [Money claim product](%s) helps with MCOL‑ready documents. You can also start with the [notice‑only wizard](%s) to choose the right route. Ask follow‑ups in [Ask Heaven](/ask-heaven).

## What the law generally says
Arrears recovery is a mix of good documentation and the correct legal route. In England, rent arrears often link to Section 8 grounds (Ground 8 mandatory, Grounds 10 and 11 discretionary). If you are pursuing possession and arrears at the same time, you need evidence of the arrears at the notice date and at the hearing. If you are seeking money only, Money Claim Online (MCOL) is a standard route for many landlords. Courts will expect a clear rent schedule, tenancy agreement, and records of attempts to resolve the arrears. For a parallel possession route, see [Section 8 Ground 8 mandatory arrears](/ask-heaven/section-8-ground-8-mandatory-arrears).

## England‑specific notes (Section 8 and MCOL)
England uses Form 3 for Section 8 notices and Form 6A for Section 21. For arrears, Ground 8 is mandatory if the arrears threshold is met on the notice date and on the hearing date. Grounds 10 and 11 are discretionary, useful when arrears are lower or the tenant has a history of late payment. MCOL is used for money claims under a certain value. If you plan to claim interest, check the tenancy agreement and calculate it carefully. Good documentation prevents delays or defenses.

## What to do next (step‑by‑step)
1. Calculate the arrears precisely with the [rent arrears calculator](%s).
2. Send a written demand and keep proof of delivery (email plus letter is common). Use the [free rent demand letter](%s).
3. Decide whether you need a repayment plan or a notice. If you want possession, check whether Ground 8 applies.
4. Draft the notice correctly if you need possession: [Free Section 8 generator](%s).
5. Serve the notice using the service clause in the tenancy.
6. Prepare evidence: tenancy agreement, rent schedule, bank statements, and any communications.
7. If you are seeking payment only, prepare for MCOL or a court claim using the [Money claim product](%s).
8. If you need a guided flow, use the [notice‑only wizard](%s).

## Common mistakes
- Under‑ or over‑stating the arrears in the notice.
- Serving a Section 8 notice when Ground 8 is not met.
- Forgetting to keep proof of service or a rent schedule.
- Mixing a money claim and possession claim without clear documentation.
- Relying on informal texts rather than a written demand.
- Failing to update the arrears schedule between notice and hearing.

## What happens if you get it wrong
Errors in arrears calculations or notice periods can lead to adjournments or dismissal. You may have to re‑serve a notice, which adds weeks or months. A poor record of communications can also weaken your case if the tenant disputes the numbers. Use the free tools to reduce errors before you proceed.

## Next steps + tools/templates
- [Rent arrears calculator](%s) for accurate numbers.
- [Free rent demand letter](%s) to document the arrears.
- [Free Section 8 generator](%s) if you need a notice.
- [Money claim product](%s) for MCOL‑ready documents (England only).
- Review related guidance: [MCOL process for rent arrears](/ask-heaven/mcol-process-for-rent-arrears-england), [small claims evidence checklist](/ask-heaven/small-claims-for-rent-arrears-evidence), [rent arrears and Section 8 grounds](/ask-heaven/rent-arrears-and-section-8-grounds).
- Ask follow‑ups in [Ask Heaven](/ask-heaven).

## Evidence checklist for arrears cases
Gather and keep:
- The signed tenancy agreement and any rent variation documents.
- A month‑by‑month rent schedule with dates and amounts paid.
- Bank statements or payment confirmations.
- Copies of rent reminders, demand letters, and any repayment plan offers.
- Proof of service for notices if you issued Section 8.
- A summary page showing the arrears total on the notice date.
- Any guarantor deed and contact information if applicable.
- Communications that show attempts to resolve the arrears.

## Communication tips
Clear, polite communication can reduce disputes. Keep your tone factual, avoid threats, and outline the options: pay in full, agree a plan, or proceed with notice and claim. Confirm any agreements in writing and update the rent schedule immediately when payments arrive.

## Example arrears timeline
Week 1: run the arrears calculation and send a written reminder. Week 2: if no response, send a demand letter and invite a repayment plan. Week 3: assess whether Ground 8 is met and draft a Section 8 notice if possession is likely. Week 4+: if the tenant engages, confirm the plan in writing and monitor payments. If not, prepare evidence for a possession claim or MCOL. The key is to keep the rent schedule current and avoid gaps between the notice date and the court date.

## If you agree a repayment plan
Make the plan realistic and measurable. State the total arrears, weekly or monthly extra payments, and what happens if a payment is missed. Keep the agreement short and signed, and continue to update the rent schedule. If the plan fails, you will have a clear paper trail to support a court claim.

## Before court checklist
- Update the rent schedule to the day before you file.
- Confirm notice dates and expiry dates.
- Assemble evidence into a single PDF bundle.
- Check the tenant’s current address for service.
- Decide whether you want possession, a money judgment, or both.

Remember that courts expect clarity. A one‑page summary that lists the tenancy start date, rent amount, arrears total, and key notice dates often helps the judge follow your case.

## Disclaimer
This information is general guidance for England and is not legal advice. For tailored advice, consult a solicitor or qualified adviser.
$template$, question, arrears_calc_url, demand_letter_url, s8_url, money_claim_url, wizard_url, arrears_calc_url, demand_letter_url, s8_url, money_claim_url, wizard_url, arrears_calc_url, demand_letter_url, s8_url, money_claim_url);
END;
$$;

CREATE OR REPLACE FUNCTION public.ask_heaven_template_tenancy(question text, slug text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  tenancy_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/ast', slug);
  validator_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/validators', slug);
BEGIN
  RETURN format($template$
## TL;DR
You asked: "%s". Tenancy paperwork is the foundation for every later step, including arrears recovery and notice service. In the UK, the right document depends on jurisdiction: ASTs in England, occupation contracts in Wales, and Private Residential Tenancy (PRT) agreements in Scotland. Start with a compliant template and keep written records of any variations. For a ready‑made document, use the [tenancy agreement product](%s). If you later need to serve notice, you can sense‑check with the [Free eviction notice checker](%s). Ask follow‑ups in [Ask Heaven](/ask-heaven).

## What the law generally says
A tenancy agreement should set out the parties, rent, term, notice provisions, and repair responsibilities. Many landlord obligations (such as safety certificates or deposit protection rules) sit outside the contract but are closely linked to whether you can use certain notice routes later. The agreement also governs how you serve notices and what evidence you will need in court. Keeping a clean, current agreement helps avoid disputes.

## UK‑wide jurisdiction notes
- **England:** Assured Shorthold Tenancy (AST) is the standard for most private rentals.
- **Wales:** The Renting Homes (Wales) Act uses occupation contracts and requires a written statement of contract terms.
- **Scotland:** The Private Residential Tenancy (PRT) is the default private sector tenancy.
If you are unsure which applies, check the property location first and then match the document type.

## What to do next (step‑by‑step)
1. Confirm the property jurisdiction and choose the right agreement type.
2. Use a compliant template with current clauses, then tailor it for rent, term, and service.
3. Add clear clauses for rent due dates, permitted occupants, and repair responsibilities.
4. Keep a record of how the agreement was served and signed.
5. For renewals or periodic tenancies, document the new terms in writing.
6. Use a rent schedule template to track payments from day one.
7. Store compliance documents (EPC, gas safety, deposit details) alongside the agreement.

## Common mistakes
- Using an England AST for a property in Wales or Scotland.
- Missing required information in the contract or written statement.
- Not updating a template after legal changes.
- Forgetting to align the notice clause with the jurisdiction’s required notice route.
- Failing to keep signed copies and proof of service.

## What happens if you get it wrong
A weak or incorrect agreement can make enforcement slower and risk disputes. In some cases, using the wrong document can trigger delays in possession claims or confusion around notice periods. It can also weaken your ability to recover arrears or claim costs because the contractual basis is unclear.

## Next steps + tools/templates
- Build a compliant contract with the [tenancy agreement product](%s).
- For notice validation later, use the [Free eviction notice checker](%s).
- Related reading: [AST vs periodic tenancy](/ask-heaven/ast-vs-periodic-tenancy-england), [Wales occupation contract overview](/ask-heaven/wales-occupation-contract-vs-tenancy), and [Scotland PRT overview](/ask-heaven/scotland-prt-vs-short-assured).
- Ask follow‑ups in [Ask Heaven](/ask-heaven).

## Practical checklist
- Names, contact details, and signatures for all parties.
- Property address and any included fixtures or inventory notes.
- Rent amount, payment frequency, and method.
- Deposit amount and deposit protection scheme details.
- Term length and renewal or periodic clauses.
- Repair responsibilities and access rules.
- Utilities and council tax responsibility.
- Notice service clause and acceptable delivery methods.
- Rules on subletting, lodgers, and pets.
- Data handling and communication preferences.

## If the tenancy changes
If a tenant leaves, if rent changes, or if a new tenant is added, document the change in writing. For joint tenancies, a change of sharers agreement or a new contract may be required depending on jurisdiction. Keep signed copies of any updates alongside the original agreement.

## Renewal and periodic considerations
When a fixed term ends, you can renew the tenancy or allow it to roll into a periodic arrangement. Renewal provides clarity on term length and rent, while periodic tenancies offer flexibility. Always confirm which option applies in writing, update any clauses that have changed, and confirm the notice service method. A short addendum can be enough if only the term or rent changes.

## Compliance cross‑check
Even though these items are not always inside the agreement, they affect enforcement later:
- Deposit protection and prescribed information timing.
- EPC delivery and expiry dates.
- Gas safety certificate dates and service records.
- Right‑to‑rent checks for England.
- Inventories and check‑in reports for evidence of condition.

## Periodic tenancy risks
When a tenancy becomes periodic, notice periods and rent increase rules become especially important. Keep a record of when the fixed term ended, the date rent is due, and any communications about renewal. If you need possession later, the court will look at the tenancy start date and the periodic cycle.

## Documentation for disputes
If a dispute arises, you will need a clear paper trail. Keep copies of inventories, photos, check‑in and check‑out reports, maintenance logs, and any variation agreements. This documentation supports arrears claims, damage claims, and notice validity if disputes arise.

## Rent increase reminders
Use transparent rent review clauses and give tenants clear notice. Document the proposed increase in writing, explain the effective date, and keep a record of acceptance or negotiation. Consistent documentation reduces disputes and helps if a case later reaches a tribunal or court.

## Ending a tenancy
When a tenancy ends, confirm the notice in writing and document the condition of the property. A clear check‑out report and final rent schedule support any deposit deductions or arrears claims. If you later need to serve notice, ensure the agreement’s notice clause matches the jurisdiction’s legal process.

## Communication cadence
Set expectations at the start of the tenancy about how you will communicate: email, post, or portal messages. Keep a simple log of key communications such as repair requests, rent reminders, and agreed changes. This log can be invaluable if a dispute later arises and supports consistent decision‑making. It also helps if you need to explain your actions later.

## Disclaimer
This is general information and not legal advice. For specific guidance on your situation, consult a solicitor or qualified adviser.
$template$, question, tenancy_url, validator_url, tenancy_url, validator_url);
END;
$$;

CREATE OR REPLACE FUNCTION public.ask_heaven_template_wales(question text, slug text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  wizard_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction', slug);
  tenancy_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/ast', slug);
  arrears_calc_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/rent-arrears-calculator', slug);
BEGIN
  RETURN format($template$
## TL;DR
You asked: "%s". In Wales, occupation contracts are governed by the Renting Homes (Wales) Act. For no‑fault possession, landlords use a Section 173 notice, which has strict notice periods and compliance prerequisites. Always check the written statement, service method, and timing. Use the [notice‑only wizard](%s) to guide your next step, keep a compliant [tenancy agreement/occupation contract](%s), and use the [rent arrears calculator](%s) if money is the issue. Ask follow‑ups in [Ask Heaven](/ask-heaven).

## What the law generally says
The Renting Homes (Wales) Act reshapes how tenancy agreements work. The written statement of the contract terms is central, and courts expect landlords to follow the prescribed process before seeking possession. Notices must comply with statutory requirements and timelines. Incorrect service or missing contractual information can invalidate a notice and delay your claim.

## Wales‑specific section
Wales uses **occupation contracts** rather than ASTs. The Section 173 notice is the standard no‑fault route, but it is not automatic and cannot be used in all circumstances. You must ensure the written statement was provided, and you must follow the correct notice period. If you are relying on breaches (e.g., rent arrears), you may need other notices under Welsh law. For a validity checklist, see [Section 173 validity checklist](/ask-heaven/section-173-validity-checklist-wales).

## What to do next (step‑by‑step)
1. Confirm the contract type and review the written statement.
2. Verify you have met any compliance requirements (deposit rules, safety certificates, prescribed information).
3. Decide if you are using Section 173 or a breach‑based route.
4. Use the [notice‑only wizard](%s) to avoid timing or form errors.
5. Serve the notice using the service method in the contract and keep proof.
6. If the notice expires without possession, prepare your court claim and evidence bundle.

## Common mistakes
- Using England‑specific forms (Section 21/8) in Wales.
- Serving a Section 173 notice without a correct written statement.
- Miscalculating notice periods or service dates.
- Failing to keep proof of service or updated rent schedules.
- Ignoring required pre‑action steps for arrears disputes.

## What happens if you get it wrong
An invalid Section 173 notice can delay possession by weeks or months and may require you to restart the process. Missing documentation can also weaken your position if the tenant disputes the contract or the notice. That is why a careful paper trail matters.

## Next steps + tools/templates
- Start with the [notice‑only wizard](%s) for a guided Section 173 flow.
- Keep your paperwork consistent with the [tenancy agreement/occupation contract product](%s).
- Track arrears using the [rent arrears calculator](%s).
- Related reading: [Wales occupation contract overview](/ask-heaven/wales-occupation-contract-vs-tenancy), [Section 173 notice periods](/ask-heaven/wales-occupation-contract-notice-periods), and [Wales possession court process](/ask-heaven/wales-possession-court-process-section-173).
- Ask follow‑ups in [Ask Heaven](/ask-heaven).

## Documentation checklist (Wales)
- Written statement of the occupation contract and any variations.
- Deposit protection confirmation and prescribed information.
- Proof of service for the written statement and any notices.
- Rent schedule and payment records if arrears are involved.
- Safety certificates (EPC, gas safety where applicable).
- Communications relating to the issue or breach.

## Practical tips
Keep timelines clear and diarise notice expiry dates. Wales‑specific rules change notice lengths depending on the scenario, so double‑check the dates before you serve. If you are uncertain, use the wizard and keep a dated log of all service attempts.

## Example timeline (Section 173)
Week 1: confirm the contract type and that the written statement was served. Week 2: calculate the correct notice period, draft the notice, and serve it with proof of service. Week 3+: monitor the expiry date and prepare the evidence bundle. If the tenant does not leave after expiry, prepare for the court stage and maintain a clear chronology of communications.

## If rent arrears are involved
Use a consistent arrears schedule and document all communications. If the arrears are significant, a breach‑based route may be more appropriate than Section 173. Keep your written statement, rent schedule, and demand letters together so your case remains clear.

## Extra compliance reminders
Wales requires careful handling of the written statement and prescribed terms. Keep evidence of service for all key documents. If repairs or disrepair claims exist, resolve them promptly and document your actions, as disputes can delay possession.

## Keeping the case tidy
Create a simple file with the tenancy agreement, written statement, rent schedule, and proof of service. Courts respond well to concise bundles. A clean file can save time and reduce the risk of adjournment.

## Pre‑action reminders
If the issue is arrears, document attempts to resolve the debt before escalating. Clear communications and an updated rent schedule help avoid confusion. If the issue is no‑fault possession, ensure the written statement and notice are compliant before you serve.

## Notice period sanity checks
- Confirm the correct notice period for the contract type and tenancy length.
- Count from the date of service, not the date you drafted the notice.
- Keep proof of service for each notice.
- Avoid overlapping notices unless you are certain of the legal basis.

## Written statement checklist
Make sure the written statement includes the fundamental terms, any supplementary terms, rent amounts, and how notices are served. Keep evidence of when and how it was provided to the contract holder. If the written statement is missing or incomplete, courts may delay possession, so update it promptly when terms change.

## Service reminders
Use the service method specified in the occupation contract and keep proof of delivery. If you post documents, obtain certificates of posting and keep copies of the envelope details. If you email, keep the sent email and any delivery confirmation. A clear service record protects your position if the tenant disputes receipt. Store the evidence alongside the written statement for easy reference and audit checks.

## Disclaimer
This is general information for Wales and is not legal advice. If you are unsure about your specific circumstances, seek advice from a solicitor or qualified adviser.
$template$, question, wizard_url, tenancy_url, arrears_calc_url, wizard_url, wizard_url, tenancy_url, arrears_calc_url);
END;
$$;

CREATE OR REPLACE FUNCTION public.ask_heaven_template_scotland(question text, slug text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  wizard_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction', slug);
  tenancy_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/products/ast', slug);
  arrears_calc_url text := ask_heaven_add_utm('https://landlordheaven.co.uk/tools/rent-arrears-calculator', slug);
BEGIN
  RETURN format($template$
## TL;DR
You asked: "%s". In Scotland, most private tenancies are Private Residential Tenancies (PRTs). Possession starts with a Notice to Leave and then a Tribunal application, not an English court. Grounds are mandatory or discretionary and determine the notice period. Use the [notice‑only wizard](%s) for guidance, keep a compliant [tenancy agreement](%s), and use the [rent arrears calculator](%s) when money is the main issue. Ask follow‑ups in [Ask Heaven](/ask-heaven).

## What the law generally says
Scottish possession rules are different from England and Wales. You serve a Notice to Leave with the correct ground and notice period. If the tenant does not leave, you apply to the First‑tier Tribunal (Housing and Property Chamber). You cannot evict without a Tribunal order. Evidence matters: you need rent schedules, communications, and proof of service. Each ground has its own criteria, and the Tribunal can scrutinize whether you have acted reasonably.

## Scotland‑specific section (PRT + Notice to Leave)
The Private Residential Tenancy (PRT) is the default tenancy for most private lets. Notice to Leave periods depend on the ground and the length of tenancy. For rent arrears, you may need to show the arrears amount and duration. For other grounds (such as landlord intention to sell), you must demonstrate the factual basis. For more, see [Notice to Leave grounds](/ask-heaven/notice-to-leave-scotland-grounds) and [Scotland PRT notice periods](/ask-heaven/scotland-prt-notice-periods-2025).

## What to do next (step‑by‑step)
1. Confirm the tenancy is a PRT and identify the correct ground.
2. Calculate the correct notice period and draft a Notice to Leave.
3. Serve the notice properly and keep evidence of service.
4. Build an evidence bundle: tenancy agreement, rent schedule, emails, and any factual documentation.
5. If the tenant does not leave, apply to the Tribunal for a possession order.
6. Follow Tribunal instructions carefully and attend any case management discussion or hearing.

## Common mistakes
- Using English forms (Section 21/8) instead of a Notice to Leave.
- Misstating the ground or notice period.
- Lacking evidence for discretionary grounds.
- Forgetting to document arrears accurately.
- Skipping the Tribunal step or trying to evict without an order.

## What happens if you get it wrong
Incorrect notices or missing evidence can lead to a refused application or delays. The Tribunal may require you to re‑serve a notice and restart the timeline. In serious cases, unlawful eviction risks arise if you bypass the process.

## Next steps + tools/templates
- Use the [notice‑only wizard](%s) to ensure your Notice to Leave steps are correct.
- Keep your tenancy paperwork clean with the [tenancy agreement product](%s).
- If arrears are a factor, use the [rent arrears calculator](%s).
- Related reading: [Scotland tribunal process](/ask-heaven/scotland-eviction-court-process-tribunal), [Scotland rent arrears steps](/ask-heaven/scotland-rent-arrears-prt-steps), and [serving Notice to Leave](/ask-heaven/scotland-serving-notice-to-leave).
- Ask follow‑ups in [Ask Heaven](/ask-heaven).

## Evidence checklist (Scotland)
- Signed PRT agreement and any variations.
- Notice to Leave with the correct ground and notice period.
- Proof of service (recorded delivery, certificate of posting, or witness statement).
- Rent schedule and arrears evidence if relevant.
- Supporting documents for the ground (e.g., intention to sell, refurbishment plans).
- Notes of communications with the tenant.

## Practical tips
The Tribunal process can take time, so prepare your evidence early. Keep your chronology simple: date of issue, service date, expiry date, and the date you applied to the Tribunal. A clear timeline helps the Tribunal understand your steps and reduces the risk of adjournments.

## Example timeline (PRT)
Week 1: confirm the ground and calculate the notice period. Week 2: serve the Notice to Leave and record proof of service. Week 3+: if the tenant does not leave, prepare your Tribunal application and organize evidence. The Tribunal will expect a clear narrative, so keep a written timeline of events and any communications.

## Preparing for the Tribunal
Make sure your application includes the tenancy agreement, rent schedule (if relevant), and any evidence supporting the ground. If the ground is discretionary, prepare to explain why eviction is reasonable. If the ground is mandatory, ensure your evidence meets the statutory test. Clear documentation reduces delays.

## Evidence bundle tips
Create a single bundle that includes the Notice to Leave, proof of service, rent schedule, and any supporting evidence for the ground (for example, emails about arrears or documents showing the landlord’s intention to sell). Number the pages and provide a short index so the Tribunal can find key documents quickly.

## Communication and follow‑up
Keep communications professional and in writing. If the tenant proposes a repayment plan, record it and update the rent schedule. If they dispute the notice, keep their responses in the file so you can address them during the Tribunal process.

## Tribunal checklist
- Confirm the correct ground and notice period for the PRT.
- Include proof of service and the Notice to Leave.
- Provide a rent schedule if arrears are relied upon.
- Add supporting documents for the chosen ground.
- Prepare a short summary of events and dates.

## Arrears considerations
If arrears are the main issue, keep your rent schedule updated monthly and confirm any repayment proposals in writing. The Tribunal will look for a clear connection between the ground you rely on and the evidence you submit, so consistency matters.

## Grounds reminder
Scotland’s grounds include mandatory and discretionary categories. If you rely on a discretionary ground, be ready to explain why eviction is reasonable. For mandatory grounds, ensure the evidence meets the statutory requirements on dates and amounts. Matching the ground to the facts is essential.

## Service reminders
Always keep proof of service for the Notice to Leave. If you use recorded delivery, retain tracking evidence. If you hand‑deliver, create a signed witness statement. This simple step can prevent delays during the Tribunal stage and avoid disputes about service dates or notice periods.

## Disclaimer
This is general information for Scotland and is not legal advice. For specific guidance, consult a solicitor or qualified adviser.
$template$, question, wizard_url, tenancy_url, arrears_calc_url, wizard_url, tenancy_url, arrears_calc_url);
END;
$$;

WITH seed AS (
  SELECT * FROM (VALUES
    ('how-to-serve-section-21-notice-england', 'How do I serve a Section 21 notice correctly in England?', 'A practical overview of serving a valid Section 21 notice in England, with compliance checks and next steps.', 'eviction', ARRAY['england'], ARRAY['section-21-validity-checklist-form-6a', 'section-21-gas-safety-epc-how-to-fix', 'accelerated-possession-timetable-england'], 'england_eviction'),
    ('section-21-validity-checklist-form-6a', 'What is the Section 21 validity checklist for Form 6A?', 'A step-by-step checklist to ensure Form 6A Section 21 notices are valid in England.', 'eviction', ARRAY['england'], ARRAY['how-to-serve-section-21-notice-england', 'section-21-gas-safety-epc-how-to-fix', 'section-21-after-fixed-term-periodic'], 'england_eviction'),
    ('section-21-accelerated-possession-n5b-guide', 'How does the N5B accelerated possession process work after Section 21?', 'Guide to the N5B accelerated possession route after serving Section 21 in England.', 'court_process', ARRAY['england'], ARRAY['accelerated-possession-timetable-england', 'accelerated-possession-costs-fees', 'court-hearing-prepare-possession-england'], 'england_eviction'),
    ('when-to-use-section-8-form-3-grounds', 'When should I use a Section 8 notice (Form 3) and which grounds apply?', 'Overview of Section 8 Form 3 usage, with guidance on choosing the right grounds in England.', 'eviction', ARRAY['england'], ARRAY['section-8-ground-8-mandatory-arrears', 'section-8-ground-10-11-discretionary-arrears', 'section-8-notice-periods-england-2025'], 'england_eviction'),
    ('section-8-ground-8-mandatory-arrears', 'How do I rely on Ground 8 for rent arrears in England?', 'Ground 8 overview for rent arrears, with evidence and notice tips for England.', 'arrears', ARRAY['england'], ARRAY['rent-arrears-and-section-8-grounds', 'section-8-notice-periods-england-2025', 'rent-arrears-letter-before-action-england'], 'england_arrears'),
    ('section-8-ground-10-11-discretionary-arrears', 'How do Ground 10 and Ground 11 work for rent arrears?', 'Explains discretionary rent arrears grounds under Section 8 in England.', 'arrears', ARRAY['england'], ARRAY['section-8-ground-8-mandatory-arrears', 'rent-arrears-and-section-8-grounds', 'repayment-plan-template-landlord-tenant'], 'england_arrears'),
    ('section-8-notice-periods-england-2025', 'What notice periods apply to Section 8 in England?', 'A breakdown of Section 8 notice periods in England, updated for current rules.', 'eviction', ARRAY['england'], ARRAY['when-to-use-section-8-form-3-grounds', 'section-8-ground-8-mandatory-arrears', 'rent-arrears-and-section-8-grounds'], 'england_eviction'),
    ('section-21-after-fixed-term-periodic', 'Can I serve Section 21 after a fixed term ends and the tenancy becomes periodic?', 'Explains Section 21 use after a fixed term becomes periodic in England.', 'eviction', ARRAY['england'], ARRAY['how-to-serve-section-21-notice-england', 'section-21-reissue-after-expiry', 'section-21-validity-checklist-form-6a'], 'england_eviction'),
    ('accelerated-possession-timetable-england', 'What is the accelerated possession timetable for England?', 'Typical timelines for accelerated possession claims after Section 21 in England.', 'court_process', ARRAY['england'], ARRAY['section-21-accelerated-possession-n5b-guide', 'accelerated-possession-costs-fees', 'court-hearing-prepare-possession-england'], 'england_eviction'),
    ('defended-possession-claim-s8-s21', 'What happens if my possession claim is defended?', 'Guidance on defended possession claims under Section 8 or Section 21 in England.', 'court_process', ARRAY['england'], ARRAY['court-hearing-prepare-possession-england', 'possession-order-what-happens-next', 'accelerated-possession-timetable-england'], 'england_eviction'),
    ('court-hearing-prepare-possession-england', 'How do I prepare for a possession hearing in England?', 'Preparation checklist and evidence tips for England possession hearings.', 'court_process', ARRAY['england'], ARRAY['defended-possession-claim-s8-s21', 'possession-order-what-happens-next', 'accelerated-possession-costs-fees'], 'england_eviction'),
    ('possession-order-what-happens-next', 'What happens after I get a possession order in England?', 'Explains the steps after a possession order, including enforcement options.', 'court_process', ARRAY['england'], ARRAY['warrant-of-possession-bailiffs-eviction', 'court-hearing-prepare-possession-england', 'accelerated-possession-timetable-england'], 'england_eviction'),
    ('warrant-of-possession-bailiffs-eviction', 'How do I get bailiffs after a possession order?', 'Overview of warrants of possession and bailiff enforcement in England.', 'court_process', ARRAY['england'], ARRAY['possession-order-what-happens-next', 'accelerated-possession-costs-fees', 'court-hearing-prepare-possession-england'], 'england_eviction'),
    ('can-i-evict-without-court-england', 'Can I evict a tenant without a court order in England?', 'Explains why court orders are required and risks of unlawful eviction.', 'eviction', ARRAY['england'], ARRAY['how-to-serve-section-21-notice-england', 'when-to-use-section-8-form-3-grounds', 'defended-possession-claim-s8-s21'], 'england_eviction'),
    ('section-21-and-deposit-protection-rules', 'How does deposit protection affect Section 21 notices?', 'Explains deposit protection requirements and Section 21 implications in England.', 'eviction', ARRAY['england'], ARRAY['section-21-validity-checklist-form-6a', 'section-21-gas-safety-epc-how-to-fix', 'how-to-serve-section-21-notice-england'], 'england_eviction'),
    ('section-21-gas-safety-epc-how-to-fix', 'How do gas safety and EPC rules impact Section 21 in England?', 'Compliance checklist for gas safety and EPC before serving Section 21.', 'eviction', ARRAY['england'], ARRAY['section-21-validity-checklist-form-6a', 'section-21-and-deposit-protection-rules', 'how-to-serve-section-21-notice-england'], 'england_eviction'),
    ('section-8-grounds-nuisance-anti-social', 'Can I use Section 8 for nuisance or anti-social behaviour?', 'Guidance on discretionary Section 8 grounds for nuisance in England.', 'eviction', ARRAY['england'], ARRAY['when-to-use-section-8-form-3-grounds', 'defended-possession-claim-s8-s21', 'court-hearing-prepare-possession-england'], 'england_eviction'),
    ('notice-seeking-possession-vs-eviction', 'What is the difference between a notice seeking possession and eviction?', 'Clarifies notice vs eviction steps and timing in England.', 'eviction', ARRAY['england'], ARRAY['how-to-serve-section-21-notice-england', 'when-to-use-section-8-form-3-grounds', 'defended-possession-claim-s8-s21'], 'england_eviction'),
    ('accelerated-possession-costs-fees', 'How much does accelerated possession cost in England?', 'Cost overview for accelerated possession and court fees in England.', 'court_process', ARRAY['england'], ARRAY['accelerated-possession-timetable-england', 'section-21-accelerated-possession-n5b-guide', 'possession-order-what-happens-next'], 'england_eviction'),
    ('section-21-reissue-after-expiry', 'Can I reissue a Section 21 notice after it expires?', 'Explains when and how to reissue Section 21 notices in England.', 'eviction', ARRAY['england'], ARRAY['section-21-validity-checklist-form-6a', 'section-21-after-fixed-term-periodic', 'how-to-serve-section-21-notice-england'], 'england_eviction'),

    ('rent-arrears-letter-before-action-england', 'Should I send a rent arrears letter before action?', 'How to use a rent arrears letter before action in England to document arrears.', 'arrears', ARRAY['england'], ARRAY['rent-arrears-and-section-8-grounds', 'calculate-rent-arrears-and-interest', 'mcol-process-for-rent-arrears-england'], 'england_arrears'),
    ('calculate-rent-arrears-and-interest', 'How do I calculate rent arrears and interest?', 'Guidance on calculating rent arrears totals and interest for England claims.', 'arrears', ARRAY['england'], ARRAY['rent-arrears-letter-before-action-england', 'mcol-process-for-rent-arrears-england', 'small-claims-for-rent-arrears-evidence'], 'england_arrears'),
    ('repayment-plan-template-landlord-tenant', 'How should I structure a rent arrears repayment plan?', 'Best-practice repayment plan guidance for landlords and tenants in England.', 'arrears', ARRAY['england'], ARRAY['rent-arrears-letter-before-action-england', 'guarantor-liability-for-rent-arrears', 'rent-arrears-and-section-8-grounds'], 'england_arrears'),
    ('when-to-issue-money-claim-online-rent', 'When should I issue a money claim online for rent arrears?', 'Criteria for when to use MCOL for rent arrears in England.', 'arrears', ARRAY['england'], ARRAY['mcol-process-for-rent-arrears-england', 'small-claims-for-rent-arrears-evidence', 'money-claim-after-tenant-moves-out'], 'england_arrears'),
    ('mcol-process-for-rent-arrears-england', 'How does the MCOL process work for rent arrears?', 'Step-by-step explanation of the MCOL process in England for arrears.', 'arrears', ARRAY['england'], ARRAY['when-to-issue-money-claim-online-rent', 'small-claims-for-rent-arrears-evidence', 'money-claim-after-tenant-moves-out'], 'england_arrears'),
    ('small-claims-for-rent-arrears-evidence', 'What evidence do I need for a small claims rent arrears case?', 'Evidence checklist for rent arrears cases in the small claims track.', 'arrears', ARRAY['england'], ARRAY['calculate-rent-arrears-and-interest', 'mcol-process-for-rent-arrears-england', 'money-claim-after-tenant-moves-out'], 'england_arrears'),
    ('money-claim-after-tenant-moves-out', 'Can I claim rent arrears after the tenant moves out?', 'Explains how to pursue rent arrears after move-out in England.', 'arrears', ARRAY['england'], ARRAY['mcol-process-for-rent-arrears-england', 'small-claims-for-rent-arrears-evidence', 'claim-rent-arrears-from-deposit'], 'england_arrears'),
    ('guarantor-liability-for-rent-arrears', 'Is a guarantor liable for rent arrears?', 'Explains guarantor liability for rent arrears and enforcement steps in England.', 'arrears', ARRAY['england'], ARRAY['repayment-plan-template-landlord-tenant', 'rent-arrears-letter-before-action-england', 'mcol-process-for-rent-arrears-england'], 'england_arrears'),
    ('claim-rent-arrears-from-deposit', 'Can I claim rent arrears from the deposit?', 'Guidance on using deposit funds for rent arrears in England.', 'arrears', ARRAY['england'], ARRAY['calculate-rent-arrears-and-interest', 'rent-arrears-letter-before-action-england', 'money-claim-after-tenant-moves-out'], 'england_arrears'),
    ('rent-arrears-and-section-8-grounds', 'How do rent arrears affect Section 8 grounds?', 'Explains how arrears levels connect to Section 8 grounds in England.', 'arrears', ARRAY['england'], ARRAY['section-8-ground-8-mandatory-arrears', 'section-8-ground-10-11-discretionary-arrears', 'section-8-notice-periods-england-2025'], 'england_arrears'),

    ('ast-vs-periodic-tenancy-england', 'What is the difference between an AST and a periodic tenancy?', 'Explains how ASTs become periodic and what that means for landlords.', 'tenancy', ARRAY['uk-wide'], ARRAY['renewing-fixed-term-tenancy-england', 'tenancy-agreement-checklist-uk-landlord', 'wales-occupation-contract-vs-tenancy'], 'tenancy'),
    ('renewing-fixed-term-tenancy-england', 'Should I renew a fixed-term tenancy or let it roll into periodic?', 'Pros, cons, and documentation tips for renewing fixed-term tenancies.', 'tenancy', ARRAY['uk-wide'], ARRAY['ast-vs-periodic-tenancy-england', 'tenancy-agreement-checklist-uk-landlord', 'rent-increase-clause-best-practice-uk'], 'tenancy'),
    ('wales-occupation-contract-vs-tenancy', 'What is the difference between a Wales occupation contract and a tenancy?', 'Summary of occupation contracts in Wales vs English tenancies.', 'tenancy', ARRAY['uk-wide'], ARRAY['wales-occupation-contract-notice-periods', 'section-173-notice-wales-when-to-use', 'tenancy-agreement-checklist-uk-landlord'], 'tenancy'),
    ('scotland-prt-vs-short-assured', 'What is the difference between a PRT and a short assured tenancy in Scotland?', 'Explains Scotland’s PRT system compared to older short assured tenancies.', 'tenancy', ARRAY['uk-wide'], ARRAY['scotland-prt-notice-periods-2025', 'notice-to-leave-scotland-grounds', 'tenancy-agreement-checklist-uk-landlord'], 'tenancy'),
    ('joint-tenancy-ending-one-tenant-leaves', 'What happens if one tenant wants to leave a joint tenancy?', 'Guidance on joint tenancy changes, replacements, and documentation.', 'tenancy', ARRAY['uk-wide'], ARRAY['adding-tenant-to-existing-agreement', 'renewing-fixed-term-tenancy-england', 'tenancy-agreement-checklist-uk-landlord'], 'tenancy'),
    ('adding-tenant-to-existing-agreement', 'How do I add a tenant to an existing agreement?', 'Steps for adding tenants and updating tenancy paperwork correctly.', 'tenancy', ARRAY['uk-wide'], ARRAY['joint-tenancy-ending-one-tenant-leaves', 'tenancy-agreement-checklist-uk-landlord', 'rent-increase-clause-best-practice-uk'], 'tenancy'),
    ('rent-increase-clause-best-practice-uk', 'What is best practice for rent increase clauses in the UK?', 'Explains rent increase clauses and documentation across UK jurisdictions.', 'tenancy', ARRAY['uk-wide'], ARRAY['tenancy-agreement-checklist-uk-landlord', 'ast-vs-periodic-tenancy-england', 'renewing-fixed-term-tenancy-england'], 'tenancy'),
    ('tenancy-agreement-checklist-uk-landlord', 'What should be in a UK landlord tenancy agreement checklist?', 'Checklist of essential terms and compliance items for UK tenancy agreements.', 'tenancy', ARRAY['uk-wide'], ARRAY['ast-vs-periodic-tenancy-england', 'wales-occupation-contract-vs-tenancy', 'scotland-prt-vs-short-assured'], 'tenancy'),

    ('section-173-notice-wales-when-to-use', 'When should I use a Section 173 notice in Wales?', 'Explains when and how to use a Section 173 notice in Wales.', 'eviction', ARRAY['wales'], ARRAY['section-173-validity-checklist-wales', 'wales-occupation-contract-notice-periods', 'wales-possession-court-process-section-173'], 'wales'),
    ('wales-occupation-contract-notice-periods', 'What notice periods apply to Wales occupation contracts?', 'Notice period guidance for Wales occupation contracts and Section 173.', 'eviction', ARRAY['wales'], ARRAY['section-173-notice-wales-when-to-use', 'section-173-validity-checklist-wales', 'wales-possession-court-process-section-173'], 'wales'),
    ('wales-retaliatory-eviction-protection', 'What are the retaliatory eviction protections in Wales?', 'Explains tenant protections and landlord obligations under Welsh law.', 'eviction', ARRAY['wales'], ARRAY['section-173-notice-wales-when-to-use', 'wales-occupation-contract-written-statement', 'wales-possession-court-process-section-173'], 'wales'),
    ('wales-occupation-contract-written-statement', 'What is the written statement requirement for Wales occupation contracts?', 'Explains the written statement requirement under Renting Homes (Wales).', 'tenancy', ARRAY['wales'], ARRAY['wales-occupation-contract-vs-tenancy', 'section-173-notice-wales-when-to-use', 'section-173-validity-checklist-wales'], 'wales'),
    ('section-173-validity-checklist-wales', 'What is the Section 173 validity checklist in Wales?', 'Checklist of Section 173 requirements for Wales possession notices.', 'eviction', ARRAY['wales'], ARRAY['section-173-notice-wales-when-to-use', 'wales-occupation-contract-notice-periods', 'wales-possession-court-process-section-173'], 'wales'),
    ('wales-possession-court-process-section-173', 'What happens after a Section 173 notice in Wales?', 'Explains the court process for Section 173 possession claims in Wales.', 'court_process', ARRAY['wales'], ARRAY['section-173-notice-wales-when-to-use', 'section-173-validity-checklist-wales', 'wales-occupation-contract-notice-periods'], 'wales'),

    ('notice-to-leave-scotland-grounds', 'What grounds can I use for a Notice to Leave in Scotland?', 'Overview of Notice to Leave grounds for Scotland PRTs.', 'eviction', ARRAY['scotland'], ARRAY['scotland-prt-notice-periods-2025', 'scotland-serving-notice-to-leave', 'scotland-eviction-court-process-tribunal'], 'scotland'),
    ('scotland-prt-notice-periods-2025', 'What notice periods apply to Scotland PRTs?', 'Notice period guidance for Scotland PRT Notice to Leave steps.', 'eviction', ARRAY['scotland'], ARRAY['notice-to-leave-scotland-grounds', 'scotland-serving-notice-to-leave', 'scotland-eviction-court-process-tribunal'], 'scotland'),
    ('scotland-eviction-court-process-tribunal', 'How does the eviction tribunal process work in Scotland?', 'Explains the Tribunal process for Scotland PRT possession claims.', 'court_process', ARRAY['scotland'], ARRAY['scotland-serving-notice-to-leave', 'notice-to-leave-scotland-grounds', 'scotland-prt-notice-periods-2025'], 'scotland'),
    ('scotland-rent-arrears-prt-steps', 'What steps should I take for rent arrears in Scotland?', 'Rent arrears recovery steps for Scotland PRTs.', 'arrears', ARRAY['scotland'], ARRAY['notice-to-leave-scotland-grounds', 'scotland-prt-notice-periods-2025', 'scotland-eviction-court-process-tribunal'], 'scotland'),
    ('scotland-serving-notice-to-leave', 'How do I serve a Notice to Leave in Scotland?', 'Service guidance for Scotland Notice to Leave documents.', 'eviction', ARRAY['scotland'], ARRAY['notice-to-leave-scotland-grounds', 'scotland-prt-notice-periods-2025', 'scotland-eviction-court-process-tribunal'], 'scotland'),
    ('scotland-tenant-abandonment-prt', 'What should I do if a tenant abandons a PRT in Scotland?', 'Guidance on handling possible abandonment in Scotland PRTs.', 'tenancy', ARRAY['scotland'], ARRAY['scotland-serving-notice-to-leave', 'scotland-prt-notice-periods-2025', 'notice-to-leave-scotland-grounds'], 'scotland')
  ) AS v(slug, question, summary, primary_topic, jurisdictions, related_slugs, template_key)
)
INSERT INTO public.ask_heaven_questions (
  slug,
  question,
  summary,
  answer_md,
  primary_topic,
  jurisdictions,
  status,
  canonical_slug,
  related_slugs
)
SELECT
  slug,
  question,
  summary,
  CASE template_key
    WHEN 'england_eviction' THEN ask_heaven_template_england_eviction(question, slug)
    WHEN 'england_arrears' THEN ask_heaven_template_england_arrears(question, slug)
    WHEN 'tenancy' THEN ask_heaven_template_tenancy(question, slug)
    WHEN 'wales' THEN ask_heaven_template_wales(question, slug)
    WHEN 'scotland' THEN ask_heaven_template_scotland(question, slug)
  END,
  primary_topic,
  jurisdictions,
  'review',
  NULL,
  related_slugs
FROM seed;
