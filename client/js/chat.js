// ──────────────────────────────────────────────────────────
// client/js/chat.js — Message Rendering
// Owner: SDP_Anuradha Patil
// Phase: 5 (feature/client2-ui)
//
// TODO:
//   1. Import { socket } from './socket.js'
//   2. Import { username } from './room.js'
//   3. Import { EVENTS } from './events.js'
//   4. socket.on(EVENTS.RECEIVE_MESSAGE, ({ username: sender, message, timestamp }) => {
//        - Compare sender to local username → assign class 'self' or 'other'
//        - Create div.message with appropriate class
//        - Show: sender name, message text, formatted timestamp
//        - Append to #chat-window
//        - Auto-scroll #chat-window to bottom
//      })
//   5. socket.on(EVENTS.USER_JOINED, ...) → render system message (centered, italic)
//   6. socket.on(EVENTS.USER_LEFT, ...)   → render system message (centered, italic)
//
// RULE: Do NOT emit any events here. Render only.
// ──────────────────────────────────────────────────────────

// Stub — implement in Phase 5
