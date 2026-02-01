/**
 * Tenancy Summary Panel
 *
 * Displays key facts from a tenancy agreement case after payment success.
 * Currently optimized for Scottish PRTs but extensible to other jurisdictions.
 */

'use client';

import React from 'react';
import { RiHomeLine, RiUser3Line, RiTeamLine, RiCalendarLine, RiWallet3Line, RiShieldCheckLine, RiFileListLine } from 'react-icons/ri';
import { Card } from '@/components/ui/Card';
import type { CanonicalJurisdiction } from '@/lib/tenancy/product-normalization';

interface TenancySummaryPanelProps {
  /** Case collected_facts from the database */
  collectedFacts: Record<string, any>;
  /** Case jurisdiction */
  jurisdiction: CanonicalJurisdiction;
  /** Whether this is a premium tier purchase */
  isPremium: boolean;
}

interface SummaryField {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}

/**
 * Format rent frequency for display
 */
function formatRentFrequency(frequency: string | null | undefined): string {
  if (!frequency) return 'per month';
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return 'per week';
    case 'fortnightly':
      return 'every 2 weeks';
    case 'monthly':
      return 'per month';
    case 'quarterly':
      return 'per quarter';
    case 'yearly':
      return 'per year';
    default:
      return 'per month';
  }
}

/**
 * Format rent due day for display
 */
function formatRentDueDay(dueDay: string | number | null | undefined): string {
  if (!dueDay) return '1st';
  const day = typeof dueDay === 'string' ? parseInt(dueDay, 10) : dueDay;
  if (isNaN(day)) return String(dueDay);

  const suffix = (d: number) => {
    if (d >= 11 && d <= 13) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${day}${suffix(day)}`;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '-';
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Build property address from collected facts
 */
function buildPropertyAddress(facts: Record<string, any>): string {
  // Try flat address first
  if (facts.property_address && typeof facts.property_address === 'string') {
    return facts.property_address;
  }

  // Build from components
  const parts: string[] = [];
  if (facts.property_address_line1) parts.push(facts.property_address_line1);
  if (facts.property_address_line2) parts.push(facts.property_address_line2);
  if (facts.property_address_town) parts.push(facts.property_address_town);
  if (facts.property_address_postcode) parts.push(facts.property_address_postcode);

  return parts.join(', ') || '-';
}

/**
 * Get tenant names from collected facts
 */
function getTenantNames(facts: Record<string, any>): string[] {
  const names: string[] = [];

  // Check for indexed tenants (tenants.0.full_name, tenants.1.full_name, etc.)
  for (let i = 0; i < 10; i++) {
    const name = facts[`tenants.${i}.full_name`] || facts[`tenant_${i + 1}_full_name`];
    if (name) names.push(name);
  }

  // Check for tenant_full_name (single tenant)
  if (names.length === 0 && facts.tenant_full_name) {
    names.push(facts.tenant_full_name);
  }

  // Check for tenants array
  if (names.length === 0 && Array.isArray(facts.tenants)) {
    facts.tenants.forEach((t: any) => {
      if (t.full_name || t.name) names.push(t.full_name || t.name);
    });
  }

  return names;
}

/**
 * Get jurisdiction-specific agreement type label
 */
function getAgreementTypeLabel(jurisdiction: CanonicalJurisdiction, isHmo: boolean, isPremium: boolean): string {
  switch (jurisdiction) {
    case 'scotland':
      if (isHmo || isPremium) {
        return 'HMO Private Residential Tenancy (Scotland)';
      }
      return 'Private Residential Tenancy (Scotland)';
    case 'wales':
      if (isHmo || isPremium) {
        return 'HMO Occupation Contract (Wales)';
      }
      return 'Standard Occupation Contract (Wales)';
    case 'northern-ireland':
      if (isHmo || isPremium) {
        return 'HMO Private Tenancy (Northern Ireland)';
      }
      return 'Private Tenancy (Northern Ireland)';
    case 'england':
    default:
      if (isHmo || isPremium) {
        return 'HMO Assured Shorthold Tenancy';
      }
      return 'Assured Shorthold Tenancy';
  }
}

/**
 * Get tenancy duration copy based on jurisdiction
 */
function getTenancyDurationCopy(jurisdiction: CanonicalJurisdiction, facts: Record<string, any>): string {
  // Scotland PRTs are always open-ended
  if (jurisdiction === 'scotland') {
    return 'Open-ended (no fixed term)';
  }

  // For other jurisdictions, check if fixed term
  const isFixedTerm = facts.is_fixed_term === true || facts.fixed_term === true;
  const fixedTermMonths = facts.fixed_term_months || facts.tenancy_term_months;

  if (isFixedTerm && fixedTermMonths) {
    return `Fixed term: ${fixedTermMonths} month${fixedTermMonths === 1 ? '' : 's'}`;
  }

  return 'Periodic (rolling)';
}

/**
 * Get Scottish deposit scheme display name
 */
function getDepositSchemeDisplay(facts: Record<string, any>): string {
  const scheme = facts.deposit_scheme_name || facts.deposit_scheme;
  if (!scheme) return '-';

  const normalized = scheme.toLowerCase();
  if (normalized.includes('safedeposits')) return 'SafeDeposits Scotland';
  if (normalized.includes('mydeposits')) return 'MyDeposits Scotland';
  if (normalized.includes('letting protection') || normalized.includes('lps')) return 'Letting Protection Service Scotland';

  return scheme;
}

export function TenancySummaryPanel({
  collectedFacts,
  jurisdiction,
  isPremium,
}: TenancySummaryPanelProps) {
  const isHmo = collectedFacts.is_hmo === true || collectedFacts.hmo_licence_status === 'licensed';
  const landlordName = collectedFacts.landlord_full_name || collectedFacts.landlord_name || '-';
  const tenantNames = getTenantNames(collectedFacts);
  const propertyAddress = buildPropertyAddress(collectedFacts);
  const startDate = collectedFacts.tenancy_start_date || collectedFacts.start_date;
  const rentAmount = collectedFacts.rent_amount;
  const rentFrequency = collectedFacts.rent_frequency || collectedFacts.rent_period;
  const rentDueDay = collectedFacts.rent_due_day;
  const depositAmount = collectedFacts.deposit_amount;
  const depositScheme = getDepositSchemeDisplay(collectedFacts);

  return (
    <Card padding="large" className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <RiFileListLine className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-charcoal">Tenancy Summary</h2>
          <p className="text-sm text-gray-600">
            Key details from your tenancy agreement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agreement Type */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiShieldCheckLine className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Agreement Type</p>
              <p className="font-semibold text-charcoal">
                {getAgreementTypeLabel(jurisdiction, isHmo, isPremium)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getTenancyDurationCopy(jurisdiction, collectedFacts)}
              </p>
            </div>
          </div>
        </div>

        {/* Property Address */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiHomeLine className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Property Address</p>
              <p className="font-semibold text-charcoal">{propertyAddress}</p>
            </div>
          </div>
        </div>

        {/* Tenancy Start Date */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiCalendarLine className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Tenancy Start Date</p>
              <p className="font-semibold text-charcoal">{formatDate(startDate)}</p>
            </div>
          </div>
        </div>

        {/* Rent Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiWallet3Line className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Rent</p>
              <p className="font-semibold text-charcoal">
                {formatCurrency(rentAmount)} {formatRentFrequency(rentFrequency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Due on the {formatRentDueDay(rentDueDay)} of each period
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiShieldCheckLine className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Deposit</p>
              <p className="font-semibold text-charcoal">{formatCurrency(depositAmount)}</p>
              {jurisdiction === 'scotland' && depositScheme !== '-' && (
                <p className="text-xs text-gray-500 mt-1">
                  Protected with: {depositScheme}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Landlord */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RiUser3Line className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Landlord</p>
              <p className="font-semibold text-charcoal">{landlordName}</p>
            </div>
          </div>
        </div>

        {/* Tenant(s) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:col-span-2">
          <div className="flex items-start gap-3">
            <RiTeamLine className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Tenant{tenantNames.length !== 1 ? 's' : ''}
              </p>
              {tenantNames.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {tenantNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-white border border-gray-200 px-2 py-1 rounded text-sm font-medium text-charcoal"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-charcoal">-</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence-building footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Your tenancy agreement has been generated using the information above.
          Please review the documents carefully before signing.
        </p>
      </div>
    </Card>
  );
}
