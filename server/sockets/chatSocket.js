// ──────────────────────────────────────────────────────────
// sockets/chatSocket.js — Event Wiring Only (Zero Logic)
// Owner: SDP_Shrey Choksi
// RULE: No business logic here. Only event binding + error catch.
// ──────────────────────────────────────────────────────────

const controller = require('../controllers/chatController');

// Note: We use string literals here that match client/js/events.js exactly.
// The server uses CommonJS (require), client uses ESM (import).
// Both reference the same string values defined in the PRD §3.

module.exports = (io) => {
  // 🛡️ PERIODIC SECURITY SYNC (Anuradha's Security Task)
  // Check every 5 seconds if active users still exist in the DB.
  // This catches manual database wipes and ejects 'ghost' sessions.
  setInterval(async () => {
    try {
      if (io) {
        await controller.getActiveUsers(null, io);
      }
    } catch (err) {
      console.error('[SECURITY SYNC ERROR]', err.message);
    }
  }, 5000);

  io.on('connection', (socket) => {
    console.log(`[CONNECT] socket connected: ${socket.id}`);

    socket.on('join_room', (data) =>
      controller.joinRoom(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('send_message', (data) =>
      controller.sendMessage(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('leave_room', (data) =>
      controller.leaveRoom(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('get_active_users', () =>
      controller.getActiveUsers(socket, io)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('get_room_messages', (data) =>
      controller.getRoomMessages(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('get_user_rooms', (data) =>
      controller.getUserRooms(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('invite_to_room', (data) =>
      controller.inviteToRoom(socket, io, data)
        .catch((err) => socket.emit('error', { message: err.message }))
    );

    socket.on('disconnect', () => {
      console.log(`[DISCONNECT] socket disconnected: ${socket.id}`);
      controller.handleDisconnect(socket, io)
        .catch((err) => console.error('[DISCONNECT ERROR]', err.message));
    });
  });
};
