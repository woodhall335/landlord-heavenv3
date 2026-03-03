import fs from 'node:fs';

const articlePath = 'src/app/(marketing)/blog/[slug]/page.tsx';
const articleSource = fs.readFileSync(articlePath, 'utf8');

const stickyMounts = (articleSource.match(/<BlogStickySlots/g) || []).length;
const hasToc = articleSource.includes('<TableOfContents items={post.tableOfContents} />');
const hasOverflowHardening =
  articleSource.includes('overflow-x-hidden [overflow-wrap:anywhere]') &&
  articleSource.includes('prose-a:break-words') &&
  articleSource.includes('prose-pre:overflow-x-auto') &&
  articleSource.includes('[&_table]:overflow-x-auto');


const relatedPath = 'src/components/blog/RelatedGuidesCarousel.tsx';
const relatedSource = fs.readFileSync(relatedPath, 'utf8');
const hasRelatedTracking = relatedSource.includes("trackEvent('click_related_post'");

const indexPath = 'src/app/(marketing)/blog/page.tsx';
const indexSource = fs.readFileSync(indexPath, 'utf8');
const hasSaasPanel = indexSource.includes('Court-ready landlord guidance with product-led next steps');

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
  hasToc,
  hasOverflowHardening,
  hasRelatedTracking,
  hasSaasPanel,
  svgRefs,
};

console.log('[blog-audit]', JSON.stringify(report, null, 2));

if (!report.stickyPass || !hasToc || !hasOverflowHardening || !hasRelatedTracking || !hasSaasPanel || svgRefs.length > 0) {
  process.exitCode = 1;
}
