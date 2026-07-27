# Tenancy final remediation - 27 July 2026

## Outcome

Source implementation and local validation were materially improved, but this is **not a
production release certification**.

- Source implementation: Northern Ireland notice, rates, deposit, inventory and alarm states
  were made explicit; a populated Tenancy Information Notice and hashed package manifest were
  added; checkout/fulfilment now use an immutable order-bound snapshot.
- Local validation: TypeScript and all 40 YAML schemas pass. Focused NI compliance tests pass.
- Deployed production behaviour: inspected read-only on 27 July 2026. The live site still serves
  the earlier deployment and was not changed by this task.
- External legal review: outstanding for Wales, Scotland and Northern Ireland.
- Release blocker: `src/lib/tenancy/non-england-certification.ts` requires both
  `modelParityVerified` and `solicitorApproved`; all three jurisdictions remain false. The public
  wizard and checkout gates therefore correctly prevent release.

No fixture-generated PDF is presented as real-wizard provenance. No live payment was attempted.
No deployment was attempted because the repository is not linked to a discoverable production
deployment project and the mandatory legal release gate is closed.

## Important live findings

- `/tenancy-agreement-template-uk`: HTTP-rendered page, self canonical, `noindex, follow`.
- Wales, Scotland and Northern Ireland canonical landing pages: self canonical and
  `index, follow`.
- The live Scotland and Northern Ireland page titles still contain “Legally Validated”. Current
  source no longer contains that claim; production needs a later approved deployment.
- Live regional pages still expose premium links, while source checkout limits non-England
  premium products. The legal gate prevents purchase, but the live marketing state is confusing.

## Evidence policy

Rows marked `BLOCKED` or `NOT RUN` are intentionally not converted into passes. A real customer
journey requires written legal approval, deployment authority, an applied migration, and an
approved payment-test mechanism.
