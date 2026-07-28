# Non-England standard tenancy release delta — 28 July 2026

This directory records the controlled release delta from
`audit/tenancy-final-remediation-2026-07-27`.

## Product decision

- Wales, Scotland and Northern Ireland sell **standard tenancy agreements only**.
- Non-England premium aliases are rejected at checkout and cannot start a new
  public wizard.
- Historical paid premium cases remain readable/generatable so an existing
  customer entitlement is not destroyed.

## Release authorisation

The product owner expressly authorised removal of solicitor approval as a
technical release dependency on 28 July 2026 after confirming that the
agreements had been verified. The code and public pages do not describe the
products as solicitor approved, legally certified, government approved or
guaranteed compliant.

Release still depends on:

1. recorded source/model parity;
2. verified prescribed/supporting-document workflow;
3. the jurisdiction release switch;
4. complete server-side wizard validation;
5. a paid order and immutable tenancy-output snapshot before fulfilment.

## Migration

Migration `026_tenancy_output_snapshots.sql` is recorded as **applied**, based
on the product owner's explicit production attestation on 28 July 2026. This
run did not independently query the production migration table.

## Technical changes

- The real public standard wizard can start for Wales, Scotland and Northern
  Ireland; the generic public-product check no longer rejects a jurisdiction
  that passed the canonical release gate.
- Wales now receives the correct `Standard Occupation Contract` tier label.
- Registry-backed public routing and sitemap eligibility are used for the
  released non-England products.
- Inventory state fails closed: an `attached` state requires structured,
  renderable inventory rows. A Boolean attachment flag alone is insufficient.
- Until structured inventory entry is exposed in these standard wizards, they
  ask for the separate inventory delivery date and use the truthful `later`
  state.
- New generated PDFs store a private Supabase object key. Customer access is
  through the authenticated, ownership-checked signed-download endpoint.
- Northern Ireland public copy now records mandatory landlord registration and
  separate landlord/tenant Notice to Quit scales.

## Production state

Source is release-ready subject to the validation results recorded alongside
this file. No production deployment is recorded from this workspace because it
has no `.vercel/project.json`, no Vercel CLI, and no connected deployment
project. The live site must not be treated as updated until a deployment from
this source revision succeeds.

