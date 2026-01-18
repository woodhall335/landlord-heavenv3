/**
 * Scotland Grounds Section - Eviction Wizard
 *
 * Allows selection of Scotland eviction grounds.
 * ALL GROUNDS IN SCOTLAND ARE DISCRETIONARY - the First-tier Tribunal has discretion on all grounds.
 *
 * Ground data is loaded DYNAMICALLY from config - NEVER hardcode ground numbers or labels.
 *
 * Fields:
 * - scotland_eviction_ground: The selected ground number
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  getScotlandGrounds,
  getGroundsByNoticePeriod,
  type ScotlandGround,
} from '@/lib/scotland/grounds';

interface ScotlandGroundsSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Optional callback to set the current question ID for Ask Heaven context */
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
}

export const ScotlandGroundsSection: React.FC<ScotlandGroundsSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
}) => {
  // Load grounds dynamically from config
  const grounds = useMemo(() => getScotlandGrounds(), []);
  const { shortNotice, standardNotice } = useMemo(() => getGroundsByNoticePeriod(), []);

  const selectedGround = facts.scotland_eviction_ground as number | undefined;

  // Set current question ID for Ask Heaven context when section renders
  useEffect(() => {
    if (onSetCurrentQuestionId) {
      onSetCurrentQuestionId('scotland_eviction_ground');
    }
    return () => {
      if (onSetCurrentQuestionId) {
        onSetCurrentQuestionId(undefined);
      }
    };
  }, [onSetCurrentQuestionId]);

  const handleGroundSelect = (groundNumber: number) => {
    const ground = grounds.find(g => g.number === groundNumber);
    // Write both Scotland-specific fields AND generic ground_codes for requirements validation
    // ground_codes is expected by the notice_only preview requirements validator
    const groundCode = ground?.code || `Ground ${groundNumber}`;
    onUpdate({
      scotland_eviction_ground: groundNumber,
      scotland_ground_notice_period: ground?.noticePeriodDays || 84,
      scotland_ground_name: ground?.name || '',
      scotland_ground_type: 'discretionary', // All Scotland grounds are discretionary
      // Also set ground_codes for compatibility with requirements validator
      ground_codes: [groundCode],
    });
  };

  const renderGroundOption = (ground: ScotlandGround) => (
    <label
      key={ground.number}
      className={`
        flex items-start p-4 border rounded-lg cursor-pointer transition-all
        ${selectedGround === ground.number
          ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
      `}
    >
      <input
        type="radio"
        name="scotland_eviction_ground"
        value={ground.number}
        checked={selectedGround === ground.number}
        onChange={() => handleGroundSelect(ground.number)}
        className="mt-1 mr-3"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-gray-900">
            {ground.code}: {ground.name}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 shrink-0">
            {ground.noticePeriodDays} days notice
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{ground.description}</p>
        {ground.notes && (
          <p className="text-xs text-gray-500 mt-2 italic">{ground.notes}</p>
        )}
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Important notice about discretionary grounds */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          All Scotland Grounds are Discretionary
        </h4>
        <p className="text-amber-700 text-sm mt-2">
          Unlike England, Scotland has <strong>no mandatory grounds</strong> for eviction.
          The First-tier Tribunal has discretion on all grounds and will consider whether
          it is reasonable to grant the eviction order, even if the ground is proven.
        </p>
      </div>

      {/* Ground selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Ground for Notice to Leave
          <span className="text-red-500 ml-1">*</span>
        </label>

        {/* Standard notice grounds (84 days) */}
        {standardNotice.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                84 days notice
              </span>
              Landlord Circumstance Grounds
            </h4>
            <div className="space-y-2">
              {standardNotice.map(renderGroundOption)}
            </div>
          </div>
        )}

        {/* Short notice grounds (28 days) */}
        {shortNotice.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                28 days notice
              </span>
              Tenant Conduct Grounds
            </h4>
            <div className="space-y-2">
              {shortNotice.map(renderGroundOption)}
            </div>
          </div>
        )}
      </div>

      {/* Selected ground details */}
      {selectedGround && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800">Selected Ground</h4>
          {(() => {
            const ground = grounds.find(g => g.number === selectedGround);
            if (!ground) return null;
            return (
              <div className="mt-2 space-y-3">
                <p className="text-blue-700">
                  <strong>{ground.code}: {ground.name}</strong>
                </p>
                <p className="text-sm text-blue-600">{ground.fullText}</p>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-blue-800 font-medium">Notice Period</p>
                    <p className="text-blue-700">{ground.noticePeriodDays} days</p>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">Ground Type</p>
                    <p className="text-blue-700">Discretionary</p>
                  </div>
                </div>

                {ground.requiredEvidence.length > 0 && (
                  <div className="mt-4">
                    <p className="text-blue-800 font-medium text-sm">Required Evidence:</p>
                    <ul className="mt-1 space-y-1">
                      {ground.requiredEvidence.map((ev, i) => (
                        <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evidence description input */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <label htmlFor="evidence_description" className="block text-sm font-medium text-blue-800 mb-2">
                    Describe the evidence you have for this ground
                  </label>
                  <textarea
                    id="evidence_description"
                    className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] bg-white"
                    rows={4}
                    value={facts.scotland_evidence_description || ''}
                    onChange={(e) => onUpdate({ scotland_evidence_description: e.target.value })}
                    placeholder="Briefly describe the evidence you have to support this ground. For example: 'I have 3 months of rent statements showing continuous arrears, emails requesting payment, and records of the tenant's partial payment attempts.'"
                  />
                  <p className="text-xs text-blue-500 mt-1">
                    This helps prepare your case for the First-tier Tribunal.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
