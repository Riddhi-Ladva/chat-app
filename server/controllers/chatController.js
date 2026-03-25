// ──────────────────────────────────────────────────────────
// controllers/chatController.js — All Business Logic
// Owner: SDP_Shrey Choksi
// ──────────────────────────────────────────────────────────

const { User, Room, Message } = require('../models/index');

// Helper: get list of usernames currently in a room
const getRoomUsers = async (io, room) => {
  const socketIds = [...(io.sockets.adapter.rooms.get(room) || [])];
  const users = await Promise.all(
    socketIds.map(async (sid) => {
      const u = await User.findOne({ where: { socketId: sid } });
      return u ? u.username : null;
    })
  );
  return users.filter(Boolean);
};

// ── 1. joinRoom ───────────────────────────────────────────
const joinRoom = async (socket, io, data) => {
  const { username, room } = data;

  // Validate
  if (!username || typeof username !== 'string' || username.trim() === '') {
    throw new Error('username is required and must be a non-empty string');
  }
  if (!room || typeof room !== 'string' || room.trim() === '') {
    throw new Error('room is required and must be a non-empty string');
  }

  const trimmedUsername = username.trim();
  const trimmedRoom     = room.trim();

  // FindOrCreate User — update socketId if username already exists (PRD §5.1)
  let [user] = await User.findOrCreate({
    where:    { username: trimmedUsername },
    defaults: { socketId: socket.id },
  });
  if (user.socketId !== socket.id) {
    await user.update({ socketId: socket.id });
  }

  // FindOrCreate Room
  const [roomRecord] = await Room.findOrCreate({
    where:    { roomName: trimmedRoom },
    defaults: {},
  });

  // Join socket room
  await socket.join(trimmedRoom);

  // Track rooms on socket for disconnect handling
  if (!socket.data.rooms) socket.data.rooms = [];
  if (!socket.data.rooms.includes(trimmedRoom)) {
    socket.data.rooms.push(trimmedRoom);
  }
  // Store username on socket for disconnect handling
  socket.data.username = trimmedUsername;

  // Emit ROOM_USERS to the joining socket
  const currentUsers = await getRoomUsers(io, trimmedRoom);
  socket.emit('room_users', { room: trimmedRoom, users: currentUsers });

  // Emit USER_JOINED to all others in the room (excluding joining socket)
  socket.to(trimmedRoom).emit('user_joined', {
    username: trimmedUsername,
    room:     trimmedRoom,
  });

  console.log(`[JOIN] ${trimmedUsername} joined room: ${trimmedRoom}`);
};

// ── 2. leaveRoom ─────────────────────────────────────────
const leaveRoom = async (socket, io, data) => {
  const { room } = data;

  // Validate
  if (!room || typeof room !== 'string' || room.trim() === '') {
    throw new Error('room is required and must be a non-empty string');
  }

  const trimmedRoom = room.trim();
  const username    = socket.data.username || 'Unknown';

  await socket.leave(trimmedRoom);

  // Remove from tracked rooms array
  if (socket.data.rooms) {
    socket.data.rooms = socket.data.rooms.filter((r) => r !== trimmedRoom);
  }

  // Notify remaining members
  io.to(trimmedRoom).emit('user_left', {
    username,
    room: trimmedRoom,
  });

  console.log(`[LEAVE] ${username} left room: ${trimmedRoom}`);
};

// ── 3. sendMessage ────────────────────────────────────────
const sendMessage = async (socket, io, data) => {
  const { username, message, room, timestamp } = data;

  // Validate presence
  if (!username || !message || !room) {
    throw new Error('username, message, and room are all required');
  }

  // Reject whitespace-only messages (PRD §5.3)
  if (message.trim() === '') {
    throw new Error('Message cannot be empty or whitespace only');
  }

  // Look up User and Room in DB
  const userRecord = await User.findOne({ where: { username: username.trim() } });
  if (!userRecord) throw new Error(`User not found: ${username}`);

  const roomRecord = await Room.findOne({ where: { roomName: room.trim() } });
  if (!roomRecord) throw new Error(`Room not found: ${room}`);

  // Persist message to DB
  const savedMessage = await Message.create({
    userId:    userRecord.id,
    roomId:    roomRecord.id,
    message:   message.trim(),
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  });

  // Broadcast to all in room INCLUDING sender (PRD §5.3)
  io.to(room.trim()).emit('receive_message', {
    username:  userRecord.username,
    message:   savedMessage.message,
    room:      room.trim(),
    timestamp: savedMessage.timestamp.toISOString(),
  });

  console.log(`[MSG] ${username} → ${room}: ${message.trim()}`);
};

// ── 4. handleDisconnect ───────────────────────────────────
const handleDisconnect = async (socket, io) => {
  const rooms    = socket.data.rooms || [];
  const username = socket.data.username || 'Unknown';

  for (const room of rooms) {
    io.to(room).emit('user_left', { username, room });
    console.log(`[DISCONNECT] ${username} disconnected from room: ${room}`);
  }
};

module.exports = {
  joinRoom,
  leaveRoom,
  sendMessage,
  handleDisconnect,
};
