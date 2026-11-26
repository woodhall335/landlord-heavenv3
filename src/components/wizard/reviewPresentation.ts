export function getReviewPresentation(product = '') {
  if (product === 'notice_only') return { illustration: 'notice', title: 'Section 8 Notice & Service Pack', heading: 'Review your notice', documents: ['Completed Section 8 notice', 'Service instructions', 'Service and validity checklists', 'Supporting rent schedule where applicable'] };
  if (product === 'complete_pack') return { illustration: 'possession', title: 'Court & Possession Pack', heading: 'Review your possession file', documents: ['Claim forms and particulars', 'Supporting case documents', 'Evidence and bundle guidance', 'Filing and hearing instructions'] };
  if (product === 'money_claim') return { illustration: 'money-claim', title: 'Money Claim Pack', heading: 'Review your money claim', documents: ['Claim forms and particulars', 'Claim calculations', 'Pre-action documents', 'Evidence and filing guidance'] };
  if (product.startsWith('section13')) return { illustration: 'rent-increase', title: 'Rent Increase Pack', heading: 'Review your rent increase', documents: ['Rent increase notice', 'Service guidance', 'Supporting rent information'] };
  return { illustration: 'tenancy', title: 'Your landlord documents', heading: 'Review your document details', documents: ['Your selected document', 'Supporting schedules and guidance for your product'] };
}

export function getReviewIllustrationSrc(product = '') {
  const variants: Record<string, string> = {
    england_student_tenancy_agreement: 'tenancy-student',
    england_hmo_shared_house_tenancy_agreement: 'tenancy-hmo-shared',
    england_lodger_agreement: 'tenancy-lodger',
    england_premium_tenancy_agreement: 'tenancy-england-premium',
    ast_premium: 'tenancy-england-premium',
  };
  return variants[product]
    ? `/images/illustrations/pricing-cards/${variants[product]}.webp`
    : `/images/illustrations/wizard-review/${getReviewPresentation(product).illustration}.webp`;
}
