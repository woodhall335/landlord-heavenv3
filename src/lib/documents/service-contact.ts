// src/lib/documents/service-contact.ts

export interface ServiceContact {
  service_address_line1: string;
  service_address_line2: string;
  service_address_town: string;
  service_address_county: string;
  service_postcode: string;
  service_phone: string;
  service_email: string;
}

/**
 * Build a unified "service contact" view for court forms.
 *
 * Priority:
 *  1) If uses_solicitor === "Yes" and solicitor_* fields are present, prefer those.
 *  2) Else, if service_* fields are filled, use those.
 *  3) Else, fall back to landlord_*.
 */
export function buildServiceContact(facts: Record<string, any>): ServiceContact {
  const usesSolicitor = facts.uses_solicitor === 'Yes';

  // 1. Prefer solicitor as address for service when used
  if (usesSolicitor && facts.solicitor_address) {
    return {
      service_address_line1: facts.service_address_line1 || facts.solicitor_address,
      service_address_line2: facts.service_address_line2 || '',
      service_address_town: facts.service_address_town || '',
      service_address_county: facts.service_address_county || '',
      service_postcode:
        facts.service_postcode ||
        facts.landlord_postcode ||
        '',
      service_phone:
        facts.service_phone ||
        facts.solicitor_phone ||
        facts.landlord_phone ||
        '',
      service_email:
        facts.service_email ||
        facts.solicitor_email ||
        facts.landlord_email ||
        '',
    };
  }

  // 2. Explicit service_contact entered
  if (facts.service_address_line1 || facts.service_postcode) {
    return {
      service_address_line1: facts.service_address_line1,
      service_address_line2: facts.service_address_line2 || '',
      service_address_town: facts.service_address_town || '',
      service_address_county: facts.service_address_county || '',
      service_postcode: facts.service_postcode || '',
      service_phone: facts.service_phone || facts.landlord_phone || '',
      service_email: facts.service_email || facts.landlord_email || '',
    };
  }

  // 3. Fallback: landlord details
  return {
    service_address_line1: facts.landlord_address || '',
    service_address_line2: '',
    service_address_town: '',
    service_address_county: '',
    service_postcode: facts.landlord_postcode || '',
    service_phone: facts.landlord_phone || '',
    service_email: facts.landlord_email || '',
  };
}
