import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-10">
        <View className="flex-row items-center">
          <Avatar username={user?.username} size="lg" />
          <View className="ml-4">
            <Text className="text-zinc-500 text-sm">Welcome back</Text>
            <Text className="text-white text-xl font-bold">
              {user?.username ?? 'User'}
            </Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#a1a1aa" />
      </View>

      {/* Quick Actions */}
      <View className="bg-zinc-900 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-semibold mb-4">
          Start watching
        </Text>
        <Button
          title="Create Room"
          variant="primary"
          className="mb-3"
        />
        <Button
          title="Join Room"
          variant="secondary"
        />
      </View>

      {/* Placeholder for recent rooms */}
      <View className="flex-1 items-center justify-center">
        <Ionicons name="film-outline" size={48} color="#3f3f46" />
        <Text className="text-zinc-600 text-base mt-3">
          No recent rooms yet
        </Text>
      </View>
    </View>
  );
}
