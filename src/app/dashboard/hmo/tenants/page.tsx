/**
 * HMO Tenants List Page
 *
 * Full list of all tenants across all properties
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Tenant {
  id: string;
  property_id: string;
  property_address: string;
  full_name: string;
  email: string;
  phone: string | null;
  room_number: string;
  rent_amount: number;
  deposit_amount: number;
  lease_start: string;
  lease_end: string;
  status: string;
  created_at: string;
}

type FilterStatus = 'all' | 'active' | 'notice_given' | 'ended';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchTenants();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...tenants];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    setFilteredTenants(filtered);
  }, [tenants, filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/hmo/tenants');

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
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
    return filteredTenants
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + t.rent_amount, 0);
  };

  const getTotalDeposits = (): number => {
    return filteredTenants
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + t.deposit_amount, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tenants...</p>
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
              <h1 className="text-3xl font-extrabold text-charcoal">Tenants</h1>
              <p className="text-gray-600 mt-1">
                {filteredTenants.length} {filteredTenants.length === 1 ? 'tenant' : 'tenants'}
              </p>
            </div>
            <Link href="/dashboard/hmo/tenants/new">
              <Button variant="primary" size="large">
                + Add Tenant
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Active Tenants</div>
            <div className="text-3xl font-bold text-charcoal">
              {tenants.filter((t) => t.status === 'active').length}
            </div>
          </Card>

          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
            <div className="text-3xl font-bold text-green-600">
              £{getTotalRent().toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">from active tenants</div>
          </Card>

          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Total Deposits</div>
            <div className="text-3xl font-bold text-primary">
              £{getTotalDeposits().toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">held for active tenants</div>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="medium" className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tenants
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('notice_given')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'notice_given'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notice Given
            </button>
            <button
              onClick={() => setFilterStatus('ended')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'ended'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ended
            </button>
          </div>
        </Card>

        {/* Tenants List */}
        {filteredTenants.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-charcoal mb-2">No tenants found</h2>
              <p className="text-gray-600 mb-6">
                {filterStatus !== 'all'
                  ? `No ${filterStatus.replace('_', ' ')} tenants.`
                  : "You haven't added any tenants yet."}
              </p>
              <Link href="/dashboard/hmo/tenants/new">
                <Button variant="primary">Add Your First Tenant</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} padding="large">
                <div className="flex items-start justify-between gap-4">
                  {/* Tenant Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-charcoal">
                          {tenant.full_name}
                        </h3>
                        <Badge variant={getTenantStatusColor(tenant.status)} size="small">
                          {tenant.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {tenant.email}
                        </div>
                        {tenant.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {tenant.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {tenant.property_address}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Room:</span> {tenant.room_number}
                        </div>
                        <div>
                          <span className="font-medium">Rent:</span> £{tenant.rent_amount}/month
                        </div>
                        <div>
                          <span className="font-medium">Deposit:</span> £{tenant.deposit_amount}
                        </div>
                        <div>
                          <span className="font-medium">Lease:</span> {formatDate(tenant.lease_start)} -{' '}
                          {formatDate(tenant.lease_end)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/dashboard/hmo/tenants/${tenant.id}`}>
                      <Button variant="secondary" size="small">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/hmo/properties/${tenant.property_id}`}>
                      <Button variant="outline" size="small">
                        View Property
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
