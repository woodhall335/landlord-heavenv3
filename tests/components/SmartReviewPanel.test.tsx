/**
 * SmartReviewPanel Component Tests
 *
 * Tests for the Smart Review Panel UI component:
 * - Renders warnings correctly
 * - Handles empty/no warnings
 * - Uses safe language only
 * - Filter functionality works
 *
 * @module tests/components/SmartReviewPanel.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SmartReviewPanel,
  type SmartReviewWarningItem,
  type SmartReviewSummary,
} from '@/components/wizard/SmartReviewPanel';

// =============================================================================
// Test Data
// =============================================================================

const mockBlockerWarning: SmartReviewWarningItem = {
  code: 'FACT_MISSING_PROOF_DEPOSIT_PROTECTION',
  severity: 'blocker',
  title: 'Missing deposit protection proof',
  message: 'No deposit protection certificate was found in your uploads.',
  fields: ['deposit_protected'],
  relatedUploads: [],
  suggestedUserAction: 'Upload your deposit protection certificate to verify compliance.',
};

const mockWarningWarning: SmartReviewWarningItem = {
  code: 'FACT_MISMATCH_RENT_AMOUNT',
  severity: 'warning',
  title: 'Possible rent amount mismatch',
  message: 'The rent amount in your tenancy agreement appears different from what you entered.',
  fields: ['rent_amount'],
  relatedUploads: ['upload-123'],
  suggestedUserAction: 'Please verify the rent amount matches your tenancy agreement.',
  confidence: 0.85,
  comparison: {
    wizardValue: 1200,
    extractedValue: 1100,
    source: 'Tenancy Agreement Page 1',
  },
};

const mockInfoWarning: SmartReviewWarningItem = {
  code: 'EXTRACT_LOW_CONFIDENCE',
  severity: 'info',
  title: 'Low confidence extraction',
  message: 'Some document text could not be read clearly.',
  fields: [],
  relatedUploads: ['upload-456'],
  suggestedUserAction: 'Consider uploading a clearer copy of this document.',
  confidence: 0.4,
};

const mockSummary: SmartReviewSummary = {
  documentsProcessed: 3,
  warningsTotal: 3,
  warningsBlocker: 1,
  warningsWarning: 1,
  warningsInfo: 1,
  ranAt: new Date().toISOString(),
};

const mockEmptySummary: SmartReviewSummary = {
  documentsProcessed: 2,
  warningsTotal: 0,
  warningsBlocker: 0,
  warningsWarning: 0,
  warningsInfo: 0,
  ranAt: new Date().toISOString(),
};

// =============================================================================
// Rendering Tests
// =============================================================================

describe('SmartReviewPanel', () => {
  describe('Basic Rendering', () => {
    it('renders nothing when no warnings and no summary', () => {
      const { container } = render(
        <SmartReviewPanel warnings={[]} summary={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders "all clear" when summary exists but no warnings', () => {
      render(<SmartReviewPanel warnings={[]} summary={mockEmptySummary} />);

      expect(screen.getByText('Document Review')).toBeInTheDocument();
      // Panel shows no issues found when expanded
    });

    it('renders warning count in header', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning, mockWarningWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByText(/2 items? to review/)).toBeInTheDocument();
    });

    it('displays "Last checked" in header', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  describe('Warning Display', () => {
    it('displays warning titles', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning, mockWarningWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByText('Missing deposit protection proof')).toBeInTheDocument();
      expect(screen.getByText('Possible rent amount mismatch')).toBeInTheDocument();
    });

    it('displays warning messages', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
        />
      );

      expect(
        screen.getByText(/No deposit protection certificate was found/)
      ).toBeInTheDocument();
    });

    it('shows severity labels', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning, mockWarningWarning, mockInfoWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByText('Attention Required')).toBeInTheDocument();
      expect(screen.getByText('Possible Issue')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });
  });

  describe('Collapsible Behavior', () => {
    it('starts expanded by default', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByText('Missing deposit protection proof')).toBeInTheDocument();
    });

    it('can start collapsed', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
          defaultCollapsed={true}
        />
      );

      // Header should still be visible
      expect(screen.getByText('Document Review')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('shows filter buttons when warnings exist', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning, mockWarningWarning, mockInfoWarning]}
          summary={mockSummary}
        />
      );

      expect(screen.getByRole('button', { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Attention/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Possible Issues/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Notes/ })).toBeInTheDocument();
    });

    it('filters by severity when button clicked', async () => {
      const user = userEvent.setup();

      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning, mockWarningWarning, mockInfoWarning]}
          summary={mockSummary}
        />
      );

      // Click attention filter
      await user.click(screen.getByRole('button', { name: /Attention/ }));

      // Should only show blocker warning
      expect(screen.getByText('Missing deposit protection proof')).toBeInTheDocument();
      expect(screen.queryByText('Possible rent amount mismatch')).not.toBeInTheDocument();
      expect(screen.queryByText('Low confidence extraction')).not.toBeInTheDocument();
    });
  });

  describe('Comparison Display', () => {
    it('shows comparison when warning has comparison data', async () => {
      const user = userEvent.setup();

      render(
        <SmartReviewPanel
          warnings={[mockWarningWarning]}
          summary={mockSummary}
        />
      );

      // Click to expand the warning
      await user.click(screen.getByText('Possible rent amount mismatch'));

      // Should show comparison values
      expect(screen.getByText('Your Answer')).toBeInTheDocument();
      expect(screen.getByText('Found in Document')).toBeInTheDocument();
      expect(screen.getByText(/£1,200/)).toBeInTheDocument();
      expect(screen.getByText(/£1,100/)).toBeInTheDocument();
    });

    it('shows source when available in comparison', async () => {
      const user = userEvent.setup();

      render(
        <SmartReviewPanel
          warnings={[mockWarningWarning]}
          summary={mockSummary}
        />
      );

      await user.click(screen.getByText('Possible rent amount mismatch'));

      expect(screen.getByText(/Tenancy Agreement Page 1/)).toBeInTheDocument();
    });
  });

  describe('Suggested Action Display', () => {
    it('shows suggested action when warning expanded', async () => {
      const user = userEvent.setup();

      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
        />
      );

      await user.click(screen.getByText('Missing deposit protection proof'));

      expect(screen.getByText('Suggested Action')).toBeInTheDocument();
      expect(
        screen.getByText(/Upload your deposit protection certificate/)
      ).toBeInTheDocument();
    });
  });

  describe('Disclaimer', () => {
    it('shows disclaimer when warnings exist', () => {
      render(
        <SmartReviewPanel
          warnings={[mockBlockerWarning]}
          summary={mockSummary}
        />
      );

      expect(
        screen.getByText(/These are automated checks to help spot possible inconsistencies/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/They may miss details and may not be accurate/)
      ).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Safe Language Tests
// =============================================================================

describe('SmartReviewPanel Safe Language', () => {
  const FORBIDDEN_PHRASES = [
    'invalid',
    'not valid',
    'guarantee',
    'guaranteed',
    'court will',
    'court would',
    'legal advice',
    'must be',
    'you must',
    'illegal',
    'legally',
  ];

  it('disclaimer does not contain forbidden phrases', () => {
    render(
      <SmartReviewPanel
        warnings={[mockBlockerWarning]}
        summary={mockSummary}
      />
    );

    const disclaimerText = screen.getByText(/These are automated checks/).textContent || '';

    for (const phrase of FORBIDDEN_PHRASES) {
      expect(disclaimerText.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it('severity labels use safe terminology', () => {
    render(
      <SmartReviewPanel
        warnings={[mockBlockerWarning, mockWarningWarning, mockInfoWarning]}
        summary={mockSummary}
      />
    );

    // Should use "Attention Required" not "Invalid" or "Error"
    expect(screen.getByText('Attention Required')).toBeInTheDocument();

    // Should use "Possible Issue" not "Invalid" or "Wrong"
    expect(screen.getByText('Possible Issue')).toBeInTheDocument();

    // Should use "Note" not "Error"
    expect(screen.getByText('Note')).toBeInTheDocument();
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('SmartReviewPanel Edge Cases', () => {
  it('handles warnings with missing optional fields', () => {
    const minimalWarning: SmartReviewWarningItem = {
      code: 'TEST_WARNING',
      severity: 'info',
      title: 'Test warning',
      message: 'Test message',
      fields: [],
      relatedUploads: [],
      suggestedUserAction: 'Test action',
      // No confidence, no comparison
    };

    render(
      <SmartReviewPanel
        warnings={[minimalWarning]}
        summary={mockSummary}
      />
    );

    expect(screen.getByText('Test warning')).toBeInTheDocument();
  });

  it('handles null summary gracefully', () => {
    render(
      <SmartReviewPanel
        warnings={[mockBlockerWarning]}
        summary={null}
      />
    );

    expect(screen.getByText('Document Review')).toBeInTheDocument();
    expect(screen.getByText('Missing deposit protection proof')).toBeInTheDocument();
  });

  it('handles ranAt as null in summary', () => {
    const summaryWithNullDate: SmartReviewSummary = {
      ...mockSummary,
      ranAt: null,
    };

    render(
      <SmartReviewPanel
        warnings={[mockBlockerWarning]}
        summary={summaryWithNullDate}
      />
    );

    expect(screen.getByText(/Not yet checked/)).toBeInTheDocument();
  });

  it('handles comparison with null values', async () => {
    const user = userEvent.setup();

    const warningWithNullComparison: SmartReviewWarningItem = {
      ...mockWarningWarning,
      comparison: {
        wizardValue: null,
        extractedValue: null,
        source: undefined,
      },
    };

    render(
      <SmartReviewPanel
        warnings={[warningWithNullComparison]}
        summary={mockSummary}
      />
    );

    await user.click(screen.getByText('Possible rent amount mismatch'));

    // Both wizardValue and extractedValue are null, so "Not provided" appears twice
    expect(screen.getAllByText('Not provided')).toHaveLength(2);
  });
});
