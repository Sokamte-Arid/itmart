const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendLowStockAlertEmail } = require('../utils/mailer');
const { notifyLowStock } = require('../utils/push');
const { stripCostPrice, stripCostPriceFromList } = require('../utils/sanitizeProduct');
const { normaliseVariants } = require('../utils/variants');
const { getLowStockThreshold } = require('../utils/storeSettings');
const { loadAllCategories, descendantIds } = require('../utils/categoryTree');

// What the product cards need to know about variants: whether there are any
// (the card's cart button then opens the product page to choose) and the
// colours, shown as small dots.
const CARD_VARIANTS = {
  select: { id: true, colorName: true, colorHex: true, size: true, stock: true },
  orderBy: { sortOrder: 'asc' },
};

// Full variant data for the product page and the admin form
const FULL_VARIANTS = { orderBy: { sortOrder: 'asc' } };

const { pickSeoFields } = require('../utils/seo');

const cleanSizeLabel = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, 30) : null;
};

// Short description: trimmed, empty → null, never longer than the column (200)
const SHORT_DESCRIPTION_MAX = 200;
const cleanShort = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, SHORT_DESCRIPTION_MAX) : null;
};

// Auto-generates a readable SKU when the admin leaves the field blank, e.g.
// "HP EliteBook 840" -> "HPE-4K7X9B". The random suffix makes a collision
// astronomically unlikely, so no uniqueness retry loop is needed in practice.
function generateSku(nameEn) {
  const prefix =
    (nameEn || 'SKU')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${suffix}`;
}

// ---------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ---------------------------------------------------------------------------

/**
 * GET /api/products
 * Supports: category (slug), brand (slug), search (q), minPrice, maxPrice,
 * bestSeller, discounted, attr[<attributeId>]=value (repeatable), page, limit
 *
 * This single endpoint powers the catalog grid, category pages, search
 * results, and filter sidebar all at once.
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    q,
    minPrice,
    maxPrice,
    bestSeller,
    discounted,
    page = 1,
    limit = 20,
    sort = 'newest',
  } = req.query;

  const where = { isActive: true };

  if (category) {
    // Browsing a category shows its own products AND those of all its
    // subcategories, at every level below it — it only narrows once the
    // customer drills into a more precise subcategory.
    const all = await loadAllCategories();
    const categoryRecord = all.find((c) => c.slug === category);
    if (categoryRecord) {
      where.categoryId = { in: descendantIds(all, categoryRecord.id) };
    } else {
      // Unknown slug — fall back to a filter that matches nothing rather
      // than silently ignoring an invalid category and showing everything.
      where.categoryId = '__none__';
    }
  }
  if (brand) where.brand = { slug: brand };
  if (bestSeller === 'true') where.isBestSeller = true;
  if (discounted === 'true') where.discountPrice = { not: null };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (q) {
    where.OR = [
      { nameEn: { contains: q, mode: 'insensitive' } },
      { nameFr: { contains: q, mode: 'insensitive' } },
      { shortDescriptionEn: { contains: q, mode: 'insensitive' } },
      { shortDescriptionFr: { contains: q, mode: 'insensitive' } },
      { descriptionEn: { contains: q, mode: 'insensitive' } },
      { descriptionFr: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Dynamic attribute filters: ?attr[<attributeId>]=16GB&attr[<attributeId2>]=Black
  const attrFilters = req.query.attr;
  if (attrFilters && typeof attrFilters === 'object') {
    where.AND = Object.entries(attrFilters).map(([attributeId, value]) => ({
      attributeValues: { some: { attributeId, value: String(value) } },
    }));
  }

  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Number(page) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        category: true,
        variants: CARD_VARIANTS,
      },
      orderBy,
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: stripCostPriceFromList(items),
    meta: { total, page: Number(page), limit: take, pages: Math.ceil(total / take) },
  });
});

// GET /api/products/random  (public — a random selection, changes every call)
const getRandomProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 20);

  // Pull a reasonably large active pool, then shuffle in JS (Fisher–Yates).
  // Simpler and more portable than DB-level ORDER BY RANDOM(), and plenty
  // fast at catalog sizes this store will realistically have.
  const pool = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: 'asc' } }, brand: true, category: true, variants: CARD_VARIANTS },
    take: 100,
  });

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  res.json({ success: true, data: stripCostPriceFromList(pool.slice(0, limit)) });
});

// GET /api/products/search-suggestions?q=  (lightweight, for live dropdown)
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ success: true, data: [] });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameFr: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 8,
  });

  res.json({ success: true, data: stripCostPriceFromList(products) });
});

// GET /api/products/:slug  (public — product detail page)
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: FULL_VARIANTS,
      brand: true,
      category: true,
      // In the order set in the admin (Catégories → characteristics ↑↓)
      attributeValues: { include: { attribute: true }, orderBy: { attribute: { sortOrder: 'asc' } } },
      relatedFrom: {
        orderBy: { sortOrder: 'asc' },
        include: {
          relatedProduct: {
            include: { images: { where: { isPrimary: true }, take: 1 }, variants: CARD_VARIANTS },
          },
        },
      },
    },
  });
  // Treat a deactivated product (out of stock / pulled by the admin) the
  // same as a nonexistent one on the storefront — it should disappear
  // entirely, even for someone hitting the direct URL. The admin dashboard
  // still sees it via getProductById below, which has no isActive check.
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found.');

  // Admin-curated cross-sells (e.g. printer -> ink, paper, cable), distinct
  // from the automatic "same category" related products the storefront
  // shows separately further down the page.
  const curatedRelated = stripCostPriceFromList(
    product.relatedFrom.filter((r) => r.relatedProduct.isActive).map((r) => r.relatedProduct)
  );

  const { relatedFrom, ...productWithoutJoinTable } = product;

  res.json({
    success: true,
    data: {
      ...stripCostPrice(productWithoutJoinTable),
      curatedRelated,
    },
  });
});

// GET /api/products/id/:id  (admin — product detail by id, for edit forms)
const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: FULL_VARIANTS,
      brand: true,
      category: true,
      attributeValues: { include: { attribute: true } },
    },
  });
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ success: true, data: product });
});

// ---------------------------------------------------------------------------
// ADMIN ENDPOINTS
// ---------------------------------------------------------------------------

// POST /api/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    sku,
    categoryId,
    brandId,
    nameEn,
    nameFr,
    shortDescriptionEn,
    shortDescriptionFr,
    descriptionEn,
    descriptionFr,
    price,
    costPrice,
    discountPrice,
    stock,
    isBestSeller,
    variantSizeLabel,
    attributes, // [{ attributeId, value, hexValue? }]
  } = req.body;

  if (!categoryId || !nameEn || !nameFr || price === undefined) {
    throw new ApiError(400, 'categoryId, nameEn, nameFr and price are required.');
  }

  const finalSku = sku && sku.trim() ? sku.trim() : generateSku(nameEn);
  const slug = slugify(`${nameEn}-${finalSku}`, { lower: true, strict: true });

  const product = await prisma.product.create({
    data: {
      sku: finalSku,
      slug,
      category: { connect: { id: categoryId } },
      brand: brandId ? { connect: { id: brandId } } : undefined,
      nameEn,
      nameFr,
      shortDescriptionEn: cleanShort(shortDescriptionEn),
      shortDescriptionFr: cleanShort(shortDescriptionFr),
      descriptionEn,
      descriptionFr,
      price,
      costPrice: costPrice || null,
      discountPrice: discountPrice || null,
      stock: stock ?? 0,
      variantSizeLabel: cleanSizeLabel(variantSizeLabel),
      isBestSeller: !!isBestSeller,
      ...pickSeoFields(req.body, {}, { keyword: true }),
      attributeValues: attributes?.length
        ? {
            create: attributes.map((a) => ({
              attributeId: a.attributeId,
              value: String(a.value),
              hexValue: a.hexValue || null,
            })),
          }
        : undefined,
    },
    include: { attributeValues: true, images: true },
  });

  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id  (admin)
// PUT /api/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const {
    categoryId,
    brandId,
    nameEn,
    nameFr,
    shortDescriptionEn,
    shortDescriptionFr,
    descriptionEn,
    descriptionFr,
    price,
    costPrice,
    discountPrice,
    stock,
    isBestSeller,
    isActive,
    variantSizeLabel,
  } = req.body;

  const data = {};
  if (categoryId) data.category = { connect: { id: categoryId } };
  if (brandId !== undefined) data.brand = brandId ? { connect: { id: brandId } } : { disconnect: true };

  if (nameEn) data.nameEn = nameEn;
  if (nameFr) data.nameFr = nameFr;
  if (shortDescriptionEn !== undefined) data.shortDescriptionEn = cleanShort(shortDescriptionEn);
  if (shortDescriptionFr !== undefined) data.shortDescriptionFr = cleanShort(shortDescriptionFr);
  if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
  if (descriptionFr !== undefined) data.descriptionFr = descriptionFr;
  if (price !== undefined) data.price = price;
  if (costPrice !== undefined) data.costPrice = costPrice || null;
  if (discountPrice !== undefined) data.discountPrice = discountPrice || null;
  if (variantSizeLabel !== undefined) data.variantSizeLabel = cleanSizeLabel(variantSizeLabel);
  // With variants, the stock is the total of the variants' stock — it's
  // changed per variant (PUT /:id/variants), never directly.
  if (stock !== undefined) {
    const variantCount = await prisma.productVariant.count({ where: { productId: req.params.id } });
    if (variantCount === 0) data.stock = stock;
  }
  if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
  if (isActive !== undefined) data.isActive = isActive;
  pickSeoFields(req.body, data, { keyword: true });

  // Capture stock before the update, so we can tell if this save is what
  // crossed it into low-stock territory (vs. it already being low).
  const before = data.stock !== undefined ? await prisma.product.findUnique({ where: { id: req.params.id } }) : null;

  const product = await prisma.product.update({ where: { id: req.params.id }, data });

  const threshold = await getLowStockThreshold();
  if (before && before.stock > threshold && product.stock <= threshold) {
    sendLowStockAlertEmail(product).catch((err) =>
      console.error('[product] Failed to send low-stock alert email:', err.message)
    );
    notifyLowStock(product).catch((err) =>
      console.error('[product] Failed to send low-stock push notification:', err.message)
    );
  }

  res.json({ success: true, data: product });
});

// GET /api/products/low-stock  (admin — products at or below the threshold, for the dashboard)
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = await getLowStockThreshold();
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { lte: threshold } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { stock: 'asc' },
    take: 20,
  });
  res.json({ success: true, data: products, meta: { threshold } });
});

// DELETE /api/products/:id  (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // A product that has already been ordered can't be hard-deleted — doing so
  // would either fail on the order_items foreign key (as it just did) or,
  // worse, silently corrupt past order history. Instead, tell the admin to
  // deactivate it: it disappears from the storefront (see getProductBySlug
  // above) but stays intact for any order that references it, and the admin
  // can reactivate it later once stock is renewed.
  const hasOrders = await prisma.orderItem.findFirst({
    where: { productId: id },
    select: { id: true },
  });

  if (hasOrders) {
    throw new ApiError(
      409,
      "Ce produit apparaît dans des commandes passées et ne peut pas être supprimé. Désactivez-le à la place — il disparaîtra de la boutique tout en gardant l'historique des commandes intact."
    );
  }

  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Product deleted.' });
});

// POST /api/products/:id/duplicate  (admin) — clone a product as a starting
// point for a similar one (same category/brand/specs/images), so the admin
// only needs to change what's different (name, price, stock, one spec...).
const duplicateProduct = asyncHandler(async (req, res) => {
  const source = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      attributeValues: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!source) throw new ApiError(404, 'Product not found.');

  // Generate a unique SKU/slug so the copy never collides with the original
  const shortId = Math.random().toString(36).slice(2, 7).toUpperCase();
  const newSku = `${source.sku}-COPY-${shortId}`;
  const newSlug = slugify(`${source.nameEn}-copy-${shortId}`, { lower: true, strict: true });

  const duplicate = await prisma.product.create({
    data: {
      sku: newSku,
      slug: newSlug,
      category: { connect: { id: source.categoryId } },
      brand: source.brandId ? { connect: { id: source.brandId } } : undefined,
      nameEn: `${source.nameEn} (Copy)`,
      nameFr: `${source.nameFr} (Copie)`,
      shortDescriptionEn: source.shortDescriptionEn,
      shortDescriptionFr: source.shortDescriptionFr,
      descriptionEn: source.descriptionEn,
      descriptionFr: source.descriptionFr,
      price: source.price,
      costPrice: source.costPrice,
      discountPrice: source.discountPrice,
      stock: 0, // a duplicate is a new listing, not the same physical stock — admin sets the real quantity
      variantSizeLabel: source.variantSizeLabel,
      seoKeyword: source.seoKeyword,
      isBestSeller: false, // best-seller status shouldn't carry over automatically
      isActive: true,
      attributeValues: {
        create: source.attributeValues.map((av) => ({
          attributeId: av.attributeId,
          value: av.value,
          hexValue: av.hexValue,
        })),
      },
      images: {
        create: source.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary, sortOrder: img.sortOrder })),
      },
    },
    include: { attributeValues: true, images: { orderBy: { sortOrder: 'asc' } }, category: true, brand: true },
  });

  // Same colours / sizes, stock 0, each colour keeping the matching photo of the copy
  if (source.variants.length > 0) {
    const imageMap = Object.fromEntries(source.images.map((img, i) => [img.id, duplicate.images[i]?.id]));
    await prisma.productVariant.createMany({
      data: source.variants.map((v) => ({
        productId: duplicate.id,
        colorName: v.colorName,
        colorHex: v.colorHex,
        size: v.size,
        sku: null, // references must stay unique
        stock: 0,
        imageId: (v.imageId && imageMap[v.imageId]) || null,
        sortOrder: v.sortOrder,
      })),
    });
  }

  res.status(201).json({ success: true, data: duplicate });
});

// PUT /api/products/:id/attributes  (admin) — replace the full spec set at once
const setProductAttributes = asyncHandler(async (req, res) => {
  const { attributes } = req.body; // [{ attributeId, value, hexValue? }]
  if (!Array.isArray(attributes)) throw new ApiError(400, 'attributes must be an array.');

  await prisma.productAttributeValue.deleteMany({ where: { productId: req.params.id } });
  await prisma.productAttributeValue.createMany({
    data: attributes.map((a) => ({
      productId: req.params.id,
      attributeId: a.attributeId,
      value: String(a.value),
      hexValue: a.hexValue || null,
    })),
  });

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { attributeValues: { include: { attribute: true } } },
  });
  res.json({ success: true, data: product });
});

// PUT /api/products/:id/variants  (admin) — replace the full variant list at once
// body: { variants: [{ id?, colorName?, colorHex?, size?, sku?, stock, imageId? }], lang? }
// An empty list removes all variants (the product goes back to a single stock).
const setProductVariants = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: { select: { id: true } }, variants: { select: { id: true } } },
  });
  if (!product) throw new ApiError(404, 'Product not found.');

  const variants = normaliseVariants(req.body.variants, {
    ApiError,
    imageIds: new Set(product.images.map((i) => i.id)),
    lang,
  });
  const existingIds = new Set(product.variants.map((v) => v.id));
  const keepIds = new Set(variants.filter((v) => v.id && existingIds.has(v.id)).map((v) => v.id));

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      // Removed variants (past orders keep their colour / size text)
      await tx.productVariant.deleteMany({ where: { productId: product.id, id: { notIn: [...keepIds] } } });

      for (const { id, ...fields } of variants) {
        if (id && keepIds.has(id)) {
          await tx.productVariant.update({ where: { id }, data: fields });
        } else {
          await tx.productVariant.create({ data: { ...fields, productId: product.id } });
        }
      }

      const data = {};
      if (variants.length > 0) data.stock = variants.reduce((sum, v) => sum + v.stock, 0);
      if (req.body.variantSizeLabel !== undefined) data.variantSizeLabel = cleanSizeLabel(req.body.variantSizeLabel);
      return tx.product.update({
        where: { id: product.id },
        data,
        include: { variants: FULL_VARIANTS },
      });
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ApiError(
        409,
        lang === 'en'
          ? 'One of the variant references (SKU) is already used by another product.'
          : "Une des références (SKU) de variante est déjà utilisée par un autre produit."
      );
    }
    throw err;
  }

  // Same low-stock alert as a manual stock change
  const threshold = await getLowStockThreshold();
  if (variants.length > 0 && product.stock > threshold && updated.stock <= threshold) {
    sendLowStockAlertEmail(updated).catch((err) =>
      console.error('[product] Failed to send low-stock alert email:', err.message)
    );
    notifyLowStock(updated).catch((err) =>
      console.error('[product] Failed to send low-stock push notification:', err.message)
    );
  }

  res.json({ success: true, data: updated });
});

// GET /api/products/:id/related  (admin — current curated related products, for the edit form)
const getRelatedProducts = asyncHandler(async (req, res) => {
  const related = await prisma.relatedProduct.findMany({
    where: { productId: req.params.id },
    orderBy: { sortOrder: 'asc' },
    include: {
      relatedProduct: { include: { images: { where: { isPrimary: true }, take: 1 } } },
    },
  });
  res.json({ success: true, data: related.map((r) => r.relatedProduct) });
});

// PUT /api/products/:id/related  (admin — replace the full curated related-products list at once)
const setRelatedProducts = asyncHandler(async (req, res) => {
  const { relatedProductIds } = req.body; // ordered array of product ids
  if (!Array.isArray(relatedProductIds)) throw new ApiError(400, 'relatedProductIds must be an array.');

  const ids = relatedProductIds.filter((id) => id !== req.params.id); // a product can't relate to itself

  await prisma.relatedProduct.deleteMany({ where: { productId: req.params.id } });
  if (ids.length > 0) {
    await prisma.relatedProduct.createMany({
      data: ids.map((relatedProductId, index) => ({
        productId: req.params.id,
        relatedProductId,
        sortOrder: index,
      })),
    });
  }

  res.json({ success: true, message: 'Related products updated.' });
});

// POST /api/products/:id/images  (admin) — upload one or more images (multer: field "images")
const addProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image file is required.');
  }

  const existingCount = await prisma.productImage.count({ where: { productId: req.params.id } });

  const created = await prisma.$transaction(
    req.files.map((file, index) =>
      prisma.productImage.create({
        data: {
          productId: req.params.id,
          url: `/uploads/products/${file.filename}`,
          isPrimary: existingCount === 0 && index === 0,
          sortOrder: existingCount + index,
        },
      })
    )
  );

  res.status(201).json({ success: true, data: created });
});

// DELETE /api/products/images/:imageId  (admin)
const deleteProductImage = asyncHandler(async (req, res) => {
  await prisma.productImage.delete({ where: { id: req.params.imageId } });
  res.json({ success: true, message: 'Image deleted.' });
});

// PUT /api/products/images/:imageId/primary  (admin) — set as main image
const setPrimaryImage = asyncHandler(async (req, res) => {
  const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });
  if (!image) throw new ApiError(404, 'Image not found.');

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({ where: { id: image.id }, data: { isPrimary: true } }),
  ]);

  res.json({ success: true, message: 'Primary image updated.' });
});

module.exports = {
  getProducts,
  getRandomProducts,
  getLowStockProducts,
  getSearchSuggestions,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  setProductAttributes,
  setProductVariants,
  getRelatedProducts,
  setRelatedProducts,
  addProductImages,
  deleteProductImage,
  setPrimaryImage,
};