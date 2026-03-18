import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';

// ── Settings items ──

const SETTINGS = [
  {
    id: 'account',
    icon: 'person-outline' as const,
    title: 'Account',
    subtitle: 'Personal information, email',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline' as const,
    title: 'Notifications',
    subtitle: 'Push, email, activity alerts',
  },
  {
    id: 'security',
    icon: 'shield-outline' as const,
    title: 'Security',
    subtitle: 'Password, 2FA, devices',
  },
  {
    id: 'appearance',
    icon: 'color-palette-outline' as const,
    title: 'Appearance',
    subtitle: 'Theme, player UI styles',
  },
];

// ── Component ──

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const displayName = user?.username ?? 'Alex Rivers';
  const displayEmail = user?.email ?? 'alex.rivers@cowatch.app';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      {/* ─── Header ─── */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Profile</Text>
        <TouchableOpacity className="p-1">
          <Ionicons name="ellipsis-vertical" size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
      >
        {/* ─── Avatar + Info ─── */}
        <View className="items-center mt-6 mb-8">
          <View className="relative mb-5">
            <View className="w-28 h-28 rounded-full bg-[#f5cdb6] items-center justify-center">
              <Ionicons name="person" size={52} color="#d4a98a" />
            </View>
            {/* Edit badge */}
            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#27272a] items-center justify-center border-2 border-[#09090b]">
              <Ionicons name="pencil" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold mb-1">{displayName}</Text>
          <Text className="text-zinc-500 text-sm">{displayEmail}</Text>
        </View>

        {/* ─── Settings ─── */}
        <Text className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4 ml-1">
          SETTINGS
        </Text>

        {SETTINGS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            className="flex-row items-center py-4"
          >
            <View className="w-11 h-11 rounded-xl bg-[#18181b] items-center justify-center mr-4">
              <Ionicons name={item.icon} size={20} color="#a1a1aa" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-bold">{item.title}</Text>
              <Text className="text-zinc-500 text-xs mt-0.5">{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#3f3f46" />
          </TouchableOpacity>
        ))}

        {/* ─── Logout ─── */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="bg-white rounded-2xl py-4 items-center justify-center mt-8"
        >
          <Text className="text-[#09090b] text-base font-bold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
