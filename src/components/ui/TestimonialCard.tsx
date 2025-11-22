import React from "react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

export function TestimonialCard({ quote, author, role, avatar }: TestimonialCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 text-lg font-semibold text-gray-900">“{quote}”</div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white font-bold">
          {avatar ? <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : author[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          {role && <div className="text-sm text-gray-500">{role}</div>}
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
