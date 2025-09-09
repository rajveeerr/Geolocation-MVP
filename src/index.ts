import express, { Express, Request, Response } from 'express';
import prisma from './lib/prisma';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import our new auth routes
import authRoutes from './routes/auth.routes';
import merchantRoutes from './routes/merchant.routes'; // For protected merchant actions
import publicDealRoutes from './routes/deals.public.routes'; // For public deal fetching
import userRoutes from './routes/user.routes'; // For user-specific actions

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(helmet());

// Basic rate limiting (can be tuned or scoped per route group)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.get('/', (req: Request, res: Response) => {
  res.send('YOHOP Server (TypeScript & Prisma Edition) is alive!');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', merchantRoutes); // e.g., /api/merchants/register, /api/deals
app.use('/api', publicDealRoutes); // e.g., /api/deals (GET)
app.use('/api/users', userRoutes); // e.g., /api/users/save-deal, /api/users/saved-deals

// Removed insecure /users debug endpoint exposing user data.

const server = app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});