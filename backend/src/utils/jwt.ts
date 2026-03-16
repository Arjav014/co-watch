import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, username: string): string => {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.sign({ userId, username }, secret, {
        expiresIn: '30d',
    });
};
