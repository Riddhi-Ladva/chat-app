// ──────────────────────────────────────────────────────────
// client/js/room.js — Join / Leave Room Logic
// Owner: SDP_Riddhi Ladva
// Phase: 4 (feature/client1-connection)
//
// RULE: Do NOT emit SEND_MESSAGE or handle receive_message here.
// ──────────────────────────────────────────────────────────

import { EVENTS } from './events.js';
import { socket } from './socket.js';

let username = '';
let room = '';

// Prompt for username (non-empty)
while (!username || username.trim() === '') {
    username = prompt('Enter your username:');
}
username = username.trim();

// Prompt for room (non-empty)
while (!room || room.trim() === '') {
    room = prompt('Enter room name to join:');
}
room = room.trim();

// Emit JOIN_ROOM with { username, room }
socket.emit(EVENTS.JOIN_ROOM, { username, room });

function leaveRoom() {
    if (room) {
        socket.emit(EVENTS.LEAVE_ROOM, { room });
        username = '';
        room = '';
    }
}

// Ensure cleanup on page exit
window.addEventListener('beforeunload', () => {
    leaveRoom();
});

export { username, room, leaveRoom };
