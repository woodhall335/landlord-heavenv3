import { blogPosts } from '../src/lib/blog/posts';
import { SITE_ORIGIN } from '../src/lib/seo/urls';

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Sitemap-Audit/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function extractLocs(xml: string) {
  const locs: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1]);
  }
  return locs;
}

async function run() {
  const baseUrl = process.env.SEO_AUDIT_BASE_URL || SITE_ORIGIN;
  const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);

  const nonAbsolute = locs.filter((loc) => !loc.startsWith(SITE_ORIGIN));
  if (nonAbsolute.length > 0) {
    throw new Error(`Sitemap contains non-canonical locs: ${nonAbsolute.slice(0, 5).join(', ')}`);
  }

  const locSet = new Set(locs);
  const missingBlog = blogPosts
    .map((post) => `${SITE_ORIGIN}/blog/${post.slug}`)
    .filter((loc) => !locSet.has(loc));

  if (missingBlog.length > 0) {
    throw new Error(`Missing blog URLs in sitemap: ${missingBlog.slice(0, 5).join(', ')}`);
  }

  const astGuide = `${SITE_ORIGIN}/blog/england-assured-shorthold-tenancy-guide`;
  if (!locSet.has(astGuide)) {
    throw new Error('AST guide URL is missing from sitemap');
  }

  console.log(`Sitemap audit passed for ${sitemapUrl}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
