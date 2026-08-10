import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '121983961399577',
  api_key: process.env.CLOUDINARY_API_KEY || '121983961399577',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Z7gEfW736NQlcGAYR4CiTEWxPYE',
});

export { cloudinary };
