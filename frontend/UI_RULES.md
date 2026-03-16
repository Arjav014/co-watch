# CoWatch Frontend Specification

This document defines how the frontend of the CoWatch mobile application must be implemented.

AI coding agents must follow these instructions to ensure:

* consistent architecture
* maintainable code
* proper backend integration
* clean React Native practices

This document assumes that the **Expo project is already initialized**.

---

# 1. Application Overview

CoWatch is a mobile application where users can watch videos together in synchronized rooms.

The frontend must allow users to:

* register and login
* create watch rooms
* join watch rooms
* watch videos in synchronized playback
* chat with participants in real time
* see the list of participants in a room
* leave rooms

The frontend communicates with the backend through:

* REST API
* Socket.io events

---

# 2. Technology Requirements

The frontend must strictly use the following technologies.

Framework
React Native

Runtime
Expo

Language
TypeScript

Styling
Tailwind using NativeWind

Navigation
React Navigation

Networking
Axios

Realtime Communication
Socket.io-client

Local Storage
AsyncStorage

Do not introduce unnecessary libraries.

---

# 3. Authentication Flow

The frontend must implement authentication using backend endpoints.

Endpoints:

POST `/auth/register`
POST `/auth/login`

Login flow:

1. User enters credentials
2. API request is sent to backend
3. Backend returns JWT token
4. Store token using AsyncStorage
5. Attach token to future API requests
6. Redirect user to the main application

The frontend must maintain authentication state globally.

Users must remain logged in after app restart.

---

# 4. API Integration

Create a centralized API client using Axios.

Responsibilities of the API client:

* set base backend URL
* attach JWT token to headers
* handle API errors
* standardize request/response handling

All API calls must go through this centralized client.

Do not make direct API calls inside UI components.

---

# 5. Navigation Rules

Use React Navigation.

Navigation must include two primary flows:

Authentication flow

Login
Register

Application flow

Home
Create Room
Join Room
Watch Room
Profile

Users must be redirected to authentication screens if they are not logged in.

---

# 6. Home Screen

The home screen must allow users to quickly start or join a watch session.

The screen must contain:

Header section

* user avatar
* greeting
* profile access

Primary actions

Create Room button
Join Room button

Optional section

Recent rooms list.

---

# 7. Create Room

Users must be able to create a new watch room.

Inputs required:

Room name
Video URL

When the user presses "Create Room":

1. Send request to backend

POST `/rooms/create`

2. Backend returns roomId

3. Navigate to Watch Room screen.

---

# 8. Join Room

Users must be able to join an existing room.

Input required:

Room code.

Process:

1. User enters room code
2. Send request to backend

POST `/rooms/join`

3. If successful navigate to Watch Room screen.

If room does not exist show error message.

---

# 9. Watch Room Screen

This is the main screen of the application.

The layout must include:

Top section

* room name
* participants count
* leave room button

Center section

* video player

Bottom section

* playback controls

Side or modal section

* chat panel

Floating button

* participants list

This screen must feel immersive and social.

---

# 10. Video Playback Synchronization

Video playback must synchronize with backend events.

The frontend must listen for Socket.io events:

play
pause
seek
videoChange

When events are received:

* update video player state
* update playback position

If the current user is the host:

User actions must emit socket events to backend.

Example events emitted:

play
pause
seek

---

# 11. Socket Connection

The frontend must connect to the backend Socket.io server when entering a room.

Connection must include authentication token.

Responsibilities of socket system:

* join room
* listen to playback events
* receive chat messages
* track user presence

Socket events used:

createRoom
joinRoom
leaveRoom
play
pause
seek
videoChange
chatMessage
userJoined
userLeft

Socket listeners must be cleaned when leaving the room.

---

# 12. Chat System

The chat must be real-time.

When user sends message:

Emit socket event:

chatMessage

Chat messages must display:

* username
* message content
* timestamp
* avatar

Messages must auto-scroll when new messages arrive.

---

# 13. Participants List

The app must show a list of users currently in the room.

Each participant entry must include:

username
host badge if applicable
online status indicator

Participants list should open as a modal or panel.

---

# 14. UI Styling

The UI must use Tailwind via NativeWind.

Design rules:

Dark theme
Clean layout
Minimal UI
Large touch targets

Color palette should include:

Dark background
Purple or indigo accent colors
High contrast text

The UI must feel modern and social.

---

# 15. Reusable Components

Create reusable UI components.

Examples include:

Button
Input
Avatar
RoomCard
ChatMessage
VideoControls

Components must accept props and avoid hardcoded values.

---

# 16. State Management

Use React Context and hooks to manage global state.

Global state should include:

authentication state
current room state
socket connection

Local component state should be used for UI interactions.

Avoid unnecessary global state libraries.

---

# 17. Error Handling

The frontend must gracefully handle errors.

Examples:

invalid login
room not found
network failures

Error messages must be user-friendly.

---

# 18. Performance Rules

Avoid unnecessary re-renders.

Socket listeners must be properly cleaned up.

Large screens should be broken into smaller reusable components.

---

# 19. Development Order

The frontend should be implemented in the following order:

1. Authentication screens
2. Authentication state management
3. API integration
4. Home screen
5. Create room functionality
6. Join room functionality
7. Watch room UI
8. Socket connection
9. Video synchronization
10. Chat system
11. Participants panel
12. UI polish

---

# 20. Final Rule

The frontend must prioritize:

clarity
simplicity
maintainability

The code should be easy to understand and extend.

Prefer clean, readable code over complex abstractions.
