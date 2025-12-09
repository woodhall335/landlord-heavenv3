'use client';

import React from 'react';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const DefendantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const tenants = facts.parties?.tenants || [];
  const mainTenant = tenants[0] || {};

  const updateMainTenant = (field: string, value: string) => {
    const updatedTenants = [...tenants];
    updatedTenants[0] = {
      ...mainTenant,
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
        Tell us about the tenant (defendant). You can add additional defendants in a later upgrade.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Defendant full name</label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={mainTenant.name || ''}
          onChange={(e) => updateMainTenant('name', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Defendant email <span className="text-xs text-gray-500">(if known)</span>
        </label>
        <input
          type="email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={mainTenant.email || ''}
          onChange={(e) => updateMainTenant('email', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Defendant phone <span className="text-xs text-gray-500">(if known)</span>
        </label>
        <input
          type="tel"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={mainTenant.phone || ''}
          onChange={(e) => updateMainTenant('phone', e.target.value)}
        />
      </div>
    </div>
  );
};
