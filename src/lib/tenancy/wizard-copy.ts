export type TenancyWizardJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland';

const TENANCY_AGREEMENT_LABELS: Record<TenancyWizardJurisdiction, string> = {
  england: 'Assured Periodic Tenancy Agreement',
  wales: 'Standard Occupation Contract',
  scotland: 'Private Residential Tenancy Agreement',
  'northern-ireland': 'Private Tenancy Agreement',
};

export function getTenancyAgreementLabel(
  jurisdiction: TenancyWizardJurisdiction
): string {
  return TENANCY_AGREEMENT_LABELS[jurisdiction];
}

export function getTenancyWizardWelcomeMessage(
  jurisdiction: TenancyWizardJurisdiction
): string {
  if (jurisdiction === 'wales') {
    return (
      'Hi. I will help you prepare a Standard Occupation Contract for Wales.\n\n' +
      'We will check the dwelling, contract-holders, rent, deposit and any special setup details ' +
      'so the paperwork matches the occupation contract you are creating.\n\nShall we start?'
    );
  }

  const jurisdictionName =
    jurisdiction === 'england'
      ? 'England'
      : jurisdiction === 'scotland'
      ? 'Scotland'
      : 'Northern Ireland';
  const agreementName = getTenancyAgreementLabel(jurisdiction);

  return (
    `Hi. I will help you prepare a ${agreementName} for ${jurisdictionName}.\n\n` +
    'We will check the property, tenants, rent, deposit and any special setup details ' +
    'so the paperwork matches the tenancy you are creating.\n\nShall we start?'
  );
}

export function getTenancyAskHeavenPlaceholder(
  jurisdiction: TenancyWizardJurisdiction
): string {
  return jurisdiction === 'wales'
    ? 'E.g. "Do I need to attach the occupation contract?"'
    : `E.g. "Do I need to attach the ${getTenancyAgreementLabel(jurisdiction).toLowerCase()}?"`;
}
