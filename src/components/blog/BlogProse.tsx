import Link from 'next/link';
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react';
import { BlogCTA } from './BlogCTA';
import { BlogInlineProductCard } from './BlogInlineProductCard';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';
import type { BlogPost } from '@/lib/blog/types';

const blogProseClassName = [
  'blog-prose prose prose-lg max-w-none overflow-x-clip [overflow-wrap:anywhere]',
  'prose-headings:scroll-mt-[var(--lh-sticky-top)] prose-headings:font-bold prose-headings:text-slate-900',
  'prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-[1.75rem] prose-h2:leading-tight',
  'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-2xl prose-h3:leading-snug',
  'prose-h4:mt-6 prose-h4:mb-2',
  'prose-p:my-4 prose-p:leading-7 prose-p:text-slate-700',
  'prose-ul:my-4 prose-ol:my-4 prose-ul:pl-6 prose-ol:pl-6 prose-li:my-1 prose-li:break-words prose-li:[overflow-wrap:anywhere] prose-li:text-slate-700',
  'prose-a:break-words prose-a:[overflow-wrap:anywhere] prose-a:font-medium prose-a:text-[#692ed4] prose-a:decoration-[#cdb1f7] prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:break-words hover:prose-a:text-[#5922bc] hover:prose-a:decoration-[#692ed4] focus-visible:prose-a:break-words',
  'prose-a:focus-visible:rounded-sm prose-a:focus-visible:outline-none prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-[#692ed4] prose-a:focus-visible:ring-offset-2',
  'prose-strong:text-slate-900',
  'prose-blockquote:my-7 prose-blockquote:rounded-2xl prose-blockquote:border prose-blockquote:border-[#e7d9ff] prose-blockquote:border-l-4 prose-blockquote:border-l-[#692ed4] prose-blockquote:bg-[#f8f1ff] prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-slate-700',
  'prose-img:my-8 prose-img:h-auto prose-img:w-full prose-img:max-w-full prose-img:rounded-2xl prose-img:border prose-img:border-[#e8ddfb] prose-img:bg-[#f8f1ff]',
  'prose-figure:my-8 prose-figure:overflow-hidden prose-figure:rounded-2xl prose-figure:border prose-figure:border-[#e8ddfb] prose-figure:bg-[#f8f1ff] prose-figure:p-2',
  'prose-figcaption:mt-2 prose-figcaption:text-xs prose-figcaption:text-slate-600',
  'prose-video:my-8 prose-video:h-auto prose-video:w-full prose-video:max-w-full prose-video:rounded-2xl',
  'prose-table:my-0 prose-table:w-full prose-table:min-w-[600px] prose-table:text-sm prose-table:[&_th]:bg-[#f8f1ff] prose-table:[&_th]:px-3 prose-table:[&_th]:py-2 prose-table:[&_th]:text-left prose-table:[&_th]:font-semibold prose-table:[&_td]:border-b prose-table:[&_td]:border-[#ebe3fb] prose-table:[&_td]:px-3 prose-table:[&_td]:py-2',
  'prose-pre:my-0 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:border prose-pre:border-[#e7d9ff] prose-pre:bg-[#f8f1ff] prose-pre:px-4 prose-pre:py-3',
  'prose-code:break-words prose-code:[overflow-wrap:anywhere]',
  'prose-hr:my-8 prose-hr:border-[#e9dcff]',
  '[&_ul_ul]:mt-2 [&_ol_ol]:mt-2 [&_li>*]:min-w-0 [&_li_p]:my-2',
  '[&_a:hover]:break-words [&_a:focus-visible]:break-words [&_blockquote_*]:break-words',
  '[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:object-contain [&_svg]:overflow-visible',
  '[&_img]:max-w-full [&_img]:h-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto',
].join(' ');

const CONTEXTUAL_LINKS = [
  { href: '/section-8-notice-guide', anchor: 'Section 8 notice guide', pattern: /\b(section 8|ground 8|ground 10|ground 11|rent arrears eviction)\b/i },
  { href: '/evict-tenant-not-paying-rent', anchor: 'evict tenant not paying rent guide', pattern: /\b(tenant not paying rent|evict tenant not paying rent|unpaid rent)\b/i },
  { href: '/tenant-stopped-paying-rent', anchor: 'tenant stopped paying rent playbook', pattern: /\b(tenant stopped paying rent|missed rent payment|late rent)\b/i },
  { href: '/renters-rights-act-eviction-rules', anchor: 'current England eviction rules', pattern: /\b(renters' rights act|current england possession|current england eviction rules)\b/i },
  { href: '/how-to-evict-a-tenant-uk', anchor: 'step-by-step UK eviction process', pattern: /\b(eviction process|possession process|possession hearing|eviction timeline|court hearing)\b/i },
  { href: '/money-claim-unpaid-rent', anchor: 'money claim for unpaid rent', pattern: /\b(money claim|mcol|debt recovery|recover rent arrears|county court claim)\b/i },
] as const;

type BlogProseProps = PropsWithChildren<{
  post: Pick<BlogPost, 'slug' | 'title' | 'targetKeyword' | 'category' | 'tags'>;
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
}>;

function linkTextNode(text: string, usedHrefs: Set<string>): ReactNode {
  for (const link of CONTEXTUAL_LINKS) {
    if (usedHrefs.has(link.href) || !link.pattern.test(text)) continue;
    const match = text.match(link.pattern);
    if (!match || match.index === undefined) continue;

    const start = match.index;
    const end = start + match[0].length;
    usedHrefs.add(link.href);

    return (
      <>
        {text.slice(0, start)}
        <Link href={link.href}>{link.anchor}</Link>
        {text.slice(end)}
      </>
    );
  }

  return text;
}

function wrapScrollableContent(node: ReactNode, usedHrefs: Set<string>, inAnchor = false): ReactNode {
  if (typeof node === 'string' && !inAnchor) {
    return linkTextNode(node, usedHrefs);
  }

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;
  const tagName = typeof element.type === 'string' ? element.type : null;
  const nextInAnchor = inAnchor || tagName === 'a';
  const wrappedChildren = element.props.children
    ? Children.map(element.props.children, (child) =>
        wrapScrollableContent(child, usedHrefs, nextInAnchor),
      )
    : element.props.children;

  if (tagName === 'table') {
    return (
      <div className="my-6 w-full max-w-full overflow-x-auto rounded-2xl border border-[#e7d9ff] bg-white/90">
        {cloneElement(element, { children: wrappedChildren })}
      </div>
    );
  }

  if (tagName === 'pre') {
    return (
      <div className="my-6 w-full max-w-full overflow-x-auto">
        {cloneElement(element, { children: wrappedChildren })}
      </div>
    );
  }

  return cloneElement(element, { children: wrappedChildren });
}

function flattenTopLevel(node: ReactNode): ReactNode[] {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return [];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => flattenTopLevel(child));
  }

  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return flattenTopLevel(node.props.children);
  }

  return [node];
}

function stripLegacyBlogCtas(node: ReactNode): ReactNode | null {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null;
  }

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  if (node.type === BlogCTA) {
    return null;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;
  const cleanedChildren = element.props.children
    ? Children.toArray(element.props.children)
        .map((child) => stripLegacyBlogCtas(child))
        .filter((child) => child !== null)
    : element.props.children;

  return cloneElement(element, { children: cleanedChildren });
}

function buildSituationFirstOpener(
  post: Pick<BlogPost, 'title' | 'targetKeyword' | 'category' | 'tags'>
): string {
  const haystack = `${post.title} ${post.targetKeyword} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
  const keyword = post.targetKeyword.toLowerCase();

  if (haystack.includes('section 8') || haystack.includes('ground 8') || haystack.includes('ground 10') || haystack.includes('ground 11')) {
    if (haystack.includes('arrears') || haystack.includes('rent')) {
      return 'Your tenant owes rent and you need to know whether a Section 8 notice is the right move. This guide explains how it works, what can trip you up, and what to do next.';
    }

    return 'Your tenant is breaching the tenancy and you need to know whether Section 8 is the right route. This guide explains how it works, what evidence matters, and what to do next.';
  }

  if (
    haystack.includes('money claim') ||
    haystack.includes('arrears') ||
    haystack.includes('unpaid rent') ||
    haystack.includes('letter before action') ||
    haystack.includes('mcol') ||
    haystack.includes('debt')
  ) {
    return 'Your tenant owes you money and you need to know the fastest lawful way to chase it. This guide explains the route, the paperwork, and the mistakes that can slow you down.';
  }

  if (
    haystack.includes('tenancy agreement') ||
    haystack.includes('assured periodic') ||
    haystack.includes('ast') ||
    haystack.includes('occupation contract') ||
    haystack.includes('prt')
  ) {
    return 'You are setting up a new tenancy and you do not want to rely on an old template. This guide explains which agreement you need and what to sort before the tenant moves in.';
  }

  if (
    haystack.includes('deposit') ||
    haystack.includes('epc') ||
    haystack.includes('gas safety') ||
    haystack.includes('eicr') ||
    haystack.includes('right to rent') ||
    haystack.includes('smoke') ||
    haystack.includes('alarm') ||
    haystack.includes('compliance')
  ) {
    return `You are trying to sort ${keyword} before it causes a bigger problem later. This guide explains what you need to do, when it matters, and how it affects the rest of your case.`;
  }

  return `You are trying to work out what to do about ${keyword}. This guide explains the route in plain English, the common mistakes, and what to do next.`;
}

function isTag(node: ReactNode, tagName: string): boolean {
  return isValidElement(node) && typeof node.type === 'string' && node.type === tagName;
}

function isCtaAnchor(node: ReactNode): boolean {
  if (!isValidElement(node) || typeof node.type !== 'string') {
    return false;
  }

  return ['p', 'ul', 'ol', 'blockquote', 'div'].includes(node.type);
}

function replaceFirstParagraph(nodes: ReactNode[], opener: string): ReactNode[] {
  let replaced = false;

  return nodes.map((node, index) => {
    if (!replaced && isTag(node, 'p')) {
      replaced = true;
      const element = node as ReactElement<{ children?: ReactNode }>;
      return cloneElement(element, { key: element.key ?? `opener-${index}`, children: opener });
    }

    return node;
  });
}

function findCtaInsertionIndex(nodes: ReactNode[]): number {
  const firstH2Index = nodes.findIndex((node) => isTag(node, 'h2'));

  if (firstH2Index !== -1) {
    for (let index = firstH2Index + 1; index < nodes.length; index += 1) {
      if (isCtaAnchor(nodes[index])) {
        return index + 1;
      }
    }

    return firstH2Index + 1;
  }

  const paragraphIndexes = nodes
    .map((node, index) => (isTag(node, 'p') ? index : -1))
    .filter((index) => index >= 0);

  if (paragraphIndexes.length >= 2) {
    return paragraphIndexes[1] + 1;
  }

  return Math.min(2, nodes.length);
}

export function BlogProse({
  children,
  post,
  cta,
  postSlug,
  category,
}: BlogProseProps) {
  const opener = buildSituationFirstOpener(post);
  const flattenedNodes = flattenTopLevel(children)
    .map((node) => stripLegacyBlogCtas(node))
    .filter((node) => node !== null);

  const nodesWithOpener = replaceFirstParagraph(flattenedNodes, opener);
  const ctaInsertionIndex = findCtaInsertionIndex(nodesWithOpener);
  const ctaCard = (
    <BlogInlineProductCard
      key="blog-inline-product-card"
      cta={cta}
      postSlug={postSlug}
      category={category}
    />
  );
  const nodesWithSingleCta = [
    ...nodesWithOpener.slice(0, ctaInsertionIndex),
    ctaCard,
    ...nodesWithOpener.slice(ctaInsertionIndex),
  ];

  const usedHrefs = new Set<string>();

  return (
    <div className={blogProseClassName}>
      {nodesWithSingleCta.map((child, index) => (
        <Fragment key={index}>{wrapScrollableContent(child, usedHrefs)}</Fragment>
      ))}
    </div>
  );
}
