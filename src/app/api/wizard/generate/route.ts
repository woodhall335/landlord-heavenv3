/**
 * Document Generation API
 * WITH APPLICABILITY GATING AND ALL CLAUDE CODE FIXES
 *
 * Enforces legal compliance before generating documents.
 * Cannot be bypassed - API-layer enforcement.
 */

import { NextResponse } from 'next/server';
import { handleLegalError, LegalComplianceError, ValidationError } from '@/lib/errors/legal-errors';
import { getCaseFacts } from './getCaseFacts';

// Helper function to parse dates consistently (CLAUDE CODE FIX #2)
function parseUTCDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export async function POST(request: Request) {
  try {
    const { caseId, documentType } = await request.json();

    if (!caseId) {
      return NextResponse.json(
        handleLegalError(new ValidationError('caseId required')),
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        handleLegalError(new ValidationError('documentType required')),
        { status: 400 }
      );
    }

    const caseFacts = await getCaseFacts(caseId);

    // ========================================
    // WALES SECTION 173 ENFORCEMENT
    // ========================================

    if (
      documentType === 'wales_section_173' ||
      caseFacts.selected_notice_route === 'wales_section_173'
    ) {
      const contractCategory = caseFacts.wales_contract_category;

      if (!contractCategory) {
        return NextResponse.json(
          handleLegalError(new ValidationError('Contract category required')),
          { status: 400 }
        );
      }

      // Contract type validation
      if (contractCategory !== 'standard') {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'WALES_SECTION173_INVALID_CONTRACT_TYPE',
              `Section 173 not valid for "${contractCategory}" contracts. ` +
                `Only standard occupation contracts support Section 173.`
            )
          ),
          { status: 403 }
        );
      }

      // Rent Smart Wales validation
      if (caseFacts.rent_smart_wales_registered === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'WALES_RENT_SMART_REQUIRED',
              'Must be registered with Rent Smart Wales to serve Section 173 notice.'
            )
          ),
          { status: 403 }
        );
      }

      // Deposit protection (only if deposit taken)
      if (caseFacts.deposit_taken === true && caseFacts.deposit_protected === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'WALES_DEPOSIT_NOT_PROTECTED',
              'Deposit must be protected before serving Section 173 notice.'
            )
          ),
          { status: 403 }
        );
      }
    }

    // ========================================
    // ENGLAND SECTION 21 ENFORCEMENT (WITH ALL CLAUDE CODE FIXES)
    // ========================================

    if (documentType === 'section21_notice' || caseFacts.selected_notice_route === 'section_21') {
      // Deposit protection (ONLY if deposit taken)
      if (caseFacts.deposit_taken === true && caseFacts.deposit_protected === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_DEPOSIT_NOT_PROTECTED',
              'Section 21 invalid without deposit protection. Deposit must be protected in an approved scheme.'
            )
          ),
          { status: 403 }
        );
      }

      // CLAUDE CODE FIX #4: Prescribed information check (ONLY if deposit taken)
      if (caseFacts.deposit_taken === true && caseFacts.prescribed_info_given === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_PRESCRIBED_INFO_MISSING',
              'Section 21 invalid without prescribed information. ' +
                'Prescribed information about the deposit protection must be provided within 30 days.'
            )
          ),
          { status: 403 }
        );
      }

      // DEPOSIT CAP ENFORCEMENT (Tenant Fees Act 2019)
      // 5 weeks rent max (or 6 weeks if annual rent > £50,000)
      // Blocks Section 21 unless landlord confirms refund/reduction
      if (caseFacts.deposit_taken === true && caseFacts.deposit_amount && caseFacts.rent_amount) {
        const rentFrequency = caseFacts.rent_frequency ?? 'monthly';
        let annualRent = caseFacts.rent_amount * 12;
        if (rentFrequency === 'weekly') annualRent = caseFacts.rent_amount * 52;
        else if (rentFrequency === 'fortnightly') annualRent = caseFacts.rent_amount * 26;
        else if (rentFrequency === 'quarterly') annualRent = caseFacts.rent_amount * 4;
        else if (rentFrequency === 'yearly') annualRent = caseFacts.rent_amount;

        const weeklyRent = annualRent / 52;
        const maxWeeks = annualRent > 50000 ? 6 : 5;
        const maxDeposit = weeklyRent * maxWeeks;

        if (caseFacts.deposit_amount > maxDeposit) {
          const confirmationValue = caseFacts.deposit_reduced_to_legal_cap_confirmed;
          const isConfirmed = confirmationValue === 'yes' || confirmationValue === true;

          if (!isConfirmed) {
            return NextResponse.json(
              handleLegalError(
                new LegalComplianceError(
                  'SECTION21_DEPOSIT_CAP_EXCEEDED',
                  `Section 21 invalid: deposit £${caseFacts.deposit_amount.toFixed(2)} exceeds legal cap of £${maxDeposit.toFixed(2)} (${maxWeeks} weeks' rent). ` +
                    `Tenant Fees Act 2019 requires the deposit to be within the cap. ` +
                    `Confirm you have refunded/reduced the deposit, or use Section 8 instead.`
                )
              ),
              { status: 403 }
            );
          }
        }
      }

      // Gas certificate (ONLY if gas appliances)
      if (caseFacts.has_gas_appliances === true && caseFacts.gas_certificate_provided === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_GAS_CERTIFICATE_MISSING',
              'Section 21 invalid without gas safety certificate. ' +
                'A valid gas safety certificate must be provided to the tenant.'
            )
          ),
          { status: 403 }
        );
      }

      // CLAUDE CODE FIX #5: How to Rent (date-based requirement)
      if (caseFacts.tenancy_start_date) {
        const tenancyStart = parseUTCDate(caseFacts.tenancy_start_date);
        const howToRentThreshold = parseUTCDate('2015-10-01');
        const howToRentRequired = tenancyStart >= howToRentThreshold;

        if (howToRentRequired && caseFacts.how_to_rent_provided === false) {
          return NextResponse.json(
            handleLegalError(
              new LegalComplianceError(
                'SECTION21_HOW_TO_RENT_MISSING',
                `Section 21 invalid without How to Rent guide. ` +
                  `For tenancies starting on or after October 1, 2015, ` +
                  `the How to Rent guide must be provided.`
              )
            ),
            { status: 403 }
          );
        }
      }

      // CLAUDE CODE FIX #6: EPC (product constraint - assumed required)
      if (caseFacts.epc_provided === false) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_EPC_MISSING',
              'Section 21 invalid without EPC. ' +
                'This system assumes EPC required for all properties. ' +
                'If your property is exempt (listed building, etc.), ' +
                'consult a solicitor for manual preparation.'
            )
          ),
          { status: 403 }
        );
      }

      // Property licensing
      if (caseFacts.property_licensing_status === 'unlicensed') {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_UNLICENSED_PROPERTY',
              'Section 21 cannot be used for unlicensed properties requiring a license. ' +
                'You must obtain the required license first.'
            )
          ),
          { status: 403 }
        );
      }

      // Retaliatory eviction check
      if (caseFacts.recent_repair_complaints === true) {
        return NextResponse.json(
          handleLegalError(
            new LegalComplianceError(
              'SECTION21_RETALIATORY_EVICTION',
              'Section 21 may be invalid due to recent repair complaints. ' +
                'Serving notice within 6 months of a repair complaint may be considered retaliatory eviction.'
            )
          ),
          { status: 403 }
        );
      }
    }

    // ========================================
    // PROCEED WITH GENERATION
    // ========================================

    // All validation passed - would call appropriate generator here
    console.log(`[API Generate] Validation passed for ${documentType}`);

    return NextResponse.json({
      success: true,
      message: 'Validation passed - ready to generate',
      documentType,
      caseId,
    });
  } catch (error: any) {
    console.error('[API Generate] Error:', error);

    if (error instanceof LegalComplianceError || error instanceof ValidationError) {
      return NextResponse.json(handleLegalError(error), {
        status: error instanceof LegalComplianceError ? 403 : 400,
      });
    }

    // Unexpected error
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
