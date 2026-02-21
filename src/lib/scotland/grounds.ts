/**
 * Scotland Eviction Grounds Utility
 *
 * Loads and processes Scotland eviction grounds from the config file.
 * All grounds in Scotland are DISCRETIONARY - the First-tier Tribunal has discretion on all grounds.
 *
 * Key Scotland-specific rules:
 * 1. NO MANDATORY GROUNDS - All 18 grounds are discretionary
 * 2. DYNAMIC GROUND DATA - All data comes from config, not hardcoded
 * 3. 6-MONTH RULE - Notice to Leave cannot be served within first 6 months of tenancy
 * 4. NOTICE PERIODS - 28 or 84 days depending on ground (from config)
 */

import scotlandGroundsConfig from '@/config/jurisdictions/uk/scotland/eviction_grounds.json';

export interface ScotlandGround {
  number: number;
  code: string;
  name: string;
  description: string;
  fullText: string;
  noticePeriodDays: number;
  type: 'discretionary'; // All Scotland grounds are discretionary
  statute: string;
  requiredEvidence: string[];
  commonDefences: string[];
  notes: string;
}

export interface ScotlandConfig {
  jurisdiction: string;
  legalFramework: string;
  noticeType: string;
  tribunal: string;
  noticeRequirements: {
    minimumNoticePeriodDays: number;
    noticePeriodNotes: string;
    serviceMethods: string[];
  };
  tribunalApplication: {
    form: string;
    fee: string;
    timeframe: string;
    evidenceRequirements: string[];
  };
}

/**
 * Parse grounds from the config file format (ground_1, ground_2, etc.)
 * Returns a sorted array of grounds by number
 */
export function getScotlandGrounds(): ScotlandGround[] {
  const groundsObj = (scotlandGroundsConfig as any).grounds || {};

  const grounds: ScotlandGround[] = [];

  for (const key of Object.keys(groundsObj)) {
    // Parse ground number from key (e.g., "ground_1" -> 1)
    const match = key.match(/ground_(\d+)/);
    if (!match) continue;

    const groundNumber = parseInt(match[1], 10);
    const groundData = groundsObj[key];

    grounds.push({
      number: groundNumber,
      code: groundData.code || `Ground ${groundNumber}`,
      name: groundData.title || '',
      description: groundData.shortDescription || '',
      fullText: groundData.fullText || '',
      noticePeriodDays: groundData.notice_period_days || 84,
      type: 'discretionary', // All Scotland grounds are discretionary
      statute: groundData.statute || '',
      requiredEvidence: groundData.required_evidence || [],
      commonDefences: groundData.common_defences || [],
      notes: groundData.notes || '',
    });
  }

  // Sort by ground number
  return grounds.sort((a, b) => a.number - b.number);
}

/**
 * Get a specific ground by number
 */
export function getScotlandGroundByNumber(groundNumber: number): ScotlandGround | undefined {
  return getScotlandGrounds().find(g => g.number === groundNumber);
}

/**
 * Get the notice period for a specific ground
 * Returns the ground's notice period, or 84 days as default
 */
export function getNoticePeriodForGround(groundNumber: number): number {
  const ground = getScotlandGroundByNumber(groundNumber);
  return ground?.noticePeriodDays || 84;
}

/**
 * All Scotland grounds are discretionary - Tribunal has discretion on all
 * This function always returns false for Scotland
 */
export function isGroundMandatory(_groundNumber: number): boolean {
  return false; // Scotland has NO mandatory grounds
}

/**
 * Get the Scotland config metadata (tribunal info, notice requirements, etc.)
 */
export function getScotlandConfig(): ScotlandConfig {
  const config = scotlandGroundsConfig as any;

  return {
    jurisdiction: config.jurisdiction || 'scotland',
    legalFramework: config.legal_framework || 'Private Housing (Tenancies) (Scotland) Act 2016',
    noticeType: config.notice_type || 'Notice to Leave',
    tribunal: config.tribunal || 'First-tier Tribunal for Scotland (Housing and Property Chamber)',
    noticeRequirements: {
      minimumNoticePeriodDays: config.notice_requirements?.minimum_notice_period_days || 84,
      noticePeriodNotes: config.notice_requirements?.notice_period_notes || '',
      serviceMethods: config.notice_requirements?.service_methods || [],
    },
    tribunalApplication: {
      form: config.tribunal_application?.form || 'Form E',
      fee: config.tribunal_application?.fee || '£100',
      timeframe: config.tribunal_application?.timeframe || '',
      evidenceRequirements: config.tribunal_application?.evidence_requirements || [],
    },
  };
}

/**
 * Get grounds grouped by notice period
 * Returns { shortNotice: grounds with 28 days, standardNotice: grounds with 84 days }
 */
export function getGroundsByNoticePeriod(): {
  shortNotice: ScotlandGround[];
  standardNotice: ScotlandGround[];
} {
  const grounds = getScotlandGrounds();

  return {
    shortNotice: grounds.filter(g => g.noticePeriodDays === 28),
    standardNotice: grounds.filter(g => g.noticePeriodDays === 84),
  };
}

/**
 * Validate the 6-month rule for Scotland
 * Notice to Leave cannot be served within the first 6 months of the tenancy
 *
 * @param tenancyStartDate - The start date of the tenancy
 * @param proposedNoticeDate - The date the notice would be served (defaults to today)
 * @returns validation result with valid flag and message
 */
export function validateSixMonthRule(
  tenancyStartDate: string | Date,
  proposedNoticeDate?: string | Date
): { valid: boolean; message?: string; earliestNoticeDate?: string } {
  const start = new Date(tenancyStartDate);
  const notice = proposedNoticeDate ? new Date(proposedNoticeDate) : new Date();

  // Calculate 6 months from start
  const sixMonthsFromStart = new Date(start);
  sixMonthsFromStart.setMonth(sixMonthsFromStart.getMonth() + 6);

  // Format earliest date for display
  const earliestNoticeDate = sixMonthsFromStart.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (notice < sixMonthsFromStart) {
    return {
      valid: false,
      message: `Notice to Leave cannot be served within the first 6 months of the tenancy. The earliest you can serve notice is ${earliestNoticeDate}.`,
      earliestNoticeDate,
    };
  }

  return { valid: true, earliestNoticeDate };
}

/**
 * Calculate the earliest eviction date based on ground and notice date
 *
 * @param groundNumber - The selected ground number
 * @param noticeServedDate - The date the notice is/was served
 * @returns the earliest date the tenancy can end
 */
export function calculateEarliestEvictionDate(
  groundNumber: number,
  noticeServedDate: string | Date
): Date {
  const noticePeriod = getNoticePeriodForGround(groundNumber);
  const servedDate = new Date(noticeServedDate);

  const evictionDate = new Date(servedDate);
  evictionDate.setDate(evictionDate.getDate() + noticePeriod);

  return evictionDate;
}
