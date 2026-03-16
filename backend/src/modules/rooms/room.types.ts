export interface RoomUser {
    userId: string;
    username: string;
}

export interface Room {
    roomId: string;
    hostId: string;
    videoUrl: string;
    currentTime: number;
    isPlaying: boolean;
    users: RoomUser[];
}
