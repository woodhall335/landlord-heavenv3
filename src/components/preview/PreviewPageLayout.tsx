'use client';

import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentInfo } from './DocumentCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { CheckCircle, Shield, Clock, Download } from 'lucide-react';

interface PreviewPageLayoutProps {
  caseId: string;
  product: string;
  productName: string;
  price: string;
  originalPrice?: string;
  documents: DocumentInfo[];
  previewContent?: React.ReactNode;
  features?: string[];
  savings?: string;
}

export function PreviewPageLayout({
  caseId,
  product,
  productName,
  price,
  originalPrice,
  documents,
  previewContent,
  features,
  savings,
}: PreviewPageLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup with return URL
        const returnUrl = `/wizard/preview/${caseId}`;
        window.location.href = `/auth/signup?redirect=${encodeURIComponent(returnUrl)}&case_id=${caseId}`;
        return;
      }

      // Link case to user if not already linked
      await fetch(`/api/cases/${caseId}/link`, { method: 'POST' });

      // Create checkout session
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: product,
          case_id: caseId,
          success_url: `${window.location.origin}/dashboard/cases/${caseId}?payment=success`,
          cancel_url: `${window.location.origin}/wizard/preview/${caseId}?payment=cancelled`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.session_url) {
        window.location.href = data.session_url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{productName}</h1>
          <p className="text-gray-600 mt-2 text-lg">
            {documents.length} documents ready for instant download
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document List - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* What's Included Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">What's Included</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {documents.length} Documents
                </span>
              </div>
              <DocumentList
                documents={documents}
                isLocked={true}
                onUnlock={handleCheckout}
                groupByCategory={true}
              />
            </div>

            {/* Preview Section (Optional) */}
            {previewContent && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Preview</h2>
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  {previewContent}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Limited preview shown above. Full documents unlock after purchase.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 sticky top-8">
              {/* Price */}
              <div className="text-center mb-6">
                {originalPrice && (
                  <p className="text-gray-400 line-through text-lg">{originalPrice}</p>
                )}
                <p className="text-4xl font-bold text-gray-900">{price}</p>
                <p className="text-gray-600 mt-1">One-time payment</p>
                {savings && (
                  <p className="text-green-600 font-medium mt-2">{savings}</p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Get Your Documents'
                )}
              </button>

              {error && (
                <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
              )}

              {/* Trust Signals */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Download className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Court-ready documents</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Unlimited regeneration</span>
                </div>
              </div>

              {/* Features */}
              {features && features.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-3">Includes:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guarantee */}
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-gray-500">
                  Secure payment via Stripe
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Questions? support@landlordheaven.co.uk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
