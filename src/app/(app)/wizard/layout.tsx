/**
 * Wizard Layout
 *
 * Wrapper for all wizard pages.
 * Note: robots noindex,follow is set in each page's generateMetadata
 * to allow product-specific canonical URLs.
 */

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
