/**
 * Wales Notice Section - Component Tests
 *
 * Tests for WalesNoticeSection component including:
 * 1. Ground selection UI
 * 2. Conditional ArrearsScheduleStep rendering for arrears grounds
 * 3. Conditional ASB, breach, false statement panels
 * 4. "Use details as starting point" button functionality
 * 5. AskHeavenInlineEnhancer rendering
 * 6. Notice period calculation based on selected grounds
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalesNoticeSection } from '@/components/wizard/sections/wales/WalesNoticeSection';
import type { WizardFacts } from '@/lib/case-facts/schema';

// Mock the ArrearsScheduleStep component
vi.mock('@/components/wizard/ArrearsScheduleStep', () => ({
  ArrearsScheduleStep: ({ facts, onUpdate }: any) => (
    <div data-testid="arrears-schedule-step">
      <span>ArrearsScheduleStep Mock</span>
      <button
        onClick={() => onUpdate({
          issues: {
            rent_arrears: {
              arrears_items: [
                { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
                { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
              ],
              total_arrears: 2000,
              arrears_at_notice_date: 2000,
              has_arrears: true,
            },
          },
        })}
        data-testid="mock-update-arrears"
      >
        Update Arrears
      </button>
    </div>
  ),
}));

// Mock the AskHeavenInlineEnhancer component
vi.mock('@/components/wizard/AskHeavenInlineEnhancer', () => ({
  AskHeavenInlineEnhancer: ({ questionId, answer, onApply }: any) => (
    <div data-testid="ask-heaven-enhancer">
      <span>AskHeavenInlineEnhancer Mock - {questionId}</span>
      <button
        onClick={() => onApply('Enhanced text')}
        data-testid="mock-apply-enhancement"
      >
        Apply Enhancement
      </button>
    </div>
  ),
}));

// Mock computeArrears
vi.mock('@/lib/arrears-engine', () => ({
  computeArrears: (items: any[], frequency: string, amount: number) => {
    const totalArrears = items.reduce((sum: number, item: any) => sum + (item.amount_owed || 0), 0);
    return {
      arrears_items: items,
      total_arrears: totalArrears,
      arrears_at_notice_date: totalArrears,
      arrears_in_months: totalArrears / amount,
      periods_with_arrears: items.filter((i: any) => i.amount_owed > 0).length,
      periods_fully_unpaid: items.filter((i: any) => i.rent_paid === 0).length,
      periods_partially_paid: items.filter((i: any) => i.rent_paid > 0 && i.rent_paid < i.rent_due).length,
      periods_fully_paid: items.filter((i: any) => i.rent_paid >= i.rent_due).length,
      is_authoritative: true,
    };
  },
}));

describe('WalesNoticeSection', () => {
  const defaultProps = {
    facts: {
      __meta: { product: 'notice_only', jurisdiction: 'wales' },
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
    } as unknown as WizardFacts,
    jurisdiction: 'wales' as const,
    onUpdate: vi.fn(),
    mode: 'notice_only' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Ground Selection', () => {
    it('renders all Wales fault-based grounds', () => {
      render(<WalesNoticeSection {...defaultProps} />);

      expect(screen.getByText('Serious rent arrears (8+ weeks)')).toBeInTheDocument();
      expect(screen.getByText('Some rent arrears')).toBeInTheDocument();
      expect(screen.getByText('Anti-social behaviour')).toBeInTheDocument();
      expect(screen.getByText('Breach of occupation contract')).toBeInTheDocument();
      expect(screen.getByText('False statement')).toBeInTheDocument();
    });

    it('allows selecting grounds', async () => {
      const onUpdate = vi.fn();
      render(<WalesNoticeSection {...defaultProps} onUpdate={onUpdate} />);

      const seriousArrearsCheckbox = screen.getByRole('checkbox', { name: /serious rent arrears/i });
      fireEvent.click(seriousArrearsCheckbox);

      expect(onUpdate).toHaveBeenCalledWith({
        wales_fault_grounds: ['rent_arrears_serious'],
      });
    });

    it('displays correct notice period for selected grounds', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByText(/Minimum notice period: 14 days/)).toBeInTheDocument();
    });

    it('calculates maximum notice period when multiple grounds selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious', 'rent_arrears_other'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      // rent_arrears_serious = 14 days, rent_arrears_other = 30 days -> max = 30
      expect(screen.getByText(/Minimum notice period: 30 days/)).toBeInTheDocument();
    });
  });

  describe('Conditional Arrears Panel', () => {
    it('renders ArrearsScheduleStep when rent_arrears_serious is selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByTestId('arrears-schedule-step')).toBeInTheDocument();
      expect(screen.getByText('Section 157 - Serious Rent Arrears')).toBeInTheDocument();
    });

    it('renders ArrearsScheduleStep when rent_arrears_other is selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_other'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByTestId('arrears-schedule-step')).toBeInTheDocument();
      expect(screen.getByText('Section 159 - Rent Arrears')).toBeInTheDocument();
    });

    it('does not render ArrearsScheduleStep when no arrears ground selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['antisocial_behaviour'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.queryByTestId('arrears-schedule-step')).not.toBeInTheDocument();
    });

    it('updates facts when arrears are changed', async () => {
      const onUpdate = vi.fn();
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} onUpdate={onUpdate} />);

      // Click the mock update button
      fireEvent.click(screen.getByTestId('mock-update-arrears'));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
          arrears_items: expect.any(Array),
          total_arrears: 2000,
          arrears_at_notice_date: 2000,
        }));
      });
    });
  });

  describe('Conditional ASB Panel', () => {
    it('renders ASB details panel when antisocial_behaviour is selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['antisocial_behaviour'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByText('Section 161 - Anti-Social Behaviour Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/incident date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description of behaviour/i)).toBeInTheDocument();
      expect(screen.getByText(/were police involved/i)).toBeInTheDocument();
    });

    it('shows police reference field when police involvement is yes', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['antisocial_behaviour'],
        wales_asb_police_involved: true,
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByLabelText(/police reference number/i)).toBeInTheDocument();
    });

    it('does not render ASB panel when not selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.queryByText('Section 161 - Anti-Social Behaviour Details')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Breach of Contract Panel', () => {
    it('renders breach details panel when breach_of_contract is selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['breach_of_contract'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByText('Section 162 - Breach of Occupation Contract Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/clause\/term breached/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date\(s\) or period of breach/i)).toBeInTheDocument();
    });
  });

  describe('Conditional False Statement Panel', () => {
    it('renders false statement panel when false_statement is selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['false_statement'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByText('Section 162 - False Statement Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/what false statement was made/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/when was this discovered/i)).toBeInTheDocument();
    });
  });

  describe('Use Details as Starting Point', () => {
    it('prepopulates breach_description when Use arrears summary button is clicked', async () => {
      const onUpdate = vi.fn();
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
          { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        ],
        total_arrears: 2000,
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} onUpdate={onUpdate} />);

      const useButton = screen.getByRole('button', { name: /use arrears summary as starting point/i });
      fireEvent.click(useButton);

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
          breach_description: expect.stringContaining('RENT ARREARS'),
        }));
      });
    });

    it('appends to existing breach_description when not empty', async () => {
      const onUpdate = vi.fn();
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['antisocial_behaviour'],
        breach_description: 'Existing description.',
        wales_asb_incident_date: '2024-01-15',
        wales_asb_description: 'Loud music after midnight',
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} onUpdate={onUpdate} />);

      const useButton = screen.getByRole('button', { name: /use these details as starting point/i });
      fireEvent.click(useButton);

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
          breach_description: expect.stringContaining('Existing description.'),
        }));
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
          breach_description: expect.stringContaining('ANTI-SOCIAL BEHAVIOUR'),
        }));
      });
    });
  });

  describe('Breach Description Field', () => {
    it('renders breach_description textarea when grounds are selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByLabelText(/describe the breach or grounds/i)).toBeInTheDocument();
    });

    it('does not render breach_description when no grounds selected', () => {
      render(<WalesNoticeSection {...defaultProps} />);

      expect(screen.queryByLabelText(/describe the breach or grounds/i)).not.toBeInTheDocument();
    });

    it('updates breach_description on change', () => {
      const onUpdate = vi.fn();
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} onUpdate={onUpdate} />);

      const textarea = screen.getByLabelText(/describe the breach or grounds/i);
      fireEvent.change(textarea, { target: { value: 'Test description' } });

      expect(onUpdate).toHaveBeenCalledWith({ breach_description: 'Test description' });
    });
  });

  describe('AskHeavenInlineEnhancer', () => {
    it('renders AskHeavenInlineEnhancer for breach_description when grounds selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
        breach_description: 'Some existing text for the description',
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByTestId('ask-heaven-enhancer')).toBeInTheDocument();
      expect(screen.getByText(/AskHeavenInlineEnhancer Mock - breach_description/)).toBeInTheDocument();
    });

    it('does not render AskHeavenInlineEnhancer when no grounds selected', () => {
      render(<WalesNoticeSection {...defaultProps} />);

      expect(screen.queryByTestId('ask-heaven-enhancer')).not.toBeInTheDocument();
    });

    it('applies enhancement when apply button is clicked', async () => {
      const onUpdate = vi.fn();
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
        breach_description: 'Some text',
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} onUpdate={onUpdate} />);

      fireEvent.click(screen.getByTestId('mock-apply-enhancement'));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({ breach_description: 'Enhanced text' });
      });
    });
  });

  describe('Service Details', () => {
    it('renders service details fields when grounds are selected', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByLabelText(/date notice will be served/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/how will the notice be served/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notice expiry date/i)).toBeInTheDocument();
    });

    it('shows suggested expiry date button', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
        notice_service_date: '2024-01-01',
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.getByText(/use suggested/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Grounds - Panel Order', () => {
    it('renders panels in deterministic order: arrears, ASB, breach, false statement', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: [
          'false_statement',
          'antisocial_behaviour',
          'rent_arrears_serious',
          'breach_of_contract',
        ],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      const panels = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent);

      // Should appear in this order: arrears first, then ASB, then breach, then false statement
      const arrearsIndex = panels.findIndex(p => p?.includes('Rent Arrears'));
      const asbIndex = panels.findIndex(p => p?.includes('Anti-Social Behaviour'));
      const breachIndex = panels.findIndex(p => p?.includes('Breach of Occupation Contract'));
      const falseStmtIndex = panels.findIndex(p => p?.includes('False Statement'));

      expect(arrearsIndex).toBeLessThan(asbIndex);
      expect(asbIndex).toBeLessThan(breachIndex);
      expect(breachIndex).toBeLessThan(falseStmtIndex);
    });
  });

  describe('Wales-specific Legal References', () => {
    it('displays Renting Homes (Wales) Act 2016 reference', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      // The component should reference Welsh law - look for the specific arrears panel header
      expect(screen.getByText('Section 157 - Serious Rent Arrears')).toBeInTheDocument();
    });
  });

  describe('No England Content', () => {
    it('does not contain Section 21 references', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.queryByText(/section 21/i)).not.toBeInTheDocument();
    });

    it('does not contain AST references', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.queryByText(/assured shorthold tenancy/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/AST/)).not.toBeInTheDocument();
    });

    it('does not contain How to Rent references', () => {
      const facts = {
        ...defaultProps.facts,
        wales_fault_grounds: ['rent_arrears_serious'],
      };
      render(<WalesNoticeSection {...defaultProps} facts={facts} />);

      expect(screen.queryByText(/how to rent/i)).not.toBeInTheDocument();
    });
  });
});

describe('WalesCaseBasicsSection', () => {
  // Test WalesCaseBasicsSection separately if needed
  it.todo('renders Wales-specific route options');
  it.todo('does not show Section 8/21 options for Wales');
});
