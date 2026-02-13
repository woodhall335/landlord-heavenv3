/**
 * Add New Tenant Page
 *
 * Form to add a new tenant to an HMO property
 */

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Property {
  id: string;
  address: string;
  postcode: string;
}

function NewTenantPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPropertyId = searchParams.get('property_id');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);

  // Form fields
  const [propertyId, setPropertyId] = useState(preselectedPropertyId || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');

  // Keep propertyId in sync if querystring changes
  useEffect(() => {
    if (preselectedPropertyId) setPropertyId(preselectedPropertyId);
  }, [preselectedPropertyId]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/hmo/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hmo/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          full_name: fullName,
          email: email,
          phone: phone || null,
          room_number: roomNumber,
          rent_amount: parseFloat(rentAmount),
          deposit_amount: parseFloat(depositAmount),
          lease_start: leaseStart,
          lease_end: leaseEnd,
          status: 'active',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/hmo/tenants/${data.tenant.id}`);
      } else {
        setError(data.error || 'Failed to add tenant');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    propertyId &&
    fullName &&
    email &&
    roomNumber &&
    rentAmount &&
    depositAmount &&
    leaseStart &&
    leaseEnd;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <Link
            href="/dashboard/hmo/tenants"
            className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
          >
            ← Back to Tenants
          </Link>
          <h1 className="text-3xl font-extrabold text-charcoal">Add New Tenant</h1>
          <p className="text-gray-600 mt-1">Add a tenant to your HMO property</p>
        </Container>
      </div>

      <Container size="medium" className="py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        <Card padding="large">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
            <div>
              <h2 className="text-lg font-semibold text-charcoal mb-4">Property</h2>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Select Property <span className="text-error">*</span>
                </label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a property...</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}, {property.postcode}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the property where this tenant will reside
                </p>
              </div>
            </div>

            {/* Tenant Details */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Tenant Information</h2>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.smith@example.com"
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    helperText="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Lease Details */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Lease Details</h2>

              <div className="space-y-4">
                <Input
                  label="Room Number"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="1A"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Monthly Rent (£)"
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="500"
                    min={0}
                    step="0.01"
                    required
                  />

                  <Input
                    label="Deposit Amount (£)"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="500"
                    min={0}
                    step="0.01"
                    required
                    helperText="Usually 1 month's rent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Lease Start Date"
                    type="date"
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    required
                  />

                  <Input
                    label="Lease End Date"
                    type="date"
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200 flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={isLoading}
                disabled={isLoading || !isFormValid}
              >
                Add Tenant
              </Button>
              <Link href="/dashboard/hmo/tenants">
                <Button type="button" variant="outline" size="large" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Helper Info */}
        <Card padding="medium" className="mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-charcoal mb-2">💡 Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Make sure all tenant details are accurate before submitting</li>
            <li>• The deposit amount is typically equivalent to one month's rent</li>
            <li>• You can update tenant information later if needed</li>
            <li>• Keep track of lease end dates to plan renewals in advance</li>
          </ul>
        </Card>
      </Container>
    </div>
  );
}

export default function NewTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewTenantPageInner />
    </Suspense>
  );
}
