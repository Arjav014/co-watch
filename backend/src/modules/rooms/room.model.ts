import mongoose, { Schema, type Document } from 'mongoose';
import { RoomUser } from './room.types';

interface IRoomUser {
    userId: string;
    username: string;
}

export interface IRoom extends Document {
    roomId: string;
    roomName: string;
    hostId: string;
    videoUrl: string;
    currentTime: number;
    isPlaying: boolean;
    isPrivate: boolean;
    users: RoomUser[];
    createdAt: Date;
    updatedAt: Date;
}

const roomUserSchema = new Schema<IRoomUser>(
    {
        userId: { type: String, required: true },
        username: { type: String, required: true },
    },
    { _id: false }
);

const roomSchema = new Schema<IRoom>(
    {
        roomId: { type: String, required: true, unique: true, index: true },
        roomName: { type: String, required: true },
        hostId: { type: String, required: true },
        videoUrl: { type: String, required: true },
        currentTime: { type: Number, default: 0 },
        isPlaying: { type: Boolean, default: false },
        isPrivate: { type: Boolean, default: false },
        users: { type: [roomUserSchema], default: [] },
    },
    {
        timestamps: true,
    }
);

export const RoomModel = mongoose.model<IRoom>('Room', roomSchema);
