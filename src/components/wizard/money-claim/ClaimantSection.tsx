'use client';

import React from 'react';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ClaimantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const landlord = facts.parties?.landlord || {};

  const updateLandlord = (field: string, value: string) => {
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

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...(facts.money_claim || {}),
        [field]: value,
      },
    });
  };

  const referenceValue =
    facts.money_claim?.reference ?? landlord.reference ?? '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        These details will appear on the claim form as the &quot;Claimant&quot;.
        Use the legal names and contact details you want the court and the
        defendant to see.
      </p>

      {/* Names */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Claimant full name
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.name || ''}
            onChange={(e) => updateLandlord('name', e.target.value)}
            placeholder="e.g. Jane Smith"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Second claimant (if joint landlord)
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.co_claimant || ''}
            onChange={(e) => updateLandlord('co_claimant', e.target.value)}
            placeholder="Leave blank if there is only one landlord"
          />
        </div>
      </div>

      {/* Contact details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.email || ''}
            onChange={(e) => updateLandlord('email', e.target.value)}
            placeholder="For court updates and settlement offers"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">Phone</label>
          <input
            type="tel"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.phone || ''}
            onChange={(e) => updateLandlord('phone', e.target.value)}
            placeholder="Daytime contact number (optional)"
          />
        </div>
      </div>

      {/* Postal address */}
      <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
        <h3 className="text-sm font-medium text-charcoal">
          Claimant postal address
        </h3>
        <p className="text-xs text-gray-600">
          This is the address that will appear on the court papers. If you use a
          managing agent or solicitor for service, we&apos;ll collect that later.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-medium text-charcoal">
            Address line 1
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.address_line1 || ''}
            onChange={(e) => updateLandlord('address_line1', e.target.value)}
            placeholder="e.g. 10 High Street"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-charcoal">
            Address line 2 (optional)
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={landlord.address_line2 || ''}
            onChange={(e) => updateLandlord('address_line2', e.target.value)}
            placeholder="Building, estate or area"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">
              Town / city
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={landlord.city || ''}
              onChange={(e) => updateLandlord('city', e.target.value)}
              placeholder="e.g. Manchester"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">
              Postcode
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={landlord.postcode || ''}
              onChange={(e) => updateLandlord('postcode', e.target.value)}
              placeholder="e.g. M1 2AB"
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Reference to show on claim (optional)
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={referenceValue}
          onChange={(e) => updateMoneyClaim('reference', e.target.value)}
          placeholder="Internal account/reference you want printed on the claim"
        />
        <p className="text-xs text-gray-500">
          This will appear in the reference box on the claim form header so you
          can match court papers back to your system.
        </p>
      </div>
    </div>
  );
};
