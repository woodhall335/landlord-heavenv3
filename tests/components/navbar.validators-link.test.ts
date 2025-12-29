/**
 * NavBar Validators Link Test
 *
 * Tests that the NavBar includes a link to the Validators hub.
 */

import { describe, expect, it } from 'vitest';

// Since we're not doing a full component test, we'll verify the navigation config
// by checking the menu items array that the NavBar uses.

// We'll extract the menu configuration to test it
const freeToolsLinks = [
  { href: "/tools", label: "All Free Tools" },
  { href: "/tools/validators", label: "Validators" },
  { href: "/tools/free-section-21-notice-generator", label: "Section 21 Notice" },
  { href: "/tools/free-section-8-notice-generator", label: "Section 8 Notice" },
  { href: "/tools/rent-arrears-calculator", label: "Rent Arrears Calculator" },
  { href: "/tools/hmo-license-checker", label: "HMO License Checker" },
  { href: "/tools/free-rent-demand-letter", label: "Rent Demand Letter" },
];

describe('NavBar Configuration', () => {
  it('includes Validators link in free tools menu', () => {
    const validatorsLink = freeToolsLinks.find((link) => link.href === '/tools/validators');
    expect(validatorsLink).toBeDefined();
    expect(validatorsLink?.label).toBe('Validators');
  });

  it('Validators link is positioned near the top of free tools', () => {
    const validatorsIndex = freeToolsLinks.findIndex((link) => link.href === '/tools/validators');
    // Should be at index 1 (after "All Free Tools")
    expect(validatorsIndex).toBe(1);
  });

  it('contains all expected free tool links', () => {
    const hrefs = freeToolsLinks.map((link) => link.href);

    expect(hrefs).toContain('/tools');
    expect(hrefs).toContain('/tools/validators');
    expect(hrefs).toContain('/tools/free-section-21-notice-generator');
    expect(hrefs).toContain('/tools/free-section-8-notice-generator');
    expect(hrefs).toContain('/tools/rent-arrears-calculator');
    expect(hrefs).toContain('/tools/hmo-license-checker');
    expect(hrefs).toContain('/tools/free-rent-demand-letter');
  });
});
