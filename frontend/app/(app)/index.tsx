import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import RoomCard from '@/components/ui/RoomCard';
import { useRouter } from 'expo-router';

// Dummy data to visualize the design
const MOCK_ROOMS = [
  {
    id: '1',
    title: 'Midnight Thriller Night',
    participants: 4,
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Documentary Club',
    participants: 2,
    timeAgo: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Anime Marathon',
    participants: 8,
    timeAgo: '3 days ago',
    // Deliberately empty imageUrl to show fallback
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView 
      className="flex-1 bg-[#18181b]"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
    >
      {/* Header Profile Row */}
      <View className="flex-row items-center justify-between mb-12">
        <View className="flex-row items-center flex-1">
          <View className="p-1 rounded-full bg-yellow-50 mr-3">
             <Avatar username={user?.username ?? 'Alex Rivera'} size="md" />
          </View>
          <View>
            <Text className="text-zinc-400 text-[11px] font-bold tracking-widest uppercase mb-0.5">
              Welcome back
            </Text>
            <Text className="text-white text-[19px] font-bold">
              {user?.username ?? 'Alex Rivera'}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-12 h-12 rounded-full bg-[#27272a] items-center justify-center">
          <Ionicons name="settings-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Hero Title */}
      <View className="mb-10">
        <Text className="text-[44px] font-extrabold text-white tracking-tight leading-tight mb-2">
          CoWatch
        </Text>
        <Text className="text-zinc-400 text-lg font-medium">
          Sync movies with friends anywhere.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mb-12">
        <Button
          title="Create Room"
          variant="white"
          leftIcon={<Ionicons name="add-circle-outline" size={24} color="black" />}
          className="mb-4"
          onPress={() => router.push('/(app)/create-room')}
        />
        <Button
          title="Join Room"
          variant="secondary"
          leftIcon={<Ionicons name="person-add-outline" size={22} color="white" />}
          className="bg-[#27272a] active:bg-[#3f3f46]"
        />
      </View>

      {/* Recent Rooms Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-[19px] font-bold">Recent Rooms</Text>
        <TouchableOpacity>
          <Text className="text-indigo-400 font-semibold text-[15px]">View all</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Rooms List */}
      <View>
        {MOCK_ROOMS.map((room) => (
          <RoomCard
            key={room.id}
            title={room.title}
            participants={room.participants}
            timeAgo={room.timeAgo}
            imageUrl={room.imageUrl}
            onPress={() => console.log('Press room:', room.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
