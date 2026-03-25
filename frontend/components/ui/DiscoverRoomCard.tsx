import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import type { RoomUser } from '@/types';
import DiscoverRoomPreview from './DiscoverRoomPreview';

interface DiscoverRoomCardProps {
  roomId: string;
  roomName: string;
  hostUsername: string;
  users: RoomUser[];
  isPlaying: boolean;
  isPrivate?: boolean;
  videoUrl?: string;
  onPress?: () => void;
}

function formatWatchers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toString();
}

export default function DiscoverRoomCard({
  roomId,
  roomName,
  hostUsername,
  users,
  isPlaying,
  isPrivate,
  videoUrl,
  onPress,
}: DiscoverRoomCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mb-5 border border-[#27272a] rounded-2xl overflow-hidden bg-[#09090b]"
    >
      <View className="w-full h-[160px]">
        <DiscoverRoomPreview roomName={roomName} videoUrl={videoUrl} />

        <View className="absolute top-3 left-3 flex-row items-center bg-black/55 rounded-full px-3 py-1.5">
          <View className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
          <Text className="text-white text-xs font-bold tracking-wide">
            {formatWatchers(users.length)} WATCHING
          </Text>
        </View>

        <View className="absolute top-3 right-3 flex-row items-center gap-2">
          {isPlaying ? (
            <View className="flex-row items-center bg-emerald-500/85 rounded-full px-2.5 py-1">
              <Ionicons name="play-circle" size={12} color="white" style={{ marginRight: 4 }} />
              <Text className="text-white text-[10px] font-bold tracking-wider">LIVE</Text>
            </View>
          ) : null}
          {isPrivate ? (
            <View className="flex-row items-center bg-black/55 rounded-full px-2.5 py-1">
              <Ionicons name="lock-closed" size={12} color="#a1a1aa" />
            </View>
          ) : null}
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <Text
            className="text-white text-[17px] font-bold flex-1 mr-3"
            numberOfLines={1}
          >
            {roomName}
          </Text>
          <View className="bg-[#27272a] rounded-md px-2.5 py-1 mt-0.5">
            <Text className="text-zinc-400 text-[11px] font-bold tracking-wider uppercase">
              {roomId}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar username={hostUsername} size="sm" />
            <Text className="text-zinc-500 text-[13px] font-medium ml-2">
              Hosted by{' '}
              <Text className="text-zinc-300">{hostUsername}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={14} color="#71717a" style={{ marginRight: 4 }} />
            <Text className="text-zinc-500 text-[12px] font-medium">
              {users.length}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
