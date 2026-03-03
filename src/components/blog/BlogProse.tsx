import { PropsWithChildren } from 'react';

const blogProseClassName = [
  'blog-prose prose prose-lg max-w-none overflow-x-clip [overflow-wrap:anywhere]',
  'prose-headings:scroll-mt-[var(--lh-sticky-top)] prose-headings:font-bold prose-headings:text-slate-900',
  'prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-3xl',
  'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-2xl',
  'prose-h4:mt-6 prose-h4:mb-2',
  'prose-p:my-4 prose-p:leading-relaxed prose-p:text-slate-700',
  'prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-slate-700',
  'prose-a:break-words prose-a:font-medium prose-a:text-[#692ed4] prose-a:decoration-[#cdb1f7] prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:text-[#5922bc] hover:prose-a:decoration-[#692ed4]',
  'prose-a:focus-visible:rounded-sm prose-a:focus-visible:outline-none prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-[#692ed4] prose-a:focus-visible:ring-offset-2',
  'prose-strong:text-slate-900',
  'prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-[#692ed4] prose-blockquote:bg-[#f8f1ff] prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-slate-700',
  'prose-img:my-7 prose-img:h-auto prose-img:w-full prose-img:max-w-full prose-img:rounded-xl prose-img:border prose-img:border-[#e8ddfb] prose-img:bg-[#f8f1ff]',
  'prose-figure:my-7 prose-figure:overflow-hidden prose-figure:rounded-xl prose-figure:border prose-figure:border-[#e8ddfb] prose-figure:bg-[#f8f1ff] prose-figure:p-2',
  'prose-figcaption:mt-2 prose-figcaption:text-xs prose-figcaption:text-slate-600',
  'prose-video:my-7 prose-video:h-auto prose-video:w-full prose-video:max-w-full prose-video:rounded-xl',
  'prose-table:my-6 prose-table:w-full prose-table:min-w-[640px] prose-table:text-sm prose-table:[&_th]:bg-[#f8f1ff] prose-table:[&_th]:px-3 prose-table:[&_th]:py-2 prose-table:[&_th]:text-left prose-table:[&_th]:font-semibold prose-table:[&_td]:border-b prose-table:[&_td]:border-[#ebe3fb] prose-table:[&_td]:px-3 prose-table:[&_td]:py-2',
  'prose-pre:my-6 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950/5 prose-pre:px-4 prose-pre:py-3',
  'prose-code:break-words',
  'prose-hr:my-8 prose-hr:border-[#e9dcff]',
  '[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:object-contain [&_svg]:overflow-visible',
  '[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:whitespace-nowrap md:[&_table]:table md:[&_table]:whitespace-normal',
  '[&_img]:max-w-full [&_img]:h-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto',
].join(' ');

export function BlogProse({ children }: PropsWithChildren) {
  return <div className={blogProseClassName}>{children}</div>;
}
