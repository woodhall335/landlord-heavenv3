'use client';

import React from 'react';
import { RiUserAddLine, RiUserLine } from 'react-icons/ri';
import { InlineSectionHeaderV3 } from '@/components/wizard/shared/InlineSectionHeaderV3';
import {
  MONEY_CLAIM_CARD_CLASS,
  MONEY_CLAIM_HINT_CLASS,
  MONEY_CLAIM_INLINE_NOTE_CLASS,
  MONEY_CLAIM_INPUT_CLASS,
  MONEY_CLAIM_LABEL_CLASS,
} from '@/components/wizard/money-claim/ui';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const DefendantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const tenants = facts.parties?.tenants || [];
  const mainTenant = tenants[0] || {};
  const secondTenant = tenants[1] || {};
  const hasJointDefendants = facts.has_joint_defendants === true;

  // Determine if second defendant has any data entered
  const updateFact = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  /**
   * Updates tenant data in both nested (parties.tenants[index].*) and top-level keys.
   * The validator expects top-level keys like tenant_full_name, defendant_address_line1, etc.
   * We maintain both for backward compatibility and to ensure validation works correctly.
   */
  const updateTenant = (index: number, field: string, value: string) => {
    const updatedTenants = [...tenants];
    const existing = updatedTenants[index] || {};
    updatedTenants[index] = {
      ...existing,
      [field]: value,
    };

    // Map nested fields to top-level validator keys (only for primary defendant - index 0)
    const topLevelKeyMap: Record<string, string> = {
      name: 'tenant_full_name',
      address_line1: 'defendant_address_line1',
      address_line2: 'defendant_address_line2',
      postcode: 'defendant_address_postcode',
      email: 'tenant_email',
      phone: 'tenant_phone',
    };

    const topLevelKey = index === 0 ? topLevelKeyMap[field] : undefined;

    const updates: Record<string, any> = {
      parties: {
        ...(facts.parties || {}),
        tenants: updatedTenants,
      },
    };

    // Also write to top-level key for validator compatibility (primary defendant only)
    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  const handleJointDefendantsToggle = (enabled: boolean) => {
    updateFact('has_joint_defendants', enabled);
    if (!enabled) {
      // Clear second defendant data when disabling
      const updatedTenants = [tenants[0] || {}];
      onUpdate({
        has_joint_defendants: false,
        parties: {
          ...(facts.parties || {}),
          tenants: updatedTenants,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        These are the people or companies you are claiming against. They will
        appear as the &quot;Defendant&quot;(s) on the court papers.
      </p>

      {/* Main Defendant Section */}
      <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-4`}>
        <div className="flex items-center gap-2">
          <RiUserLine className="w-5 h-5 text-gray-600" />
          <InlineSectionHeaderV3 title="Defendant 1 (Primary)" iconSlug="defendant" />
        </div>

        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={mainTenant.name || facts.tenant_full_name || ''}
            onChange={(e) => updateTenant(0, 'name', e.target.value)}
            placeholder="e.g. John Tenant"
          />
          <p className={MONEY_CLAIM_HINT_CLASS}>
            Match the tenant&apos;s legal name as shown on the tenancy agreement.
          </p>
        </div>

        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Service address line 1
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={mainTenant.address_line1 || facts.defendant_address_line1 || ''}
            onChange={(e) => updateTenant(0, 'address_line1', e.target.value)}
            placeholder="Usually the let property address"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Address line 2
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={mainTenant.address_line2 || facts.defendant_address_line2 || ''}
              onChange={(e) => updateTenant(0, 'address_line2', e.target.value)}
              placeholder="Town/city"
            />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Postcode
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={mainTenant.postcode || facts.defendant_address_postcode || ''}
              onChange={(e) => updateTenant(0, 'postcode', e.target.value)}
              placeholder="e.g. SW1A 1AA"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Email (if known)
            </label>
            <input
              type="email"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={mainTenant.email || ''}
              onChange={(e) => updateTenant(0, 'email', e.target.value)}
              placeholder="For correspondence"
            />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Phone (if known)
            </label>
            <input
              type="tel"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={mainTenant.phone || ''}
              onChange={(e) => updateTenant(0, 'phone', e.target.value)}
              placeholder="Daytime number"
            />
          </div>
        </div>
      </div>

      {/* Joint Defendants Toggle */}
      <div className="rounded-[1.5rem] border border-[#ddd2ff] bg-[#faf7ff] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasJointDefendants}
            onChange={(e) => handleJointDefendantsToggle(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="flex items-center gap-2 font-semibold text-[#27134a]">
              <RiUserAddLine className="w-4 h-4" />
              Add a second defendant (joint tenant)
            </span>
            <p className={`${MONEY_CLAIM_HINT_CLASS} mt-1`}>
              If the tenancy agreement was signed by two or more tenants, you may claim
              against both. Each is &quot;jointly and severally liable&quot; for the full amount.
            </p>
          </div>
        </label>
      </div>

      {/* Second Defendant Section - Only shown when toggled */}
      {hasJointDefendants && (
        <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-4`}>
          <div className="flex items-center gap-2">
            <RiUserLine className="w-5 h-5 text-purple-600" />
            <InlineSectionHeaderV3 title="Defendant 2 (Joint Tenant)" iconSlug="defendant" />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={secondTenant.name || ''}
              onChange={(e) => updateTenant(1, 'name', e.target.value)}
              placeholder="e.g. Jane Tenant"
            />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Service address line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={secondTenant.address_line1 || ''}
              onChange={(e) => updateTenant(1, 'address_line1', e.target.value)}
              placeholder="If different from Defendant 1"
            />
            <p className={MONEY_CLAIM_HINT_CLASS}>
              Can be the same as Defendant 1 if they still live together.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className={MONEY_CLAIM_LABEL_CLASS}>
                Address line 2
              </label>
              <input
                type="text"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={secondTenant.address_line2 || ''}
                onChange={(e) => updateTenant(1, 'address_line2', e.target.value)}
                placeholder="Town/city"
              />
            </div>

            <div className="space-y-1">
              <label className={MONEY_CLAIM_LABEL_CLASS}>
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={secondTenant.postcode || ''}
                onChange={(e) => updateTenant(1, 'postcode', e.target.value)}
                placeholder="e.g. SW1A 1AA"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className={MONEY_CLAIM_LABEL_CLASS}>
                Email (if known)
              </label>
              <input
                type="email"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={secondTenant.email || ''}
                onChange={(e) => updateTenant(1, 'email', e.target.value)}
                placeholder="For correspondence"
              />
            </div>

            <div className="space-y-1">
              <label className={MONEY_CLAIM_LABEL_CLASS}>
                Phone (if known)
              </label>
              <input
                type="tel"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={secondTenant.phone || ''}
                onChange={(e) => updateTenant(1, 'phone', e.target.value)}
                placeholder="Daytime number"
              />
            </div>
          </div>

          <div className={MONEY_CLAIM_INLINE_NOTE_CLASS}>
            <strong>Note:</strong> Both defendants will appear on the N1 form. The court will
            send papers to both addresses. They can each be pursued for the full amount.
          </div>
        </div>
      )}

      <p className={MONEY_CLAIM_HINT_CLASS}>
        The service address for each defendant is where court papers will be sent.
        This is usually the let property address or their current residence.
      </p>
    </div>
  );
};
