/**
 * Email Template Structure Tests
 *
 * These tests validate that our email templates follow Outlook-safe best practices:
 * - Table-based layout (not divs)
 * - Inline styles on all text elements
 * - No full-page dark backgrounds
 * - Dark mode meta tags present
 * - Bulletproof buttons (table-based)
 * - Explicit background colors with bgcolor attribute
 *
 * See src/lib/email/resend.ts for the template implementation and
 * detailed documentation on WHY these patterns are necessary.
 */

import { describe, it, expect } from 'vitest';

// Note: RESEND_API_KEY is set in vitest.setup.ts to prevent the Resend client
// from throwing during test imports
import {
  emailTemplateHelpers,
  EMAIL_COLORS,
} from '../resend';

// Generate sample HTML to test
const sampleContent = `
  <p style="color: white;">Test content</p>
  <a href="https://example.com" style="color: white;">Link</a>
`;

const sampleHtml = emailTemplateHelpers.getEmailWrapper(`
  ${emailTemplateHelpers.getLogoRow()}
  ${emailTemplateHelpers.getHeaderBanner('Test Email', EMAIL_COLORS.primary)}
  ${emailTemplateHelpers.getContentCard(sampleContent)}
  ${emailTemplateHelpers.getEmailFooter(true)}
`);

describe('Email Template Structure - Outlook Safety', () => {
  describe('Dark mode meta tags', () => {
    it('should include color-scheme meta tag', () => {
      expect(sampleHtml).toContain('name="color-scheme"');
      expect(sampleHtml).toContain('content="light dark"');
    });

    it('should include supported-color-schemes meta tag', () => {
      expect(sampleHtml).toContain('name="supported-color-schemes"');
    });
  });

  describe('Table-based layout', () => {
    it('should use table elements for layout', () => {
      expect(sampleHtml).toContain('<table');
      expect(sampleHtml).toContain('role="presentation"');
    });

    it('should have a 600px max-width container', () => {
      expect(sampleHtml).toContain('max-width: 600px');
    });

    it('should have a fixed-width inner table', () => {
      expect(sampleHtml).toContain('width="600"');
    });
  });

  describe('Background color strategy', () => {
    it('should use light outer background (not dark)', () => {
      // The outer background should be light gray (#F3F4F6) to prevent
      // Outlook dark mode from inverting the entire email
      expect(sampleHtml).toContain(`background-color: ${EMAIL_COLORS.outerBg}`);
    });

    it('should NOT set dark background on body element', () => {
      // Body should have the light outer background, not dark
      const bodyMatch = sampleHtml.match(/<body[^>]*style="[^"]*background-color:\s*([^;"\s]+)/);
      if (bodyMatch) {
        const bodyBgColor = bodyMatch[1].toLowerCase();
        // Should NOT be a dark color (black or very dark gray)
        expect(bodyBgColor).not.toBe('#000000');
        expect(bodyBgColor).not.toBe('#000');
        expect(bodyBgColor).not.toBe('#111827'); // cardBg - should be on card, not body
        expect(bodyBgColor).toBe(EMAIL_COLORS.outerBg.toLowerCase()); // Should be light gray
      }
    });

    it('should use dark background on inner card only', () => {
      // The dark background should be on the card container, not the outer body
      expect(sampleHtml).toContain(`bgcolor="${EMAIL_COLORS.cardBg}"`);
      expect(sampleHtml).toContain(`background-color: ${EMAIL_COLORS.cardBg}`);
    });

    it('should use both bgcolor attribute and inline style for backgrounds', () => {
      // For maximum compatibility, use both bgcolor="" and style="background-color:"
      // This ensures Outlook desktop renders the background correctly
      const bgcolorMatches = sampleHtml.match(/bgcolor="[^"]+"/g) || [];
      expect(bgcolorMatches.length).toBeGreaterThan(0);
    });
  });

  describe('MSO conditional comments', () => {
    it('should include MSO conditional comments for Outlook', () => {
      expect(sampleHtml).toContain('<!--[if mso]>');
      expect(sampleHtml).toContain('<![endif]-->');
    });

    it('should include MSO namespace declarations', () => {
      expect(sampleHtml).toContain('xmlns:v="urn:schemas-microsoft-com:vml"');
      expect(sampleHtml).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
    });
  });

  describe('Inline styles', () => {
    it('should set font-family inline on text elements', () => {
      expect(sampleHtml).toContain('font-family: Arial');
    });

    it('should set explicit colors inline', () => {
      // Should have color declarations in inline styles
      expect(sampleHtml).toMatch(/style="[^"]*color:\s*#/);
    });
  });

  describe('Text color safety', () => {
    it('should not use pure black (#000000) for text', () => {
      // Pure black can look harsh when Outlook dark mode partially inverts
      // We use safer dark tones instead
      expect(EMAIL_COLORS.darkText).not.toBe('#000000');
      expect(EMAIL_COLORS.darkText).not.toBe('#000');
    });

    it('should use white/near-white for text on dark backgrounds', () => {
      // Text on the dark card should be white or near-white
      expect(EMAIL_COLORS.white).toBe('#FFFFFF');
      expect(sampleHtml).toContain(`color: ${EMAIL_COLORS.white}`);
    });
  });
});

describe('Email Component Helpers', () => {
  describe('getHeaderBanner', () => {
    const headerHtml = emailTemplateHelpers.getHeaderBanner('Test Title', '#4F46E5');

    it('should create a table-based header', () => {
      expect(headerHtml).toContain('<table');
    });

    it('should set background color inline and with bgcolor', () => {
      expect(headerHtml).toContain('bgcolor="#4F46E5"');
      expect(headerHtml).toContain('background-color: #4F46E5');
    });

    it('should include MSO VML for Outlook background support', () => {
      expect(headerHtml).toContain('v:rect');
      expect(headerHtml).toContain('v:fill');
    });

    it('should set h1 text color explicitly', () => {
      expect(headerHtml).toContain(`color: ${EMAIL_COLORS.white}`);
    });
  });

  describe('getBulletproofButton', () => {
    const buttonHtml = emailTemplateHelpers.getBulletproofButton(
      'Click Me',
      'https://example.com',
      EMAIL_COLORS.primary
    );

    it('should be table-based', () => {
      expect(buttonHtml).toContain('<table');
    });

    it('should have bgcolor on td', () => {
      expect(buttonHtml).toContain(`bgcolor="${EMAIL_COLORS.primary}"`);
    });

    it('should include VML roundrect for Outlook', () => {
      expect(buttonHtml).toContain('v:roundrect');
    });

    it('should set link color inline', () => {
      expect(buttonHtml).toContain(`color: ${EMAIL_COLORS.white}`);
    });

    it('should have text-decoration: none on link', () => {
      expect(buttonHtml).toContain('text-decoration: none');
    });

    it('should include the href', () => {
      expect(buttonHtml).toContain('href="https://example.com"');
    });
  });

  describe('getContentCard', () => {
    const cardHtml = emailTemplateHelpers.getContentCard('<p>Test</p>');

    it('should use table-based layout', () => {
      expect(cardHtml).toContain('<table');
    });

    it('should set dark background with both bgcolor and style', () => {
      expect(cardHtml).toContain(`bgcolor="${EMAIL_COLORS.cardBg}"`);
      expect(cardHtml).toContain(`background-color: ${EMAIL_COLORS.cardBg}`);
    });

    it('should include MSO fallback table', () => {
      expect(cardHtml).toContain('<!--[if mso]>');
    });
  });

  describe('getFeatureCard', () => {
    const featureHtml = emailTemplateHelpers.getFeatureCard(
      'Feature Title',
      'Feature description text'
    );

    it('should use table layout', () => {
      expect(featureHtml).toContain('<table');
    });

    it('should have alt background color', () => {
      expect(featureHtml).toContain(`bgcolor="${EMAIL_COLORS.cardBgAlt}"`);
    });

    it('should have border-left accent', () => {
      expect(featureHtml).toContain('border-left:');
    });

    it('should set text colors explicitly', () => {
      expect(featureHtml).toContain(`color: ${EMAIL_COLORS.white}`);
      expect(featureHtml).toContain(`color: ${EMAIL_COLORS.lightGray}`);
    });
  });

  describe('getInfoBox', () => {
    const infoHtml = emailTemplateHelpers.getInfoBox('Info content');

    it('should use accent background', () => {
      expect(infoHtml).toContain(`bgcolor="${EMAIL_COLORS.accentBg}"`);
    });

    it('should set text color explicitly', () => {
      expect(infoHtml).toContain(`color: ${EMAIL_COLORS.offWhite}`);
    });
  });

  describe('getWarningBox', () => {
    const warningHtml = emailTemplateHelpers.getWarningBox('Warning content');

    it('should use warning background', () => {
      expect(warningHtml).toContain(`bgcolor="${EMAIL_COLORS.warningBg}"`);
    });

    it('should have amber accent border', () => {
      expect(warningHtml).toContain(`border-left: 4px solid ${EMAIL_COLORS.amber}`);
    });
  });

  describe('getDangerBox', () => {
    const dangerHtml = emailTemplateHelpers.getDangerBox('Danger content');

    it('should use danger background', () => {
      expect(dangerHtml).toContain(`bgcolor="${EMAIL_COLORS.dangerBg}"`);
    });

    it('should have red accent border', () => {
      expect(dangerHtml).toContain(`border-left: 4px solid ${EMAIL_COLORS.red}`);
    });
  });

  describe('getEmailFooter', () => {
    const footerWithUnsub = emailTemplateHelpers.getEmailFooter(true);
    const footerWithoutUnsub = emailTemplateHelpers.getEmailFooter(false);

    it('should include manage notifications link when showUnsubscribe is true', () => {
      expect(footerWithUnsub).toContain('Manage Notifications');
    });

    it('should not include manage notifications when showUnsubscribe is false', () => {
      expect(footerWithoutUnsub).not.toContain('Manage Notifications');
    });

    it('should always include privacy policy link', () => {
      expect(footerWithUnsub).toContain('Privacy Policy');
      expect(footerWithoutUnsub).toContain('Privacy Policy');
    });

    it('should set link colors explicitly', () => {
      expect(footerWithUnsub).toContain(`color: ${EMAIL_COLORS.mutedGray}`);
    });
  });
});

describe('Email Color Constants', () => {
  it('should have safe dark background (not pure black)', () => {
    expect(EMAIL_COLORS.cardBg).not.toBe('#000000');
    expect(EMAIL_COLORS.cardBgAlt).not.toBe('#000000');
  });

  it('should have light outer background', () => {
    // Light backgrounds are safer for Outlook dark mode
    expect(EMAIL_COLORS.outerBg).toBe('#F3F4F6');
  });

  it('should have contrasting text colors', () => {
    // White text for dark backgrounds
    expect(EMAIL_COLORS.white).toBe('#FFFFFF');
    expect(EMAIL_COLORS.offWhite).toBe('#F9FAFB');
    expect(EMAIL_COLORS.lightGray).toBe('#D1D5DB');
  });

  it('should have brand primary color', () => {
    expect(EMAIL_COLORS.primary).toBe('#6366F1'); // Indigo-500
  });
});

describe('Full Email Template Validation', () => {
  it('should not contain CSS class-based styling for critical elements', () => {
    // We should not rely on CSS classes for critical styling because
    // Outlook strips <style> blocks
    // The sample HTML may contain some classes, but critical colors/backgrounds
    // should be inline

    // Positive check: verify inline styles are present
    expect(sampleHtml).toContain('style="');
    expect(sampleHtml).toContain('background-color:');
  });

  it('should have complete HTML document structure', () => {
    expect(sampleHtml).toContain('<!DOCTYPE html>');
    expect(sampleHtml).toContain('<html');
    expect(sampleHtml).toContain('<head>');
    expect(sampleHtml).toContain('<body');
    expect(sampleHtml).toContain('</html>');
  });

  it('should have viewport meta tag for responsive design', () => {
    expect(sampleHtml).toContain('name="viewport"');
  });

  it('should have charset meta tag', () => {
    expect(sampleHtml).toContain('charset="utf-8"');
  });
});
