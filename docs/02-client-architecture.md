# Client Architecture

## Role Of The Frontend

The frontend is an Expo + React Native app responsible for:

- user authentication UX
- room creation and joining
- playback UI
- chat UI
- participant presence display
- socket lifecycle on the client

The main entrypoint is [`frontend/app/_layout.tsx`](../frontend/app/_layout.tsx).

## App Bootstrap And Navigation

`frontend/app/_layout.tsx` wires together:

- `AuthProvider`
- `RoomSessionProvider`
- `RootNavigator`

How startup works:

1. `AuthProvider` restores the saved token and user from `AsyncStorage`
2. `RoomSessionProvider` initializes room-level shared state
3. `RootNavigator` decides whether the user should see `(auth)` or `(app)` routes

Route groups:

- `frontend/app/(auth)`: login and register screens
- `frontend/app/(app)`: authenticated app screens

## Authentication State

[`frontend/context/AuthContext.tsx`](../frontend/context/AuthContext.tsx) is the session/bootstrap layer.

Responsibilities:

- restore `co_watch_token` and `co_watch_user`
- keep `user`, `token`, and `isLoading` in memory
- apply the bearer token to Axios through `setAuthToken`
- expose `login`, `register`, and `logout`

Why this matters:

- REST requests and socket connections share the same identity model
- app restarts do not force the user to log in again if storage is intact

## Room Session State

[`frontend/context/RoomSessionContext.tsx`](../frontend/context/RoomSessionContext.tsx) is the most important frontend module for room behavior.

It owns:

- `activeRoom`
- `messages`
- `isRoomLoading`
- `isSocketConnected`
- `roomError`

It exposes room actions:

- `createAndJoinRoom`
- `joinExistingRoom`
- `hydrateRoom`
- `leaveActiveRoom`
- `sendChatMessage`
- `togglePlayback`
- `seekPlayback`

It also manages:

- socket creation and teardown
- room event listeners
- optimistic playback updates
- room hydration after direct navigation or reconnect

## Socket Lifecycle On The Client

The client only opens a socket when it has a room to participate in.

Flow:

1. Create or join a room over REST
2. Save the returned room into `activeRoom`
3. Connect Socket.IO with the JWT in `auth`
4. Emit `joinRoom` for the room id
5. Attach listeners for playback, chat, and presence updates

Reconnect behavior:

- On socket reconnect, if `activeRoom` still exists, the client emits `joinRoom` again.
- This lets the session recover after short network interruptions.

## Playback Adapter

[`frontend/components/ui/RoomVideoPlayer.tsx`](../frontend/components/ui/RoomVideoPlayer.tsx) translates between room state and the native player.

It does two jobs:

1. Applies shared room state to the local player
2. Converts local player actions back into room events

Important inputs:

- `videoUrl`
- `isHost`
- `roomIsPlaying`
- `roomCurrentTime`

Important callbacks:

- `onTogglePlayback`
- `onSeek`
- `onTimeUpdate`
- `onDurationChange`
- `onError`

## Sync Guardrails In The Player

This file contains the client-side rules that make sync practical:

- `SYNC_DRIFT_THRESHOLD_SECONDS = 1.25`
- `SEEK_JUMP_THRESHOLD_SECONDS = 1.5`
- `SEEK_COMMIT_DELAY_MS = 250`

Behavior:

- host actions can trigger room updates
- non-host actions are constrained
- large desyncs are corrected
- repeated remote sync updates are ignored when they appear to be the same sync already applied

This avoids feedback loops and helps keep viewers aligned.

## Screen Responsibilities

### Auth screens

- [`frontend/app/(auth)/login.tsx`](../frontend/app/(auth)/login.tsx): calls `/auth/login`
- [`frontend/app/(auth)/register.tsx`](../frontend/app/(auth)/register.tsx): calls `/auth/register`

### Room screens

- [`frontend/app/(app)/create-room.tsx`](../frontend/app/(app)/create-room.tsx): validates the URL and creates a room
- [`frontend/app/(app)/join-room.tsx`](../frontend/app/(app)/join-room.tsx): joins by 6-character room code
- [`frontend/app/(app)/watch-room.tsx`](../frontend/app/(app)/watch-room.tsx): playback, participants, chat, leave flow

The watch room screen is the main session UI. It:

- hydrates room state if the screen is opened directly
- renders `RoomVideoPlayer`
- sends chat messages
- handles leave confirmation
- shows participant count and room metadata

## Video Input Rules

[`frontend/utils/video.ts`](../frontend/utils/video.ts) currently allows only direct media URLs:

- `.mp4`
- `.m3u8`

This is why YouTube, Twitch, and Vimeo links are rejected today.

## Why The Client Is Structured This Way

- `AuthContext` keeps auth concerns separate from room concerns.
- `RoomSessionContext` centralizes all room and socket state so screens stay simpler.
- `RoomVideoPlayer` isolates media sync behavior from the rest of the UI.

This makes the frontend easier to reason about because authentication, room orchestration, and playback syncing each live in their own layer.
