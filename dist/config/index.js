import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: Number(process.env.PORT || 3000),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
        accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
        refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(','),
    },
    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
        max: Number(process.env.RATE_LIMIT_MAX || 100),
    },
    security: {
        staffRegistrationKey: process.env.STAFF_REGISTRATION_KEY || '',
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
};
export default config;
//# sourceMappingURL=index.js.map