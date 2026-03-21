import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { createRoom, getRoom, joinRoom, leaveRoom } from '@/services/rooms';
import { getBaseUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type {
  ChatMessage,
  CreateRoomPayload,
  PresenceEvent,
  Room,
} from '@/types';

type AckResponse<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
};

interface RoomSessionContextType {
  activeRoom: Room | null;
  messages: ChatMessage[];
  isRoomLoading: boolean;
  isSocketConnected: boolean;
  roomError: string;
  clearRoomError: () => void;
  createAndJoinRoom: (payload: CreateRoomPayload) => Promise<Room>;
  joinExistingRoom: (roomId: string) => Promise<Room>;
  hydrateRoom: (roomId: string) => Promise<Room>;
  leaveActiveRoom: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  togglePlayback: (currentTime?: number) => Promise<void>;
  seekPlayback: (currentTime: number) => Promise<void>;
}

const RoomSessionContext = createContext<RoomSessionContextType | undefined>(undefined);

const SOCKET_URL = getBaseUrl();

function buildSystemMessage(text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'system',
    userId: 'system',
    message: text,
    timestamp: new Date().toISOString(),
  };
}

function buildChatMessage(payload: {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}): ChatMessage {
  return {
    id: `${payload.timestamp}-${payload.userId}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'chat',
    userId: payload.userId,
    username: payload.username,
    message: payload.message,
    timestamp: payload.timestamp,
  };
}

export function RoomSessionProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const activeRoomRef = useRef<Room | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [roomError, setRoomError] = useState('');

  const clearRoomError = () => setRoomError('');

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const disconnectSocket = () => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    socket.removeAllListeners();
    socket.disconnect();
    socketRef.current = null;
    setIsSocketConnected(false);
  };

  const attachRoomListeners = (socket: Socket) => {
    socket.on('connect', () => {
      setIsSocketConnected(true);

      if (activeRoomRef.current?.roomId) {
        socket.emit('joinRoom', { roomId: activeRoomRef.current.roomId });
      }
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('play', ({ currentTime }: { currentTime: number }) => {
      setActiveRoom((previous) =>
        previous
          ? {
              ...previous,
              isPlaying: true,
              currentTime,
            }
          : previous
      );
    });

    socket.on('pause', ({ currentTime }: { currentTime: number }) => {
      setActiveRoom((previous) =>
        previous
          ? {
              ...previous,
              isPlaying: false,
              currentTime,
            }
          : previous
      );
    });

    socket.on('seek', ({ currentTime }: { currentTime: number }) => {
      setActiveRoom((previous) =>
        previous
          ? {
              ...previous,
              currentTime,
            }
          : previous
      );
    });

    socket.on('videoChange', ({ videoUrl }: { videoUrl: string }) => {
      setActiveRoom((previous) =>
        previous
          ? {
              ...previous,
              videoUrl,
              currentTime: 0,
              isPlaying: false,
            }
          : previous
      );
    });

    socket.on('chatMessage', (payload: {
      userId: string;
      username: string;
      message: string;
      timestamp: string | Date;
    }) => {
      setMessages((previous) => [
        ...previous,
        buildChatMessage({
          ...payload,
          timestamp: new Date(payload.timestamp).toISOString(),
        }),
      ]);
    });

    socket.on('userJoined', (payload: PresenceEvent) => {
      if (payload.room) {
        setActiveRoom(payload.room);
      }
      setMessages((previous) => [
        ...previous,
        buildSystemMessage(`${payload.username.toUpperCase()} JOINED THE ROOM`),
      ]);
    });

    socket.on('userLeft', (payload: PresenceEvent) => {
      setActiveRoom(payload.room ?? null);
      setMessages((previous) => [
        ...previous,
        buildSystemMessage(`${payload.username.toUpperCase()} LEFT THE ROOM`),
      ]);
    });
  };

  const ensureSocketForRoom = (room: Room) => {
    if (!token) {
      return;
    }

    disconnectSocket();

    const socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;
    attachRoomListeners(socket);
    socket.emit('joinRoom', { roomId: room.roomId });
  };

  const hydrateRoom = async (roomId: string) => {
    setIsRoomLoading(true);
    setRoomError('');

    try {
      const room = await getRoom(roomId);
      setActiveRoom(room);
      ensureSocketForRoom(room);
      return room;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Failed to load room';
      setRoomError(message);
      throw error;
    } finally {
      setIsRoomLoading(false);
    }
  };

  const createAndJoinRoom = async (payload: CreateRoomPayload) => {
    setIsRoomLoading(true);
    setRoomError('');

    try {
      const room = await createRoom(payload);
      setActiveRoom(room);
      setMessages([]);
      ensureSocketForRoom(room);
      return room;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Failed to create room';
      setRoomError(message);
      throw error;
    } finally {
      setIsRoomLoading(false);
    }
  };

  const joinExistingRoom = async (roomId: string) => {
    setIsRoomLoading(true);
    setRoomError('');

    try {
      const room = await joinRoom({ roomId });
      setActiveRoom(room);
      setMessages([]);
      ensureSocketForRoom(room);
      return room;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Failed to join room';
      setRoomError(message);
      throw error;
    } finally {
      setIsRoomLoading(false);
    }
  };

  const leaveActiveRoom = async () => {
    const currentRoom = activeRoomRef.current;
    if (!currentRoom) {
      return;
    }

    setIsRoomLoading(true);
    setRoomError('');
    let shouldResetState = false;

    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit('leaveRoom', { roomId: currentRoom.roomId }, (response: AckResponse<Room>) => {
            if (!response.success) {
              reject(new Error(response.message || 'Failed to leave room'));
              return;
            }
            resolve();
          });
        });
      } else {
        await leaveRoom(currentRoom.roomId);
      }
      shouldResetState = true;
    } catch (error: any) {
      const message = error?.message ?? 'Failed to leave room';
      setRoomError(message);
      throw error;
    } finally {
      if (shouldResetState) {
        disconnectSocket();
        setActiveRoom(null);
        setMessages([]);
      }
      setIsRoomLoading(false);
    }
  };

  const sendChatMessage = async (message: string) => {
    const socket = socketRef.current;
    const room = activeRoomRef.current;
    const trimmedMessage = message.trim();
    if (!socket || !room || !trimmedMessage) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      socket.emit(
        'chatMessage',
        { roomId: room.roomId, message: trimmedMessage },
        (response: AckResponse) => {
          if (!response.success) {
            reject(new Error(response.message || 'Failed to send message'));
            return;
          }
          resolve();
        }
      );
    });
  };

  const togglePlayback = async (currentTime?: number) => {
    const socket = socketRef.current;
    const room = activeRoomRef.current;
    if (!socket || !room || !user || room.hostId !== user.id) {
      return;
    }

    const eventName = room.isPlaying ? 'pause' : 'play';
    const nextCurrentTime = currentTime ?? room.currentTime;
    const previousRoom = room;

    setActiveRoom((currentRoom) =>
      currentRoom
        ? {
            ...currentRoom,
            isPlaying: !currentRoom.isPlaying,
            currentTime: nextCurrentTime,
          }
        : currentRoom
    );

    try {
      await new Promise<void>((resolve, reject) => {
        socket.emit(
          eventName,
          { roomId: room.roomId, currentTime: nextCurrentTime },
          (response: AckResponse) => {
            if (!response.success) {
              reject(new Error(response.message || 'Failed to update playback'));
              return;
            }
            resolve();
          }
        );
      });
    } catch (error) {
      setActiveRoom(previousRoom);
      throw error;
    }
  };

  const seekPlayback = async (currentTime: number) => {
    const socket = socketRef.current;
    const room = activeRoomRef.current;
    if (!socket || !room || !user || room.hostId !== user.id) {
      return;
    }

    const previousRoom = room;
    setActiveRoom((currentRoom) =>
      currentRoom
        ? {
            ...currentRoom,
            currentTime,
          }
        : currentRoom
    );

    try {
      await new Promise<void>((resolve, reject) => {
        socket.emit(
          'seek',
          { roomId: room.roomId, currentTime },
          (response: AckResponse) => {
            if (!response.success) {
              reject(new Error(response.message || 'Failed to seek playback'));
              return;
            }
            resolve();
          }
        );
      });
    } catch (error) {
      setActiveRoom(previousRoom);
      throw error;
    }
  };

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setActiveRoom(null);
      setMessages([]);
    }

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <RoomSessionContext.Provider
      value={{
        activeRoom,
        messages,
        isRoomLoading,
        isSocketConnected,
        roomError,
        clearRoomError,
        createAndJoinRoom,
        joinExistingRoom,
        hydrateRoom,
        leaveActiveRoom,
        sendChatMessage,
        togglePlayback,
        seekPlayback,
      }}
    >
      {children}
    </RoomSessionContext.Provider>
  );
}

export function useRoomSession() {
  const context = useContext(RoomSessionContext);
  if (!context) {
    throw new Error('useRoomSession must be used within a RoomSessionProvider');
  }

  return context;
}
