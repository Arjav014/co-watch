import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.registerUser(validatedData);

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input', errors: error.errors });
            return;
        }
        // Prevent 500 for business logic errors
        if (error.message === 'User already exists') {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.loginUser(validatedData);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input', errors: error.errors });
            return;
        }
        // Set status to 401 for generic auth errors
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
