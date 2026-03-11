# Blog Contextual Link Audit (Phase 7)

## Scope audited
- Total blog posts reviewed in repository index: **115**.
- Existing global “Core eviction guides for next steps” block already present.
- This pass hardens **in-body contextual links** via rule-based internal-link insertion inside blog prose paragraphs/list content.

## Link hardening implemented
A contextual auto-linker has been added to the shared blog prose renderer to ensure every post can pass authority contextually (not only via footer-style guide blocks).

### Contextual routes now injected in-body when matching phrases appear
1. `/section-8-notice-guide`
2. `/evict-tenant-not-paying-rent`
3. `/tenant-stopped-paying-rent`
4. `/section-21-notice-guide`
5. `/how-to-evict-a-tenant-uk`
6. `/money-claim-unpaid-rent`

## Matching logic summary
The renderer now scans paragraph/list text and converts the first natural topical mention into a contextual anchor for each priority destination, including:
- arrears / unpaid rent / missed rent payment terms
- Section 21 / Form 6A / no-fault terms
- Section 8 / grounds terms
- process / hearing / timeline terms
- money claim / debt recovery / MCOL terms

## Why this closes the gap
- Works across all 115 posts without relying on manual one-by-one edits.
- Preserves existing authored links (does not overwrite existing anchor elements).
- Prevents over-linking by limiting repeated destination injection.

## Notes for editorial follow-up
- For highest-value posts, manually tune anchor wording around case-specific clauses for even higher semantic precision.
- Keep this shared linker plus manual enhancements (hybrid model) for scale + quality.
