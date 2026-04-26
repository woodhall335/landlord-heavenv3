# England Eviction Packs Compliance Matrix

Last updated: 2026-04-26

Purpose: internal source-of-truth for how the live England `notice_only` and `complete_pack` flows map wizard answers into generated documents.

Scope:
- `notice_only`
- `complete_pack`
- Form 3A
- Form N215
- Form N5
- Form N119
- England eviction support documents shipped in the canonical packs

This matrix is intended to replace ad-hoc code inspection when checking:
- whether the wizard is asking for the right facts
- whether those facts reach the generated documents
- which fields are auto-filled
- which fields remain conditional or manual by design
- where wider compliance facts are recorded for landlord risk and court-readiness

## 1. Wizard Fact Collection Summary

### Common core facts collected in both England eviction flows

| Area | Main wizard facts | Used by |
|------|-------------------|---------|
| Parties | `landlord_full_name`, `tenant_full_name`, extra tenant names, landlord contact/service contact details | Form 3A, N215, N5, N119, witness statement, case summary |
| Property | `property_address_line1`, `property_address_town`, `property_address_postcode`, related address fields | Form 3A, N5, N119, witness statement, bundle index |
| Tenancy | `tenancy_start_date`, `rent_amount`, `rent_frequency`, `rent_due_day` | Form 3A, N119, arrears schedule, witness statement, case summary |
| Grounds | `section8_grounds`, `section8_details`, ground-specific detail fields, `ground_prerequisite_notice_served` | Form 3A, N119, evidence checklist, witness statement, case summary |
| Service basics | `notice_date`, `notice_served_date`, `notice_service_method`, `notice_expiry_date` | Form 3A, N215, N119, witness statement, hearing checklist |
| N215 collectible facts | `notice_service_time`, `notice_service_recipient_capacity`, `notice_service_location`, `notice_service_location_other`, `notice_service_recipient_email`, `other_electronic_identification`, `signatory_position` | Form N215 |
| Compliance record | `deposit_taken`, `deposit_protected`, `deposit_protected_within_30_days`, `prescribed_info_served`, `deposit_returned`, `section_16e_duties_checked`, `breathing_space_checked`, `tenant_in_breathing_space`, `epc_served`, `how_to_rent_served`, `has_gas_appliances`, `gas_safety_cert_served` | Compliance declaration, evidence checklist, witness statement, case summary, smart warnings |
| Arrears | `arrears_items`, `total_arrears`, `arrears_at_notice_date`, payment history facts | Arrears schedule, Form 3A particulars, N119, witness statement, chronology, case summary |

### Complete Pack additional court-file facts

| Area | Main wizard facts | Used by |
|------|-------------------|---------|
| Court route facts | `court_name`, `court_address`, `claim_number` when known | N5, N119, N215, case summary |
| Chronology and contact | `communication_timeline.total_attempts`, `communication_timeline.tenant_responsiveness`, `communication_timeline.log`, generated arrears chronology | Witness statement, case summary, evidence checklist |
| Court-file readiness | `evidence_bundle_ready`, landlord-held record confirmations, claim-choice facts | Evidence checklist, hearing checklist, bundle index, witness statement |

## 2. Product-Level Output Matrix

### Notice Only canonical pack

| Document | Status | Main wizard inputs | Auto / conditional / manual notes | Compliance / legal role |
|----------|--------|--------------------|-----------------------------------|-------------------------|
| Form 3A notice | Generated | Parties, property, grounds, notice date, expiry date, signatory, ground particulars | High auto-fill. Editable overlay because official PDF has no native fields. | Core statutory Section 8 notice under the current England route. |
| Service Instructions | Generated | Notice service method, selected grounds, service timeline | Mostly drafted from wizard facts plus route logic. | Tells landlord how to serve the notice correctly. |
| Validity Checklist | Generated | Grounds, notice dates, service method, core compliance record | Generated guidance/checklist, not a court form. | Helps prevent obvious notice defects before service. |
| Compliance Declaration | Generated | Deposit, section 16E, breathing space, EPC, How to Rent, gas safety | Generated summary of wider compliance position. | Records non-Form-3A compliance/risk facts behind the notice file. |
| Certificate of Service (Form N215) | Generated | Service date, service method, service time, recipient capacity, service location, recipient email where relevant, signer details | Partly auto-filled, partly conditional, still editable. | Official proof of service record. |
| Arrears Schedule (conditional) | Generated when arrears-led or forced in pack logic | `arrears_items`, totals, notice-date arrears | High auto-fill from arrears schedule engine. | Supports Grounds 8, 10, 11 and later court escalation. |

### Complete Eviction Pack canonical pack

| Document | Status | Main wizard inputs | Auto / conditional / manual notes | Compliance / legal role |
|----------|--------|--------------------|-----------------------------------|-------------------------|
| Form 3A notice | Generated | Same inputs as Notice Only | Same as Notice Only. | Served notice sits at the front of the court file. |
| Form N5 - Claim for Possession | Generated | Parties, property, service/contact address, claim number if known, court fee, signatory, solicitor details when present | Core fields auto-filled; specialist court metadata remains conditional/manual. | Official possession claim form. |
| Form N119 - Particulars of Claim | Generated | Tenancy, rent, arrears, grounds, notice service date, particulars, claimant/defendant details, signatory | Strong core auto-fill; specialist social-housing/demotion branches remain conditional/manual. | Official particulars of claim. |
| Rent Arrears Schedule | Generated | `arrears_items`, totals, notice-date arrears | High auto-fill from canonical arrears data. | Detailed arrears exhibit for the court file. |
| Evidence Collection Checklist | Generated | Grounds, compliance record, chronology, landlord-held-record confirmations | Drafted support document, not official form. | Tells landlord which external records still need to be printed/brought. |
| Certificate of Service (Form N215) | Generated | Same N215 inputs as Notice Only | Same status as Notice Only; editable and partly conditional. | Official proof of service record. |
| Witness Statement | Generated | Grounds, chronology, arrears timeline, notice service facts, compliance record | Narrative auto-drafted from structured facts. | Explains the possession case in statement form. |
| Court Bundle Index | Generated | Canonical pack contents and evidence grouping | Mostly generated from pack structure. | Gives the court-ready file an ordered contents page. |
| Hearing Checklist | Generated | Notice, claim stage, compliance, evidence readiness | Drafted checklist, not official form. | Practical filing/hearing support. |
| Arrears Engagement Letter | Generated | Arrears/contact history, landlord details | Drafted from arrears/contact facts. | Landlord-facing engagement and contact record. |
| Case Summary | Generated | Grounds, arrears, chronology, notice route, claim route | Narrative summary drafted from the same facts used elsewhere. | Concise claim overview. |

## 3. Official Form Matrix

### Form 3A (England Section 8 notice)

Status:
- Official HMCTS PDF has no native AcroForm fields.
- The system creates an editable overlay and fills that overlay.

Current overlay coverage:
- 43 overlay targets
- Main categories:
  - tenant names
  - property address
  - earliest court date
  - reason checkboxes
  - grounds text
  - explanation text
  - signatory block
  - signatory contact block
  - joint signatory / extra-sheet support

Main wizard-to-output mapping:

| Form 3A area | Source wizard facts | Status |
|--------------|---------------------|--------|
| Tenant names | `tenant_full_name`, `tenant_2_name`, `tenant_3_name`, `tenant_4_name` | Auto |
| Property address | `property_address_line1`, `property_address_line2`, `property_address_town`, property county/postcode when available | Auto |
| Earliest court date | `notice_date` / `notice_served_date` + current England notice-period logic | Auto / computed |
| Reason checkboxes | `section8_grounds` normalized through the post-2026 England catalog | Auto |
| Grounds particulars | `section8_details`, ground-specific detail fields, arrears-led particulars | Auto |
| Explanation text | Drafted from grounds + particulars + chronology, with manual override if better text already exists | Auto / conditional |
| Signatory name and capacity | `signatory_name`, landlord defaults, solicitor/agent logic | Auto / conditional |
| Signatory address and contact | Landlord/service contact details | Auto |
| Joint signatories / extra sheet | Additional landlord/signatory data if present | Conditional |

Form 3A residual notes:
- This is the strongest-filled official output in the two packs.
- Because the official source PDF has no native fields, the real QA question is overlay coverage rather than AcroForm field count.

### Form N215 (Certificate of Service)

Status:
- Official editable AcroForm PDF.
- Current generated sample fill count: 19 / 59 fields in the golden samples.
- Remaining blanks are now explicitly classified rather than accidental.

Current classification:
- Auto: core case, date, address, signer, default recipient/service-location assumptions.
- Conditional: service-method branches, recipient/service-location overrides, legal-representative block, electronic-service details.
- Manual: fields that would require facts we do not yet collect or should not invent.

Main wizard-to-output mapping:

| N215 area | Source wizard facts | Status |
|-----------|---------------------|--------|
| Court / claim heading | `court_name`, `claim_number` when known | Auto / conditional |
| Claimant / defendant | landlord and tenant names | Auto |
| Document served | Product-aware default (`Form 3A notice`) | Auto |
| Service date | `notice_served_date` / `notice_date` | Auto |
| Service method branch | `notice_service_method` | Auto |
| Service time | `notice_service_time` / `service_time` | Conditional |
| Recipient capacity | `notice_service_recipient_capacity` | Conditional with default `defendant` |
| Service location | `notice_service_location`, `notice_service_location_other` | Conditional with default `usual_residence` |
| Recipient email / other electronic identifier | `notice_service_recipient_email`, `other_electronic_identification` | Conditional |
| Signer details | `signatory_name`, `signatory_position`, `solicitor_firm`, signature date | Auto / conditional |

Still manual or intentionally not auto-filled:
- DX number unless the case actually has one
- fax number unless the case actually has one
- uncommon service branches not triggered by the recorded method
- any fact that would require us to invent what physically happened during service

### Form N5 (Claim for Possession)

Status:
- Official editable AcroForm PDF.
- Current generated sample fill count: 23 / 54 fields in the golden sample.
- Field names are now template-validated to catch HMCTS drift.

Main wizard-to-output mapping:

| N5 area | Source wizard facts | Status |
|---------|---------------------|--------|
| Court / claim heading | `court_name`, `claim_number` when known | Auto / conditional |
| Claimant / defendant details | landlord + tenant details | Auto |
| Possession property | property address | Auto |
| Service address | service contact / landlord / solicitor contact fallbacks | Auto |
| Claim basis checkboxes | grounds normalized from Section 8 selection | Auto / conditional |
| Court fee / total | claim-type logic and fee calculation | Auto |
| Signer / statement of truth | signatory name/date, solicitor-firm logic | Auto / conditional |
| Legal representative address block | solicitor/service address fields when present | Conditional |
| Fax / DX / reference | only if actually known | Conditional/manual |
| Hearing / issue metadata | issued date, hearing date, time, location | Manual until the court assigns them |

Still manual or intentionally not auto-filled:
- hearing listing fields
- issue date before court issue
- specialist demotion / right-to-buy / HRA branches unless the case actually needs them
- niche professional-reference fields unless the case carries the data

### Form N119 (Particulars of Claim)

Status:
- Official editable AcroForm PDF.
- Current generated sample fill count: 29 / 54 fields in the golden sample.
- Field names are now template-validated to catch HMCTS drift.

Main wizard-to-output mapping:

| N119 area | Source wizard facts | Status |
|-----------|---------------------|--------|
| Court / claim heading | `court_name`, `claim_number` when known | Auto / conditional |
| Claimant / defendant | landlord + tenant details | Auto |
| Property / tenancy baseline | address, tenancy start date, rent amount, rent frequency | Auto |
| Grounds and reasons for possession | `section8_grounds`, `section8_details`, drafted particulars | Auto |
| Steps already taken | chronology, arrears/contact drafting | Auto / conditional |
| Notice served date | `notice_served_date` / `notice_date` | Auto |
| Tenant circumstances / financial context | vulnerability and defence facts where available | Conditional |
| Alternative relief / social-landlord branches | only for those case types | Manual / conditional |
| Statement of truth | signatory name, date, firm, position | Auto / conditional |

Still manual or intentionally not auto-filled:
- specialist social-housing / demotion branches unless truly applicable
- post-issue case metadata not yet known
- facts that should not be invented without direct landlord input

## 4. Compliance Coverage Matrix

### Explicitly captured in the live England Section 8 flows

| Compliance issue | Collected in wizard? | Used in output? | Notes |
|------------------|----------------------|-----------------|-------|
| Deposit taken | Yes | Yes | Compliance declaration, evidence checklist, warnings, support docs |
| Deposit protected | Yes | Yes | Same as above |
| Protected within 30 days | Yes | Yes | Same as above |
| Prescribed information served | Yes | Yes | Same as above |
| Deposit resolved / returned | Yes | Yes | Same as above |
| Section 16E duties checked | Yes | Yes | Same as above |
| Breathing-space check | Yes | Yes | Same as above |
| Tenant in active breathing space | Yes | Yes | Same as above |
| EPC given | Yes | Yes | Recorded in compliance layer and supporting docs |
| How to Rent guide given | Yes | Yes | Recorded in compliance layer and supporting docs |
| Gas safety certificate provided | Yes | Yes | Recorded where gas appliances exist |

Important compliance note:
- In these England Section 8 products, EPC / How to Rent / gas safety are currently treated as wider compliance and risk-record facts.
- They are not being forced into court-form fields that do not actually exist on N5 or N119.
- That is deliberate, but it means these facts mainly influence:
  - compliance declaration
  - evidence checklist
  - witness/case-summary narrative
  - warnings and risk framing

## 5. Residual Risk Summary

### Good current state

- Form 3A ground model is aligned to the current England post-2026 catalog.
- Notice Only and Complete Pack now collect the main collectible N215 service facts.
- N215, N5, and N119 blanks are classified rather than silently dropped.
- Complete Pack chronology is now driven far more by arrears and structured history than by one weak free-text box.

### Not yet a perfect 10/10 court-pack state

- N215 is improved, but still not a fully completed 59-field output in ordinary samples.
- N5 and N119 still contain intentionally manual branches, especially post-issue and specialist housing fields.
- Some professional-service data such as DX and fax remain uncollected unless separately stored.
- Review-proof UX may still lag the full richness of the final pack even though document generation is stronger underneath.

## 6. Operational Rules For Future Changes

1. Do not add a wizard question unless it maps to a real document field, legal rule, or support-document paragraph.
2. Do not claim a court form is "fully completed" unless every remaining blank is documented as intentional or not applicable.
3. Keep N215, N5, and N119 field coverage under automated regression tests, not just PDF eyeballing.
4. Keep Form 3A grounded in the post-2026 England catalog and wording source, not legacy ground lists.
5. If a new service fact is collected, wire it into:
   - live generation
   - preview / thumbnail
   - golden-pack regeneration
   - this matrix

