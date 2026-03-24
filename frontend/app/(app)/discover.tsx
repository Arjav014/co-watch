import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import DiscoverRoomCard from '@/components/ui/DiscoverRoomCard';

const CATEGORIES = [
  'ALL ROOMS',
  'TRENDING',
  'SCI-FI',
  'DRAMA',
  'COMEDY',
  'HORROR',
  'ANIME',
  'DOCUMENTARY',
];

// Helper to generate mock user arrays of a given size
function mockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    userId: `user-${i + 1}`,
    username: `user${i + 1}`,
  }));
}

const MOCK_ROOMS = [
  {
    roomId: 'room-1',
    roomName: 'Interstellar Fan Group',
    genre: 'SCI-FI',
    hostUsername: 'Nolan_Geek',
    users: mockUsers(1200),
    isPlaying: true,
    isPrivate: false,
    videoUrl: 'https://example.com/interstellar',
    gradientColors: ['#1a1a2e', '#e94560', '#0f3460'] as [string, string, string],
    icon: 'planet-outline' as const,
  },
  {
    roomId: 'room-2',
    roomName: 'Nature Docs Chill',
    genre: 'DOCUMENTARY',
    hostUsername: 'EarthWatch',
    users: mockUsers(842),
    isPlaying: true,
    isPrivate: false,
    videoUrl: 'https://example.com/nature-docs',
    gradientColors: ['#0b3d0b', '#1b5e20', '#2e7d32'] as [string, string, string],
    icon: 'leaf-outline' as const,
  },
  {
    roomId: 'room-3',
    roomName: 'Classic Noir Rewatch',
    genre: 'CLASSIC',
    hostUsername: 'FilmBuff99',
    users: mockUsers(3100),
    isPlaying: false,
    isPrivate: false,
    videoUrl: 'https://example.com/noir-classics',
    gradientColors: ['#212121', '#424242', '#616161'] as [string, string, string],
    icon: 'videocam-outline' as const,
  },
  {
    roomId: 'room-4',
    roomName: 'Neon Nights: Anime',
    genre: 'ANIME',
    hostUsername: 'Aicra_Fan',
    users: mockUsers(520),
    isPlaying: true,
    isPrivate: false,
    videoUrl: 'https://example.com/anime-nights',
    gradientColors: ['#4a148c', '#7c43bd', '#e040fb'] as [string, string, string],
    icon: 'sparkles-outline' as const,
  },
  {
    roomId: 'room-5',
    roomName: 'Friday Fright Night',
    genre: 'HORROR',
    hostUsername: 'GhostHunter',
    users: mockUsers(3100),
    isPlaying: true,
    isPrivate: true,
    videoUrl: 'https://example.com/fright-night',
    gradientColors: ['#b71c1c', '#880e4f', '#311b92'] as [string, string, string],
    icon: 'skull-outline' as const,
  },
  {
    roomId: 'room-6',
    roomName: 'Indie Shorts Marathon',
    genre: 'INDIE',
    hostUsername: 'DirectorCut',
    users: mockUsers(154),
    isPlaying: false,
    isPrivate: false,
    videoUrl: 'https://example.com/indie-shorts',
    gradientColors: ['#1a237e', '#283593', '#3949ab'] as [string, string, string],
    icon: 'film-outline' as const,
  },
];

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL ROOMS');

  return (
    <View className="flex-1 bg-[#18181b]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-5">
          <View className="flex-row items-center">
            <Ionicons name="search" size={22} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-[22px] font-bold">Discover</Text>
          </View>
          <View className="p-0.5 rounded-full bg-yellow-50">
            <Avatar username={user?.username ?? 'User'} size="sm" />
          </View>
        </View>

        {/* Search Bar */}
        <View className="mx-6 mb-5">
          <View className="flex-row items-center bg-[#27272a] rounded-xl px-4 h-12">
            <Ionicons name="search-outline" size={18} color="#71717a" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search rooms, movies, or creators..."
              placeholderTextColor="#71717a"
              className="flex-1 text-white text-sm"
              editable={false}
            />
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, marginBottom: 8 }}
          className="mb-4"
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl border ${
                  isActive
                    ? 'bg-white border-white'
                    : 'bg-transparent border-[#3f3f46]'
                }`}
              >
                <Text
                  className={`text-xs font-bold tracking-wider ${
                    isActive ? 'text-black' : 'text-zinc-400'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Room Cards */}
        <View className="px-6 mt-2">
          {MOCK_ROOMS.map((room) => (
            <DiscoverRoomCard
              key={room.roomId}
              roomName={room.roomName}
              genre={room.genre}
              hostUsername={room.hostUsername}
              users={room.users}
              isPlaying={room.isPlaying}
              isPrivate={room.isPrivate}
              videoUrl={room.videoUrl}
              gradientColors={room.gradientColors}
              icon={room.icon}
              onPress={() => console.log('Open room:', room.roomId)}
            />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
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
      >
        <Ionicons name="add" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}
