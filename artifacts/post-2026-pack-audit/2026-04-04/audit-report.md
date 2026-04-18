# England post-1 May 2026 pack audit

Generated at: 2026-04-17T20:12:37.898Z

## Generated outputs

### Notice only
- section8_notice: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\form3a-notice.pdf; pdf fields=43
- service_instructions: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\service-instructions.html
- cover_letter_to_tenant: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\cover-letter-to-tenant.html
- service_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\service-checklist.html
- evidence_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\evidence-checklist.html
- proof_of_service: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\notice-only\proof-of-service.pdf; pdf fields=16
- missing required items: none

### Complete pack
- section8_notice: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\form3a-notice.pdf; pdf fields=43
- service_instructions: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\service-instructions.html
- cover_letter_to_tenant: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\cover-letter-to-tenant.html
- service_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\service-checklist.html
- evidence_checklist: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\evidence-checklist.html
- proof_of_service: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\proof-of-service.pdf; pdf fields=16
- n5_claim: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\n5-claim.pdf; pdf fields=54
- n119_particulars: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\n119-particulars.pdf; pdf fields=54
- court_filing_guide: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\court-filing-guide.html
- arrears_schedule: C:\Users\t_moh\Documents\GitHub\landlord-heavenv3\artifacts\post-2026-pack-audit\2026-04-04\complete-pack\arrears-schedule.html
- missing required items: none

## Ground 8 threshold used in audit sample
- rent amount: GBP 1200.00
- rent frequency: monthly
- statutory threshold: GBP 3600.00 (3 months)
- sample arrears total: GBP 4200.00

## Active wizard ground coverage
- active UI catalog codes: 1, 10, 11, 12, 13, 14, 14A, 14ZA, 15, 17, 18, 1A, 2, 2ZA, 2ZB, 2ZC, 2ZD, 4, 4A, 5, 5A, 5B, 5C, 5E, 5F, 5G, 5H, 6, 6B, 7, 7A, 7B, 8, 9

## Validation scenarios
### valid_notice_only_sale
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- notice_only_validator: valid=true; noticePeriodDays=122; errors=none; warnings=none
- wizard: ok=true; blocking=none; warnings=none
- checkpoint: ok=true; blocking=none; warnings=none
- preview: ok=true; blocking=none; warnings=none
- generate: ok=true; blocking=none; warnings=none
### valid_complete_pack_arrears
- product: eviction_pack
- selected grounds: Ground 8, Ground 10, Ground 11
- mapped grounds: Ground 8, Ground 10, Ground 11
- wizard: ok=true; blocking=none; warnings=none
- checkpoint: ok=true; blocking=none; warnings=none
- preview: ok=true; blocking=none; warnings=none
- generate: ok=true; blocking=none; warnings=none
### ground8_below_threshold
- product: eviction_pack
- selected grounds: Ground 8, Ground 10
- mapped grounds: Ground 10
- wizard: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- checkpoint: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- preview: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
- generate: ok=false; blocking=GROUND_8_THRESHOLD_NOT_MET; warnings=none
### notice_too_short_for_ground_1A
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- notice_only_validator: valid=false; noticePeriodDays=122; errors=NOTICE_PERIOD_TOO_SHORT; warnings=none
- wizard: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- checkpoint: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- preview: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
- generate: ok=false; blocking=NOTICE_PERIOD_TOO_SHORT; warnings=none
### deposit_unprotected
- product: notice_only
- selected grounds: Ground 1A
- mapped grounds: Ground 1A
- notice_only_validator: valid=false; noticePeriodDays=122; errors=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- wizard: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- checkpoint: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- preview: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none
- generate: ok=false; blocking=DEPOSIT_PROTECTION_REQUIRED; warnings=none

## Legacy wording findings in generated support docs
- none

## Initial assessment
- Notice-only pack completeness: complete on artifact count
- Complete-pack completeness: complete on artifact count
- Value proposition score: 8.5/10
- Solicitor-grade status: closer, but still not a blanket zero-shortcoming claim. The audited England Form 3A and N5/N119 flows are fully populated and blocker-enforced for the tested scenarios, but edge-case possession claims should still be reviewed carefully.
- Post-1 May 2026 alignment: aligned on the active England wizard route, official-form mapping, support documents, and blocker enforcement for the audited scenarios.