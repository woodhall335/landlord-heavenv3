/**
 * HMO Pro Upsell Modal
 *
 * Displayed when wizard detects 3+ unrelated tenants (likely an HMO)
 * Offers 7-day free trial of HMO Pro
 */

'use client';

import React, { useState } from 'react';
import { Modal, Button, Loading } from '@/components/ui';

interface HMOProUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantCount?: number;
  propertyAddress?: string;
}

export const HMOProUpsellModal: React.FC<HMOProUpsellModalProps> = ({
  isOpen,
  onClose,
  tenantCount = 3,
  propertyAddress,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    try {
      setLoading(true);

      // Create subscription checkout session with 7-day trial
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'hmo_pro_1_5',
          trial_days: 7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start trial');
      }

      const result = await response.json();

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Trial signup error:', error);
      alert('Failed to start trial. Please try again.');
      setLoading(false);
    }
  };

  const handleContinueWithoutTrial = () => {
    // Close modal and let user continue
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" showCloseButton={false}>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Is This an HMO Property?
          </h2>
          <p className="text-lg text-gray-600">
            We've detected you have <strong>{tenantCount}+ unrelated tenants</strong>
            {propertyAddress && ` at ${propertyAddress}`}
          </p>
        </div>

        {/* HMO Warning */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Important: HMO Regulations Apply
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p className="mb-2">
                  Properties with 3+ unrelated tenants sharing facilities are classified as{' '}
                  <strong>Houses in Multiple Occupation (HMOs)</strong> and have additional legal
                  requirements:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mandatory HMO licensing in many areas</li>
                  <li>Enhanced fire safety requirements</li>
                  <li>Minimum room sizes and amenity standards</li>
                  <li>Regular safety inspections (gas, electric, fire)</li>
                  <li>Potential fines up to £30,000 for non-compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* HMO Pro Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">
            HMO Pro: Stay Compliant, Avoid Fines
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Automated Reminders</p>
                <p className="text-sm text-gray-600">
                  90/30/7 day alerts for license renewals, gas safety, EICR, fire assessments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Council-Specific Applications</p>
                <p className="text-sm text-gray-600">
                  Pre-filled HMO license forms for your local council
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Multi-Property Dashboard</p>
                <p className="text-sm text-gray-600">Manage up to 20 HMO properties in one place</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Tenant Document Portal</p>
                <p className="text-sm text-gray-600">
                  Secure sharing of certificates and compliance docs
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Priority Support</p>
                <p className="text-sm text-gray-600">Direct access to our compliance team</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Renewal Tracking</p>
                <p className="text-sm text-gray-600">Never miss a critical compliance deadline</p>
              </div>
            </div>
          </div>

          <div className="text-center py-3 bg-white rounded-lg border-2 border-blue-300">
            <p className="text-2xl font-bold text-blue-600 mb-1">Start Your Free Trial</p>
            <p className="text-sm text-gray-600">
              <strong>7 days free</strong>, then from £19.99/month • Cancel anytime
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleStartTrial}
            variant="primary"
            size="large"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loading variant="spinner" size="small" />
                Starting Trial...
              </span>
            ) : (
              'Start 7-Day Free Trial (No Card Required)'
            )}
          </Button>

          <Button
            onClick={handleContinueWithoutTrial}
            variant="secondary"
            size="large"
            className="w-full"
            disabled={loading}
          >
            Continue Without HMO Pro
          </Button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By starting your trial, you agree to our Terms of Service. You can cancel anytime during
          the trial period at no charge. After the trial, you'll be charged monthly based on your
          property count.
        </p>

        {/* Social Proof */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Join 2,000+ landlords</strong> who trust HMO Pro for compliance
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★★★★★</span>
                <span>4.9/5 from 500+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
