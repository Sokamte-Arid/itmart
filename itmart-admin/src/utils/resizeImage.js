// Phone cameras produce 4–12 MB photos (sometimes HEIC on iPhone). The backend
// accepts up to MAX_UPLOAD_SIZE_MB (5 MB) of JPG/PNG/WebP and re-compresses to
// WebP anyway, so we shrink big or unusual photos in the browser first:
// uploads are faster on mobile data and never hit the size limit.
const ACCEPTED = /\.(jpe?g|png|webp)$/i;

export async function prepareImageForUpload(file, { maxDimension = 2000, quality = 0.88 } = {}) {
  const needsWork = file.size > 1024 * 1024 || !ACCEPTED.test(file.name);
  if (!needsWork || !file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file;

  try {
    // imageOrientation keeps portrait photos upright (EXIF rotation)
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`;
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file; // if the browser can't decode it, let the server decide
  }
}
