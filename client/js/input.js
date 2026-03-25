// ──────────────────────────────────────────────────────────
// client/js/input.js — Send Message Handling
// Owner: SDP_Anuradha Patil
// Phase: 5 (feature/client2-ui)
//
// TODO:
//   1. Import { socket } from './socket.js'
//   2. Import { username, room } from './room.js'
//   3. Import { EVENTS } from './events.js'
//   4. document.getElementById('send-btn').addEventListener('click', sendMessage)
//   5. document.getElementById('msg-input').addEventListener('keydown', (e) => {
//        if (e.key === 'Enter') sendMessage()
//      })
//   6. sendMessage():
//        - Read and trim value from #msg-input
//        - If empty or whitespace-only → return without emitting
//        - socket.emit(EVENTS.SEND_MESSAGE, {
//            username, message, room,
//            timestamp: new Date().toISOString()
//          })
//        - Clear #msg-input after emit
//
// RULE: Never hardcode event name strings — always use EVENTS.*
// ──────────────────────────────────────────────────────────

// Stub — implement in Phase 5
