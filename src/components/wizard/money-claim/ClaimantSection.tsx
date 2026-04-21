'use client';

import React from 'react';
import { InlineSectionHeaderV3 } from '@/components/wizard/shared/InlineSectionHeaderV3';
import {
  getMoneyClaimChoiceCardClass,
  MONEY_CLAIM_CARD_CLASS,
  MONEY_CLAIM_HINT_CLASS,
  MONEY_CLAIM_INPUT_CLASS,
  MONEY_CLAIM_LABEL_CLASS,
} from '@/components/wizard/money-claim/ui';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ClaimantSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const landlord = facts.parties?.landlord || {};

  /**
   * Updates landlord data in both nested (parties.landlord.*) and top-level keys.
   * The validator expects top-level keys like landlord_full_name, landlord_address_line1, etc.
   * We maintain both for backward compatibility and to ensure validation works correctly.
   */
  const updateLandlord = (field: string, value: string) => {
    // Map nested fields to top-level validator keys
    const topLevelKeyMap: Record<string, string> = {
      name: 'landlord_full_name',
      address_line1: 'landlord_address_line1',
      address_line2: 'landlord_address_line2',
      city: 'landlord_address_town',
      postcode: 'landlord_address_postcode',
      email: 'landlord_email',
      phone: 'landlord_phone',
      co_claimant: 'landlord_co_claimant',
    };

    const topLevelKey = topLevelKeyMap[field];

    const updates: Record<string, any> = {
      parties: {
        ...(facts.parties || {}),
        landlord: {
          ...landlord,
          [field]: value,
        },
      },
    };

    // Also write to top-level key for validator compatibility
    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...(facts.money_claim || {}),
        [field]: value,
      },
    });
  };

  /**
   * Updates landlord_is_company flag at both nested and top-level
   */
  const updateIsCompany = (isCompany: boolean) => {
    onUpdate({
      landlord_is_company: isCompany,
      parties: {
        ...(facts.parties || {}),
        landlord: {
          ...landlord,
          is_company: isCompany,
        },
      },
    });
  };

  /**
   * Updates company name at both nested and top-level
   */
  const updateCompanyName = (name: string) => {
    onUpdate({
      company_name: name,
      parties: {
        ...(facts.parties || {}),
        landlord: {
          ...landlord,
          company_name: name,
        },
      },
    });
  };

  const referenceValue =
    facts.money_claim?.reference ?? landlord.reference ?? '';
  const isCompany = facts.landlord_is_company ?? landlord.is_company ?? false;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        These details will appear on the claim form as the &quot;Claimant&quot;.
        Use the legal names and contact details you want the court and the
        defendant to see.
      </p>

      {/* Company/Individual toggle */}
      <div className={MONEY_CLAIM_CARD_CLASS}>
        <label className={MONEY_CLAIM_LABEL_CLASS}>
          Are you claiming as an individual or a company?
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={() => updateIsCompany(false)}
            className={getMoneyClaimChoiceCardClass(!isCompany)}
          >
            <span className="text-sm font-semibold text-[#241742]">Individual landlord</span>
            <span className="mt-1 block text-left text-xs leading-5 text-[#6b6580]">
              Use your personal name if you are claiming in your own name rather than through a registered company.
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateIsCompany(true)}
            className={getMoneyClaimChoiceCardClass(isCompany)}
          >
            <span className="text-sm font-semibold text-[#241742]">Company / organisation</span>
            <span className="mt-1 block text-left text-xs leading-5 text-[#6b6580]">
              Use the full registered company or organisation name that should appear on the N1 claim form.
            </span>
          </button>
        </div>
      </div>

      {/* Names - varies based on company or individual */}
      {isCompany ? (
        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Company / Organisation name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={facts.company_name || landlord.company_name || ''}
            onChange={(e) => updateCompanyName(e.target.value)}
            placeholder="e.g. ABC Lettings Ltd"
          />
          <p className={MONEY_CLAIM_HINT_CLASS}>
            Enter the full registered company name as it appears on Companies House.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Claimant full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={landlord.name || facts.landlord_full_name || ''}
              onChange={(e) => updateLandlord('name', e.target.value)}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Second claimant (if joint landlord)
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={landlord.co_claimant || facts.landlord_co_claimant || ''}
              onChange={(e) => updateLandlord('co_claimant', e.target.value)}
              placeholder="Leave blank if there is only one landlord"
            />
          </div>
        </div>
      )}

      {/* Contact details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>Email</label>
          <input
            type="email"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={landlord.email || ''}
            onChange={(e) => updateLandlord('email', e.target.value)}
            placeholder="For court updates and settlement offers"
          />
        </div>

        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>Phone</label>
          <input
            type="tel"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={landlord.phone || ''}
            onChange={(e) => updateLandlord('phone', e.target.value)}
            placeholder="Daytime contact number (optional)"
          />
        </div>
      </div>

      {/* Postal address */}
      <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-3`}>
        <InlineSectionHeaderV3 title="Claimant postal address" iconSlug="claimant" />
        <p className={MONEY_CLAIM_HINT_CLASS}>
          This is the address that will appear on the court papers. If you use a
          managing agent or solicitor for service, we&apos;ll collect that later.
        </p>

        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Address line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={landlord.address_line1 || facts.landlord_address_line1 || ''}
            onChange={(e) => updateLandlord('address_line1', e.target.value)}
            placeholder="e.g. 10 High Street"
          />
        </div>

        <div className="space-y-1">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Address line 2 (optional)
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={landlord.address_line2 || facts.landlord_address_line2 || ''}
            onChange={(e) => updateLandlord('address_line2', e.target.value)}
            placeholder="Building, estate or area"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Town / city
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={landlord.city || facts.landlord_address_town || ''}
              onChange={(e) => updateLandlord('city', e.target.value)}
              placeholder="e.g. Manchester"
            />
          </div>

          <div className="space-y-1">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Postcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={landlord.postcode || facts.landlord_address_postcode || ''}
              onChange={(e) => updateLandlord('postcode', e.target.value)}
              placeholder="e.g. M1 2AB"
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="space-y-1">
        <label className={MONEY_CLAIM_LABEL_CLASS}>
          Reference to show on claim (optional)
        </label>
        <input
          type="text"
          className={MONEY_CLAIM_INPUT_CLASS}
          value={referenceValue}
          onChange={(e) => updateMoneyClaim('reference', e.target.value)}
          placeholder="Internal account/reference you want printed on the claim"
        />
        <p className={MONEY_CLAIM_HINT_CLASS}>
          This will appear in the reference box on the claim form header so you
          can match court papers back to your system.
        </p>
      </div>
    </div>
  );
};
