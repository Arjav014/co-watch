export interface RoomUser {
    userId: string;
    username: string;
}

export interface Room {
    roomId: string;
    roomName: string;
    hostId: string;
    videoUrl: string;
    currentTime: number;
    isPlaying: boolean;
    isPrivate?: boolean;
    users: RoomUser[];
}
