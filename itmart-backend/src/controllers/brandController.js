const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/brands (public)
const getBrands = asyncHandler(async (req, res) => {
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: brands });
});

// POST /api/brands (admin — logo is an uploaded file, sent as multipart/form-data)
const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, 'name is required.');
  const slug = slugify(name, { lower: true, strict: true });
  const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;
  const brand = await prisma.brand.create({ data: { name, logo, slug } });
  res.status(201).json({ success: true, data: brand });
});

// PUT /api/brands/:id (admin — name only; logo replaced via separate endpoint)
const updateBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const data = {};
  if (name) {
    data.name = name;
    data.slug = slugify(name, { lower: true, strict: true });
  }

  const brand = await prisma.brand.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: brand });
});

// PUT /api/brands/:id/logo (admin — replace the brand logo)
const updateBrandLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A logo image file is required.');
  const brand = await prisma.brand.update({
    where: { id: req.params.id },
    data: { logo: `/uploads/brands/${req.file.filename}` },
  });
  res.json({ success: true, data: brand });
});

// DELETE /api/brands/:id (admin)
const deleteBrand = asyncHandler(async (req, res) => {
  await prisma.brand.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Brand deleted.' });
});

module.exports = { getBrands, createBrand, updateBrand, updateBrandLogo, deleteBrand };
