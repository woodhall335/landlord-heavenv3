/**
 * UK Councils API - Get Council Data
 *
 * GET /api/councils - Get all UK councils with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import councilsData from '@/config/jurisdictions/uk/england/councils.json';

// Get councils data with optional filtering
export async function GET(request: NextRequest) {
  try {
    await requireServerAuth();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.toLowerCase();
    const region = searchParams.get('region');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Start with all councils
    let councils = councilsData.councils;

    // Filter by search term (name or region)
    if (search) {
      councils = councils.filter(
        (council) =>
          council.name.toLowerCase().includes(search) ||
          council.region.toLowerCase().includes(search)
      );
    }

    // Filter by region
    if (region) {
      councils = councils.filter(
        (council) => council.region.toLowerCase() === region.toLowerCase()
      );
    }

    // Limit results
    if (limit && limit > 0) {
      councils = councils.slice(0, limit);
    }

    // Get unique regions for filtering UI
    const uniqueRegions = Array.from(
      new Set(councilsData.councils.map((c) => c.region))
    ).sort();

    return NextResponse.json({
      councils,
      total: councils.length,
      regions: uniqueRegions,
      metadata: {
        totalCouncils: councilsData.councils.length,
        jurisdiction: 'England & Wales',
        lastUpdated: councilsData.metadata.lastUpdated,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
