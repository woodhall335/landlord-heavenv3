# Northern Ireland Eviction Status

**Last Updated:** December 3, 2025
**Status:** NOT YET SUPPORTED (Roadmap Item)

## Current State

Northern Ireland eviction workflows are **not yet implemented** in Landlord Heaven v1.

While the MASTER_BLUEPRINT.md mentions NI eviction support (Notice to Quit workflow), the actual implementation does not exist as of December 2025.

## What Works

- ✅ Northern Ireland **Tenancy Agreements** (AST/PRT equivalents)
- ✅ NI property and jurisdiction detection
- ❌ NI Notice to Quit generation
- ❌ NI eviction court forms
- ❌ NI complete eviction packs

## What's Missing

1. **MQS Files:**
   - `/config/mqs/notice_only/northern-ireland.yaml` - Does not exist
   - `/config/mqs/complete_pack/northern-ireland.yaml` - Does not exist

2. **Legal Requirements:**
   - Notice to Quit statutory wording (NI-specific)
   - Housing Order 2006 compliance rules
   - NI-specific court forms and procedures
   - NI tenancy type validation (Private Tenancy vs Excluded)

3. **Document Generation:**
   - No NI eviction notice templates
   - No NI court form fillers

## Why Not Supported Yet

Northern Ireland eviction law differs significantly from England & Wales:

- Different notice requirements (Notice to Quit vs Section 8/21)
- Different court procedures (NI Courts Service vs HMCTS)
- Different forms and statutory language
- Smaller market (requires full legal review before launch)

## Blocking Behavior

The system must **actively prevent** users from attempting NI eviction flows:

1. **Wizard Start:** Return clear error if user selects NI + eviction product
2. **API Validation:** Block `/api/wizard/start` for `jurisdiction=northern-ireland` + `product=notice_only|complete_pack`
3. **Product Catalog:** Do not expose NI eviction products in UI/pricing
4. **Clear Messaging:** Show helpful error explaining NI evictions are not yet available and suggest alternatives (NI solicitor referral, future roadmap)

## Error Message Template

```
Northern Ireland eviction workflows are not yet supported.

We currently support:
✅ Tenancy Agreements for Northern Ireland
✅ Evictions for England & Wales
✅ Evictions for Scotland

For NI eviction assistance, we recommend consulting a local NI solicitor.

Expected availability: Q2 2026 (subject to legal review)
```

## Roadmap

**Target:** Q2 2026 (Tentative)

**Blockers:**
- Legal review of NI Housing Order 2006
- NI court form templates acquisition
- NI solicitor consultation for compliance
- Market sizing and demand validation

## Implementation Checklist (When Ready)

When NI evictions are ready to implement:

- [ ] Create `/config/mqs/notice_only/northern-ireland.yaml`
- [ ] Create `/config/mqs/complete_pack/northern-ireland.yaml`
- [ ] Implement Notice to Quit statutory template
- [ ] Add NI tenancy type validation (Private Tenancy vs Excluded)
- [ ] Implement NI-specific notice period calculations
- [ ] Create NI court form fillers
- [ ] Add NI-specific compliance checks
- [ ] Update product catalog to expose NI eviction products
- [ ] Remove blocking validation from API
- [ ] Add NI eviction tests
- [ ] Legal review and sign-off

## References

- NI Housing Order 2006
- [nidirect.gov.uk - Ending a Tenancy](https://www.nidirect.gov.uk/articles/ending-tenancy)
- MASTER_BLUEPRINT.md Section 1.1 (mentions NI NTQ workflow as planned)

---

**Bottom Line:** NI evictions are a planned feature but are NOT supported in the current v1 release. The system actively blocks NI eviction attempts with clear error messaging.
