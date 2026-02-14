/**
 * Scotland Notice Narrative Builder
 *
 * Builds tribunal-safe, factual narrative text from gathered facts for Scotland
 * Notice to Leave notices. Used for "Use gathered details as starting point"
 * functionality in Ask Heaven-enhanced textareas.
 *
 * CRITICAL: This builder must NOT invent facts. If data is missing, use placeholders
 * like "[add details]" or return a missingInputs array.
 *
 * Scotland-specific rules:
 * - All grounds are DISCRETIONARY - the Tribunal has full discretion
 * - Ground 18 (rent arrears) requires 3+ consecutive months of arrears
 * - Notice cannot be served within first 6 months of tenancy
 */

import { calculateConsecutiveArrearsStreak, type ArrearsItem } from './notice-utils';
import { getScotlandGroundByNumber } from './grounds';

// Type for wizard facts
interface WizardFacts {
  // Ground selection
  scotland_eviction_ground?: number;
  scotland_ground_name?: string;
  ground_codes?: string[];

  // Tenancy
  tenancy_start_date?: string;
  rent_amount?: number;
  rent_frequency?: string;

  // Property
  property_address_line1?: string;
  property_address_line2?: string;
  property_address_town?: string;
  property_address_county?: string;
  property_address_postcode?: string;

  // Parties
  landlord_full_name?: string;
  tenant_full_name?: string;

  // Arrears (Ground 18)
  arrears_items?: ArrearsItem[];
  issues?: {
    rent_arrears?: {
      arrears_items?: ArrearsItem[];
    };
  };

  // Evidence description
  scotland_evidence_description?: string;

  // Allow other fields
  [key: string]: unknown;
}

interface NarrativeResult {
  suggestedText: string;
  missingInputs: string[];
}

/**
 * Format a date for display in tribunal documents.
 * Returns "[date]" placeholder for invalid or missing dates to avoid "Invalid Date" in documents.
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '[date]';
  try {
    const date = new Date(dateStr);
    // Check for Invalid Date - new Date() doesn't throw for invalid strings
    if (Number.isNaN(date.getTime())) {
      return '[date]';
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '[date]';
  }
}

/**
 * Format currency amount.
 */
function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '[amount]';
  }
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Build the property address string.
 */
function buildPropertyAddress(facts: WizardFacts): string {
  const parts: string[] = [];

  if (facts.property_address_line1) parts.push(facts.property_address_line1);
  if (facts.property_address_line2) parts.push(facts.property_address_line2);
  if (facts.property_address_town) parts.push(facts.property_address_town);
  if (facts.property_address_county) parts.push(facts.property_address_county);
  if (facts.property_address_postcode) parts.push(facts.property_address_postcode);

  return parts.length > 0 ? parts.join(', ') : '[property address]';
}

/**
 * Calculate total arrears from arrears schedule.
 */
function calculateTotalArrears(arrearsItems: ArrearsItem[]): number {
  return arrearsItems.reduce((total, item) => {
    // Use amount_owed if available, otherwise calculate from rent_due - rent_paid
    if (typeof item.amount_owed === 'number' && !isNaN(item.amount_owed)) {
      return total + Math.max(0, item.amount_owed);
    }
    const rentDue = typeof item.rent_due === 'number' ? item.rent_due : 0;
    const rentPaid = typeof item.rent_paid === 'number' ? item.rent_paid : 0;
    return total + Math.max(0, rentDue - rentPaid);
  }, 0);
}

/**
 * Build a Scotland notice narrative for evidence/particulars fields.
 *
 * @param facts - The wizard facts object
 * @param fieldContext - The field being populated ('evidence' | 'particulars')
 * @returns Object with suggestedText and missingInputs array
 */
export function buildScotlandNoticeNarrative(
  facts: WizardFacts,
  fieldContext: 'evidence' | 'particulars' = 'particulars'
): NarrativeResult {
  const missingInputs: string[] = [];
  const sections: string[] = [];

  // Get ground information
  const groundNumber = facts.scotland_eviction_ground;
  const groundData = groundNumber ? getScotlandGroundByNumber(groundNumber) : undefined;
  const groundName = groundData?.name || facts.scotland_ground_name || '[ground name]';
  const groundCode = groundData?.code || (groundNumber ? `Ground ${groundNumber}` : '[ground]');

  if (!groundNumber) {
    missingInputs.push('Eviction ground not selected');
  }

  // Property and parties
  const propertyAddress = buildPropertyAddress(facts);
  const tenantName = facts.tenant_full_name || '[tenant name]';
  const landlordName = facts.landlord_full_name || '[landlord name]';

  if (!facts.property_address_line1) missingInputs.push('Property address');
  if (!facts.tenant_full_name) missingInputs.push('Tenant name');
  if (!facts.landlord_full_name) missingInputs.push('Landlord name');

  // Tenancy details
  const tenancyStart = formatDate(facts.tenancy_start_date);
  const rentAmount = formatCurrency(facts.rent_amount);
  const rentFrequency = facts.rent_frequency || 'monthly';

  if (!facts.tenancy_start_date) missingInputs.push('Tenancy start date');
  if (!facts.rent_amount) missingInputs.push('Rent amount');

  // Build opening section
  if (fieldContext === 'evidence') {
    sections.push(
      `This notice is served under ${groundCode} (${groundName}) of the Private Housing (Tenancies) (Scotland) Act 2016.`
    );
  } else {
    sections.push(
      `The landlord, ${landlordName}, seeks to recover possession of the property at ${propertyAddress} from the tenant, ${tenantName}.`
    );
    sections.push(
      `The tenancy commenced on ${tenancyStart}. The current rent is ${rentAmount} ${rentFrequency}.`
    );
  }

  // Ground-specific content
  const SCOTLAND_RENT_ARREARS_GROUND = 18;

  if (groundNumber === SCOTLAND_RENT_ARREARS_GROUND) {
    // Ground 18 - Rent Arrears (3+ consecutive months)
    const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];

    if (Array.isArray(arrearsItems) && arrearsItems.length > 0) {
      const streakResult = calculateConsecutiveArrearsStreak(arrearsItems);
      const totalArrears = calculateTotalArrears(arrearsItems);

      sections.push(
        `The tenant has been in arrears of rent for ${streakResult.maxConsecutiveStreak} consecutive rent period${streakResult.maxConsecutiveStreak !== 1 ? 's' : ''}.`
      );

      sections.push(
        `The total arrears outstanding is ${formatCurrency(totalArrears)} as at the date of this notice.`
      );

      if (streakResult.maxConsecutiveStreak >= 3) {
        sections.push(
          `This meets the Ground 18 threshold of 3 or more consecutive rent periods of arrears.`
        );
      } else {
        sections.push(
          `[Note: Ground 18 requires 3 or more consecutive rent periods of arrears. Currently showing ${streakResult.maxConsecutiveStreak} consecutive rent period(s).]`
        );
        missingInputs.push('Ground 18 threshold not yet met - need 3+ consecutive rent periods');
      }

      // Add arrears schedule summary
      if (fieldContext === 'particulars') {
        sections.push('');
        sections.push('Arrears schedule:');
        arrearsItems.slice(0, 6).forEach((item, idx) => {
          const start = item.period_start ? formatDate(item.period_start) : `Period ${idx + 1}`;
          const owed = item.amount_owed ?? (
            (typeof item.rent_due === 'number' ? item.rent_due : 0) -
            (typeof item.rent_paid === 'number' ? item.rent_paid : 0)
          );
          sections.push(`- ${start}: ${formatCurrency(Math.max(0, owed))} outstanding`);
        });
        if (arrearsItems.length > 6) {
          sections.push(`- [${arrearsItems.length - 6} additional period(s) - see full schedule]`);
        }
      }
    } else {
      sections.push(
        `[The tenant has been in arrears of rent - please complete the arrears schedule to provide specific details.]`
      );
      missingInputs.push('Arrears schedule not completed');
    }
  } else if (groundNumber && groundData) {
    // Other grounds - use generic structure
    sections.push(`The landlord relies on ${groundCode}: ${groundName}.`);

    // Add required evidence hints if available
    if (groundData.requiredEvidence && groundData.requiredEvidence.length > 0) {
      sections.push('');
      sections.push('Evidence to be provided:');
      groundData.requiredEvidence.forEach(ev => {
        sections.push(`- ${ev}`);
      });
    }

    sections.push('');
    sections.push('[Add specific details supporting this ground]');
  }

  // Add existing evidence description if any
  if (facts.scotland_evidence_description && fieldContext === 'particulars') {
    sections.push('');
    sections.push('Additional information:');
    sections.push(facts.scotland_evidence_description);
  }

  // Tribunal discretion reminder
  sections.push('');
  sections.push(
    'The landlord asks the First-tier Tribunal to grant an eviction order on the basis that it is reasonable to do so.'
  );

  return {
    suggestedText: sections.join('\n'),
    missingInputs,
  };
}

/**
 * Build a short summary for the evidence description field.
 */
export function buildScotlandEvidenceSummary(facts: WizardFacts): NarrativeResult {
  return buildScotlandNoticeNarrative(facts, 'evidence');
}

/**
 * Build a full particulars statement for the ground statement field.
 */
export function buildScotlandParticularsStatement(facts: WizardFacts): NarrativeResult {
  return buildScotlandNoticeNarrative(facts, 'particulars');
}
