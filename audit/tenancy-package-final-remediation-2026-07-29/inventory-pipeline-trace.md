# Canonical tenancy package pipeline

`wizard answers`
→ `validateTenancyRequiredFacts`
→ `mapWizardToASTData`
→ immutable paid tenancy snapshot
→ `deriveCanonicalInventoryState`
→ jurisdiction agreement and inventory renderers
→ regional checklist/supporting documents
→ `validateGeneratedTenancyPackage`
→ package manifest
→ private document storage
→ ownership-checked signed download

The server-owned inventory result is the only source used by the regional
agreement, inventory, checklist, Northern Ireland notice and manifest.
Legacy `inventory_attached` and `inventory_provided` Booleans are ignored when
meaningful structured room/item condition rows are absent.

Regional Standard packs use duplicate-inventory strategy B: one separate
canonical inventory PDF, referenced by immutable ID and content hash. It is not
appended to the agreement. This removes independent styling/page-number
continuation and prevents two generated inventories from diverging.

Historical identifiers remain resolvable. In particular,
`easy_read_notes_scotland` remains a preview/download alias while new
generation uses `prt_statutory_terms_supporting_notes_scotland`.
