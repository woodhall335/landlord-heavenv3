import Image from 'next/image';

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: 'hero' | 'inline' | 'square';
}

export function ImagePlaceholder({
  src,
  alt,
  caption,
  priority = false,
  className = '',
  aspectRatio = 'inline',
}: ImagePlaceholderProps) {
  const aspectClasses = {
    hero: 'aspect-[16/9]',
    inline: 'aspect-[16/10]',
    square: 'aspect-square',
  };
  const isSvg = src.toLowerCase().endsWith('.svg');

  return (
    <figure className={`my-8 w-full max-w-full overflow-hidden ${className}`}>
      <div className={`relative ${aspectClasses[aspectRatio]} w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white`}>
        {/* If image exists, show it */}
        {src && !src.includes('placeholder') ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={isSvg ? 'object-contain p-2 sm:p-3' : 'object-cover object-center'}
            sizes="(min-width: 1024px) 760px, 100vw"
            priority={priority}
          />
        ) : (
          /* Placeholder with icon and text */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/20 rounded-xl">
            <svg
              className="w-16 h-16 text-primary/30 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-primary/50 font-medium">{alt}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
