import { getCategories, getProducts } from '@/lib/api';

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const [categories, productsRes] = await Promise.all([
    getCategories(),
    getProducts({ limit: 100 }), // Next.js caps individual sitemaps at 50k entries; fine for now
  ]);

  const staticPages = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/track`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/returns`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${siteUrl}/products?category=${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages = productsRes.data.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
