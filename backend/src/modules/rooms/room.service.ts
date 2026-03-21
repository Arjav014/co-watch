import { getRedisClient } from '../../config/redis';
import { RoomModel, type IRoom } from './room.model';
import { Room, RoomUser } from './room.types';

const ACTIVE_ROOM_TTL_SECONDS = Number(process.env.ROOM_ACTIVE_TTL_SECONDS || 60 * 60 * 6);

const activeRoomKey = (roomId: string) => `room:active:${roomId}`;

type CreateRoomInput = {
    roomName: string;
    videoUrl: string;
    isPrivate?: boolean;
};

const mapDocumentToRoom = (roomDoc: Pick<IRoom, 'roomId' | 'roomName' | 'hostId' | 'videoUrl' | 'currentTime' | 'isPlaying' | 'isPrivate' | 'users'>): Room => ({
    roomId: roomDoc.roomId,
    roomName: roomDoc.roomName,
    hostId: roomDoc.hostId,
    videoUrl: roomDoc.videoUrl,
    currentTime: roomDoc.currentTime,
    isPlaying: roomDoc.isPlaying,
    isPrivate: roomDoc.isPrivate,
    users: roomDoc.users.map((user) => ({
        userId: user.userId,
        username: user.username,
    })),
});

const loadActiveRoom = async (roomId: string): Promise<Room | null> => {
    const client = getRedisClient();
    const payload = await client.get(activeRoomKey(roomId));
    if (!payload) {
        return null;
    }

    return JSON.parse(payload) as Room;
};

const saveActiveRoom = async (room: Room) => {
    const client = getRedisClient();
    await client.set(activeRoomKey(room.roomId), JSON.stringify(room), {
        EX: ACTIVE_ROOM_TTL_SECONDS,
    });
};

const deleteActiveRoom = async (roomId: string) => {
    const client = getRedisClient();
    await client.del(activeRoomKey(roomId));
};

const saveRoomToMongo = async (room: Room) => {
    await RoomModel.findOneAndUpdate(
        { roomId: room.roomId },
        {
            roomName: room.roomName,
            hostId: room.hostId,
            videoUrl: room.videoUrl,
            currentTime: room.currentTime,
            isPlaying: room.isPlaying,
            isPrivate: room.isPrivate ?? false,
            users: room.users,
        },
        { new: true, upsert: true }
    );
};

const hydrateRoomFromMongo = async (roomId: string): Promise<Room | null> => {
    const roomDoc = await RoomModel.findOne({ roomId }).lean();
    if (!roomDoc) {
        return null;
    }

    return mapDocumentToRoom(roomDoc);
};

const getDurableRoom = async (roomId: string): Promise<Room | null> => {
    const activeRoom = await loadActiveRoom(roomId);
    if (activeRoom) {
        return activeRoom;
    }

    const durableRoom = await hydrateRoomFromMongo(roomId);
    if (!durableRoom) {
        return null;
    }

    if (durableRoom.users.length > 0) {
        await saveActiveRoom(durableRoom);
    }

    return durableRoom;
};

const generateRoomId = async (): Promise<string> => {
    let roomId = '';

    do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await RoomModel.exists({ roomId }));

    return roomId;
};

export const createRoom = async (
    hostId: string,
    hostUsername: string,
    input: CreateRoomInput
): Promise<Room> => {
    const roomId = await generateRoomId();

    const newRoom: Room = {
        roomId,
        roomName: input.roomName,
        hostId,
        videoUrl: input.videoUrl,
        currentTime: 0,
        isPlaying: false,
        isPrivate: input.isPrivate ?? false,
        users: [{ userId: hostId, username: hostUsername }],
    };

    await saveRoomToMongo(newRoom);
    await saveActiveRoom(newRoom);
    return newRoom;
};

export const joinRoom = async (roomId: string, user: RoomUser): Promise<Room> => {
    const room = await getDurableRoom(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    const isEmptyRoom = room.users.length === 0;
    const userExists = room.users.some((existingUser) => existingUser.userId === user.userId);

    if (isEmptyRoom) {
        room.hostId = user.userId;
        room.isPlaying = false;
    }

    if (!userExists) {
        room.users.push(user);
    }

    await saveActiveRoom(room);
    await saveRoomToMongo(room);
    return room;
};

export const getRoom = async (roomId: string): Promise<Room | undefined> => {
    const room = await getDurableRoom(roomId);
    return room ?? undefined;
};

export const leaveRoom = async (roomId: string, userId: string): Promise<Room | undefined> => {
    const room = await getDurableRoom(roomId);
    if (!room) {
        return undefined;
    }

    room.users = room.users.filter((user) => user.userId !== userId);

    if (room.users.length === 0) {
        room.isPlaying = false;
        await saveRoomToMongo(room);
        await deleteActiveRoom(roomId);
        return room;
    }

    if (room.hostId === userId) {
        room.hostId = room.users[0].userId;
    }

    await saveActiveRoom(room);
    await saveRoomToMongo(room);
    return room;
};

export const updatePlayback = async (roomId: string, update: Partial<Room>): Promise<Room> => {
    const room = await getDurableRoom(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    if (update.currentTime !== undefined) room.currentTime = update.currentTime;
    if (update.isPlaying !== undefined) room.isPlaying = update.isPlaying;
    if (update.videoUrl !== undefined) room.videoUrl = update.videoUrl;

    await saveActiveRoom(room);
    void saveRoomToMongo(room);
    return room;
};

export const persistRoomSnapshot = async (roomId: string) => {
    const activeRoom = await loadActiveRoom(roomId);
    if (activeRoom) {
        await saveRoomToMongo(activeRoom);
    }
};

export const isRoomMember = async (roomId: string, userId: string): Promise<boolean> => {
    const room = await getDurableRoom(roomId);
    if (!room) {
        return false;
    }

    return room.users.some((user) => user.userId === userId);
};

export const isRoomHost = async (roomId: string, userId: string): Promise<boolean> => {
    const room = await getDurableRoom(roomId);
    if (!room) {
        return false;
    }

    return room.hostId === userId;
};
