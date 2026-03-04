import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');

const stickyMounts = (articleSource.match(/<BlogStickySlots/g) || []).length;
const hasToc = articleSource.includes('<TableOfContents items={post.tableOfContents} />');
const hasDesktopStickySidebar =
  articleSource.includes('aria-label="Article navigation"') &&
  articleSource.includes('hidden min-w-0 lg:block lg:self-start') &&
  articleSource.includes('sticky top-[var(--lh-sticky-top)]');
const stickyBreakingPattern = /(overflow-hidden|overflow-x-hidden|overflow-x-clip|overflow-auto|overflow-scroll|overflow-y-auto|overflow-y-scroll|contain(?:-[^\s"]+)?|transform|filter|perspective)/;
const blogProsePath = 'src/components/blog/BlogProse.tsx';
const blogProseSource = fs.existsSync(blogProsePath) ? fs.readFileSync(blogProsePath, 'utf8') : '';
const hasOverflowHardening =
  blogProseSource.includes('overflow-x-clip [overflow-wrap:anywhere]') &&
  blogProseSource.includes('prose-a:break-words') &&
  blogProseSource.includes('prose-li:[overflow-wrap:anywhere]') &&
  blogProseSource.includes('prose-pre:overflow-x-auto') &&
  blogProseSource.includes('wrapScrollableContent') &&
  blogProseSource.includes('overflow-x-auto rounded-2xl border border-[#e7d9ff] bg-white/90');
const articleHasStickyCssVar = articleSource.includes("'--lh-sticky-top'") || articleSource.includes('"--lh-sticky-top"');
const hasBlogProseWrapper = articleSource.includes('<BlogProse>') && articleSource.includes("from '@/components/blog/BlogProse'");

const hasFullBleedHeroWrapper =
  articleSource.includes('blog-full-bleed-hero-wrapper') &&
  articleSource.includes('aspect-[16/9] w-full overflow-hidden rounded-3xl');

const stickyGridMatch = articleSource.match(/<div className="([^"]*lg:grid-cols-\[minmax\(0,760px\)_300px\][^"]*)">/);
const stickyGridClasses = stickyGridMatch?.[1] || '';
const stickyGridHasBreakingOverflow = stickyBreakingPattern.test(stickyGridClasses);

const articleMatch = articleSource.match(/<article\s+className="([^"]*)"/);
const articleClasses = articleMatch?.[1] || '';
const articleHasStickyBreakingClass = stickyBreakingPattern.test(articleClasses);

const stickyAsideMatch = articleSource.match(/<aside className="([^"]*)" aria-label="Article navigation">/);
const stickyAsideClasses = stickyAsideMatch?.[1] || '';
const stickyAsideHasBreakingClass = stickyBreakingPattern.test(stickyAsideClasses);

const stickyContainerMatch = articleSource.match(/<div className="([^"]*sticky top-\[var\(--lh-sticky-top\)\][^"]*)">/);
const stickyContainerClasses = stickyContainerMatch?.[1] || '';
const stickyContainerHasBreakingClass = stickyBreakingPattern.test(
  stickyContainerClasses.replace(/\bsticky\b/g, ''),
);

const relatedPath = 'src/components/blog/RelatedGuidesCarousel.tsx';
const relatedSource = fs.readFileSync(relatedPath, 'utf8');
const hasRelatedTracking = relatedSource.includes("trackEvent('click_related_post'");
const relatedUsesBlogCard = relatedSource.includes('<BlogCard') || relatedSource.includes('<BlogCardCompact');
const relatedHasOverflowGuards =
  relatedSource.includes('container mx-auto min-w-0 px-4') &&
  relatedSource.includes('relative min-w-0') &&
  relatedSource.includes('flex min-w-0 gap-4 overflow-x-auto') &&
  relatedSource.includes('min-w-0 w-[min(88vw,360px)] max-w-full');

const articleUsesManifestThumbs =
  articleSource.includes('heroImage: getBlogImagesForPostThumb({') && articleSource.includes('const relatedGuides = getRelatedGuides(post);');

const indexPath = 'src/app/(marketing)/blog/page.tsx';
const indexSource = fs.readFileSync(indexPath, 'utf8');
const hasUpdatedBlogTitle = indexSource.includes('Court Ready Landlord Guidance');

const categoryPath = 'src/components/blog/CategoryPage.tsx';
const categorySource = fs.readFileSync(categoryPath, 'utf8');
const hasCompactCategoryHeroSpacing =
  categorySource.includes('pt-6') &&
  categorySource.includes('md:pt-8') &&
  categorySource.includes('mb-5 flex items-center gap-2 text-sm') &&
  categorySource.includes('mb-4 text-4xl font-bold');

const hasWrappedTablesAndPre =
  blogProseSource.includes("if (typeof element.type === 'string' && element.type === 'table')") &&
  blogProseSource.includes("if (typeof element.type === 'string' && element.type === 'pre')");

const hasTocStickyAndHeadingOffsets =
  articleSource.includes('sticky top-[var(--lh-sticky-top)]') &&
  blogProseSource.includes('prose-headings:scroll-mt-[var(--lh-sticky-top)]');

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
  hasFullBleedHeroWrapper,
  stickyGridClasses,
  stickyGridHasBreakingOverflow,
  articleClasses,
  articleHasStickyBreakingClass,
  stickyAsideClasses,
  stickyAsideHasBreakingClass,
  stickyContainerClasses,
  stickyContainerHasBreakingClass,
  hasToc,
  hasOverflowHardening,
  hasRelatedTracking,
  relatedUsesBlogCard,
  relatedHasOverflowGuards,
  articleUsesManifestThumbs,
  hasUpdatedBlogTitle,
  hasCompactCategoryHeroSpacing,
  hasWrappedTablesAndPre,
  hasTocStickyAndHeadingOffsets,
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
  !hasFullBleedHeroWrapper ||
  stickyGridHasBreakingOverflow ||
  articleHasStickyBreakingClass ||
  stickyAsideHasBreakingClass ||
  stickyContainerHasBreakingClass ||
  !hasToc ||
  !hasOverflowHardening ||
  !hasRelatedTracking ||
  !relatedUsesBlogCard ||
  !relatedHasOverflowGuards ||
  !articleUsesManifestThumbs ||
  !hasUpdatedBlogTitle ||
  !hasCompactCategoryHeroSpacing ||
  !hasWrappedTablesAndPre ||
  !hasTocStickyAndHeadingOffsets ||
  svgRefs.length > 0
) {
  process.exitCode = 1;
}
