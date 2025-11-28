/**
 * HMO Properties List Page
 *
 * Full list of all HMO properties with filtering
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface HMOProperty {
  id: string;
  address: string;
  postcode: string;
  license_number: string | null;
  license_expiry: string | null;
  total_rooms: number;
  occupied_rooms: number;
  compliance_status: string;
  council: string | null;
  created_at: string;
}

type FilterCompliance = 'all' | 'compliant' | 'expiring_soon' | 'non_compliant';

export default function HMOPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<HMOProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<HMOProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCompliance, setFilterCompliance] = useState<FilterCompliance>('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...properties];

    if (filterCompliance !== 'all') {
      filtered = filtered.filter((p) => p.compliance_status === filterCompliance);
    }

    setFilteredProperties(filtered);
  }, [properties, filterCompliance]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/hmo/properties');

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
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

  const getOccupancyPercentage = (property: HMOProperty): number => {
    return property.total_rooms > 0
      ? Math.round((property.occupied_rooms / property.total_rooms) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link
                href="/dashboard/hmo"
                className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
              >
                ← Back to HMO Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-charcoal">HMO Properties</h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <Link href="/dashboard/hmo/properties/new">
              <Button variant="primary" size="large">
                + Add Property
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Filters */}
        <Card padding="medium" className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCompliance('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCompliance === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setFilterCompliance('compliant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCompliance === 'compliant'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Compliant
            </button>
            <button
              onClick={() => setFilterCompliance('expiring_soon')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCompliance === 'expiring_soon'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring Soon
            </button>
            <button
              onClick={() => setFilterCompliance('non_compliant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCompliance === 'non_compliant'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Non-Compliant
            </button>
          </div>
        </Card>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card padding="large">
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h2 className="text-xl font-semibold text-charcoal mb-2">No properties found</h2>
              <p className="text-gray-600 mb-6">
                {filterCompliance !== 'all'
                  ? `No ${filterCompliance.replace('_', ' ')} properties.`
                  : "You haven't added any properties yet."}
              </p>
              <Link href="/dashboard/hmo/properties/new">
                <Button variant="primary">Add Your First Property</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                padding="large"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/hmo/properties/${property.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-charcoal mb-1 truncate">
                      {property.address}
                    </h3>
                    <p className="text-sm text-gray-600">{property.postcode}</p>
                  </div>
                  <Badge variant={getComplianceColor(property.compliance_status)} size="small">
                    {property.compliance_status === 'expiring_soon' ? 'Expiring' : property.compliance_status}
                  </Badge>
                </div>

                {/* Occupancy */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-medium text-charcoal">
                      {property.occupied_rooms}/{property.total_rooms} rooms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getOccupancyPercentage(property)}%` }}
                    />
                  </div>
                </div>

                {/* License Info */}
                {property.license_number && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">License Number</div>
                    <div className="text-sm font-mono text-charcoal mb-2">
                      {property.license_number}
                    </div>
                    {property.license_expiry && (
                      <div className="text-xs text-gray-500">
                        Expires: {formatDate(property.license_expiry)}
                      </div>
                    )}
                  </div>
                )}

                {/* Council */}
                {property.council && (
                  <div className="mt-3 text-xs text-gray-500">
                    {property.council}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
