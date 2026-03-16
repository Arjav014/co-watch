import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
            };
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'secret';

        jwt.verify(token, secret, (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
                return;
            }

            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        return;
    }
};
