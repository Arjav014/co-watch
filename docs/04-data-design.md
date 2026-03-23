# Data Design

## Why There Are Two Data Stores

CoWatch uses both MongoDB and Redis because it has two different kinds of data:

- durable records that should survive restarts
- hot session state that changes often and should be fast to read and write

MongoDB handles durability.
Redis handles active room state.

## MongoDB

MongoDB stores:

- users in [`backend/src/models/user.model.ts`](../backend/src/models/user.model.ts)
- room snapshots in [`backend/src/modules/rooms/room.model.ts`](../backend/src/modules/rooms/room.model.ts)
- chat messages in [`backend/src/modules/chat/chat.model.ts`](../backend/src/modules/chat/chat.model.ts)

What MongoDB is used for:

- authentication records
- durable room snapshots
- durable chat history
- recovery when Redis does not have the active room anymore

## Redis

Redis integration starts in [`backend/src/config/redis.ts`](../backend/src/config/redis.ts).

Active room state is stored under keys shaped like:

`room:active:{roomId}`

The room cache is managed by [`backend/src/modules/rooms/room.service.ts`](../backend/src/modules/rooms/room.service.ts).

Why Redis fits:

- playback state changes often
- participant lists can change frequently
- hot room state should be quick to update before broadcasting

Default active room TTL:

- `ROOM_ACTIVE_TTL_SECONDS`, defaulting to 6 hours

## Shared Room Contract

The room shape is mirrored between backend and frontend:

- [`backend/src/modules/rooms/room.types.ts`](../backend/src/modules/rooms/room.types.ts)
- [`frontend/types/index.ts`](../frontend/types/index.ts)

Important fields:

- `roomId`
- `roomName`
- `hostId`
- `videoUrl`
- `currentTime`
- `isPlaying`
- `isPrivate`
- `users`

This object is shared across:

- REST responses
- socket events
- frontend room state
- Redis cache payloads
- MongoDB room snapshots

## Persistence Strategy

The persistence strategy is:

1. Write active room changes to Redis immediately
2. Persist room snapshots to MongoDB for durability
3. Persist chat messages directly to MongoDB
4. Rehydrate from MongoDB if Redis misses

This means Redis is effectively the hot operational store, while MongoDB is the durable store.

## Cleanup Rules

When the last participant leaves a room, the backend purges room artifacts:

- remove the active Redis key
- delete the Mongo room snapshot
- delete the room's chat messages

This prevents stale room state from accumulating forever.

## Tradeoffs

Benefits:

- Redis gives fast updates for room state
- MongoDB keeps history and recovery simple
- room hydration works even after the active cache disappears

Limits:

- there is no multi-instance Socket.IO coordination yet
- Redis is used as a hot source of truth only inside a single backend instance model

## Why This Design Works

The split is practical because room state is not the same kind of data as user or chat history.

- user records need durability
- chat history needs durability
- playback state needs speed

Using MongoDB and Redis for different jobs keeps the design simpler than forcing one store to do everything.
