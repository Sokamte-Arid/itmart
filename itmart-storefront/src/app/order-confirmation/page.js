'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, Home } from 'lucide-react';
import { interpolate } from '@/lib/i18nHelpers';
import { useLocale } from '@/hooks/useLocale';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [order, setOrder] = useState(undefined); // undefined = loading, null = not found
  const autoOpened = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('itmart_last_order');
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from sessionStorage (external system), not derived render state
      setOrder(JSON.parse(stored));
    } else {
      setOrder(null);
    }
  }, []);

  useEffect(() => {
    if (order === null) {
      router.replace('/');
    }
  }, [order, router]);

  // Automatically open WhatsApp as soon as the order is confirmed — the
  // customer shouldn't need to click anything. Guarded to fire only once;
  // the button below stays as a fallback in case the browser's popup
  // blocker prevents the automatic open (common if it happens slightly
  // removed from the original click that triggered checkout).
  useEffect(() => {
    if (order && order.whatsappLink && !autoOpened.current) {
      autoOpened.current = true;
      window.open(order.whatsappLink, '_blank', 'noopener,noreferrer');
    }
  }, [order]);

  if (order === undefined || order === null) {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center text-ink-500">{t.common.loading}</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-success-600" />
      </div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2">{t.confirmation.title}</h1>
      <p className="text-ink-600 mb-1">
        {interpolate(t.confirmation.subtitle, { reference: order.reference })}
      </p>
      <p className="text-xs text-ink-400 font-mono mb-6">{order.reference}</p>

      <p className="text-xs text-ink-500 mb-3">{t.confirmation.autoOpenNote}</p>

      <a
        href={order.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold rounded-full py-3.5 px-6 transition-colors mb-3"
      >
        <MessageCircle size={18} />
        {t.confirmation.whatsappButton}
      </a>

      <p className="text-xs text-ink-500 mb-8">{t.confirmation.emailNote}</p>

      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
        <Home size={14} /> {t.confirmation.backHome}
      </Link>
    </div>
  );
}
