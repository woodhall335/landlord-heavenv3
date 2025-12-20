/**
 * Guidance Tips Component
 *
 * Provides contextual help with copy-paste examples below wizard questions
 */

import { useState } from 'react';

interface GuidanceTip {
  title: string;
  examples: string[];
  tip?: string;
}

interface GuidanceTipsProps {
  questionId: string;
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  caseType?: 'eviction' | 'money_claim' | 'tenancy_agreement';
}


/**
 * Get contextual guidance based on question ID and jurisdiction
 */
function getGuidanceForQuestion(
  questionId: string,
  jurisdiction?: string,
  caseType?: string
): GuidanceTip | null {

  // Eviction-specific guidance
  if (caseType === 'eviction') {
    switch (questionId) {
      case 'eviction_reason':
      case 'why_evict':
        return {
          title: '💡 Example reasons',
          examples: [
            'Tenant owes £2,400 in rent (3 months behind)',
            'Tenant has caused significant damage to the property',
            'Frequent noise complaints from neighbors - police called 3 times',
            'Fixed-term tenancy ended 2 months ago, tenant hasn\'t left',
            'Need property back for family member to move in',
          ],
          tip: 'Be specific - include amounts owed or dates when problems started'
        };

      case 'arrears_amount':
      case 'rent_owed':
        return {
          title: '💡 How to calculate total arrears',
          examples: [
            'Example 1: Rent £800/month, 3 months unpaid = £2,400',
            'Example 2: Rent £200/week, 8 weeks unpaid = £1,600',
            'Example 3: Some payments made - Jan £800, Feb £400, Mar £0 = £1,200 owed',
          ],
          tip: 'Only include unpaid rent, not damage or other costs'
        };

      case 'incident_description':
      case 'antisocial_behavior':
      case 'describe_problem':
        return {
          title: '💡 Example descriptions (copy & adapt)',
          examples: [
            'Loud music playing past midnight on 15/10/2024, 22/10/2024, and 29/10/2024. Neighbors at Flat 3 and Flat 5 complained. Police called on 29/10/2024 - Crime ref: 12345/24',
            'Tenant running unlicensed business from property - constant visitors, deliveries blocking shared entrance. Complained to tenant 05/09/2024, 12/09/2024, 20/09/2024',
            'Property inspection 10/11/2024 revealed: large hole in living room wall, damaged kitchen cupboards, broken bathroom tiles. Photos taken, sent to tenant 12/11/2024',
          ],
          tip: 'Include specific dates, witnesses, and any evidence (photos, police reports)'
        };

      case 'ground_particulars':
      case 'evidence_details':
        if (jurisdiction === 'england' || jurisdiction === 'wales') {
          return {
            title: '💡 Example particulars for England & Wales',
            examples: [
              'Ground 8: Rent arrears of £2,400. Rent is £800/month due on 1st. Last payment received 01/08/2024. No payments for Sept, Oct, Nov 2024. Arrears exceed 2 months at notice date.',
              'Ground 10: Total arrears £1,600. Tenant paying sporadically - paid £400 in Sept instead of £800, £0 in Oct, £200 in Nov. Pattern of persistent delay.',
              'Ground 12: Breach of tenancy clause 8.3 (no subletting). Tenant advertising room on SpareRoom.com since 15/10/2024. Screenshot evidence attached. Written warning sent 20/10/2024 ignored.',
              'Ground 14: Anti-social behaviour. Noise complaints from 3 neighbors (Flat 2, 4, 6) on 12/09, 19/09, 26/09. Police attended 26/09 - ref CR12345/24. Environmental Health involved.',
            ],
            tip: 'Reference the specific ground number and provide dates, amounts, and evidence'
          };
        } else if (jurisdiction === 'scotland') {
          return {
            title: '💡 Example particulars for Scotland',
            examples: [
              'Ground 12: Rent arrears £2,400 (3 months). Rent £800/month due 1st. Contacted tenant 05/09, 12/09, 20/09 (pre-action requirement met). Last payment 01/08/2024.',
              'Ground 2: Criminal behaviour. Police called 15/10/2024, 22/10/2024, 29/10/2024 for domestic disturbances. Assault charge pending (case ref: SF12345/24). Neighbors in fear.',
              'Ground 4: Breach of tenancy terms - prohibited pets. Tenant keeping 2 large dogs despite clause 9.2 ban. Damage to carpets. Photos dated 10/11/2024. Warning letter 12/11/2024 ignored.',
            ],
            tip: 'For Ground 12 (arrears), must show 3+ attempts to contact tenant (pre-action requirement)'
          };
        }
        return null;

      case 'deposit_protection_scheme':
        if (jurisdiction === 'england' || jurisdiction === 'wales') {
          return {
            title: '💡 England & Wales deposit schemes',
            examples: [
              'DPS (Deposit Protection Service)',
              'MyDeposits',
              'TDS (Tenancy Deposit Scheme)',
            ],
            tip: 'Deposit must be protected within 30 days and prescribed info given to tenant'
          };
        } else if (jurisdiction === 'scotland') {
          return {
            title: '💡 Scotland deposit schemes',
            examples: [
              'SafeDeposits Scotland',
              'MyDeposits Scotland',
              'Letting Protection Service Scotland',
            ],
            tip: 'Maximum deposit: 2 months\' rent. Must be protected within 30 working days'
          };
        }
        return null;
    }
  }

  // Money claim specific guidance
  if (caseType === 'money_claim') {
    switch (questionId) {
      case 'claim_breakdown':
      case 'what_owed':
        return {
          title: '💡 Example claim breakdowns',
          examples: [
            'Rent arrears: £2,400 (3 months × £800)\nProperty damage: £850 (hole in wall £450, broken kitchen cupboard £400)\nCleaning: £200 (professional deep clean)\nTotal: £3,450',
            'Unpaid rent: £1,200 (6 weeks × £200/week)\nUtility bills left unpaid: £340 (gas £180, electric £160)\nLess deposit held: -£800\nTotal claim: £740',
          ],
          tip: 'Break down into categories - makes claim stronger and clearer for court'
        };

      case 'damage_description':
        return {
          title: '💡 Example damage descriptions (with costs)',
          examples: [
            'Living room: Hole in wall (15cm diameter) - repair quote £450. Stained carpet - replacement quote £600',
            'Kitchen: Broken cupboard door (Quote from ABC Kitchens £400). Damaged worktop (£350 repair). Photos taken at checkout 10/11/2024',
            'Bathroom: Cracked toilet cistern (Plumber quote £180). Mold on ceiling due to lack of ventilation - cleaning quote £250',
          ],
          tip: 'Get professional quotes/invoices where possible - much stronger evidence'
        };

      case 'arrears_schedule':
      case 'payment_history':
        return {
          title: '💡 Example arrears schedule',
          examples: [
            'Sept 2024: £800 due, £0 paid, Balance: £800\nOct 2024: £800 due, £400 paid, Balance: £1,200\nNov 2024: £800 due, £0 paid, Balance: £2,000\nTotal owed: £2,000',
            'Weeks 1-4 (Sept): £800 due (£200/week), £600 paid (partial), £200 short\nWeeks 5-8 (Oct): £800 due, £0 paid, £1,000 total arrears\nWeeks 9-12 (Nov): £800 due, £200 paid, £1,600 total',
          ],
          tip: 'Show each period separately - court needs to see the pattern of non-payment'
        };
    }
  }

  // Tenancy agreement specific guidance
  if (caseType === 'tenancy_agreement') {
    switch (questionId) {
      case 'special_terms':
      case 'additional_clauses':
        return {
          title: '💡 Example additional terms (optional)',
          examples: [
            'Garden maintenance: Tenant responsible for mowing lawn monthly during April-September',
            'Parking: One allocated space (number 42). No commercial vehicles permitted',
            'Decoration: Tenant may decorate with landlord\'s written consent. Must return to neutral colors at end of tenancy',
          ],
          tip: 'Keep terms reasonable - illegal terms (like "no DSS") will void the clause'
        };

      case 'inventory_notes':
        return {
          title: '💡 Example inventory notes',
          examples: [
            'Small scratch on living room door (photo ref: IMG_001)',
            'Kitchen worktop has minor stain near sink (photo ref: IMG_005)',
            'Bedroom carpet has slight discoloration in corner (photo ref: IMG_012)',
          ],
          tip: 'Note ALL existing damage with photos - protects both landlord and tenant'
        };
    }
  }

  // General guidance for common fields
  switch (questionId) {
    case 'property_address':
  return {
    title: '💡 Example addresses (split into the 3 boxes)',
    examples: [
      'Building and street: Flat 3, 42 High Street\nTown / City: Manchester\nPostcode: M1 2AB',
      'Building and street: 15 Oak Avenue\nTown / City: Edinburgh\nPostcode: EH3 9QR',
      'Building and street: Apartment 2B, Victoria Court, 78 King Street\nTown / City: Glasgow\nPostcode: G1 3PS',
    ],
    tip: 'Use the first box for building and street, the second for town/city, and the last for the full postcode.'
  };

    case 'landlord_bank_details':
    case 'payment_details':
      return {
        title: '💡 Example bank details format',
        examples: [
          'Account Name: John Smith\nSort Code: 12-34-56\nAccount Number: 12345678',
          'Account Name: ABC Properties Ltd\nSort Code: 40-47-09\nAccount Number: 87654321',
        ],
        tip: 'Double-check account number (8 digits) and sort code (6 digits with dashes)'
      };

    default:
      return null;
  }
}

export function GuidanceTips({ questionId, jurisdiction, caseType }: GuidanceTipsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const guidance = getGuidanceForQuestion(questionId, jurisdiction, caseType);

  if (!guidance) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
  <span className="font-medium text-blue-900">
    {guidance.title}
  </span>
</div>
        <svg
          className={`w-5 h-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {guidance.tip && (
            <p className="text-sm text-blue-700 mb-3 italic">
              💬 {guidance.tip}
            </p>
          )}

          <div className="space-y-2">
            {guidance.examples.map((example, index) => (
              <div
                key={index}
                className="bg-white rounded border border-blue-200 overflow-hidden"
              >
                <div className="p-3">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {example}
                  </pre>
                </div>
                <div className="bg-gray-50 px-3 py-2 border-t border-blue-100 flex justify-end">
                  <button
                    onClick={() => handleCopy(example, index)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy to clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
