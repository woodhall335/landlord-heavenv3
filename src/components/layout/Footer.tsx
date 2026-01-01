import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: About */}
          <div>
            <div className="mb-6">
              <Image
                src="/footerlogo3.png"
                alt="Landlord Heaven"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-base text-gray-300 leading-relaxed mb-6">
              Professional legal documents for UK landlords. Court-ready, compliant, instantly delivered.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-eng.svg"
                  alt="England"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span style={{ color: '#bdbdbd' }}>England</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-wls.svg"
                  alt="Wales"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span style={{ color: '#bdbdbd' }}>Wales</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-sct.svg"
                  alt="Scotland"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span style={{ color: '#bdbdbd' }}>Scotland</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-nir.svg"
                  alt="Northern Ireland"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span style={{ color: '#bdbdbd' }}>Northern Ireland</span>
              </div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h5 className="text-base font-bold mb-6 text-gray-300"><u>Products</u></h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/products/notice-only"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Notice Only
                </Link>
              </li>
              <li>
                <Link
                  href="/products/complete-pack"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Complete Eviction Pack
                </Link>
              </li>
              <li>
                <Link
                  href="/products/money-claim"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Money Claim Pack
                </Link>
              </li>
              <li>
                <Link
                  href="/products/ast"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Tenancy Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/hmo-pro"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  HMO Pro Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h5 className="text-base font-bold mb-6 text-gray-300"><u>Legal</u></h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/terms"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Account */}
          <div>
            <h5 className="text-base font-bold mb-6 text-gray-300"><u>Account</u></h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm transition-colors inline-block"
                  style={{ color: '#bdbdbd' }}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {currentYear} Landlord Heaven. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="font-medium">UK-Wide Coverage</span>
              <span className="text-gray-600">•</span>
              <span className="font-medium">Court-Ready Documents</span>
              <span className="text-gray-600">•</span>
              <span className="font-medium">Instant Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
