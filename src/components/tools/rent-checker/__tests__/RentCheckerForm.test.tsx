/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RentCheckerInput } from '@/lib/section13';
import { RentCheckerForm } from '../RentCheckerForm';

function buildInput(overrides: Partial<RentCheckerInput> = {}): RentCheckerInput {
  return {
    sessionId: 'test-session',
    userType: 'landlord',
    postcode: 'SW1A 1AA',
    bedrooms: 2,
    propertyType: 'flat',
    furnishedStatus: 'furnished',
    currentRent: 1000,
    rentFrequency: 'monthly',
    proposedRent: 1200,
    tenancyStartDate: '2024-01-01',
    lastRentIncreaseDate: '2025-01-01',
    desiredIncreaseStartDate: '2026-08-01',
    propertyCondition: 'good',
    billsIncluded: false,
    comparableEvidenceAvailable: 'yes',
    tenantAlreadyObjected: false,
    ...overrides,
  };
}

describe('RentCheckerForm', () => {
  it('starts on property basics and does not render a tenant choice', () => {
    render(
      <RentCheckerForm
        step="property"
        input={buildInput()}
        errors={{}}
        loading={false}
        onChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('1. Property basics')).toBeInTheDocument();
    expect(screen.getByLabelText('Proposed rent')).toBeInTheDocument();
    expect(screen.queryByText('I am a tenant')).not.toBeInTheDocument();
  });
});
