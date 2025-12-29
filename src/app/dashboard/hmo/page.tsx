/**
 * HMO Pro Dashboard
 *
 * Premium subscription dashboard for HMO property and tenant management
 * Requires active HMO Pro subscription
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RiTimeLine, RiLockLine, RiCheckboxCircleLine, RiBookOpenLine, RiCustomerService2Line } from 'react-icons/ri';

interface HMOProperty {
  id: string;
  address: string;
  postcode: string;
  license_number: string | null;
  license_expiry: string | null;
  total_rooms: number;
  occupied_rooms: number;
  compliance_status: string;
  created_at: string;
}

interface HMOTenant {
  id: string;
  property_id: string;
  full_name: string;
  email: string;
  room_number: string;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  deposit_amount: number;
  status: string;
}

interface UserProfile {
  subscription_tier: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
}

export default function HMOProDashboardPage() {
  // V1 GATING: HMO Pro is not available in V1
  // This will be removed in V2 when HMO Pro launches
  const V1_BLOCK_HMO = true;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<HMOProperty[]>([]);
  const [tenants, setTenants] = useState<HMOTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = useCallback(async () => {
    try {
      // Check user profile for subscription
      const profileRes = await fetch('/api/users/me');

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.user);

        const hasActiveSub =
          profileData.user.subscription_tier &&
          (profileData.user.subscription_status === 'active' ||
            profileData.user.subscription_status === 'trialing');

        setHasAccess(hasActiveSub);

        if (hasActiveSub) {
          await fetchDashboardData();
        }
      }
    } catch (error) {
      console.error('Failed to check access:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, tenantsRes] = await Promise.all([
        fetch('/api/hmo/properties'),
        fetch('/api/hmo/tenants'),
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData.properties || []);
      }

      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData.tenants || []);
      }
    } catch (error) {
      console.error('Failed to fetch HMO data:', error);
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

  const getTierLabel = (tier: string | null): string => {
    if (!tier) return 'Free';
    const labels: Record<string, string> = {
      starter: 'Starter (1-5)',
      growth: 'Growth (6-10)',
      professional: 'Professional (11-15)',
      enterprise: 'Enterprise (16-20)',
    };
    return labels[tier] || tier;
  };

  const getMaxProperties = (tier: string | null): number => {
    const limits: Record<string, number> = {
      starter: 5,
      growth: 10,
      professional: 15,
      enterprise: 20,
    };
    return limits[tier || ''] || 0;
  };

  const getTotalRent = (): number => {
    return tenants
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + t.rent_amount, 0);
  };

  const getOccupancyRate = (): number => {
    const totalRooms = properties.reduce((sum, p) => sum + p.total_rooms, 0);
    const occupiedRooms = properties.reduce((sum, p) => sum + p.occupied_rooms, 0);
    return totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  };

  // V1 GATING: Block HMO Pro entirely for V1
  if (V1_BLOCK_HMO) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-8">
          <Container size="large" className="text-center">
            <h1 className="text-4xl font-extrabold mb-4">🚧 HMO Pro - Coming in V2</h1>
            <p className="text-xl opacity-90">
              This feature is currently under development
            </p>
          </Container>
        </div>

        <Container size="medium" className="py-12">
          <Card padding="large">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <RiTimeLine className="w-10 h-10 text-[#7C3AED]" />
              </div>

              <h2 className="text-2xl font-bold text-charcoal mb-3">
                HMO Pro Dashboard
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                HMO Pro is currently in development and not yet available in V1.
                We're building a comprehensive HMO compliance management platform.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-xl mx-auto">
                <p className="text-sm text-gray-700">
                  <strong>Expected Launch:</strong> Q2 2026<br/>
                  <strong>What's Coming:</strong> License tracking, fire safety management, compliance reminders, tenant management, and more.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Link href="/dashboard">
                  <Button variant="primary">← Back to Dashboard</Button>
                </Link>
                <Link href="/help">
                  <Button variant="secondary">Contact Us</Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading HMO Pro...</p>
        </div>
      </div>
    );
  }

  // No access - show upgrade prompt
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-linear-to-r from-secondary to-primary text-white">
          <Container size="large" className="py-12 text-center">
            <h1 className="text-4xl font-extrabold mb-4">🏘️ HMO Pro Dashboard</h1>
            <p className="text-xl opacity-90">
              Professional HMO property and tenant management
            </p>
          </Container>
        </div>

        <Container size="medium" className="py-12">
          <Card padding="large">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                <RiLockLine className="w-10 h-10 text-[#7C3AED]" />
              </div>

              <h2 className="text-2xl font-bold text-charcoal mb-3">
                HMO Pro Subscription Required
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Upgrade to HMO Pro to unlock powerful property and tenant management features
                with 7-day free trial.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <RiCheckboxCircleLine className="w-6 h-6 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-charcoal">Manage up to 20 properties</div>
                    <div className="text-sm text-gray-600">Track all your HMOs in one place</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RiCheckboxCircleLine className="w-6 h-6 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-charcoal">Tenant management</div>
                    <div className="text-sm text-gray-600">Track leases, rent, and deposits</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RiCheckboxCircleLine className="w-6 h-6 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-charcoal">Compliance tracking</div>
                    <div className="text-sm text-gray-600">License expiry alerts and renewals</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RiCheckboxCircleLine className="w-6 h-6 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-charcoal">Portfolio analytics</div>
                    <div className="text-sm text-gray-600">Occupancy rates and rent tracking</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/pricing">
                  <Button variant="primary" size="large">
                    View Plans & Pricing
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="large">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // Has access - show full dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-secondary to-primary text-white">
        <Container size="large" className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link
                href="/dashboard"
                className="text-sm text-white/80 hover:text-white font-medium mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold">🏘️ HMO Pro Dashboard</h1>
              <p className="opacity-90 mt-1">
                Manage your HMO portfolio • {profile && getTierLabel(profile.subscription_tier)}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="success" size="large">
                {profile?.subscription_status}
              </Badge>
              {profile?.trial_ends_at && (
                <div className="text-sm mt-2 opacity-90">
                  Trial ends {formatDate(profile.trial_ends_at)}
                </div>
              )}
            </div>
          </div>

          {/* Property Limit Warning */}
          {profile && properties.length >= getMaxProperties(profile.subscription_tier) && (
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-4 mt-4">
              <p className="text-sm">
                You've reached your plan limit of {getMaxProperties(profile.subscription_tier)}{' '}
                properties.{' '}
                <Link href="/pricing" className="underline font-medium">
                  Upgrade to add more
                </Link>
              </p>
            </div>
          )}
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Total Properties</div>
            <div className="text-3xl font-bold text-charcoal">{properties.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              of {profile && getMaxProperties(profile.subscription_tier)} max
            </div>
          </Card>

          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Total Tenants</div>
            <div className="text-3xl font-bold text-primary">{tenants.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {tenants.filter((t) => t.status === 'active').length} active
            </div>
          </Card>

          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Occupancy Rate</div>
            <div className="text-3xl font-bold text-green-600">{getOccupancyRate()}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {properties.reduce((sum, p) => sum + p.occupied_rooms, 0)} /{' '}
              {properties.reduce((sum, p) => sum + p.total_rooms, 0)} rooms
            </div>
          </Card>

          <Card padding="medium">
            <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
            <div className="text-3xl font-bold text-charcoal">£{getTotalRent().toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">from active tenants</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Properties & Tenants */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Properties</h2>
                <Link href="/dashboard/hmo/properties/new">
                  <Button variant="primary">+ Add Property</Button>
                </Link>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No properties yet</p>
                  <Link href="/dashboard/hmo/properties/new">
                    <Button variant="primary">Add Your First Property</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.slice(0, 5).map((property) => (
                    <Link
                      key={property.id}
                      href={`/dashboard/hmo/properties/${property.id}`}
                      className="block"
                    >
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-charcoal">{property.address}</div>
                            <div className="text-sm text-gray-600">{property.postcode}</div>
                          </div>
                          <Badge variant={getComplianceColor(property.compliance_status)}>
                            {property.compliance_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {property.occupied_rooms}/{property.total_rooms} rooms occupied
                          </span>
                          {property.license_number && (
                            <>
                              <span>•</span>
                              <span>License: {property.license_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {properties.length > 5 && (
                    <Link href="/dashboard/hmo/properties">
                      <Button variant="outline" fullWidth>
                        View All {properties.length} Properties
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>

            {/* Recent Tenants */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Recent Tenants</h2>
                <Link href="/dashboard/hmo/tenants">
                  <span className="text-sm text-primary hover:text-primary-dark font-medium">
                    View all →
                  </span>
                </Link>
              </div>

              {tenants.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tenants added yet</p>
              ) : (
                <div className="space-y-3">
                  {tenants.slice(0, 5).map((tenant) => (
                    <Link
                      key={tenant.id}
                      href={`/dashboard/hmo/tenants/${tenant.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-charcoal truncate">
                            {tenant.full_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Room {tenant.room_number} • £{tenant.rent_amount}/month
                          </div>
                        </div>
                        <Badge variant={getTenantStatusColor(tenant.status)} size="small">
                          {tenant.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/hmo/properties/new">
                  <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-left font-medium">
                    + Add Property
                  </button>
                </Link>
                <Link href="/dashboard/hmo/tenants/new">
                  <button className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity text-left font-medium">
                    + Add Tenant
                  </button>
                </Link>
                <Link href="/dashboard/hmo/compliance">
                  <button className="w-full px-4 py-3 bg-gray-100 text-charcoal rounded-lg hover:bg-gray-200 transition-colors text-left font-medium">
                    📋 Compliance Check
                  </button>
                </Link>
              </div>
            </Card>

            {/* Compliance Alerts */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Compliance Alerts</h3>
              {properties.filter((p) => p.compliance_status !== 'compliant').length === 0 ? (
                <div className="text-center py-4">
                  <RiCheckboxCircleLine className="w-12 h-12 text-[#7C3AED] mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">All compliant!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {properties
                    .filter((p) => p.compliance_status !== 'compliant')
                    .map((property) => (
                      <div
                        key={property.id}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <div className="text-sm font-medium text-amber-900">
                          {property.address}
                        </div>
                        <div className="text-xs text-amber-700 mt-1">
                          {property.compliance_status === 'expiring_soon'
                            ? `License expires ${property.license_expiry && formatDate(property.license_expiry)}`
                            : 'Action required'}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            {/* Help */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <Link href="/help" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                  <RiBookOpenLine className="w-5 h-5 text-[#7C3AED]" />
                  Help Center
                </Link>
                <Link href="/contact" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                  <RiCustomerService2Line className="w-5 h-5 text-[#7C3AED]" />
                  Contact Support
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
