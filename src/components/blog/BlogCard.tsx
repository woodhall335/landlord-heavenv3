import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  heroImageAlt: string;
  featured?: boolean;
  onClick?: () => void;
}

export function BlogCard({
  slug,
  title,
  description,
  readTime,
  category,
  heroImage,
  heroImageAlt,
  featured = false,
  onClick,
}: BlogCardProps) {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-[#e8ddfb] bg-white shadow-[0_10px_30px_rgba(105,46,212,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(105,46,212,0.14)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#692ed4] via-[#8f5be6] to-[#b798f2]" />
        <Link href={`/blog/${slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2" onClick={onClick}>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[16/9] border-b border-[#ede4ff] bg-[#f8f1ff] md:aspect-auto md:border-b-0 md:border-r">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute left-4 top-4 rounded-full bg-[#692ed4] px-3 py-1 text-xs font-semibold text-white">Featured</div>
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8">
              <div className="mb-3 flex items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-[#f8f1ff] px-3 py-1 text-xs font-semibold text-[#692ed4]">{category}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readTime}
                </span>
              </div>
              <h2 className="mb-3 line-clamp-2 text-2xl font-bold text-slate-900 transition-colors group-hover:text-[#692ed4]">{title}</h2>
              <p className="mb-4 line-clamp-3 text-slate-600">{description}</p>
              <div className="inline-flex items-center font-semibold text-[#692ed4]">
                Read Guide
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-[#ebe3fb] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8c3fb] hover:shadow-[0_12px_30px_rgba(105,46,212,0.14)]">
      <Link
        href={`/blog/${slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
        onClick={onClick}
      >
        <div className="relative aspect-[16/9] border-b border-[#efe6ff] bg-[#f8f1ff]">
          <Image
            src={heroImage}
            alt={heroImageAlt}
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-[#f8f1ff] px-2.5 py-1 text-xs font-semibold text-[#692ed4]">{category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </span>
          </div>
          <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-[#692ed4]">{title}</h2>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#692ed4]">
            Read guide
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
