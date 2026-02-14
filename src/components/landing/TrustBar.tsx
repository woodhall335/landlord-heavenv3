/**
 * TrustBar Component
 *
 * Displays trust signals immediately after hero section to build credibility.
 * Includes: Payment security, SSL, guarantee, UK-based, customer count
 * Mobile: Auto-sliding carousel showing one badge at a time
 */

"use client";

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui';
import { RiShieldCheckLine, RiLockLine, RiMapPinLine } from 'react-icons/ri';

interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}

function TrustBadge({ icon, label, sublabel }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {sublabel && <span className="text-xs text-gray-500 block">{sublabel}</span>}
      </div>
    </div>
  );
}

const trustBadges = [
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
      </svg>
    ),
    label: "England, Wales & Scotland Covered",
  },
  {
    icon: <RiLockLine className="h-5 w-5" />,
    label: "Section 21 & Section 8 Bundles",
  },
  {
    icon: <RiShieldCheckLine className="h-5 w-5" />,
    label: "Welsh Renting Homes Act Compliant",
  },
  {
    icon: <RiMapPinLine className="h-5 w-5" />,
    label: "Scottish PRT Tribunal Ready",
  },
];

export function TrustBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trustBadges.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-4 bg-gray-50 border-y border-gray-200">
      <Container>
        {/* Desktop: Show all badges in a row */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-14">
          {trustBadges.map((badge, index) => (
            <TrustBadge
              key={index}
              icon={badge.icon}
              label={badge.label}
            />
          ))}
        </div>

        {/* Mobile: Auto-sliding single badge */}
        <div className="md:hidden flex flex-col items-center justify-center">
          <div className="relative overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  <TrustBadge
                    icon={badge.icon}
                    label={badge.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-1.5 mt-3">
            {trustBadges.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary w-4'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default TrustBar;
