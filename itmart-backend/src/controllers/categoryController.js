const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
  MAX_DEPTH,
  loadAllCategories,
  buildTree,
  descendantIds,
  ancestorsOf,
  levelOf,
  branchHeight,
} = require('../utils/categoryTree');

// Categories can be nested at any depth up to MAX_DEPTH levels
// (e.g. Imprimantes > Jet d'encre > A3). These helpers keep the tree valid
// and give every category a unique web address.

// "printers" → "printers", or "printers-2", "printers-3"... if already taken
async function uniqueSlug(name, excludeId) {
  const base = slugify(name, { lower: true, strict: true }) || 'category';
  for (let n = 1; ; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await prisma.category.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) } });
    if (!taken) return slug;
  }
}

/**
 * Checks that `parentId` can be the parent of the category `selfId`
 * (null when creating a new one): the parent exists, isn't the category
 * itself or one of its own subcategories (that would make a loop), and the
 * branch doesn't go deeper than MAX_DEPTH levels.
 */
async function checkParent(parentId, selfId) {
  if (!parentId) return;
  if (parentId === selfId) throw new ApiError(400, 'Une catégorie ne peut pas être sa propre catégorie parente.');
  const all = await loadAllCategories();
  const parent = all.find((c) => c.id === parentId);
  if (!parent) throw new ApiError(400, "La catégorie parente n'existe pas.");

  if (selfId && descendantIds(all, selfId).includes(parentId)) {
    throw new ApiError(
      400,
      `« ${parent.nameFr || parent.nameEn} » est une sous-catégorie de cette catégorie : elle ne peut pas devenir son parent.`
    );
  }

  const height = selfId ? branchHeight(all, selfId) : 1;
  if (levelOf(all, parentId) + height > MAX_DEPTH) {
    throw new ApiError(
      400,
      `Profondeur maximale atteinte : ${MAX_DEPTH} niveaux de catégories au plus (catégorie principale comprise).`
    );
  }
}

// GET /api/categories  (public) — main categories with their subcategories
// nested to every level, each with its characteristics
const getCategories = asyncHandler(async (req, res) => {
  const all = await loadAllCategories({ withAttributes: true });
  res.json({ success: true, data: buildTree(all) });
});

// GET /api/categories/:slug  (public)
// Includes `ancestors` (main category → direct parent) for breadcrumbs.
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { attributes: { orderBy: { sortOrder: 'asc' } }, children: { orderBy: { nameEn: 'asc' } } },
  });
  if (!category) throw new ApiError(404, 'Category not found.');
  const all = await loadAllCategories();
  res.json({ success: true, data: { ...category, ancestors: ancestorsOf(all, category) } });
});

// POST /api/categories  (admin — image is an uploaded file, sent as multipart/form-data)
const createCategory = asyncHandler(async (req, res) => {
  const { nameEn, nameFr, parentId } = req.body;
  if (!nameEn || !nameFr) throw new ApiError(400, 'nameEn and nameFr are required.');

  await checkParent(parentId || null, null);
  const slug = await uniqueSlug(nameEn);
  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

  const category = await prisma.category.create({
    data: { nameEn, nameFr, image, parentId: parentId || null, slug },
  });
  res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id  (admin — text fields only; image replaced via separate endpoint)
const updateCategory = asyncHandler(async (req, res) => {
  const { nameEn, nameFr, parentId } = req.body;
  const data = {};
  const current = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!current) throw new ApiError(404, 'Category not found.');
  if (nameEn) {
    data.nameEn = nameEn;
    // Only change the web address if the English name really changed
    if (nameEn !== current.nameEn) data.slug = await uniqueSlug(nameEn, current.id);
  }
  if (nameFr) data.nameFr = nameFr;
  if (parentId !== undefined) {
    await checkParent(parentId || null, current.id);
    data.parentId = parentId || null;
  }

  const category = await prisma.category.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: category });
});

// PUT /api/categories/:id/image  (admin — replace the category image)
const updateCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'An image file is required.');
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { image: `/uploads/categories/${req.file.filename}` },
  });
  res.json({ success: true, data: category });
});

// DELETE /api/categories/:id  (admin)
// Its subcategories move up one level (to its own parent) rather than
// becoming main categories by surprise.
const deleteCategory = asyncHandler(async (req, res) => {
  const current = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!current) throw new ApiError(404, 'Category not found.');
  const productCount = await prisma.product.count({ where: { categoryId: current.id } });
  if (productCount > 0) {
    throw new ApiError(
      409,
      `Cette catégorie contient ${productCount} produit(s). Déplacez-les dans une autre catégorie avant de la supprimer.`
    );
  }
  await prisma.$transaction([
    prisma.category.updateMany({ where: { parentId: current.id }, data: { parentId: current.parentId } }),
    prisma.category.delete({ where: { id: current.id } }),
  ]);
  res.json({ success: true, message: 'Category deleted.' });
});

// --- Category attributes (the filterable spec fields for a category) ---

// POST /api/categories/:id/attributes  (admin)
const addAttribute = asyncHandler(async (req, res) => {
  const { nameEn, nameFr, type, unit, isFilterable, sortOrder } = req.body;
  if (!nameEn || !nameFr) throw new ApiError(400, 'nameEn and nameFr are required.');

  // New characteristics go at the end of the list unless a position is given
  const last = await prisma.categoryAttribute.aggregate({
    where: { categoryId: req.params.id },
    _max: { sortOrder: true },
  });
  const attribute = await prisma.categoryAttribute.create({
    data: {
      categoryId: req.params.id,
      nameEn,
      nameFr,
      type: type || 'TEXT',
      unit,
      isFilterable: isFilterable ?? true,
      sortOrder: sortOrder ?? (last._max.sortOrder ?? -1) + 1,
    },
  });
  res.status(201).json({ success: true, data: attribute });
});

// PUT /api/categories/:id/attributes/order  (admin)
// body: { attributeIds: [...] } — the category's characteristics in the
// order they should appear on product pages and in the filters.
const reorderAttributes = asyncHandler(async (req, res) => {
  const { attributeIds } = req.body || {};
  if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
    throw new ApiError(400, 'attributeIds must be a non-empty array.');
  }
  const existing = await prisma.categoryAttribute.findMany({
    where: { categoryId: req.params.id },
    select: { id: true },
  });
  const ids = new Set(existing.map((a) => a.id));
  if (attributeIds.length !== ids.size || !attributeIds.every((id) => ids.has(id))) {
    throw new ApiError(400, "attributeIds must list exactly this category's characteristics.");
  }
  await prisma.$transaction(
    attributeIds.map((id, index) =>
      prisma.categoryAttribute.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  const attributes = await prisma.categoryAttribute.findMany({
    where: { categoryId: req.params.id },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: attributes });
});

// DELETE /api/categories/attributes/:attributeId  (admin)
const deleteAttribute = asyncHandler(async (req, res) => {
  await prisma.categoryAttribute.delete({ where: { id: req.params.attributeId } });
  res.json({ success: true, message: 'Attribute deleted.' });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  updateCategoryImage,
  deleteCategory,
  addAttribute,
  deleteAttribute,
  reorderAttributes,
};
