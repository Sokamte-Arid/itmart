// Everything that makes the admin behave like a phone app:
// service worker registration, the "Install app" prompt, and push notifications.
import { useEffect, useState, useSyncExternalStore } from 'react';
import * as pushApi from '../api/push';

// ---------------------------------------------------------------------------
// Service worker
// ---------------------------------------------------------------------------
export function registerServiceWorker() {
  // Service workers only run on HTTPS or localhost ("secure context")
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[pwa] Service worker registration failed:', err);
    });
  });
}

// ---------------------------------------------------------------------------
// Install prompt (Android / desktop Chrome & Edge)
// The browser fires `beforeinstallprompt` once, early — so we capture it at
// startup and keep it until the admin taps "Install".
// ---------------------------------------------------------------------------
let deferredPrompt = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit();
  });
}

const subscribeInstall = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function useInstallApp() {
  const prompt = useSyncExternalStore(subscribeInstall, () => deferredPrompt);
  const installed = isStandalone();

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    emit();
    return outcome === 'accepted';
  };

  return {
    installed,
    canInstall: !installed && !!prompt,
    // iPhone has no install prompt: the admin must use Share → Add to Home Screen
    showIOSHint: !installed && isIOS(),
    install,
  };
}

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------
const urlBase64ToUint8Array = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushSupported = () =>
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

async function getCurrentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Turns notifications on for this device. Throws an Error whose message is an i18n key. */
export async function enablePush(lang) {
  if (!pushSupported()) throw new Error('pwa.errors.unsupported');

  const { data } = await pushApi.getPushPublicKey();
  if (!data?.enabled) throw new Error('pwa.errors.serverNotConfigured');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('pwa.errors.permissionDenied');

  const reg = await navigator.serviceWorker.ready;
  const key = urlBase64ToUint8Array(data.publicKey);

  let sub = await reg.pushManager.getSubscription();
  // A subscription made with an old server key can't receive anything — replace it
  if (sub) {
    const current = sub.options?.applicationServerKey && new Uint8Array(sub.options.applicationServerKey);
    const sameKey = current && current.length === key.length && current.every((b, i) => b === key[i]);
    if (!sameKey) {
      await sub.unsubscribe();
      sub = null;
    }
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }

  await pushApi.subscribePush(sub.toJSON(), lang);
  return true;
}

/** Turns notifications off for this device (server first, while we still have the token). */
export async function disablePush() {
  const sub = await getCurrentSubscription();
  if (!sub) return;
  await pushApi.unsubscribePush(sub.endpoint).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

/** Keeps notification language in sync with the app language. */
export async function syncPushLanguage(lang) {
  const sub = await getCurrentSubscription().catch(() => null);
  if (sub && Notification.permission === 'granted') {
    await pushApi.subscribePush(sub.toJSON(), lang).catch(() => {});
  }
}

export function usePushNotifications() {
  const supported = pushSupported();
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getCurrentSubscription()
      .then((sub) => alive && setSubscribed(!!sub && Notification.permission === 'granted'))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const run = async (fn) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
      if (supported) setPermission(Notification.permission);
    }
  };

  return {
    supported,
    permission,
    subscribed,
    busy,
    enable: (lang) =>
      run(async () => {
        await enablePush(lang);
        setSubscribed(true);
      }),
    disable: () =>
      run(async () => {
        await disablePush();
        setSubscribed(false);
      }),
    sendTest: () => run(() => pushApi.sendTestPush()),
  };
}

/** Calls `handler(payload)` whenever a push arrives while the app is open. */
export function usePushMessages(handler) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    const onMessage = (e) => {
      if (e.data?.type === 'push') handler(e.data.payload || {});
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [handler]);
}
