/**
 * ImageKit Client — Frontend Integration
 *
 * Responsibilities:
 * - Image URL transformation (resize, quality, format)
 * - Image optimization utilities
 * - Authenticated upload via backend proxy (never expose private key)
 *
 * Security Note:
 *   Private keys NEVER leave the backend.
 *   Frontend only uses: publicKey + urlEndpoint for transformations.
 *   Upload requests go through our backend which calls ImageKit SDK server-side.
 */

const URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/venuehub';

/**
 * Generate an optimized ImageKit URL with transformations
 * @param {string} path - ImageKit file path or full URL
 * @param {Object} options - Transformation options
 */
export const getImageUrl = (path, options = {}) => {
  if (!path) return '/placeholder-venue.jpg';

  // If it's an external URL (e.g. Unsplash demo images), return as-is
  if (path.startsWith('http') && !path.includes('imagekit.io')) {
    return path;
  }

  const {
    width,
    height,
    quality = 80,
    blur,
    grayscale = false,
  } = options;

  const trs = [];
  if (width) trs.push(`w-${width}`);
  if (height) trs.push(`h-${height}`);
  if (quality) trs.push(`q-${quality}`);
  if (blur) trs.push(`bl-${blur}`);
  if (grayscale) trs.push(`e-grayscale`);

  const trString = trs.length > 0 ? `tr:${trs.join(',')}` : '';

  if (path.startsWith('http')) {
    const url = new URL(path);
    if (trString) url.searchParams.set('tr', trs.join(','));
    return url.toString();
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return trString ? `${URL_ENDPOINT}/${trString}${cleanPath}` : `${URL_ENDPOINT}${cleanPath}`;
};

/**
 * Preset transformations for common use cases
 */
export const ImagePresets = {
  venueCard: (path) => getImageUrl(path, { width: 400, height: 280, quality: 80 }),
  venueHero: (path) => getImageUrl(path, { width: 1280, height: 720, quality: 85 }),
  venueGallery: (path) => getImageUrl(path, { width: 800, height: 600, quality: 80 }),
  venueThumbnail: (path) => getImageUrl(path, { width: 200, height: 150, quality: 75 }),
  avatar: (path) => getImageUrl(path, { width: 96, height: 96, quality: 80 }),
  avatarSm: (path) => getImageUrl(path, { width: 40, height: 40, quality: 80 }),
  cityCard: (path) => getImageUrl(path, { width: 300, height: 200, quality: 80 }),
  placeholder: (path) => getImageUrl(path, { width: 20, height: 20, blur: 20, quality: 30 }),
  ogImage: (path) => getImageUrl(path, { width: 1200, height: 630, quality: 85 }),
};

/**
 * Get ImageKit authentication parameters from backend
 */
export const getAuthParams = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/media/auth`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('vm_access_token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get upload auth params');
  }

  return response.json();
};

export default { getImageUrl, ImagePresets, getAuthParams };
