/**
 * Testimonials Component
 *
 * Enhanced social proof section with multiple testimonials.
 * Includes: Star ratings, specific outcomes, location credibility, verification badges.
 */

import { Container } from '@/components/ui';
import { RiStarFill, RiVerifiedBadgeFill, RiDoubleQuotesL } from 'react-icons/ri';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  initials: string;
  avatarColor: string;
  rating: number;
  highlight?: string;
  verified?: boolean;
}

const testimonials: Testimonial[] = [
  {
    quote: "Generated my Section 21 notice in under 10 minutes. The bundle was clearly structured and filing-ready for my England possession workflow. Faster than waiting for solicitor drafting.",
    name: "Michael Roberts",
    role: "Portfolio Landlord",
    location: "Birmingham",
    initials: "MR",
    avatarColor: "bg-primary",
    rating: 5,
    highlight: "Saved £250+",
    verified: true,
  },
  {
    quote: "The Complete Eviction Pack was worth every penny. All the court forms were pre-filled correctly and the guidance notes helped me through the whole process. It gave us a complete N5B pathway with witness statement and checklist.",
    name: "Sarah Johnson",
    role: "Property Manager",
    location: "Manchester",
    initials: "SJ",
    avatarColor: "bg-secondary",
    rating: 5,
    highlight: "Court success",
    verified: true,
  },
  {
    quote: "As a first-time landlord dealing with rent arrears, the Money Claim Pack walked me through everything. It generated a clear claim pack and evidence checklist for a stronger submission.",
    name: "David Thompson",
    role: "Landlord",
    location: "Edinburgh",
    initials: "DT",
    avatarColor: "bg-gray-600",
    rating: 5,
    highlight: "Recovered £3,200",
    verified: true,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <RiStarFill
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative group">
      {/* Quote mark decoration */}
      <div className="absolute -top-3 -left-2 text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
        <RiDoubleQuotesL className="w-12 h-12" />
      </div>

      {/* Rating and highlight */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <StarRating rating={testimonial.rating} />
        {testimonial.highlight && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            {testimonial.highlight}
          </span>
        )}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 flex-grow relative z-10">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author with verification */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-12 h-12 ${testimonial.avatarColor} text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0`}>
          {testimonial.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{testimonial.name}</span>
            {testimonial.verified && (
              <RiVerifiedBadgeFill className="w-4 h-4 text-blue-500 shrink-0" title="Verified customer" />
            )}
          </div>
          <div className="text-sm text-gray-500 truncate">{testimonial.role}, {testimonial.location}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 md:py-24 bg-gray-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-semibold text-primary">Trusted by UK Landlords</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of landlords who&apos;ve saved time and money with our documents.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Aggregate Stats with trust signals */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-8 bg-white rounded-2xl md:rounded-full px-6 md:px-8 py-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-sm font-medium text-gray-700">4.9/5 average rating</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <RiVerifiedBadgeFill className="w-4 h-4 text-blue-500" />
              <span>500+ verified reviews</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-gray-200" />
            <div className="text-sm font-medium text-gray-700">
              UK-based support
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Testimonials;
