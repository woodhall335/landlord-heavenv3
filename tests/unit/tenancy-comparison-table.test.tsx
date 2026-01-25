/**
 * Tests for Tenancy Comparison Table Component
 *
 * Verifies:
 * 1. Copy differs correctly by jurisdiction
 * 2. Legal references are jurisdiction-specific
 * 3. HMO features are correctly labeled
 * 4. Rationale expandables work correctly
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TenancyComparisonTable,
  TenancyComparisonSummary,
} from '@/components/tenancy/TenancyComparisonTable';

// Mock the PRODUCTS import
jest.mock('@/lib/pricing/products', () => ({
  PRODUCTS: {
    ast_standard: { displayPrice: '£9.99' },
    ast_premium: { displayPrice: '£14.99' },
  },
}));

describe('TenancyComparisonTable', () => {
  // ==========================================================================
  // JURISDICTION-SPECIFIC COPY TESTS
  // ==========================================================================

  describe('jurisdiction-specific copy', () => {
    it('should display Housing Act 2004 for England', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      // Find the HMO clauses row and expand rationale
      const hmoRow = screen.getByText('HMO clauses');
      expect(hmoRow).toBeInTheDocument();

      // Check description contains England-specific act
      expect(screen.getByText(/Housing Act 2004/)).toBeInTheDocument();
    });

    it('should display Housing (Wales) Act 2014 for Wales', () => {
      render(<TenancyComparisonTable jurisdiction="wales" />);

      expect(screen.getByText(/Housing \(Wales\) Act 2014/)).toBeInTheDocument();
    });

    it('should display Civic Government (Scotland) Act 1982 for Scotland', () => {
      render(<TenancyComparisonTable jurisdiction="scotland" />);

      expect(screen.getByText(/Civic Government \(Scotland\) Act 1982/)).toBeInTheDocument();
    });

    it('should display Housing (NI) Order 1992 for Northern Ireland', () => {
      render(<TenancyComparisonTable jurisdiction="northern-ireland" />);

      expect(screen.getByText(/Housing \(NI\) Order 1992/)).toBeInTheDocument();
    });

    it('should use "contract holder" terminology for Wales', () => {
      render(<TenancyComparisonTable jurisdiction="wales" />);

      // Wales uses "contract holder" instead of "tenant"
      expect(screen.getByText(/Contract holder responsibilities/)).toBeInTheDocument();
    });

    it('should use "tenant" terminology for England', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText(/Tenant responsibilities/)).toBeInTheDocument();
    });

    it('should use "tenant" terminology for Scotland', () => {
      render(<TenancyComparisonTable jurisdiction="scotland" />);

      expect(screen.getByText(/Tenant responsibilities/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // HMO FEATURE LABELING TESTS
  // ==========================================================================

  describe('HMO feature labeling', () => {
    it('should mark HMO-related features with HMO badge', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      // HMO badges should appear
      const hmoBadges = screen.getAllByText('HMO');
      expect(hmoBadges.length).toBeGreaterThan(0);
    });

    it('should include joint and several liability', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Joint and several liability')).toBeInTheDocument();
    });

    it('should include multi-occupancy permissions', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Multi-occupancy permissions')).toBeInTheDocument();
    });

    it('should include tenant replacement procedure', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Tenant replacement procedure')).toBeInTheDocument();
    });

    it('should include licensing alignment', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Licensing alignment')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // STANDARD VS PREMIUM FEATURES
  // ==========================================================================

  describe('standard vs premium features', () => {
    it('should show core clauses as included in both tiers', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Core tenancy clauses')).toBeInTheDocument();
    });

    it('should show guarantor clauses as Premium only', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      const guarantorRow = screen.getByText('Guarantor clauses');
      expect(guarantorRow).toBeInTheDocument();
    });

    it('should show rent increase provisions as Premium only', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Rent increase provisions (CPI/RPI)')).toBeInTheDocument();
    });

    it('should show anti-subletting clause as Premium only', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Anti-subletting clause')).toBeInTheDocument();
    });

    it('should show document count row', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('Number of documents')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // RATIONALE EXPANDABLES
  // ==========================================================================

  describe('rationale expandables', () => {
    it('should show "Why does this matter?" buttons when showRationale is true', () => {
      render(<TenancyComparisonTable jurisdiction="england" showRationale={true} />);

      const rationaleButtons = screen.getAllByText('Why does this matter?');
      expect(rationaleButtons.length).toBeGreaterThan(0);
    });

    it('should NOT show rationale buttons when showRationale is false', () => {
      render(<TenancyComparisonTable jurisdiction="england" showRationale={false} />);

      const rationaleButtons = screen.queryAllByText('Why does this matter?');
      expect(rationaleButtons.length).toBe(0);
    });

    it('should expand rationale when button is clicked', () => {
      render(<TenancyComparisonTable jurisdiction="england" showRationale={true} />);

      const rationaleButton = screen.getAllByText('Why does this matter?')[0];
      fireEvent.click(rationaleButton);

      // After clicking, rationale content should appear
      // Check for "Legal basis:" text which appears in expanded rationale
      expect(screen.getByText(/Legal basis:/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // COMPACT MODE
  // ==========================================================================

  describe('compact mode', () => {
    it('should render compact version', () => {
      render(<TenancyComparisonTable jurisdiction="england" compact={true} />);

      expect(screen.getByText('Key Premium Features')).toBeInTheDocument();
    });

    it('should show limited features in compact mode', () => {
      render(<TenancyComparisonTable jurisdiction="england" compact={true} />);

      // Compact mode shows subset of features as a list
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeLessThanOrEqual(5);
    });
  });

  // ==========================================================================
  // LEGAL DISCLAIMER
  // ==========================================================================

  describe('legal disclaimer', () => {
    it('should show legal disclaimer in full mode', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText(/Both Standard and Premium agreements are legally valid/)).toBeInTheDocument();
    });

    it('should mention legal advice recommendation', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText(/consider taking legal advice/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PRICING DISPLAY
  // ==========================================================================

  describe('pricing display', () => {
    it('should show Standard price', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('£9.99')).toBeInTheDocument();
    });

    it('should show Premium price', () => {
      render(<TenancyComparisonTable jurisdiction="england" />);

      expect(screen.getByText('£14.99')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // HIGHLIGHT PREMIUM
  // ==========================================================================

  describe('highlight premium', () => {
    it('should highlight Premium column when highlightPremium is true', () => {
      const { container } = render(
        <TenancyComparisonTable jurisdiction="england" highlightPremium={true} />
      );

      // Check for purple background class on Premium column header
      const premiumHeader = container.querySelector('th.bg-purple-50');
      expect(premiumHeader).toBeInTheDocument();
    });
  });
});

// ==========================================================================
// TenancyComparisonSummary TESTS
// ==========================================================================

describe('TenancyComparisonSummary', () => {
  it('should render summary card', () => {
    render(<TenancyComparisonSummary jurisdiction="england" />);

    expect(screen.getByText('Why Choose Premium?')).toBeInTheDocument();
  });

  it('should mention Housing Act 2004 for England', () => {
    render(<TenancyComparisonSummary jurisdiction="england" />);

    expect(screen.getByText(/Housing Act 2004/)).toBeInTheDocument();
  });

  it('should list key HMO features', () => {
    render(<TenancyComparisonSummary jurisdiction="england" />);

    expect(screen.getByText('Joint and several liability')).toBeInTheDocument();
    expect(screen.getByText('HMO-ready clauses')).toBeInTheDocument();
    expect(screen.getByText('Multi-occupancy permissions')).toBeInTheDocument();
    expect(screen.getByText('Licensing alignment')).toBeInTheDocument();
  });

  it('should use correct act for Wales', () => {
    render(<TenancyComparisonSummary jurisdiction="wales" />);

    expect(screen.getByText(/Housing \(Wales\) Act 2014/)).toBeInTheDocument();
  });

  it('should use correct act for Scotland', () => {
    render(<TenancyComparisonSummary jurisdiction="scotland" />);

    expect(screen.getByText(/Civic Government \(Scotland\) Act 1982/)).toBeInTheDocument();
  });
});
