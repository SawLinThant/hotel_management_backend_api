import { PrismaClient } from '../generated/prisma/index.js';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import config from './config/index.js';

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', passwordResetRoutes);
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is working!' });
});

// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Disconnect Prisma on shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));