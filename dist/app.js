import { PrismaClient } from '../generated/prisma/index.js';
import express, {} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import stayRecordRoutes from './routes/stayRecordRoutes.js';
import config from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
const prisma = new PrismaClient();
app.use(helmet());
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support form data
app.use('/api', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);
app.use('/api', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', passwordResetRoutes);
app.use('/api', stayRecordRoutes);
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'API is working!' });
});
// Global error handler middleware
app.use(errorHandler);
// Disconnect Prisma on shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
//# sourceMappingURL=app.js.map