"use strict";
// src/middleware/auth.middleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApprovedMerchant = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const protect = async (req, res, next) => {
    let token;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in the .env file');
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = { id: decoded.userId, email: decoded.email };
            next();
        }
        catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const isApprovedMerchant = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const merchant = await prisma_1.default.merchant.findUnique({
            where: { ownerId: userId },
            select: { id: true, status: true },
        });
        if (!merchant) {
            return res.status(403).json({ error: 'You do not have a merchant profile.' });
        }
        if (merchant.status !== 'APPROVED') {
            return res.status(403).json({ error: `Your merchant profile is not approved. Current status: ${merchant.status}` });
        }
        // Attach merchant info to the request for use in the next handler
        req.merchant = merchant;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify merchant status' });
    }
};
exports.isApprovedMerchant = isApprovedMerchant;
