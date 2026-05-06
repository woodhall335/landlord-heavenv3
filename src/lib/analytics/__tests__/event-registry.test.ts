import { describe, expect, it } from 'vitest';

import { getAnalyticsEventDefinition } from '../event-registry';

describe('analytics event registry', () => {
  it('classifies wizard and view events with dedupe policy', () => {
    expect(getAnalyticsEventDefinition('landing_view')).toMatchObject({
      family: 'landing_view',
      class: 'view',
      dedupeScope: 'page',
    });

    expect(getAnalyticsEventDefinition('wizard_step_complete')).toMatchObject({
      family: 'wizard_step_complete',
      class: 'milestone',
      dedupeScope: 'case',
      variant: 'canonical',
    });
  });

  it('treats normalized wizard step events as intentional derived mirrors', () => {
    expect(getAnalyticsEventDefinition('wizard_step_property_complete')).toMatchObject({
      family: 'wizard_step_complete',
      class: 'derived',
      dedupeScope: 'case',
      variant: 'derived',
    });
  });

  it('registers first-party revenue funnel events', () => {
    expect(getAnalyticsEventDefinition('commercial_bridge_viewed')).toMatchObject({
      family: 'commercial_bridge_viewed',
      class: 'view',
      dedupeScope: 'page',
    });

    expect(getAnalyticsEventDefinition('commercial_bridge_clicked')).toMatchObject({
      family: 'commercial_bridge_clicked',
      class: 'interaction',
      dedupeScope: 'none',
    });

    expect(getAnalyticsEventDefinition('tool_completed')).toMatchObject({
      family: 'tool_completed',
      class: 'milestone',
      dedupeScope: 'session',
    });

    expect(getAnalyticsEventDefinition('purchase_completed')).toMatchObject({
      family: 'purchase_completed',
      class: 'milestone',
      dedupeScope: 'none',
    });
  });
});
