export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface Room {
  roomId: string;
  hostId: string;
  videoUrl: string;
  currentTime: number;
  isPlaying: boolean;
  users: RoomUser[];
}

export interface RoomUser {
  userId: string;
  username: string;
  isHost: boolean;
}

export interface CreateRoomPayload {
  roomName: string;
  videoUrl: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface ChatMessage {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}
