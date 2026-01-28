'use client';

import React from 'react';
import { RiInformationLine, RiCheckboxCircleLine } from 'react-icons/ri';

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

  /**
   * Handle PAP documents sent selection
   * When "No" is selected, we need to:
   * 1. Store pap_documents_sent as false
   * 2. Set a flag to indicate PAP documents should be generated
   * 3. Also set top-level letter_before_claim_sent for compatibility
   */
  const handlePapDocumentsSentChange = (value: string) => {
    const papDocumentsSent = value === 'yes'
      ? ['info_sheet', 'reply_form', 'arrears_sheet']
      : value === 'no'
        ? false
        : null;

    const generatePapDocuments = value === 'no';

    onUpdate({
      // Top-level keys for compatibility
      letter_before_claim_sent: value === 'yes',
      pap_letter_date: value === 'yes' ? moneyClaim.lba_date || null : null,
      // Nested money_claim keys
      money_claim: {
        ...moneyClaim,
        pap_documents_sent: papDocumentsSent,
        generate_pap_documents: generatePapDocuments,
      },
    });
  };

  // Check if PAP documents need to be generated
  const needsGeneratedPapDocuments =
    moneyClaim.pap_documents_sent === false ||
    moneyClaim.generate_pap_documents === true;

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

      {(jurisdiction === 'england' || jurisdiction === 'wales') && (
        <div className="space-y-3">
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
                    moneyClaim.generate_pap_documents === true
                  ? 'no'
                  : ''
              }
              onChange={(e) => handlePapDocumentsSentChange(e.target.value)}
            >
              <option value="">Select</option>
              <option value="yes">Yes, I have sent the PAP documents</option>
              <option value="no">No, I have not sent them</option>
            </select>
            <p className="text-xs text-gray-500">
              The Pre-Action Protocol (PAP-DEBT) requires you to send certain documents before starting a court claim.
            </p>
          </div>

          {/* PAP Documents Generation Notice */}
          {needsGeneratedPapDocuments && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <RiInformationLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    We&apos;ll generate these PAP documents for you
                  </p>
                  <p className="text-sm text-blue-800">
                    Before you can issue your court claim, you must send the Pre-Action Protocol
                    documents to the defendant and wait at least 30 days for a response.
                    Your document pack will include:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 ml-1">
                    <li className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="w-4 h-4 text-blue-600" />
                      <span><strong>Letter Before Claim</strong> - Formal notice of your intention to sue</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="w-4 h-4 text-blue-600" />
                      <span><strong>Information Sheet for Defendants</strong> - Standard info sheet explaining their rights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="w-4 h-4 text-blue-600" />
                      <span><strong>Reply Form</strong> - For the defendant to propose a payment plan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="w-4 h-4 text-blue-600" />
                      <span><strong>Financial Statement Form</strong> - For the defendant to disclose their finances</span>
                    </li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    Send these documents by post and keep proof of postage. The 30-day response period
                    starts from the date of sending.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Already sent confirmation */}
          {Array.isArray(moneyClaim.pap_documents_sent) && moneyClaim.pap_documents_sent.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <RiCheckboxCircleLine className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    PAP documents already sent
                  </p>
                  <p className="text-sm text-green-800">
                    You&apos;ve confirmed that you already sent the Pre-Action Protocol documents.
                    Make sure 30 days have passed since sending before issuing the claim.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
