import { describe, expect, it } from 'vitest';

import {
  deriveCaseRecoveryContact,
  deriveCheckoutRecoveryContact,
} from '@/lib/cases/recovery';

const baseCase = {
  id: 'case-1',
  case_type: 'eviction',
  jurisdiction: 'england',
};

describe('recovery contact resolution', () => {
  it('prefers the product contact over the account profile', () => {
    expect(
      deriveCaseRecoveryContact(
        {
          ...baseCase,
          collected_facts: {
            landlord_email: 'customer@example.com',
            landlord_full_name: 'Customer Landlord',
          },
        },
        {
          email: 'admin@example.com',
          full_name: 'Admin User',
        }
      )
    ).toEqual({
      email: 'customer@example.com',
      name: 'Customer Landlord',
    });
  });

  it('falls back to the account profile when the product has no contact', () => {
    expect(
      deriveCaseRecoveryContact(baseCase, {
        email: 'owner@example.com',
        full_name: 'Account Owner',
      })
    ).toEqual({
      email: 'owner@example.com',
      name: 'Account Owner',
    });
  });

  it('prefers the email captured when checkout was created', () => {
    expect(
      deriveCheckoutRecoveryContact({
        order: {
          metadata: {
            customer_email: 'checkout@example.com',
            customer_name: 'Checkout Customer',
          },
        },
        caseItem: {
          ...baseCase,
          collected_facts: {
            landlord_email: 'case@example.com',
            landlord_full_name: 'Case Customer',
          },
        },
        user: {
          email: 'admin@example.com',
          full_name: 'Admin User',
        },
      })
    ).toEqual({
      email: 'checkout@example.com',
      name: 'Checkout Customer',
    });
  });

  it('uses the case contact for historical orders without checkout metadata', () => {
    expect(
      deriveCheckoutRecoveryContact({
        order: { metadata: {} },
        caseItem: {
          ...baseCase,
          collected_facts: {
            customer_email: 'historical@example.com',
            customer_name: 'Historical Customer',
          },
        },
        user: {
          email: 'admin@example.com',
          full_name: 'Admin User',
        },
      })
    ).toEqual({
      email: 'historical@example.com',
      name: 'Historical Customer',
    });
  });
});
