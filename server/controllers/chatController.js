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

// Helper: get list of global online users
const getGlobalOnlineUsers = (io) => {
  const users = new Set();
  for (const [id, socket] of io.sockets.sockets) {
    if (socket.data.username) {
      users.add(socket.data.username);
    }
  }
  return Array.from(users);
};

// ── 0. loginUser ──────────────────────────────────────────
const loginUser = async (socket, io, data) => {
  const { username } = data;
  if (!username) throw new Error('username is required');

  const trimmedUsername = username.trim();
  socket.data.username = trimmedUsername;
  
  // FindOrCreate User
  let [user] = await User.findOrCreate({
    where: { username: trimmedUsername },
    defaults: { socketId: socket.id },
  });
  if (user.socketId !== socket.id) {
    await user.update({ socketId: socket.id });
  }

  // Get historical rooms via Junction table
  const userRooms = await user.getRooms();
  const roomNames = userRooms.map(r => r.roomName);

  // Re-join the socket to all historical rooms
  for (const rName of roomNames) {
    await socket.join(rName);
    if (!socket.data.rooms) socket.data.rooms = [];
    if (!socket.data.rooms.includes(rName)) socket.data.rooms.push(rName);
    
    // Broadcast room users state sequentially so the client populates its counter
    const currentUsers = await getRoomUsers(io, rName);
    socket.emit('room_users', { room: rName, users: currentUsers });
  }

  // Give the user their list of rooms
  socket.emit('login_success', { rooms: roomNames });

  // Broadcast the new master global user list
  io.emit('global_users_list', getGlobalOnlineUsers(io));
  console.log(`[LOGIN] ${trimmedUsername} logged in and joined ${roomNames.length} rooms`);
};

// ── 0.5. createGroup ──────────────────────────────────────
const createGroup = async (socket, io, data) => {
  const { groupName, members } = data; 
  if (!groupName || !members || !Array.isArray(members)) {
    throw new Error('groupName and members array are required');
  }

  const trimmedRoom = groupName.trim();
  const creator = socket.data.username;
  
  if (!members.includes(creator)) {
    members.push(creator);
  }

  const [roomRecord] = await Room.findOrCreate({
    where: { roomName: trimmedRoom },
    defaults: {},
  });

  for (const memberName of members) {
    const userRecord = await User.findOne({ where: { username: memberName.trim() } });
    if (userRecord) {
      // Create relationship in UserRooms
      await userRecord.addRoom(roomRecord); 
      
      const onlineSocketId = userRecord.socketId;
      const targetSocket = io.sockets.sockets.get(onlineSocketId);
      
      // If the user's socket is actively connected, update their local state too
      if (targetSocket && targetSocket.data.username === memberName.trim()) {
        await targetSocket.join(trimmedRoom);
        if (!targetSocket.data.rooms) targetSocket.data.rooms = [];
        if (!targetSocket.data.rooms.includes(trimmedRoom)) {
          targetSocket.data.rooms.push(trimmedRoom);
        }
        targetSocket.emit('added_to_room', { room: trimmedRoom, members });
      }
    }
  }
  console.log(`[GROUP] ${creator} created group ${trimmedRoom} with ${members.join(', ')}`);
};

// ── 0.75. addToGroup ────────────────────────────────────────
const addToGroup = async (socket, io, data) => {
  const { groupName, members } = data;
  if (!groupName || !members || !Array.isArray(members)) return;

  const trimmedRoom = groupName.trim();
  const roomRecord = await Room.findOne({ where: { roomName: trimmedRoom } });
  if (!roomRecord) throw new Error(`Room not found: ${trimmedRoom}`);

  for (const memberName of members) {
    const userRecord = await User.findOne({ where: { username: memberName.trim() } });
    if (userRecord) {
      const existingRooms = await userRecord.getRooms({ where: { id: roomRecord.id } });
      if (existingRooms.length === 0) {
        // Associate natively in PostgreSQL
        await userRecord.addRoom(roomRecord); 
        
        const onlineSocketId = userRecord.socketId;
        const targetSocket = io.sockets.sockets.get(onlineSocketId);
        
        if (targetSocket && targetSocket.data.username === memberName.trim()) {
          // Put the online user into the live room
          await targetSocket.join(trimmedRoom);
          if (!targetSocket.data.rooms) targetSocket.data.rooms = [];
          if (!targetSocket.data.rooms.includes(trimmedRoom)) {
            targetSocket.data.rooms.push(trimmedRoom);
          }
          // Refresh them 
          targetSocket.emit('added_to_room', { room: trimmedRoom });
          
          const currentUsers = await getRoomUsers(io, trimmedRoom);
          targetSocket.emit('room_users', { room: trimmedRoom, users: currentUsers });
        }
        
        // Let everyone else in the room know someone was added!
        io.to(trimmedRoom).emit('user_joined', { username: memberName.trim(), room: trimmedRoom });
      }
    }
  }
  console.log(`[ADD_TO_GROUP] ${members.join(', ')} added to ${trimmedRoom}`);
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

  // Track the room historically in UserRooms DB
  await user.addRoom(roomRecord);

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

  // Nullify to prevent fetching them in global list, then broadcast
  socket.data.username = null;
  io.emit('global_users_list', getGlobalOnlineUsers(io));
};

// ── 5. getMessages ──────────────────────────────────────────
const getMessages = async (socket, io, data) => {
  const { room } = data;
  if (!room) return;

  const roomRecord = await Room.findOne({ where: { roomName: room.trim() } });
  if (!roomRecord) return;

  // Query Database for all matching messages, sorted chronologically
  const messages = await Message.findAll({
    where: { roomId: roomRecord.id },
    include: [{ model: User, attributes: ['username'] }],
    order: [['timestamp', 'ASC']]
  });

  const formattedMessages = messages.map(m => ({
    username:  m.User.username,
    message:   m.message,
    room:      roomRecord.roomName,
    timestamp: m.timestamp.toISOString()
  }));

  // Emit directly back to the requesting socket
  socket.emit('room_history', { room: roomRecord.roomName, messages: formattedMessages });
};

module.exports = {
  loginUser,
  createGroup,
  addToGroup,
  joinRoom,
  leaveRoom,
  sendMessage,
  handleDisconnect,
  getMessages,
};
