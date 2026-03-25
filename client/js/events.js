// ──────────────────────────────────────────────────────────
// client/js/events.js — Socket Event Name Constants
// Owner: SDP_Riddhi Ladva
// Phase: 2 (feature/client1-events) — MUST be first merge
//
// RULE: This is the single source of truth for all event name strings.
//       Both the server (chatSocket.js) and all client files import from here.
//       Never hardcode event name strings anywhere else.
//       Never rename keys without team consensus + PRD update.
// ──────────────────────────────────────────────────────────

export const EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  ROOM_USERS: 'room_users',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ERROR: 'error',
};
