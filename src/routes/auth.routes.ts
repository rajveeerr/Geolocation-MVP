import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { getPointConfig } from '../lib/points';

const router = Router();


// --- Endpoint: POST /api/auth/register ---
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  name: z.string().optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
        const { email, password, name } = registerSchema.parse(req.body);
        
        // Normalize email to lowercase to prevent case sensitivity issues
        const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Create the new user in the database
    const { signupPoints } = getPointConfig();

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
            name,
            password: hashedPassword,
            points: signupPoints
        },
      });
      await tx.userPointEvent.create({
        data: {
          userId: created.id,
          type: 'SIGNUP',
          points: signupPoints
        }
      });
      return created;
    });

    // We don't want to send the password back, even the hashed one
    const { password: _, ...userWithoutPassword } = newUser;

    // 5. Send back a success response
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
  const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, points: true }, 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// --- Endpoint: POST /api/auth/login ---
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
        const { email, password } = loginSchema.parse(req.body);
        
        // Normalize email to lowercase to prevent case sensitivity issues
        const normalizedEmail = email.toLowerCase().trim();

    // 2. Find the user by email
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      // Use a generic error message for security
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Compare the submitted password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Generate a JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the .env file');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email }, // This is the JWT payload
      jwtSecret,
      { expiresIn: '24h' } // Token will expire in 24 hours
    );

    // 5. Send the token back to the client
    res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
