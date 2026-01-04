import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

console.log('----------------------------------------');
console.log('🔧 Verifying Environment Variables:');
console.log(`- OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Loaded (' + process.env.OPENROUTER_API_KEY.substring(0, 10) + '...)' : '❌ MISSING'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Loaded' : '⚠️ Missing (using default)'}`);
console.log(`- DB_HOST: ${process.env.DB_HOST || '❌'}`);
console.log('----------------------------------------');

// Import routes (will be created)
import authRoutes from './routes/auth';
import buildRoutes from './routes/builds';
import preferencesRoutes from './routes/preferences';

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect()
    .then((client: any) => {
        console.log('✅ Connected to PostgreSQL database');
        client.release();
    })
    .catch((err: Error) => {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    });

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`, {
            body: req.body,
            query: req.query,
        });
        next();
    });
}

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/preferences', preferencesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} does not exist`
    });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ExileForge backend running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server gracefully...');
    pool.end();
    process.exit(0);
});
