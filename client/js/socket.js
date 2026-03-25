// ──────────────────────────────────────────────────────────
// client/js/socket.js — Socket.io Connection Initialisation
// Owner: SDP_Riddhi Ladva
// Phase: 4 (feature/client1-connection)
//
// RULE: Do NOT attach any message or room event listeners here.
//       Only connection lifecycle events belong in this file.
// ──────────────────────────────────────────────────────────

import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

const socket = io('http://localhost:3000', {
    reconnection: true
});

socket.on('connect', () => {
    console.log('Connected to server! Socket ID:', socket.id);
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = 'Connected';
        statusBar.style.color = 'green';
    }
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = 'Disconnected';
        statusBar.style.color = 'red';
    }
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = `Connection error: ${error.message}`;
        statusBar.style.color = 'orange';
    }
});

export { socket };
