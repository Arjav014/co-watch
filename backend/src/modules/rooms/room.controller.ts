import { Request, Response, NextFunction } from 'express';
import * as roomService from './room.service';
import {
    createRoomSchema,
    joinRoomSchema,
    leaveRoomSchema,
    updatePlaybackParamsSchema,
    updatePlaybackSchema,
} from './room.schema';

export const createRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const validatedData = createRoomSchema.parse(req.body ?? {});
        const room = roomService.createRoom(user.userId, user.username, validatedData.videoUrl ?? '');

        res.status(201).json({
            success: true,
            data: room,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input' });
            return;
        }
        next(error);
    }
};

export const joinRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { roomId } = joinRoomSchema.parse(req.body);

        const room = roomService.joinRoom(roomId, { userId: user.userId, username: user.username });

        res.status(200).json({
            success: true,
            data: room,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input' });
            return;
        }
        if (error.message === 'Room not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const getRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const room = roomService.getRoom(roomId as string);

        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: room,
        });
    } catch (error) {
        next(error);
    }
};

export const leaveRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { roomId } = leaveRoomSchema.parse(req.body);

        const room = roomService.getRoom(roomId);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }

        if (!roomService.isRoomMember(roomId, user.userId)) {
            res.status(403).json({ success: false, message: 'User is not in this room' });
            return;
        }

        const updatedRoom = roomService.leaveRoom(roomId, user.userId);

        res.status(200).json({
            success: true,
            data: updatedRoom ?? null,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input' });
            return;
        }
        next(error);
    }
};

export const updatePlayback = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { roomId } = updatePlaybackParamsSchema.parse(req.params);
        const playbackUpdate = updatePlaybackSchema.parse(req.body);

        const room = roomService.getRoom(roomId);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }

        if (!roomService.isRoomMember(roomId, user.userId)) {
            res.status(403).json({ success: false, message: 'User is not in this room' });
            return;
        }

        if (!roomService.isRoomHost(roomId, user.userId)) {
            res.status(403).json({ success: false, message: 'Only the host can control playback' });
            return;
        }

        const updatedRoom = roomService.updatePlayback(roomId, playbackUpdate);

        res.status(200).json({
            success: true,
            data: updatedRoom,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid input' });
            return;
        }
        if (error.message === 'Room not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
