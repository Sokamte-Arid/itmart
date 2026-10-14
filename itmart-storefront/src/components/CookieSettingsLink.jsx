'use client';

import { useEffect, useState } from 'react';
import { TRACKING, anyTrackerConfigured, openConsentSettings } from '@/lib/analytics';

// Footer link that reopens the cookie banner, so visitors can change their mind.
// Shown once the page has loaded: the tracking IDs come from the admin
// settings, applied by <Analytics> while the page renders.
export default function CookieSettingsLink({ label, className }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the tracking config applied during render (module state)
    setShow(TRACKING.requireConsent && anyTrackerConfigured());
  }, []);

  if (!show) return null;
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {label}
    </button>
  );
}
