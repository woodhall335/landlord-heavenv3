/**
 * Legal Source Registry
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * Defines monitored legal sources by jurisdiction and topic,
 * including update frequency, trust levels, and mapping configuration.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Trust level for a legal source.
 */
export type TrustLevel = 'authoritative' | 'official' | 'secondary' | 'informational';

/**
 * Jurisdiction identifiers.
 */
export type Jurisdiction = 'england' | 'wales' | 'scotland' | 'uk_wide';

/**
 * Topic categories for legal changes.
 */
export type LegalTopic =
  | 'housing'
  | 'eviction'
  | 'tenancy'
  | 'deposit_protection'
  | 'licensing'
  | 'registration'
  | 'notice_requirements'
  | 'rent'
  | 'tenant_fees'
  | 'energy_performance'
  | 'safety_certificates'
  | 'retaliatory_eviction'
  | 'pre_action_protocol';

/**
 * Update frequency for source monitoring.
 */
export type UpdateFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly' | 'manual';

/**
 * Definition of a monitored legal source.
 */
export interface LegalSource {
  id: string;
  name: string;
  description: string;
  url: string;
  rssUrl?: string;
  apiEndpoint?: string;

  // Scope
  jurisdictions: Jurisdiction[];
  topics: LegalTopic[];

  // Trust and reliability
  trustLevel: TrustLevel;
  isGovernmentSource: boolean;

  // Monitoring
  updateFrequency: UpdateFrequency;
  lastChecked?: string;
  lastChangeDetected?: string;

  // Mapping
  ruleIdPrefixes?: string[]; // e.g., ['s21_', 's8_'] for England eviction
  productIds?: string[]; // e.g., ['notice_only', 'complete_pack']

  // Configuration
  enabled: boolean;
  requiresAuthentication: boolean;
  authConfigKey?: string;

  // Metadata
  addedAt: string;
  addedBy: string;
  notes?: string;
}

/**
 * Source group for related sources.
 */
export interface SourceGroup {
  id: string;
  name: string;
  description: string;
  sourceIds: string[];
  jurisdictions: Jurisdiction[];
  topics: LegalTopic[];
}

// ============================================================================
// LEGAL SOURCE REGISTRY
// ============================================================================

/**
 * Registry of all monitored legal sources.
 */
export const LEGAL_SOURCES: LegalSource[] = [
  // -------------------------------------------------------------------------
  // UK-WIDE SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'uk_legislation_gov',
    name: 'UK Legislation',
    description: 'Official UK legislation database (legislation.gov.uk)',
    url: 'https://www.legislation.gov.uk/',
    rssUrl: 'https://www.legislation.gov.uk/new/data.feed',
    jurisdictions: ['uk_wide', 'england', 'wales', 'scotland'],
    topics: ['housing', 'eviction', 'tenancy', 'deposit_protection', 'tenant_fees'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'daily',
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
    notes: 'Primary source for all UK legislation changes',
  },

  // -------------------------------------------------------------------------
  // ENGLAND SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'gov_uk_housing',
    name: 'GOV.UK Housing Guidance',
    description: 'Official government guidance on housing and eviction',
    url: 'https://www.gov.uk/browse/housing-local-services',
    jurisdictions: ['england'],
    topics: ['housing', 'eviction', 'tenancy', 'notice_requirements'],
    trustLevel: 'official',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s21_', 's8_'],
    productIds: ['notice_only', 'complete_pack'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'ministry_of_justice',
    name: 'Ministry of Justice',
    description: 'Court procedure rules and practice directions',
    url: 'https://www.gov.uk/government/organisations/ministry-of-justice',
    jurisdictions: ['england', 'wales'],
    topics: ['eviction', 'notice_requirements'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'deposit_protection_service',
    name: 'Deposit Protection Service',
    description: 'DPS scheme updates and guidance',
    url: 'https://www.depositprotection.com/',
    jurisdictions: ['england', 'wales'],
    topics: ['deposit_protection'],
    trustLevel: 'official',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s21_deposit_', 's173_deposit_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'mydeposits',
    name: 'MyDeposits',
    description: 'MyDeposits scheme updates and guidance',
    url: 'https://www.mydeposits.co.uk/',
    jurisdictions: ['england', 'wales'],
    topics: ['deposit_protection'],
    trustLevel: 'official',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s21_deposit_', 's173_deposit_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'tds',
    name: 'Tenancy Deposit Scheme',
    description: 'TDS scheme updates and guidance',
    url: 'https://www.tenancydepositscheme.com/',
    jurisdictions: ['england', 'wales'],
    topics: ['deposit_protection'],
    trustLevel: 'official',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s21_deposit_', 's173_deposit_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'selective_licensing_register',
    name: 'Local Authority Licensing Registers',
    description: 'Selective and additional licensing scheme information',
    url: 'https://www.gov.uk/selective-licensing',
    jurisdictions: ['england'],
    topics: ['licensing'],
    trustLevel: 'secondary',
    isGovernmentSource: true,
    updateFrequency: 'monthly',
    ruleIdPrefixes: ['s21_licensing_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },

  // -------------------------------------------------------------------------
  // WALES SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'welsh_government_housing',
    name: 'Welsh Government Housing',
    description: 'Renting Homes (Wales) Act guidance and updates',
    url: 'https://www.gov.wales/housing',
    jurisdictions: ['wales'],
    topics: ['housing', 'eviction', 'tenancy', 'notice_requirements'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s173_'],
    productIds: ['notice_only'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'rent_smart_wales',
    name: 'Rent Smart Wales',
    description: 'Landlord registration and licensing for Wales',
    url: 'https://www.rentsmartwales.gov.wales/',
    jurisdictions: ['wales'],
    topics: ['registration', 'licensing'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['s173_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },

  // -------------------------------------------------------------------------
  // SCOTLAND SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'scottish_government_housing',
    name: 'Scottish Government Housing',
    description: 'Private Residential Tenancy guidance',
    url: 'https://www.gov.scot/policies/private-renting/',
    jurisdictions: ['scotland'],
    topics: ['housing', 'eviction', 'tenancy', 'notice_requirements', 'pre_action_protocol'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['ntl_'],
    productIds: ['notice_only'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'scottish_landlord_register',
    name: 'Scottish Landlord Register',
    description: 'Landlord registration requirements and updates',
    url: 'https://www.landlordregistrationscotland.gov.uk/',
    jurisdictions: ['scotland'],
    topics: ['registration'],
    trustLevel: 'authoritative',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['ntl_landlord_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'first_tier_tribunal_scotland',
    name: 'First-tier Tribunal (Housing)',
    description: 'Scottish housing tribunal decisions and guidance',
    url: 'https://www.housingandpropertychamber.scot/',
    jurisdictions: ['scotland'],
    topics: ['eviction', 'notice_requirements'],
    trustLevel: 'official',
    isGovernmentSource: true,
    updateFrequency: 'weekly',
    ruleIdPrefixes: ['ntl_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },

  // -------------------------------------------------------------------------
  // CROSS-JURISDICTIONAL SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'gas_safe_register',
    name: 'Gas Safe Register',
    description: 'Gas safety certificate requirements',
    url: 'https://www.gassaferegister.co.uk/',
    jurisdictions: ['england', 'wales', 'scotland'],
    topics: ['safety_certificates'],
    trustLevel: 'authoritative',
    isGovernmentSource: false,
    updateFrequency: 'monthly',
    ruleIdPrefixes: ['s21_gas_', 's173_gas_', 'ntl_gas_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'epc_register',
    name: 'EPC Register',
    description: 'Energy Performance Certificate requirements',
    url: 'https://www.gov.uk/find-energy-certificate',
    jurisdictions: ['england', 'wales', 'scotland'],
    topics: ['energy_performance'],
    trustLevel: 'official',
    isGovernmentSource: true,
    updateFrequency: 'monthly',
    ruleIdPrefixes: ['s21_epc_', 's173_epc_', 'ntl_epc_'],
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },

  // -------------------------------------------------------------------------
  // INFORMATIONAL SOURCES
  // -------------------------------------------------------------------------
  {
    id: 'shelter_england',
    name: 'Shelter England',
    description: 'Housing charity guidance and analysis',
    url: 'https://england.shelter.org.uk/',
    jurisdictions: ['england'],
    topics: ['housing', 'eviction', 'tenancy'],
    trustLevel: 'informational',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
    notes: 'Good for early warnings and analysis, but verify with official sources',
  },
  {
    id: 'shelter_scotland',
    name: 'Shelter Scotland',
    description: 'Scottish housing charity guidance and analysis',
    url: 'https://scotland.shelter.org.uk/',
    jurisdictions: ['scotland'],
    topics: ['housing', 'eviction', 'tenancy'],
    trustLevel: 'informational',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'nrla',
    name: 'National Residential Landlords Association',
    description: 'Landlord association updates and guidance',
    url: 'https://www.nrla.org.uk/',
    jurisdictions: ['england', 'wales'],
    topics: ['housing', 'eviction', 'tenancy', 'licensing'],
    trustLevel: 'informational',
    isGovernmentSource: false,
    updateFrequency: 'weekly',
    enabled: true,
    requiresAuthentication: false,
    addedAt: '2026-01-26T00:00:00Z',
    addedBy: 'system',
  },
];

/**
 * Source groups for related monitoring.
 */
export const SOURCE_GROUPS: SourceGroup[] = [
  {
    id: 'england_eviction',
    name: 'England Eviction Sources',
    description: 'All sources relevant to England eviction notices (S21, S8)',
    sourceIds: [
      'uk_legislation_gov',
      'gov_uk_housing',
      'ministry_of_justice',
      'deposit_protection_service',
      'mydeposits',
      'tds',
      'selective_licensing_register',
      'gas_safe_register',
      'epc_register',
    ],
    jurisdictions: ['england'],
    topics: ['eviction', 'notice_requirements', 'deposit_protection', 'licensing'],
  },
  {
    id: 'wales_eviction',
    name: 'Wales Eviction Sources',
    description: 'All sources relevant to Wales eviction notices (S173)',
    sourceIds: [
      'uk_legislation_gov',
      'welsh_government_housing',
      'rent_smart_wales',
      'deposit_protection_service',
      'mydeposits',
      'tds',
      'gas_safe_register',
      'epc_register',
    ],
    jurisdictions: ['wales'],
    topics: ['eviction', 'notice_requirements', 'deposit_protection', 'registration'],
  },
  {
    id: 'scotland_eviction',
    name: 'Scotland Eviction Sources',
    description: 'All sources relevant to Scotland eviction notices (NTL)',
    sourceIds: [
      'uk_legislation_gov',
      'scottish_government_housing',
      'scottish_landlord_register',
      'first_tier_tribunal_scotland',
      'gas_safe_register',
      'epc_register',
    ],
    jurisdictions: ['scotland'],
    topics: ['eviction', 'notice_requirements', 'registration', 'pre_action_protocol'],
  },
  {
    id: 'deposit_protection',
    name: 'Deposit Protection Sources',
    description: 'All deposit protection scheme sources',
    sourceIds: ['deposit_protection_service', 'mydeposits', 'tds'],
    jurisdictions: ['england', 'wales'],
    topics: ['deposit_protection'],
  },
];

// ============================================================================
// REGISTRY FUNCTIONS
// ============================================================================

/**
 * Get all enabled sources.
 */
export function getEnabledSources(): LegalSource[] {
  return LEGAL_SOURCES.filter((s) => s.enabled);
}

/**
 * Get sources by jurisdiction.
 */
export function getSourcesByJurisdiction(jurisdiction: Jurisdiction): LegalSource[] {
  return LEGAL_SOURCES.filter(
    (s) => s.enabled && (s.jurisdictions.includes(jurisdiction) || s.jurisdictions.includes('uk_wide'))
  );
}

/**
 * Get sources by topic.
 */
export function getSourcesByTopic(topic: LegalTopic): LegalSource[] {
  return LEGAL_SOURCES.filter((s) => s.enabled && s.topics.includes(topic));
}

/**
 * Get sources by trust level or higher.
 */
export function getSourcesByTrustLevel(minLevel: TrustLevel): LegalSource[] {
  const levels: TrustLevel[] = ['authoritative', 'official', 'secondary', 'informational'];
  const minIndex = levels.indexOf(minLevel);
  return LEGAL_SOURCES.filter((s) => s.enabled && levels.indexOf(s.trustLevel) <= minIndex);
}

/**
 * Get source by ID.
 */
export function getSourceById(id: string): LegalSource | undefined {
  return LEGAL_SOURCES.find((s) => s.id === id);
}

/**
 * Get sources that may impact a specific rule.
 */
export function getSourcesForRule(ruleId: string): LegalSource[] {
  return LEGAL_SOURCES.filter((s) => {
    if (!s.enabled || !s.ruleIdPrefixes) return false;
    return s.ruleIdPrefixes.some((prefix) => ruleId.startsWith(prefix));
  });
}

/**
 * Get source group by ID.
 */
export function getSourceGroup(id: string): SourceGroup | undefined {
  return SOURCE_GROUPS.find((g) => g.id === id);
}

/**
 * Get sources in a group.
 */
export function getSourcesInGroup(groupId: string): LegalSource[] {
  const group = getSourceGroup(groupId);
  if (!group) return [];
  return group.sourceIds.map((id) => getSourceById(id)).filter((s): s is LegalSource => s !== undefined);
}

/**
 * Get sources due for checking based on frequency.
 */
export function getSourcesDueForCheck(): LegalSource[] {
  const now = new Date();

  return LEGAL_SOURCES.filter((s) => {
    if (!s.enabled || s.updateFrequency === 'manual') return false;
    if (!s.lastChecked) return true;

    const lastChecked = new Date(s.lastChecked);
    const hoursSinceCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);

    switch (s.updateFrequency) {
      case 'realtime':
        return hoursSinceCheck >= 1;
      case 'daily':
        return hoursSinceCheck >= 24;
      case 'weekly':
        return hoursSinceCheck >= 24 * 7;
      case 'monthly':
        return hoursSinceCheck >= 24 * 30;
      default:
        return false;
    }
  });
}

/**
 * Update source check timestamp.
 */
export function markSourceChecked(sourceId: string, changeDetected: boolean): void {
  const source = LEGAL_SOURCES.find((s) => s.id === sourceId);
  if (source) {
    source.lastChecked = new Date().toISOString();
    if (changeDetected) {
      source.lastChangeDetected = new Date().toISOString();
    }
  }
}

/**
 * Get registry summary statistics.
 */
export function getRegistryStats(): {
  totalSources: number;
  enabledSources: number;
  byJurisdiction: Record<Jurisdiction, number>;
  byTrustLevel: Record<TrustLevel, number>;
  byFrequency: Record<UpdateFrequency, number>;
} {
  const enabled = getEnabledSources();

  const byJurisdiction: Record<Jurisdiction, number> = {
    england: 0,
    wales: 0,
    scotland: 0,
    uk_wide: 0,
  };

  const byTrustLevel: Record<TrustLevel, number> = {
    authoritative: 0,
    official: 0,
    secondary: 0,
    informational: 0,
  };

  const byFrequency: Record<UpdateFrequency, number> = {
    realtime: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    manual: 0,
  };

  for (const source of enabled) {
    for (const j of source.jurisdictions) {
      byJurisdiction[j]++;
    }
    byTrustLevel[source.trustLevel]++;
    byFrequency[source.updateFrequency]++;
  }

  return {
    totalSources: LEGAL_SOURCES.length,
    enabledSources: enabled.length,
    byJurisdiction,
    byTrustLevel,
    byFrequency,
  };
}

/**
 * Export registry for backup/analysis.
 */
export function exportRegistry(): {
  sources: LegalSource[];
  groups: SourceGroup[];
  exportedAt: string;
} {
  return {
    sources: LEGAL_SOURCES,
    groups: SOURCE_GROUPS,
    exportedAt: new Date().toISOString(),
  };
}
