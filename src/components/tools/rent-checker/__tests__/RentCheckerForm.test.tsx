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
    propertySubtype: 'purpose_built_flat',
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
    expect(screen.getByLabelText('Property type')).toBeInTheDocument();
    expect(screen.getByLabelText('Property subtype')).toBeInTheDocument();
    expect(screen.queryByLabelText('Tenancy start date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Last rent increase date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Desired increase start date')).not.toBeInTheDocument();
    expect(screen.queryByText('I am a tenant')).not.toBeInTheDocument();
  });

  it('keeps the condition step focused on condition and bills', () => {
    render(
      <RentCheckerForm
        step="condition"
        input={buildInput()}
        errors={{}}
        loading={false}
        onChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Property condition')).toBeInTheDocument();
    expect(screen.getByText(/Property condition affects/)).toBeInTheDocument();
    expect(screen.getByLabelText('Any bills included in rent?')).toBeInTheDocument();
    expect(screen.queryByLabelText('Comparable evidence available?')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Has the tenant already objected?')).not.toBeInTheDocument();
  });
});
