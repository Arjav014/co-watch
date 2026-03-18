import React, { useState } from 'react';
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

// ── Types ──

interface Participant {
  id: string;
  name: string;
  status: 'Online' | 'Watching' | 'Away' | 'Currently streaming';
  isHost?: boolean;
}

interface ParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  roomId?: string;
}

// ── Mock data ──

const MOCK_HOST: Participant = {
  id: 'h1',
  name: 'Alex Rivera',
  status: 'Currently streaming',
  isHost: true,
};

const MOCK_WATCHERS: Participant[] = [
  { id: 'w1', name: 'Sarah Jenkins', status: 'Online' },
  { id: 'w2', name: 'Jordan Smith', status: 'Watching' },
  { id: 'w3', name: 'Elena Rossi', status: 'Away' },
];

// ── Helpers ──

const statusColor: Record<string, string> = {
  Online: '#22c55e',
  Watching: '#3b82f6',
  Away: '#eab308',
  'Currently streaming': '#22c55e',
};

// ── Component ──

export default function ParticipantsModal({
  visible,
  onClose,
  roomId = 'CW-882-991',
}: ParticipantsModalProps) {
  const [search, setSearch] = useState('');

  const filteredWatchers = MOCK_WATCHERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hostVisible =
    !search || MOCK_HOST.name.toLowerCase().includes(search.toLowerCase());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#09090b]">
        {/* ─── Header ─── */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={22} color="#ffffff" style={{ marginRight: 10 }} />
            <Text className="text-white text-xl font-bold">Participants</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 mr-1">
              <Ionicons name="person-add" size={20} color="#a1a1aa" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={22} color="#a1a1aa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Search ─── */}
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
          {/* ─── Host Section ─── */}
          {hostVisible && (
            <>
              <Text className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
                HOST
              </Text>
              <View className="flex-row items-center bg-[#09090b] border border-indigo-900/50 rounded-2xl p-3 mb-6">
                <View className="relative">
                  <Avatar username={MOCK_HOST.name} size="md" />
                  <View
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#09090b]"
                    style={{ backgroundColor: statusColor[MOCK_HOST.status] }}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-white text-base font-bold">{MOCK_HOST.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">{MOCK_HOST.status}</Text>
                </View>
                <View className="bg-[#18181b] rounded-lg px-3 py-1">
                  <Text className="text-zinc-300 text-xs font-bold">HOST</Text>
                </View>
              </View>
            </>
          )}

          {/* ─── Watchers Section ─── */}
          <Text className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
            WATCHING ({filteredWatchers.length})
          </Text>

          {filteredWatchers.map((p) => (
            <View key={p.id} className="flex-row items-center py-3.5">
              <View className="relative">
                <Avatar username={p.name} size="md" />
                <View
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#09090b]"
                  style={{ backgroundColor: statusColor[p.status] }}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-white text-base font-bold">{p.name}</Text>
                <Text className="text-zinc-500 text-xs mt-0.5">{p.status}</Text>
              </View>
              <TouchableOpacity className="p-2">
                <Ionicons name="ellipsis-horizontal" size={18} color="#52525b" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* ─── Bottom ─── */}
        <View className="px-4 pb-3">
          <TouchableOpacity
            activeOpacity={0.85}
            className="flex-row items-center justify-center bg-white rounded-2xl py-4 mb-3"
          >
            <Ionicons name="share-social-outline" size={20} color="#09090b" style={{ marginRight: 8 }} />
            <Text className="text-[#09090b] text-base font-bold">Invite Friends</Text>
          </TouchableOpacity>
          <Text className="text-zinc-600 text-xs text-center tracking-widest uppercase">
            COWATCH ROOM ID: {roomId}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
