import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import Avatar from '@/components/ui/Avatar';
import ParticipantsModal from '@/components/ui/ParticipantsModal';
import RoomVideoPlayer from '@/components/ui/RoomVideoPlayer';
import { useAuth } from '@/context/AuthContext';
import { useRoomSession } from '@/context/RoomSessionContext';

export default function WatchRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const {
    activeRoom,
    messages,
    isRoomLoading,
    isSocketConnected,
    roomError,
    clearRoomError,
    hydrateRoom,
    leaveActiveRoom,
    sendChatMessage,
    togglePlayback,
    seekPlayback,
  } = useRoomSession();
  const [messageText, setMessageText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    if (activeRoom?.roomId === roomId) {
      return;
    }

    clearRoomError();
    hydrateRoom(roomId).catch(() => undefined);
  }, [roomId, activeRoom?.roomId, clearRoomError, hydrateRoom]);

  useEffect(() => {
    setPlayerError('');
  }, [activeRoom?.videoUrl]);

  useEffect(() => {
    return () => {
      if (isFullscreen) {
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, [isFullscreen]);

  const isHost = !!activeRoom && activeRoom.hostId === user?.id;
  const participantsCount = activeRoom?.users.length ?? 0;

  const handleSend = async () => {
    if (!messageText.trim()) {
      return;
    }

    try {
      await sendChatMessage(messageText);
      setMessageText('');
    } catch {
      // Room-level errors are surfaced from context.
    }
  };

  const handleLeave = async () => {
    try {
      await leaveActiveRoom();
      router.replace('/(app)');
    } catch {
      // Room-level errors are surfaced from context.
    }
  };

  const handleFullscreenEnter = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enter fullscreen mode';
      setPlayerError(message);
    }
  };

  const handleFullscreenExit = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to exit fullscreen mode';
      setPlayerError(message);
    }
  };

  if (isRoomLoading && !activeRoom) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b] items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!activeRoom) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b] items-center justify-center px-6">
        <Ionicons name="videocam-off-outline" size={48} color="#52525b" />
        <Text className="text-white text-xl font-bold mt-5 mb-2">No Active Room</Text>
        <Text className="text-zinc-500 text-center text-sm leading-5">
          {roomError || 'Join or create a room to start watching together.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#09090b]">
      <StatusBar hidden={isFullscreen} style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 mr-3"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-base font-bold">{activeRoom.roomName}</Text>
              <Text className="text-zinc-500 text-xs mt-0.5">
                {isSocketConnected ? 'LIVE CONNECTION' : 'CONNECTING'} • {activeRoom.roomId}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowParticipants(true)}
              className="flex-row items-center bg-[#1c1c1f] rounded-full px-3 py-1.5 mr-3"
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
              <Text className="text-zinc-400 text-xs font-bold">{participantsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLeave}
              className="bg-red-600 rounded-full px-4 py-1.5"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold">Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-black">
          <RoomVideoPlayer
            videoUrl={activeRoom.videoUrl}
            isHost={isHost}
            roomIsPlaying={activeRoom.isPlaying}
            roomCurrentTime={activeRoom.currentTime}
            onTogglePlayback={togglePlayback}
            onSeek={seekPlayback}
            onTimeUpdate={() => undefined}
            onDurationChange={() => undefined}
            onError={setPlayerError}
            onFullscreenEnter={handleFullscreenEnter}
            onFullscreenExit={handleFullscreenExit}
          />
        </View>

        <View className="px-4 py-3 border-b border-zinc-800">
          <Text className="text-white text-lg font-bold">{activeRoom.roomName}</Text>
          <Text className="text-zinc-500 text-sm mt-0.5" numberOfLines={1}>
            Hosted by {activeRoom.users.find((participant) => participant.userId === activeRoom.hostId)?.username ?? 'Unknown'} • {activeRoom.videoUrl}
          </Text>
          {roomError ? (
            <Text className="text-red-400 text-xs mt-2">{roomError}</Text>
          ) : null}
          {playerError ? (
            <Text className="text-red-400 text-xs mt-1">{playerError}</Text>
          ) : null}
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {!messages.length ? (
            <View className="items-center py-10">
              <Text className="text-zinc-500 text-sm">
                No messages yet. Start the conversation.
              </Text>
            </View>
          ) : null}

          {messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <View key={msg.id} className="items-center my-4">
                  <Text className="text-[#52525b] text-xs font-bold tracking-widest uppercase">
                    {msg.message}
                  </Text>
                </View>
              );
            }

            if (msg.userId === user?.id) {
              return (
                <View key={msg.id} className="items-end mb-4">
                  <Text className="text-zinc-500 text-xs font-bold mb-1.5 mr-1">You</Text>
                  <View className="bg-[#1c1c2e] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                    <Text className="text-zinc-200 text-sm leading-5">{msg.message}</Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} className="flex-row mb-4">
                <Avatar username={msg.username ?? '?'} size="sm" className="mt-1" />
                <View className="ml-3 flex-1">
                  <Text className="text-indigo-400 text-xs font-bold mb-1.5">{msg.username}</Text>
                  <View className="bg-[#18181b] rounded-2xl rounded-tl-sm px-4 py-3 self-start max-w-[90%]">
                    <Text className="text-zinc-300 text-sm leading-5">{msg.message}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

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

      <ParticipantsModal
        visible={showParticipants}
        onClose={() => setShowParticipants(false)}
        room={activeRoom}
      />
    </SafeAreaView>
  );
}
