declare module '*.css';

// Module declarations for packages with bundler moduleResolution issues
declare module '@vercel/analytics/next' {
  import type { FC } from 'react';
  export const Analytics: FC<{
    mode?: 'auto' | 'development' | 'production';
    debug?: boolean;
    beforeSend?: (event: { type: string; url: string }) => object | null;
  }>;
}

declare module '@vercel/analytics' {
  export function track(
    eventName: string,
    properties?: Record<string, string | number | boolean | null>
  ): void;
}

declare module '@sparticuz/chromium' {
  const chromium: {
    args: string[];
    defaultViewport: { width: number; height: number };
    executablePath: (path?: string) => Promise<string>;
    headless: boolean | 'shell';
    setHeadlessMode: boolean;
    setGraphicsMode: boolean;
  };
  export default chromium;
}
