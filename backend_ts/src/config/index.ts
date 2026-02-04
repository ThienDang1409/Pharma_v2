import * as dotenv from 'dotenv';

// Load .env if present
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoUri: process.env.MONGO_URI,
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    'your-refresh-secret-key-change-in-production',
  jwtAccessExpire: Number(process.env.JWT_ACCESS_EXPIRE) || 60 * 60,
  jwtRefreshExpire: Number(process.env.JWT_REFRESH_EXPIRE) || 60 * 60 * 24 * 7,

  // Cloudinary (if using)
  cloudinaryName: process.env.cloudinary_Config_Cloud_Name || '',
  cloudinaryApiKey: process.env.cloudinary_Config_api_key || '',
  cloudinaryApiSecret: process.env.cloudinary_Config_api_secret || '',
};

export default config;
