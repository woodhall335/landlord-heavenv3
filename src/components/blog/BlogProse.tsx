import Link from 'next/link';
import { Children, cloneElement, isValidElement, PropsWithChildren, ReactElement, ReactNode } from 'react';

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
  { href: '/section-21-notice-guide', anchor: 'Section 21 notice guide', pattern: /\b(section 21|form 6a|no-fault eviction|accelerated possession)\b/i },
  { href: '/how-to-evict-a-tenant-uk', anchor: 'step-by-step UK eviction process', pattern: /\b(eviction process|possession process|possession hearing|eviction timeline|court hearing)\b/i },
  { href: '/money-claim-unpaid-rent', anchor: 'money claim for unpaid rent', pattern: /\b(money claim|mcol|debt recovery|recover rent arrears|county court claim)\b/i },
] as const;

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

export function BlogProse({ children }: PropsWithChildren) {
  const usedHrefs = new Set<string>();
  return <div className={blogProseClassName}>{Children.map(children, (child) => wrapScrollableContent(child, usedHrefs))}</div>;
}
