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
 *
 * IMPORTANT: This function NEVER writes whole objects into flat facts.
 * If the expected key is not found in the value object, the path is skipped.
 * This prevents object pollution which causes normalization flattening loops.
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
    let valueForPath: unknown;
    let shouldWrite = true;

    if (value && typeof value === 'object' && !Array.isArray(value) && key) {
      // Value is an object - extract the specific field by key
      if (Object.prototype.hasOwnProperty.call(value as object, key)) {
        valueForPath = (value as Record<string, unknown>)[key];
      } else {
        // Try address key fallback (address_line1, address_line2, city, postcode, country)
        const addressKeys = ['address_line1', 'address_line2', 'city', 'postcode', 'country'];
        const matchedAddressKey = addressKeys.find((addressKey) => key.includes(addressKey));
        if (matchedAddressKey && Object.prototype.hasOwnProperty.call(value as object, matchedAddressKey)) {
          valueForPath = (value as Record<string, unknown>)[matchedAddressKey];
        } else {
          // TASK B FIX: Key not found and no address fallback - DO NOT write
          // This prevents object pollution into flat facts
          shouldWrite = false;
        }
      }

      // TASK B FIX: Defensive guard - never write non-array objects to flat facts
      if (shouldWrite && valueForPath !== null && typeof valueForPath === 'object' && !Array.isArray(valueForPath)) {
        console.warn(
          `[applyMappedAnswers] Skipping object write to flat path "${path}" - would corrupt facts. ` +
          `Value keys: ${Object.keys(valueForPath as object).join(', ')}`
        );
        shouldWrite = false;
      }
    } else {
      // Value is a primitive, array, null, or undefined - use directly
      valueForPath = value;

      // TASK B FIX: Extra guard for non-array objects that somehow got here
      if (valueForPath !== null && typeof valueForPath === 'object' && !Array.isArray(valueForPath)) {
        console.warn(
          `[applyMappedAnswers] Skipping object write to flat path "${path}" - would corrupt facts.`
        );
        shouldWrite = false;
      }
    }

    if (shouldWrite) {
      return setFactPath(currentFacts, path, valueForPath);
    }

    return currentFacts;
  }, facts);
}
