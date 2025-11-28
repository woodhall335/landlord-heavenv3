import type { WizardFacts } from './schema';

/**
 * Sets a value in WizardFacts (flat format) at the given dot-notation path.
 * This works with flat keys like "property_address_line1" or "tenants.0.full_name".
 */
export function setFactPath(
  facts: WizardFacts,
  path: string,
  value: unknown
): WizardFacts {
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) return facts;

  // For flat facts, we just set the key directly
  // The path IS the key (e.g., "property_address_line1" or "tenants.0.full_name")
  const updated: any = { ...facts };

  // Handle simple case: single-segment path (most common for flat structure)
  if (segments.length === 1) {
    updated[path] = value;
    return updated as WizardFacts;
  }

  // Handle nested paths by setting the full path as the key
  // This maintains the flat structure: wizard["tenants.0.full_name"] = value
  updated[path] = value;

  return updated as WizardFacts;
}

/**
 * Applies mapped answers from MQS questions to WizardFacts (flat format).
 * Each maps_to path becomes a flat key in the WizardFacts object.
 */
export function applyMappedAnswers(
  facts: WizardFacts,
  mapsTo: string[] | undefined,
  value: unknown
): WizardFacts {
  if (!mapsTo || mapsTo.length === 0) {
    return facts;
  }

  return mapsTo.reduce((currentFacts, path) => {
    const key = path.split('.').pop();
    let valueForPath = value as any;

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key &&
      Object.prototype.hasOwnProperty.call(value as object, key)
    ) {
      valueForPath = (value as Record<string, unknown>)[key];
    }

    return setFactPath(currentFacts, path, valueForPath);
  }, facts);
}
