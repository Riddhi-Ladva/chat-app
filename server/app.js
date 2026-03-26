// ──────────────────────────────────────────────────────────
// app.js — Express + Socket.io Bootstrap
// Owner: SDP_Shrey Choksi
// ──────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { syncDB } = require('./models/index');
const chatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);

// ── CORS (Express) ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Socket.io with CORS (PRD §6.1) ───────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ── Health check route ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ChatApp server is running' });
});

// ── Wire socket events ────────────────────────────────────
chatSocket(io);

// ── Boot ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await syncDB();
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
module.exports = { app, server, io };
