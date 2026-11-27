import Image from 'next/image';
import { getReviewIllustrationSrc } from './reviewPresentation';

/** Full-width artwork for the current product; no reserved side column. */
export function ReviewIllustration({ product, jurisdiction }: { product: string; jurisdiction?: string }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#faf8f5]" data-testid="review-illustration">
      <Image
        src={getReviewIllustrationSrc(product, jurisdiction)}
        alt=""
        width={1800}
        height={600}
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="aspect-[3/1] h-auto w-full object-cover object-center sm:aspect-[4/1] lg:aspect-[5/1]"
      />
    </div>
  );
}
