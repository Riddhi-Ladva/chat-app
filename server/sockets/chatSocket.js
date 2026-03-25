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

    socket.on('disconnect', () => {
      console.log(`[DISCONNECT] socket disconnected: ${socket.id}`);
      controller.handleDisconnect(socket, io)
        .catch((err) => console.error('[DISCONNECT ERROR]', err.message));
    });
  });
};
