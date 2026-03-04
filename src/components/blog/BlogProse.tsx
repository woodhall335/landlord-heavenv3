import { Children, cloneElement, isValidElement, PropsWithChildren, ReactElement, ReactNode } from 'react';

const blogProseClassName = [
  'blog-prose prose prose-lg max-w-none overflow-x-clip [overflow-wrap:anywhere]',
  'prose-headings:scroll-mt-[var(--lh-sticky-top)] prose-headings:font-bold prose-headings:text-slate-900',
  'prose-h2:mt-11 prose-h2:mb-4 prose-h2:text-3xl',
  'prose-h3:mt-9 prose-h3:mb-4 prose-h3:text-2xl',
  'prose-h4:mt-6 prose-h4:mb-2',
  'prose-p:my-5 prose-p:leading-relaxed prose-p:text-slate-700',
  'prose-ul:my-5 prose-ol:my-5 prose-ul:pl-6 prose-ol:pl-6 prose-li:my-1 prose-li:break-words prose-li:[overflow-wrap:anywhere] prose-li:text-slate-700',
  'prose-a:break-words prose-a:[overflow-wrap:anywhere] prose-a:font-medium prose-a:text-[#692ed4] prose-a:decoration-[#cdb1f7] prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:break-words hover:prose-a:text-[#5922bc] hover:prose-a:decoration-[#692ed4] focus-visible:prose-a:break-words',
  'prose-a:focus-visible:rounded-sm prose-a:focus-visible:outline-none prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-[#692ed4] prose-a:focus-visible:ring-offset-2',
  'prose-strong:text-slate-900',
  'prose-blockquote:my-7 prose-blockquote:rounded-2xl prose-blockquote:border prose-blockquote:border-[#e7d9ff] prose-blockquote:border-l-4 prose-blockquote:border-l-[#692ed4] prose-blockquote:bg-[#f8f1ff] prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-slate-700',
  'prose-img:my-8 prose-img:h-auto prose-img:w-full prose-img:max-w-full prose-img:rounded-2xl prose-img:border prose-img:border-[#e8ddfb] prose-img:bg-[#f8f1ff]',
  'prose-figure:my-8 prose-figure:overflow-hidden prose-figure:rounded-2xl prose-figure:border prose-figure:border-[#e8ddfb] prose-figure:bg-[#f8f1ff] prose-figure:p-2',
  'prose-figcaption:mt-2 prose-figcaption:text-xs prose-figcaption:text-slate-600',
  'prose-video:my-8 prose-video:h-auto prose-video:w-full prose-video:max-w-full prose-video:rounded-2xl',
  'prose-table:my-0 prose-table:w-full prose-table:min-w-[640px] prose-table:text-sm prose-table:[&_th]:bg-[#f8f1ff] prose-table:[&_th]:px-3 prose-table:[&_th]:py-2 prose-table:[&_th]:text-left prose-table:[&_th]:font-semibold prose-table:[&_td]:border-b prose-table:[&_td]:border-[#ebe3fb] prose-table:[&_td]:px-3 prose-table:[&_td]:py-2',
  'prose-pre:my-0 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:border prose-pre:border-[#e7d9ff] prose-pre:bg-[#f8f1ff] prose-pre:px-4 prose-pre:py-3',
  'prose-code:break-words prose-code:[overflow-wrap:anywhere]',
  'prose-hr:my-8 prose-hr:border-[#e9dcff]',
  '[&_ul_ul]:mt-2 [&_ol_ol]:mt-2 [&_li>*]:min-w-0 [&_li_p]:my-2',
  '[&_a:hover]:break-words [&_a:focus-visible]:break-words [&_blockquote_*]:break-words',
  '[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:object-contain [&_svg]:overflow-visible',
  '[&_img]:max-w-full [&_img]:h-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto',
].join(' ');

function wrapScrollableContent(node: ReactNode): ReactNode {
  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;
  const wrappedChildren = element.props.children
    ? Children.map(element.props.children, (child) => wrapScrollableContent(child))
    : element.props.children;

  if (typeof element.type === 'string' && element.type === 'table') {
    return (
      <div className="my-7 w-full overflow-x-auto rounded-2xl border border-[#e7d9ff] bg-white/90">
        {cloneElement(element, { children: wrappedChildren })}
      </div>
    );
  }

  if (typeof element.type === 'string' && element.type === 'pre') {
    return (
      <div className="my-7 w-full overflow-x-auto">
        {cloneElement(element, { children: wrappedChildren })}
      </div>
    );
  }

  return cloneElement(element, { children: wrappedChildren });
}

export function BlogProse({ children }: PropsWithChildren) {
  return <div className={blogProseClassName}>{Children.map(children, (child) => wrapScrollableContent(child))}</div>;
}
