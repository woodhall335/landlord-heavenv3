/**
 * @vitest-environment jsdom
 *
 * Section21ComplianceSection Tests
 *
 * Tests that the N5B-required questions are rendered and functional:
 * - Q9a-Q9g: AST verification toggles
 * - Q15: EPC provided date
 * - Q16-Q17: Gas safety dates (conditional on gas appliances)
 * - Q18: How to Rent date and method
 * - Q19/Q19b: Tenant Fees Act questions
 * - Q20: Paper determination consent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Section21ComplianceSection } from '../Section21ComplianceSection';
import type { WizardFacts } from '@/lib/case-facts/schema';

// Mock the ValidationContext with all required methods
const mockValidationContext = {
  errors: new Map(),
  setFieldError: vi.fn(),
  clearFieldError: vi.fn(),
  clearSectionErrors: vi.fn(),
  clearAllErrors: vi.fn(),
  hasErrors: false,
  hasFieldError: () => false,
  getFieldError: () => undefined,
  getSectionErrors: () => [],
  uploadsInProgress: false,
  setUploadsInProgress: vi.fn(),
};

vi.mock('@/components/wizard/ValidationContext', () => ({
  useValidationContext: () => mockValidationContext,
  useValidationContextSafe: () => mockValidationContext,
  useFieldValidation: () => ({
    isValid: true,
    error: null,
  }),
  ValidationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Section21ComplianceSection', () => {
  const mockOnUpdate = vi.fn();

  const baseFacts: WizardFacts = {
    __meta: { product: 'complete_pack', jurisdiction: 'england', original_product: null },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('N5B AST Verification Questions (Q9a-Q9g)', () => {
    it('should render all Q9 AST verification toggles', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      // Check for Q9 section header
      expect(screen.getByText('N5B Accelerated Possession - AST Verification')).toBeInTheDocument();

      // Check for all Q9 questions
      expect(screen.getByText(/Q9\(a\): Was the tenancy created on or after 28 February 1997\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(b\): Was there NO notice stating it was not an AST\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(c\): Does the tenancy agreement NOT exclude the AST provisions\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(d\): Is the tenant NOT an agricultural worker\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(e\): Is this NOT a succession tenancy\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(f\): Is this NOT a former secure tenancy transferred from a local authority\?/)).toBeInTheDocument();
      expect(screen.getByText(/Q9\(g\): Does Schedule 10 of the Local Government and Housing Act 1989 NOT apply\?/)).toBeInTheDocument();
    });

    it('should call onUpdate with correct field keys when Q9 toggles are clicked', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      // Find Q9a toggle by its name attribute and click Yes radio
      const q9aYesRadios = screen.getAllByRole('radio', { name: 'Yes' });
      const q9aYesRadio = q9aYesRadios.find(
        (r) => r.getAttribute('name') === 'n5b_q9a_after_feb_1997'
      );
      fireEvent.click(q9aYesRadio!);

      expect(mockOnUpdate).toHaveBeenCalledWith({ n5b_q9a_after_feb_1997: true });
    });
  });

  describe('Q15 - EPC Provided Date', () => {
    it('should show EPC date input when EPC was served', () => {
      const factsWithEpc: WizardFacts = {
        ...baseFacts,
        epc_served: true,
      };

      render(
        <Section21ComplianceSection
          facts={factsWithEpc}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText(/Date EPC was provided to tenant/)).toBeInTheDocument();
    });

    it('should NOT show EPC date input when EPC was not served', () => {
      const factsWithoutEpc: WizardFacts = {
        ...baseFacts,
        epc_served: false,
      };

      render(
        <Section21ComplianceSection
          facts={factsWithoutEpc}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByLabelText(/Date EPC was provided to tenant/)).not.toBeInTheDocument();
    });

    it('should call onUpdate with epc_provided_date when date is entered', () => {
      const factsWithEpc: WizardFacts = {
        ...baseFacts,
        epc_served: true,
      };

      render(
        <Section21ComplianceSection
          facts={factsWithEpc}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      const dateInput = screen.getByLabelText(/Date EPC was provided to tenant/);
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ epc_provided_date: '2024-01-15' });
    });
  });

  describe('Q16-Q17 - Gas Safety Dates', () => {
    const factsWithGas: WizardFacts = {
      ...baseFacts,
      has_gas_appliances: true,
      gas_safety_cert_served: true,
    };

    it('should show gas safety date fields when gas appliances present and cert served', () => {
      render(
        <Section21ComplianceSection
          facts={factsWithGas}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Was the gas safety check done before the tenant moved in\?/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of most recent gas safety check/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date certificate was given to tenant/)).toBeInTheDocument();
    });

    it('should show before occupation date when gas check was done before occupation', () => {
      const factsWithBeforeOccupation: WizardFacts = {
        ...factsWithGas,
        gas_safety_before_occupation: true,
      };

      render(
        <Section21ComplianceSection
          facts={factsWithBeforeOccupation}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText(/Date of gas safety check before occupation/)).toBeInTheDocument();
    });

    it('should NOT show gas fields when no gas appliances', () => {
      const factsNoGas: WizardFacts = {
        ...baseFacts,
        has_gas_appliances: false,
      };

      render(
        <Section21ComplianceSection
          facts={factsNoGas}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByLabelText(/Date of most recent gas safety check/)).not.toBeInTheDocument();
    });
  });

  describe('Q18 - How to Rent', () => {
    const factsWithHowToRent: WizardFacts = {
      ...baseFacts,
      how_to_rent_served: true,
    };

    it('should show How to Rent date and method when guide was served', () => {
      render(
        <Section21ComplianceSection
          facts={factsWithHowToRent}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText(/Date 'How to Rent' was provided/)).toBeInTheDocument();
      expect(screen.getByLabelText(/How was it provided\?/)).toBeInTheDocument();
    });

    it('should NOT show How to Rent fields when guide was not served', () => {
      const factsNoHowToRent: WizardFacts = {
        ...baseFacts,
        how_to_rent_served: false,
      };

      render(
        <Section21ComplianceSection
          facts={factsNoHowToRent}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByLabelText(/Date 'How to Rent' was provided/)).not.toBeInTheDocument();
    });

    it('should call onUpdate with correct keys when How to Rent fields are updated', () => {
      render(
        <Section21ComplianceSection
          facts={factsWithHowToRent}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      const dateInput = screen.getByLabelText(/Date 'How to Rent' was provided/);
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ how_to_rent_date: '2024-02-01' });
    });
  });

  describe('Q19 - Tenant Fees Act', () => {
    it('should render Tenant Fees Act section', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Tenant Fees Act 2019')).toBeInTheDocument();
      expect(screen.getByText(/Q19: Has the tenant paid any prohibited payment/)).toBeInTheDocument();
      expect(screen.getByText(/Q19\(b\): Was a holding deposit taken\?/)).toBeInTheDocument();
    });

    it('should call onUpdate with n5b_q19_prohibited_payment when toggle is clicked', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      // Find the Q19 prohibited payment radio by looking for the radio input with the specific name
      const q19NoRadios = screen.getAllByRole('radio', { name: 'No' });
      // Find the one for n5b_q19_prohibited_payment
      const q19NoRadio = q19NoRadios.find(
        (r) => r.getAttribute('name') === 'n5b_q19_prohibited_payment'
      );
      fireEvent.click(q19NoRadio!);

      expect(mockOnUpdate).toHaveBeenCalledWith({ n5b_q19_prohibited_payment: false });
    });
  });

  describe('Q20 - Paper Determination Consent', () => {
    it('should render Paper Determination section', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Paper Determination Consent')).toBeInTheDocument();
      expect(screen.getByText(/Q20: Do you consent to the court making a possession order without a hearing\?/)).toBeInTheDocument();
    });

    it('should call onUpdate with n5b_q20_paper_determination when toggle is clicked', () => {
      render(
        <Section21ComplianceSection
          facts={baseFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      // Find the Q20 paper determination radio by looking for the radio input with the specific name
      const q20YesRadios = screen.getAllByRole('radio', { name: 'Yes' });
      // Find the one for n5b_q20_paper_determination
      const q20YesRadio = q20YesRadios.find(
        (r) => r.getAttribute('name') === 'n5b_q20_paper_determination'
      );
      fireEvent.click(q20YesRadio!);

      expect(mockOnUpdate).toHaveBeenCalledWith({ n5b_q20_paper_determination: true });
    });
  });

  describe('Integration - All N5B fields persist to facts', () => {
    it('should render component with all N5B fields populated from facts', () => {
      const populatedFacts: WizardFacts = {
        ...baseFacts,
        // EPC
        epc_served: true,
        epc_provided_date: '2024-01-10',
        // Gas
        has_gas_appliances: true,
        gas_safety_cert_served: true,
        gas_safety_before_occupation: false,
        gas_safety_check_date: '2024-01-05',
        gas_safety_served_date: '2024-01-08',
        // How to Rent
        how_to_rent_served: true,
        how_to_rent_date: '2024-01-02',
        how_to_rent_method: 'email',
        // Q9
        n5b_q9a_after_feb_1997: true,
        n5b_q9b_no_notice_not_ast: true,
        n5b_q9c_no_exclusion_clause: true,
        n5b_q9d_not_agricultural_worker: true,
        n5b_q9e_not_succession_tenancy: true,
        n5b_q9f_not_former_secure: true,
        n5b_q9g_not_schedule_10: true,
        // Q19
        n5b_q19_prohibited_payment: false,
        n5b_q19b_holding_deposit: 'no',
        // Q20
        n5b_q20_paper_determination: true,
      };

      render(
        <Section21ComplianceSection
          facts={populatedFacts}
          jurisdiction="england"
          onUpdate={mockOnUpdate}
        />
      );

      // Verify EPC date is populated
      const epcDateInput = screen.getByLabelText(/Date EPC was provided to tenant/) as HTMLInputElement;
      expect(epcDateInput.value).toBe('2024-01-10');

      // Verify gas dates are populated
      const gasCheckInput = screen.getByLabelText(/Date of most recent gas safety check/) as HTMLInputElement;
      expect(gasCheckInput.value).toBe('2024-01-05');

      const gasServedInput = screen.getByLabelText(/Date certificate was given to tenant/) as HTMLInputElement;
      expect(gasServedInput.value).toBe('2024-01-08');

      // Verify How to Rent date is populated
      const howToRentDateInput = screen.getByLabelText(/Date 'How to Rent' was provided/) as HTMLInputElement;
      expect(howToRentDateInput.value).toBe('2024-01-02');
    });
  });
});
