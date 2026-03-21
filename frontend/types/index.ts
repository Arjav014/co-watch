export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

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

export interface CreateRoomPayload {
  roomName: string;
  videoUrl: string;
  isPrivate?: boolean;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface ChatMessage {
  id: string;
  type: 'chat' | 'system';
  userId: string;
  username?: string;
  message: string;
  timestamp: string;
}

export interface PresenceEvent {
  userId: string;
  username: string;
  room?: Room | null;
}
