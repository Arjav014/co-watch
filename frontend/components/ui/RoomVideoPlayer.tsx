import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';

type RoomVideoPlayerProps = {
  videoUrl: string;
  isHost: boolean;
  roomIsPlaying: boolean;
  roomCurrentTime: number;
  onTogglePlayback: (currentTime: number) => Promise<void>;
  onSeek: (currentTime: number) => Promise<void>;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onError: (message: string) => void;
};

const SYNC_DRIFT_THRESHOLD_SECONDS = 1.25;

function buildVideoSource(videoUrl: string): VideoSource {
  const isHls = videoUrl.trim().toLowerCase().includes('.m3u8');

  return {
    uri: videoUrl,
    contentType: isHls ? 'hls' : 'auto',
  };
}

export default function RoomVideoPlayer({
  videoUrl,
  isHost,
  roomIsPlaying,
  roomCurrentTime,
  onTogglePlayback,
  onSeek,
  onTimeUpdate,
  onDurationChange,
  onError,
}: RoomVideoPlayerProps) {
  const lastAppliedSyncTimeRef = useRef(0);
  const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'readyToPlay' | 'error'>('loading');

  const source = useMemo(() => buildVideoSource(videoUrl), [videoUrl]);
  const player = useVideoPlayer(source, (instance) => {
    instance.timeUpdateEventInterval = 0.25;
  });

  useEventListener(player, 'statusChange', (payload) => {
    setPlayerStatus(payload.status);
    if (payload.error?.message) {
      onError(payload.error.message);
    }
  });

  useEventListener(player, 'timeUpdate', (payload) => {
    onTimeUpdate(payload.currentTime);
  });

  useEventListener(player, 'sourceLoad', (payload) => {
    onDurationChange(payload.duration);
  });

  useEffect(() => {
    const drift = Math.abs(player.currentTime - roomCurrentTime);
    const wasRemoteSync = Math.abs(roomCurrentTime - lastAppliedSyncTimeRef.current) < 0.05;

    if (roomCurrentTime > 0 && drift > SYNC_DRIFT_THRESHOLD_SECONDS && !wasRemoteSync) {
      player.currentTime = roomCurrentTime;
      lastAppliedSyncTimeRef.current = roomCurrentTime;
    }
  }, [player, roomCurrentTime]);

  useEffect(() => {
    if (roomIsPlaying && !player.playing) {
      player.play();
    }

    if (!roomIsPlaying && player.playing) {
      player.pause();
    }
  }, [player, roomIsPlaying]);

  const handleTogglePlayback = () => {
    if (!isHost) {
      return;
    }

    onTogglePlayback(player.currentTime).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update playback';
      onError(message);
    });
  };

  const handleJump = (seconds: number) => {
    if (!isHost) {
      return;
    }

    const nextTime = Math.max(0, player.currentTime + seconds);
    player.currentTime = nextTime;
    lastAppliedSyncTimeRef.current = nextTime;

    onSeek(nextTime).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to seek video';
      onError(message);
    });
  };

  return (
    <View className="w-full aspect-video bg-[#0a0a0a]">
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        nativeControls={false}
      />

      {playerStatus !== 'readyToPlay' ? (
        <View className="absolute inset-0 items-center justify-center bg-black/55">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : null}

      <View className="absolute inset-0 items-center justify-center">
        <View className="flex-row items-center">
          {isHost ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleJump(-10)}
              className="w-12 h-12 rounded-full bg-black/55 items-center justify-center mr-4"
            >
              <Ionicons name="play-back" size={22} color="#ffffff" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTogglePlayback}
            disabled={!isHost}
            className={`w-16 h-16 rounded-full items-center justify-center ${isHost ? 'bg-black/60' : 'bg-black/35'}`}
          >
            <Ionicons
              name={roomIsPlaying ? 'pause' : 'play'}
              size={28}
              color="#ffffff"
              style={roomIsPlaying ? undefined : { marginLeft: 2 }}
            />
          </TouchableOpacity>

          {isHost ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleJump(10)}
              className="w-12 h-12 rounded-full bg-black/55 items-center justify-center ml-4"
            >
              <Ionicons name="play-forward" size={22} color="#ffffff" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text className="mt-4 text-zinc-300 text-sm px-6 text-center">
          {isHost ? 'Tap to control playback for the room' : 'Watching host-controlled playback'}
        </Text>
      </View>
    </View>
  );
}
