# Co-Watch Backend Specification

This document defines **how the backend must be implemented**.
AI agents must follow this specification strictly to ensure **consistent architecture, maintainable code, and high-quality output**.

Agents should **read this file before writing any code**.

---

# 1. Goal

Build a backend for a **Co-Watch platform** where users can:

- create watch rooms
- join rooms
- watch videos together in synchronized playback
- chat in real time
- see room participants

The backend manages:

- authentication
- room lifecycle
- playback synchronization
- real-time chat

Video playback itself is handled on the **client side**.

The backend only sends **synchronization events**.

---

# 2. Technology Stack

The backend must use the following technologies.

**Runtime**

- Node.js

**Framework**

- Express

**Language**

- TypeScript

**Realtime**

- Socket.io

**Database**

- MongoDB
- Mongoose

**Authentication**

- JWT

**Validation**

- Zod

**Password Hashing**

- bcrypt

Do not introduce additional frameworks unless required.

---

# 3. Architecture

Use a **modular monolith architecture**.

Do NOT implement:

- microservices
- GraphQL
- Redis
- WebRTC
- event queues
- unnecessary external services

Each feature must be implemented as a **module**.

Modules must separate:

- controllers
- services
- validation schemas

Controllers must remain **thin**.
Business logic must live in **services**.

---

# 4. Folder Structure

The project must follow this structure.

```
src
 ├── config
 │    └── database.ts
 │
 ├── modules
 │    ├── auth
 │    │    ├── auth.controller.ts
 │    │    ├── auth.service.ts
 │    │    ├── auth.routes.ts
 │    │    └── auth.schema.ts
 │    │
 │    ├── rooms
 │    │    ├── room.controller.ts
 │    │    ├── room.service.ts
 │    │    ├── room.routes.ts
 │    │    └── room.types.ts
 │    │
 │    └── chat
 │         ├── chat.model.ts
 │         └── chat.service.ts
 │
 ├── sockets
 │    ├── socket.handler.ts
 │    ├── socket.types.ts
 │    └── room.events.ts
 │
 ├── middleware
 │    ├── auth.middleware.ts
 │    └── error.middleware.ts
 │
 ├── models
 │    └── user.model.ts
 │
 ├── utils
 │    └── jwt.ts
 │
 ├── app.ts
 └── server.ts
```

Agents must **preserve this structure**.

---

# 5. Database Models

## User Model

Fields:

- id
- username
- email
- password
- createdAt

Password must be **hashed with bcrypt**.

---

## Chat Message Model

Fields:

- roomId
- userId
- username
- message
- timestamp

Chat messages must be **persisted in MongoDB**.

---

# 6. Room State Management

Rooms must **NOT be stored in MongoDB**.

Active rooms must be stored **in memory**.

Use a Map.

Example:

```
Map<string, Room>
```

Room object:

```
roomId
hostId
videoUrl
currentTime
isPlaying
users
```

The room state represents **live playback state**.

---

# 7. Authentication

Authentication must use **JWT**.

Required endpoints:

POST /auth/register
POST /auth/login

Password must be hashed with bcrypt.

JWT payload:

```
userId
username
```

Create middleware to:

- verify JWT
- attach user to request

---

# 8. REST API Endpoints

### Authentication

POST /auth/register
POST /auth/login

### Rooms

POST /rooms/create
POST /rooms/join
GET /rooms/:roomId

Responses must return structured JSON.

---

# 9. Socket.io System

Socket.io handles:

- playback synchronization
- chat messaging
- room presence

Sockets must authenticate using **JWT during connection**.

User identity must be attached to the socket.

---

# 10. Required Socket Events

Implement the following events.

Room lifecycle

```
createRoom
joinRoom
leaveRoom
```

Playback events

```
play
pause
seek
videoChange
```

Chat

```
chatMessage
```

Presence

```
userJoined
userLeft
```

---

# 11. Playback Synchronization

Playback synchronization must follow this pattern.

1. Host performs action
2. Client emits socket event
3. Server updates room state
4. Server broadcasts event

Example event from client:

```
socket.emit("play", {
  roomId,
  currentTime
})
```

Server broadcast:

```
io.to(roomId).emit("play", {
  currentTime
})
```

Clients update video playback.

---

# 12. Validation

All REST endpoints must validate input using **Zod**.

Invalid input must return:

```
{
  success: false,
  message: "Invalid input"
}
```

---

# 13. Error Handling

Use centralized error middleware.

Error format:

```
{
  success: false,
  message: "Error message"
}
```

---

# 14. Code Quality Rules

Generated code must:

- use strict TypeScript
- use async/await
- separate controller and service logic
- avoid duplicate logic
- use clear variable names
- keep files reasonably small

Functions should remain **focused and readable**.

---

# 15. Development Order

The backend must be implemented in this order.

1. Project initialization
2. Database connection
3. User model
4. Authentication system
5. JWT middleware
6. Room state manager
7. Room REST APIs
8. Socket.io setup
9. Playback synchronization
10. Chat system
11. Error handling

---

# 16. Agent Workflow

Before writing code, the AI agent must:

1. understand the module being modified
2. follow the architecture
3. update only relevant files
4. avoid rewriting existing working code

Agents should prefer **small incremental changes**.

---

# 17. Final Requirement

The backend must be:

- modular
- readable
- production-ready
- easy to extend

Favor **simplicity and clarity** over complex abstractions.
