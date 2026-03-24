import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import type { RoomUser } from '@/types';

interface DiscoverRoomCardProps {
  roomName: string;
  genre: string;
  hostUsername: string;
  users: RoomUser[];
  isPlaying: boolean;
  isPrivate?: boolean;
  videoUrl?: string;
  gradientColors: [string, string, string];
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

function formatWatchers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toString();
}

export default function DiscoverRoomCard({
  roomName,
  genre,
  hostUsername,
  users,
  isPlaying,
  isPrivate,
  videoUrl,
  gradientColors,
  icon = 'film-outline',
  onPress,
}: DiscoverRoomCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mb-5 border border-[#27272a] rounded-2xl overflow-hidden bg-[#09090b]"
    >
      {/* Gradient Thumbnail */}
      <View className="w-full h-[160px]">
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Large background icon */}
          <Ionicons name={icon} size={56} color="rgba(255,255,255,0.15)" />

          {/* Watcher count badge */}
          <View
            className="absolute top-3 left-3 flex-row items-center bg-black/50 rounded-full px-3 py-1.5"
          >
            <View className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <Text className="text-white text-xs font-bold tracking-wide">
              {formatWatchers(users.length)} WATCHING
            </Text>
          </View>

          {/* Live / Private badges */}
          <View className="absolute top-3 right-3 flex-row items-center gap-2">
            {isPlaying && (
              <View className="flex-row items-center bg-emerald-500/80 rounded-full px-2.5 py-1">
                <Ionicons name="play-circle" size={12} color="white" style={{ marginRight: 4 }} />
                <Text className="text-white text-[10px] font-bold tracking-wider">LIVE</Text>
              </View>
            )}
            {isPrivate && (
              <View className="flex-row items-center bg-black/50 rounded-full px-2.5 py-1">
                <Ionicons name="lock-closed" size={12} color="#a1a1aa" />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Info section */}
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
              {genre}
            </Text>
          </View>
        </View>

        {/* Host row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar username={hostUsername} size="sm" />
            <Text className="text-zinc-500 text-[13px] font-medium ml-2">
              Hosted by{' '}
              <Text className="text-zinc-300">{hostUsername}</Text>
            </Text>
          </View>

          {/* User count */}
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
