/**
 * HMO Property Detail Page
 *
 * Individual property view with tenants and compliance info
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PropertyDetails {
  id: string;
  address: string;
  postcode: string;
  total_rooms: number;
  occupied_rooms: number;
  license_number: string | null;
  license_expiry: string | null;
  compliance_status: string;
  council: string | null;
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: string;
  full_name: string;
  email: string;
  room_number: string;
  rent_amount: number;
  lease_start: string;
  lease_end: string;
  status: string;
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPropertyDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/hmo/properties/${propertyId}`);

      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
      } else {
        setError('Property not found');
      }
    } catch {
      setError('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  const fetchPropertyTenants = useCallback(async () => {
    try {
      const response = await fetch(`/api/hmo/tenants?property_id=${propertyId}`);

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
      fetchPropertyTenants();
    }
  }, [propertyId, fetchPropertyDetails, fetchPropertyTenants]);

  const handleDeleteProperty = async () => {
    if (tenants.length > 0) {
      alert('Cannot delete property with active tenants. Please remove all tenants first.');
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this property? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/hmo/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/hmo/properties');
      } else {
        alert('Failed to delete property');
      }
    } catch {
      alert('Failed to delete property');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getComplianceColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'non_compliant':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getTenantStatusColor = (status: string): 'success' | 'warning' | 'neutral' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'notice_given':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getTotalRent = (): number => {
    return tenants
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + t.rent_amount, 0);
  };

  const getOccupancyPercentage = (): number => {
    return property && property.total_rooms > 0
      ? Math.round((property.occupied_rooms / property.total_rooms) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-charcoal mb-2">{error}</h2>
            <Link href="/dashboard/hmo/properties">
              <Button variant="primary">Back to Properties</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <Link
            href="/dashboard/hmo/properties"
            className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
          >
            ← Back to Properties
          </Link>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-charcoal">{property.address}</h1>
              <p className="text-gray-600 mt-1">{property.postcode}</p>
            </div>
            <Badge variant={getComplianceColor(property.compliance_status)} size="large">
              {property.compliance_status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href={`/dashboard/hmo/tenants/new?property_id=${propertyId}`}>
              <Button variant="primary">+ Add Tenant</Button>
            </Link>
            <Button variant="outline" onClick={handleDeleteProperty}>
              Delete Property
            </Button>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card padding="medium">
                <div className="text-sm text-gray-600 mb-1">Occupancy</div>
                <div className="text-2xl font-bold text-charcoal mb-2">
                  {getOccupancyPercentage()}%
                </div>
                <div className="text-xs text-gray-500">
                  {property.occupied_rooms}/{property.total_rooms} rooms
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getOccupancyPercentage()}%` }}
                  />
                </div>
              </Card>

              <Card padding="medium">
                <div className="text-sm text-gray-600 mb-1">Total Tenants</div>
                <div className="text-2xl font-bold text-primary">{tenants.length}</div>
                <div className="text-xs text-gray-500">
                  {tenants.filter((t) => t.status === 'active').length} active
                </div>
              </Card>

              <Card padding="medium">
                <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
                <div className="text-2xl font-bold text-green-600">
                  £{getTotalRent().toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">from active tenants</div>
              </Card>
            </div>

            {/* Tenants */}
            <Card padding="large">
              <h2 className="text-xl font-semibold text-charcoal mb-6">Tenants</h2>

              {tenants.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No tenants added yet</p>
                  <Link href={`/dashboard/hmo/tenants/new?property_id=${propertyId}`}>
                    <Button variant="primary">Add First Tenant</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <Link
                      key={tenant.id}
                      href={`/dashboard/hmo/tenants/${tenant.id}`}
                      className="block"
                    >
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-charcoal">{tenant.full_name}</div>
                            <div className="text-sm text-gray-600">{tenant.email}</div>
                          </div>
                          <Badge variant={getTenantStatusColor(tenant.status)}>
                            {tenant.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Room {tenant.room_number}</span>
                          <span>•</span>
                          <span>£{tenant.rent_amount}/month</span>
                          <span>•</span>
                          <span>
                            Lease: {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Property Info */}
          <div className="space-y-6">
            {/* Property Details */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Property Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Address</div>
                  <div className="text-charcoal mt-1">{property.address}</div>
                </div>
                <div>
                  <div className="text-gray-600">Postcode</div>
                  <div className="text-charcoal mt-1">{property.postcode}</div>
                </div>
                <div>
                  <div className="text-gray-600">Total Rooms</div>
                  <div className="text-charcoal mt-1">{property.total_rooms}</div>
                </div>
                {property.council && (
                  <div>
                    <div className="text-gray-600">Council</div>
                    <div className="text-charcoal mt-1">{property.council}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* License Information */}
            {property.license_number && (
              <Card padding="medium">
                <h3 className="font-semibold text-charcoal mb-4">HMO License</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600">License Number</div>
                    <div className="text-charcoal font-mono mt-1">{property.license_number}</div>
                  </div>
                  {property.license_expiry && (
                    <div>
                      <div className="text-gray-600">Expiry Date</div>
                      <div className="text-charcoal mt-1">
                        {formatDate(property.license_expiry)}
                      </div>
                      {property.compliance_status === 'expiring_soon' && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                          ⚠️ License expires soon - renew now
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Property ID</div>
                  <div className="text-charcoal font-mono text-xs mt-1">{property.id}</div>
                </div>
                <div>
                  <div className="text-gray-600">Added</div>
                  <div className="text-charcoal mt-1">{formatDate(property.created_at)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Last Updated</div>
                  <div className="text-charcoal mt-1">{formatDate(property.updated_at)}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
