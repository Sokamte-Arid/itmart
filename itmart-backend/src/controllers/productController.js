const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendLowStockAlertEmail } = require('../utils/mailer');
const { stripCostPrice, stripCostPriceFromList } = require('../utils/sanitizeProduct');

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
    // If the category has subcategories, browsing it shows products from
    // the category itself AND all its subcategories combined — only
    // narrows to one specific subcategory once the customer drills into it.
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: category },
      include: { children: { select: { id: true } } },
    });
    if (categoryRecord) {
      const categoryIds = [categoryRecord.id, ...categoryRecord.children.map((c) => c.id)];
      where.categoryId = { in: categoryIds };
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
    include: { images: { orderBy: { sortOrder: 'asc' } }, brand: true, category: true },
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
      brand: true,
      category: true,
      attributeValues: { include: { attribute: true } },
      relatedFrom: {
        orderBy: { sortOrder: 'asc' },
        include: {
          relatedProduct: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
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

  // Sibling variants (same group, excluding itself) — carries full spec data
  // now (not just a thumbnail) so color variants can be swapped in-place on
  // the product page without a page reload.
  let siblings = [];
  if (product.groupId) {
    siblings = await prisma.product.findMany({
      where: { groupId: product.groupId, id: { not: product.id }, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        attributeValues: { include: { attribute: true } },
      },
    });
  }

  // If this product has a COLOR-type attribute, build a compact list of
  // every color option in the group (this product + its siblings) with
  // everything the storefront needs to switch between them instantly on
  // the same page: images, price, stock, and sku — no navigation, no
  // separate page per color, matching a standard variant-swatch UX.
  let colorVariants = [];
  const colorAttrValue = product.attributeValues.find((av) => av.attribute.type === 'COLOR');
  if (colorAttrValue) {
    const groupMembers = [product, ...siblings];
    colorVariants = groupMembers
      .map((member) => {
        const cv = member.attributeValues.find((av) => av.attributeId === colorAttrValue.attributeId);
        if (!cv) return null;
        return {
          id: member.id,
          slug: member.slug,
          sku: member.sku,
          nameEn: member.nameEn,
          nameFr: member.nameFr,
          colorName: cv.value,
          hexValue: cv.hexValue,
          price: member.price,
          discountPrice: member.discountPrice,
          stock: member.stock,
          isActive: member.isActive,
          images: member.images,
        };
      })
      .filter(Boolean)
      .map((v) => stripCostPrice(v));
  }

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
      // Non-color siblings still show as the old "Other configurations"
      // list. If this group varies by color, the swatches above replace
      // that list on the frontend, so we only need siblings for groups
      // that DON'T have a color attribute.
      siblings: colorVariants.length > 0 ? [] : stripCostPriceFromList(siblings),
      colorVariants,
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
    groupId,
    groupName,
    nameEn,
    nameFr,
    descriptionEn,
    descriptionFr,
    price,
    costPrice,
    discountPrice,
    stock,
    isBestSeller,
    attributes, // [{ attributeId, value, hexValue? }]
  } = req.body;

  if (!categoryId || !nameEn || !nameFr || price === undefined) {
    throw new ApiError(400, 'categoryId, nameEn, nameFr and price are required.');
  }

  const finalSku = sku && sku.trim() ? sku.trim() : generateSku(nameEn);
  const slug = slugify(`${nameEn}-${finalSku}`, { lower: true, strict: true });

  // Resolve variant group: explicit groupId wins; otherwise find-or-create by name
  let resolvedGroupId = groupId || null;
  if (!resolvedGroupId && groupName && groupName.trim()) {
    const existing = await prisma.productGroup.findFirst({
      where: { OR: [{ nameEn: groupName.trim() }, { nameFr: groupName.trim() }] },
    });
    resolvedGroupId = existing
      ? existing.id
      : (await prisma.productGroup.create({ data: { nameEn: groupName.trim(), nameFr: groupName.trim() } })).id;
  }

  const product = await prisma.product.create({
    data: {
      sku: finalSku,
      slug,
      category: { connect: { id: categoryId } },
      brand: brandId ? { connect: { id: brandId } } : undefined,
      group: resolvedGroupId ? { connect: { id: resolvedGroupId } } : undefined,
      nameEn,
      nameFr,
      descriptionEn,
      descriptionFr,
      price,
      costPrice: costPrice || null,
      discountPrice: discountPrice || null,
      stock: stock ?? 0,
      isBestSeller: !!isBestSeller,
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
    groupId,
    groupName,
    nameEn,
    nameFr,
    descriptionEn,
    descriptionFr,
    price,
    costPrice,
    discountPrice,
    stock,
    isBestSeller,
    isActive,
  } = req.body;

  const data = {};
  if (categoryId) data.category = { connect: { id: categoryId } };
  if (brandId !== undefined) data.brand = brandId ? { connect: { id: brandId } } : { disconnect: true };

  if (groupId !== undefined) {
    data.group = groupId ? { connect: { id: groupId } } : { disconnect: true };
  } else if (groupName !== undefined) {
    if (groupName && groupName.trim()) {
      // Same case-insensitive, trimmed match as createProduct — otherwise
      // re-saving a product with the "same" variant name (different casing
      // or spacing) forks it into yet another disconnected group instead
      // of reconnecting it to its siblings.
      const existing = await prisma.productGroup.findFirst({
        where: {
          OR: [
            { nameEn: { equals: groupName.trim(), mode: 'insensitive' } },
            { nameFr: { equals: groupName.trim(), mode: 'insensitive' } },
          ],
        },
      });
      const resolvedId = existing
        ? existing.id
        : (await prisma.productGroup.create({ data: { nameEn: groupName.trim(), nameFr: groupName.trim() } })).id;
      data.group = { connect: { id: resolvedId } };
    } else {
      data.group = { disconnect: true };
    }
  }

  if (nameEn) data.nameEn = nameEn;
  if (nameFr) data.nameFr = nameFr;
  if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
  if (descriptionFr !== undefined) data.descriptionFr = descriptionFr;
  if (price !== undefined) data.price = price;
  if (costPrice !== undefined) data.costPrice = costPrice || null;
  if (discountPrice !== undefined) data.discountPrice = discountPrice || null;
  if (stock !== undefined) data.stock = stock;
  if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
  if (isActive !== undefined) data.isActive = isActive;

  // Capture stock before the update, so we can tell if this save is what
  // crossed it into low-stock territory (vs. it already being low).
  const before = stock !== undefined ? await prisma.product.findUnique({ where: { id: req.params.id } }) : null;

  const product = await prisma.product.update({ where: { id: req.params.id }, data });

  const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 5);
  if (before && before.stock > threshold && product.stock <= threshold) {
    sendLowStockAlertEmail(product).catch((err) =>
      console.error('[product] Failed to send low-stock alert email:', err.message)
    );
  }

  res.json({ success: true, data: product });
});

// GET /api/products/low-stock  (admin — products at or below the threshold, for the dashboard)
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 5);
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
    include: { attributeValues: true, images: { orderBy: { sortOrder: 'asc' } } },
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
      group: source.groupId ? { connect: { id: source.groupId } } : undefined, // often duplicated specifically to add another variant to the same group
      nameEn: `${source.nameEn} (Copy)`,
      nameFr: `${source.nameFr} (Copie)`,
      descriptionEn: source.descriptionEn,
      descriptionFr: source.descriptionFr,
      price: source.price,
      costPrice: source.costPrice,
      discountPrice: source.discountPrice,
      stock: 0, // a duplicate is a new listing, not the same physical stock — admin sets the real quantity
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
    include: { attributeValues: true, images: true, category: true, brand: true },
  });

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
  getRelatedProducts,
  setRelatedProducts,
  addProductImages,
  deleteProductImage,
  setPrimaryImage,
};