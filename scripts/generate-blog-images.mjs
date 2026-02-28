#!/usr/bin/env node
/**
 * Blog Image Generator using Stability AI
 * Generates illustrations in the brand purple color (#7C3AED) for all blog placeholders
 *
 * Usage: STABILITY_API_KEY=xxx node scripts/generate-blog-images.mjs
 *
 * Options:
 *   --dry-run    Show what would be generated without making API calls
 *   --single=NAME  Generate a single image by placeholder name
 *   --batch=N    Process N images at a time (default: 5)
 *   --skip=N     Skip first N images (for resuming)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const POSTS_FILE = path.join(ROOT_DIR, 'src/lib/blog/posts.tsx');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/images/blog');

// Brand color
const BRAND_PURPLE = '#7C3AED';

// Stability AI API settings - using SDXL 1.0 endpoint
const API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY || 'sk-2O6444ldUoew5tPpwGM6tAcIbIDyonKlYH4p4ZvuZ1QG5huI';

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const singleArg = args.find(a => a.startsWith('--single='));
const singleImage = singleArg ? singleArg.split('=')[1] : null;
const batchArg = args.find(a => a.startsWith('--batch='));
const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : 5;
const skipArg = args.find(a => a.startsWith('--skip='));
const skipCount = skipArg ? parseInt(skipArg.split('=')[1]) : 0;

/**
 * Extract placeholder images from posts.tsx with their context
 */
async function extractPlaceholders() {
  const content = await fs.readFile(POSTS_FILE, 'utf-8');
  const placeholders = new Map();

  // Match ImagePlaceholder components
  const imagePlaceholderRegex = /<ImagePlaceholder\s+src="([^"]+placeholder-([^"]+)\.svg)"[^>]*alt="([^"]*)"[^>]*(?:caption="([^"]*)")?[^>]*\/>/g;
  let match;

  while ((match = imagePlaceholderRegex.exec(content)) !== null) {
    const [, fullPath, name, alt, caption] = match;
    if (!placeholders.has(name)) {
      placeholders.set(name, {
        name,
        originalPath: fullPath,
        alt: alt || name.replace(/-/g, ' '),
        caption: caption || '',
      });
    }
  }

  // Match heroImage paths
  const heroImageRegex = /heroImage:\s*['"]([^'"]+placeholder-([^'"]+)\.svg)['"]/g;
  while ((match = heroImageRegex.exec(content)) !== null) {
    const [, fullPath, name] = match;
    if (!placeholders.has(name)) {
      placeholders.set(name, {
        name,
        originalPath: fullPath,
        alt: name.replace(/-/g, ' '),
        caption: '',
        isHero: true,
      });
    }
  }

  // Also check for heroImageAlt for better context
  const heroAltRegex = /heroImage:\s*['"][^'"]+placeholder-([^'"]+)\.svg['"],\s*\n\s*heroImageAlt:\s*['"]([^'"]+)['"]/g;
  while ((match = heroAltRegex.exec(content)) !== null) {
    const [, name, alt] = match;
    if (placeholders.has(name)) {
      placeholders.get(name).alt = alt;
    }
  }

  return Array.from(placeholders.values());
}

/**
 * Generate a prompt for Stability AI based on the image context
 */
function generatePrompt(placeholder) {
  const { name, alt, caption } = placeholder;

  // Base style for all images - clean illustrations with brand purple
  const baseStyle = `Clean minimalist illustration, professional legal/property theme, modern flat design style, predominantly purple and violet color scheme (#7C3AED, #A78BFA, #6D28D9), white background, no text or words, business professional style, vector art aesthetic`;

  // Parse the name and alt to generate specific prompts
  const subject = alt || name.replace(/-/g, ' ');

  // Category-specific enhancements
  let specificPrompt = '';

  if (name.includes('section-21') || name.includes('s21')) {
    specificPrompt = 'Legal eviction document with official seal, formal notice paper, UK property law theme';
  } else if (name.includes('section-8') || name.includes('s8')) {
    specificPrompt = 'Legal court document, possession claim form, official papers with stamp';
  } else if (name.includes('eviction')) {
    specificPrompt = 'Eviction process illustration, house with legal document, professional setting';
  } else if (name.includes('court') || name.includes('hearing')) {
    specificPrompt = 'Courthouse building, legal courtroom, gavel and scales of justice';
  } else if (name.includes('tribunal')) {
    specificPrompt = 'Tribunal hearing room, panel of judges, formal legal proceeding';
  } else if (name.includes('rent') || name.includes('arrears')) {
    specificPrompt = 'Money and rent ledger, payment calendar, financial document';
  } else if (name.includes('deposit')) {
    specificPrompt = 'Deposit protection scheme, secure vault concept, money security';
  } else if (name.includes('hmo')) {
    specificPrompt = 'Multiple occupancy house, shared housing illustration, multi-tenant building';
  } else if (name.includes('epc') || name.includes('energy')) {
    specificPrompt = 'Energy performance certificate, green energy rating chart, house with rating';
  } else if (name.includes('gas') || name.includes('safety')) {
    specificPrompt = 'Gas safety certificate, safety inspection checklist, safety equipment';
  } else if (name.includes('inventory')) {
    specificPrompt = 'Property inventory checklist, room inspection documentation';
  } else if (name.includes('tenant')) {
    specificPrompt = 'Tenant and landlord relationship, property handover, keys and contract';
  } else if (name.includes('agreement') || name.includes('contract')) {
    specificPrompt = 'Legal contract document, signature on agreement, formal paperwork';
  } else if (name.includes('inspection')) {
    specificPrompt = 'Property inspection checklist, magnifying glass on house, assessment';
  } else if (name.includes('notice')) {
    specificPrompt = 'Legal notice document, formal letter, official notification';
  } else if (name.includes('scotland') || name.includes('prt')) {
    specificPrompt = 'Scottish property law theme, Scotland map silhouette, tartan accent';
  } else if (name.includes('wales') || name.includes('rsw')) {
    specificPrompt = 'Welsh property law theme, Wales dragon subtle accent, Celtic design elements';
  } else if (name.includes('ni-') || name.includes('northern-ireland')) {
    specificPrompt = 'Northern Ireland property theme, Belfast skyline accent';
  } else if (name.includes('timeline') || name.includes('process') || name.includes('overview')) {
    specificPrompt = 'Process flowchart, step-by-step diagram, timeline illustration';
  } else if (name.includes('checklist')) {
    specificPrompt = 'Checklist with checkmarks, to-do list, task completion';
  } else if (name.includes('form') || name.includes('document')) {
    specificPrompt = 'Official form document, fillable paperwork, legal form template';
  } else if (name.includes('property') || name.includes('house') || name.includes('building')) {
    specificPrompt = 'Residential property, UK house illustration, home exterior';
  } else if (name.includes('portfolio')) {
    specificPrompt = 'Property portfolio, multiple houses, investment properties';
  } else if (name.includes('tax')) {
    specificPrompt = 'Tax calculation, financial documents, calculator and receipts';
  } else if (name.includes('insurance')) {
    specificPrompt = 'Property insurance, shield protecting house, coverage concept';
  } else if (name.includes('student')) {
    specificPrompt = 'Student accommodation, young tenant, university housing';
  } else if (name.includes('holiday')) {
    specificPrompt = 'Holiday let property, vacation rental, short-term accommodation';
  } else if (name.includes('corporate')) {
    specificPrompt = 'Corporate letting, business professional, company housing';
  } else if (name.includes('software')) {
    specificPrompt = 'Property management software, digital dashboard, tech solution';
  } else if (name.includes('marketing')) {
    specificPrompt = 'Property marketing, advertisement, promotional material';
  } else if (name.includes('bailiff') || name.includes('sheriff')) {
    specificPrompt = 'Enforcement officer, legal enforcement, court officer';
  } else if (name.includes('reform') || name.includes('bill') || name.includes('act')) {
    specificPrompt = 'Law reform document, parliamentary bill, legislation change';
  } else if (name.includes('ground-')) {
    const groundNum = name.match(/ground-(\d+)/)?.[1] || '';
    specificPrompt = `Section 8 Ground ${groundNum} legal notice, possession ground illustration`;
  } else if (name.includes('alarm') || name.includes('smoke') || name.includes('co-')) {
    specificPrompt = 'Safety alarm, smoke detector, carbon monoxide detector';
  } else if (name.includes('electrical') || name.includes('eicr')) {
    specificPrompt = 'Electrical safety certificate, wiring inspection, electrical compliance';
  } else {
    specificPrompt = 'UK property and landlord theme, professional legal illustration';
  }

  return `${specificPrompt}, ${subject}, ${baseStyle}`;
}

/**
 * Generate image using Stability AI API (v1 endpoint)
 */
async function generateImage(placeholder) {
  const prompt = generatePrompt(placeholder);
  const outputPath = path.join(OUTPUT_DIR, `${placeholder.name}.png`);

  console.log(`\n📝 Generating: ${placeholder.name}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  if (isDryRun) {
    console.log(`   [DRY RUN] Would save to: ${outputPath}`);
    return { success: true, path: outputPath, dryRun: true };
  }

  try {
    // Determine dimensions based on image type
    const width = placeholder.isHero ? 1216 : 1024;
    const height = placeholder.isHero ? 704 : 704; // 16:9 or 3:2 aspect ratios

    const requestBody = {
      text_prompts: [
        {
          text: prompt,
          weight: 1.0
        },
        {
          text: 'blurry, distorted, ugly, bad anatomy, low quality, text, words, watermark, signature',
          weight: -1.0
        }
      ],
      cfg_scale: 7,
      height: height,
      width: width,
      samples: 1,
      steps: 30,
      style_preset: 'digital-art'
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();

    if (!responseData.artifacts || responseData.artifacts.length === 0) {
      throw new Error('No image returned from API');
    }

    // Decode base64 image and save
    const imageData = responseData.artifacts[0].base64;
    const imageBuffer = Buffer.from(imageData, 'base64');
    await fs.writeFile(outputPath, imageBuffer);

    console.log(`   ✅ Saved: ${outputPath}`);
    return { success: true, path: outputPath };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Update posts.tsx to use new image paths
 */
async function updatePostsFile(generatedImages) {
  let content = await fs.readFile(POSTS_FILE, 'utf-8');
  let updateCount = 0;

  for (const img of generatedImages) {
    if (!img.success || img.dryRun) continue;

    const oldPath = `/images/blog/placeholder-${img.name}.svg`;
    const newPath = `/images/blog/${img.name}.png`;

    const newContent = content.replace(new RegExp(escapeRegex(oldPath), 'g'), newPath);
    if (newContent !== content) {
      updateCount++;
      content = newContent;
    }
  }

  if (updateCount > 0 && !isDryRun) {
    await fs.writeFile(POSTS_FILE, content);
    console.log(`\n📄 Updated ${updateCount} image references in posts.tsx`);
  }

  return updateCount;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Blog Image Generator - Stability AI');
  console.log('=====================================');
  console.log(`Brand color: ${BRAND_PURPLE}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  if (isDryRun) console.log('🔍 DRY RUN MODE - No images will be generated\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Extract placeholders
  console.log('\n📋 Extracting placeholders from posts.tsx...');
  let placeholders = await extractPlaceholders();
  console.log(`   Found ${placeholders.length} unique placeholders`);

  // Filter if single image requested
  if (singleImage) {
    placeholders = placeholders.filter(p => p.name.includes(singleImage));
    if (placeholders.length === 0) {
      console.error(`❌ No placeholder found matching: ${singleImage}`);
      process.exit(1);
    }
    console.log(`   Filtered to ${placeholders.length} matching placeholders`);
  }

  // Skip if requested
  if (skipCount > 0) {
    placeholders = placeholders.slice(skipCount);
    console.log(`   Skipped first ${skipCount}, ${placeholders.length} remaining`);
  }

  // Check for existing images
  const existingImages = new Set();
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    files.forEach(f => {
      if (f.endsWith('.png')) {
        existingImages.add(f.replace('.png', ''));
      }
    });
    console.log(`   Found ${existingImages.size} existing images`);
  } catch (e) {
    // Directory doesn't exist yet
  }

  // Filter out already generated images
  const toGenerate = placeholders.filter(p => !existingImages.has(p.name));
  console.log(`   ${toGenerate.length} images to generate`);

  if (toGenerate.length === 0) {
    console.log('\n✅ All images already generated!');
    return;
  }

  // Generate images in batches
  const results = [];
  const totalBatches = Math.ceil(toGenerate.length / batchSize);

  console.log(`\n🚀 Generating ${toGenerate.length} images in ${totalBatches} batches of ${batchSize}...`);

  for (let i = 0; i < toGenerate.length; i += batchSize) {
    const batch = toGenerate.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} images)`);

    // Generate batch sequentially to respect rate limits
    for (const placeholder of batch) {
      const result = await generateImage(placeholder);
      results.push({ ...result, name: placeholder.name });

      // Rate limiting - wait 2 seconds between API calls
      if (!isDryRun && batch.indexOf(placeholder) < batch.length - 1) {
        await sleep(2000);
      }
    }

    // Wait between batches
    if (!isDryRun && i + batchSize < toGenerate.length) {
      console.log('   ⏳ Waiting 5 seconds before next batch...');
      await sleep(5000);
    }
  }

  // Summary
  const successful = results.filter(r => r.success && !r.dryRun);
  const failed = results.filter(r => !r.success);

  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Total processed: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed images:');
    failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }

  // Update posts.tsx
  if (successful.length > 0) {
    await updatePostsFile(results);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
