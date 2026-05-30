function simplifyProductName(fullTitle: string): string {
  // Extract the core product name from full titles like:
  // "Create a Section 8 Eviction Notice and Service File" -> "Section 8 notice"
  // "Increase Rent in England with the Right Section 13 Route" -> "Section 13 route"
  // "Complete Eviction Pack" -> "Complete Pack"
  // "Standard Tenancy Agreement" -> "Standard Agreement"

  const title = fullTitle.trim();

  // Section 13 rent increase routes
  if (title.includes('Section 13') && title.includes('Defensive')) return 'Section 13 defensive route';
  if (title.includes('Section 13') && title.includes('Standard')) return 'Section 13 standard route';
  if (title.includes('Section 13') && title.includes('Route')) return 'Section 13 route';
  if (title.includes('Section 13')) return 'Section 13 route';

  // Section 8/21 notices
  if (title.includes('Section 8') && title.includes('Notice')) return 'Section 8 notice';
  if (title.includes('Section 21') && title.includes('Notice')) return 'Section 21 notice';

  // Tenancy agreements
  if (title.includes('Tenancy Agreement')) {
    if (title.includes('Standard')) return 'Standard Agreement';
    if (title.includes('Premium')) return 'Premium Agreement';
    if (title.includes('Student')) return 'Student Agreement';
    if (title.includes('HMO') || title.includes('Shared House')) return 'HMO Agreement';
    if (title.includes('Lodger')) return 'Lodger Agreement';
    return 'Tenancy Agreement';
  }

  // Packs
  if (title.includes('Complete')) return 'Complete Pack';
  if (title.includes('Court')) return 'Court Pack';
  if (title.includes('Eviction')) return 'Eviction Pack';

  // Money claims
  if (title.includes('Money Claim')) return 'Money Claim';

  // Default fallback
  return title;
}
