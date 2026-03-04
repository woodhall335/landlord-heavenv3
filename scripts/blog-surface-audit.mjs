import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');
const tocPath = 'src/components/blog/TableOfContents.tsx';
const tocSource = fs.readFileSync(tocPath, 'utf8');

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

const stickyInnerLine = articleSource.match(/<div\s+[^>]*data-blog-sticky-inner[^>]*className="([^"]+)"/);
const stickyContainerClasses = stickyInnerLine?.[1] || '';
const stickyContainerHasTopVar = stickyContainerClasses.includes('top-[var(--lh-sticky-top)]');
const stickyContainerHasStickyPosition = stickyContainerClasses.includes('sticky');
const stickyContainerHasMaxHeight = stickyContainerClasses.includes('max-h-[calc(100vh-var(--lh-sticky-top)-1rem)]');
const stickyContainerHasOverflowYAuto = stickyContainerClasses.includes('overflow-y-auto');

const guardImportPresent = articleSource.includes("from '@/components/blog/BlogArticleStickyGuard'");
const guardUsagePresent = articleSource.includes('<BlogArticleStickyGuard />');

const sidebarMatch = articleSource.match(/<aside className="hidden min-w-0 lg:block lg:self-start"[\s\S]*?<\/aside>/);
const sidebarSource = sidebarMatch?.[0] || '';
const tocSidebarCount = (sidebarSource.match(/<TableOfContents items=\{post\.tableOfContents\} \/>/g) || []).length;
const ctaSidebarCount = (sidebarSource.match(/<BlogStickySlots/g) || []).length;
const askSidebarCount = (sidebarSource.match(/<BlogAskHeavenPanel/g) || []).length;
const sidebarOrderTokens = [
  sidebarSource.indexOf('<TableOfContents items={post.tableOfContents} />'),
  sidebarSource.indexOf('<BlogStickySlots'),
  sidebarSource.indexOf('<BlogAskHeavenPanel'),
];
const hasSidebarOrderExactOnce = tocSidebarCount === 1 && ctaSidebarCount === 1 && askSidebarCount === 1 && sidebarOrderTokens.every((i) => i >= 0) && sidebarOrderTokens[0] < sidebarOrderTokens[1] && sidebarOrderTokens[1] < sidebarOrderTokens[2];

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
  { token: 'will-change', regex: /\bwill-change\b/ },
  { token: 'filter', regex: /\bfilter\b/ },
  { token: 'backdrop-filter', regex: /\bbackdrop-filter\b/ },
  { token: 'perspective', regex: /\bperspective\b/ },
  { token: 'contain', regex: /\bcontain(?:-|\b)/ },
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

const hasTocStickyAndHeadingOffsets =
  articleSource.includes('sticky top-[var(--lh-sticky-top)]') &&
  blogProseSource.includes('prose-headings:scroll-mt-[var(--lh-sticky-top)]');

const hasTocAccordionAria =
  tocSource.includes('aria-expanded={isOpen}') &&
  tocSource.includes('aria-controls={panelId}') &&
  tocSource.includes('id={panelId}');

const report = {
  stickyMounts,
  stickyPass: stickyMounts === 2,
  hasDesktopStickySidebar,
  articleHasStickyCssVar,
  hasBlogProseWrapper,
  hasFullBleedHeroWrapper,
  hasToc,
  stickyContainerClasses,
  stickyContainerHasTopVar,
  stickyContainerHasStickyPosition,
  stickyContainerHasMaxHeight,
  stickyContainerHasOverflowYAuto,
  guardImportPresent,
  guardUsagePresent,
  hasSidebarOrderExactOnce,
  hasTocAccordionAria,
  stickyOffenders,
  hasOverflowHardening,
  hasRelatedTracking,
  relatedUsesBlogCard,
  hasTocStickyAndHeadingOffsets,
};

console.log('[blog-audit]', JSON.stringify(report, null, 2));

if (stickyOffenders.length > 0) {
  console.error('[blog-audit:sticky-offenders] Found sticky-breaking class tokens in sidebar ancestry:');
  for (const offender of stickyOffenders) {
    console.error(`- ${offender.file} :: ${offender.target} :: ${offender.token}`);
    console.error(`  className="${offender.classValue}"`);
  }
}

if (
  !report.stickyPass ||
  !hasDesktopStickySidebar ||
  !articleHasStickyCssVar ||
  !hasBlogProseWrapper ||
  !hasFullBleedHeroWrapper ||
  !hasToc ||
  !stickyContainerHasTopVar ||
  !stickyContainerHasStickyPosition ||
  !stickyContainerHasMaxHeight ||
  !stickyContainerHasOverflowYAuto ||
  !guardImportPresent ||
  !guardUsagePresent ||
  !hasSidebarOrderExactOnce ||
  !hasTocAccordionAria ||
  stickyOffenders.length > 0 ||
  !hasOverflowHardening ||
  !hasRelatedTracking ||
  !relatedUsesBlogCard ||
  !hasTocStickyAndHeadingOffsets
) {
  process.exitCode = 1;
}
