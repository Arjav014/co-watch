import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoomSession } from '@/context/RoomSessionContext';
import { getErrorMessage } from '@/services/api';

const CODE_LENGTH = 6;

export default function JoinRoomScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { joinExistingRoom, isRoomLoading, clearRoomError } = useRoomSession();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const digits = useMemo(
    () => Array.from({ length: CODE_LENGTH }, (_, index) => roomCode[index] ?? ''),
    [roomCode]
  );

  const handleCodeChange = (value: string) => {
    const nextValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    setRoomCode(nextValue);
  };

  const handleJoinRoom = async () => {
    if (roomCode.length !== CODE_LENGTH || isRoomLoading) {
      return;
    }

    clearRoomError();
    setError('');

    try {
      const room = await joinExistingRoom(roomCode);
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
          Join Room
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center mb-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-[24px] bg-[#121a33]">
            <Ionicons name="people-outline" size={36} color="#f4f4f5" />
            <View className="absolute right-4 top-5 rounded-full bg-[#121a33]">
              <Ionicons name="add" size={16} color="#f4f4f5" />
            </View>
          </View>

          <Text className="mb-3 text-center text-3xl font-bold tracking-tight text-white">
            Join a Room
          </Text>

          <Text className="max-w-[300px] text-center text-base leading-6 text-[#a1a1aa]">
            Enter the 6-character code shared by the host to start watching together.
          </Text>
        </View>

        <Pressable onPress={() => inputRef.current?.focus()} className="mb-5">
          <TextInput
            ref={inputRef}
            value={roomCode}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
            className="absolute h-0 w-0 opacity-0"
            importantForAutofill="no"
          />

          <View className="flex-row justify-between">
            {digits.map((digit, index) => {
              const isFilled = index < roomCode.length;

              return (
                <View
                  key={index}
                  className={`h-16 flex-1 mx-1.5 items-center justify-center rounded-xl border ${
                    isFilled ? 'border-[#243256] bg-[#05070e]' : 'border-zinc-800 bg-[#09090b]'
                  }`}
                >
                  <Text
                    className={`text-2xl font-bold ${
                      isFilled ? 'text-white' : 'text-[#6d7385]'
                    }`}
                  >
                    {digit}
                  </Text>
                </View>
              );
            })}
          </View>
        </Pressable>

        {error ? (
          <View className="flex-row items-center mb-4 px-1">
            <Ionicons name="alert-circle" size={16} color="#f87171" />
            <Text className="text-red-400 text-sm ml-2">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={roomCode.length !== CODE_LENGTH || isRoomLoading}
          onPress={handleJoinRoom}
          className={`mb-4 flex-row items-center justify-center rounded-2xl px-6 py-5 ${
            roomCode.length === CODE_LENGTH && !isRoomLoading ? 'bg-white' : 'bg-zinc-300/60'
          }`}
        >
          <Text className="mr-2 text-lg font-bold text-[#17213d]">
            {isRoomLoading ? 'Joining...' : 'Join Room'}
          </Text>
          <Ionicons name="arrow-forward" size={22} color="#17213d" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(app)/create-room')}
          className="items-center justify-center rounded-2xl border border-zinc-800 bg-[#09090b] px-6 py-5 mb-8"
        >
          <Text className="text-base font-medium text-zinc-100">
            Create New Room
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#71717a"
            style={{ marginRight: 6 }}
          />
          <Text className="text-sm text-[#71717a]">
            Room codes use letters and numbers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
