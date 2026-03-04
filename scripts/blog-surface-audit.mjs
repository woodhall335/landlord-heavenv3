import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');

const stickyMounts = (articleSource.match(/<BlogStickySlots/g) || []).length;
const hasToc = articleSource.includes('<TableOfContents items={post.tableOfContents} />');
const hasDesktopStickySidebar =
  articleSource.includes('aria-label="Article navigation"') &&
  articleSource.includes('hidden min-w-0 lg:block lg:self-start') &&
  articleSource.includes('sticky top-[var(--lh-sticky-top)]');

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

const hasAskHeavenPanel = articleSource.includes('<AskHeavenWidget') && articleSource.includes("variant=\"compact\"");
const hasStickyCtaSlot =
  articleSource.includes('<BlogStickySlots cta={productCta} postSlug={slug} category={post.category} showDesktop showMobile={false} />');

const stickyContainerMatch = articleSource.match(/<div\s+[^>]*data-blog-sticky-inner[^>]*className="([^"]+)"/);
const stickyContainerClasses = stickyContainerMatch?.[1] || '';
const stickyContainerHasTopVar = stickyContainerClasses.includes('top-[var(--lh-sticky-top)]');
const stickyContainerHasStickyPosition = stickyContainerClasses.includes('sticky');
const stickyContainerHasMaxHeight = stickyContainerClasses.includes('max-h-[calc(100vh-var(--lh-sticky-top)-1rem)]');
const stickyContainerHasOverflowYAuto = stickyContainerClasses.includes('overflow-y-auto');

const ancestryTokens = [
  { label: 'article root', regex: /<article\s+className="([^"]*)"/ },
  { label: 'grid wrapper', regex: /<div className="([^"]*lg:grid-cols-\[minmax\(0,760px\)_300px\][^"]*)">/ },
  { label: 'sidebar aside', regex: /<aside className="([^"]*)" aria-label="Article navigation"/ },
  { label: 'sticky inner', regex: /<div\s+[^>]*data-blog-sticky-inner[^>]*className="([^"]*)"/ },
];

const stickyBreakerPatterns = [
  { token: 'overflow-hidden', regex: /\boverflow-hidden\b/ },
  { token: 'overflow-clip', regex: /\boverflow-clip\b/ },
  { token: 'overflow-auto', regex: /\boverflow-auto\b/ },
  { token: 'overflow-scroll', regex: /\boverflow-scroll\b/ },
  { token: 'overflow-x-hidden', regex: /\boverflow-x-hidden\b/ },
  { token: 'overflow-x-clip', regex: /\boverflow-x-clip\b/ },
  { token: 'overflow-x-auto', regex: /\boverflow-x-auto\b/ },
  { token: 'overflow-x-scroll', regex: /\boverflow-x-scroll\b/ },
  { token: 'overflow-y-hidden', regex: /\boverflow-y-hidden\b/ },
  { token: 'overflow-y-clip', regex: /\boverflow-y-clip\b/ },
  { token: 'overflow-y-auto', regex: /\boverflow-y-auto\b/ },
  { token: 'overflow-y-scroll', regex: /\boverflow-y-scroll\b/ },
  { token: 'transform', regex: /\btransform\b/ },
  { token: 'will-change-transform', regex: /\bwill-change-transform\b/ },
  { token: 'filter', regex: /\bfilter\b/ },
  { token: 'backdrop-filter', regex: /\bbackdrop-filter\b/ },
  { token: 'perspective', regex: /\bperspective\b/ },
  { token: 'contain-layout', regex: /\bcontain-layout\b/ },
  { token: 'contain-paint', regex: /\bcontain-paint\b/ },
  { token: 'contain-content', regex: /\bcontain-content\b/ },
  { token: 'contain-strict', regex: /\bcontain-strict\b/ },
];

const allowedStickyInnerBreakers = new Set(['overflow-y-auto']);

const stickyOffenders = [];
for (const target of ancestryTokens) {
  const classMatch = articleSource.match(target.regex);
  const classValue = classMatch?.[1] || '';

  for (const breaker of stickyBreakerPatterns) {
    if (breaker.regex.test(classValue)) {
      if (target.label === 'sticky inner' && allowedStickyInnerBreakers.has(breaker.token)) {
        continue;
      }
      stickyOffenders.push({
        file: articlePath,
        target: target.label,
        token: breaker.token,
        classValue,
      });
    }
  }
}

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
  hasToc,
  hasStickyCtaSlot,
  hasAskHeavenPanel,
  stickyContainerClasses,
  stickyContainerHasTopVar,
  stickyContainerHasStickyPosition,
  stickyContainerHasMaxHeight,
  stickyContainerHasOverflowYAuto,
  stickyOffenders,
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

if (stickyOffenders.length > 0) {
  console.error('[blog-audit:sticky-offenders] Found sticky-breaking class tokens in sidebar ancestry:');
  for (const offender of stickyOffenders) {
    console.error(`- ${offender.file} :: ${offender.target} :: ${offender.token}`);
    console.error(`  className="${offender.classValue}"`);
  }
}

if (!calloutExists || !calloutReferenced) {
  console.warn('[blog-audit:warn] BlogCallout missing or not referenced in article template.');
}

if (
  !report.stickyPass ||
  !hasDesktopStickySidebar ||
  !articleHasStickyCssVar ||
  !hasBlogProseWrapper ||
  !hasFullBleedHeroWrapper ||
  !hasToc ||
  !hasStickyCtaSlot ||
  !hasAskHeavenPanel ||
  !stickyContainerHasTopVar ||
  !stickyContainerHasStickyPosition ||
  !stickyContainerHasMaxHeight ||
  !stickyContainerHasOverflowYAuto ||
  stickyOffenders.length > 0 ||
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
