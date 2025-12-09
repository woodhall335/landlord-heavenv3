'use client';

import React from 'react';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const DefendantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const tenants = facts.parties?.tenants || [];
  const mainTenant = tenants[0] || {};
  const secondTenant = tenants[1] || {};

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

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        These are the people or companies you are claiming against. They will
        appear as the &quot;Defendant&quot;(s) on the court papers.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Defendant full name
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
          Second defendant (if joint tenant)
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={secondTenant.name || ''}
          onChange={(e) => updateTenant(1, 'name', e.target.value)}
          placeholder="Leave blank if there is only one tenant"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Defendant email (if known)
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={mainTenant.email || ''}
            onChange={(e) => updateTenant(0, 'email', e.target.value)}
            placeholder="Used for arrears discussions or correspondence"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Defendant phone (if known)
          </label>
          <input
            type="tel"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={mainTenant.phone || ''}
            onChange={(e) => updateTenant(0, 'phone', e.target.value)}
            placeholder="Daytime number used when discussing payment"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        The service address for the defendant will usually be the let property
        address you enter in the next section. If they should be served
        somewhere else, you&apos;ll be able to explain that later in the court
        details.
      </p>
    </div>
  );
};
