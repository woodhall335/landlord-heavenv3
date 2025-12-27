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
                src="/footerlogo.png"
                alt="Landlord Heaven"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-base text-gray-300 leading-relaxed mb-6">
              Professional legal documents for UK landlords. Court-ready, compliant, instantly delivered.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-eng.svg"
                  alt="England"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span>England</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-wls.svg"
                  alt="Wales"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span>Wales</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-sct.svg"
                  alt="Scotland"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span>Scotland</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/gb-nir.svg"
                  alt="Northern Ireland"
                  width={20}
                  height={20}
                  className="w-7 h-5"
                />
                <span>Northern Ireland</span>
              </div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h5 className="text-base font-bold mb-6 text-white">Products</h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/products/notice-only"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Notice Only
                </Link>
              </li>
              <li>
                <Link
                  href="/products/complete-pack"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Complete Eviction Pack
                </Link>
              </li>
              <li>
                <Link
                  href="/products/money-claim"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Money Claim Pack
                </Link>
              </li>
              <li>
                <Link
                  href="/products/ast"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Tenancy Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/hmo-pro"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  HMO Pro Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h5 className="text-base font-bold mb-6 text-white">Legal</h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Account */}
          <div>
            <h5 className="text-base font-bold mb-6 text-white">Account</h5>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
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
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Landlord Heaven. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="font-medium">100% UK Coverage</span>
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
