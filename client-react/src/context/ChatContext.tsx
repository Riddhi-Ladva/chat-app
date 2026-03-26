// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import { socket } from '../services/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); 
    const [activeRoom, setActiveRoom] = useState('');
    const [rooms, setRooms] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const [roomUsers, setRoomUsers] = useState({});

    const login = (username) => {
        setCurrentUser(username);
        socket.emit('login', { username });
    };

    // Whenever active room changes, fetch the DB history for it
    useEffect(() => {
        if (currentUser && activeRoom) {
            socket.emit('get_messages', { room: activeRoom });
        }
    }, [activeRoom, currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        socket.on('login_success', ({ rooms }) => {
            setRooms(rooms);
            if (rooms.length > 0) setActiveRoom(rooms[0]);
        });

        socket.on('added_to_room', ({ room }) => {
            setRooms(prev => [...new Set([...prev, room])]);
            setActiveRoom(room);
        });

        socket.on('room_users', ({ room, users }) => {
            setRoomUsers(prev => ({ ...prev, [room]: users }));
        });

        socket.on('user_joined', ({ username, room }) => {
            setRoomUsers(prev => {
                const current = prev[room] || [];
                if (!current.includes(username)) return { ...prev, [room]: [...current, username] };
                return prev;
            });
        });

        socket.on('user_left', ({ username, room }) => {
            setRoomUsers(prev => {
                const current = prev[room] || [];
                return { ...prev, [room]: current.filter(u => u !== username) };
            });
        });

        socket.on('room_history', ({ room, messages }) => {
            setMessagesByRoom(prev => ({ ...prev, [room]: messages }));
        });

        // Listening for global users list (Shrey's task integration)
        socket.on('global_users_list', (users) => {
            // Filter out current user
            const others = users.filter(u => u !== currentUser);
            setOnlineUsers(others);
        });

        // Listening for messages (Phase 4 integration)
        socket.on('receive_message', (payload) => {
            const { room, message, username, timestamp } = payload;

            // 1. Update messages for that room
            setMessagesByRoom(prev => ({
                ...prev,
                [room]: [...(prev[room] || []), { username, message, timestamp }]
            }));

            // 2. Logic for Unread Badges (Anuradha's Task 3)
            if (room !== activeRoom) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [room]: (prev[room] || 0) + 1
                }));
            }
        });

        return () => {
            socket.off('global_users_list');
            socket.off('receive_message');
            socket.off('login_success');
            socket.off('added_to_room');
            socket.off('room_users');
            socket.off('user_joined');
            socket.off('user_left');
            socket.off('room_history');
        };
    }, [activeRoom, currentUser]);

    // Group Creation logic 
    const createRoom = (roomName, invitees = []) => {
        // Emit our newly minted feature/server-db event
        socket.emit('create_group', { groupName: roomName, members: [currentUser, ...invitees] });
        // Server will respond dynamically via added_to_room socket
    };

    const addToGroup = (roomName, invitees = []) => {
        socket.emit('add_to_group', { groupName: roomName, members: invitees });
    };

    // Private Room Generator logic (Riddhi's logic mapped to React)
    const startDM = (targetUsername) => {
        const sorted = [currentUser, targetUsername].sort();
        const dmRoomName = `dm_${sorted[0]}_${sorted[1]}`;

        socket.emit('join_room', { username: currentUser, room: dmRoomName });
        setActiveRoom(dmRoomName);

        // Clear unread badge for this room
        setUnreadCounts(prev => ({
            ...prev,
            [dmRoomName]: 0
        }));
    };

    const sendMessage = (text) => {
        if (!text.trim() || !activeRoom) return;
        socket.emit('send_message', {
            username: currentUser,
            room: activeRoom,
            message: text.trim(),
            timestamp: new Date().toISOString()
        });
    };

    return (
        <ChatContext.Provider value={{
            login,
            currentUser,
            activeRoom,
            setActiveRoom,
            rooms,
            createRoom,
            addToGroup,
            onlineUsers,
            roomUsers,
            messages: messagesByRoom[activeRoom] || [],
            unreadCounts,
            startDM,
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
