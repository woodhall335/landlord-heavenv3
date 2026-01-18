// @vitest-environment jsdom
/**
 * Jurisdiction Gating Tests - Scotland and Wales Notice Only Flows
 *
 * These tests ensure HARD gating prevents cross-jurisdiction terminology leakage:
 *
 * SCOTLAND MUST NOT SHOW:
 * - "Section 21", "s21"
 * - "Assured Shorthold Tenancy"
 * - "fixed term end date"
 * - "break clause"
 * - "How to Rent"
 * - "2 months notice" logic
 *
 * SCOTLAND MUST SHOW:
 * - "Private Residential Tenancy (PRT)"
 * - "First-tier Tribunal (Housing and Property Chamber)"
 * - Discretionary grounds language
 * - 6-month rule
 *
 * WALES MUST NOT SHOW:
 * - "Assured Shorthold Tenancy" (unless legacy migration)
 * - "Section 21"
 * - "How to Rent" guide
 *
 * WALES MUST SHOW:
 * - "Occupation contract" terminology
 * - "Contract holder" (not "tenant")
 * - Section 173 / fault-based routes
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

// Import the components we're testing
import { TenancySection } from '@/components/wizard/sections/eviction/TenancySection';
import { OccupationContractSection } from '@/components/wizard/sections/wales/OccupationContractSection';

// Mock the minimal facts object
const createMockFacts = (overrides: Record<string, any> = {}) => ({
  __meta: { product: 'notice_only', jurisdiction: 'scotland' },
  ...overrides,
});

describe('Scotland Tenancy Section - Jurisdiction Gating', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockReset();
  });

  describe('Tenancy Type Options', () => {
    it('shows exactly 4 Scottish tenancy type options', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      const select = screen.getByRole('combobox', { name: /tenancy type/i });
      const options = within(select).getAllByRole('option');

      // First option is placeholder "Select tenancy type...", then 4 Scottish types
      expect(options.length).toBe(5);
    });

    it('shows Private Residential Tenancy (PRT) option', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Private Residential Tenancy \(PRT\)/i)).toBeTruthy();
    });

    it('shows Short Assured Tenancy (SAT) option', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Short Assured Tenancy \(SAT\)/i)).toBeTruthy();
    });

    it('shows Assured Tenancy (AT) option for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Assured Tenancy \(AT\)/i)).toBeTruthy();
    });

    it('shows Regulated Tenancy option for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Regulated Tenancy \(pre-1989\)/i)).toBeTruthy();
    });

    it('does NOT show "Assured Shorthold Tenancy" for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      // Should NOT find any AST references
      expect(screen.queryByText(/Assured Shorthold Tenancy/i)).toBeNull();
    });
  });

  describe('Fixed Term / Break Clause Questions', () => {
    it('does NOT show "Fixed term end date" for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/Fixed term end date/i)).toBeNull();
    });

    it('does NOT show "break clause" for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/break clause/i)).toBeNull();
    });

    it('does NOT show Section 21 references for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/Section 21/i)).toBeNull();
      expect(screen.queryByText(/s21/i)).toBeNull();
    });
  });

  describe('How to Rent Guide', () => {
    it('does NOT reference "How to Rent" for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/How to Rent/i)).toBeNull();
    });

    it('references "6-month rule" for Scotland instead of How to Rent', () => {
      render(
        <TenancySection
          facts={createMockFacts()}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/6-month rule/i)).toBeTruthy();
    });
  });

  describe('Scotland PRT Info Banner', () => {
    it('shows First-tier Tribunal reference when PRT is selected', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      // First-tier Tribunal appears in the PRT info banner
      expect(screen.getAllByText(/First-tier Tribunal/i).length).toBeGreaterThan(0);
    });

    it('shows discretionary grounds language when PRT is selected', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getAllByText(/discretionary/i).length).toBeGreaterThan(0);
    });
  });

  describe('Rent Arrears Info', () => {
    it('shows Scotland-specific rent arrears info (3 consecutive periods)', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/3 or more consecutive rent/i)).toBeTruthy();
    });

    it('does NOT show "2-month threshold" for Scotland', () => {
      render(
        <TenancySection
          facts={createMockFacts({ tenancy_type: 'prt' })}
          jurisdiction="scotland"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/2-month threshold/i)).toBeNull();
    });
  });
});

describe('England Tenancy Section - Correct Terminology', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockReset();
  });

  it('shows Assured Shorthold Tenancy options for England', () => {
    render(
      <TenancySection
        facts={createMockFacts({ __meta: { jurisdiction: 'england' } })}
        jurisdiction="england"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/Assured Shorthold Tenancy \(Fixed term\)/i)).toBeTruthy();
    expect(screen.getByText(/Assured Shorthold Tenancy \(Periodic\/Rolling\)/i)).toBeTruthy();
  });

  it('shows fixed term end date for England AST Fixed', () => {
    render(
      <TenancySection
        facts={createMockFacts({
          __meta: { jurisdiction: 'england' },
          tenancy_type: 'ast_fixed',
        })}
        jurisdiction="england"
        onUpdate={mockOnUpdate}
      />
    );

    // Fixed term end date appears as a label when AST Fixed is selected
    expect(screen.getAllByText(/Fixed term end date/i).length).toBeGreaterThan(0);
  });

  it('references How to Rent guide for England', () => {
    render(
      <TenancySection
        facts={createMockFacts({ __meta: { jurisdiction: 'england' } })}
        jurisdiction="england"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/How to Rent/i)).toBeTruthy();
  });

  it('does NOT show PRT option for England', () => {
    render(
      <TenancySection
        facts={createMockFacts({ __meta: { jurisdiction: 'england' } })}
        jurisdiction="england"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByText(/Private Residential Tenancy \(PRT\)/i)).toBeNull();
  });
});

describe('Wales Occupation Contract Section - Correct Terminology', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockReset();
  });

  it('uses "occupation contract" terminology', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/Occupation contract start date/i)).toBeTruthy();
  });

  it('references Renting Homes (Wales) Act 2016', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    // Renting Homes Act reference appears in the component
    expect(screen.getAllByText(/Renting Homes \(Wales\) Act 2016/i).length).toBeGreaterThan(0);
  });

  it('uses "contract holder" terminology', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/contract holder/i)).toBeTruthy();
  });

  it('shows Standard Contract options for Wales', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/Standard Contract \(Periodic\)/i)).toBeTruthy();
    expect(screen.getByText(/Standard Contract \(Fixed term\)/i)).toBeTruthy();
  });

  it('does NOT show "Assured Shorthold Tenancy" for Wales', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByText(/Assured Shorthold Tenancy/i)).toBeNull();
  });

  it('does NOT reference "How to Rent" guide for Wales', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({ __meta: { jurisdiction: 'wales' } })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByText(/How to Rent/i)).toBeNull();
  });

  it('references Section 173 for Wales fixed term contracts', () => {
    render(
      <OccupationContractSection
        facts={createMockFacts({
          __meta: { jurisdiction: 'wales' },
          tenancy_type: 'standard_fixed',
        })}
        jurisdiction="wales"
        onUpdate={mockOnUpdate}
      />
    );

    // Section 173 appears in the fixed term info box
    expect(screen.getAllByText(/Section 173/i).length).toBeGreaterThan(0);
  });
});

describe('Cross-Jurisdiction Guardrails', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockReset();
  });

  it('Scotland does not leak England terminology', () => {
    const { container } = render(
      <TenancySection
        facts={createMockFacts({ tenancy_type: 'prt' })}
        jurisdiction="scotland"
        onUpdate={mockOnUpdate}
      />
    );

    const html = container.innerHTML.toLowerCase();

    // These England-specific terms should NEVER appear for Scotland
    expect(html).not.toContain('section 21');
    expect(html).not.toContain('assured shorthold');
    expect(html).not.toContain('how to rent');
    // Note: "fixed term" might appear in PRT info context, so we check specifically for the field
    expect(screen.queryByLabelText(/fixed term end date/i)).toBeNull();
  });

  it('England does not leak Scotland terminology', () => {
    const { container } = render(
      <TenancySection
        facts={createMockFacts({
          __meta: { jurisdiction: 'england' },
          tenancy_type: 'ast_fixed',
        })}
        jurisdiction="england"
        onUpdate={mockOnUpdate}
      />
    );

    const html = container.innerHTML.toLowerCase();

    // These Scotland-specific terms should NEVER appear for England
    expect(html).not.toContain('first-tier tribunal');
    expect(html).not.toContain('notice to leave');
    expect(html).not.toContain('6-month rule');
    // PRT shouldn't appear in tenancy options
    expect(screen.queryByText(/Private Residential Tenancy \(PRT\)/i)).toBeNull();
  });
});
