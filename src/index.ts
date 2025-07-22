import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

// Import our new auth routes
import authRoutes from './routes/auth.routes';

dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('YOHOP Server (TypeScript & Prisma Edition) is alive!');
});

// Mount the authentication routes under the /api/auth prefix
// All routes in auth.routes.ts will now be accessible under e.g., /api/auth/register
app.use('/api/auth', authRoutes);

// You can keep this for testing or remove it later
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});