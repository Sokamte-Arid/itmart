'use client';

import { TRACKING, anyTrackerConfigured, openConsentSettings } from '@/lib/analytics';

// Footer link that reopens the cookie banner, so visitors can change their mind.
export default function CookieSettingsLink({ label, className }) {
  if (!TRACKING.requireConsent || !anyTrackerConfigured()) return null;
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {label}
    </button>
  );
}
