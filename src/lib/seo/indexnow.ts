/**
 * IndexNow Integration
 *
 * Instantly notify search engines (Bing, Yandex, Seznam, Naver) when content changes.
 * https://www.indexnow.org
 *
 * Usage:
 * - Call submitToIndexNow() when pages are created/updated
 * - Supports single URL or batch submissions (up to 10,000 URLs)
 */

const INDEXNOW_KEY = 'd200bfc932ff84eeae049307cf2bb87f';
const SITE_HOST = 'landlordheaven.co.uk';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

// IndexNow endpoints (all share the same protocol)
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  // 'https://yandex.com/indexnow', // Uncomment if targeting Russian market
];

interface IndexNowResponse {
  success: boolean;
  endpoint: string;
  status?: number;
  error?: string;
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse[]> {
  return submitUrlsToIndexNow([url]);
}

/**
 * Submit multiple URLs to IndexNow (batch submission)
 * Max 10,000 URLs per request
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<IndexNowResponse[]> {
  if (urls.length === 0) {
    return [];
  }

  // Ensure all URLs are absolute
  const absoluteUrls = urls.map(url => {
    if (url.startsWith('http')) return url;
    return `https://${SITE_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  const results: IndexNowResponse[] = [];

  // Submit to each endpoint
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_KEY,
          keyLocation: KEY_LOCATION,
          urlList: absoluteUrls,
        }),
      });

      results.push({
        success: response.ok || response.status === 202,
        endpoint,
        status: response.status,
      });
    } catch (error) {
      results.push({
        success: false,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Submit all sitemap URLs to IndexNow
 * Useful for initial setup or after major content updates
 */
export async function submitSitemapToIndexNow(): Promise<IndexNowResponse[]> {
  try {
    // Fetch and parse sitemap
    const sitemapUrl = `https://${SITE_HOST}/sitemap.xml`;
    const response = await fetch(sitemapUrl);
    const xml = await response.text();

    // Extract URLs from sitemap (simple regex extraction)
    const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) {
      return [{ success: false, endpoint: 'sitemap', error: 'No URLs found in sitemap' }];
    }

    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));

    // Submit in batches of 1000
    const batchSize = 1000;
    const allResults: IndexNowResponse[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const results = await submitUrlsToIndexNow(batch);
      allResults.push(...results);
    }

    return allResults;
  } catch (error) {
    return [{
      success: false,
      endpoint: 'sitemap',
      error: error instanceof Error ? error.message : 'Failed to fetch sitemap',
    }];
  }
}

/**
 * Get common page URLs for quick submission
 */
export function getKeyPageUrls(): string[] {
  return [
    'https://landlordheaven.co.uk/',
    'https://landlordheaven.co.uk/pricing',
    'https://landlordheaven.co.uk/products/notice-only',
    'https://landlordheaven.co.uk/products/complete-pack',
    'https://landlordheaven.co.uk/products/money-claim',
    'https://landlordheaven.co.uk/products/ast',
    'https://landlordheaven.co.uk/blog',
    'https://landlordheaven.co.uk/tools',
    'https://landlordheaven.co.uk/section-21-notice-template',
    'https://landlordheaven.co.uk/eviction-notice-template',
  ];
}
