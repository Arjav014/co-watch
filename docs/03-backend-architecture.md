# Backend Architecture

## Role Of The Backend

The backend is responsible for:

- JWT-based authentication
- protected room APIs
- room membership validation
- playback authority enforcement
- real-time fan-out with Socket.IO
- durable room and chat persistence

## Process Bootstrap

[`backend/src/server.ts`](../backend/src/server.ts) is the backend entrypoint.

Startup sequence:

1. Load environment variables
2. Create an HTTP server around Express
3. Attach Socket.IO to that server
4. Register socket handlers
5. Connect to MongoDB
6. Connect to Redis
7. Start listening on port `5000`

[`backend/src/app.ts`](../backend/src/app.ts) configures:

- `cors()`
- JSON and URL-encoded parsing
- `/auth` routes
- `/rooms` routes
- `/health`
- shared error middleware

## Authentication API

Main files:

- [`backend/src/modules/auth/auth.routes.ts`](../backend/src/modules/auth/auth.routes.ts)
- [`backend/src/modules/auth/auth.controller.ts`](../backend/src/modules/auth/auth.controller.ts)
- [`backend/src/modules/auth/auth.service.ts`](../backend/src/modules/auth/auth.service.ts)
- [`backend/src/utils/jwt.ts`](../backend/src/utils/jwt.ts)

How it works:

1. User hits `/auth/register` or `/auth/login`
2. Controller validates payloads
3. Service creates or reads the user
4. Passwords are hashed and compared with `bcrypt`
5. JWT is returned with `userId` and `username`

Protected HTTP requests use [`backend/src/middleware/auth.middleware.ts`](../backend/src/middleware/auth.middleware.ts).

That middleware:

- reads `Authorization: Bearer <token>`
- verifies the token
- populates `req.user`

## Room HTTP API

Main files:

- [`backend/src/modules/rooms/room.routes.ts`](../backend/src/modules/rooms/room.routes.ts)
- [`backend/src/modules/rooms/room.controller.ts`](../backend/src/modules/rooms/room.controller.ts)

Endpoints:

- `POST /rooms/create`
- `POST /rooms/join`
- `POST /rooms/leave`
- `PATCH /rooms/:roomId/playback`
- `GET /rooms/:roomId`

Role of the HTTP API:

- create and join rooms from the mobile app
- provide hydration and recovery through `GET /rooms/:roomId`
- support non-socket room operations as a fallback path

## Socket.IO Layer

Main files:

- [`backend/src/sockets/socket.handler.ts`](../backend/src/sockets/socket.handler.ts)
- [`backend/src/sockets/room.events.ts`](../backend/src/sockets/room.events.ts)

Connection flow:

1. Socket handshake includes the JWT
2. The server verifies the token
3. The decoded user is attached to the socket
4. Room event handlers are registered

Disconnect behavior:

- the backend checks all joined rooms
- if the user is still a room member, it removes them
- the server emits `userLeft` to the rest of the room

## Supported Real-Time Events

Handled in `room.events.ts`:

- `createRoom`
- `joinRoom`
- `leaveRoom`
- `play`
- `pause`
- `seek`
- `videoChange`
- `chatMessage`

Common event pattern:

1. validate input
2. check room existence
3. verify room membership
4. verify host permissions for playback-changing actions
5. call `room.service`
6. broadcast the result
7. respond through the socket ack callback

## Room Service As The Core Domain Layer

[`backend/src/modules/rooms/room.service.ts`](../backend/src/modules/rooms/room.service.ts) is the central room domain service.

It handles:

- room creation
- room lookup
- room join and leave
- playback updates
- Redis cache reads and writes
- Mongo snapshot persistence
- host reassignment
- last-user cleanup

This file is where most of the real room rules live.

## Why The Backend Is Structured This Way

- Express handles request-response APIs cleanly.
- Socket.IO handles room-scoped real-time fan-out.
- The room service keeps room rules in one place instead of scattering them across controllers and sockets.
- JWT-based identity is shared across both HTTP and sockets.

This keeps the backend straightforward: controllers accept input, sockets handle live events, and the service owns the room business logic.
