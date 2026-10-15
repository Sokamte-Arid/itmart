import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';
import Analytics from '@/components/Analytics';
import ScrollReveal from '@/components/ScrollReveal';
import { getDictionary } from '@/lib/i18n';
import { getCategories, getTrackingSettings, getBranding, getStoreInfo, getDeliveryCities, imageUrl } from '@/lib/api';
import { StoreInfoProvider } from '@/context/StoreContext';
import { brandingCss, safeBrandingImage } from '@/lib/theme';

const baseMetadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'IT Mart — IT Equipment in Cameroon',
    template: '%s — IT Mart',
  },
  description:
    'Laptops, accessories, networking gear and more, delivered across Cameroon. Genuine products, honest prices.',
  openGraph: {
    type: 'website',
    siteName: 'IT Mart',
    locale: 'fr_CM',
  },
};

// The shop's icon (admin → Identité visuelle) in the browser tab and on
// phone home screens, when one has been uploaded.
export async function generateMetadata() {
  const branding = await getBranding();
  const icon = safeBrandingImage(branding?.iconUrl);
  if (!icon) return baseMetadata;
  return { ...baseMetadata, icons: { icon: imageUrl(icon), apple: imageUrl(icon) } };
}

export async function generateViewport() {
  const branding = await getBranding();
  return { themeColor: /^#[0-9a-fA-F]{6}$/.test(branding?.darkColor || '') ? branding.darkColor : '#1e2436' };
}

export default async function RootLayout({ children }) {
  const { locale, t } = await getDictionary();
  const [categories, trackingSettings, branding, storeInfo, deliveryCities] = await Promise.all([
    getCategories(),
    getTrackingSettings(),
    getBranding(),
    getStoreInfo(),
    getDeliveryCities(),
  ]);
  const themeCss = brandingCss(branding);
  const logoUrl = safeBrandingImage(branding?.logoUrl);
  const logoDarkUrl = safeBrandingImage(branding?.logoDarkUrl);

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this rule targets the Pages Router's pages/_document.js; a <link> in the App Router root layout is the correct pattern, used here instead of next/font/google to avoid a build-time fetch to Google's font CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Shop colours chosen in the admin (only #RRGGBB values, see lib/theme.js) */}
        {themeCss && <style id="brand-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip">
        <StoreInfoProvider value={storeInfo}>
          <CartProvider>
            <Header dict={t} locale={locale} categories={categories} logoUrl={logoUrl} />
            <main className="flex-1">{children}</main>
            <Footer dict={t} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} store={storeInfo} deliveryCities={deliveryCities} />
            {/* WhatsApp chat button (the email button is kept in components/ if needed later) */}
            <FloatingWhatsAppButton label={t.footer.chatWhatsapp} locale={locale} />
          </CartProvider>
        </StoreInfoProvider>
        {/* Facebook Pixel / Google tag / Clarity — IDs entered in the admin (Suivi & publicité) */}
        <Analytics dict={t} settings={trackingSettings} />
        {/* Sections and product cards fade in as you scroll */}
        <ScrollReveal />
      </body>
    </html>
  );
}
