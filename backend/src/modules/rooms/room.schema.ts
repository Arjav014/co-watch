import { z } from 'zod';

export const createRoomSchema = z.object({
    roomName: z.string().trim().min(1),
    videoUrl: z.string().trim().min(1),
    isPrivate: z.boolean().optional(),
});

export const joinRoomSchema = z.object({
    roomId: z.string().trim().min(1),
});

export const listRoomsQuerySchema = z.object({
    search: z.string().trim().optional(),
});

export const leaveRoomSchema = z.object({
    roomId: z.string().trim().min(1),
});

export const updatePlaybackParamsSchema = z.object({
    roomId: z.string().trim().min(1),
});

export const updatePlaybackSchema = z.object({
    currentTime: z.number().min(0).optional(),
    isPlaying: z.boolean().optional(),
    videoUrl: z.string().trim().min(1).optional(),
}).refine(
    (data) => data.currentTime !== undefined || data.isPlaying !== undefined || data.videoUrl !== undefined,
    {
        message: 'At least one playback field must be provided',
    }
);
