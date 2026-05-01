# Legal Audit Remediation Backlog

Date: 1 May 2026
Source audit: `artifacts/golden-packs/_audit/legal-audit-golden-packs-2026-05-01.md`
Goal: Turn the audit findings into a delivery-ready remediation list with priorities, expected impact, and acceptance criteria.

## Recommended Order

1. P0: Output fidelity and trust defects
2. P1: Remove or merge low-value support documents
3. P2: Upgrade weak tenancy pack differentiation
4. P3: Add maintenance rails for time-sensitive legal/process guidance

## P0 Critical Fixes

### P0.1 Fix mojibake and extraction-quality defects across support documents

Problem:

- Multiple generated text layers still show `Â£`, corrupted checkbox glyphs, and similar encoding noise.
- This undermines trust in tenant-facing and tribunal-facing outputs even when the underlying PDF is visually acceptable.

Highest-priority targets:

- `section13_standard/section13-cover-letter-golden-section13-standard-001.txt`
- `section13_defensive/section13-legal-briefing-golden-section13-defence-001.txt`
- `england_standard_tenancy_agreement/pre_tenancy_checklist_england.txt`
- `england_standard_tenancy_agreement/prescribed_information_pack.txt`
- `money_claim/08-filing-guide.txt`
- `money_claim/09-enforcement-guide.txt`

Likely work:

- Audit currency normalization and text-layer encoding in HTML-to-PDF support docs.
- Standardize checkbox glyph strategy in printable checklists.
- Add extraction-based regression checks for mojibake on the known-problem docs.

Acceptance criteria:

- No `Â£`, `â˜`, `â€”`, or `Ã` patterns in the extracted text artifacts for the audited support docs.
- Golden-pack text artifacts render pound values as `£`.
- Checklist-style docs use a stable text-layer representation.

### P0.2 Fix internal enum-style values leaking into user output

Problem:

- Some documents expose internal machine values instead of user-facing prose.

Known example:

- `england_student_tenancy_agreement/england-student-move-out-schedule.txt`
  - `21_days`
  - `outgoing_tenant`

Likely work:

- Add display-label mapping at the template data layer for schedule/enum values.
- Add text assertions for student/HMO/premium schedules.

Acceptance criteria:

- No raw enum tokens appear in user-facing extracted text.
- All operational values read as human language, not internal config keys.

## P1 Quick Wins

### P1.1 Merge or remove thin wrapper PDFs in possession packs

Problem:

- Several one-page support docs do not add enough value to justify their own PDF.

Merge/remove candidates:

- `complete_pack/court_forms_guide`
- `complete_pack/service_record_notes`
- `complete_pack/evidence_required_for_hearing`
- `notice_only/what_happens_next`

Recommended action:

- Merge `court_forms_guide` and `service_record_notes` into `court_readiness_status` or `case_summary`.
- Merge `evidence_required_for_hearing` into `hearing_checklist`.
- Fold `what_happens_next` into `case_summary` or `service_instructions`.

Acceptance criteria:

- Each remaining support PDF has a distinct legal or operational purpose.
- No PDF exists purely to repeat points already made elsewhere in the same pack.
- Total pack count may go down, but practical usefulness goes up.

### P1.2 Merge or downgrade thin Section 13 extras

Problem:

- Some defensive-pack extras feel too light for standalone status.

Targets:

- `section13_negotiation_email_template`
- `section13_evidence_checklist`
- potentially `section13_legal_briefing` unless expanded materially

Recommended action:

- Move the negotiation email into the cover letter or landlord response template as a short appendix.
- Fold the evidence checklist into the tribunal defence guide or bundle cover sheet.
- Either expand the legal briefing into a real hearing note or collapse it into the tribunal argument summary.

Acceptance criteria:

- The defensive pack keeps only documents with real tribunal-prep value.
- “Premium”/“defensive” extras feel materially differentiated, not filler.

## P2 Pack-Specific Upgrades

### P2.1 Strengthen `money_claim` pack maintenance posture

Problem:

- Filing and enforcement guides are useful but legally time-sensitive.
- They contain routes, fee assumptions, and process choices that can go stale quickly.

Targets:

- `money_claim/08-filing-guide`
- `money_claim/09-enforcement-guide`

Recommended action:

- Separate timeless principles from volatile details.
- Move fee tables and route-sensitive details into a maintained config/data source if possible.
- Add a “last reviewed for procedure” field or internal metadata.

Acceptance criteria:

- Fee and route content is easy to update in one place.
- Guidance distinguishes “usually” from “must”.
- Text does not overstate route certainty where procedure may vary.

### P2.2 Upgrade HMO support layer

Problem:

- HMO/shared-house tenancy should be one of the most operationally rich products, but the dedicated appendix is thin.

Targets:

- `england_hmo_shared_house_tenancy_agreement/england-hmo-house-rules-appendix.txt`
- potentially corresponding agreement sections if duplication exists

Recommended action:

- Expand HMO-specific operational terms:
  - shared cleaning standards
  - refuse/recycling duties
  - guest policy detail
  - fire safety / detector tampering rules
  - bedroom/private-space vs communal-space boundaries
  - reporting route for household issues
  - quiet-hours / nuisance process
- Consider replacing the current appendix with a richer “House Operations Schedule”.

Acceptance criteria:

- The HMO add-on feels proportionate to HMO risk.
- Shared-house operational friction points are addressed concretely.

### P2.3 Upgrade lodger support layer

Problem:

- Lodger route is directionally differentiated, but the house-rules appendix is too thin.

Targets:

- `england_lodger_agreement/england-lodger-house-rules-appendix.txt`

Recommended action:

- Expand resident-landlord-specific rules:
  - guest policy
  - kitchen/bathroom usage
  - shared-space hours
  - laundry and cleaning expectations
  - security/access/alarm rules
  - notice around household changes
  - utility and included-service boundaries

Acceptance criteria:

- The lodger appendix becomes a meaningful occupancy-control document.
- It no longer reads like a placeholder.

### P2.4 Reposition premium tenancy add-on so it actually feels premium

Problem:

- The premium schedule is useful but currently too close to a structured admin note.

Targets:

- `england_premium_tenancy_agreement/england-premium-management-schedule.txt`

Recommended action:

- Deepen the premium differentiators:
  - repairs triage expectations
  - inspection workflow
  - contractor access rules
  - file-control and check-in/check-out process
  - utility and meter dispute handling
  - communication standards and response timings

Acceptance criteria:

- A user can tell why this is “premium” rather than “standard + 1 extra schedule”.

### P2.5 Tighten generic tenancy compliance/support docs

Problem:

- Some support docs read more like generic legal leaflets than file-ready landlord tools.

Targets:

- `pre_tenancy_checklist_england`
- `deposit_protection_certificate`
- `prescribed_information_pack`

Recommended action:

- Shift from abstract obligation summaries toward:
  - what to hand over
  - what proof to retain
  - what deadline applies
  - what breaks later enforceability
- Keep statutory references, but lead with operational action.

Acceptance criteria:

- Support docs help the landlord build a defensible file, not just read a summary of the law.

## P3 Medium-Term Product Cleanup

### P3.1 Rationalize support-document categories and pack presentation

Problem:

- Some packs have blank or weak categories in manifests, especially the Section 13 packs.
- Pack composition feels uneven across product families.

Recommended action:

- Normalize category assignment for all generated docs.
- Decide whether support docs are:
  - `guidance`
  - `evidence_tool`
  - `court_form`
  - `agreement`
  - `schedule`
- Apply categories consistently so packs read as intentional bundles.

Acceptance criteria:

- All manifest entries have meaningful categories.
- Pack composition looks curated rather than loosely assembled.

### P3.2 Reduce disclaimer-first tone where it crowds out practical value

Problem:

- Some docs are helpful but lean too quickly into “not legal advice” or generic caution language.

Targets:

- `complete_pack/court_readiness_status`
- `notice_only/compliance_declaration`
- `section13` cover/justification layer
- `money_claim` guides where overused

Recommended action:

- Keep disclaimers, but move them to footer/end sections unless legally necessary at the top.
- Lead with action, evidence, and decision points.

Acceptance criteria:

- User gets practical next steps before seeing warning boilerplate.
- Tone feels more expert and less defensive.

## Suggested Work Batches

### Batch A: Trust and polish

- Fix mojibake
- Fix enum leakage
- Add extraction regressions

Expected impact:

- Immediate quality lift across all product lines
- Better customer trust

### Batch B: Possession-pack consolidation

- Merge low-value Stage 1/Stage 2 wrappers
- Strengthen remaining core support docs

Expected impact:

- Cleaner Section 8 bundles
- Less filler, more usable court prep

### Batch C: Section 13 premiumization

- Expand or merge weak defensive extras
- Improve legal briefing and negotiation assets

Expected impact:

- Defensive pack feels more worth the premium/upsell

### Batch D: Tenancy pack differentiation

- Rework HMO and lodger appendices
- Deepen premium management schedule
- Clean tenancy support layer

Expected impact:

- Better product separation
- Less “generic template pack” feel

### Batch E: Money-claim maintenance rails

- Refactor time-sensitive fee/procedure content
- Add a review/update mechanism

Expected impact:

- Lower legal staleness risk

## Best Candidates for Immediate Action

If we want the highest-value first pass, do these first:

1. Fix mojibake and text-layer corruption everywhere.
2. Merge `court_forms_guide`, `service_record_notes`, and `evidence_required_for_hearing`.
3. Expand or remove `england_lodger_house_rules_appendix`.
4. Expand `england_hmo_house_rules_appendix`.
5. Replace raw enum output in `england-student-move-out-schedule`.
6. Rework `section13_negotiation_email_template` into a richer landlord response/negotiation asset.
