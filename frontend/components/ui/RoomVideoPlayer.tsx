import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  onFullscreenEnter: () => void | Promise<void>;
  onFullscreenExit: () => void | Promise<void>;
};

const SYNC_DRIFT_THRESHOLD_SECONDS = 1.25;
const SEEK_JUMP_THRESHOLD_SECONDS = 1.5;
const SEEK_COMMIT_DELAY_MS = 250;

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
  onFullscreenEnter,
  onFullscreenExit,
}: RoomVideoPlayerProps) {
  const lastAppliedSyncTimeRef = useRef(0);
  const lastObservedTimeRef = useRef(0);
  const suppressPlayingEventRef = useRef(false);
  const pendingSeekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'readyToPlay' | 'error'>('loading');

  const source = useMemo(() => buildVideoSource(videoUrl), [videoUrl]);
  const player = useVideoPlayer(source, (instance) => {
    instance.timeUpdateEventInterval = 0.25;
  });

  const clearPendingSeekTimeout = useCallback(() => {
    if (pendingSeekTimeoutRef.current) {
      clearTimeout(pendingSeekTimeoutRef.current);
      pendingSeekTimeoutRef.current = null;
    }
  }, []);

  const syncPlaybackState = useCallback((shouldPlay: boolean) => {
    if (player.playing === shouldPlay) {
      return;
    }

    suppressPlayingEventRef.current = true;

    if (shouldPlay) {
      player.play();
      return;
    }

    player.pause();
  }, [player]);

  const syncCurrentTime = useCallback((nextTime: number) => {
    player.currentTime = nextTime;
    lastAppliedSyncTimeRef.current = nextTime;
    lastObservedTimeRef.current = nextTime;
  }, [player]);

  useEventListener(player, 'statusChange', (payload) => {
    setPlayerStatus(payload.status);
    if (payload.error?.message) {
      onError(payload.error.message);
    }
  });

  useEventListener(player, 'playingChange', (payload) => {
    if (suppressPlayingEventRef.current) {
      suppressPlayingEventRef.current = false;
      return;
    }

    if (!isHost) {
      syncPlaybackState(roomIsPlaying);
      return;
    }

    if (payload.isPlaying === roomIsPlaying) {
      return;
    }

    onTogglePlayback(player.currentTime).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update playback';
      onError(message);
      syncPlaybackState(roomIsPlaying);
    });
  });

  useEventListener(player, 'timeUpdate', (payload) => {
    const previousTime = lastObservedTimeRef.current;
    const currentTime = payload.currentTime;
    lastObservedTimeRef.current = currentTime;
    onTimeUpdate(currentTime);

    if (!previousTime) {
      return;
    }

    const jumpDelta = Math.abs(currentTime - previousTime);
    const wasRemoteSync = Math.abs(currentTime - lastAppliedSyncTimeRef.current) < 0.05;

    if (jumpDelta < SEEK_JUMP_THRESHOLD_SECONDS || wasRemoteSync) {
      return;
    }

    if (!isHost) {
      const fallbackTime = roomIsPlaying ? previousTime : roomCurrentTime;
      syncCurrentTime(fallbackTime);
      onTimeUpdate(fallbackTime);
      return;
    }

    clearPendingSeekTimeout();
    pendingSeekTimeoutRef.current = setTimeout(() => {
      onSeek(currentTime).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to seek video';
        onError(message);
      });
    }, SEEK_COMMIT_DELAY_MS);
  });

  useEventListener(player, 'sourceLoad', (payload) => {
    onDurationChange(payload.duration);
    lastObservedTimeRef.current = player.currentTime;
  });

  useEffect(() => {
    const drift = Math.abs(player.currentTime - roomCurrentTime);
    const wasRemoteSync = Math.abs(roomCurrentTime - lastAppliedSyncTimeRef.current) < 0.05;

    if (roomCurrentTime > 0 && drift > SYNC_DRIFT_THRESHOLD_SECONDS && !wasRemoteSync) {
      syncCurrentTime(roomCurrentTime);
    }
  }, [player, roomCurrentTime, syncCurrentTime]);

  useEffect(() => {
    syncPlaybackState(roomIsPlaying);
  }, [roomIsPlaying, syncPlaybackState]);

  useEffect(() => {
    if (!isHost && !roomIsPlaying && Math.abs(player.currentTime - roomCurrentTime) > 0.1) {
      syncCurrentTime(roomCurrentTime);
    }
  }, [isHost, player, roomCurrentTime, roomIsPlaying, syncCurrentTime]);

  useEffect(() => {
    return () => {
      clearPendingSeekTimeout();
    };
  }, [clearPendingSeekTimeout]);

  return (
    <View className="w-full aspect-video bg-[#0a0a0a]">
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        nativeControls
        requiresLinearPlayback={!isHost}
        fullscreenOptions={{ enable: true, orientation: 'landscape', autoExitOnRotate: true }}
        onFullscreenEnter={() => void onFullscreenEnter()}
        onFullscreenExit={() => void onFullscreenExit()}
      />

      {playerStatus !== 'readyToPlay' ? (
        <View className="absolute inset-0 items-center justify-center bg-black/55">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : null}
    </View>
  );
}
