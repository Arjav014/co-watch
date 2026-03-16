import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import roomRoutes from './modules/rooms/room.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

app.get('/health', (_, res) => {
    res.json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

export default app;
