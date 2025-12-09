'use client';

import { useState } from 'react';
import { FreeToolLayout } from '@/components/tools/FreeToolLayout';

// SEO Metadata (exported from separate metadata.ts file for client components)
// See: src/app/tools/free-section-21-notice-generator/metadata.ts

export default function FreeSection21Tool() {
  const [formData, setFormData] = useState({
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
    noticeDate: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement PDF generation with watermark
    // For now, simulate generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGenerating(false);
    alert(
      'Free version generates a watermarked template. Upgrade to get a court-ready version with full validation.'
    );
  };

  const isFormValid =
    formData.landlordName &&
    formData.tenantName &&
    formData.propertyAddress &&
    formData.noticeDate;

  return (
    <FreeToolLayout
      title="Free Section 21 Notice Generator"
      description="Generate a basic Section 21 notice template for England & Wales. Upgrade for a court-ready, legally validated version."
      paidVersion={{
        price: '£14.99',
        features: [
          'Court-ready formatting',
          'Ask Heaven AI validation',
          'Deposit protection checks',
          'Prescribed info verification',
          'Save and edit anytime',
          'Instant PDF download',
        ],
        href: '/products/notice-only?product=section21',
      }}
    >
      {/* Tool Form */}
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Generate Your Section 21 Notice
      </h2>

      <form className="space-y-6">
        {/* Landlord Name */}
        <div>
          <label
            htmlFor="landlordName"
            className="block text-sm font-medium text-gray-700"
          >
            Landlord Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="landlordName"
            value={formData.landlordName}
            onChange={(e) =>
              setFormData({ ...formData, landlordName: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Your full legal name"
          />
        </div>

        {/* Tenant Name */}
        <div>
          <label
            htmlFor="tenantName"
            className="block text-sm font-medium text-gray-700"
          >
            Tenant Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="tenantName"
            value={formData.tenantName}
            onChange={(e) =>
              setFormData({ ...formData, tenantName: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Tenant's full name"
          />
        </div>

        {/* Property Address */}
        <div>
          <label
            htmlFor="propertyAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Property Address <span className="text-error-500">*</span>
          </label>
          <textarea
            id="propertyAddress"
            value={formData.propertyAddress}
            onChange={(e) =>
              setFormData({ ...formData, propertyAddress: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Full property address including postcode"
          />
        </div>

        {/* Notice Date */}
        <div>
          <label
            htmlFor="noticeDate"
            className="block text-sm font-medium text-gray-700"
          >
            Notice Date <span className="text-error-500">*</span>
          </label>
          <input
            type="date"
            id="noticeDate"
            value={formData.noticeDate}
            onChange={(e) =>
              setFormData({ ...formData, noticeDate: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            The notice period starts from this date
          </p>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isGenerating
            ? 'Generating...'
            : 'Generate Free Notice (Watermarked)'}
        </button>
      </form>

      {/* Comparison Table */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Free vs Court-Ready Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Feature
                </th>
                <th className="pb-3 text-center text-sm font-medium text-gray-600">
                  Free
                </th>
                <th className="pb-3 text-center text-sm font-medium text-gray-600">
                  £14.99
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 text-sm text-gray-700">Basic template</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Court-ready formatting
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Deposit protection checks
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Prescribed info verification
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Ask Heaven AI optimization
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Red flag detection
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Watermark
                </td>
                <td className="text-center text-warning-600">Yes</td>
                <td className="text-center text-success-600">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-8 rounded-xl bg-primary-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          What is a Section 21 Notice?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          A Section 21 notice is a formal notice used by landlords in England
          and Wales to end an assured shorthold tenancy (AST) without providing
          a specific reason. It requires at least 2 months' notice and must
          comply with strict legal requirements to be valid.
        </p>
        <p className="mt-3 text-sm font-semibold text-primary-600">
          ⚠️ Important: A Section 21 notice can be invalidated if you haven't
          protected the deposit correctly or provided prescribed information.
          Our paid version includes these critical checks.
        </p>
      </div>
    </FreeToolLayout>
  );
}
