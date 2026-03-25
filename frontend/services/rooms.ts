import api from '@/services/api';
import type {
  ApiResponse,
  CreateRoomPayload,
  JoinRoomPayload,
  Room,
} from '@/types';

export async function createRoom(payload: CreateRoomPayload) {
  const { data } = await api.post<ApiResponse<Room>>('/rooms/create', payload);
  return data.data;
}

export async function joinRoom(payload: JoinRoomPayload) {
  const { data } = await api.post<ApiResponse<Room>>('/rooms/join', payload);
  return data.data;
}

export async function getRoom(roomId: string) {
  const { data } = await api.get<ApiResponse<Room>>(`/rooms/${roomId}`);
  return data.data;
}

export async function listRooms(search?: string) {
  const { data } = await api.get<ApiResponse<Room[]>>('/rooms/discover', {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return data.data;
}

export async function leaveRoom(roomId: string) {
  const { data } = await api.post<ApiResponse<Room | null>>('/rooms/leave', { roomId });
  return data.data;
}
