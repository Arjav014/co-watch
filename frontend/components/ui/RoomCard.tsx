import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoomCardProps {
  title: string;
  participants: number;
  timeAgo: string;
  imageUrl?: string;
  onPress?: () => void;
}

export default function RoomCard({
  title,
  participants,
  timeAgo,
  imageUrl,
  onPress,
}: RoomCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center bg-[#18181b] border border-[#27272a] rounded-2xl p-4 mb-4"
    >
      {/* Thumbnail */}
      <View className="w-20 h-20 rounded-xl bg-zinc-800 items-center justify-center overflow-hidden mr-4 shadow-sm">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="film-outline" size={32} color="#52525b" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 justify-center">
        <Text
          className="text-white text-[17px] font-bold mb-1 tracking-tight"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-zinc-400 text-[15px] font-medium">
          {participants} participants • {timeAgo}
        </Text>
      </View>

      {/* Arrow Icon */}
      <View className="ml-2">
        <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
      </View>
    </TouchableOpacity>
  );
}
