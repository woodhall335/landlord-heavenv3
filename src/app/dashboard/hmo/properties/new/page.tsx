/**
 * Add New HMO Property Page
 *
 * Form to add a new HMO property
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Council {
  id: string;
  name: string;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [councils, setCouncils] = useState<Council[]>([]);

  // Form fields
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [occupiedRooms, setOccupiedRooms] = useState('');
  const [councilId, setCouncilId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  useEffect(() => {
    fetchCouncils();
  }, []);

  const fetchCouncils = async () => {
    try {
      const response = await fetch('/api/councils');
      if (response.ok) {
        const data = await response.json();
        setCouncils(data.councils || []);
      }
    } catch (error) {
      console.error('Failed to fetch councils:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hmo/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          postcode,
          total_rooms: parseInt(totalRooms),
          occupied_rooms: parseInt(occupiedRooms || '0'),
          council_id: councilId || null,
          license_number: licenseNumber || null,
          license_expiry: licenseExpiry || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/hmo/properties/${data.property.id}`);
      } else {
        setError(data.error || 'Failed to add property');
      }
      } catch {
        setError('Something went wrong');
      } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <Link
            href="/dashboard/hmo/properties"
            className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
          >
            ← Back to Properties
          </Link>
          <h1 className="text-3xl font-extrabold text-charcoal">Add New Property</h1>
          <p className="text-gray-600 mt-1">Add a new HMO property to your portfolio</p>
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
            {/* Property Details */}
            <div>
              <h2 className="text-lg font-semibold text-charcoal mb-4">Property Details</h2>

              <div className="space-y-4">
                <Input
                  label="Property Address"
                  type="text"
                  value={address}
                  onChange={setAddress}
                  placeholder="123 High Street"
                  required
                />

                <Input
                  label="Postcode"
                  type="text"
                  value={postcode}
                  onChange={setPostcode}
                  placeholder="SW1A 1AA"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Rooms"
                    type="number"
                    value={totalRooms}
                    onChange={setTotalRooms}
                    placeholder="5"
                    min={1}
                    required
                  />

                  <Input
                    label="Currently Occupied Rooms"
                    type="number"
                    value={occupiedRooms}
                    onChange={setOccupiedRooms}
                    placeholder="3"
                    min={0}
                    helperText="Can be updated later"
                  />
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-charcoal mb-4">
                License Information
                <span className="text-sm font-normal text-gray-600 ml-2">(Optional)</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Local Council
                  </label>
                  <select
                    value={councilId}
                    onChange={(e) => setCouncilId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select council...</option>
                    {councils.map((council) => (
                      <option key={council.id} value={council.id}>
                        {council.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the local council that issued the HMO license
                  </p>
                </div>

                <Input
                  label="HMO License Number"
                  type="text"
                  value={licenseNumber}
                  onChange={setLicenseNumber}
                  placeholder="HMO/2024/12345"
                />

                <Input
                  label="License Expiry Date"
                  type="date"
                  value={licenseExpiry}
                  onChange={setLicenseExpiry}
                  helperText="You'll receive alerts before it expires"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200 flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={isLoading}
                disabled={isLoading}
              >
                Add Property
              </Button>
              <Link href="/dashboard/hmo/properties">
                <Button type="button" variant="outline" size="large" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
}
