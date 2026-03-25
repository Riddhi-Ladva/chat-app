// ──────────────────────────────────────────────────────────
// controllers/chatController.js — All Business Logic
// Owner: SDP_Shrey Choksi
//
// TODO (Phase 3 — feature/server-core):
//   Implement the following async functions:
//
//   joinRoom(socket, io, data)
//     - Validate: username and room must be non-empty strings
//     - FindOrCreate User (username + socketId)
//     - FindOrCreate Room (roomName)
//     - socket.join(data.room)
//     - Push room to socket.data.rooms (init if undefined)
//     - Emit ROOM_USERS to socket (current member list)
//     - Emit USER_JOINED to io.to(room) excluding joining socket
//
//   leaveRoom(socket, io, data)
//     - Validate: room must be non-empty
//     - socket.leave(data.room)
//     - Remove room from socket.data.rooms
//     - Emit USER_LEFT to io.to(room)
//
//   sendMessage(socket, io, data)
//     - Validate: username, message, room all present and non-empty
//     - Reject whitespace-only message → emit ERROR to sender
//     - Lookup User and Room in DB
//     - Create Message record { userId, roomId, message, timestamp }
//     - Broadcast RECEIVE_MESSAGE to io.to(data.room)
//
//   handleDisconnect(socket, io)
//     - Read socket.data.rooms array
//     - For each room: emit USER_LEFT to io.to(room)
// ──────────────────────────────────────────────────────────

// Stub — implement in Phase 3
