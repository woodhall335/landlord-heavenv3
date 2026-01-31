/**
 * Multi-Page Preview Generator (Production-Hardened)
 *
 * Generates watermarked WebP/JPEG page images for document previews.
 * Used for tenancy agreements and other multi-page documents.
 *
 * Features:
 * - WebP by default with JPEG fallback
 * - Facts-based cache key with version hash
 * - Concurrency guards (prevent duplicate generation)
 * - Server-side secret salt for watermark hashing
 * - Unguessable storage paths
 * - Automatic cleanup of old preview assets
 * - Signed URLs with short expiry
 */

import { createAdminClient } from '@/lib/supabase/server';
import { generateDocument } from './generator';
import { getJurisdictionConfig, type TenancyJurisdiction } from './ast-generator';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import crypto from 'crypto';

// Force Node.js runtime - Puppeteer cannot run on Edge
export const runtime = 'nodejs';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Cache TTL: 2 hours (increased from 30 minutes)
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

// Signed URL expiry: 15 minutes
const SIGNED_URL_EXPIRY_SECONDS = 15 * 60;

// A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

// Output dimensions (scaled for preview)
const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 1131; // Maintain A4 aspect ratio

// WebP quality (70-85 recommended)
const WEBP_QUALITY = 80;

// JPEG fallback quality
const JPEG_QUALITY = 75;

// Max pages for safety limit
const MAX_PAGES = 50;

// Cleanup: Delete preview assets older than 24 hours
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000;

// Server-side secret salt (should be set via environment variable)
const WATERMARK_SECRET_SALT = process.env.PREVIEW_WATERMARK_SECRET || 'landlordheaven-preview-salt-2026';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Preview page metadata */
export interface PreviewPage {
  page: number;
  width: number;
  height: number;
  url: string;
  mimeType: 'image/webp' | 'image/jpeg';
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
  factsHash?: string; // Hash of facts for cache validation
}

/** Generation options */
export interface PreviewGenerationOptions {
  caseId: string;
  product: string;
  tier?: 'standard' | 'premium';
  userId?: string;
  userEmail?: string;
  watermarkText?: string;
  forceRegenerate?: boolean;
}

/** Internal preview cache entry */
interface CachedPreview {
  manifest: PreviewManifest;
  factsHash: string;
  generatedAt: number;
  expiresAt: number;
}

/** Image format for storage */
type ImageFormat = 'webp' | 'jpeg';

/** Generated page result */
interface GeneratedPage {
  buffer: Buffer;
  format: ImageFormat;
  mimeType: 'image/webp' | 'image/jpeg';
}

// ============================================================================
// CACHE & CONCURRENCY STATE
// ============================================================================

// In-memory cache for preview manifests (per-process)
// In production, use Redis or similar for multi-instance consistency
const previewCache = new Map<string, CachedPreview>();

// In-progress generation locks (prevent duplicate parallel generation)
const generationLocks = new Map<string, Promise<PreviewManifest>>();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a hash of the facts object for cache invalidation
 */
export function hashFacts(facts: Record<string, unknown>): string {
  // Sort keys for consistent ordering
  const normalized = JSON.stringify(facts, Object.keys(facts).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

/**
 * Get cache key for a preview (includes facts hash)
 */
function getCacheKey(caseId: string, product: string, tier: string = 'standard'): string {
  return `preview:${caseId}:${product}:${tier}`;
}

/**
 * Generate a secure, unguessable storage path
 */
function generateStoragePath(caseId: string, product: string, pageNum: number, format: ImageFormat): string {
  // Create unguessable path segment using HMAC
  const pathSecret = process.env.PREVIEW_PATH_SECRET || 'path-secret-default';
  const uniqueSegment = crypto
    .createHmac('sha256', pathSecret)
    .update(`${caseId}:${product}:${Date.now()}:${pageNum}`)
    .digest('hex')
    .substring(0, 24);

  const extension = format === 'webp' ? 'webp' : 'jpg';
  return `previews/${uniqueSegment}/page_${pageNum}.${extension}`;
}

/**
 * Generate a hash of the user identifier with server-side secret salt
 * This creates a non-PII hash that can identify the user for watermark purposes
 */
function hashUserIdentifier(userId?: string, userEmail?: string): string {
  const identifier = userId || userEmail || 'anonymous';
  return crypto
    .createHmac('sha256', WATERMARK_SECRET_SALT)
    .update(identifier)
    .digest('hex')
    .substring(0, 8);
}

/**
 * Create the watermark text with case and user info
 */
function createWatermarkText(caseId: string, userHash: string): string {
  const shortCaseId = caseId.substring(0, 8);
  return `PREVIEW • landlordheaven.co.uk • case ${shortCaseId} • ${userHash}`;
}

/**
 * Add multi-line watermark overlay optimized for multi-page documents
 * Enhanced for visibility on both light and dark content
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
        font-weight: 700;
        padding: 40px 60px;
        font-family: 'Arial', sans-serif;
        white-space: nowrap;
        letter-spacing: 1px;
        /* Dual-layer text for visibility on any background */
        text-shadow:
          /* White outline for dark backgrounds */
          -1px -1px 0 rgba(255, 255, 255, 0.7),
          1px -1px 0 rgba(255, 255, 255, 0.7),
          -1px 1px 0 rgba(255, 255, 255, 0.7),
          1px 1px 0 rgba(255, 255, 255, 0.7),
          /* Dark shadow for light backgrounds */
          2px 2px 4px rgba(0, 0, 0, 0.3);
        color: rgba(100, 100, 100, 0.35);
      }
      @media print {
        .preview-watermark-overlay {
          display: none !important;
        }
      }
    </style>
  `;

  // Create dense repeating watermark pattern
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

// ============================================================================
// IMAGE CONVERSION (WebP with JPEG fallback)
// ============================================================================

/**
 * Convert PNG buffer to WebP, with JPEG fallback if conversion fails
 */
async function convertToWebP(pngBuffer: Buffer): Promise<GeneratedPage> {
  try {
    // Dynamic import of sharp (Node.js only)
    const sharp = (await import('sharp')).default;

    const webpBuffer = await sharp(pngBuffer)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return {
      buffer: webpBuffer,
      format: 'webp',
      mimeType: 'image/webp',
    };
  } catch (error) {
    console.warn('[Preview] WebP conversion failed, falling back to JPEG:', error);
    return convertToJPEG(pngBuffer);
  }
}

/**
 * Convert PNG buffer to JPEG
 */
async function convertToJPEG(pngBuffer: Buffer): Promise<GeneratedPage> {
  try {
    const sharp = (await import('sharp')).default;

    const jpegBuffer = await sharp(pngBuffer)
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    return {
      buffer: jpegBuffer,
      format: 'jpeg',
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    console.error('[Preview] JPEG conversion also failed:', error);
    throw new Error('Failed to convert image to any supported format');
  }
}

// ============================================================================
// PUPPETEER PAGE GENERATION
// ============================================================================

/**
 * Generate multi-page preview images using Puppeteer
 * Outputs WebP by default with JPEG fallback
 *
 * @param html - HTML content to render
 * @param watermarkText - Text to overlay on each page
 * @param options - Generation options
 * @returns Array of page image results with format info
 */
export async function generateMultiPageImages(
  html: string,
  watermarkText: string,
  options?: {
    maxPages?: number;
    preferFormat?: 'webp' | 'jpeg';
  }
): Promise<{ pages: GeneratedPage[]; pageCount: number }> {
  const maxPages = options?.maxPages || MAX_PAGES;
  const preferFormat = options?.preferFormat || 'webp';

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

    // Load content with timeout
    await page.setContent(finalHtml, {
      waitUntil: 'networkidle0',
      timeout: 45000, // 45 second timeout
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

    // Render each page as PNG first, then convert
    const pages: GeneratedPage[] = [];

    for (let i = 0; i < pageCount; i++) {
      // Capture as PNG for best quality source
      const pngBuffer = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: i * A4_HEIGHT,
          width: A4_WIDTH,
          height: A4_HEIGHT,
        },
      });

      // Convert to preferred format (WebP with JPEG fallback)
      let pageResult: GeneratedPage;
      if (preferFormat === 'webp') {
        pageResult = await convertToWebP(pngBuffer as Buffer);
      } else {
        pageResult = await convertToJPEG(pngBuffer as Buffer);
      }

      pages.push(pageResult);
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

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Store preview images in Supabase storage with correct content types
 *
 * @param caseId - Case ID
 * @param product - Product type
 * @param pages - Array of generated page results
 * @returns Array of storage paths
 */
async function storePreviewImages(
  caseId: string,
  product: string,
  pages: GeneratedPage[]
): Promise<{ paths: string[]; formats: ImageFormat[] }> {
  const supabase = createAdminClient();
  const storagePaths: string[] = [];
  const formats: ImageFormat[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const storagePath = generateStoragePath(caseId, product, i, page.format);

    const { error } = await supabase.storage
      .from('documents')
      .upload(storagePath, page.buffer, {
        contentType: page.mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`[Preview] Failed to store page ${i}:`, error);
      throw new Error(`Failed to store preview page ${i}: ${error.message}`);
    }

    storagePaths.push(storagePath);
    formats.push(page.format);
  }

  return { paths: storagePaths, formats };
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
 * Cleanup old preview assets from storage
 * Removes files older than CLEANUP_AGE_MS
 */
export async function cleanupOldPreviews(): Promise<{ deleted: number; errors: number }> {
  const supabase = createAdminClient();
  let deleted = 0;
  let errors = 0;

  try {
    // List all preview directories
    const { data: folders, error: listError } = await supabase.storage
      .from('documents')
      .list('previews', { limit: 1000 });

    if (listError) {
      console.error('[Preview] Failed to list preview folders:', listError);
      return { deleted: 0, errors: 1 };
    }

    if (!folders || folders.length === 0) {
      return { deleted: 0, errors: 0 };
    }

    const cutoffTime = Date.now() - CLEANUP_AGE_MS;

    for (const folder of folders) {
      // Check folder creation time (approximate from name or metadata)
      // Since we use random paths, we need to check file metadata
      const { data: files } = await supabase.storage
        .from('documents')
        .list(`previews/${folder.name}`);

      if (files && files.length > 0) {
        // Check if folder is old (using created_at of first file)
        const firstFile = files[0];
        const createdAt = new Date(firstFile.created_at || 0).getTime();

        if (createdAt < cutoffTime) {
          // Delete all files in folder
          const filePaths = files.map(f => `previews/${folder.name}/${f.name}`);
          const { error: deleteError } = await supabase.storage
            .from('documents')
            .remove(filePaths);

          if (deleteError) {
            console.error(`[Preview] Failed to delete folder ${folder.name}:`, deleteError);
            errors++;
          } else {
            deleted += filePaths.length;
          }
        }
      }
    }

    console.log(`[Preview] Cleanup complete: ${deleted} files deleted, ${errors} errors`);
  } catch (error) {
    console.error('[Preview] Cleanup error:', error);
    errors++;
  }

  return { deleted, errors };
}

// ============================================================================
// TEMPLATE DATA HELPERS
// ============================================================================

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

// ============================================================================
// MAIN PREVIEW GENERATION
// ============================================================================

/**
 * Generate tenancy agreement preview for a case
 * Includes concurrency guards to prevent duplicate generation
 *
 * @param options - Generation options
 * @returns Preview manifest
 */
export async function generateTenancyPreview(
  options: PreviewGenerationOptions
): Promise<PreviewManifest> {
  const { caseId, product, tier = 'standard', userId, userEmail, forceRegenerate = false } = options;
  const cacheKey = getCacheKey(caseId, product, tier);

  // Check for in-progress generation (concurrency guard)
  const existingGeneration = generationLocks.get(cacheKey);
  if (existingGeneration) {
    console.log(`[Preview] Waiting for existing generation of ${cacheKey}`);
    return existingGeneration;
  }

  // Check cache first (unless force regenerate)
  if (!forceRegenerate) {
    const cached = previewCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[Preview] Cache hit for ${cacheKey}`);
      return cached.manifest;
    }
  }

  console.log(`[Preview] Generating preview for case ${caseId}, product ${product}, tier ${tier}`);

  // Create generation promise for concurrency guard
  const generationPromise = (async (): Promise<PreviewManifest> => {
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
      const factsHash = hashFacts(facts);

      // Check if cached version matches current facts hash
      const cached = previewCache.get(cacheKey);
      if (!forceRegenerate && cached && cached.factsHash === factsHash && cached.expiresAt > Date.now()) {
        console.log(`[Preview] Cache still valid for ${cacheKey} (facts hash matches)`);
        return cached.manifest;
      }

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

      // Build template data
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

      // Create personalized watermark with server-side salt
      const userHash = hashUserIdentifier(userId, userEmail);
      const watermarkText = createWatermarkText(caseId, userHash);

      // Generate multi-page images (WebP by default)
      const { pages, pageCount } = await generateMultiPageImages(doc.html, watermarkText);

      console.log(`[Preview] Generated ${pageCount} pages for case ${caseId}`);

      // Store images in Supabase
      const { paths: storagePaths, formats } = await storePreviewImages(caseId, product, pages);

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
        factsHash,
        pages: signedUrls.map((url, i) => ({
          page: i,
          width: OUTPUT_WIDTH,
          height: OUTPUT_HEIGHT,
          url,
          mimeType: pages[i].mimeType,
          expiresAt,
        })),
        generatedAt: new Date().toISOString(),
        expiresAt,
      };

      // Cache the manifest
      previewCache.set(cacheKey, {
        manifest,
        factsHash,
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
    } finally {
      // Remove from generation locks
      generationLocks.delete(cacheKey);
    }
  })();

  // Store the promise for concurrent requests
  generationLocks.set(cacheKey, generationPromise);

  return generationPromise;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

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
 * Check if cached preview matches current facts hash
 */
export function isPreviewCacheValid(
  caseId: string,
  product: string,
  tier: string,
  factsHash: string
): boolean {
  const cacheKey = getCacheKey(caseId, product, tier);
  const cached = previewCache.get(cacheKey);

  return !!(cached && cached.factsHash === factsHash && cached.expiresAt > Date.now());
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

/**
 * Clear all preview caches (for testing)
 */
export function clearAllPreviewCaches(): void {
  previewCache.clear();
  generationLocks.clear();
  console.log('[Preview] All caches cleared');
}
