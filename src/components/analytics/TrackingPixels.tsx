/**
 * Tracking Pixels Component
 *
 * Loads Facebook Pixel and Google Ads tracking scripts.
 * GA4 is already loaded in the layout head, but we can add Google Ads here.
 *
 * Environment variables:
 * - NEXT_PUBLIC_FB_PIXEL_ID: Facebook Pixel ID
 * - NEXT_PUBLIC_GOOGLE_ADS_ID: Google Ads conversion ID (AW-XXXXXXXXX)
 */

'use client';

import Script from 'next/script';

export function TrackingPixels() {
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  // Don't render if no tracking IDs configured
  if (!fbPixelId && !googleAdsId) return null;

  return (
    <>
      {/* Facebook Pixel */}
      {fbPixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
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

      {/* Google Ads (if separate from GA4) */}
      {googleAdsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('config', '${googleAdsId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
