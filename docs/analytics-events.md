# Journey Analytics Events

These events are emitted through the existing `trackEvent` wrapper (`src/lib/analytics.ts`) and only include non-PII payload fields.

## Events

### `journey_cta_impression`
- Fired when `NextStepWidget` is rendered.
- Payload:
  - `cta_id` (string)
  - `location` (string)
  - `context`:
    - `page_path`
    - `referrer`
    - `device_type` (`mobile` | `desktop`)
    - `journey_state` snapshot

### `journey_cta_click`
- Fired by delegated click listener in `JourneyProvider` when a node with:
  - `data-lh-cta="true"`
  - `data-lh-cta-id`
  - `data-lh-cta-location`
  is clicked.
- Payload:
  - `cta_id`
  - `location`
  - `context` (same schema as above)

### `journey_tool_complete`
- Fired after tool completion states:
  - Rent arrears calculator when arrears summary is populated.
  - Free rent demand letter when generation succeeds.
- Payload:
  - `tool_name`
  - `context.journey_state` with derived/bucketed metrics only.

### `journey_scroll_depth`
- Fired once per page for each threshold: `25`, `50`, `75`, `90`.
- Payload:
  - `depth`
  - `context` (same schema as above)

## PII Guardrails

The journey events pipeline intentionally excludes landlord/tenant names, addresses, emails, claim refs, and free-text prompts. Only derived or enumerated state is sent.
