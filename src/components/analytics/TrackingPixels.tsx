/**
 * Tracking Pixels Component
 *
 * Loads all analytics scripts with optimized loading strategies:
 * - Google (GA4 + Ads): Single gtag.js load with lazyOnload
 * - FB Pixel: lazyOnload (lowest priority)
 *
 * Key optimizations:
 * - Loads gtag.js ONCE and configures both GA4 and Google Ads
 * - All scripts use lazyOnload to avoid blocking LCP
 *
 * Environment variables:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: Google Analytics 4 ID (G-XXXXXXXXX)
 * - NEXT_PUBLIC_FB_PIXEL_ID: Facebook Pixel ID
 * - NEXT_PUBLIC_GOOGLE_ADS_ID: Google Ads conversion ID (AW-XXXXXXXXX)
 */

'use client';

import Script from 'next/script';

export function TrackingPixels() {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  // Don't render if no tracking IDs configured
  if (!gaMeasurementId && !fbPixelId && !googleAdsId) return null;

  // Use GA4 ID for gtag.js, fall back to Google Ads ID
  const gtagId = gaMeasurementId || googleAdsId;

  return (
    <>
      {/* Google Analytics 4 + Google Ads - Single gtag.js load */}
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="lazyOnload"
          />
          <Script id="gtag-config" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${gaMeasurementId ? `gtag('config', '${gaMeasurementId}');` : ''}
              ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel - lazyOnload for performance */}
      {fbPixelId && (
        <>
          <Script id="fb-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
