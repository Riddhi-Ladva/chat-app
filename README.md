# Real-Time Chat Application

> Node.js • Express • Socket.io • PostgreSQL • Sequelize ORM

## Team

| Role | Developer | Owns |
|---|---|---|
| Server Dev | SDP_Shrey Choksi | `server/**` |
| Client Dev 1 | SDP_Riddhi Ladva | `client/js/events.js`, `socket.js`, `room.js` |
| Client Dev 2 | SDP_Anuradha Patil | `client/index.html`, `style.css`, `chat.js`, `input.js`, `users.js` |

---

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm v9+

---

## Setup (Server Dev — Shrey)

```bash
# 1. Clone the repo
git clone <repo-url>
cd ChatApplication

# 2. Install server dependencies
cd server
npm install

# 3. Configure environment
cp ../.env.example ../.env
# Open .env and fill in your PostgreSQL credentials

# 4. Create the database in PostgreSQL
# (Run this in psql or pgAdmin)
# CREATE DATABASE chatapp_db;

# 5. Start dev server (auto-restarts on file change)
npm run dev
```

Server will be available at `http://localhost:3000`

---

## Setup (Client Devs — Riddhi & Anuradha)

No build step required. The client uses native ES Modules (`type="module"`).

```bash
# After cloning, open client/index.html directly in the browser
# OR use VS Code Live Server extension for hot reload
# Make sure the server is running first!
```

---

## Git Workflow

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/<your-branch-name>

# Branch naming convention:
# feature/server-<name>    ← Server Dev
# feature/client1-<name>   ← Client Dev 1
# feature/client2-<name>   ← Client Dev 2

# Push and open a PR — never push directly to main
git push origin feature/<your-branch-name>
```

> ⚠️ **events.js must be merged before any other client branch is opened.**

---

## Project Structure

```
ChatApplication/
├── server/
│   ├── package.json
│   ├── app.js
│   ├── config/db.js
│   ├── models/ (User, Room, Message, index)
│   ├── controllers/chatController.js
│   └── sockets/chatSocket.js
├── client/
│   ├── index.html
│   ├── style.css
│   └── js/ (events, socket, room, chat, input, users)
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

See `.env.example` for all required keys. Copy to `.env` and fill in values. **Never commit `.env`.**

---

*Real-Time Chat Application PRD v1.0 — March 2025*
