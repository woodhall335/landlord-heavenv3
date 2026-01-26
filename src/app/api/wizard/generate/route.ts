/**
 * Document Generation API
 * WITH APPLICABILITY GATING AND ALL CLAUDE CODE FIXES
 *
 * Enforces legal compliance before generating documents.
 * Cannot be bypassed - API-layer enforcement.
 *
 * PRE-GENERATION VALIDATION:
 * - Rule-based consistency check always runs for complete_pack
 * - Optional LLM check via ENABLE_LLM_CONSISTENCY_CHECK env flag
 * - BLOCKER issues return 400 and prevent generation
 * - WARNING issues are logged but allow generation
 */

import { NextResponse } from 'next/server';
import { handleLegalError, LegalComplianceError, ValidationError } from '@/lib/errors/legal-errors';
import { getCaseFacts } from './getCaseFacts';
import {
  deriveJurisdictionFromFacts,
  deriveRouteFromFacts,
  runYamlOnlyCompletePackValidation,
  trackYamlOnlyValidation,
} from '@/lib/validation/shadow-mode-adapter';

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
    // PRE-GENERATION CONSISTENCY CHECK (complete_pack only)
    // ========================================

    // Determine product from documentType or caseFacts
    // Note: section21_notice and wales_section_173 are notice-only types, not complete_pack
    const isNoticeOnlyDocType = documentType === 'section21_notice' ||
      documentType === 'wales_section_173' ||
      documentType === 'section8_notice' ||
      documentType.startsWith('notice_');
    const product = caseFacts.__meta?.product || caseFacts.product ||
      (isNoticeOnlyDocType ? 'notice_only' :
        (documentType.includes('eviction') || documentType.includes('pack') ? 'complete_pack' : 'notice_only'));

    if (product === 'complete_pack' || product === 'eviction_pack') {
      // ========================================================================
      // Phase 12: YAML-only validation (TS validators removed)
      // ========================================================================
      let blockers: Array<{ code: string; description?: string }> = [];
      let warnings: Array<{ code: string; description?: string }> = [];

      console.log('[API Generate] Using YAML-only validation for complete_pack (Phase 12)');
      try {
        const yamlResult = await runYamlOnlyCompletePackValidation({
          jurisdiction: deriveJurisdictionFromFacts(caseFacts) as 'england' | 'wales' | 'scotland',
          route: deriveRouteFromFacts(caseFacts),
          facts: caseFacts,
        });

        trackYamlOnlyValidation(true);

        blockers = yamlResult.blockers.map((b) => ({
          code: b.id,
          description: b.message,
        }));
        warnings = yamlResult.warnings.map((w) => ({
          code: w.id,
          description: w.message,
        }));

        // Log YAML primary usage
        if (yamlResult.usedFallback) {
          console.warn('[API Generate] YAML primary fell back to TS:', {
            reason: yamlResult.fallbackReason,
          });
        }
      } else {
        // Default: TS is authoritative, YAML runs in shadow mode
        const preGenResult = await runPreGenerationCheck(caseFacts, product);
        blockers = preGenResult.blockers;
        warnings = preGenResult.warnings;
        llmCheckRan = preGenResult.llm_check_ran;

        // Shadow validation for parity monitoring
        runProductionShadowValidation({
          jurisdiction: deriveJurisdictionFromFacts(caseFacts),
          product: 'complete_pack',
          route: deriveRouteFromFacts(caseFacts),
          facts: caseFacts,
          tsBlockers: preGenResult.blockers.map((b) => ({
            code: b.code,
            severity: 'blocker',
            message: b.message || b.code,
          })),
          tsWarnings: preGenResult.warnings.map((w) => ({
            code: w.code,
            severity: 'warning',
            message: w.message || w.code,
          })),
        }).catch((err) => {
          // Shadow validation should never block the response
          console.error('[API Generate] Shadow validation error (non-fatal):', err);
        });
      } catch (error) {
        trackYamlOnlyValidation(false);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[API Generate] YAML validation error:', {
          error: errorMessage,
          product,
        });
        throw error; // Re-throw to trigger 500 error
      }

      // Log warnings but don't block
      if (warnings.length > 0) {
        console.log(`[API Generate] Pre-generation warnings:`, warnings.map(w => w.code));
      }

      // Block on blocker issues
      if (blockers.length > 0) {
        console.log(`[API Generate] Pre-generation blockers:`, blockers.map(b => b.code));
        return NextResponse.json(
          {
            error: 'PRE_GENERATION_VALIDATION_FAILED',
            code: 'CONSISTENCY_CHECK_FAILED',
            message: 'Document generation blocked due to data inconsistencies',
            blocking_issues: blockers,
            warnings: warnings,
          },
          { status: 400 }
        );
      }
    }

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
