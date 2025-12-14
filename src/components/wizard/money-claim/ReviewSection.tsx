'use client';

import React, { useState } from 'react';

type Jurisdiction = 'england-wales' | 'scotland';

interface SectionProps {
  // We don’t currently use facts in this section, so make it optional
  facts?: any;
  caseId: string;
  jurisdiction: Jurisdiction;
}

export const ReviewSection: React.FC<SectionProps> = ({
  caseId,
  jurisdiction,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      // Open the HTML preview in a new tab/window
      window.open(
        `/api/money-claim/preview/${encodeURIComponent(caseId)}`,
        '_blank'
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleGeneratePack = async () => {
    try {
      setDownloading(true);
      const res = await fetch(
        `/api/money-claim/pack/${encodeURIComponent(caseId)}`
      );
      if (!res.ok) {
        console.error('Failed to generate money claim pack', await res.text());
        alert('Sorry, there was a problem generating your pack.');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Money-Claim-Premium-${caseId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        This is a high-level review step. You’ll get an Ask Heaven analysis and
        a full document bundle (pre-action, claim pack and guidance) when you
        generate the premium pack.
      </p>

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
        <p>
          <span className="font-semibold">Case ID:</span> {caseId}
        </p>
        <p>
          <span className="font-semibold">Jurisdiction:</span> {jurisdiction}
        </p>
      </div>

      <p className="text-sm text-gray-600">
        Use the buttons below to preview the drafted documents and then download
        your complete money-claim pack as a ZIP file.
      </p>

      {/* Ask Heaven Features Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-3xl mr-3">☁️</div>
          <div>
            <h4 className="font-semibold text-charcoal mb-1">
              Ask Heaven Legal Drafting Included
            </h4>
            <p className="text-sm text-gray-600">
              Your Particulars of Claim and Letter Before Action will be professionally drafted by Ask Heaven, saving you £300-600 in solicitor fees. Generation takes 2-3 minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing}
          className="inline-flex items-center rounded-md border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
        >
          {previewing ? 'Preparing preview…' : 'Preview drafted pack'}
        </button>

        <button
          type="button"
          onClick={handleGeneratePack}
          disabled={downloading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {downloading ? 'Ask Heaven is drafting your Particulars of Claim…' : 'Generate Ask Heaven-drafted claim pack'}
        </button>
      </div>
    </div>
  );
};
