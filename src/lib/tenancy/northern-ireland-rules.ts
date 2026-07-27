export type NorthernIrelandRatesLiability =
  | 'landlord_included'
  | 'tenant'
  | 'apportioned';

export type NorthernIrelandDepositLifecycle =
  | 'no_deposit'
  | 'expected'
  | 'received_awaiting_protection'
  | 'protected'
  | 'prescribed_information_supplied';

export const NORTHERN_IRELAND_NOTICE_RULES = {
  landlordToTenant: [
    {
      tenure: 'not more than 12 months',
      minimumWeeks: 4,
      minimumDays: 28,
    },
    {
      tenure: 'more than 12 months but not more than 10 years',
      minimumWeeks: 8,
      minimumDays: 56,
    },
    {
      tenure: 'more than 10 years',
      minimumWeeks: 12,
      minimumDays: 84,
    },
  ],
  tenantToLandlord: [
    {
      tenure: 'not more than 10 years',
      minimumWeeks: 4,
      minimumDays: 28,
    },
    {
      tenure: 'more than 10 years',
      minimumWeeks: 12,
      minimumDays: 84,
    },
  ],
  sourceVersion: 'NI-DfC-current-2026-07-27',
} as const;

export function describeNorthernIrelandRates(
  liability: NorthernIrelandRatesLiability | undefined,
  explanation?: string
): string {
  switch (liability) {
    case 'landlord_included':
      return 'The landlord is responsible for domestic rates and the rates are included in the rent.';
    case 'tenant':
      return 'The tenant is responsible for paying domestic rates in addition to the rent.';
    case 'apportioned':
      return explanation?.trim() || 'The parties have recorded an apportioned rates arrangement.';
    default:
      return '';
  }
}

export function deriveNorthernIrelandRatesLiability(
  value: unknown
): NorthernIrelandRatesLiability | undefined {
  const normalized = String(value || '').trim().toLowerCase();
  if (
    normalized === 'landlord_included' ||
    normalized === 'landlord' ||
    normalized === 'included in rent'
  ) {
    return 'landlord_included';
  }
  if (normalized === 'tenant') return 'tenant';
  if (normalized === 'apportioned' || normalized === 'other') return 'apportioned';
  return undefined;
}

export function deriveNorthernIrelandDepositLifecycle(params: {
  explicitLifecycle?: unknown;
  amount?: number | null;
  receivedDate?: unknown;
  protectionDate?: unknown;
  reference?: unknown;
  prescribedInformationServed?: unknown;
}): NorthernIrelandDepositLifecycle {
  const explicit = String(params.explicitLifecycle || '').trim();
  if (
    explicit === 'no_deposit' ||
    explicit === 'expected' ||
    explicit === 'received_awaiting_protection' ||
    explicit === 'protected' ||
    explicit === 'prescribed_information_supplied'
  ) {
    return explicit;
  }

  if (!params.amount || params.amount <= 0) return 'no_deposit';
  if (params.prescribedInformationServed === true) {
    return 'prescribed_information_supplied';
  }
  if (params.protectionDate || params.reference) return 'protected';
  if (params.receivedDate) return 'received_awaiting_protection';
  return 'expected';
}
