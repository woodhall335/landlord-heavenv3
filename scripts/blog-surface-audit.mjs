import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');

const stickyMounts = (articleSource.match(/<BlogStickySlots/g) || []).length;
const hasToc = articleSource.includes('<TableOfContents items={post.tableOfContents} />');
const hasDesktopStickySidebar =
  articleSource.includes('aria-label="Article navigation"') &&
  articleSource.includes('hidden min-w-0 lg:block lg:self-start') &&
  articleSource.includes('sticky top-[var(--lh-sticky-top)] space-y-6');
const blogProsePath = 'src/components/blog/BlogProse.tsx';
const blogProseSource = fs.existsSync(blogProsePath) ? fs.readFileSync(blogProsePath, 'utf8') : '';
const hasOverflowHardening =
  blogProseSource.includes('overflow-x-clip [overflow-wrap:anywhere]') &&
  blogProseSource.includes('prose-a:break-words') &&
  blogProseSource.includes('prose-pre:overflow-x-auto') &&
  blogProseSource.includes('[&_table]:overflow-x-auto');
const articleHasStickyCssVar = articleSource.includes("'--lh-sticky-top'") || articleSource.includes('"--lh-sticky-top"');
const hasBlogProseWrapper = articleSource.includes('<BlogProse>') && articleSource.includes("from '@/components/blog/BlogProse'");

const stickyGridMatch = articleSource.match(/<div className="([^"]*lg:grid-cols-\[minmax\(0,760px\)_300px\][^"]*)">/);
const stickyGridClasses = stickyGridMatch?.[1] || '';
const stickyGridHasBreakingOverflow = /(overflow-hidden|overflow-x-hidden|overflow-x-clip|overflow-auto|overflow-scroll)/.test(stickyGridClasses);

const relatedPath = 'src/components/blog/RelatedGuidesCarousel.tsx';
const relatedSource = fs.readFileSync(relatedPath, 'utf8');
const hasRelatedTracking = relatedSource.includes("trackEvent('click_related_post'");
const relatedUsesBlogCard = relatedSource.includes('<BlogCard');

const articleUsesManifestThumbs =
  articleSource.includes('heroImage: getBlogImagesForPostThumb({') && articleSource.includes('const relatedGuides = getRelatedGuides(post);');

const indexPath = 'src/app/(marketing)/blog/page.tsx';
const indexSource = fs.readFileSync(indexPath, 'utf8');
const hasSaasPanel = indexSource.includes('Court-ready landlord guidance with product-led next steps');

const categoryPath = 'src/components/blog/CategoryPage.tsx';
const categorySource = fs.readFileSync(categoryPath, 'utf8');
const hasCompactCategoryHeroSpacing =
  categorySource.includes('pt-6 pb-10 md:pt-8 md:pb-12') &&
  categorySource.includes('mb-5 flex items-center gap-2 text-sm text-gray-500') &&
  categorySource.includes('mb-4 text-4xl font-bold text-gray-900 lg:text-5xl');

const calloutPath = 'src/components/blog/BlogCallout.tsx';
const calloutExists = fs.existsSync(calloutPath);
const calloutReferenced = articleSource.includes('LegalDisclaimer') || articleSource.includes('BlogCallout');

const blogComponentFiles = ['BlogCard.tsx', 'RelatedGuidesCarousel.tsx', 'BlogFilteredList.tsx'];
const svgRefs = [];
for (const file of blogComponentFiles) {
  const source = fs.readFileSync(`src/components/blog/${file}`, 'utf8');
  if (/\.svg['"]/i.test(source)) {
    svgRefs.push(file);
  }
}

const report = {
  stickyMounts,
  stickyPass: stickyMounts === 2,
  hasDesktopStickySidebar,
  articleHasStickyCssVar,
  hasBlogProseWrapper,
  stickyGridClasses,
  stickyGridHasBreakingOverflow,
  hasToc,
  hasOverflowHardening,
  hasRelatedTracking,
  relatedUsesBlogCard,
  articleUsesManifestThumbs,
  hasSaasPanel,
  hasCompactCategoryHeroSpacing,
  calloutExists,
  calloutReferenced,
  svgRefs,
};

console.log('[blog-audit]', JSON.stringify(report, null, 2));

if (!calloutExists || !calloutReferenced) {
  console.warn('[blog-audit:warn] BlogCallout missing or not referenced in article template.');
}

if (
  !report.stickyPass ||
  !hasDesktopStickySidebar ||
  !articleHasStickyCssVar ||
  !hasBlogProseWrapper ||
  stickyGridHasBreakingOverflow ||
  !hasToc ||
  !hasOverflowHardening ||
  !hasRelatedTracking ||
  !relatedUsesBlogCard ||
  !articleUsesManifestThumbs ||
  !hasSaasPanel ||
  !hasCompactCategoryHeroSpacing ||
  svgRefs.length > 0
) {
  process.exitCode = 1;
}
