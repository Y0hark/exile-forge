import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        username: string;
    };
}

// JWT authentication middleware
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication token required'
        });
    }

    try {
        const secret = process.env.JWT_SECRET || 'default-secret';
        const decoded = jwt.verify(token, secret) as any;

        (req as AuthRequest).user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
        };

        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or expired token'
        });
    }
};

// Generate JWT token
export const generateToken = (user: { id: number; email: string; username: string }) => {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        secret,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};
