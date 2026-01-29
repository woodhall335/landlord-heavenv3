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

  /**
   * Determine the current state of pre-action letter:
   * - 'yes': User has already sent a letter before claim
   * - 'no': User has NOT sent a letter, we will generate one
   * - '': No selection made yet
   */
  const getPreActionLetterSentValue = (): string => {
    // Explicitly selected "yes" - they've already sent the letter
    if (facts.letter_before_claim_sent === true) {
      return 'yes';
    }
    // Explicitly selected "no" - we need to generate the letter
    if (moneyClaim.generate_pap_documents === true) {
      return 'no';
    }
    // No selection yet
    return '';
  };

  /**
   * Handle pre-action letter sent selection
   * - Yes: They've already sent it, ask for dates
   * - No: We'll generate it for them as part of the bundle
   */
  const handlePreActionLetterSentChange = (value: string) => {
    if (value === 'yes') {
      // User has already sent a pre-action letter
      onUpdate({
        letter_before_claim_sent: true,
        money_claim: {
          ...moneyClaim,
          generate_pap_documents: false,
          pap_documents_sent: ['info_sheet', 'reply_form', 'arrears_sheet'],
        },
      });
    } else if (value === 'no') {
      // User has NOT sent a letter - we'll generate one for them
      onUpdate({
        letter_before_claim_sent: false,
        pap_letter_date: null,
        money_claim: {
          ...moneyClaim,
          generate_pap_documents: true,
          pap_documents_sent: false,
          lba_date: null,
          lba_response_deadline: null,
          lba_method: null,
        },
      });
    } else {
      // Cleared selection
      onUpdate({
        letter_before_claim_sent: null,
        pap_letter_date: null,
        money_claim: {
          ...moneyClaim,
          generate_pap_documents: null,
          pap_documents_sent: null,
        },
      });
    }
  };

  const updateMC = (field: string, value: any) => {
    const updates: Record<string, any> = {
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    };

    // If updating lba_date, also update top-level pap_letter_date for compatibility
    if (field === 'lba_date') {
      updates.pap_letter_date = value;
    }

    onUpdate(updates);
  };

  const preActionLetterSent = getPreActionLetterSentValue();
  const showDateFields = preActionLetterSent === 'yes';
  const showGenerationNotice = preActionLetterSent === 'no';

  // For Scotland, PAP-DEBT doesn't apply - show simplified version
  if (jurisdiction === 'scotland') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Pre-Action Protocol for Debt Claims (PAP-DEBT) does not apply in Scotland.
          However, it&apos;s still good practice to send a formal demand letter before court action.
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Have you sent a formal demand letter to the tenant?
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={preActionLetterSent}
            onChange={(e) => handlePreActionLetterSentChange(e.target.value)}
          >
            <option value="">Select</option>
            <option value="yes">Yes, I have sent a demand letter</option>
            <option value="no">No, I have not sent one yet</option>
          </select>
        </div>

        {showGenerationNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <RiInformationLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  We&apos;ll generate a formal demand letter for you
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Your document pack will include a Letter Before Claim that you can send to the tenant
                  before issuing court proceedings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        The Pre-Action Protocol for Debt Claims (PAP-DEBT) requires you to send certain documents
        to the tenant before starting a court claim.
      </p>

      {/* Primary question: Have you sent a Pre-Action Letter? */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Have you already sent a Pre-Action Letter (Letter Before Claim) to the tenant?
        </label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={preActionLetterSent}
          onChange={(e) => handlePreActionLetterSentChange(e.target.value)}
        >
          <option value="">Select</option>
          <option value="yes">Yes, I have already sent a Pre-Action Letter</option>
          <option value="no">No, I have not sent one yet</option>
        </select>
      </div>

      {/* If YES - show date fields */}
      {showDateFields && (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <RiCheckboxCircleLine className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Great! Please provide the details of your letter
              </p>
              <p className="text-sm text-green-800 mt-1">
                Make sure 30 days have passed since sending before issuing the claim.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Date you sent the Pre-Action Letter <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={moneyClaim.lba_date || ''}
                onChange={(e) => updateMC('lba_date', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-charcoal">
                Response deadline you gave the tenant
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={moneyClaim.lba_response_deadline || ''}
                onChange={(e) => updateMC('lba_response_deadline', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                PAP-DEBT requires at least 30 days for a response.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              How did you send the letter? (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              placeholder="For example: email and first class post"
              value={(moneyClaim.lba_method || []).join(', ') || ''}
              onChange={(e) =>
                updateMC(
                  'lba_method',
                  e.target.value
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
        </div>
      )}

      {/* If NO - show generation notice */}
      {showGenerationNotice && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <RiInformationLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                We&apos;ll generate a Pre-Action Letter pack for you
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
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mt-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> After downloading your pack, you must send these documents
                  to the tenant and wait 30 days before filing the court claim. Keep proof of postage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
