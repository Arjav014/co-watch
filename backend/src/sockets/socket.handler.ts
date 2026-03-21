import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from './socket.types';
import { registerRoomEvents } from './room.events';
import * as roomService from '../modules/rooms/room.service';

export const setupSockets = (io: Server) => {
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const secret = process.env.JWT_SECRET || 'secret';
        jwt.verify(token, secret, (err: any, decoded: any) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.user?.username} (${socket.id})`);

        registerRoomEvents(io, socket);

        socket.on('disconnecting', async () => {
            if (!socket.user) return;

            for (const roomId of socket.rooms) {
                if (roomId === socket.id) {
                    continue;
                }

                if (!(await roomService.isRoomMember(roomId, socket.user.userId))) {
                    continue;
                }

                const updatedRoom = await roomService.leaveRoom(roomId, socket.user.userId);

                socket.to(roomId).emit('userLeft', {
                    userId: socket.user.userId,
                    username: socket.user.username,
                    room: updatedRoom,
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);
        });
    });
};
