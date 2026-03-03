import postsModule from '../src/lib/blog/posts.tsx';
import ctaMapModule from '../src/lib/blog/product-cta-map.ts';

const { blogPosts } = postsModule;
const { getBlogProductCta } = ctaMapModule;

const totals = {
  '/products/notice-only': 0,
  '/products/complete-pack': 0,
  '/products/money-claim': 0,
  '/products/ast': 0,
};

const defaultSlugs = [];

for (const post of blogPosts) {
  const cta = getBlogProductCta(post);
  totals[cta.primaryProductHref] = (totals[cta.primaryProductHref] ?? 0) + 1;
  if (cta.usedDefault) defaultSlugs.push(post.slug);
}

const totalPosts = blogPosts.length;

console.log(`total posts: ${totalPosts}`);
console.log('product mapping distribution:');
for (const [href, count] of Object.entries(totals)) {
  const pct = totalPosts === 0 ? 0 : ((count / totalPosts) * 100).toFixed(1);
  console.log(`  ${href}: ${count} (${pct}%)`);
}

console.log(`default mapping slugs (${defaultSlugs.length}):`);
defaultSlugs.forEach((slug) => console.log(`  - ${slug}`));
