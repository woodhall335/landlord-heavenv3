import React from "react";
import { clsx } from "clsx";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  className,
}: TestimonialCardProps) {
  return (
    <div className={clsx("bg-cream rounded-2xl p-8 md:p-10 space-y-6", className)}>
      <div className="flex items-start gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-linear-to-br from-secondary/20 to-secondary/40 border-4 border-secondary/30">
            {avatar ? (
              <img
                src={avatar}
                alt={author}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-secondary">
                {author.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <blockquote className="text-lg text-gray-900 leading-relaxed mb-6">
            "{quote}"
          </blockquote>
          
          <div>
            <div className="font-bold text-gray-900">{author}</div>
            <div className="text-sm text-gray-600">
              {role} at {company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
