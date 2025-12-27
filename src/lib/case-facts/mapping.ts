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
      const valueObj = value as Record<string, unknown>;

      if (Object.prototype.hasOwnProperty.call(valueObj, key)) {
        valueForPath = valueObj[key];
      } else {
        // Try common field ID patterns where the field ID has a prefix
        // e.g., maps_to: "notice_service.notice_date" → key: "notice_date"
        //       but field ID is "notice_service_date"
        const matchingFieldKey = Object.keys(valueObj).find(fieldKey => {
          // Check if field key ends with the expected key
          // e.g., "notice_service_date" ends with "date" (from "notice_date")
          const keyParts = key.split('_');
          const lastKeyPart = keyParts[keyParts.length - 1];
          return fieldKey.endsWith(`_${lastKeyPart}`) || fieldKey.endsWith(`_${key}`);
        });

        if (matchingFieldKey) {
          valueForPath = valueObj[matchingFieldKey];
        } else {
          // Try address key fallback (address_line1, address_line2, city, postcode, country)
          const addressKeys = ['address_line1', 'address_line2', 'city', 'postcode', 'country'];
          const matchedAddressKey = addressKeys.find((addressKey) => key.includes(addressKey));
          if (matchedAddressKey && Object.prototype.hasOwnProperty.call(valueObj, matchedAddressKey)) {
            valueForPath = valueObj[matchedAddressKey];
          } else {
            // Key not found and no fallback - DO NOT write
            // This prevents object pollution into flat facts
            shouldWrite = false;
          }
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
