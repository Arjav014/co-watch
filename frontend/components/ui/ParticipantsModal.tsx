import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import type { Room } from '@/types';

interface ParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  room: Room | null;
}

export default function ParticipantsModal({
  visible,
  onClose,
  room,
}: ParticipantsModalProps) {
  const [search, setSearch] = useState('');

  const participants = useMemo(() => {
    if (!room) {
      return [];
    }

    return room.users.filter((participant) =>
      participant.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [room, search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#09090b]">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={22} color="#ffffff" style={{ marginRight: 10 }} />
            <Text className="text-white text-xl font-bold">Participants</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-[#18181b] rounded-xl border border-zinc-800 px-3 py-2.5">
            <Ionicons name="search" size={18} color="#52525b" style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find a member..."
              placeholderTextColor="#52525b"
              className="flex-1 text-white text-sm"
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
          <Text className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
            IN ROOM ({participants.length})
          </Text>

          {participants.map((participant) => {
            const isHost = room?.hostId === participant.userId;

            return (
              <View key={participant.userId} className="flex-row items-center py-3.5">
                <View className="relative">
                  <Avatar username={participant.username} size="md" />
                  <View
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#09090b] bg-green-500"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-white text-base font-bold">{participant.username}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">
                    {isHost ? 'Host' : 'Participant'}
                  </Text>
                </View>
                {isHost ? (
                  <View className="bg-[#18181b] rounded-lg px-3 py-1">
                    <Text className="text-zinc-300 text-xs font-bold">HOST</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {!participants.length ? (
            <Text className="text-zinc-500 text-sm">
              No participants match your search.
            </Text>
          ) : null}
        </ScrollView>

        <View className="px-4 pb-3">
          <TouchableOpacity
            activeOpacity={0.85}
            className="flex-row items-center justify-center bg-white rounded-2xl py-4 mb-3"
          >
            <Ionicons name="share-social-outline" size={20} color="#09090b" style={{ marginRight: 8 }} />
            <Text className="text-[#09090b] text-base font-bold">Share Code</Text>
          </TouchableOpacity>
          <Text className="text-zinc-600 text-xs text-center tracking-widest uppercase">
            COWATCH ROOM ID: {room?.roomId ?? 'N/A'}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
