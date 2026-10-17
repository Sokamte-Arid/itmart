import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';
import Analytics from '@/components/Analytics';
import ScrollReveal from '@/components/ScrollReveal';
import { getDictionary, getLocale } from '@/lib/i18n';
import {
  getCategories,
  getTrackingSettings,
  getBranding,
  getStoreInfo,
  getDeliveryCities,
  getSeoSettings,
  imageUrl,
} from '@/lib/api';
import { WishlistProvider } from '@/context/WishlistContext';
import { SITE_URL, siteNameOf, homeTitleOf, homeDescriptionOf, organizationJsonLd, jsonLd } from '@/lib/seo';
import { StoreInfoProvider } from '@/context/StoreContext';
import { brandingCss, safeBrandingImage } from '@/lib/theme';

// Titles, description and Google verification come from the admin
// (Paramètres → Référencement); products and categories set their own.
export async function generateMetadata() {
  const [branding, seo, locale] = await Promise.all([getBranding(), getSeoSettings(), getLocale()]);
  const siteName = siteNameOf(seo);
  const icon = safeBrandingImage(branding?.iconUrl);
  const logo = safeBrandingImage(branding?.logoUrl);
  const description = homeDescriptionOf(seo, locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitleOf(seo, locale),
      template: `%s — ${siteName}`,
    },
    description,
    applicationName: siteName,
    openGraph: {
      type: 'website',
      siteName,
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      description,
      ...(logo ? { images: [{ url: imageUrl(logo) }] } : {}),
    },
    twitter: { card: 'summary_large_image' },
    ...(seo?.googleVerification ? { verification: { google: seo.googleVerification } } : {}),
    // Tab icon: the one uploaded in the admin (Identité visuelle), else IT Mart's
    icons: icon
      ? { icon: imageUrl(icon), apple: imageUrl(icon) }
      : { icon: '/itmart-icon.png', apple: '/itmart-icon.png' },
  };
}

export async function generateViewport() {
  const branding = await getBranding();
  return { themeColor: /^#[0-9a-fA-F]{6}$/.test(branding?.darkColor || '') ? branding.darkColor : '#1e2436' };
}

export default async function RootLayout({ children }) {
  const { locale, t } = await getDictionary();
  const [categories, trackingSettings, branding, storeInfo, deliveryCities, seo] = await Promise.all([
    getCategories(),
    getTrackingSettings(),
    getBranding(),
    getStoreInfo(),
    getDeliveryCities(),
    getSeoSettings(),
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
        {/* The shop for Google: name, logo, social pages */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationJsonLd({ seo, logoUrl, store: storeInfo }))} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip">
        <StoreInfoProvider value={storeInfo}>
          <CartProvider>
            <WishlistProvider>
            <Header dict={t} locale={locale} categories={categories} logoUrl={logoUrl} />
            <main className="flex-1">{children}</main>
            <Footer dict={t} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} store={storeInfo} deliveryCities={deliveryCities} />
            {/* WhatsApp chat button (the email button is kept in components/ if needed later) */}
            <FloatingWhatsAppButton label={t.footer.chatWhatsapp} locale={locale} />
            </WishlistProvider>
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
