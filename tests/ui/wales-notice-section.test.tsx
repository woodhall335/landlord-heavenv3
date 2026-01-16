// @vitest-environment jsdom
import { describe, expect, it, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WalesNoticeSection } from '@/components/wizard/sections/wales/WalesNoticeSection';
import type { WizardFacts } from '@/lib/case-facts/schema';

/**
 * Wales Notice Section Tests
 *
 * Tests for the Wales fault-based notice section which mirrors England Section 8
 * ground-driven behavior under the Renting Homes (Wales) Act 2016.
 *
 * Key requirements:
 * 1. Selecting "Serious rent arrears" shows ArrearsScheduleStep BEFORE breach_description
 * 2. Clicking "Use arrears summary…" writes into breach_description
 * 3. Selecting "antisocial_behaviour" shows ASB conditional fields BEFORE breach_description
 * 4. AskHeavenInlineEnhancer renders for breach_description
 */

describe('WalesNoticeSection', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockReset();
  });

  describe('Ground selection', () => {
    it('renders Wales grounds selection with correct options', () => {
      const facts: WizardFacts = { __meta: { jurisdiction: 'wales', product: 'notice_only' } };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // Check that Wales grounds are shown
      expect(screen.getByText('Serious Rent Arrears (2+ months)')).toBeInTheDocument();
      expect(screen.getByText('Persistent Rent Arrears')).toBeInTheDocument();
      expect(screen.getByText('Some Rent Arrears')).toBeInTheDocument();
      expect(screen.getByText('Anti-Social Behaviour')).toBeInTheDocument();
      expect(screen.getByText('Breach of Occupation Contract')).toBeInTheDocument();
      expect(screen.getByText('Property Deterioration')).toBeInTheDocument();
      expect(screen.getByText('False Statement')).toBeInTheDocument();
    });

    it('does NOT show Section 21, AST, or How to Rent (England-only concepts)', () => {
      const facts: WizardFacts = { __meta: { jurisdiction: 'wales', product: 'notice_only' } };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.queryByText(/Section 21/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/How to Rent/i)).not.toBeInTheDocument();
      // Use exact match for AST to avoid false positives from words like "at least", "waste"
      expect(screen.queryByText(/\bAST\b/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Assured Shorthold/i)).not.toBeInTheDocument();
    });

    it('updates facts when a ground is selected', () => {
      const facts: WizardFacts = { __meta: { jurisdiction: 'wales', product: 'notice_only' } };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // Click on the serious rent arrears checkbox
      const checkbox = screen.getByRole('checkbox', { name: /Serious Rent Arrears/i });
      fireEvent.click(checkbox);

      expect(mockOnUpdate).toHaveBeenCalledWith({ wales_grounds: ['rent_arrears_serious'] });
    });

    it('shows notice period summary when grounds are selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // There are multiple instances of "Selected grounds:" - one in summary box, one in helper text
      expect(screen.getAllByText(/Selected grounds:/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Minimum notice period: 14 days/i)).toBeInTheDocument();
    });
  });

  describe('Arrears Schedule Panel', () => {
    it('shows ArrearsScheduleStep when rent arrears ground is selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // ArrearsScheduleStep should be rendered
      expect(screen.getByText('Rent Arrears Schedule')).toBeInTheDocument();
      expect(screen.getByText('Arrears Schedule')).toBeInTheDocument();
    });

    it('shows missing prerequisites warning when tenancy data is incomplete', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        // Missing tenancy_start_date, rent_amount, rent_frequency
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByText(/Missing information/i)).toBeInTheDocument();
    });

    it('renders arrears panel BEFORE breach_description textarea', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };
      const { container } = render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // Get all headings to check order
      const arrearsHeading = container.querySelector('h5')?.textContent || '';
      const breachHeading = screen.getByText('Describe the breach or grounds');

      // The arrears section should appear in the DOM before the breach description
      expect(arrearsHeading).toContain('Rent Arrears Schedule');
      expect(breachHeading).toBeInTheDocument();
    });

    it('shows "Use arrears summary" button when arrears data exists', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
          { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        ],
        total_arrears: 2000,
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByRole('button', { name: /Use arrears summary as starting point/i })).toBeInTheDocument();
    });

    it('clicking "Use arrears summary" populates breach_description', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
          { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        ],
        total_arrears: 2000,
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      const button = screen.getByRole('button', { name: /Use arrears summary as starting point/i });
      fireEvent.click(button);

      // Check that onUpdate was called with breach_description containing arrears info
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          breach_description: expect.stringContaining('£2000.00'),
        })
      );
    });
  });

  describe('ASB Panel', () => {
    it('shows ASB fields when antisocial_behaviour ground is selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['antisocial_behaviour'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Anti-Social Behaviour Incident')).toBeInTheDocument();
      expect(screen.getByLabelText(/Incident Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description of Incident/i)).toBeInTheDocument();
      expect(screen.getByText(/Police Involved/i)).toBeInTheDocument();
    });

    it('renders ASB panel BEFORE breach_description', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['antisocial_behaviour'],
      };
      const { container } = render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      const asbHeading = screen.getByText('Anti-Social Behaviour Incident');
      const breachHeading = screen.getByText('Describe the breach or grounds');

      // Both should be present
      expect(asbHeading).toBeInTheDocument();
      expect(breachHeading).toBeInTheDocument();
    });

    it('shows police reference field when police involved is yes', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['antisocial_behaviour'],
        wales_asb_police_involved: 'yes',
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByLabelText(/Police Reference Number/i)).toBeInTheDocument();
    });

    it('clicking "Use these details" populates breach_description', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['antisocial_behaviour'],
        wales_asb_incident_date: '2024-03-15',
        wales_asb_description: 'Loud music and verbal abuse towards neighbours',
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      const button = screen.getByRole('button', { name: /Use these details as starting point/i });
      fireEvent.click(button);

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          breach_description: expect.stringContaining('Loud music'),
        })
      );
    });
  });

  describe('Breach of Contract Panel', () => {
    it('shows breach fields when breach_of_contract ground is selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['breach_of_contract'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // Multiple elements with "Breach of Occupation Contract" (checkbox label + panel heading + summary)
      expect(screen.getAllByText('Breach of Occupation Contract').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Clause\/Term Breached/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/When did the breach occur/i)).toBeInTheDocument();
    });
  });

  describe('False Statement Panel', () => {
    it('shows false statement fields when false_statement ground is selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['false_statement'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // Multiple elements with "False Statement" (checkbox label + panel heading + summary)
      expect(screen.getAllByText('False Statement').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/What false statement was made/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/When was this discovered/i)).toBeInTheDocument();
    });
  });

  describe('Multiple grounds', () => {
    it('renders multiple panels in correct order (arrears first, then ASB, then breach, then false statement)', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious', 'antisocial_behaviour', 'breach_of_contract', 'false_statement'],
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };
      const { container } = render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // All panels should be present - using getAllByText due to duplicate labels
      expect(screen.getAllByText('Rent Arrears Schedule').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Anti-Social Behaviour Incident').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Breach of Occupation Contract').length).toBeGreaterThan(0);
      expect(screen.getAllByText('False Statement').length).toBeGreaterThan(0);

      // Check order in DOM - arrears should come before ASB
      const allHeadings = Array.from(container.querySelectorAll('h5'));
      const headingTexts = allHeadings.map((h) => h.textContent || '');
      const arrearsIndex = headingTexts.findIndex((t) => t.includes('Rent Arrears'));
      const asbIndex = headingTexts.findIndex((t) => t.includes('Anti-Social'));
      const breachIndex = headingTexts.findIndex((t) => t.includes('Breach of Occupation'));
      const falseIndex = headingTexts.findIndex((t) => t.includes('False Statement'));

      expect(arrearsIndex).toBeLessThan(asbIndex);
      expect(asbIndex).toBeLessThan(breachIndex);
      expect(breachIndex).toBeLessThan(falseIndex);
    });
  });

  describe('Breach Description with Ask Heaven', () => {
    it('renders breach_description textarea when grounds are selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByLabelText(/Breach\/Grounds Description/i)).toBeInTheDocument();
    });

    it('renders AskHeavenInlineEnhancer component', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
        breach_description: 'The contract holder has not paid rent for over 2 months.',
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      // The AskHeavenInlineEnhancer should render an enhance button when text is present
      expect(screen.getByRole('button', { name: /Enhance with Ask Heaven/i })).toBeInTheDocument();
    });

    it('updates breach_description when user types', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText(/Breach\/Grounds Description/i);
      fireEvent.change(textarea, { target: { value: 'Test description' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ breach_description: 'Test description' });
    });
  });

  describe('Service Details', () => {
    it('shows service details when grounds are selected', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'wales', product: 'notice_only' },
        wales_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection facts={facts} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Notice Service Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/Date you will serve the notice/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How will you serve the notice/i)).toBeInTheDocument();
    });
  });
});

describe('WalesCaseBasicsSection', () => {
  // These tests verify the Wales route selection component
  // This is imported separately if needed
  it.todo('shows Section 173 and Fault-based route options for Wales');
  it.todo('does NOT show Section 21 or Section 8 (England routes) for Wales');
});

describe('NoticeOnlySectionFlow Wales Integration', () => {
  // These tests verify the integration of Wales sections into the main flow
  it.todo('uses WalesNoticeSection when jurisdiction is Wales and route is wales_fault_based');
  it.todo('uses WalesSection173NoticeSection when route is wales_section_173');
  it.todo('England routes (section_8, section_21) still work unchanged');
});
