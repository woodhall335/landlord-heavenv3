'use client';

import React from 'react';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ClaimantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const landlord = facts.parties?.landlord || {};

  const handleChange = (field: string, value: string) => {
    onUpdate({
      parties: {
        ...(facts.parties || {}),
        landlord: {
          ...landlord,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Tell us about the landlord (claimant). If there is more than one landlord, we’ll ask for the
        second claimant separately in later iterations.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Claimant full name</label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={landlord.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Email</label>
        <input
          type="email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={landlord.email || landlord.contact_email || ''}
          onChange={(e) => handleChange('contact_email', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Phone</label>
        <input
          type="tel"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={landlord.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Reference to show on claim (optional)</label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={landlord.reference || facts.money_claim?.reference || ''}
          onChange={(e) =>
            onUpdate({
              money_claim: {
                ...(facts.money_claim || {}),
                reference: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
};
