import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';


dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('YOHOP Server (TypeScript & Prisma Edition) is alive!');
});


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