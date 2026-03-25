import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type DiscoverRoomPreviewProps = {
  roomName: string;
  videoUrl?: string;
};

function buildVideoSource(videoUrl: string): VideoSource {
  const isHls = videoUrl.trim().toLowerCase().includes('.m3u8');

  return {
    uri: videoUrl,
    contentType: isHls ? 'hls' : 'auto',
  };
}

function buildFallbackGradient(roomName: string): [string, string, string] {
  const palettes: [string, string, string][] = [
    ['#0f172a', '#1d4ed8', '#38bdf8'],
    ['#1f2937', '#7c3aed', '#f43f5e'],
    ['#111827', '#059669', '#22d3ee'],
    ['#172554', '#9333ea', '#f97316'],
    ['#1c1917', '#dc2626', '#facc15'],
  ];

  const seed = roomName.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return palettes[seed % palettes.length];
}

export default function DiscoverRoomPreview({ roomName, videoUrl }: DiscoverRoomPreviewProps) {
  const [previewReady, setPreviewReady] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const gradientColors = useMemo(() => buildFallbackGradient(roomName), [roomName]);
  const source = useMemo(() => {
    if (!videoUrl?.trim()) {
      return null;
    }

    return buildVideoSource(videoUrl);
  }, [videoUrl]);

  const player = useVideoPlayer(source, (instance) => {
    instance.muted = true;
    instance.loop = false;
  });

  useEventListener(player, 'statusChange', (payload) => {
    if (payload.error) {
      setPreviewFailed(true);
      setPreviewReady(false);
      return;
    }

    if (payload.status === 'readyToPlay') {
      setPreviewReady(true);
      setPreviewFailed(false);
      player.pause();
      if (player.currentTime === 0) {
        player.currentTime = 0.1;
      }
    }
  });

  const showVideo = !!source && previewReady && !previewFailed;

  return (
    <View className="w-full h-[160px] overflow-hidden">
      {showVideo ? (
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          nativeControls={false}
          fullscreenOptions={{ enable: false }}
        />
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="film-outline" size={56} color="rgba(255,255,255,0.18)" />
          <Text className="text-white/80 text-xs font-bold tracking-[2px] mt-3">
            ROOM PREVIEW
          </Text>
        </LinearGradient>
      )}

      {!!source && !previewReady && !previewFailed ? (
        <View className="absolute inset-0 items-center justify-center bg-black/35">
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      ) : null}
    </View>
  );
}
