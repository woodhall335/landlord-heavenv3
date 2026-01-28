'use client';

import React, { useState } from 'react';
import { RiUserAddLine, RiUserLine } from 'react-icons/ri';

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
  const hasSecondDefendantData = Boolean(
    secondTenant.name ||
    secondTenant.address_line1 ||
    secondTenant.postcode
  );

  const updateFact = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const updateTenant = (index: number, field: string, value: string) => {
    const updatedTenants = [...tenants];
    const existing = updatedTenants[index] || {};
    updatedTenants[index] = {
      ...existing,
      [field]: value,
    };

    onUpdate({
      parties: {
        ...(facts.parties || {}),
        tenants: updatedTenants,
      },
    });
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
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-2">
          <RiUserLine className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-charcoal">Defendant 1 (Primary)</h3>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={mainTenant.name || ''}
            onChange={(e) => updateTenant(0, 'name', e.target.value)}
            placeholder="e.g. John Tenant"
          />
          <p className="text-xs text-gray-500">
            Match the tenant&apos;s legal name as shown on the tenancy agreement.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Service address line 1
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={mainTenant.address_line1 || ''}
            onChange={(e) => updateTenant(0, 'address_line1', e.target.value)}
            placeholder="Usually the let property address"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Address line 2
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={mainTenant.address_line2 || ''}
              onChange={(e) => updateTenant(0, 'address_line2', e.target.value)}
              placeholder="Town/city"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Postcode
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={mainTenant.postcode || ''}
              onChange={(e) => updateTenant(0, 'postcode', e.target.value)}
              placeholder="e.g. SW1A 1AA"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Email (if known)
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={mainTenant.email || ''}
              onChange={(e) => updateTenant(0, 'email', e.target.value)}
              placeholder="For correspondence"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Phone (if known)
            </label>
            <input
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={mainTenant.phone || ''}
              onChange={(e) => updateTenant(0, 'phone', e.target.value)}
              placeholder="Daytime number"
            />
          </div>
        </div>
      </div>

      {/* Joint Defendants Toggle */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasJointDefendants}
            onChange={(e) => handleJointDefendantsToggle(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="font-medium text-charcoal flex items-center gap-2">
              <RiUserAddLine className="w-4 h-4" />
              Add a second defendant (joint tenant)
            </span>
            <p className="text-xs text-gray-600 mt-1">
              If the tenancy agreement was signed by two or more tenants, you may claim
              against both. Each is &quot;jointly and severally liable&quot; for the full amount.
            </p>
          </div>
        </label>
      </div>

      {/* Second Defendant Section - Only shown when toggled */}
      {hasJointDefendants && (
        <div className="rounded-lg border border-purple-200 bg-white p-4 space-y-4">
          <div className="flex items-center gap-2">
            <RiUserLine className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Defendant 2 (Joint Tenant)</h3>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={secondTenant.name || ''}
              onChange={(e) => updateTenant(1, 'name', e.target.value)}
              placeholder="e.g. Jane Tenant"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Service address line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={secondTenant.address_line1 || ''}
              onChange={(e) => updateTenant(1, 'address_line1', e.target.value)}
              placeholder="If different from Defendant 1"
            />
            <p className="text-xs text-gray-500">
              Can be the same as Defendant 1 if they still live together.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Address line 2
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={secondTenant.address_line2 || ''}
                onChange={(e) => updateTenant(1, 'address_line2', e.target.value)}
                placeholder="Town/city"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={secondTenant.postcode || ''}
                onChange={(e) => updateTenant(1, 'postcode', e.target.value)}
                placeholder="e.g. SW1A 1AA"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Email (if known)
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={secondTenant.email || ''}
                onChange={(e) => updateTenant(1, 'email', e.target.value)}
                placeholder="For correspondence"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Phone (if known)
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={secondTenant.phone || ''}
                onChange={(e) => updateTenant(1, 'phone', e.target.value)}
                placeholder="Daytime number"
              />
            </div>
          </div>

          <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>Note:</strong> Both defendants will appear on the N1 form. The court will
            send papers to both addresses. They can each be pursued for the full amount.
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        The service address for each defendant is where court papers will be sent.
        This is usually the let property address or their current residence.
      </p>
    </div>
  );
};
