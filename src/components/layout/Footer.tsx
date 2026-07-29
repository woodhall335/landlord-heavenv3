'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';

export function Footer() {
  const pathname = usePathname();

  const isImmersiveWizardRoute =
    pathname?.startsWith('/wizard/flow') ||
    pathname?.startsWith('/wizard/review') ||
    pathname?.startsWith('/wizard/preview');

  if (isImmersiveWizardRoute) {
    return null;
  }

  const askHeavenLink = buildAskHeavenLink({ source: 'footer' });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[linear-gradient(180deg,#1f1234_0%,#140b22_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/footerlogo3.png"
                alt="Landlord Heaven"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#bdbdbd]">
              England landlord workflows for eviction, court possession, debt recovery and rent
              increases, plus Standard tenancy agreements for England, Wales, Scotland and
              Northern Ireland.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#bdbdbd]">
              <span>Choose products by the jurisdiction of the rental property.</span>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-[#bdbdbd]">
              <u>Products</u>
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products/notice-only" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Eviction Notice Generator
                </Link>
              </li>
              <li>
                <Link href="/products/complete-pack" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Complete Eviction Pack
                </Link>
              </li>
              <li>
                <Link href="/products/money-claim" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Money Claim Pack
                </Link>
              </li>
              <li>
                <Link href="/assisted-prep" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Assisted Prep Services
                </Link>
              </li>
              <li>
                <Link href="/rent-increase" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Rent Increase
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-[#bdbdbd]">
              <u>Tenancy Agreements</u>
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/standard-tenancy-agreement" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Choose by jurisdiction
                </Link>
              </li>
              <li>
                <Link href="/products/ast" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  England agreements
                </Link>
              </li>
              <li>
                <Link href="/tenancy-agreements/wales" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Wales Standard Occupation Contracts
                </Link>
              </li>
              <li>
                <Link href="/tenancy-agreements/scotland" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Scotland Standard PRT
                </Link>
              </li>
              <li>
                <Link href="/tenancy-agreements/northern-ireland" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Northern Ireland Standard Agreement
                </Link>
              </li>
              <li>
                <Link href="/premium-tenancy-agreement" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  England Premium
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-[#bdbdbd]">
              <u>Guides & Tools</u>
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Landlord guides
                </Link>
              </li>
              <li>
                <Link href="/eviction-guides" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Eviction guides
                </Link>
              </li>
              <li>
                <Link href="/tools" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Free tools
                </Link>
              </li>
              <li>
                <Link href="/samples" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Free Samples
                </Link>
              </li>
              <li>
                <Link href="/section-8-notice" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Section 8 guide
                </Link>
              </li>
              <li>
                <Link href={askHeavenLink} className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Ask Heaven AI
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-[#bdbdbd]">
              <u>Company</u>
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="inline-block text-xs text-[#bdbdbd] transition-colors hover:text-white">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-center text-sm text-[#bdbdbd] md:text-left">
              &copy; {currentYear} Landlord Heaven. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-[#bdbdbd]">
              <span className="font-medium">Jurisdiction-specific landlord documents</span>
              <span>&bull;</span>
              <span className="font-medium">Guided Document Workflows</span>
              <span>&bull;</span>
              <span className="font-medium">Ready to Print</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
