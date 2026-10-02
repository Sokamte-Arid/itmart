'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  TRACKING,
  anyTrackerConfigured,
  getConsent,
  setConsent,
  trackPageView,
  CONSENT_EVENT,
  OPEN_CONSENT_EVENT,
} from '@/lib/analytics';

// Loads the tracking scripts (only those with an ID in .env, and only after
// consent when consent is required) and records a page view on every
// navigation. Rendered once, in the root layout.
export default function Analytics({ dict }) {
  const [consent, setConsentState] = useState(null);
  const [asked, setAsked] = useState(true); // assume answered until we can read storage
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const c = getConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading saved consent from localStorage (external system)
    setConsentState(c);
    setAsked(c !== null);
    const onChange = (e) => {
      setConsentState(e.detail);
      setAsked(true);
      setBannerOpen(false);
    };
    const onOpen = () => setBannerOpen(true);
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
    };
  }, []);

  if (!anyTrackerConfigured()) return null;

  const enabled = consent === 'granted';
  const showBanner = TRACKING.requireConsent && (!asked || bannerOpen);
  const googleIds = [TRACKING.gaId, TRACKING.googleAdsId].filter(Boolean);

  return (
    <>
      {enabled && TRACKING.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${TRACKING.metaPixelId}');`}
        </Script>
      )}

      {enabled && googleIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleIds[0]}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${googleIds.map((id) => `gtag('config', '${id}');`).join('\n')}`}
          </Script>
        </>
      )}

      {enabled && TRACKING.clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${TRACKING.clarityId}");`}
        </Script>
      )}

      {enabled && (
        // useSearchParams needs a Suspense boundary in the App Router
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      )}

      {showBanner && <ConsentBanner dict={dict} />}
    </>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef(null);

  useEffect(() => {
    const url = `${pathname}?${searchParams.toString()}`;
    if (last.current === url) return;
    last.current = url;
    // Small delay so the pixel's init (queued by its snippet) runs first
    const id = setTimeout(trackPageView, 50);
    return () => clearTimeout(id);
  }, [pathname, searchParams]);

  return null;
}

function ConsentBanner({ dict }) {
  const c = dict?.consent || {};
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={c.title || 'Cookies'}
      className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-[60] bg-white border border-ink-300/40 rounded-2xl shadow-xl p-4"
    >
      <p className="font-semibold text-navy-900 text-sm mb-1">{c.title || 'Cookies'}</p>
      <p className="text-xs text-ink-500 leading-relaxed mb-3">
        {c.text}{' '}
        <Link href="/privacy" className="underline hover:text-brand-600">
          {c.learnMore}
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConsent('denied')}
          className="flex-1 rounded-full border border-ink-300 py-2 text-sm font-medium text-ink-700 hover:bg-ink-300/20"
        >
          {c.decline}
        </button>
        <button
          onClick={() => setConsent('granted')}
          className="flex-1 rounded-full bg-brand-600 hover:bg-brand-500 py-2 text-sm font-semibold text-white"
        >
          {c.accept}
        </button>
      </div>
    </div>
  );
}
