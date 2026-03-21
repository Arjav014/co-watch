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
import { useAuth } from '@/context/AuthContext';
import { useRoomSession } from '@/context/RoomSessionContext';

export default function ChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { activeRoom, messages, sendChatMessage } = useRoomSession();
  const [messageText, setMessageText] = useState('');

  const handleSend = async () => {
    if (!messageText.trim()) {
      return;
    }

    try {
      await sendChatMessage(messageText);
      setMessageText('');
    } catch {
      // Room errors are already tracked in shared state.
    }
  };

  if (!activeRoom) {
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-center px-4 py-3 border-b border-zinc-800">
          <View className="w-10 h-10 rounded-xl bg-[#18181b] items-center justify-center mr-3">
            <Ionicons name="film-outline" size={20} color="#a1a1aa" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">{activeRoom.roomName}</Text>
            <View className="flex-row items-center mt-0.5">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              <Text className="text-zinc-500 text-xs font-bold tracking-widest uppercase">
                LIVE • {activeRoom.users.length} WATCHERS
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <View key={msg.id} className="flex-row items-center my-5">
                  <View className="flex-1 h-px bg-zinc-800" />
                  <Text className="mx-3 text-zinc-600 text-[11px] font-bold tracking-widest uppercase">
                    {msg.message}
                  </Text>
                  <View className="flex-1 h-px bg-zinc-800" />
                </View>
              );
            }

            if (msg.userId === user?.id) {
              return (
                <View key={msg.id} className="flex-row mb-5">
                  <Avatar username="ME" size="sm" className="mt-1 bg-emerald-700" />
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-baseline mb-1">
                      <Text className="text-white text-sm font-bold mr-2">You</Text>
                      <Text className="text-zinc-600 text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start">
                      <Text className="text-zinc-300 text-sm leading-5">{msg.message}</Text>
                    </View>
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} className="flex-row mb-5">
                <Avatar username={msg.username ?? '?'} size="sm" className="mt-1" />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-baseline mb-1">
                    <Text className="text-white text-sm font-bold mr-2">{msg.username}</Text>
                    <Text className="text-zinc-600 text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start">
                    <Text className="text-zinc-300 text-sm leading-5">{msg.message}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View className="px-4 pb-3 pt-2 border-t border-zinc-800">
          <View className="flex-row items-center bg-[#18181b] rounded-full border border-zinc-800 px-3 py-1.5">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Message the room..."
              placeholderTextColor="#52525b"
              className="flex-1 text-white text-sm py-2"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity className="p-1.5" onPress={handleSend}>
              <Ionicons name="send-outline" size={22} color="#52525b" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
