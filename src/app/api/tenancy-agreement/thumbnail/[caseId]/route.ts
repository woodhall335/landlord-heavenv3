/**
 * Tenancy Agreement Thumbnail API
 *
 * GET /api/tenancy-agreement/thumbnail/[caseId]
 *
 * Generates a watermarked JPEG thumbnail of the first page of a tenancy agreement
 * document WITHOUT creating persistent database records. This allows preview thumbnails
 * for the tenancy agreement product page, checkout confirmation, and dashboard.
 *
 * Supports:
 * - England: Assured Shorthold Tenancy (Housing Act 1988)
 * - Wales: Standard Occupation Contract (Renting Homes (Wales) Act 2016)
 * - Scotland: Private Residential Tenancy (Private Housing (Tenancies) (Scotland) Act 2016)
 * - Northern Ireland: Private Tenancy Agreement (Private Tenancies Act (NI) 2022)
 *
 * Query Parameters:
 * - tier: 'standard' | 'premium' (default: 'standard')
 *
 * Returns:
 * - 200 OK with image/jpeg content type
 * - 404 if case not found
 * - 422 if validation fails
 * - 500 on generation error
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { htmlToPreviewThumbnail, generateDocument } from '@/lib/documents/generator';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { getJurisdictionConfig, type TenancyJurisdiction, validateASTData } from '@/lib/documents/ast-generator';

// Force Node.js runtime - Puppeteer/@sparticuz/chromium cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization
export const dynamic = 'force-dynamic';

// Environment detection
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Structured error response
 */
function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const logData = { code, message, status, ...details, isVercel, timestamp: new Date().toISOString() };
  console.error(`[Tenancy-Agreement-Thumbnail] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
}

/**
 * Format currency value in UK pounds
 */
function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return '£0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '£0.00';
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date in UK legal format
 */
function formatUKDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const startTime = Date.now();
  let caseId: string | null = null;

  try {
    const resolvedParams = await params;
    caseId = resolvedParams.caseId;

    // Parse query params
    const url = new URL(request.url);
    const tier = (url.searchParams.get('tier') || 'standard') as 'standard' | 'premium';

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    console.log(`[Tenancy-Agreement-Thumbnail] Request:`, { caseId, tier });

    // Get user and create client
    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    // Fetch case
    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[Tenancy-Agreement-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const facts = caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {};

    // Determine jurisdiction
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, facts) as TenancyJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    // Get jurisdiction configuration
    const config = getJurisdictionConfig(jurisdiction);
    const templatePath = tier === 'premium' ? config.templatePaths.premium : config.templatePaths.standard;

    console.log(`[Tenancy-Agreement-Thumbnail] Generating:`, {
      jurisdiction,
      tier,
      templatePath,
      legalFramework: config.legalFramework
    });

    // Map wizard facts to template data
    const templateData = {
      // Metadata
      premium: tier === 'premium',
      is_hmo: tier === 'premium',
      jurisdiction: jurisdiction,
      jurisdiction_name: config.jurisdictionLabel,
      legal_framework: config.legalFramework,
      document_id: `PREVIEW-${jurisdiction.toUpperCase()}-${Date.now()}`,
      generation_timestamp: new Date().toISOString(),
      current_date: new Date().toISOString().split('T')[0],
      current_year: new Date().getFullYear(),

      // Agreement date
      agreement_date: formatUKDate(facts.agreement_date || facts.tenancy_start_date || new Date().toISOString().split('T')[0]),

      // Landlord details
      landlord_full_name: facts.landlord_full_name || facts.landlord_name || 'PREVIEW LANDLORD',
      landlord_address: facts.landlord_address || facts.landlord_address_line1 || '123 Preview Street, London, EC1A 1BB',
      landlord_address_line1: facts.landlord_address_line1 || '',
      landlord_address_town: facts.landlord_address_town || '',
      landlord_address_postcode: facts.landlord_address_postcode || '',
      landlord_email: facts.landlord_email || 'landlord@example.com',
      landlord_phone: facts.landlord_phone || '07700 000000',

      // Tenant details
      tenants: facts.tenants || [{ full_name: 'PREVIEW TENANT', email: 'tenant@example.com', phone: '07700 111111', dob: '' }],
      number_of_tenants: facts.number_of_tenants || facts.tenants?.length || 1,

      // Property details
      property_address: facts.property_address || '456 Preview Road, London, SW1A 1AA',
      property_address_line1: facts.property_address_line1 || '',
      property_address_town: facts.property_address_town || '',
      property_address_postcode: facts.property_address_postcode || '',
      property_type: facts.property_type || 'House',
      number_of_bedrooms: facts.number_of_bedrooms || '3',
      furnished_status: facts.furnished_status || 'unfurnished',

      // Tenancy term
      tenancy_start_date: formatUKDate(facts.tenancy_start_date || new Date().toISOString().split('T')[0]),
      is_fixed_term: facts.is_fixed_term !== false,
      tenancy_end_date: formatUKDate(facts.tenancy_end_date || ''),
      term_length: facts.term_length || '12 months',
      rent_period: facts.rent_period || 'month',

      // Rent
      rent_amount: facts.rent_amount || 1500,
      rent_amount_formatted: formatCurrency(facts.rent_amount || 1500),
      rent_due_day: facts.rent_due_day || '1st',
      payment_method: facts.payment_method || 'Bank Transfer',

      // Deposit
      deposit_amount: facts.deposit_amount || 1731,
      deposit_amount_formatted: formatCurrency(facts.deposit_amount || 1731),
      deposit_scheme_name: facts.deposit_scheme_name || 'DPS',

      // Safety certificates
      gas_safety_certificate: facts.gas_safety_certificate !== false,
      electrical_safety_certificate: facts.electrical_safety_certificate !== false,
      epc_rating: facts.epc_rating || 'C',
      smoke_alarms_fitted: facts.smoke_alarms_fitted !== false,
      carbon_monoxide_alarms: facts.carbon_monoxide_alarms !== false,

      // Jurisdiction-specific fields for Wales
      ...(jurisdiction === 'wales' ? {
        contract_holder_full_name: facts.tenants?.[0]?.full_name || 'PREVIEW CONTRACT HOLDER',
        dwelling_address: facts.property_address || '456 Preview Road, Cardiff, CF1 1AA',
      } : {}),

      // Jurisdiction-specific fields for Scotland
      ...(jurisdiction === 'scotland' ? {
        landlord_registration_number: facts.landlord_registration_number || 'PREVIEW-REG-12345',
      } : {}),

      // HMO-specific fields for premium tier
      ...(tier === 'premium' ? {
        is_hmo: true,
        has_shared_facilities: true,
        number_of_sharers: facts.number_of_sharers || 4,
        hmo_licence_number: facts.hmo_licence_number || 'HMO-PREVIEW-001',
        hmo_licence_expiry: formatUKDate(facts.hmo_licence_expiry || ''),
        communal_areas: facts.communal_areas || 'Kitchen, bathroom, and living room are shared.',
        joint_and_several_liability: true,
      } : {}),

      // Additional common fields
      pets_allowed: facts.pets_allowed || false,
      smoking_allowed: facts.smoking_allowed || false,
      has_garden: facts.has_garden || false,
    };

    // Generate HTML from template
    const doc = await generateDocument({
      templatePath,
      data: templateData,
      isPreview: true,
      outputFormat: 'html',
    });

    // Generate thumbnail from HTML
    const thumbnail = await htmlToPreviewThumbnail(doc.html, {
      quality: 75,
      watermarkText: 'PREVIEW',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Tenancy-Agreement-Thumbnail] Success:`, {
      caseId,
      jurisdiction,
      tier,
      size: thumbnail.length,
      elapsed: `${elapsed}ms`,
    });

    // Return JPEG image
    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="preview.jpg"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      'X-Thumbnail-Runtime': 'nodejs',
      'X-Jurisdiction': jurisdiction,
      'X-Tier': tier,
    };

    // Only set Content-Length in non-Vercel environments
    if (!isVercel) {
      headers['Content-Length'] = thumbnail.length.toString();
    }

    return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to generate thumbnail',
      500,
      {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        caseId,
        elapsed: `${elapsed}ms`,
      }
    );
  }
}
