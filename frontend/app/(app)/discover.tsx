import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRoomSession } from '@/context/RoomSessionContext';
import Avatar from '@/components/ui/Avatar';
import DiscoverRoomCard from '@/components/ui/DiscoverRoomCard';
import { listRooms } from '@/services/rooms';
import { getErrorMessage } from '@/services/api';
import type { Room } from '@/types';

function getHostUsername(room: Room) {
  return room.users.find((participant) => participant.userId === room.hostId)?.username ?? 'Unknown';
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { joinExistingRoom } = useRoomSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  const loadRooms = React.useCallback(async (search: string) => {
    setIsLoadingRooms(true);
    setRoomsError('');

    try {
      const nextRooms = await listRooms(search);
      setRooms(nextRooms);
    } catch (error) {
      setRooms([]);
      setRoomsError(getErrorMessage(error));
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText]);

  useEffect(() => {
    void loadRooms(debouncedSearchText).catch(() => undefined);
  }, [debouncedSearchText, loadRooms]);

  useFocusEffect(
    React.useCallback(() => {
      void loadRooms(debouncedSearchText);
    }, [debouncedSearchText, loadRooms])
  );

  const emptyStateText = useMemo(() => {
    if (debouncedSearchText) {
      return `No public rooms found for "${debouncedSearchText}".`;
    }

    return 'No public rooms are live right now. Create one to get things started.';
  }, [debouncedSearchText]);

  const handleJoinRoom = async (roomId: string) => {
    if (joiningRoomId) {
      return;
    }

    setJoiningRoomId(roomId);
    setRoomsError('');

    try {
      const room = await joinExistingRoom(roomId);
      router.replace({
        pathname: '/(app)/watch-room',
        params: { roomId: room.roomId },
      });
    } catch (error) {
      setRoomsError(getErrorMessage(error));
    } finally {
      setJoiningRoomId(null);
    }
  };

  return (
    <View className="flex-1 bg-[#18181b]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-6 mb-5">
          <View className="flex-row items-center">
            <Ionicons name="search" size={22} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-[22px] font-bold">Discover</Text>
          </View>
          <View className="p-0.5 rounded-full bg-yellow-50">
            <Avatar username={user?.username ?? 'User'} size="sm" />
          </View>
        </View>

        <View className="mx-6 mb-3">
          <Text className="text-zinc-400 text-sm leading-5 mb-3">
            Browse live public rooms and jump straight into what people are watching.
          </Text>
          <View className="flex-row items-center bg-[#27272a] rounded-xl px-4 h-12">
            <Ionicons name="search-outline" size={18} color="#71717a" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search public rooms by name..."
              placeholderTextColor="#71717a"
              className="flex-1 text-white text-sm"
              autoCapitalize="none"
              autoCorrect={false}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color="#71717a" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {roomsError ? (
          <View className="mx-6 mb-2 flex-row items-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
            <Text className="ml-2 flex-1 text-sm text-red-300">{roomsError}</Text>
          </View>
        ) : null}

        <View className="px-6 mt-2">
          {isLoadingRooms ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-zinc-400 text-sm mt-4">Loading public rooms...</Text>
            </View>
          ) : null}

          {!isLoadingRooms && !rooms.length ? (
            <View className="items-center rounded-2xl border border-[#27272a] bg-[#09090b] px-6 py-12">
              <Ionicons name="videocam-outline" size={36} color="#71717a" />
              <Text className="text-white text-lg font-bold mt-4 mb-2">Nothing To Discover Yet</Text>
              <Text className="text-zinc-500 text-sm text-center leading-6">
                {emptyStateText}
              </Text>
            </View>
          ) : null}

          {!isLoadingRooms && rooms.length ? (
            <>
              <Text className="text-zinc-400 text-xs font-bold tracking-[2px] mb-4">
                PUBLIC ROOMS {rooms.length}
              </Text>
              {rooms.map((room) => (
                <DiscoverRoomCard
                  key={room.roomId}
                  roomId={room.roomId}
                  roomName={room.roomName}
                  hostUsername={getHostUsername(room)}
                  users={room.users}
                  isPlaying={room.isPlaying}
                  isPrivate={room.isPrivate}
                  videoUrl={room.videoUrl}
                  onPress={() => void handleJoinRoom(room.roomId)}
                />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-white items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/create-room')}
      >
        <Ionicons name="add" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}
