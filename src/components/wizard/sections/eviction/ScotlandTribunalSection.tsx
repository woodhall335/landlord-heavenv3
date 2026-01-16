/**
 * Scotland Tribunal Section - Eviction Wizard
 *
 * Provides information about the First-tier Tribunal for Scotland process
 * and collects tribunal-related details.
 *
 * Key points:
 * - Scotland uses First-tier Tribunal, NOT county courts
 * - Form E is used for eviction applications
 * - All grounds are discretionary
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { getScotlandConfig, getScotlandGroundByNumber } from '@/lib/scotland/grounds';

interface ScotlandTribunalSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ScotlandTribunalSection: React.FC<ScotlandTribunalSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const config = getScotlandConfig();
  const selectedGround = facts.scotland_eviction_ground as number | undefined;
  const groundData = selectedGround ? getScotlandGroundByNumber(selectedGround) : undefined;

  const understandsTribunalProcess = facts.understands_tribunal_process as boolean | undefined;
  const signatoryName = facts.signatory_name || '';
  const signatoryCapacity = facts.signatory_capacity || '';

  return (
    <div className="space-y-6">
      {/* Tribunal Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800">First-tier Tribunal for Scotland</h4>
        <p className="text-blue-700 text-sm mt-2">
          In Scotland, eviction cases are heard by the{' '}
          <strong>First-tier Tribunal for Scotland (Housing and Property Chamber)</strong>,
          not the county courts used in England.
        </p>
      </div>

      {/* What to Expect */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What to Expect</h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-sm font-bold shrink-0">1</span>
            <div>
              <p className="font-medium text-gray-900">Serve Notice to Leave</p>
              <p className="text-sm text-gray-600">
                {groundData
                  ? `Give ${groundData.noticePeriodDays} days notice using Ground ${groundData.number} (${groundData.name}).`
                  : 'Give the required notice period for your selected ground.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-sm font-bold shrink-0">2</span>
            <div>
              <p className="font-medium text-gray-900">Wait for Notice Period to Expire</p>
              <p className="text-sm text-gray-600">
                You cannot apply to the Tribunal until the notice period has passed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-sm font-bold shrink-0">3</span>
            <div>
              <p className="font-medium text-gray-900">Submit {config.tribunalApplication.form}</p>
              <p className="text-sm text-gray-600">
                Apply to the First-tier Tribunal using Form E (Application for an Eviction Order).
                The fee is {config.tribunalApplication.fee}.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-sm font-bold shrink-0">4</span>
            <div>
              <p className="font-medium text-gray-900">Tribunal Hearing</p>
              <p className="text-sm text-gray-600">
                {config.tribunalApplication.timeframe}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-sm font-bold shrink-0">5</span>
            <div>
              <p className="font-medium text-gray-900">Tribunal Decision</p>
              <p className="text-sm text-gray-600">
                The Tribunal will decide whether to grant the eviction order.
                <strong className="text-amber-700"> All grounds are discretionary</strong> —
                the Tribunal may refuse even if the ground is proven.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Discretionary Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 flex items-center gap-2">
          ⚠️ Important: All Grounds are Discretionary
        </h4>
        <p className="text-amber-700 text-sm mt-2">
          Even if you prove your ground, the Tribunal has discretion to refuse the eviction order
          if it considers it unreasonable in the circumstances. The Tribunal will consider:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>The tenant's circumstances (health, children, employment)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Whether the eviction is proportionate</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>The landlord's reasons for seeking eviction</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Alternative solutions that were attempted</span>
          </li>
        </ul>
      </div>

      {/* Evidence Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Evidence Requirements</h3>
        <p className="text-gray-600 text-sm">
          The Tribunal will require the following evidence with your Form E application:
        </p>

        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {config.tribunalApplication.evidenceRequirements.slice(0, 8).map((req, i) => (
            <div key={i} className="p-3 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{req}</span>
            </div>
          ))}
          {config.tribunalApplication.evidenceRequirements.length > 8 && (
            <div className="p-3 text-sm text-gray-500 italic">
              + {config.tribunalApplication.evidenceRequirements.length - 8} more requirements
            </div>
          )}
        </div>
      </div>

      {/* Understanding Confirmation */}
      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={understandsTribunalProcess === true}
            onChange={(e) => onUpdate({ understands_tribunal_process: e.target.checked })}
            className="mt-1"
          />
          <div>
            <span className="font-medium text-gray-900">
              I understand the Tribunal process
            </span>
            <p className="text-sm text-gray-600 mt-1">
              I understand that all grounds in Scotland are discretionary and the
              Tribunal may refuse the eviction even if the ground is proven.
            </p>
          </div>
        </label>
      </div>

      {/* Signatory Details */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Signatory Details</h3>
        <p className="text-gray-600 text-sm">
          Who will sign the Form E application to the Tribunal?
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={signatoryName}
              onChange={(e) => onUpdate({ signatory_name: e.target.value })}
              placeholder="e.g., John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Capacity
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={signatoryCapacity}
              onChange={(e) => onUpdate({ signatory_capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            >
              <option value="">Select capacity...</option>
              <option value="landlord">Landlord</option>
              <option value="joint_landlord">Joint Landlord</option>
              <option value="agent">Letting Agent</option>
              <option value="solicitor">Solicitor</option>
              <option value="representative">Authorised Representative</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
