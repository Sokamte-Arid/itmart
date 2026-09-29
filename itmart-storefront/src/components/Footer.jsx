import Link from 'next/link';
import { Cpu, Phone, Mail, Truck, ShieldCheck, MessageCircle, Wallet, HelpCircle, MapPin, PackageCheck } from 'lucide-react';

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

export default function Footer({ dict }) {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+237 6XX XXX XXX';
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@itmart.cm';
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const trustItems = [
    { icon: Truck, label: dict.footer.trustDelivery },
    { icon: ShieldCheck, label: dict.footer.trustGenuine },
    { icon: MessageCircle, label: dict.footer.trustSupport },
    { icon: Wallet, label: dict.footer.trustPayOnDelivery },
    { icon: HelpCircle, label: dict.footer.trustHelp, href: `mailto:${email}` },
  ];

  const socialLinks = [
    facebookUrl && { icon: FacebookIcon, href: facebookUrl, label: 'Facebook' },
    instagramUrl && { icon: InstagramIcon, href: instagramUrl, label: 'Instagram' },
    whatsappNumber && { icon: MessageCircle, href: `https://wa.me/${whatsappNumber}`, label: 'WhatsApp' },
  ].filter(Boolean);

  return (
    <footer className="bg-navy-950 text-white/70">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-white font-extrabold text-lg text-center mb-6">{dict.footer.trustTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {trustItems.map(({ icon: Icon, label, href }, i) => {
              const content = (
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon size={26} className="text-brand-500" strokeWidth={1.75} />
                  <span className="text-xs text-white/70">{label}</span>
                </div>
              );
              return href ? (
                <a key={i} href={href} className="hover:text-white transition-colors">
                  {content}
                </a>
              ) : (
                <div key={i}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery coverage */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-white font-extrabold text-lg text-center mb-6">{dict.footer.deliveryTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <MapPin size={28} className="text-brand-500 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-white font-semibold text-sm mb-1">{dict.footer.deliveryWhere}</p>
                <p className="text-sm text-white/70">{CITIES.join(', ')}...</p>
              </div>
            </div>
            <div className="flex gap-4">
              <PackageCheck size={28} className="text-brand-500 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-white font-semibold text-sm mb-1">{dict.footer.deliveryHow}</p>
                <p className="text-sm text-white/70">{dict.footer.deliveryHowText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand / Quick links / Legal / Contact — matches the reference layout:
          logo+tagline+socials on the left, link columns on the right. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
              <Cpu size={16} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg text-white">IT Mart</span>
          </div>
          <p className="text-sm text-white/70 max-w-xs mb-5">{dict.footer.about}</p>

          {socialLinks.length > 0 && (
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-brand-500 text-white flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-4">{dict.footer.quickLinks}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                {dict.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white transition-colors">
                {dict.nav.allProducts}
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-white transition-colors">
                {dict.nav.track}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-4">{dict.footer.legal || 'Legal'}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                {dict.footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-white transition-colors">
                {dict.footer.returns}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-4">{dict.footer.contact}</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0" /> {phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar — copyright left, legal links right, matching the reference */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>
            © {new Date().getFullYear()} IT Mart. {dict.footer.rights}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              {dict.footer.terms}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {dict.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}