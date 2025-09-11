"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import our new auth routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const merchant_routes_1 = __importDefault(require("./routes/merchant.routes")); // For protected merchant actions
const deals_public_routes_1 = __importDefault(require("./routes/deals.public.routes")); // For public deal fetching
const user_routes_1 = __importDefault(require("./routes/user.routes")); // For user-specific actions
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
// Basic rate limiting (can be tuned or scoped per route group)
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // max requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.get('/', (req, res) => {
    res.send('YOHOP Server (TypeScript & Prisma Edition) is alive!');
});
// Mount routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api', merchant_routes_1.default); // e.g., /api/merchants/register, /api/deals
app.use('/api', deals_public_routes_1.default); // e.g., /api/deals (GET)
app.use('/api/users', user_routes_1.default); // e.g., /api/users/save-deal, /api/users/saved-deals
// Removed insecure /users debug endpoint exposing user data.
const server = app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
