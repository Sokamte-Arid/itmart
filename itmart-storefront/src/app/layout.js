import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingEmailButton from '@/components/FloatingEmailButton';
import { getDictionary } from '@/lib/i18n';
import { getCategories } from '@/lib/api';

export const metadata = {
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

export default async function RootLayout({ children }) {
  const { locale, t } = await getDictionary();
  const categories = await getCategories();

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
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header dict={t} locale={locale} categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer dict={t} />
          <FloatingEmailButton label={t.footer.emailUs} />
        </CartProvider>
      </body>
    </html>
  );
}
