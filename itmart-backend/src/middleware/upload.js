const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const ApiError = require('../utils/ApiError');

const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
const maxSize = Number(process.env.MAX_UPLOAD_SIZE_MB || 5) * 1024 * 1024;

/**
 * Builds a multer + sharp-processing pair for a given upload target
 * (e.g. "products", "banners"), each with its own folder and max width.
 * Files are held in memory by multer first, then resized/compressed to
 * WebP and written to disk by processImages — see productController /
 * bannerController for how each is wired into its routes.
 */
function createUploader({ subfolder, maxWidth, quality = 80 }) {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new ApiError(400, `Unsupported file type. Allowed: ${allowedTypes.join(', ')}`));
    }
    cb(null, true);
  };

  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSize },
  });

  const processOne = async (file) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const destPath = path.join(uploadDir, filename);
    await sharp(file.buffer)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(destPath);
    return { ...file, filename, path: destPath };
  };

  // For routes using upload.array(...) — req.files is an array
  const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();
    try {
      req.files = await Promise.all(req.files.map(processOne));
      next();
    } catch (err) {
      next(new ApiError(400, 'Failed to process one or more images. Please check the files and try again.'));
    }
  };

  // For routes using upload.single(...) — req.file is one object
  const processImage = async (req, res, next) => {
    if (!req.file) return next();
    try {
      req.file = await processOne(req.file);
      next();
    } catch (err) {
      next(new ApiError(400, 'Failed to process the image. Please check the file and try again.'));
    }
  };

  return { upload, processImages, processImage };
}

// Product images: multiple per product, standard web width
const productUploader = createUploader({ subfolder: 'products', maxWidth: 1600 });

// Banner images: wide hero graphics, single file per banner
const bannerUploader = createUploader({ subfolder: 'banners', maxWidth: 1920 });

// Category images: shown as smaller tiles on the storefront landing page
const categoryUploader = createUploader({ subfolder: 'categories', maxWidth: 800 });

// Brand logos: small, shown at icon/thumbnail size
const brandUploader = createUploader({ subfolder: 'brands', maxWidth: 500 });

// Preserve the original module shape (default export = product uploader,
// with .processImages attached) so existing imports keep working unchanged.
module.exports = productUploader.upload;
module.exports.processImages = productUploader.processImages;
module.exports.createUploader = createUploader;
module.exports.bannerUploader = bannerUploader;
module.exports.categoryUploader = categoryUploader;
module.exports.brandUploader = brandUploader;
