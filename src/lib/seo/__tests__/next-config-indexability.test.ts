import { describe, expect, it } from 'vitest';

describe('Next config indexability rules', () => {
  it('adds X-Robots-Tag headers to official form PDFs only', async () => {
    const nextConfig = (await import('../../../../next.config.mjs')).default;
    const headers = await nextConfig.headers();

    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/official-forms/:path*',
          headers: expect.arrayContaining([
            { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          ]),
        }),
      ])
    );
    expect(headers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/favicon.ico',
        }),
      ])
    );
  });

  it('bundles official form PDFs with API functions that fill generated documents', async () => {
    const nextConfig = (await import('../../../../next.config.mjs')).default;

    expect(nextConfig.outputFileTracingIncludes).toMatchObject({
      '/api/**': expect.arrayContaining([
        './public/official-forms/**/*',
        './artifacts/update/Form_3A_legal_wording_for_possession_grounds.pdf',
        './artifacts/update/Form_3A_guidance_for_landlords.pdf',
      ]),
    });
  });

  it('keeps GSC crawl-waste legacy routes as permanent redirects', async () => {
    const nextConfig = (await import('../../../../next.config.mjs')).default;
    const redirects = await nextConfig.redirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/products/rent-tracker',
          destination: '/pricing',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/section-21-court-pack',
          destination: '/products/complete-pack',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements',
          destination: '/tenancy-agreement-template-uk',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements/wales',
          destination: '/wales-tenancy-agreement-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements/scotland',
          destination: '/private-residential-tenancy-agreement-template',
          permanent: true,
        }),
      ])
    );
  });
});
