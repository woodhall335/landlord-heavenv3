#!/usr/bin/env node
/**
 * IndexNow Submission Script
 *
 * Automatically submits sitemap to IndexNow after deployment.
 * Runs as part of the build process on Vercel.
 */

const SITE_URL = 'https://landlordheaven.co.uk';
const INDEXNOW_KEY = 'd200bfc932ff84eeae049307cf2bb87f';

async function submitToIndexNow() {
  console.log('📤 Submitting sitemap to IndexNow...');

  try {
    // Fetch sitemap
    const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`);
    const sitemapXml = await sitemapResponse.text();

    // Extract URLs
    const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) {
      console.log('❌ No URLs found in sitemap');
      return;
    }

    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    console.log(`📋 Found ${urls.length} URLs in sitemap`);

    // Submit to IndexNow endpoints
    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            host: 'landlordheaven.co.uk',
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
            urlList: urls,
          }),
        });

        if (response.ok || response.status === 202) {
          console.log(`✅ ${endpoint} - Success (${response.status})`);
        } else {
          console.log(`⚠️ ${endpoint} - Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }

    console.log('✨ IndexNow submission complete!');
  } catch (error) {
    console.error('❌ IndexNow submission failed:', error.message);
    // Don't fail the build if IndexNow fails
    process.exit(0);
  }
}

submitToIndexNow();
