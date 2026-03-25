# Phase 2 — Direct Messaging (DM) Specification
**Feature:** Secure, Database-Backed Private DMs via "Private Rooms"

## 1. Architectural Strategy
Direct Messages are treated as **Private Rooms**. 
When `userA` wants to message `userB`, the client generates a room string: `dm_userA_userB` (names MUST be sorted alphabetically to guarantee both users generate the exact same room string).
The server intercepts `join_room` requests for any room starting with `dm_` and rigorously verifies that the socket's username matches one of the two names in the string. If a mismatch is detected, the server throws an `error`. 

This seamlessly allows PostgreSQL to store DM messages in the exact same `Messages` table as Group Chats without any schema restructuring.

---

## 2. Server Dev Implementation (Owner: SDP_Shrey)

### Tasks:
1. **Update schema in `server/models/Room.js`**
   - Add a new boolean column: `isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false }`
   
2. **Modify `joinRoom` in `server/controllers/chatController.js`**
   - After extracting the `room` variable, check: `const isPrivate = room.startsWith('dm_');`
   - If `isPrivate` is true, extract the target users: `const [prefix, user1, user2] = room.split('_');`
   - **Security Check:** If `username !== user1 && username !== user2`, `throw new Error("Access Denied: You cannot join this private chat.");`
   - Pass `isPrivate` to the `FindOrCreate` Room defaults.

3. **Global User Tracking in `server/controllers/chatController.js`**
   - The client needs to know who is online globally to send a DM.
   - Add a new event handler `get_active_users` that queries `User.findAll({ where: { /* active sockets */ } })` or pulls from `io.sockets.adapter.rooms` to compile a global array of active usernames.
   - Emit a new event `global_users_list` back to the requester.

---

## 3. Client Dev 1 Implementation (Owner: SDP_Riddhi)

### Tasks:
1. **Update Constants in `client/js/events.js`**
   - Add: `GET_USERS: 'get_active_users'`
   - Add: `GLOBAL_USERS: 'global_users_list'`

2. **State Management in `client/js/room.js`**
   - Expose an `activeRoom` variable that defaults to the group room name.
   - Add a switch function: `setActiveRoom(newRoomName)` which Anuradha's UI code can call when switching chat tabs. 
   - Ensure the user remains passively connected to all joined rooms via the socket, but `activeRoom` dictates which room `SEND_MESSAGE` targets.

3. **Private Room Generator in `client/js/dm.js` (NEW FILE)**
   - Create and export a function `startDM(targetUsername)`.
   - **Logic:** 
     1. Take the local `username` and `targetUsername`.
     2. Put them in an array: `[username, targetUsername]`.
     3. Sort alphabetically: `.sort()`.
     4. Build string: `const dmRoomName = 'dm_' + array[0] + '_' + array[1];`
     5. Call `socket.emit(EVENTS.JOIN_ROOM, { username, room: dmRoomName })`.
     6. Call `setActiveRoom(dmRoomName)` from `room.js`.

---

## 4. Client Dev 2 Implementation (Owner: SDP_Anuradha)

### Tasks:
1. **Sidebar UI in `client/index.html` & `client/style.css`**
   - Introduce a new DOM section: `#dm-users-list`.
   - Ensure you have a visible "Active Tab" indicator (e.g., `#chat-title` showing the current room or DM partner's name).

2. **Interaction in `client/js/users.js`**
   - Listen to the new global users list from Riddhi.
   - Render the global active users into `#dm-users-list`.
   - Attach an integration click listener: When a username is clicked, invoke `startDM(clickedUsername)` (imported from `dm.js`).

3. **Message Rendering & Notification Badges in `client/js/chat.js`**
   - You will now receive `receive_message` events from multiple rooms simultaneously.
   - When a message arrives, check its `room` payload against the `activeRoom` variable (imported from `room.js`).
   - **If it matches `activeRoom`:** Append the bubble to `#chat-window` normally.
   - **If it does NOT match:** Do *not* render the bubble. Instead, find the corresponding room/user string in the sidebar and append an unread badge (`<span class="badge">1</span>`).
   - When switching tabs, clear the `#chat-window` UI. (History fetching is a separate feature; for now, start with a clean DOM window when switching).
