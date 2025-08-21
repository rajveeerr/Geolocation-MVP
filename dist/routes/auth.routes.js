"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// --- Endpoint: POST /api/auth/register ---
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long" }),
    name: zod_1.z.string().optional(),
});
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        // Normalize email to lowercase to prevent case sensitivity issues
        const normalizedEmail = email.toLowerCase().trim();
        // 2. Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already in use' });
        }
        // 3. Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10); // 10 is the salt rounds
        // 4. Create the new user in the database
        const newUser = await prisma_1.default.user.create({
            data: {
                email: normalizedEmail,
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        return res.status(500).json({ error: 'Server configuration error' });
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, createdAt: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --- Endpoint: POST /api/auth/login ---
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string(),
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Normalize email to lowercase to prevent case sensitivity issues
        const normalizedEmail = email.toLowerCase().trim();
        // 2. Find the user by email
        const user = await prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            // Use a generic error message for security
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // 3. Compare the submitted password with the stored hash
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // 4. Generate a JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in the .env file');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, // This is the JWT payload
        jwtSecret, { expiresIn: '24h' } // Token will expire in 24 hours
        );
        // 5. Send the token back to the client
        res.status(200).json({
            message: 'Login successful',
            token: token,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
