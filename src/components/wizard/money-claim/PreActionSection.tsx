'use client';

import React from 'react';
import { RiCheckboxCircleLine, RiInformationLine } from 'react-icons/ri';
import {
  MONEY_CLAIM_CARD_CLASS,
  MONEY_CLAIM_HINT_CLASS,
  MONEY_CLAIM_INPUT_CLASS,
  MONEY_CLAIM_LABEL_CLASS,
  MONEY_CLAIM_TINTED_CARD_CLASS,
} from '@/components/wizard/money-claim/ui';

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

  const getPreActionLetterSentValue = (): string => {
    if (facts.letter_before_claim_sent === true) {
      return 'yes';
    }
    if (moneyClaim.generate_pap_documents === true) {
      return 'no';
    }
    return '';
  };

  const handlePreActionLetterSentChange = (value: string) => {
    if (value === 'yes') {
      onUpdate({
        letter_before_claim_sent: true,
        money_claim: {
          ...moneyClaim,
          generate_pap_documents: false,
          pap_documents_sent: ['info_sheet', 'reply_form', 'arrears_sheet'],
        },
      });
    } else if (value === 'no') {
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

    if (field === 'lba_date') {
      updates.pap_letter_date = value;
    }

    onUpdate(updates);
  };

  const preActionLetterSent = getPreActionLetterSentValue();
  const showDateFields = preActionLetterSent === 'yes';
  const showGenerationNotice = preActionLetterSent === 'no';

  if (jurisdiction === 'scotland') {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-[#5a546e]">
          Pre-Action Protocol for Debt Claims does not apply in Scotland, but it is still good
          practice to send a formal demand letter before court action.
        </p>

        <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-3`}>
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Have you sent a formal demand letter to the tenant?
          </label>
          <select
            className={MONEY_CLAIM_INPUT_CLASS}
            value={preActionLetterSent}
            onChange={(e) => handlePreActionLetterSentChange(e.target.value)}
          >
            <option value="">Select</option>
            <option value="yes">Yes, I have sent a demand letter</option>
            <option value="no">No, I have not sent one yet</option>
          </select>
        </div>

        {showGenerationNotice && (
          <div className={`${MONEY_CLAIM_TINTED_CARD_CLASS} border-blue-200 bg-blue-50`}>
            <div className="flex items-start gap-3">
              <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  We&apos;ll generate a formal demand letter for you
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-800">
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
    <div className="space-y-5">
      <p className="text-sm leading-6 text-[#5a546e]">
        Before issuing a money claim, you usually need to send the pre-action debt documents and
        give the defendant time to respond.
      </p>

      <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-3`}>
        <label className={MONEY_CLAIM_LABEL_CLASS}>
          Have you already sent a Pre-Action Letter (Letter Before Claim) to the tenant?
        </label>
        <select
          className={MONEY_CLAIM_INPUT_CLASS}
          value={preActionLetterSent}
          onChange={(e) => handlePreActionLetterSentChange(e.target.value)}
        >
          <option value="">Select</option>
          <option value="yes">Yes, I have already sent a Pre-Action Letter</option>
          <option value="no">No, I have not sent one yet</option>
        </select>
        <p className={MONEY_CLAIM_HINT_CLASS}>
          If not, we will prepare the full pre-action pack so you can send it before filing.
        </p>
      </div>

      {showDateFields && (
        <div className={`${MONEY_CLAIM_TINTED_CARD_CLASS} border-green-200 bg-green-50`}>
          <div className="flex items-start gap-3">
            <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Great. Add the key dates from the letter you sent.
              </p>
              <p className="mt-1 text-sm leading-6 text-green-800">
                Make sure at least 30 days have passed before issuing the claim.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className={MONEY_CLAIM_LABEL_CLASS}>
                Date you sent the Pre-Action Letter <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={moneyClaim.lba_date || ''}
                onChange={(e) => updateMC('lba_date', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className={MONEY_CLAIM_LABEL_CLASS}>Response deadline you gave the tenant</label>
              <input
                type="date"
                className={MONEY_CLAIM_INPUT_CLASS}
                value={moneyClaim.lba_response_deadline || ''}
                onChange={(e) => updateMC('lba_response_deadline', e.target.value)}
              />
              <p className={MONEY_CLAIM_HINT_CLASS}>
                The debt protocol normally requires at least 30 days for a response.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <label className={MONEY_CLAIM_LABEL_CLASS}>How did you send the letter? (optional)</label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
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

      {showGenerationNotice && (
        <div className={`${MONEY_CLAIM_TINTED_CARD_CLASS} border-blue-200 bg-blue-50`}>
          <div className="flex items-start gap-3">
            <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  We&apos;ll generate the pre-action letter pack for you
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Before you can issue your claim, you must send these documents and wait at least
                  30 days for a response.
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {[
                  'Letter Before Claim',
                  'Information Sheet for Defendants',
                  'Reply Form',
                  'Financial Statement Form',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-blue-200 bg-white/85 px-4 py-3 text-sm text-blue-900"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                <strong>Important:</strong> After downloading your pack, you must send these
                documents to the tenant and wait 30 days before filing the court claim. Keep proof
                of service or postage.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
