import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CreateRoomScreen() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to the room or back to home for now
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      {/* Header */}
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
        {/* Title Section */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-2 tracking-tight">
            Start a Session
          </Text>
          <Text className="text-[#a1a1aa] text-base leading-6">
            Invite your friends to watch together in real-time.
          </Text>
        </View>

        {/* Inputs Section */}
        <View className="mb-6">
          <Input
            label="Room Name"
            placeholder="Friday Movie Night"
            value={roomName}
            onChangeText={setRoomName}
            containerClassName="mb-1"
          />
        </View>

        <View className="mb-6">
          <Input
            label="Video URL"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChangeText={setVideoUrl}
            rightIcon="link-outline"
            containerClassName="mb-1"
          />
          <Text className="text-[#71717a] text-sm ml-1 mt-1">
            Supports YouTube, Twitch, and Vimeo.
          </Text>
        </View>

        {/* Private Room Toggle */}
        <View className="flex-row items-center justify-between bg-[#09090b] border border-zinc-800 rounded-xl p-4 mb-8">
          <View className="flex-1 pr-4">
            <Text className="text-white text-base font-bold mb-1">
              Private Room
            </Text>
            <Text className="text-[#71717a] text-sm leading-5">
              Only people with the link can join.
            </Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#3f3f46', true: '#4f46e5' }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#3f3f46"
          />
        </View>

        {/* Create Button */}
        <Button
          title="Create Room"
          variant="white"
          onPress={handleCreateRoom}
          disabled={!roomName.trim() || isLoading}
          loading={isLoading}
          className="mb-8"
        />

        {/* Room Preview Area */}
        <View className="w-full aspect-video bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden justify-center items-center relative">
          {/* Placeholder graphics for Room Preview */}
          <View className="absolute inset-0 bg-[#09090b] opacity-50" />
          <Ionicons name="play-circle-outline" size={48} color="#52525b" className="mb-2" />
          <Text className="text-[#71717a] text-sm font-bold tracking-widest mt-2">
            ROOM PREVIEW
          </Text>
          
          {/* Optional: if you have an image, you could overlay it */}
          {/* <Image 
            source={{ uri: 'YOUR_IMAGE_URL' }} 
            className="absolute inset-0 w-full h-full opacity-40 rounded-xl"
            resizeMode="cover"
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
