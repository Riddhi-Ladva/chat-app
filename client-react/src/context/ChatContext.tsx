// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import { socket } from '../services/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState('Anuradha'); // Temporarily hardcoded for development
    const [activeRoom, setActiveRoom] = useState('general');
    const [rooms, setRooms] = useState(['general']);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
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
        };
    }, [activeRoom, currentUser]);

    // Group Creation logic 
    const createRoom = (roomName) => {
        if (!rooms.includes(roomName)) {
            setRooms(prev => [...prev, roomName]);
        }
        socket.emit('join_room', { username: currentUser, room: roomName });
        setActiveRoom(roomName);

        // Clear unread badge for this room
        setUnreadCounts(prev => ({ ...prev, [roomName]: 0 }));
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

    return (
        <ChatContext.Provider value={{
            currentUser,
            activeRoom,
            setActiveRoom,
            rooms,
            createRoom,
            onlineUsers,
            messages: messagesByRoom[activeRoom] || [],
            unreadCounts,
            startDM
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
