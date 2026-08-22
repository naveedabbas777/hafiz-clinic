import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '121983961399577',
  api_key: process.env.CLOUDINARY_API_KEY || '121983961399577',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Z7gEfW736NQlcGAYR4CiTEWxPYE',
});

/**
 * Extracts public_id and resource_type from a Cloudinary URL or raw public ID.
 */
export function parseCloudinaryUrl(urlOrPublicId: string): { publicId: string; resourceType: 'image' | 'video' | 'raw' } | null {
  if (!urlOrPublicId || typeof urlOrPublicId !== 'string') return null;

  const clean = urlOrPublicId.trim();

  // If it's a data URL or blob, it's not on Cloudinary yet
  if (clean.startsWith('data:') || clean.startsWith('blob:')) {
    return null;
  }

  // If not a full URL and matches a folder structure like 'hafiz_clinic/...'
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    const isVideo = clean.includes('/videos/') || clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov');
    const publicId = clean.replace(/\.[^/.]+$/, ''); // remove extension
    return {
      publicId,
      resourceType: isVideo ? 'video' : 'image',
    };
  }

  // Must be a Cloudinary URL
  if (!clean.includes('cloudinary.com') && !clean.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    // Standard Cloudinary URL structure:
    // https://res.cloudinary.com/<cloud>/<resource_type>/upload/(v\d+/)?(<public_id>)(\.[a-zA-Z0-9]+)?
    const match = clean.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?([^\?#]+)/i);
    if (!match) return null;

    const resourceType = (match[1].toLowerCase() as 'image' | 'video' | 'raw') || 'image';
    let pathPart = match[2];

    // Remove file extension at end (e.g. .jpg, .png, .mp4, .webp)
    const publicId = pathPart.replace(/\.[^/.]+$/, '');

    return { publicId, resourceType };
  } catch (err) {
    console.error('Error parsing Cloudinary URL:', err);
    return null;
  }
}

/**
 * Deletes media file from Cloudinary given its URL or public ID.
 */
export async function deleteFromCloudinary(
  urlOrPublicId?: string | null,
  explicitResourceType?: 'image' | 'video' | 'raw'
): Promise<{ success: boolean; publicId?: string; resourceType?: string; error?: string; result?: any }> {
  if (!urlOrPublicId || typeof urlOrPublicId !== 'string') {
    return { success: false, error: 'No media specified' };
  }

  const parsed = parseCloudinaryUrl(urlOrPublicId);
  if (!parsed && !explicitResourceType) {
    return { success: false, error: 'Not a recognized Cloudinary media URL' };
  }

  const publicId = parsed ? parsed.publicId : urlOrPublicId.trim().replace(/\.[^/.]+$/, '');
  const resourceType = explicitResourceType || (parsed ? parsed.resourceType : 'image');

  try {
    console.log(`[Cloudinary Destroy] Request to delete ${resourceType}: "${publicId}"`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    console.log(`[Cloudinary Destroy Result] for "${publicId}":`, result);
    return { success: true, result, publicId, resourceType };
  } catch (err: any) {
    console.error(`[Cloudinary Destroy Error] Failed to delete "${publicId}":`, err?.message || err);
    return { success: false, error: err?.message || 'Cloudinary destroy failed' };
  }
}

/**
 * Batch deletes multiple media files from Cloudinary.
 */
export async function deleteMultipleFromCloudinary(
  items: (string | undefined | null)[]
): Promise<Array<{ success: boolean; publicId?: string; error?: string }>> {
  const results = [];
  for (const item of items) {
    if (item) {
      const res = await deleteFromCloudinary(item);
      results.push(res);
    }
  }
  return results;
}

export { cloudinary };

