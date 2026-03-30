import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type PillarProps = Record<string, unknown>;
let latestPillarProps: PillarProps | undefined;

vi.mock('@/components/seo/PillarPageShell', () => ({
  PillarPageShell: (props: PillarProps) => {
    latestPillarProps = props;
    return <div>{String(props.heroTitle ?? '')}</div>;
  },
}));

const getNodeText = (node: unknown) => renderToStaticMarkup(<>{node as React.ReactNode}</>);

describe('notice support pages', () => {
  beforeEach(() => {
    latestPillarProps = undefined;
  });

  it('keeps Section 8 as a support route that points broad users back to the owner page first', async () => {
    const pageModule = await import('@/app/section-8-notice/page');
    const Page = pageModule.default;

    renderToStaticMarkup(<Page />);

    expect(latestPillarProps?.primaryCta).toEqual({
      label: 'View England notice template',
      href: '/eviction-notice-template',
    });
    expect(latestPillarProps?.secondaryCta).toEqual({
      label: 'Start with Notice Only',
      href: '/products/notice-only',
    });
    expect(String(latestPillarProps?.heroSubtitle)).toContain('main live England possession route');
    expect(getNodeText((latestPillarProps?.quickAnswer as React.ReactNode[])[0])).toContain(
      '/eviction-notice-template'
    );
  });

  it('keeps Section 21 as a legacy bridge with exact dates and owner-first routing', async () => {
    const pageModule = await import('@/app/section-21-notice/page');
    const Page = pageModule.default;

    renderToStaticMarkup(<Page />);

    expect(latestPillarProps?.primaryCta).toEqual({
      label: 'View England notice template',
      href: '/eviction-notice-template',
    });
    expect(latestPillarProps?.secondaryCta).toEqual({
      label: 'See the Section 8 route',
      href: '/section-8-notice',
    });

    const quickAnswerMarkup = getNodeText((latestPillarProps?.quickAnswer as React.ReactNode[])[0]);
    expect(quickAnswerMarkup).toContain('1 May 2026');
    expect(quickAnswerMarkup).toContain('31 July 2026');
  });

  it('keeps the comparison page as support that routes back to the owner and Section 8', () => {
    const content = readFileSync(
      join(process.cwd(), 'src/app/section-21-vs-section-8/page.tsx'),
      'utf8'
    );

    expect(content).toContain('/eviction-notice-template');
    expect(content).toContain('/section-8-notice');
    expect(content).toContain('Section 21 is now mainly a legacy search term in England');
  });
});
