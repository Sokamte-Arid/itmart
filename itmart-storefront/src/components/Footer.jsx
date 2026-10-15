import Link from 'next/link';
import CookieSettingsLink from './CookieSettingsLink';
import { imageUrl } from '@/lib/api';
import { Cpu, Phone, Mail, Truck, ShieldCheck, MessageCircle, Wallet, MapPin, Music2 } from 'lucide-react';

// Shown only while no delivery zone exists yet (admin → Zones de livraison)
const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua'];

// lucide-react no longer ships brand/logo icons (Facebook, Instagram, etc.),
// only generic UI icons — so these two are small inline SVGs instead.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.48 17.52 2 11.94 2S1.88 6.48 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.42V9.85c0-2.39 1.42-3.71 3.6-3.71 1.04 0 2.13.19 2.13.19v2.35h-1.2c-1.18 0-1.55.74-1.55 1.49v1.79h2.64l-.42 2.91h-2.22V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// logoUrl: the shop logo uploaded in the admin (Identité visuelle), if any
// logoDarkUrl: optional version made for dark backgrounds — shown as is,
//   without the white card
// store: contact details and social links (admin → Boutique & contact)
// deliveryCities: active delivery zones (admin → Zones de livraison)
export default function Footer({ dict, logoUrl = null, logoDarkUrl = null, store = {}, deliveryCities = [] }) {
  const { whatsappNumber, facebookUrl, instagramUrl, tiktokUrl } = store;
  const email = store.contactEmail;
  // Phone shown in the footer: the one entered, else the WhatsApp number
  const phone = store.contactPhone || (whatsappNumber ? `+${whatsappNumber}` : '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const cities = deliveryCities.length ? deliveryCities.slice(0, 6) : CITIES;
  const moreCities = deliveryCities.length > 6 || !deliveryCities.length;

  const trustItems = [
    { icon: Truck, label: dict.footer.trustDelivery },
    { icon: ShieldCheck, label: dict.footer.trustGenuine },
    { icon: MessageCircle, label: dict.footer.trustSupport },
    { icon: Wallet, label: dict.footer.trustPayOnDelivery },
  ];

  const socialLinks = [
    facebookUrl && { icon: FacebookIcon, href: facebookUrl, label: 'Facebook' },
    instagramUrl && { icon: InstagramIcon, href: instagramUrl, label: 'Instagram' },
    tiktokUrl && { icon: Music2, href: tiktokUrl, label: 'TikTok' },
    whatsappLink && { icon: MessageCircle, href: whatsappLink, label: 'WhatsApp' },
  ].filter(Boolean);

  const linkClass = 'hover:text-white transition-colors';

  return (
    <footer className="bg-navy-950 text-white/70 text-sm">
      {/* Promises: one compact row (2 × 2 on phones) */}
      <div className="border-b border-white/10">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <Icon size={18} className="text-brand-500 shrink-0" strokeWidth={1.75} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Shop / links / legal / contact. Phones: links and legal side by side */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-x-6 gap-y-6">
        <div className="col-span-2 lg:col-span-1">
          {logoDarkUrl ? (
            // Version made for dark backgrounds: shown as is
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(logoDarkUrl)} alt="IT Mart" className="h-9 w-auto max-w-[180px] object-contain mb-2.5" />
          ) : logoUrl ? (
            // Regular logo on a small white card, so a dark logo stays visible
            <div className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 mb-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(logoUrl)} alt="IT Mart" className="h-7 w-auto max-w-[160px] object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Cpu size={16} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-lg text-white">IT Mart</span>
            </div>
          )}
          <p className="max-w-xs">{dict.footer.about}</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-white/60">
            <MapPin size={14} className="text-brand-500 shrink-0 mt-px" />
            <span>
              {dict.footer.deliveryWhere} : {cities.join(', ')}
              {moreCities ? '…' : ''}
            </span>
          </p>

          {socialLinks.length > 0 && (
            <div className="flex gap-2 mt-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-brand-500 text-white flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2.5">{dict.footer.quickLinks}</h3>
          <ul className="space-y-1.5">
            <li>
              <Link href="/" className={linkClass}>
                {dict.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/products" className={linkClass}>
                {dict.nav.allProducts}
              </Link>
            </li>
            <li>
              <Link href="/track" className={linkClass}>
                {dict.nav.track}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2.5">{dict.footer.legal || 'Legal'}</h3>
          <ul className="space-y-1.5">
            <li>
              <Link href="/terms" className={linkClass}>
                {dict.footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClass}>
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/returns" className={linkClass}>
                {dict.footer.returns}
              </Link>
            </li>
            <li>
              <CookieSettingsLink label={dict.footer.cookieSettings} className={`${linkClass} text-left`} />
            </li>
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h3 className="text-white font-semibold mb-2.5">{dict.footer.contact}</h3>
          {/* Phones: contacts on one line to save height */}
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 lg:block lg:space-y-1.5">
            {whatsappLink && (
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="shrink-0" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
            )}
            {phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2 min-w-0">
                <Mail size={14} className="shrink-0" />
                <a href={`mailto:${email}`} className={`${linkClass} truncate`}>
                  {email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Copyright. Extra room on the right so the WhatsApp button doesn't cover it */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 pr-20 sm:pr-56 text-xs text-white/50">
          © {new Date().getFullYear()} IT Mart. {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
