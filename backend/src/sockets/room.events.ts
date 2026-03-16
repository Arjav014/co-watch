import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import * as roomService from '../modules/rooms/room.service';
import * as chatService from '../modules/chat/chat.service';
import { Room } from '../modules/rooms/room.types';

type EventResponse<T = undefined> = {
    success: boolean;
    message?: string;
    data?: T;
};

type Ack<T = undefined> = (response: EventResponse<T>) => void;

const respondWithError = <T = undefined>(ack: Ack<T> | undefined, message: string) => {
    if (ack) {
        ack({ success: false, message });
    }
};

const ensureRoomMember = <T = undefined>(roomId: string, userId: string): EventResponse<T> | null => {
    const room = roomService.getRoom(roomId);
    if (!room) {
        return { success: false, message: 'Room not found' };
    }

    if (!roomService.isRoomMember(roomId, userId)) {
        return { success: false, message: 'User is not in this room' };
    }

    return null;
};

export const registerRoomEvents = (io: Server, socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) return;

    socket.on('createRoom', (data: { videoUrl?: string } = {}, ack?: Ack<Room>) => {
        try {
            const room = roomService.createRoom(user.userId, user.username, data.videoUrl?.trim() || '');
            socket.join(room.roomId);

            if (ack) {
                ack({ success: true, data: room });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to create room');
        }
    });

    socket.on('joinRoom', (data: { roomId?: string } = {}, ack?: Ack<Room>) => {
        try {
            const roomId = data.roomId?.trim();
            if (!roomId) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const existingRoom = roomService.getRoom(roomId);
            if (!existingRoom) {
                respondWithError(ack, 'Room not found');
                return;
            }

            const alreadyJoined = existingRoom.users.some(member => member.userId === user.userId);
            const room = roomService.joinRoom(roomId, {
                userId: user.userId,
                username: user.username,
            });

            socket.join(roomId);

            if (!alreadyJoined) {
                socket.to(roomId).emit('userJoined', {
                    userId: user.userId,
                    username: user.username,
                });
            }

            if (ack) {
                ack({ success: true, data: room });
            }
            console.log(`${user.username} joined room ${roomId}`);
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to join room');
        }
    });

    socket.on('leaveRoom', (data: { roomId?: string } = {}, ack?: Ack<Room>) => {
        const roomId = data.roomId?.trim();
        if (!roomId) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const membershipError = ensureRoomMember<Room>(roomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        socket.leave(roomId);

        socket.to(roomId).emit('userLeft', {
            userId: user.userId,
            username: user.username,
        });

        const updatedRoom = roomService.leaveRoom(roomId, user.userId);
        if (ack) {
            ack({ success: true, data: updatedRoom });
        }
    });

    socket.on('play', (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        const { roomId, currentTime } = data;
        if (!roomId?.trim()) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const normalizedRoomId = roomId.trim();
        const membershipError = ensureRoomMember(normalizedRoomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        if (!roomService.isRoomHost(normalizedRoomId, user.userId)) {
            respondWithError(ack, 'Only the host can control playback');
            return;
        }

        roomService.updatePlayback(normalizedRoomId, { isPlaying: true, currentTime });

        io.to(normalizedRoomId).emit('play', { currentTime });
        if (ack) {
            ack({ success: true });
        }
    });

    socket.on('pause', (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        const { roomId, currentTime } = data;
        if (!roomId?.trim()) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const normalizedRoomId = roomId.trim();
        const membershipError = ensureRoomMember(normalizedRoomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        if (!roomService.isRoomHost(normalizedRoomId, user.userId)) {
            respondWithError(ack, 'Only the host can control playback');
            return;
        }

        roomService.updatePlayback(normalizedRoomId, { isPlaying: false, currentTime });

        io.to(normalizedRoomId).emit('pause', { currentTime });
        if (ack) {
            ack({ success: true });
        }
    });

    socket.on('seek', (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        const { roomId, currentTime } = data;
        if (!roomId?.trim()) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const normalizedRoomId = roomId.trim();
        const membershipError = ensureRoomMember(normalizedRoomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        if (!roomService.isRoomHost(normalizedRoomId, user.userId)) {
            respondWithError(ack, 'Only the host can control playback');
            return;
        }

        roomService.updatePlayback(normalizedRoomId, { currentTime });

        io.to(normalizedRoomId).emit('seek', { currentTime });
        if (ack) {
            ack({ success: true });
        }
    });

    socket.on('videoChange', (data: { roomId?: string, videoUrl: string }, ack?: Ack) => {
        const { roomId, videoUrl } = data;
        if (!roomId?.trim()) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const normalizedRoomId = roomId.trim();
        const membershipError = ensureRoomMember(normalizedRoomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        if (!roomService.isRoomHost(normalizedRoomId, user.userId)) {
            respondWithError(ack, 'Only the host can change the video');
            return;
        }

        roomService.updatePlayback(normalizedRoomId, { videoUrl, currentTime: 0, isPlaying: false });

        io.to(normalizedRoomId).emit('videoChange', { videoUrl });
        if (ack) {
            ack({ success: true });
        }
    });

    socket.on('chatMessage', async (data: { roomId?: string, message?: string } = {}, ack?: Ack) => {
        const { roomId, message } = data;
        const trimmedMessage = message?.trim();
        if (!roomId?.trim()) {
            respondWithError(ack, 'Room ID is required');
            return;
        }

        const normalizedRoomId = roomId.trim();
        const membershipError = ensureRoomMember(normalizedRoomId, user.userId);
        if (membershipError) {
            if (ack) {
                ack(membershipError);
            }
            return;
        }

        if (!trimmedMessage) {
            respondWithError(ack, 'Message is required');
            return;
        }

        io.to(normalizedRoomId).emit('chatMessage', {
            userId: user.userId,
            username: user.username,
            message: trimmedMessage,
            timestamp: new Date()
        });

        try {
            await chatService.saveMessage(normalizedRoomId, user.userId, user.username, trimmedMessage);
            if (ack) {
                ack({ success: true });
            }
        } catch (err) {
            console.error('Failed to save chat message:', err);
            respondWithError(ack, 'Failed to save chat message');
        }
    });
};
