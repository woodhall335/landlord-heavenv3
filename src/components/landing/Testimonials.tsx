/**
 * Testimonials Component
 *
 * Enhanced social proof section with multiple testimonials.
 * Includes: Star ratings, specific outcomes, location credibility.
 */

import { Container } from '@/components/ui';
import { RiStarFill } from 'react-icons/ri';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  initials: string;
  avatarColor: string;
  rating: number;
  highlight?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Generated my Section 21 notice in under 10 minutes. The court accepted it without any issues. Saved me over £250 compared to my solicitor's quote.",
    name: "Michael Roberts",
    role: "Portfolio Landlord",
    location: "Birmingham",
    initials: "MR",
    avatarColor: "bg-primary",
    rating: 5,
    highlight: "Saved £250+"
  },
  {
    quote: "The Complete Eviction Pack was worth every penny. All the court forms were pre-filled correctly and the guidance notes helped me through the whole process. Got possession in 8 weeks.",
    name: "Sarah Johnson",
    role: "Property Manager",
    location: "Manchester",
    initials: "SJ",
    avatarColor: "bg-secondary",
    rating: 5,
    highlight: "Court success"
  },
  {
    quote: "As a first-time landlord dealing with rent arrears, the Money Claim Pack walked me through everything. Recovered £3,200 in unpaid rent and the tenant's now paying on time.",
    name: "David Thompson",
    role: "Landlord",
    location: "Edinburgh",
    initials: "DT",
    avatarColor: "bg-gray-600",
    rating: 5,
    highlight: "Recovered £3,200"
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
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Rating */}
      <div className="flex items-center justify-between mb-4">
        <StarRating rating={testimonial.rating} />
        {testimonial.highlight && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            {testimonial.highlight}
          </span>
        )}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 leading-relaxed mb-6 flex-grow">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-12 h-12 ${testimonial.avatarColor} text-white rounded-full flex items-center justify-center font-bold text-lg`}>
          {testimonial.initials}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.location}</div>
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
          <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-semibold text-primary">Trusted by UK Landlords</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of landlords who've saved time and money with our documents.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Aggregate Stats */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-full px-8 py-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-sm font-medium text-gray-700">4.9/5 average rating</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-sm font-medium text-gray-700">
              Based on 500+ reviews
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Testimonials;
