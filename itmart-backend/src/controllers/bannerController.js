const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const VALID_PLACEMENTS = ['HERO', 'DEALS', 'PROMO', 'SIDE', 'SIDE_LEFT'];

// GET /api/banners?placement=HERO  (public — only active banners, in display order)
const getBanners = asyncHandler(async (req, res) => {
  const { placement } = req.query;
  const where = { isActive: true };
  if (placement && VALID_PLACEMENTS.includes(placement)) where.placement = placement;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: banners });
});

// GET /api/banners/all  (admin — every banner, including inactive)
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }] });
  res.json({ success: true, data: banners });
});

// POST /api/banners  (admin)
const createBanner = asyncHandler(async (req, res) => {
  const { titleEn, titleFr, subtitleEn, subtitleFr, ctaTextEn, ctaTextFr, ctaLink, isActive, sortOrder, placement } =
    req.body;

  if (!req.file) {
    throw new ApiError(400, 'A banner image is required.');
  }
  if (placement && !VALID_PLACEMENTS.includes(placement)) {
    throw new ApiError(400, `placement must be one of: ${VALID_PLACEMENTS.join(', ')}`);
  }

  const banner = await prisma.banner.create({
    data: {
      image: `/uploads/banners/${req.file.filename}`,
      placement: placement || 'HERO',
      titleEn,
      titleFr,
      subtitleEn,
      subtitleFr,
      ctaTextEn,
      ctaTextFr,
      ctaLink,
      isActive: isActive === 'false' ? false : true,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    },
  });
  res.status(201).json({ success: true, data: banner });
});

// PUT /api/banners/:id  (admin — fields only; image replaced via separate endpoint)
const updateBanner = asyncHandler(async (req, res) => {
  const { titleEn, titleFr, subtitleEn, subtitleFr, ctaTextEn, ctaTextFr, ctaLink, isActive, sortOrder, placement } =
    req.body;

  if (placement !== undefined && !VALID_PLACEMENTS.includes(placement)) {
    throw new ApiError(400, `placement must be one of: ${VALID_PLACEMENTS.join(', ')}`);
  }

  const data = {};
  if (titleEn !== undefined) data.titleEn = titleEn;
  if (titleFr !== undefined) data.titleFr = titleFr;
  if (subtitleEn !== undefined) data.subtitleEn = subtitleEn;
  if (subtitleFr !== undefined) data.subtitleFr = subtitleFr;
  if (ctaTextEn !== undefined) data.ctaTextEn = ctaTextEn;
  if (ctaTextFr !== undefined) data.ctaTextFr = ctaTextFr;
  if (ctaLink !== undefined) data.ctaLink = ctaLink;
  if (isActive !== undefined) data.isActive = isActive === 'false' ? false : Boolean(isActive);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (placement !== undefined) data.placement = placement;

  const banner = await prisma.banner.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: banner });
});

// PUT /api/banners/:id/image  (admin — replace the banner image)
const updateBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'An image file is required.');
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: { image: `/uploads/banners/${req.file.filename}` },
  });
  res.json({ success: true, data: banner });
});

// DELETE /api/banners/:id  (admin)
const deleteBanner = asyncHandler(async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Banner deleted.' });
});

module.exports = {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  updateBannerImage,
  deleteBanner,
};
