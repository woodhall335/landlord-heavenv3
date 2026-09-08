-- Add a first-party, no-PII site visit event for the truthful Universal Hero
-- daily usage counter. The public counter exposes only a distinct aggregate.
ALTER TABLE public.marketing_events
  DROP CONSTRAINT IF EXISTS marketing_events_allowed_event;

ALTER TABLE public.marketing_events
  ADD CONSTRAINT marketing_events_allowed_event CHECK (
    event_name IN (
      'site_visit',
      'commercial_bridge_viewed',
      'commercial_bridge_clicked',
      'journey_cta_impression',
      'journey_cta_click',
      'tool_started',
      'tool_completed',
      'result_viewed',
      'product_cta_clicked',
      'checkout_started',
      'purchase_completed',
      'product_page_viewed',
      'organic_landing_view',
      'contextual_offer_view',
      'contextual_offer_click',
      'product_view',
      'product_primary_cta_click',
      'builder_started',
      'builder_step_viewed',
      'builder_step_completed',
      'builder_validation_error',
      'builder_abandoned',
      'preview_requested',
      'preview_generated',
      'preview_failed',
      'account_creation_started',
      'account_created',
      'checkout_opened',
      'checkout_failed',
      'payment_succeeded',
      'document_delivered',
      'cross_sell_viewed',
      'cross_sell_clicked'
    )
  );
