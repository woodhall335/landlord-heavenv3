'use client';

import { useEffect } from 'react';
import { initializeAttribution } from '@/lib/wizard/wizardAttribution';

/**
 * Captures first-touch attribution on the actual entry page.
 * Product and wizard trackers call the same idempotent initializer later, but
 * those calls must not replace the original organic or campaign landing path.
 */
export function AttributionInitializer() {
  useEffect(() => {
    initializeAttribution();
  }, []);

  return null;
}

export default AttributionInitializer;
