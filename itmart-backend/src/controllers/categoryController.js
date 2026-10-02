const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/categories  (public)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      children: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
      attributes: { orderBy: { sortOrder: 'asc' } },
    },
    where: { parentId: null },
    orderBy: { nameEn: 'asc' },
  });
  res.json({ success: true, data: categories });
});

// GET /api/categories/:slug  (public)
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { attributes: { orderBy: { sortOrder: 'asc' } }, children: true },
  });
  if (!category) throw new ApiError(404, 'Category not found.');
  res.json({ success: true, data: category });
});

// POST /api/categories  (admin — image is an uploaded file, sent as multipart/form-data)
const createCategory = asyncHandler(async (req, res) => {
  const { nameEn, nameFr, parentId } = req.body;
  if (!nameEn || !nameFr) throw new ApiError(400, 'nameEn and nameFr are required.');

  const slug = slugify(nameEn, { lower: true, strict: true });
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
  if (nameEn) {
    data.nameEn = nameEn;
    data.slug = slugify(nameEn, { lower: true, strict: true });
  }
  if (nameFr) data.nameFr = nameFr;
  if (parentId !== undefined) data.parentId = parentId || null;

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
const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
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
