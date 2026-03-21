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

const ensureRoomMember = async <T = undefined>(roomId: string, userId: string): Promise<EventResponse<T> | null> => {
    const room = await roomService.getRoom(roomId);
    if (!room) {
        return { success: false, message: 'Room not found' };
    }

    if (!(await roomService.isRoomMember(roomId, userId))) {
        return { success: false, message: 'User is not in this room' };
    }

    return null;
};

export const registerRoomEvents = (io: Server, socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) return;

    socket.on(
        'createRoom',
        async (
            data: { roomName?: string; videoUrl?: string; isPrivate?: boolean } = {},
            ack?: Ack<Room>
        ) => {
        try {
            const roomName = data.roomName?.trim();
            const videoUrl = data.videoUrl?.trim();
            if (!roomName) {
                respondWithError(ack, 'Room name is required');
                return;
            }

            if (!videoUrl) {
                respondWithError(ack, 'Video URL is required');
                return;
            }

            const room = await roomService.createRoom(user.userId, user.username, {
                roomName,
                videoUrl,
                isPrivate: data.isPrivate,
            });
            socket.join(room.roomId);

            if (ack) {
                ack({ success: true, data: room });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to create room');
        }
    });

    socket.on('joinRoom', async (data: { roomId?: string } = {}, ack?: Ack<Room>) => {
        try {
            const roomId = data.roomId?.trim();
            if (!roomId) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const existingRoom = await roomService.getRoom(roomId);
            if (!existingRoom) {
                respondWithError(ack, 'Room not found');
                return;
            }

            const alreadyJoined = existingRoom.users.some(member => member.userId === user.userId);
            const room = await roomService.joinRoom(roomId, {
                userId: user.userId,
                username: user.username,
            });

            socket.join(roomId);

            if (!alreadyJoined) {
                socket.to(roomId).emit('userJoined', {
                    userId: user.userId,
                    username: user.username,
                    room,
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

    socket.on('leaveRoom', async (data: { roomId?: string } = {}, ack?: Ack<Room>) => {
        try {
            const roomId = data.roomId?.trim();
            if (!roomId) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const membershipError = await ensureRoomMember<Room>(roomId, user.userId);
            if (membershipError) {
                if (ack) {
                    ack(membershipError);
                }
                return;
            }

            socket.leave(roomId);

            const updatedRoom = await roomService.leaveRoom(roomId, user.userId);

            socket.to(roomId).emit('userLeft', {
                userId: user.userId,
                username: user.username,
                room: updatedRoom,
            });
            if (ack) {
                ack({ success: true, data: updatedRoom });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to leave room');
        }
    });

    socket.on('play', async (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        try {
            const { roomId, currentTime } = data;
            if (!roomId?.trim()) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const normalizedRoomId = roomId.trim();
            const membershipError = await ensureRoomMember(normalizedRoomId, user.userId);
            if (membershipError) {
                if (ack) {
                    ack(membershipError);
                }
                return;
            }

            if (!(await roomService.isRoomHost(normalizedRoomId, user.userId))) {
                respondWithError(ack, 'Only the host can control playback');
                return;
            }

            await roomService.updatePlayback(normalizedRoomId, { isPlaying: true, currentTime });

            io.to(normalizedRoomId).emit('play', { currentTime });
            if (ack) {
                ack({ success: true });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to play video');
        }
    });

    socket.on('pause', async (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        try {
            const { roomId, currentTime } = data;
            if (!roomId?.trim()) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const normalizedRoomId = roomId.trim();
            const membershipError = await ensureRoomMember(normalizedRoomId, user.userId);
            if (membershipError) {
                if (ack) {
                    ack(membershipError);
                }
                return;
            }

            if (!(await roomService.isRoomHost(normalizedRoomId, user.userId))) {
                respondWithError(ack, 'Only the host can control playback');
                return;
            }

            await roomService.updatePlayback(normalizedRoomId, { isPlaying: false, currentTime });

            io.to(normalizedRoomId).emit('pause', { currentTime });
            if (ack) {
                ack({ success: true });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to pause video');
        }
    });

    socket.on('seek', async (data: { roomId?: string, currentTime: number }, ack?: Ack) => {
        try {
            const { roomId, currentTime } = data;
            if (!roomId?.trim()) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const normalizedRoomId = roomId.trim();
            const membershipError = await ensureRoomMember(normalizedRoomId, user.userId);
            if (membershipError) {
                if (ack) {
                    ack(membershipError);
                }
                return;
            }

            if (!(await roomService.isRoomHost(normalizedRoomId, user.userId))) {
                respondWithError(ack, 'Only the host can control playback');
                return;
            }

            await roomService.updatePlayback(normalizedRoomId, { currentTime });

            io.to(normalizedRoomId).emit('seek', { currentTime });
            if (ack) {
                ack({ success: true });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to seek video');
        }
    });

    socket.on('videoChange', async (data: { roomId?: string, videoUrl: string }, ack?: Ack) => {
        try {
            const { roomId, videoUrl } = data;
            if (!roomId?.trim()) {
                respondWithError(ack, 'Room ID is required');
                return;
            }

            const normalizedRoomId = roomId.trim();
            const membershipError = await ensureRoomMember(normalizedRoomId, user.userId);
            if (membershipError) {
                if (ack) {
                    ack(membershipError);
                }
                return;
            }

            if (!(await roomService.isRoomHost(normalizedRoomId, user.userId))) {
                respondWithError(ack, 'Only the host can change the video');
                return;
            }

            await roomService.updatePlayback(normalizedRoomId, { videoUrl, currentTime: 0, isPlaying: false });
            await roomService.persistRoomSnapshot(normalizedRoomId);

            io.to(normalizedRoomId).emit('videoChange', { videoUrl });
            if (ack) {
                ack({ success: true });
            }
        } catch (error) {
            console.error(error);
            respondWithError(ack, 'Failed to change video');
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
        const membershipError = await ensureRoomMember(normalizedRoomId, user.userId);
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
