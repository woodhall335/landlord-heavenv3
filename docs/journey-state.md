# Journey State (`lh_journey_state_v1`)

`JourneyState` is stored client-side in `localStorage` under `lh_journey_state_v1`.

## Why this exists

It links intent across content and tools (blog → tools → Ask Heaven → products) without storing personal data.

## Stored fields (non-PII only)

- `stage_estimate`
  - `early_arrears` | `demand_sent` | `notice_ready` | `court_ready` | `unknown`
- `jurisdiction_estimate`
  - `england` | `wales` | `scotland` | `ni` | `unknown`
- `arrears_band`
  - `0-499` | `500-999` | `1000-1999` | `2000-3999` | `4000+`
- `months_in_arrears_band`
  - `<1` | `1-1.9` | `2-2.9` | `3+`
- `last_touch`
  - `{ type, id, ts }` where `type` is `blog | tool | ask_heaven | product`
- `last_cta`
  - `{ id, location, ts }`
- `first_seen_ts`
- `last_seen_ts`

## Privacy note

No names, emails, addresses, claim references, or user free-text are persisted in this state.
