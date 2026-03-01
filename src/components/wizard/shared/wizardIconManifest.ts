const WIZARD_ICON_FILENAMES = [
  '01-case-basics.png',
  '02-parties.png',
  '03-property.png',
  '04-tenancy.png',
  '05-compliance.png',
  '06-notice-details.png',
  '07-review-finish.png',
  '08-evidence.png',
  '09-court.png',
  '10-signing.png',
  '11-calendar-timeline.png',
  '12-summary-cards.png',
  '13-section-21.png',
  '14-section-8.png',
  '15-rent-arrears.png',
  '16-grounds.png',
  '17-service-proof.png',
  '18-forms-bundle.png',
  '19-court-fee.png',
  '20-enforcement.png',
  '21-hearing.png',
  '22-tenant-response.png',
  '23-deposit-protection.png',
  '24-epc.png',
  '25-gas-safety.png',
  '26-how-to-rent.png',
  '27-claimant.png',
  '28-defendant.png',
  '29-claim-details.png',
  '30-arrears-ledger.png',
  '31-damages-costs.png',
  '32-claim-statement.png',
  '33-pre-action.png',
  '34-secure-payment.png',
  '35-submit-to-court.png',
  '36-default-judgment.png',
  '37-payment-plan.png',
  '38-evidence-pack.png',
  '39-landlord.png',
  '40-tenants.png',
  '41-rent.png',
  '42-deposit.png',
  '43-bills.png',
  '44-terms.png',
  '45-inventory.png',
  '46-premium.png',
  '47-ask-heaven.png',
  '48-what-you-need.png',
  '49-warning.png',
  '50-success.png',
] as const;

const toSlug = (filename: string): string =>
  filename.replace(/^\d+-/, '').replace(/\.png$/, '');

export const wizardIconFilenames: string[] = [...WIZARD_ICON_FILENAMES].sort((a, b) => a.localeCompare(b));

export const wizardIconSlugToFilename: Record<string, string> = Object.fromEntries(
  WIZARD_ICON_FILENAMES.map((filename) => [toSlug(filename), filename])
);

export const wizardIconFilenameToPublicPath: Record<string, string> = Object.fromEntries(
  WIZARD_ICON_FILENAMES.map((filename) => [filename, `/images/wizard-icons/${filename}`])
);

export function getWizardIconPathBySlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  const filename = wizardIconSlugToFilename[slug];
  if (!filename) return undefined;
  return wizardIconFilenameToPublicPath[filename];
}

export function getWizardIconPathByFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  return wizardIconFilenameToPublicPath[filename];
}
