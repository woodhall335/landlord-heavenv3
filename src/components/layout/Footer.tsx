import Link from "next/link";
import Image from "next/image";
import { buildAskHeavenLink } from "@/lib/ask-heaven/buildAskHeavenLink";

export function Footer() {
  const askHeavenLink = buildAskHeavenLink({ source: 'footer' });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Column 1: About */}
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
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#bdbdbd' }}>
              Court-ready legal documents for UK landlords.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Image src="/gb-eng.svg" alt="England" width={16} height={16} className="w-4 h-3" />
                <span style={{ color: '#bdbdbd' }}></span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/gb-wls.svg" alt="Wales" width={16} height={16} className="w-4 h-3" />
                <span style={{ color: '#bdbdbd' }}></span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/gb-sct.svg" alt="Scotland" width={16} height={16} className="w-4 h-3" />
                <span style={{ color: '#bdbdbd' }}></span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/gb-nir.svg" alt="Northern Ireland" width={16} height={16} className="w-4 h-3" />
                <span style={{ color: '#bdbdbd' }}></span>
              </div>
            </div>
          </div>

          {/* Column 2: Evictions & Notices */}
          <div>
            <h5 className="text-sm font-bold mb-4" style={{ color: '#bdbdbd' }}><u>Evictions</u></h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/how-to-evict-tenant" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  How to Evict (UK Guide)
                </Link>
              </li>
              <li>
                <Link href="/section-21-notice-template" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Section 21 Template
                </Link>
              </li>
              <li>
                <Link href="/tools/validators/section-21" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Section 21 Validity Checker
                </Link>
              </li>
              <li>
                <Link href="/section-8-notice-template" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Section 8 Template
                </Link>
              </li>
              <li>
                <Link href="/tools/validators/section-8" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Section 8 Grounds Checker
                </Link>
              </li>
              <li>
                <Link href="/wales-eviction-notices" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Wales Eviction Guide
                </Link>
              </li>
              <li>
                <Link href="/scotland-eviction-notices" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Scotland Eviction Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Rent Arrears & Claims */}
          <div>
            <h5 className="text-sm font-bold mb-4" style={{ color: '#bdbdbd' }}><u>Rent Arrears</u></h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/money-claim-unpaid-rent" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Claim Unpaid Rent Guide
                </Link>
              </li>
              <li>
                <Link href="/rent-arrears-letter-template" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Rent Arrears Letter
                </Link>
              </li>
              <li>
                <Link href="/tools/rent-arrears-calculator" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Arrears Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/free-rent-demand-letter" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Free Demand Letter
                </Link>
              </li>
              <li>
                <Link href="/products/money-claim" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Money Claim Pack
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Products */}
          <div>
            <h5 className="text-sm font-bold mb-4" style={{ color: '#bdbdbd' }}><u>Products</u></h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products/notice-only" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Notice Only Pack
                </Link>
              </li>
              <li>
                <Link href="/products/complete-pack" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Complete Eviction Pack
                </Link>
              </li>
              <li>
                <Link href="/products/money-claim" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Money Claim Pack
                </Link>
              </li>
              <li>
                <Link href="/products/ast" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Tenancy Agreements
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  View All Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h5 className="text-sm font-bold mb-4" style={{ color: '#bdbdbd' }}><u>Legal</u></h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Account */}
          <div>
            <h5 className="text-sm font-bold mb-4" style={{ color: '#bdbdbd' }}><u>Account</u></h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/login" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Register
                </Link>
              </li>
              <li>
                <Link href={askHeavenLink} className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Ask Heaven
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs transition-colors inline-block hover:text-white" style={{ color: '#bdbdbd' }}>
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-center md:text-left" style={{ color: '#bdbdbd' }}>
              © {currentYear} Landlord Heaven. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm" style={{ color: '#bdbdbd' }}>
              <span className="font-medium">UK-Wide Coverage</span>
              <span style={{ color: '#bdbdbd' }}>•</span>
              <span className="font-medium">Court-Ready Documents</span>
              <span style={{ color: '#bdbdbd' }}>•</span>
              <span className="font-medium">Instant Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
