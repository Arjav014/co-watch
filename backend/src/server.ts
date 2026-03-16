import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/database';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

import { setupSockets } from './sockets/socket.handler';

app.set('io', io);
setupSockets(io);

const startServer = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
