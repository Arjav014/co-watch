import { Room, RoomUser } from './room.types';

// In-memory store
const rooms = new Map<string, Room>();

const generateRoomId = (): string => {
    let roomId = '';

    do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (rooms.has(roomId));

    return roomId;
};

export const createRoom = (hostId: string, hostUsername: string, videoUrl = ''): Room => {
    const roomId = generateRoomId();

    const newRoom: Room = {
        roomId,
        hostId,
        videoUrl,
        currentTime: 0,
        isPlaying: false,
        users: [{ userId: hostId, username: hostUsername }]
    };

    rooms.set(roomId, newRoom);
    return newRoom;
};

export const joinRoom = (roomId: string, user: RoomUser): Room => {
    const room = rooms.get(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    const userExists = room.users.find(u => u.userId === user.userId);
    if (!userExists) {
        room.users.push(user);
        rooms.set(roomId, room);
    }

    return room;
};

export const getRoom = (roomId: string): Room | undefined => {
    return rooms.get(roomId);
};

export const leaveRoom = (roomId: string, userId: string): Room | undefined => {
    const room = rooms.get(roomId);
    if (!room) return undefined;

    room.users = room.users.filter(u => u.userId !== userId);

    if (room.users.length === 0) {
        rooms.delete(roomId);
        return undefined;
    } else {
        if (room.hostId === userId && room.users.length > 0) {
            room.hostId = room.users[0].userId;
        }
        rooms.set(roomId, room);
        return room;
    }
};

export const updatePlayback = (roomId: string, update: Partial<Room>): Room => {
    const room = rooms.get(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    if (update.currentTime !== undefined) room.currentTime = update.currentTime;
    if (update.isPlaying !== undefined) room.isPlaying = update.isPlaying;
    if (update.videoUrl !== undefined) room.videoUrl = update.videoUrl;

    rooms.set(roomId, room);
    return room;
};

export const isRoomMember = (roomId: string, userId: string): boolean => {
    const room = rooms.get(roomId);
    if (!room) return false;

    return room.users.some(user => user.userId === userId);
};

export const isRoomHost = (roomId: string, userId: string): boolean => {
    const room = rooms.get(roomId);
    if (!room) return false;

    return room.hostId === userId;
};
