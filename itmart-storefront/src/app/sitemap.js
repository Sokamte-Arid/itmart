import { getCategories, getProducts } from '@/lib/api';
import { SITE_URL } from '@/lib/seo';

// Every category (at any level) and every product, for Google.
// Submit https://<your-domain>/sitemap.xml in Google Search Console.
export const revalidate = 600;

const flatten = (nodes, out = []) => {
  for (const node of nodes || []) {
    out.push(node);
    flatten(node.children, out);
  }
  return out;
};

async function allProducts() {
  const products = [];
  for (let page = 1; page <= 50; page += 1) {
    const res = await getProducts({ limit: 100, page });
    products.push(...(res.data || []));
    if (!res.meta || page >= res.meta.pages) break;
  }
  return products;
}

export default async function sitemap() {
  const [categories, products] = await Promise.all([getCategories(), allProducts()]);

  const staticPages = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/track`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/returns`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages = flatten(categories).map((cat) => ({
    url: `${SITE_URL}/products?category=${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
