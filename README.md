# CoWatch

CoWatch is a watch-party app with an Expo/React Native frontend and an Express + Socket.IO backend. It uses Redis for active room state and MongoDB for durable persistence.

## Documentation

- [System Design Walkthrough](docs/system-design.md)

## Project Structure

- `frontend/`: Expo app, authentication flow, room UI, video playback, and chat
- `backend/`: Express API, Socket.IO events, room service, and persistence logic
- `docker-compose.yml`: local MongoDB, Redis, and backend orchestration

## Core Flow

1. User registers or logs in and receives a JWT.
2. Frontend stores the JWT and uses it for REST and socket authentication.
3. User creates or joins a room over HTTP.
4. Frontend opens an authenticated Socket.IO connection for the room.
5. Host playback actions are validated by the backend and broadcast to all participants.
6. Redis stores live room state, while MongoDB stores durable room and chat data.
