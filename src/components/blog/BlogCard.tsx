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
}

export function BlogCard({
  slug,
  title,
  description,
  date,
  readTime,
  category,
  heroImage,
  heroImageAlt,
  featured = false,
}: BlogCardProps) {
  if (featured) {
    return (
      <article className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <Link href={`/blog/${slug}`} className="block">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-[16/10] md:aspect-auto bg-gradient-to-br from-primary/5 to-primary/10">
              {heroImage && !heroImage.includes('placeholder') ? (
                <Image
                  src={heroImage}
                  alt={heroImageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-primary/50">{heroImageAlt}</span>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Featured
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                  {category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                {title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {description}
              </p>
              <div className="flex items-center text-primary font-medium">
                Read Guide
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <Link href={`/blog/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10">
          {heroImage && !heroImage.includes('placeholder') ? (
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
              {category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        </div>
      </Link>
    </article>
  );
}
