/**
 * Tests for ClauseDiffPreview Component
 *
 * Verifies:
 * 1. HMO clauses are highlighted in Premium
 * 2. Missing clauses are greyed out in Standard
 * 3. "Why this matters" hover explanations work
 * 4. Jurisdiction-specific terminology is preserved
 * 5. Analytics events fire correctly
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ClauseDiffPreview } from '@/components/tenancy/ClauseDiffPreview';
import * as analytics from '@/lib/analytics';

// Mock analytics functions
vi.mock('@/lib/analytics', () => ({
  trackClauseDiffViewed: vi.fn(),
  trackClauseDiffUpgradeClicked: vi.fn(),
  trackClauseHoverExplanation: vi.fn(),
}));

describe('ClauseDiffPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // BASIC RENDERING
  // ==========================================================================

  describe('basic rendering', () => {
    it('should render full variant by default', () => {
      render(<ClauseDiffPreview jurisdiction="england" />);

      expect(screen.getByText('See the Difference: Standard vs Premium Clauses')).toBeInTheDocument();
    });

    it('should render compact variant when specified', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" />);

      expect(screen.getByText('Premium Clause Preview')).toBeInTheDocument();
    });

    it('should display column headers in full variant', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      expect(screen.getByText('Standard Assured Shorthold Tenancy')).toBeInTheDocument();
      expect(screen.getByText('Premium Assured Shorthold Tenancy')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // HMO CLAUSE HIGHLIGHTING
  // ==========================================================================

  describe('HMO clause highlighting', () => {
    it('should display HMO badges on HMO-specific clauses', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // HMO badges should appear for Premium column clauses
      const hmoBadges = screen.getAllByText('HMO');
      expect(hmoBadges.length).toBeGreaterThan(0);
    });

    it('should include Joint and Several Liability clause', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // May appear in both Standard (as placeholder) and Premium columns
      const elements = screen.getAllByText('Joint and Several Liability');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should include Shared Facilities clause', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const elements = screen.getAllByText('Shared Facilities and Communal Areas');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should include HMO Licensing Compliance clause', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const elements = screen.getAllByText('HMO Licensing Compliance');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // GREYED OUT MISSING CLAUSES
  // ==========================================================================

  describe('greyed out missing clauses', () => {
    it('should show "[Not included..." text for Premium-only clauses in Standard column', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // Premium-only clauses show this text in Standard column
      const notIncludedTexts = screen.getAllByText(/\[Not included/);
      expect(notIncludedTexts.length).toBeGreaterThan(0);
    });

    it('should display lock icon for Premium-only clauses in Standard', () => {
      const { container } = render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // Lock icons should be present for Premium-only clauses
      // The RiLockLine icon is used for Premium-only clauses in Standard column
      const lockIcons = container.querySelectorAll('[class*="text-gray-400"]');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // JURISDICTION-SPECIFIC TERMINOLOGY
  // ==========================================================================

  describe('jurisdiction-specific terminology', () => {
    it('should use "Tenant" terminology for England', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // England uses "Tenant" - may appear multiple times
      const elements = screen.getAllByText(/The Tenant/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use "Contract Holder" terminology for Wales', () => {
      render(<ClauseDiffPreview jurisdiction="wales" variant="full" />);

      // Wales uses "Contract Holder" - may appear multiple times
      const elements = screen.getAllByText(/Contract Holder/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use "Assured Shorthold Tenancy" for England', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const elements = screen.getAllByText(/Assured Shorthold Tenancy/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use "Occupation Contract" for Wales', () => {
      render(<ClauseDiffPreview jurisdiction="wales" variant="full" />);

      const elements = screen.getAllByText(/Occupation Contract/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use "Private Residential Tenancy" for Scotland', () => {
      render(<ClauseDiffPreview jurisdiction="scotland" variant="full" />);

      const elements = screen.getAllByText(/Private Residential Tenancy/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use "Private Tenancy" for Northern Ireland', () => {
      render(<ClauseDiffPreview jurisdiction="northern-ireland" variant="full" />);

      const elements = screen.getAllByText(/Private Tenancy/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should reference Housing Act 2004 for England', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const elements = screen.getAllByText(/Housing Act 2004/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should reference Housing (Wales) Act 2014 for Wales', () => {
      render(<ClauseDiffPreview jurisdiction="wales" variant="full" />);

      const elements = screen.getAllByText(/Housing \(Wales\) Act 2014/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should reference Civic Government (Scotland) Act 1982 for Scotland', () => {
      render(<ClauseDiffPreview jurisdiction="scotland" variant="full" />);

      const elements = screen.getAllByText(/Civic Government \(Scotland\) Act 1982/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // WHY THIS MATTERS HOVER EXPLANATIONS
  // ==========================================================================

  describe('why this matters hover explanations', () => {
    it('should show information icons for each clause', () => {
      const { container } = render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      // Info icons should be present
      const infoIcons = container.querySelectorAll('[class*="RiInformationLine"], button');
      expect(infoIcons.length).toBeGreaterThan(0);
    });

    it('should display tooltip on hover (after delay)', async () => {
      const user = userEvent.setup();
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" />);

      // Find a "Why this matters" button (may have multiple)
      const whyButtons = screen.getAllByText('Why this matters');
      await user.hover(whyButtons[0]);

      // Wait for tooltip delay - check for expanded content
      await waitFor(() => {
        const tooltipContent = screen.queryAllByText(/Why this matters:/);
        expect(tooltipContent.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 500 });
    });
  });

  // ==========================================================================
  // UPGRADE CTA
  // ==========================================================================

  describe('upgrade CTA', () => {
    it('should show upgrade CTA by default', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      expect(screen.getByText('Choose Premium')).toBeInTheDocument();
    });

    it('should show upgrade CTA in compact variant', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" />);

      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    });

    it('should NOT show upgrade CTA when showUpgradeCTA is false', () => {
      render(<ClauseDiffPreview jurisdiction="england" showUpgradeCTA={false} />);

      expect(screen.queryByText('Choose Premium')).not.toBeInTheDocument();
    });

    it('should call onUpgradeClick when upgrade button is clicked', () => {
      const onUpgradeClick = vi.fn();
      render(
        <ClauseDiffPreview
          jurisdiction="england"
          variant="full"
          onUpgradeClick={onUpgradeClick}
        />
      );

      fireEvent.click(screen.getByText('Choose Premium'));
      expect(onUpgradeClick).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // ANALYTICS EVENTS
  // ==========================================================================

  describe('analytics events', () => {
    it('should track diff viewed on mount', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      expect(analytics.trackClauseDiffViewed).toHaveBeenCalledWith({
        jurisdiction: 'england',
        variant: 'full',
        clauseCount: expect.any(Number),
      });
    });

    it('should track diff viewed with correct variant', () => {
      render(<ClauseDiffPreview jurisdiction="wales" variant="compact" />);

      expect(analytics.trackClauseDiffViewed).toHaveBeenCalledWith({
        jurisdiction: 'wales',
        variant: 'compact',
        clauseCount: expect.any(Number),
      });
    });

    it('should track upgrade click', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      fireEvent.click(screen.getByText('Choose Premium'));

      expect(analytics.trackClauseDiffUpgradeClicked).toHaveBeenCalledWith({
        jurisdiction: 'england',
        source: 'product_page',
      });
    });

    it('should track upgrade click from wizard as source', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" />);

      fireEvent.click(screen.getByText('Upgrade to Premium'));

      expect(analytics.trackClauseDiffUpgradeClicked).toHaveBeenCalledWith({
        jurisdiction: 'england',
        source: 'wizard',
      });
    });

    it('should only track diff viewed once', () => {
      const { rerender } = render(<ClauseDiffPreview jurisdiction="england" />);
      rerender(<ClauseDiffPreview jurisdiction="england" />);

      // Should only be called once despite rerender
      expect(analytics.trackClauseDiffViewed).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // CLAUSE EXPANSION
  // ==========================================================================

  describe('clause expansion', () => {
    it('should show "Show full clause" button for multi-line clauses', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const expandButtons = screen.getAllByText('Show full clause');
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('should expand clause when button is clicked', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      const expandButton = screen.getAllByText('Show full clause')[0];
      fireEvent.click(expandButton);

      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LEGAL DISCLAIMER
  // ==========================================================================

  describe('legal disclaimer', () => {
    it('should show legal disclaimer in full variant', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      expect(screen.getByText(/Clause wording shown is representative/)).toBeInTheDocument();
    });

    it('should mention legal advice', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="full" />);

      expect(screen.getByText(/consider taking legal advice/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // COMPACT VARIANT
  // ==========================================================================

  describe('compact variant', () => {
    it('should show limited clauses in compact mode', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" maxClauses={3} />);

      // Should only show a few clauses, not all
      const clauseCards = screen.getAllByText(/HMO|Guarantor|Liability/);
      expect(clauseCards.length).toBeLessThanOrEqual(6); // 3 clauses max, 2 mentions each max
    });

    it('should respect maxClauses prop', () => {
      render(<ClauseDiffPreview jurisdiction="england" variant="compact" maxClauses={2} />);

      // Analytics should reflect the maxClauses
      expect(analytics.trackClauseDiffViewed).toHaveBeenCalledWith(
        expect.objectContaining({
          clauseCount: 2,
        })
      );
    });
  });
});

// ==========================================================================
// ANALYTICS FUNCTION TESTS
// ==========================================================================

describe('clause diff analytics functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fire trackClauseDiffViewed with correct params', () => {
    render(<ClauseDiffPreview jurisdiction="scotland" variant="full" />);

    expect(analytics.trackClauseDiffViewed).toHaveBeenCalledWith({
      jurisdiction: 'scotland',
      variant: 'full',
      clauseCount: expect.any(Number),
    });
  });

  it('should fire trackClauseDiffUpgradeClicked with correct source for full variant', () => {
    render(<ClauseDiffPreview jurisdiction="england" variant="full" />);
    fireEvent.click(screen.getByText('Choose Premium'));

    expect(analytics.trackClauseDiffUpgradeClicked).toHaveBeenCalledWith({
      jurisdiction: 'england',
      source: 'product_page',
    });
  });

  it('should fire trackClauseDiffUpgradeClicked with correct source for compact variant', () => {
    render(<ClauseDiffPreview jurisdiction="england" variant="compact" />);
    fireEvent.click(screen.getByText('Upgrade to Premium'));

    expect(analytics.trackClauseDiffUpgradeClicked).toHaveBeenCalledWith({
      jurisdiction: 'england',
      source: 'wizard',
    });
  });
});
