'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { buildGeneralWhatsAppLink } from '@/lib/contact';
import { trackContact } from '@/lib/analytics';
import { useStoreInfo } from '@/context/StoreContext';

// Floating "chat with us on WhatsApp" button, bottom-right of every page.
// Hidden on the checkout and confirmation pages, which already end in WhatsApp.
export default function FloatingWhatsAppButton({ label, locale }) {
  const pathname = usePathname();
  const { whatsappNumber } = useStoreInfo();
  if (!whatsappNumber) return null;
  if (pathname?.startsWith('/checkout') || pathname?.startsWith('/order-confirmation')) return null;

  // Built on click: the message includes the page the customer is looking at
  const handleClick = () => {
    trackContact('whatsapp');
    window.open(buildGeneralWhatsAppLink(locale, whatsappNumber), '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white p-3.5 sm:pl-4 sm:pr-5 sm:py-3 rounded-full shadow-lg transition-colors"
    >
      <MessageCircle size={22} />
      <span className="text-sm font-semibold hidden sm:inline">{label}</span>
    </button>
  );
}
