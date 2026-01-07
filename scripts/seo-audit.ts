import { SITE_ORIGIN, getCanonicalUrl } from '../src/lib/seo/urls';

function normalizeRobotsContent(content: string) {
  return content.toLowerCase().replace(/\s+/g, '');
}

function extractTagContent(html: string, tagName: string, attrName: string, attrValue: string, contentAttr: string) {
  const regex = new RegExp(`<${tagName}[^>]*${attrName}=["']${attrValue}["'][^>]*>`, 'i');
  const match = html.match(regex);
  if (!match) return null;
  const tag = match[0];
  const contentRegex = new RegExp(`${contentAttr}=["']([^"']+)["']`, 'i');
  const contentMatch = tag.match(contentRegex);
  return contentMatch?.[1] ?? null;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SEO-Audit/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function run() {
  const input = process.argv[2] || process.env.SEO_AUDIT_URL;
  if (!input) {
    throw new Error('Provide a blog URL or slug, e.g. `npx tsx scripts/seo-audit.ts england-assured-shorthold-tenancy-guide`');
  }

  const baseUrl = process.env.SEO_AUDIT_BASE_URL || SITE_ORIGIN;
  const resolvedUrl = input.startsWith('http')
    ? input
    : new URL(input.startsWith('/') ? input : `/blog/${input}`, baseUrl).toString();

  const html = await fetchText(resolvedUrl);
  const { pathname } = new URL(resolvedUrl);
  const expectedCanonical = getCanonicalUrl(pathname);

  const canonical = extractTagContent(html, 'link', 'rel', 'canonical', 'href');
  if (!canonical) {
    throw new Error('Missing canonical link tag');
  }
  if (canonical !== expectedCanonical) {
    throw new Error(`Canonical mismatch. Expected ${expectedCanonical} but found ${canonical}`);
  }

  const ogUrl = extractTagContent(html, 'meta', 'property', 'og:url', 'content');
  if (!ogUrl) {
    throw new Error('Missing og:url meta tag');
  }
  if (ogUrl !== expectedCanonical) {
    throw new Error(`og:url mismatch. Expected ${expectedCanonical} but found ${ogUrl}`);
  }

  const robots = extractTagContent(html, 'meta', 'name', 'robots', 'content');
  if (!robots) {
    throw new Error('Missing robots meta tag');
  }
  const normalizedRobots = normalizeRobotsContent(robots);
  if (!normalizedRobots.includes('index') || !normalizedRobots.includes('follow')) {
    throw new Error(`Robots meta should include index,follow. Found: ${robots}`);
  }
  if (normalizedRobots.includes('noindex') || normalizedRobots.includes('nofollow')) {
    throw new Error(`Robots meta should not include noindex/nofollow. Found: ${robots}`);
  }

  const robotsUrl = new URL('/robots.txt', baseUrl).toString();
  const robotsTxt = await fetchText(robotsUrl);
  if (!robotsTxt.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
    throw new Error('robots.txt is missing the sitemap directive for the production origin');
  }
  const disallowBlog = robotsTxt
    .split('\n')
    .some((line) => line.toLowerCase().startsWith('disallow:') && line.includes('/blog'));
  if (disallowBlog) {
    throw new Error('robots.txt must not disallow /blog');
  }
  if (!robotsTxt.includes('Allow: /blog/')) {
    throw new Error('robots.txt should allow /blog/');
  }
  if (!robotsTxt.includes('Allow: /_next/')) {
    throw new Error('robots.txt should allow /_next/');
  }

  console.log(`SEO audit passed for ${resolvedUrl}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
