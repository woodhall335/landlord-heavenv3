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
 * IMPORTANT: This function must NEVER write an entire object to a fact path.
 * Only scalar values (string, number, boolean, null) or undefined are valid.
 * If a mapped key cannot be found in the answer object, the fact is set to undefined.
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

    // Case 1: Scalar value (not an object) - use directly
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      valueForPath = value;
    }
    // Case 2: Object value - extract the specific field
    else if (key) {
      const valueObj = value as Record<string, unknown>;

      // Try exact key match first
      if (Object.prototype.hasOwnProperty.call(valueObj, key)) {
        valueForPath = valueObj[key];
      } else {
        // Try address key fallback (e.g., "landlord_city" includes "city")
        const addressKeys = ['address_line1', 'address_line2', 'city', 'postcode', 'country'];
        const matchedAddressKey = addressKeys.find((addressKey) => key.includes(addressKey));

        if (matchedAddressKey && Object.prototype.hasOwnProperty.call(valueObj, matchedAddressKey)) {
          valueForPath = valueObj[matchedAddressKey];
        } else {
          // No matching key found - set to undefined, NEVER save the entire object
          valueForPath = undefined;
        }
      }

      // Safety check: if we somehow still have an object, refuse to save it
      if (valueForPath !== null && typeof valueForPath === 'object' && !Array.isArray(valueForPath)) {
        console.warn(
          `[MAPPING] Refusing to save object to fact path "${path}". ` +
            `Only scalar values are allowed. Value type: ${typeof valueForPath}`
        );
        valueForPath = undefined;
      }
    } else {
      // No key could be extracted from path - skip
      valueForPath = undefined;
    }

    // Only set the fact if we have a defined value
    if (valueForPath !== undefined) {
      return setFactPath(currentFacts, path, valueForPath);
    }

    return currentFacts;
  }, facts);
}
