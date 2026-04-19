# England post-1 May 2026 pack audit

Generated at: 2026-04-18T02:17:34.579Z
Run date folder: 2026-04-18
Audit root: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18

## Generated outputs

### Notice only
- section8_notice: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\form3a-notice.pdf; pdf fields=43
- service_instructions: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\service-instructions.html
- cover_letter_to_tenant: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\cover-letter-to-tenant.html
- service_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\service-checklist.html
- evidence_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\evidence-checklist.html
- proof_of_service: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\notice-only\proof-of-service.pdf; pdf fields=16
- missing required items: none

### Complete pack
- section8_notice: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\form3a-notice.pdf; pdf fields=43
- service_instructions: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\service-instructions.html
- cover_letter_to_tenant: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\cover-letter-to-tenant.html
- service_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\service-checklist.html
- evidence_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\evidence-checklist.html
- proof_of_service: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\proof-of-service.pdf; pdf fields=16
- n5_claim: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\n5-claim.pdf; pdf fields=54
- n119_particulars: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\n119-particulars.pdf; pdf fields=54
- court_filing_guide: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\court-filing-guide.html
- arrears_schedule: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-18\complete-pack\arrears-schedule.html
- missing required items: none

## Ground 8 threshold used in audit sample
- rent amount: GBP 1200.00
- rent frequency: monthly
- statutory threshold: GBP 3600.00 (3 months)
- sample arrears total: GBP 4200.00

## Active wizard ground coverage
- active UI catalog codes: 1, 10, 11, 12, 13, 14, 14A, 14ZA, 15, 17, 18, 1A, 2, 2ZA, 2ZB, 2ZC, 2ZD, 4, 4A, 5, 5A, 5B, 5C, 5E, 5F, 5G, 5H, 6, 6B, 7, 7A, 7B, 8, 9

## Scenario coverage summary
- total scenarios: 13
- expectation matches: 13
- expectation mismatches: 0

## Validation scenarios
### valid_notice_only_sale
- purpose: Baseline valid Form 3A notice-only sale route.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: none
- observed blocking: none
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=true; noticePeriodDays=122; errors=none; warnings=none
- wizard: ok=true; blocking=none; warnings=none
- checkpoint: ok=true; blocking=none; warnings=none
- preview: ok=true; blocking=none; warnings=none
- generate: ok=true; blocking=none; warnings=none
### valid_complete_pack_arrears
- purpose: Baseline valid complete-pack arrears claim with Ground 8, 10, and 11.
- product: eviction_pack
- selected grounds: Ground 8, Ground 10, Ground 11
- mapped grounds: Ground 8, Ground 10, Ground 11
- expected blocking: none
- observed blocking: none
- expected warnings: none
- observed warnings: none
- expectation match: yes
- wizard: ok=true; blocking=none; warnings=none
- checkpoint: ok=true; blocking=none; warnings=none
- preview: ok=true; blocking=none; warnings=none
- generate: ok=true; blocking=none; warnings=none
### ground8_below_threshold
- purpose: Ground 8 must be excluded when the arrears do not meet the post-May 2026 threshold.
- product: eviction_pack
- selected grounds: Ground 8, Ground 10
- mapped grounds: Ground 10
- expected blocking: GROUND_8_THRESHOLD_NOT_MET
- observed blocking: GROUND_8_THRESHOLD_NOT_MET
- expected warnings: none
- observed warnings: none
- expectation match: yes
- wizard: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- checkpoint: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- preview: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- generate: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
### notice_too_short_for_ground_1A
- purpose: Ground 1A should fail if the notice expiry date is shorter than the required notice period.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: NOTICE_PERIOD_TOO_SHORT
- observed blocking: NOTICE_PERIOD_TOO_SHORT
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=NOTICE_PERIOD_TOO_SHORT; warnings=none
- wizard: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- checkpoint: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- preview: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- generate: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
### deposit_unprotected
- purpose: A protected-deposit blocker should stop Form 3A progression when the deposit remains unresolved.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: DEPOSIT_PROTECTION_REQUIRED
- observed blocking: DEPOSIT_PROTECTION_REQUIRED
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- wizard: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- checkpoint: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- preview: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- generate: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
### deposit_protected_late
- purpose: Late deposit protection should remain a blocker for affected Form 3A grounds.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH
- observed blocking: DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH; warnings=none
- wizard: ok=false; blocking=DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH; warnings=none
- checkpoint: ok=false; blocking=DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH; warnings=none
- preview: ok=false; blocking=DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH; warnings=none
- generate: ok=false; blocking=DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH; warnings=none
### prescribed_information_missing
- purpose: Missing prescribed information should be surfaced as a possession blocker.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: PRESCRIBED_INFORMATION_REQUIRED
- observed blocking: PRESCRIBED_INFORMATION_REQUIRED
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=PRESCRIBED_INFORMATION_REQUIRED; warnings=none
- wizard: ok=false; blocking=PRESCRIBED_INFORMATION_REQUIRED; warnings=none
- checkpoint: ok=false; blocking=PRESCRIBED_INFORMATION_REQUIRED; warnings=none
- preview: ok=false; blocking=PRESCRIBED_INFORMATION_REQUIRED; warnings=none
- generate: ok=false; blocking=PRESCRIBED_INFORMATION_REQUIRED; warnings=none
### tenant_in_breathing_space
- purpose: Active breathing-space restrictions should block service and filing.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: TENANT_IN_BREATHING_SPACE
- observed blocking: TENANT_IN_BREATHING_SPACE
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=TENANT_IN_BREATHING_SPACE; warnings=none
- wizard: ok=false; blocking=TENANT_IN_BREATHING_SPACE; warnings=none
- checkpoint: ok=false; blocking=TENANT_IN_BREATHING_SPACE; warnings=none
- preview: ok=false; blocking=TENANT_IN_BREATHING_SPACE; warnings=none
- generate: ok=false; blocking=TENANT_IN_BREATHING_SPACE; warnings=none
### section16e_confirmation_missing
- purpose: The section 16E duty confirmation should remain mandatory for England post-May 2026 cases.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: SECTION_16E_CONFIRMATION_REQUIRED
- observed blocking: SECTION_16E_CONFIRMATION_REQUIRED
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=SECTION_16E_CONFIRMATION_REQUIRED; warnings=none
- wizard: ok=false; blocking=SECTION_16E_CONFIRMATION_REQUIRED; warnings=none
- checkpoint: ok=false; blocking=SECTION_16E_CONFIRMATION_REQUIRED; warnings=none
- preview: ok=false; blocking=SECTION_16E_CONFIRMATION_REQUIRED; warnings=none
- generate: ok=false; blocking=SECTION_16E_CONFIRMATION_REQUIRED; warnings=none
### complete_pack_evidence_bundle_incomplete
- purpose: The complete pack should block when the evidence bundle is not ready.
- product: eviction_pack
- selected grounds: Ground 8, Ground 10, Ground 11
- mapped grounds: Ground 8, Ground 10, Ground 11
- expected blocking: EVIDENCE_BUNDLE_INCOMPLETE
- observed blocking: EVIDENCE_BUNDLE_INCOMPLETE
- expected warnings: none
- observed warnings: none
- expectation match: yes
- wizard: ok=false; blocking=EVIDENCE_BUNDLE_INCOMPLETE; warnings=none
- checkpoint: ok=false; blocking=EVIDENCE_BUNDLE_INCOMPLETE; warnings=none
- preview: ok=false; blocking=EVIDENCE_BUNDLE_INCOMPLETE; warnings=none
- generate: ok=false; blocking=EVIDENCE_BUNDLE_INCOMPLETE; warnings=none
### ground_4A_prior_notice_missing
- purpose: Ground 4A should fail when the prior written notice prerequisite has not been confirmed.
- product: notice_only
- selected grounds: Ground 4A
- mapped grounds: Ground 4A
- expected blocking: GROUND_PRIOR_NOTICE_MISSING
- observed blocking: GROUND_PRIOR_NOTICE_MISSING
- expected warnings: DECISION_ENGINE_WARNING
- observed warnings: DECISION_ENGINE_WARNING
- expectation match: yes
- notice_only_validator: valid=false; noticePeriodDays=122; errors=GROUND_PRIOR_NOTICE_MISSING; warnings=none
- wizard: ok=false; blocking=GROUND_PRIOR_NOTICE_MISSING; warnings=DECISION_ENGINE_WARNING
- checkpoint: ok=false; blocking=GROUND_PRIOR_NOTICE_MISSING; warnings=DECISION_ENGINE_WARNING
- preview: ok=false; blocking=GROUND_PRIOR_NOTICE_MISSING; warnings=DECISION_ENGINE_WARNING
- generate: ok=false; blocking=GROUND_PRIOR_NOTICE_MISSING; warnings=DECISION_ENGINE_WARNING
### immediate_ground14_route
- purpose: Ground 14 should allow the immediate-application route without a long notice period.
- product: notice_only
- selected grounds: Ground 14
- mapped grounds: Ground 14
- expected blocking: none
- observed blocking: none
- expected warnings: none
- observed warnings: none
- expectation match: yes
- notice_only_validator: valid=true; noticePeriodDays=0; errors=none; warnings=none
- wizard: ok=true; blocking=none; warnings=none
- checkpoint: ok=true; blocking=none; warnings=none
- preview: ok=true; blocking=none; warnings=none
- generate: ok=true; blocking=none; warnings=none
### ground_1A_reletting_warning
- purpose: Ground 1A should warn when the landlord has not acknowledged the re-letting restriction.
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- expected blocking: none
- observed blocking: none
- expected warnings: GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- observed warnings: GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- expectation match: yes
- notice_only_validator: valid=true; noticePeriodDays=122; errors=none; warnings=GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- wizard: ok=true; blocking=none; warnings=GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- checkpoint: ok=true; blocking=none; warnings=GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- preview: ok=true; blocking=none; warnings=GROUND_1A_RELETTING_RESTRICTION_AWARENESS
- generate: ok=true; blocking=none; warnings=GROUND_1A_RELETTING_RESTRICTION_AWARENESS

## Legacy wording findings in generated support docs
- none

## Initial assessment
- Notice-only pack completeness: complete on artifact count
- Complete-pack completeness: complete on artifact count
- Scenario expectation coverage: 13/13 matched
- Value proposition score: 8.5/10
- Solicitor-grade status: closer, but still not a blanket zero-shortcoming claim. The audited England Form 3A and N5/N119 flows are fully populated and blocker-enforced for the tested scenarios, but edge-case possession claims should still be reviewed carefully.
- Post-1 May 2026 alignment: aligned on the active England wizard route, official-form mapping, support documents, and blocker enforcement for the audited scenarios.