/**
 * Wales Notice Periods Config Loader
 *
 * CRITICAL: Server-side only - uses fs operations
 * Never import this in client code
 *
 * CLAUDE CODE FIX #1: Config loading isolated to server
 * CLAUDE CODE FIX #2: Date-only parsing (UTC consistent)
 * CLAUDE CODE FIX #3: No redundant current_rule
 */

import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';

let cachedConfig: any = null;

/**
 * Parse date string as UTC midnight for consistent comparison
 *
 * CLAUDE CODE FIX #2: Avoids timezone issues in rule selection
 */
function parseUTCDate(dateStr: string): Date {
  // dateStr format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Load Wales notice periods config
 * Caches after first load
 */
export async function loadWalesNoticePeriods() {
  if (!cachedConfig) {
    const configPath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/wales/notice_periods.yaml'
    );
    const content = await fs.readFile(configPath, 'utf-8');
    cachedConfig = yaml.load(content);
  }
  return cachedConfig;
}

/**
 * Get Wales Section 173 rule for service date
 *
 * CLAUDE CODE FIX #2: UTC date parsing for rule selection
 * CLAUDE CODE FIX #3: No redundant current_rule - compute from rules array
 *
 * Selects the rule with the latest effective_from that is <= service_date.
 * This ensures historic cases use the correct law at time of service.
 *
 * @param serviceDate - Optional service date (defaults to current rule via today's date)
 * @returns Rule data with notice periods and legal reference
 */
export async function getWalesSection173Rule(serviceDate?: string) {
  const config = await loadWalesNoticePeriods();
  const rules = config.section_173_no_fault.rules;

  // Use today's date if no service date provided
  const targetDate = serviceDate ? parseUTCDate(serviceDate) : new Date(); // Current date for "current rule"

  // Filter rules that are effective by service date
  const applicableRules = rules.filter((rule: any) => {
    const effectiveDate = parseUTCDate(rule.effective_from);
    return effectiveDate <= targetDate;
  });

  if (applicableRules.length === 0) {
    throw new Error(
      `No Wales Section 173 rule found for service date ${serviceDate}. ` +
        `Earliest rule effective: ${rules[0].effective_from}`
    );
  }

  // Sort by effective_from descending, take first (latest applicable)
  applicableRules.sort((a: any, b: any) => {
    return parseUTCDate(b.effective_from).getTime() - parseUTCDate(a.effective_from).getTime();
  });

  const selectedRule = applicableRules[0];

  console.log(
    `[Wales Config] Service date ${serviceDate || 'current'} → ` +
      `Using rule effective ${selectedRule.effective_from} ` +
      `(${selectedRule.period_months} months)`
  );

  return {
    notice_period_months: selectedRule.period_months,
    notice_period_days: selectedRule.period_days,
    prohibited_period_months: config.prohibited_period.months,
    legal_reference: selectedRule.legal_reference,
    effective_from: selectedRule.effective_from,
  };
}

/**
 * Get Wales fault-based section rule
 *
 * CLAUDE CODE FIX #1: Deterministic section number extractor
 * Handles "Section 157 - Serious rent arrears" → section_157
 */
export async function getWalesFaultBasedRule(section: string) {
  const config = await loadWalesNoticePeriods();

  // Extract section number using regex
  const match = section.match(/section\s+(\d+)/i);
  if (!match) {
    throw new Error(
      `Unknown Wales section format: "${section}". Expected format: "Section 157 - Description"`
    );
  }

  const sectionNumber = match[1];
  const sectionKey = `section_${sectionNumber}`;

  const rule = config.fault_based_sections[sectionKey];

  if (!rule) {
    throw new Error(
      `Unknown Wales section: ${sectionKey}. Valid sections: ${Object.keys(config.fault_based_sections).join(', ')}`
    );
  }

  return {
    period_days: rule.period_days,
    description: rule.description,
    legal_reference: rule.legal_reference,
  };
}
