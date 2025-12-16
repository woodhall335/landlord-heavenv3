'use client';

import React from 'react';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const PreActionSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const moneyClaim = facts.money_claim || {};

  const updateMC = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We use this to check Pre-Action Protocol (PAP) compliance and generate your letter of claim
        and information sheets.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Date you last sent a demand or letter before action
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={moneyClaim.lba_date || ''}
            onChange={(e) => updateMC('lba_date', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Response deadline you gave the tenant (if any)
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={moneyClaim.lba_response_deadline || ''}
            onChange={(e) => updateMC('lba_response_deadline', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          How did you send the most recent demand or letter?
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="For example: email and first class post"
          value={(moneyClaim.lba_method || []).join(', ') || ''}
          onChange={(e) =>
            updateMC(
              'lba_method',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      {jurisdiction === 'england-wales' && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Have you sent the Pre-Action Protocol information pack?
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={
              Array.isArray(moneyClaim.pap_documents_sent) &&
              moneyClaim.pap_documents_sent.length > 0
                ? 'yes'
                : moneyClaim.pap_documents_sent === false ||
                  moneyClaim.pap_documents_sent === null ||
                  (Array.isArray(moneyClaim.pap_documents_sent) &&
                    moneyClaim.pap_documents_sent.length === 0)
                ? 'no'
                : ''
            }
            onChange={(e) =>
              updateMC(
                'pap_documents_sent',
                e.target.value === 'yes'
                  ? ['info_sheet', 'reply_form', 'arrears_sheet']
                  : e.target.value === 'no'
                  ? false
                  : null,
              )
            }
          >
            <option value="">Select</option>
            <option value="yes">Yes, I have sent the PAP documents</option>
            <option value="no">No, I have not sent them</option>
          </select>
        </div>
      )}
    </div>
  );
};
