/**
 * Multi-Page Preview Generator
 *
 * Generates watermarked JPEG page images for document previews.
 * Used for tenancy agreements and other multi-page documents.
 *
 * Features:
 * - Renders HTML documents to multiple page images
 * - Applies personalized diagonal watermarks per page
 * - Stores images with signed URLs (short expiry)
 * - Caches results per case_id for performance
 */

import { createAdminClient } from '@/lib/supabase/server';
import { generateDocument } from './generator';
import { getJurisdictionConfig, type TenancyJurisdiction } from './ast-generator';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import crypto from 'crypto';

// Force Node.js runtime - Puppeteer cannot run on Edge
export const runtime = 'nodejs';

/** Preview page metadata */
export interface PreviewPage {
  page: number;
  width: number;
  height: number;
  url: string;
  expiresAt?: string;
}

/** Preview manifest returned by the API */
export interface PreviewManifest {
  status: 'ready' | 'processing' | 'error';
  caseId: string;
  product: string;
  jurisdiction: string;
  pageCount?: number;
  pages?: PreviewPage[];
  error?: string;
  generatedAt?: string;
  expiresAt?: string;
}

/** Generation options */
export interface PreviewGenerationOptions {
  caseId: string;
  product: string;
  tier?: 'standard' | 'premium';
  userId?: string;
  userEmail?: string;
  watermarkText?: string;
}

/** Internal preview cache entry */
interface CachedPreview {
  manifest: PreviewManifest;
  generatedAt: number;
  expiresAt: number;
}

// In-memory cache for preview manifests (per-process)
// In production, use Redis or similar for multi-instance consistency
const previewCache = new Map<string, CachedPreview>();

// Cache TTL: 30 minutes
const CACHE_TTL_MS = 30 * 60 * 1000;

// Signed URL expiry: 15 minutes
const SIGNED_URL_EXPIRY_SECONDS = 15 * 60;

// A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

// Output dimensions (scaled for preview)
const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 1131; // Maintain A4 aspect ratio

/**
 * Get cache key for a preview
 */
function getCacheKey(caseId: string, product: string, tier: string = 'standard'): string {
  return `preview:${caseId}:${product}:${tier}`;
}

/**
 * Generate a hash of the user identifier for watermarking
 */
function hashUserIdentifier(userId?: string, userEmail?: string): string {
  const identifier = userId || userEmail || 'anonymous';
  return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
}

/**
 * Create the watermark text with case and user info
 */
function createWatermarkText(caseId: string, userHash: string): string {
  const shortCaseId = caseId.substring(0, 8);
  return `PREVIEW • landlordheaven.co.uk • ${shortCaseId} • ${userHash}`;
}

/**
 * Add multi-line watermark overlay optimized for multi-page documents
 */
function addMultiPageWatermarkOverlay(html: string, watermarkText: string): string {
  const watermarkStyles = `
    <style>
      .preview-watermark-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .preview-watermark-repeat {
        position: absolute;
        width: 300%;
        height: 300%;
        top: -100%;
        left: -100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        transform: rotate(-35deg);
      }
      .preview-watermark-item {
        font-size: 14px;
        font-weight: 600;
        color: rgba(128, 128, 128, 0.25);
        padding: 40px 60px;
        font-family: 'Arial', sans-serif;
        white-space: nowrap;
        letter-spacing: 1px;
      }
      @media print {
        .preview-watermark-overlay {
          display: none !important;
        }
      }
    </style>
  `;

  // Create dense repeating watermark pattern (more items for multi-page)
  const watermarkItems = Array(80)
    .fill(`<span class="preview-watermark-item">${watermarkText}</span>`)
    .join('');

  const watermarkOverlay = `
    <div class="preview-watermark-overlay">
      <div class="preview-watermark-repeat">
        ${watermarkItems}
      </div>
    </div>
  `;

  // Inject watermark into HTML
  if (html.toLowerCase().includes('</body>')) {
    return html.replace(/<\/body>/i, `${watermarkStyles}${watermarkOverlay}</body>`);
  } else if (html.toLowerCase().includes('</html>')) {
    return html.replace(/<\/html>/i, `${watermarkStyles}${watermarkOverlay}</html>`);
  } else {
    return html + watermarkStyles + watermarkOverlay;
  }
}

/**
 * Wrap HTML fragment in full document structure
 */
function wrapHtmlFragment(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      padding: 40px;
      background: white;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

/**
 * Check if HTML is a complete document or fragment
 */
function isFullHtmlDocument(html: string): boolean {
  const lowerHtml = html.toLowerCase().trim();
  return lowerHtml.startsWith('<!doctype') || lowerHtml.startsWith('<html');
}

/**
 * Generate multi-page preview images using Puppeteer
 *
 * @param html - HTML content to render
 * @param watermarkText - Text to overlay on each page
 * @param options - Generation options
 * @returns Array of page image buffers
 */
export async function generateMultiPageImages(
  html: string,
  watermarkText: string,
  options?: {
    quality?: number;
    maxPages?: number;
  }
): Promise<{ pages: Buffer[]; pageCount: number }> {
  const quality = options?.quality || 75;
  const maxPages = options?.maxPages || 50; // Safety limit

  // Dynamic import for Puppeteer (Node.js only)
  const puppeteer = await import('puppeteer-core');

  // Use @sparticuz/chromium for serverless environments
  let browser;
  const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  try {
    if (isVercel) {
      const chromium = await import('@sparticuz/chromium');
      browser = await puppeteer.default.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      // Local development - use system Chrome
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          '/usr/bin/google-chrome-stable' ||
          '/usr/bin/chromium-browser',
      });
    }

    const page = await browser.newPage();

    // Set viewport to A4 dimensions
    await page.setViewport({
      width: A4_WIDTH,
      height: A4_HEIGHT,
      deviceScaleFactor: 1,
    });

    // Add watermark overlay
    const watermarkedHtml = addMultiPageWatermarkOverlay(html, watermarkText);

    // Wrap in document structure if needed
    const finalHtml = isFullHtmlDocument(watermarkedHtml)
      ? watermarkedHtml
      : wrapHtmlFragment(watermarkedHtml);

    // Load content
    await page.setContent(finalHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Get document height to calculate page count
    const documentHeight = await page.evaluate(() => {
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
    });

    // Calculate number of pages
    const pageCount = Math.min(Math.ceil(documentHeight / A4_HEIGHT), maxPages);

    console.log(`[Preview] Document height: ${documentHeight}px, pages: ${pageCount}`);

    // Render each page
    const pages: Buffer[] = [];

    for (let i = 0; i < pageCount; i++) {
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality,
        clip: {
          x: 0,
          y: i * A4_HEIGHT,
          width: A4_WIDTH,
          height: A4_HEIGHT,
        },
      });

      pages.push(screenshot as Buffer);
    }

    await browser.close();

    return { pages, pageCount };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Store preview images in Supabase storage
 *
 * @param caseId - Case ID
 * @param product - Product type
 * @param pages - Array of page image buffers
 * @returns Array of storage paths
 */
async function storePreviewImages(
  caseId: string,
  product: string,
  pages: Buffer[]
): Promise<string[]> {
  const supabase = createAdminClient();
  const storagePaths: string[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < pages.length; i++) {
    const fileName = `previews/${caseId}/${product}_page_${i}_${timestamp}.jpg`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, pages[i], {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`[Preview] Failed to store page ${i}:`, error);
      throw new Error(`Failed to store preview page ${i}: ${error.message}`);
    }

    storagePaths.push(fileName);
  }

  return storagePaths;
}

/**
 * Generate signed URLs for preview pages
 *
 * @param storagePaths - Array of storage paths
 * @returns Array of signed URLs
 */
async function generateSignedUrls(storagePaths: string[]): Promise<string[]> {
  const supabase = createAdminClient();
  const signedUrls: string[] = [];

  for (const path of storagePaths) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data?.signedUrl) {
      console.error(`[Preview] Failed to sign URL for ${path}:`, error);
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    signedUrls.push(data.signedUrl);
  }

  return signedUrls;
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
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Generate tenancy agreement preview for a case
 *
 * @param options - Generation options
 * @returns Preview manifest
 */
export async function generateTenancyPreview(
  options: PreviewGenerationOptions
): Promise<PreviewManifest> {
  const { caseId, product, tier = 'standard', userId, userEmail } = options;
  const cacheKey = getCacheKey(caseId, product, tier);

  // Check cache first
  const cached = previewCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[Preview] Cache hit for ${cacheKey}`);
    return cached.manifest;
  }

  console.log(`[Preview] Generating preview for case ${caseId}, product ${product}, tier ${tier}`);

  try {
    // Fetch case data
    const supabase = createAdminClient();
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (fetchError || !caseData) {
      return {
        status: 'error',
        caseId,
        product,
        jurisdiction: 'unknown',
        error: 'Case not found',
      };
    }

    // Cast to any for dynamic property access (Supabase returns generic types)
    const caseRow = caseData as any;
    const facts = caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {};
    const jurisdiction = deriveCanonicalJurisdiction(
      caseRow.jurisdiction,
      facts
    ) as TenancyJurisdiction;

    if (!jurisdiction) {
      return {
        status: 'error',
        caseId,
        product,
        jurisdiction: 'unknown',
        error: 'Invalid jurisdiction',
      };
    }

    // Get jurisdiction configuration
    const config = getJurisdictionConfig(jurisdiction);
    const templatePath =
      tier === 'premium' ? config.templatePaths.premium : config.templatePaths.standard;

    // Build template data (same as thumbnail endpoint)
    const templateData = {
      premium: tier === 'premium',
      is_hmo: tier === 'premium',
      jurisdiction,
      jurisdiction_name: config.jurisdictionLabel,
      legal_framework: config.legalFramework,
      document_id: `PREVIEW-${jurisdiction.toUpperCase()}-${Date.now()}`,
      generation_timestamp: new Date().toISOString(),
      current_date: new Date().toISOString().split('T')[0],
      current_year: new Date().getFullYear(),
      agreement_date: formatUKDate(
        facts.agreement_date || facts.tenancy_start_date || new Date().toISOString().split('T')[0]
      ),
      landlord_full_name: facts.landlord_full_name || facts.landlord_name || 'PREVIEW LANDLORD',
      landlord_address:
        facts.landlord_address ||
        facts.landlord_address_line1 ||
        '123 Preview Street, London, EC1A 1BB',
      landlord_address_line1: facts.landlord_address_line1 || '',
      landlord_address_town: facts.landlord_address_town || '',
      landlord_address_postcode: facts.landlord_address_postcode || '',
      landlord_email: facts.landlord_email || 'landlord@example.com',
      landlord_phone: facts.landlord_phone || '07700 000000',
      tenants: facts.tenants || [
        { full_name: 'PREVIEW TENANT', email: 'tenant@example.com', phone: '07700 111111', dob: '' },
      ],
      number_of_tenants: facts.number_of_tenants || facts.tenants?.length || 1,
      property_address: facts.property_address || '456 Preview Road, London, SW1A 1AA',
      property_address_line1: facts.property_address_line1 || '',
      property_address_town: facts.property_address_town || '',
      property_address_postcode: facts.property_address_postcode || '',
      property_type: facts.property_type || 'House',
      number_of_bedrooms: facts.number_of_bedrooms || '3',
      furnished_status: facts.furnished_status || 'unfurnished',
      tenancy_start_date: formatUKDate(
        facts.tenancy_start_date || new Date().toISOString().split('T')[0]
      ),
      is_fixed_term: facts.is_fixed_term !== false,
      tenancy_end_date: formatUKDate(facts.tenancy_end_date || ''),
      term_length: facts.term_length || '12 months',
      rent_period: facts.rent_period || 'month',
      rent_amount: facts.rent_amount || 1500,
      rent_amount_formatted: formatCurrency(facts.rent_amount || 1500),
      rent_due_day: facts.rent_due_day || '1st',
      payment_method: facts.payment_method || 'Bank Transfer',
      deposit_amount: facts.deposit_amount || 1731,
      deposit_amount_formatted: formatCurrency(facts.deposit_amount || 1731),
      deposit_scheme_name: facts.deposit_scheme_name || 'DPS',
      gas_safety_certificate: facts.gas_safety_certificate !== false,
      electrical_safety_certificate: facts.electrical_safety_certificate !== false,
      epc_rating: facts.epc_rating || 'C',
      smoke_alarms_fitted: facts.smoke_alarms_fitted !== false,
      carbon_monoxide_alarms: facts.carbon_monoxide_alarms !== false,
      pets_allowed: facts.pets_allowed || false,
      smoking_allowed: facts.smoking_allowed || false,
      has_garden: facts.has_garden || false,
      ...(jurisdiction === 'wales'
        ? {
            contract_holder_full_name:
              facts.tenants?.[0]?.full_name || 'PREVIEW CONTRACT HOLDER',
            dwelling_address: facts.property_address || '456 Preview Road, Cardiff, CF1 1AA',
          }
        : {}),
      ...(jurisdiction === 'scotland'
        ? {
            landlord_registration_number:
              facts.landlord_registration_number || 'PREVIEW-REG-12345',
          }
        : {}),
      ...(tier === 'premium'
        ? {
            is_hmo: true,
            has_shared_facilities: true,
            number_of_sharers: facts.number_of_sharers || 4,
            hmo_licence_number: facts.hmo_licence_number || 'HMO-PREVIEW-001',
            hmo_licence_expiry: formatUKDate(facts.hmo_licence_expiry || ''),
            communal_areas:
              facts.communal_areas || 'Kitchen, bathroom, and living room are shared.',
            joint_and_several_liability: true,
          }
        : {}),
    };

    // Generate HTML from template
    const doc = await generateDocument({
      templatePath,
      data: templateData,
      isPreview: true,
      outputFormat: 'html',
    });

    // Create personalized watermark
    const userHash = hashUserIdentifier(userId, userEmail);
    const watermarkText = createWatermarkText(caseId, userHash);

    // Generate multi-page images
    const { pages, pageCount } = await generateMultiPageImages(doc.html, watermarkText);

    console.log(`[Preview] Generated ${pageCount} pages for case ${caseId}`);

    // Store images in Supabase
    const storagePaths = await storePreviewImages(caseId, product, pages);

    // Generate signed URLs
    const signedUrls = await generateSignedUrls(storagePaths);

    // Build manifest
    const now = Date.now();
    const expiresAt = new Date(now + SIGNED_URL_EXPIRY_SECONDS * 1000).toISOString();

    const manifest: PreviewManifest = {
      status: 'ready',
      caseId,
      product,
      jurisdiction,
      pageCount,
      pages: signedUrls.map((url, i) => ({
        page: i,
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
        url,
        expiresAt,
      })),
      generatedAt: new Date().toISOString(),
      expiresAt,
    };

    // Cache the manifest
    previewCache.set(cacheKey, {
      manifest,
      generatedAt: now,
      expiresAt: now + CACHE_TTL_MS,
    });

    return manifest;
  } catch (error: any) {
    console.error(`[Preview] Generation failed for case ${caseId}:`, error);
    return {
      status: 'error',
      caseId,
      product,
      jurisdiction: 'unknown',
      error: error.message || 'Failed to generate preview',
    };
  }
}

/**
 * Check if a preview is cached and ready
 */
export function getPreviewFromCache(
  caseId: string,
  product: string,
  tier: string = 'standard'
): PreviewManifest | null {
  const cacheKey = getCacheKey(caseId, product, tier);
  const cached = previewCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.manifest;
  }

  return null;
}

/**
 * Invalidate cached preview for a case
 */
export function invalidatePreviewCache(caseId: string): void {
  const keysToDelete: string[] = [];

  for (const key of previewCache.keys()) {
    if (key.includes(caseId)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    previewCache.delete(key);
  }

  console.log(`[Preview] Invalidated ${keysToDelete.length} cached previews for case ${caseId}`);
}
