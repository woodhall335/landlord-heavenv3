# UK Notice Compliance Audit – Section 8 (England), Section 21 (England), Section 173 (Wales), Notice to Leave (Scotland)

## England – Section 8 (Housing Act 1988)

### ✔ Compliant elements
- Correct identification of Section 8 statutory basis and reference to Housing Act 1988/1996 in template header and grounds listing.【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L1-L39】
- Wizard collects core tenancy/rent particulars and requires selection of Section 8 grounds with particulars, aligning with statutory requirement to specify grounds and facts.【F:config/mqs/notice_only/england.yaml†L72-L138】【F:config/mqs/notice_only/england.yaml†L270-L330】

### ⚠ Partial or risky elements
- Template lacks prescribed Form 3 layout/wording (no official headings, notes to tenant, or statutory instruction blocks). Risk that court treats notice as non‑prescribed and defective.【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L1-L39】
- Notice period is now calculated and enforced via inline checks, but template still lacks prescribed statutory guidance text and may mislead on service/expiry presentation.【F:src/lib/notices/evaluate-notice-compliance.ts†L62-L124】【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L40-L118】
- Service and expiry dates are now mandatory in the wizard, but template still does not clearly state them in prescribed format; risk remains that PDF output omits required service information.【F:config/mqs/notice_only/england.yaml†L336-L370】
- Wizard permits Section 8 route without validating mandatory preconditions (HMO licensing, deposit protection, gas safety). These are collected for Section 21 but not enforced to block Section 8, risking unmanaged defences and CPR 55 duty issues.【F:config/mqs/notice_only/england.yaml†L200-L268】

### ✖ Non-compliant or missing elements
- No prescribed Form 3 notes to tenant or mandatory information about advisory services; omission likely renders notice invalid (high risk).【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L1-L39】
- No instruction that possession proceedings cannot begin until after notice period; absence may mislead and risks premature claims.【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L40-L118】
- Arrears grounds (8/10/11) lack explicit statement that sums remain due at hearing date; may weaken mandatory ground 8 and discretionary grounds particulars.【F:config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs†L80-L122】

### Legal risk rating
**HIGH** – Missing prescribed Form 3 wording and notice period controls likely to invalidate notice.

### Likely consequence if challenged
Notice struck out; costs wasted; need to re‑serve compliant Form 3 and re‑start notice period.

### Remediation steps
- Replace template with prescribed Form 3 wording and mandatory notes; include explicit service date and expiry date fields with automated statutory period calculation per ground.
- Enforce preconditions and CPR 55 pre‑action duties (arrears protocol) with hard blocks or clear warnings for Section 8.
- Add guidance that proceedings cannot start before expiry and that arrears must persist at hearing for ground 8.

---

## England – Section 21 (Form 6A)

### ✔ Compliant elements
- Template cites Form 6A and statutory bases for s21(1)/(4) with Local Government and Housing Act 1989 and Housing Act 1996 amendments.【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L1-L24】
- Notes highlight two‑month minimum period and bar on service in first four months; includes deposit protection information block and scheme contact details.【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L92-L170】【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L171-L222】
- Wizard captures key compliance items: deposit protection, prescribed information, EPC, gas safety, How to Rent, licensing, retaliatory complaints.【F:config/mqs/notice_only/england.yaml†L200-L268】

### ⚠ Partial or risky elements
- Template deviates from prescribed Form 6A layout (additional headings, altered language, optional periodic alignment logic), risking non‑prescribed form argument (medium–high).【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L1-L120】
- Notice period and four-month bar now enforced with inline compliance checks; template still may not mirror the prescribed Form 6A notes in full, so residual wording risk remains.【F:src/lib/notices/evaluate-notice-compliance.ts†L126-L186】【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L1-L94】
- Service method and service/expiry dates are now captured and required in wizard but the template still relies on user-entered dates without guaranteed prescribed presentation.【F:config/mqs/notice_only/england.yaml†L336-L370】【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L92-L170】
- Retaliatory eviction bar, licensing bar, gas/EPC/How to Rent compliance are collected and enforced with hard blocks/warnings, but template still lacks explicit confirmation of compliant documents served; evidential risk remains.【F:src/lib/notices/evaluate-notice-compliance.ts†L126-L186】【F:config/mqs/notice_only/england.yaml†L200-L268】

### ✖ Non-compliant or missing elements
- Lacks mandatory Form 6A footer wording and notes to tenant prescribed by 2015 Regulations; significant deviation likely invalid.【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L1-L222】
- No explicit confirmation that possession date cannot be earlier than end of fixed term; relies on user accuracy without validation.【F:config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs†L59-L107】

### Legal risk rating
**HIGH** – Material deviations from Form 6A and absence of enforced preconditions risk invalid notice and strike‑out.

### Likely consequence if challenged
Notice invalid; claim dismissed; landlord liable for costs and must re‑serve compliant Form 6A after curing preconditions.

### Remediation steps
- Use exact prescribed Form 6A wording and layout; include mandatory tenant guidance text and notes.
- Hard‑block generation if deposit, prescribed info, gas safety, EPC, How to Rent, licensing or retaliatory complaint rules fail.
- Auto‑calculate earliest permissible possession date and validate against tenancy start/term and statutory minima.

---

## Wales – Section 173 (Renting Homes (Wales) Act 2016)

### ✔ Compliant elements
- Template cites Section 173 Renting Homes (Wales) Act 2016 and includes prohibited period warning (first six months).【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L1-L78】【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L118-L138】
- Deposit protection and Rent Smart Wales registration addressed with warnings in notice content.【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L88-L118】

### ⚠ Partial or risky elements
- Template may not reflect latest Renting Homes (Wales) Act bilingual requirements; system now hard-blocks until bilingual selection made, avoiding wrongful single-language issuance but still lacking bilingual template output.【F:src/lib/notices/evaluate-notice-compliance.ts†L186-L232】【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L1-L60】
- Notice period logic lacks a statutory calculator; the system now fails safe with hard blocks when start/service/expiry data are missing or prohibited periods apply, preventing generation of invalid dates but still requiring calculator implementation.【F:src/lib/notices/evaluate-notice-compliance.ts†L186-L232】
- Template omits statutory explanatory notes required by Renting Homes (Wales) Act regulations (e.g., RHW20 equivalent). Medium–high risk of invalidity.【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L1-L138】

### ✖ Non-compliant or missing elements
- No mandatory prescribed form (RHW20) wording or bilingual (English/Welsh) requirement; single‑language template likely non‑compliant.【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L1-L138】
- Service guidance absent (methods, deemed service, minimum days), risking improper service.【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L68-L96】

### Legal risk rating
**HIGH** – Absence of prescribed form and automated notice‑period controls likely to invalidate notice.

### Likely consequence if challenged
Notice set aside; landlord must re‑serve prescribed RHW20 notice with correct bilingual text and statutory notice period.

### Remediation steps
- Replace template with bilingual RHW20 prescribed form and mandatory notes; include service instructions.
- Auto‑calculate expiry date to ensure six‑month minimum (and updated statutory periods) and enforce Rent Smart Wales registration/licence as hard bar.

---

## Scotland – Notice to Leave (Private Residential Tenancy)

### ✔ Compliant elements
- Template cites Private Housing (Tenancies) (Scotland) Act 2016 and lists grounds with particulars and evidence sections, including pre‑action requirements for rent arrears (Ground 1).【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L1-L88】【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L89-L140】
- Captures landlord registration number and contact details fields, supporting statutory landlord registration duty.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L13-L32】

### ⚠ Partial or risky elements
- Notice period calculation (28/84 days) now enforced via calculator and inline compliance; mixed grounds are fail-safe blocked pending legal confirmation of notice-period logic.【F:src/lib/notices/evaluate-notice-compliance.ts†L234-L283】
- Template lacks prescribed “Notice to Leave” Form wording under 2017 Regs (no Part 2/3 guidance for tenants, tribunal info). Medium–high risk of formal invalidity.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L1-L88】
- Service instructions and method of delivery are absent; risk of disputing date of receipt which governs earliest leaving date.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L35-L56】

### ✖ Non-compliant or missing elements
- No mandatory statutory guidance notes or Part 3 certificate required by 2017 Regulations; likely invalid notice form.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L1-L88】
- No statement that tribunal application cannot be made until after notice period and proof of service; may lead to premature claim.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L35-L56】

### Legal risk rating
**HIGH** – Missing prescribed form content and notice-period automation likely to invalidate notice or delay tribunal claim.

### Likely consequence if challenged
Tribunal may reject application; landlord must re‑serve compliant Notice to Leave with correct minimum period and evidence of service, causing delay and potential rent loss.

### Remediation steps
- Implement prescribed Notice to Leave form (Parts 1–3) with tribunal guidance and certificate of delivery; add service method selection and deemed‑service calculation.
- Auto‑calculate earliest leaving date based on ground and occupation length; block generation if period insufficient.

---

## Cross-jurisdiction comparison table

| Aspect | England s8 | England s21 | Wales s173 | Scotland NTL |
| --- | --- | --- | --- | --- |
| Prescribed form used | ✖ Form 3 missing | ⚠ Deviates from Form 6A | ✖ RHW20 missing/bilingual absent | ✖ 2017 Regs form missing |
| Statutory basis cited | ✔ | ✔ | ✔ | ✔ |
| Notice period automation | ✖ None | ⚠ User-set only | ✖ None | ✖ None |
| Preconditions/licensing enforced | ⚠ Limited (no hard bars) | ⚠ Soft validation | ⚠ Warning only | ⚠ Registration captured but not enforced |
| Service guidance | ✖ Absent | ⚠ Limited | ✖ Absent | ✖ Absent |
| Tenant guidance/notes | ✖ Absent | ⚠ Partial | ✖ Absent | ✖ Absent |

## Rules suitable for unification across products
- Mandatory capture and hard enforcement of deposit protection, prescribed information, gas/EPC (where applicable), licensing status, and retaliatory complaint checks before notice generation.
- Automated calculation/validation of statutory notice periods and earliest possession dates based on grounds/contract type.
- Service method selection with deemed-service date calculation to anchor expiry dates.
- Inclusion of advisory notes on right to seek advice, prohibition on premature proceedings, and requirement to evidence service.

## Rules that must remain jurisdiction-specific
- Prescribed form text and layout (Form 3, Form 6A, RHW20, Scottish Notice to Leave Parts 1–3) including bilingual requirements in Wales.
- Ground-specific notice periods and mandatory/discretionary ground distinctions (England s8, Scotland grounds sets).
- Jurisdictional preconditions: Retaliatory eviction bar (England s21), Rent Smart Wales registration/licensing, Scottish First-tier Tribunal procedures and 28/84‑day rules, English four‑month service bar for s21.
- References to local advisory bodies (Shelter Cymru, CAB Scotland) and tribunal/court venues.
