import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();


// --- Endpoint: POST /api/auth/register ---
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // We don't want to send the password back, even the hashed one
    const { password: _, ...userWithoutPassword } = newUser;

    // 5. Send back a success response
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- Endpoint: POST /api/auth/login ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;