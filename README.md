# SecureChat | Advanced Real-Time Messenger

> **Modern Stack:** React 18 • Vite 6 • Socket.io • PostgreSQL • Sequelize ORM • Tailwind CSS

---

## 🏆 Project Team & Contributions

This project was a collaborative effort between the full-stack team. Below are the specific ownership areas:

### **1. Server Core & Bootstrap**
**Developer:** `Shrey Choksi`  
**Focus:** Initial server-side framework and basic socket event wiring.
*   **Core Logic:** `server/app.js`, `server/sockets/chatSocket.js` (Base setup)
*   **Infrastructure:** Environment configuration and initial Express routing.

### **2. Full-Stack Features & Advanced Logic**
**Developers:** `Anuradha Patil` & `Riddhi Ladva`  
**Focus:** Complete React migration, Database Architecture, Case-Normalization, and Real-Time Experience.
*   **Frontend (React/Vite):** 
    *   `client-react/src/App.tsx` (Main layout)
    *   `client-react/src/context/ChatContext.tsx` (State engine & activity sorting)
    *   `client-react/src/components/` (Sidebar, ChatWindow, Login, Modals)
*   **Database & Security (PostgreSQL):**
    *   `server/models/index.js` (ORM mapping)
    *   `server/models/RoomMember.js` (Many-to-Many Group Logic)
    *   `server/controllers/chatController.js` (Ghost Hunter Security, Sorting, Normalized Search)
*   **Features:** Direct Messaging, Persistent Group Invitations, Real-time Unread Badges (Green pulsing), and the "Most Recent First" sorting engine.

---

## 🚀 Getting Started

### **1. Server Setup**
```bash
cd server
npm install
# Configure .env with DB_NAME, DB_USER, DB_PASSWORD
npm run dev
```

### **2. Client Setup (React)**
```bash
cd client-react
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🛡️ Key Features
*   **Ghost Hunter Security:** Periodic background sync (every 5s) to eject users manually deleted from the database.
*   **Smart Sorting:** Conversations automatically bubble to the top of the sidebar based on recent activity.
*   **Sync Invitations:** Users see "Group Invites" instantly without needing to refresh their browser.
*   **Responsive UI:** Pulsing green notification badges and dynamic browser tab titles.

---

## 📂 Project Architecture
```
chat-app/
├── server/
│   ├── controllers/chatController.js   (Core logic by Anuradha/Riddhi)
│   ├── models/                         (DB Models by Anuradha/Riddhi)
│   ├── sockets/chatSocket.js           (Event wiring by Shrey/Anuradha)
│   └── app.js                          (Server Boot by Shrey)
├── client-react/
│   ├── src/context/ChatContext.tsx    (State Engine by Anuradha/Riddhi)
│   ├── src/components/                (UI Components by Anuradha/Riddhi)
│   └── src/App.tsx
└── README.md
```

---
*Created with ❤️ by the SecureChat Team — 2026*
