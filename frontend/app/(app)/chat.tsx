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
import Avatar from '@/components/ui/Avatar';

// ── Mock data (will be replaced with socket/context) ──────

const IS_IN_ROOM = true; // toggle to see inactive state

const ROOM_INFO = {
  name: 'CoWatch Studio',
  watchers: 12,
};

interface ChatMessage {
  id: string;
  type: 'user' | 'self' | 'system';
  username?: string;
  time?: string;
  text: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'user',
    username: 'Alex Rivera',
    time: '10:02 AM',
    text: 'The lighting in this sequence is absolutely phenomenal. Really heavy noir influences here.',
  },
  {
    id: '2',
    type: 'user',
    username: 'Jordan',
    time: '10:03 AM',
    text: 'Agreed. The high contrast black and white really emphasizes the architecture of the set.',
  },
  {
    id: '3',
    type: 'system',
    text: 'SARAH JOINED THE ROOM',
  },
  {
    id: '4',
    type: 'self',
    username: 'You',
    time: '10:04 AM',
    text: 'Wait',
  },
];

// ── Component ─────────────────────────────────────────────

export default function ChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (!messageText.trim()) return;
    // Will hook up to socket later
    setMessageText('');
  };

  // ── Inactive state ──
  if (!IS_IN_ROOM) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubble-ellipses-outline" size={56} color="#3f3f46" />
          <Text className="text-white text-xl font-bold mt-5 mb-2">No Active Room</Text>
          <Text className="text-zinc-500 text-center text-sm leading-5">
            Join or create a room to start chatting with others.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Active chat ──
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ─── Header ─── */}
        <View className="flex-row items-center px-4 py-3 border-b border-zinc-800">
          {/* Logo + info */}
          <View className="w-10 h-10 rounded-xl bg-[#18181b] items-center justify-center mr-3">
            <Ionicons name="film-outline" size={20} color="#a1a1aa" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">{ROOM_INFO.name}</Text>
            <View className="flex-row items-center mt-0.5">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              <Text className="text-zinc-500 text-xs font-bold tracking-widest uppercase">
                LIVE • {ROOM_INFO.watchers} WATCHERS
              </Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity className="p-2 ml-1">
            <Ionicons name="people-outline" size={22} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 ml-1">
            <Ionicons name="settings-outline" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* ─── Messages ─── */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {MOCK_MESSAGES.map((msg) => {
            // ── System event ──
            if (msg.type === 'system') {
              return (
                <View key={msg.id} className="flex-row items-center my-5">
                  <View className="flex-1 h-px bg-zinc-800" />
                  <Text className="mx-3 text-zinc-600 text-[11px] font-bold tracking-widest uppercase">
                    {msg.text}
                  </Text>
                  <View className="flex-1 h-px bg-zinc-800" />
                </View>
              );
            }

            // ── Own message ──
            if (msg.type === 'self') {
              return (
                <View key={msg.id} className="flex-row mb-5">
                  <Avatar username="ME" size="sm" className="mt-1 bg-emerald-700" />
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-baseline mb-1">
                      <Text className="text-white text-sm font-bold mr-2">You</Text>
                      <Text className="text-zinc-600 text-xs">{msg.time}</Text>
                    </View>
                    <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start">
                      <Text className="text-zinc-300 text-sm leading-5">{msg.text}</Text>
                    </View>
                  </View>
                </View>
              );
            }

            // ── Other user message ──
            return (
              <View key={msg.id} className="flex-row mb-5">
                <Avatar username={msg.username ?? '?'} size="sm" className="mt-1" />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-baseline mb-1">
                    <Text className="text-white text-sm font-bold mr-2">{msg.username}</Text>
                    <Text className="text-zinc-600 text-xs">{msg.time}</Text>
                  </View>
                  <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start">
                    <Text className="text-zinc-300 text-sm leading-5">{msg.text}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ─── Message Input ─── */}
        <View className="px-4 pb-3 pt-2 border-t border-zinc-800">
          <View className="flex-row items-center bg-[#18181b] rounded-full border border-zinc-800 px-3 py-1.5">
            <TouchableOpacity className="p-1.5 mr-1">
              <Ionicons name="add-circle-outline" size={22} color="#52525b" />
            </TouchableOpacity>

            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Message the room..."
              placeholderTextColor="#52525b"
              className="flex-1 text-white text-sm py-2"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity className="p-1.5">
              <Ionicons name="happy-outline" size={22} color="#52525b" />
            </TouchableOpacity>
            <TouchableOpacity className="p-1.5" onPress={handleSend}>
              <Ionicons name="at" size={22} color="#52525b" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
