import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Avatar from '@/components/ui/Avatar';
import ParticipantsModal from '@/components/ui/ParticipantsModal';

// ── Mock data ──────────────────────────────────────────────

const ROOM = {
  title: 'INTERSTELLAR (2014)',
  subtitle: 'Public Room • Hosted by Alex',
  participants: 12,
  elapsed: '01:42:30',
  total: '02:49:00',
  progress: 0.61, // 1:42:30 / 2:49:00
};

interface ChatMessage {
  id: string;
  type: 'user' | 'self' | 'system';
  username?: string;
  text: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'user',
    username: 'Alex',
    text: 'That docking scene is still the best cinematic moment ever. 🚀',
  },
  {
    id: '2',
    type: 'user',
    username: 'Sarah',
    text: 'The Hans Zimmer score just gave me chills again.',
  },
  {
    id: '3',
    type: 'self',
    text: 'TARS is definitely my favorite character.',
  },
  {
    id: '4',
    type: 'system',
    text: 'MARCUS JOINED THE ROOM',
  },
];

// ── Component ──────────────────────────────────────────────

export default function WatchRoomScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const handleSend = () => {
    if (!messageText.trim()) return;
    // Will hook up to socket later
    setMessageText('');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ─── Header ─── */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 mr-3"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white text-base font-bold">CoWatch</Text>
          </View>

          <View className="flex-row items-center">
            {/* Participants pill */}
            <TouchableOpacity
              onPress={() => setShowParticipants(true)}
              className="flex-row items-center bg-[#1c1c1f] rounded-full px-3 py-1.5 mr-3"
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
              <Text className="text-zinc-400 text-xs font-bold">{ROOM.participants}</Text>
            </TouchableOpacity>

            {/* Leave button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-red-600 rounded-full px-4 py-1.5"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold">Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Video Player Area ─── */}
        <View className="bg-black">
          {/* Video frame */}
          <View className="w-full aspect-video items-center justify-center bg-[#0a0a0a]">
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              activeOpacity={0.7}
            >
              <View className="w-16 h-16 rounded-full bg-[#2a2a2e] items-center justify-center">
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#ffffff"
                  style={isPlaying ? undefined : { marginLeft: 3 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Seek bar */}
          <View className="px-4 pt-2 pb-1">
            <View className="h-1 w-full rounded-full bg-[#27272a]">
              <View
                className="h-1 rounded-full bg-white"
                style={{ width: `${ROOM.progress * 100}%` }}
              />
              {/* Thumb dot */}
              <View
                className="w-3 h-3 rounded-full bg-white absolute -top-1"
                style={{ left: `${ROOM.progress * 100}%`, marginLeft: -6 }}
              />
            </View>
          </View>

          {/* Controls row */}
          <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} className="mr-3">
                <Ionicons name={isPlaying ? 'pause' : 'pause'} size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text className="text-zinc-400 text-xs">
                {ROOM.elapsed} / {ROOM.total}
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-4">
                <Ionicons name="settings-outline" size={18} color="#a1a1aa" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="scan-outline" size={18} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Room Info ─── */}
        <View className="px-4 py-3 border-b border-zinc-800">
          <Text className="text-white text-lg font-bold">{ROOM.title}</Text>
          <Text className="text-zinc-500 text-sm mt-0.5">{ROOM.subtitle}</Text>
        </View>

        {/* ─── Chat Messages ─── */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {MOCK_MESSAGES.map((msg) => {
            if (msg.type === 'system') {
              return (
                <View key={msg.id} className="items-center my-4">
                  <Text className="text-[#52525b] text-xs font-bold tracking-widest uppercase">
                    {msg.text}
                  </Text>
                </View>
              );
            }

            if (msg.type === 'self') {
              return (
                <View key={msg.id} className="items-end mb-4">
                  <Text className="text-zinc-500 text-xs font-bold mb-1.5 mr-1">You</Text>
                  <View className="bg-[#1c1c2e] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                    <Text className="text-zinc-200 text-sm leading-5">{msg.text}</Text>
                  </View>
                </View>
              );
            }

            // Other user
            return (
              <View key={msg.id} className="flex-row mb-4">
                <Avatar username={msg.username ?? '?'} size="sm" className="mt-1" />
                <View className="ml-3 flex-1">
                  <Text className="text-indigo-400 text-xs font-bold mb-1.5">{msg.username}</Text>
                  <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start max-w-[90%]">
                    <Text className="text-zinc-300 text-sm leading-5">{msg.text}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ─── Message Input ─── */}
        <View className="px-4 pb-3 pt-2 border-t border-zinc-800">
          <View className="flex-row items-center bg-[#18181b] rounded-full border border-zinc-800 px-4 py-2">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Send a message..."
              placeholderTextColor="#52525b"
              className="flex-1 text-white text-sm py-1.5"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              className="w-9 h-9 rounded-full bg-indigo-600 items-center justify-center ml-2"
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#ffffff" style={{ marginLeft: 1 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ─── Participants Modal ─── */}
      <ParticipantsModal
        visible={showParticipants}
        onClose={() => setShowParticipants(false)}
      />
    </SafeAreaView>
  );
}
