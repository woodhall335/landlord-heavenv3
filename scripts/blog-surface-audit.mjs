import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');
const tocPath = 'src/components/blog/TableOfContents.tsx';
const tocSource = fs.readFileSync(tocPath, 'utf8');
const stickySlotsPath = 'src/components/blog/BlogStickySlots.tsx';
const stickySlotsSource = fs.readFileSync(stickySlotsPath, 'utf8');
const askHeavenPath = 'src/components/blog/BlogAskHeavenPanel.tsx';
const askHeavenSource = fs.readFileSync(askHeavenPath, 'utf8');

const stickyMounts = (articleSource.match(/<BlogStickySlots/g) || []).length;
const hasToc = articleSource.includes('<TableOfContents items={post.tableOfContents} />');
const hasDesktopStickySidebar =
  articleSource.includes('aria-label="Article navigation"') &&
  articleSource.includes('hidden min-w-0 lg:sticky lg:top-[var(--lh-sticky-top)] lg:block lg:self-start');

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

const stickyInnerTag = articleSource.match(/<(?:aside|div)\s+[^>]*data-blog-sticky-inner[^>]*>/);
const stickyContainerClasses = stickyInnerTag?.[0].match(/className="([^"]+)"/)?.[1] || '';
const stickyContainerHasTopVar = stickyContainerClasses.includes('top-[var(--lh-sticky-top)]');
const stickyContainerHasStickyPosition = stickyContainerClasses.includes('sticky');
const stickyContainerHasMaxHeight = stickyContainerClasses.includes('max-h-[calc(100vh-var(--lh-sticky-top)-1rem)]');
const stickyContainerHasOverflowYAuto = stickyContainerClasses.includes('overflow-y-auto');
const stickyContainerHasNoInnerScroll = !stickyContainerHasMaxHeight && !stickyContainerHasOverflowYAuto;

const tocPanelTag = tocSource.match(/<ul\s+[^>]*data-blog-toc-panel[^>]*>/);
const tocPanelClasses = tocPanelTag?.[0].match(/className={`([^`]+)`}/)?.[1] || tocPanelTag?.[0].match(/className="([^"]+)"/)?.[1] || '';
const tocPanelHasMaxHeightCalc = /\bmax-h-\[calc\(100vh-[^\]]+\)\]/.test(tocPanelClasses);
const tocPanelHasOverflowYAuto = /\boverflow-y-auto\b/.test(tocPanelClasses);

const guardImportPresent = articleSource.includes("from '@/components/blog/BlogArticleStickyGuard'");
const guardUsagePresent = articleSource.includes('<BlogArticleStickyGuard />');

const sidebarMatch = articleSource.match(/<aside\s+[^>]*aria-label="Article navigation"[^>]*>[\s\S]*?<\/aside>/);
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
  { label: 'sticky inner', regex: /<(?:aside|div)\s+[^>]*data-blog-sticky-inner[^>]*>/ },
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

const stickyOffenders = [];
const innerScrollOffenders = [];
const forbiddenSidebarTokenOffenders = [];

const sidebarFilesToAudit = [
  { path: articlePath, source: articleSource, section: 'article template' },
  { path: tocPath, source: tocSource, section: 'table of contents' },
  { path: stickySlotsPath, source: stickySlotsSource, section: 'sticky cta slot' },
  { path: askHeavenPath, source: askHeavenSource, section: 'ask heaven panel' },
];

const forbiddenSidebarTokens = [
  { token: 'overflow-y-auto', regex: /overflow-y-auto/g },
  { token: 'overflow-y-scroll', regex: /overflow-y-scroll/g },
  { token: 'max-h-[calc(100vh-', regex: /max-h-\[calc\(100vh-/g },
  { token: 'max-h-screen', regex: /(?<![\w-])max-h-screen(?![\w-])/g },
  { token: 'h-screen', regex: /(?<![\w-])h-screen(?![\w-])/g },
];

function getLineNumber(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source[i] === '\n') line += 1;
  }
  return line;
}

for (const file of sidebarFilesToAudit) {
  for (const pattern of forbiddenSidebarTokens) {
    const matches = file.source.matchAll(pattern.regex);
    for (const match of matches) {
      const index = match.index ?? 0;
      const line = getLineNumber(file.source, index);
      forbiddenSidebarTokenOffenders.push({
        file: file.path,
        section: file.section,
        token: pattern.token,
        line,
      });
    }
  }
}

const innerScrollPatterns = [
  { token: 'overflow-y-auto', regex: /\boverflow-y-auto\b/ },
  { token: 'max-h-[calc(100vh-...)]', regex: /\bmax-h-\[calc\(100vh-[^\]]+\)\]/ },
];

for (const pattern of innerScrollPatterns) {
  if (pattern.regex.test(stickyContainerClasses)) {
    innerScrollOffenders.push({ target: 'sticky inner container', token: pattern.token, classValue: stickyContainerClasses });
  }
  if (pattern.regex.test(tocPanelClasses)) {
    innerScrollOffenders.push({ target: 'toc panel', token: pattern.token, classValue: tocPanelClasses });
  }
}

for (const target of ancestryTokens) {
  const classMatch = articleSource.match(target.regex);
  const classValue = target.label === 'sticky inner' ? stickyContainerClasses : classMatch?.[1] || '';
  const line = classMatch?.index ? getLineNumber(articleSource, classMatch.index) : null;

  for (const breaker of stickyBreakerPatterns) {
    if (breaker.regex.test(classValue)) {
      stickyOffenders.push({
        file: articlePath,
        section: target.label,
        token: breaker.token,
        classValue,
        line,
      });
    }
  }
}

const relatedPath = 'src/components/blog/RelatedGuidesCarousel.tsx';
const relatedSource = fs.readFileSync(relatedPath, 'utf8');
const hasRelatedTracking = relatedSource.includes("trackEvent('click_related_post'");
const relatedUsesBlogCard = relatedSource.includes('<BlogCard') || relatedSource.includes('<BlogCardCompact');

const hasTocStickyAndHeadingOffsets =
  articleSource.includes('top-[var(--lh-sticky-top)]') &&
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
  stickyContainerHasNoInnerScroll,
  tocPanelClasses,
  tocPanelHasMaxHeightCalc,
  tocPanelHasOverflowYAuto,
  innerScrollOffenders,
  guardImportPresent,
  guardUsagePresent,
  hasSidebarOrderExactOnce,
  hasTocAccordionAria,
  stickyOffenders,
  hasOverflowHardening,
  hasRelatedTracking,
  relatedUsesBlogCard,
  hasTocStickyAndHeadingOffsets,
  forbiddenSidebarTokenOffenders,
};

console.log('[blog-audit]', JSON.stringify(report, null, 2));


if (innerScrollOffenders.length > 0) {
  const offenderTokens = [...new Set(innerScrollOffenders.map((offender) => offender.token))];
  console.error(`[blog-audit:inner-scroll-offenders] Found forbidden inner-scroll class tokens: ${offenderTokens.join(', ')}`);
  for (const offender of innerScrollOffenders) {
    console.error(`- ${offender.target} :: ${offender.token}`);
    console.error(`  className="${offender.classValue}"`);
  }
}

if (forbiddenSidebarTokenOffenders.length > 0) {
  const offenderTokens = [...new Set(forbiddenSidebarTokenOffenders.map((offender) => offender.token))];
  console.error(
    `[blog-audit:forbidden-sidebar-scroll] Found forbidden sidebar token(s): ${offenderTokens.join(', ')}`,
  );
  for (const offender of forbiddenSidebarTokenOffenders) {
    console.error(`- ${offender.file}:${offender.line} (${offender.section}) -> ${offender.token}`);
  }
}

if (stickyOffenders.length > 0) {
  const offenderTokens = [...new Set(stickyOffenders.map((offender) => offender.token))];
  console.error(`[blog-audit:sticky-offenders] Found sticky-breaking class tokens in sidebar ancestry: ${offenderTokens.join(', ')}`);
  for (const offender of stickyOffenders) {
    const lineSuffix = offender.line ? `:${offender.line}` : '';
    console.error(`- ${offender.file}${lineSuffix} (${offender.section}) -> ${offender.token}`);
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
  !stickyContainerHasNoInnerScroll ||
  tocPanelHasMaxHeightCalc ||
  tocPanelHasOverflowYAuto ||
  innerScrollOffenders.length > 0 ||
  forbiddenSidebarTokenOffenders.length > 0 ||
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
