/**
 * HMO API - Statistics
 *
 * GET /api/hmo/stats
 * Returns aggregate statistics for HMO Pro dashboard
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types';

type HMOProperty = Database['public']['Tables']['hmo_properties']['Row'];
type HMOTenant = Database['public']['Tables']['hmo_tenants']['Row'];
type User = Database['public']['Tables']['users']['Row'];

export async function GET() {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();

    // Check if user has HMO Pro access
    const { data: userData } = await supabase
      .from('users')
      .select('hmo_pro_active, hmo_pro_tier')
      .eq('id', user.id)
      .single() as { data: Pick<User, 'hmo_pro_active' | 'hmo_pro_tier'> | null };

    if (!userData?.hmo_pro_active) {
      return NextResponse.json(
        { error: 'HMO Pro subscription required' },
        { status: 403 }
      );
    }

    // Fetch all properties
    const { data: properties, error: propertiesError } = await supabase
      .from('hmo_properties')
      .select('*')
      .eq('user_id', user.id) as { data: HMOProperty[] | null; error: any };

    if (propertiesError) {
      console.error('Failed to fetch properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Fetch all tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('hmo_tenants')
      .select('*')
      .eq('user_id', user.id) as { data: HMOTenant[] | null; error: any };

    if (tenantsError) {
      console.error('Failed to fetch tenants:', tenantsError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Calculate property statistics
    const totalProperties = properties?.length || 0;
    const totalBedrooms = properties?.reduce((sum, p) => sum + (p.number_of_bedrooms || 0), 0) || 0;
    const totalTenants = tenants?.filter((t) => t.tenancy_status === 'active').length || 0;
    const totalVacancies = totalBedrooms - totalTenants;

    // Calculate occupancy rate
    const occupancyRate = totalBedrooms > 0 ? (totalTenants / totalBedrooms) * 100 : 0;

    // Calculate financial statistics
    const totalMonthlyRent = tenants
      ?.filter((t) => t.tenancy_status === 'active')
      .reduce((sum, t) => sum + parseFloat(String(t.monthly_rent || 0)), 0) || 0;

    const totalDepositsHeld = tenants
      ?.filter((t) => t.tenancy_status === 'active')
      .reduce((sum, t) => sum + parseFloat(String(t.deposit_amount || 0)), 0) || 0;

    // Calculate compliance statistics
    const propertiesWithFireAlarm = properties?.filter((p) => p.has_fire_alarm).length || 0;
    const propertiesWithCOAlarm = properties?.filter((p) => p.has_co_alarm).length || 0;
    const propertiesWithEmergencyLighting = properties?.filter((p) => p.has_emergency_lighting).length || 0;
    const propertiesWithFireDoors = properties?.filter((p) => p.has_fire_doors).length || 0;

    const compliancePercentage = totalProperties > 0
      ? ((propertiesWithFireAlarm + propertiesWithCOAlarm) / (totalProperties * 2)) * 100
      : 0;

    // License status
    const licensedProperties = properties?.filter((p) => p.license_number).length || 0;
    const expiringLicenses = properties?.filter((p) => {
      if (!p.license_expiry_date) return false;
      const expiryDate = new Date(p.license_expiry_date);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expiryDate <= threeMonthsFromNow && expiryDate >= new Date();
    }).length || 0;

    // Tenant status breakdown
    const activeTenants = tenants?.filter((t) => t.tenancy_status === 'active').length || 0;
    const noticeGiven = tenants?.filter((t) => t.tenancy_status === 'notice_given').length || 0;
    const endedTenancies = tenants?.filter((t) => t.tenancy_status === 'ended').length || 0;

    // Recent activity
    const recentProperties = properties
      ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        property_name: p.property_name,
        postcode: p.postcode,
        updated_at: p.updated_at,
      }));

    const recentTenants = tenants
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        full_name: t.full_name,
        move_in_date: t.move_in_date,
        tenancy_status: t.tenancy_status,
        monthly_rent: t.monthly_rent,
      }));

    return NextResponse.json(
      {
        success: true,
        stats: {
          overview: {
            total_properties: totalProperties,
            total_bedrooms: totalBedrooms,
            total_tenants: totalTenants,
            total_vacancies: totalVacancies,
            occupancy_rate: Math.round(occupancyRate * 10) / 10,
          },
          financial: {
            total_monthly_rent: totalMonthlyRent,
            total_deposits_held: totalDepositsHeld,
            avg_rent_per_tenant: totalTenants > 0 ? totalMonthlyRent / totalTenants : 0,
          },
          compliance: {
            properties_with_fire_alarm: propertiesWithFireAlarm,
            properties_with_co_alarm: propertiesWithCOAlarm,
            properties_with_emergency_lighting: propertiesWithEmergencyLighting,
            properties_with_fire_doors: propertiesWithFireDoors,
            compliance_percentage: Math.round(compliancePercentage * 10) / 10,
          },
          licensing: {
            licensed_properties: licensedProperties,
            unlicensed_properties: totalProperties - licensedProperties,
            expiring_soon: expiringLicenses,
          },
          tenancy_status: {
            active: activeTenants,
            notice_given: noticeGiven,
            ended: endedTenancies,
          },
        },
        recent_properties: recentProperties,
        recent_tenants: recentTenants,
        subscription: {
          tier: userData.hmo_pro_tier,
          active: userData.hmo_pro_active,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get HMO stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
