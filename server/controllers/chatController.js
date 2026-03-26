// ──────────────────────────────────────────────────────────
// controllers/chatController.js — All Business Logic
// ──────────────────────────────────────────────────────────

const { User, Room, Message, RoomMember } = require('../models/index');

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

// Helper: get list of all online usernames (global tracking)
const broadcastGlobalUsers = async (io) => {
  const users = await User.findAll({
    where: {
      socketId: { [require('sequelize').Op.ne]: null }
    }
  });

  // Unique, lowercase, and sorted alphabetically
  const dbUsernames = new Set(users.map(u => u.username.toLowerCase()));
  const onlineUsernames = [...dbUsernames].sort();

  // 🔥 GHOST HUNTER: Eject users who no longer exist in DB
  const allSockets = await io.fetchSockets();
  for (const s of allSockets) {
    const socketUsername = s.data?.username;
    if (socketUsername && !dbUsernames.has(socketUsername)) {
      console.log(`[SECURITY] Ejecting ghost user: ${socketUsername}`);
      io.to(s.id).emit('auth_error', { message: 'Your user profile was removed from the database.' });
    }
  }

  io.emit('global_users_list', onlineUsernames);
};

// ── 1. joinRoom ───────────────────────────────────────────
const joinRoom = async (socket, io, data) => {
  const { username, room } = data;
  if (!username || !room) return;

  const trimmedUsername = username.trim().toLowerCase();
  const trimmedRoom = room.trim();

  let [user] = await User.findOrCreate({ where: { username: trimmedUsername }, defaults: { socketId: socket.id } });
  if (user.socketId !== socket.id) await user.update({ socketId: socket.id });

  const isPrivateFlag = trimmedRoom.startsWith('dm_');
  const [roomRecord] = await Room.findOrCreate({ where: { roomName: trimmedRoom }, defaults: { isPrivate: isPrivateFlag } });

  await RoomMember.findOrCreate({ where: { userId: user.id, roomId: roomRecord.id } });

  await socket.join(trimmedRoom);
  if (!socket.data.rooms) socket.data.rooms = [];
  if (!socket.data.rooms.includes(trimmedRoom)) socket.data.rooms.push(trimmedRoom);
  socket.data.username = trimmedUsername;

  const currentUsers = await getRoomUsers(io, trimmedRoom);
  socket.emit('room_users', { room: trimmedRoom, users: currentUsers });
  socket.to(trimmedRoom).emit('user_joined', { username: trimmedUsername, room: trimmedRoom });
  await broadcastGlobalUsers(io);
};

// ── 2. leaveRoom ─────────────────────────────────────────
const leaveRoom = async (socket, io, data) => {
  const { room } = data;
  if (!room) return;
  const trimmedRoom = room.trim();
  const username = socket.data.username || 'Unknown';

  await socket.leave(trimmedRoom);
  if (socket.data.rooms) {
    socket.data.rooms = socket.data.rooms.filter((r) => r !== trimmedRoom);
  }

  io.to(trimmedRoom).emit('user_left', { username, room: trimmedRoom });
};

// ── 3. sendMessage ────────────────────────────────────────
const sendMessage = async (socket, io, data) => {
  const { username, message, room, timestamp } = data;
  if (!username || !message || !room) return;

  const userRecord = await User.findOne({ where: { username: username.trim().toLowerCase() } });

  if (!userRecord || userRecord.socketId !== socket.id) {
    socket.emit('auth_error', { message: 'Session expired or user deleted.' });
    return;
  }

  let roomRecord = await Room.findOne({ where: { roomName: room.trim() } });
  if (!roomRecord) {
    roomRecord = await Room.create({ roomName: room.trim(), isPrivate: room.trim().startsWith('dm_') });
  }

  const savedMessage = await Message.create({
    userId: userRecord.id,
    roomId: roomRecord.id,
    message: message.trim(),
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  });

  io.to(room.trim()).emit('receive_message', {
    username: userRecord.username,
    message: savedMessage.message,
    room: room.trim(),
    timestamp: savedMessage.timestamp.toISOString(),
  });
};

const handleDisconnect = async (socket, io) => {
  if (socket.data.username) {
    await User.update({ socketId: null }, { where: { socketId: socket.id } });
  }
  const rooms = socket.data.rooms || [];
  const username = socket.data.username || 'Unknown';
  for (const r of rooms) { io.to(r).emit('user_left', { username, room: r }); }
  await broadcastGlobalUsers(io);
};

const getActiveUsers = async (socket, io) => {
  await broadcastGlobalUsers(io);
};

const getRoomMessages = async (socket, io, data) => {
  const { room } = data;
  if (!room) return;
  const roomRecord = await Room.findOne({ where: { roomName: room.trim() } });
  if (!roomRecord) {
    socket.emit('room_messages', { room: room.trim(), messages: [] });
    return;
  }
  const messages = await Message.findAll({
    where: { roomId: roomRecord.id },
    include: [{ model: User, attributes: ['username'] }],
    order: [['timestamp', 'ASC']],
    limit: 50,
  });
  const formattedMessages = messages.map(m => ({
    username: m.User.username,
    message: m.message,
    timestamp: m.timestamp.toISOString(),
    room: room.trim(),
  }));
  socket.emit('room_messages', { room: room.trim(), messages: formattedMessages });
};

const getUserRooms = async (socket, io, data) => {
  const { username } = data;
  if (!username) return;
  const user = await User.findOne({
    where: { username: username.trim().toLowerCase() },
    include: [{ model: Room, through: RoomMember }]
  });
  if (!user) {
    socket.emit('auth_error', { message: 'User deleted.' });
    return;
  }
  const roomNames = user.Rooms.map(r => r.roomName);
  socket.emit('user_rooms_list', roomNames);
};

const inviteToRoom = async (socket, io, data) => {
  const { room, invitedUsers } = data;
  if (!room || !invitedUsers || !Array.isArray(invitedUsers)) return;
  const [roomRecord] = await Room.findOrCreate({ where: { roomName: room.trim() } });
  for (const username of invitedUsers) {
    const user = await User.findOne({ where: { username: username.trim().toLowerCase() } });
    if (user) {
      await RoomMember.findOrCreate({ where: { userId: user.id, roomId: roomRecord.id } });
      if (user.socketId) {
        const invitedSocket = (await io.fetchSockets()).find(s => s.id === user.socketId);
        if (invitedSocket) {
          invitedSocket.join(room.trim());
        }
        io.to(user.socketId).emit('room_invitation', { room: room.trim() });
      }
    }
  }
};

module.exports = {
  joinRoom,
  leaveRoom,
  sendMessage,
  handleDisconnect,
  getActiveUsers,
  getRoomMessages,
  getUserRooms,
  inviteToRoom,
  broadcastGlobalUsers
};
