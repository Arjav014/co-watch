import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRoomSession } from '@/context/RoomSessionContext';
import { getErrorMessage } from '@/services/api';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { createAndJoinRoom, isRoomLoading, clearRoomError } = useRoomSession();
  const [roomName, setRoomName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    if (!videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }

    clearRoomError();
    setError('');

    try {
      const room = await createAndJoinRoom({
        roomName: roomName.trim(),
        videoUrl: videoUrl.trim(),
        isPrivate,
      });

      router.replace({
        pathname: '/(app)/watch-room',
        params: { roomId: room.roomId },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      <View className="flex-row items-center px-4 py-4 border-b border-zinc-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-white text-lg font-bold pr-8">
          Create Room
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-2 tracking-tight">
            Start a Session
          </Text>
          <Text className="text-[#a1a1aa] text-base leading-6">
            Create a room with a title and a video so everyone joins with the right context.
          </Text>
        </View>

        <View className="mb-6">
          <Input
            label="Room Name"
            placeholder="Friday Movie Night"
            value={roomName}
            onChangeText={setRoomName}
            containerClassName="mb-1"
          />
        </View>

        <View className="mb-2">
          <Input
            label="Video URL"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChangeText={setVideoUrl}
            rightIcon="link-outline"
            autoCapitalize="none"
            containerClassName="mb-1"
          />
          <Text className="text-[#71717a] text-sm ml-1 mt-1">
            Required so the room always has a clear video reference.
          </Text>
        </View>

        <View className="flex-row items-center justify-between bg-[#09090b] border border-zinc-800 rounded-xl p-4 mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-white text-base font-bold mb-1">
              Private Room
            </Text>
            <Text className="text-[#71717a] text-sm leading-5">
              Mark this room as private metadata for invite-only sessions.
            </Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#3f3f46', true: '#4f46e5' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#3f3f46"
          />
        </View>

        {error ? (
          <View className="flex-row items-center mb-5 px-1">
            <Ionicons name="alert-circle" size={16} color="#f87171" />
            <Text className="text-red-400 text-sm ml-2">{error}</Text>
          </View>
        ) : null}

        <Button
          title="Create Room"
          variant="white"
          onPress={handleCreateRoom}
          disabled={!roomName.trim() || !videoUrl.trim() || isRoomLoading}
          loading={isRoomLoading}
          className="mb-8"
        />

        <View className="w-full aspect-video bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden justify-center items-center relative px-6">
          <View className="absolute inset-0 bg-[#09090b] opacity-50" />
          <Ionicons name="play-circle-outline" size={48} color="#52525b" />
          <Text className="text-[#71717a] text-sm font-bold tracking-widest mt-3">
            ROOM PREVIEW
          </Text>
          <Text className="text-center text-zinc-500 text-sm mt-2">
            {roomName.trim() ? roomName : 'Your room title will appear here'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
