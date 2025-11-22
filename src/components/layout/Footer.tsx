import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                <span className="text-white font-bold text-xl">LH</span>
              </div>
              <span className="text-lg font-bold">Landlord Heaven</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Legal documents for UK landlords. Court-ready, AI-powered, instantly delivered.
            </p>
            <div className="mt-4 text-sm text-gray-400">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿 England & Wales<br />
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland<br />
              🇬🇧 Northern Ireland
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wide mb-4">Products</h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/ast"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Tenancy Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/eviction"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Eviction Forms
                </Link>
              </li>
              <li>
                <Link
                  href="/legal-proceedings"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Legal Proceedings
                </Link>
              </li>
              <li>
                <Link
                  href="/products/notice-only"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Notices
                </Link>
              </li>
              <li>
                <Link
                  href="/products/money-claim"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Money Claims
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wide mb-4">Legal</h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wide mb-4">Support</h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Landlord Heaven. All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>100% UK Coverage</span>
              <span>•</span>
              <span>Court-Ready Documents</span>
              <span>•</span>
              <span>Instant Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
