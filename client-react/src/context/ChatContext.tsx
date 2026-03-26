// @ts-nocheck
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { socket } from '../services/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeRoom, setActiveRoom] = useState('general');
    const [rooms, setRooms] = useState(['general']);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    // Track last activity (for sorting rooms by most recent)
    const [lastActivity, setLastActivity] = useState({});

    const activeRoomRef = useRef('general');
    useEffect(() => {
        activeRoomRef.current = activeRoom;
    }, [activeRoom]);

    const setAndNormalizeUser = (user) => {
        if (!user) {
            setCurrentUser(null);
            return;
        }
        setCurrentUser(user.trim().toLowerCase());
    };

    useEffect(() => {
        if (!currentUser) return;

        socket.emit('get_active_users');
        socket.emit('get_user_rooms', { username: currentUser });

        socket.on('global_users_list', (users) => {
            setOnlineUsers(users.filter(u => u !== currentUser));
        });

        socket.on('user_rooms_list', (dbRooms) => {
            setRooms(prev => {
                const normalizedDbRooms = dbRooms.map(r => r.toLowerCase().trim());
                const combined = new Set([...prev, ...normalizedDbRooms]);
                return Array.from(combined);
            });
        });

        socket.on('room_invitation', ({ room }) => {
            const normalizedRoom = room.toLowerCase().trim();
            setRooms(prev => {
                if (prev.includes(normalizedRoom)) return prev;
                return [...prev, normalizedRoom];
            });
            socket.emit('join_room', { username: currentUser, room: normalizedRoom });
        });

        socket.on('receive_message', (payload) => {
            const { room, message, username, timestamp } = payload;
            const normalizedRoom = room.toLowerCase().trim();

            setMessagesByRoom(prev => ({
                ...prev,
                [normalizedRoom]: [...(prev[normalizedRoom] || []), { username, message, timestamp }]
            }));

            // UPDATE LAST ACTIVITY (For Sorting)
            setLastActivity(prev => ({
                ...prev,
                [normalizedRoom]: new Date(timestamp).getTime()
            }));

            if (normalizedRoom !== activeRoomRef.current) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [normalizedRoom]: (prev[normalizedRoom] || 0) + 1
                }));
            }
        });

        //  SESSION PROTECTION (Anuradha's Security Task) 
        socket.on('auth_error', (err) => {
            console.warn("[SECURITY] Invalid Session: Logging out...");
            setCurrentUser(null);
            alert(`Session Error: ${err.message}`);
        });

        return () => {
            socket.off('global_users_list');
            socket.off('user_rooms_list');
            socket.off('room_invitation');
            socket.off('receive_message');
            socket.off('auth_error');
        };
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !activeRoom) return;

        socket.emit('get_room_messages', { room: activeRoom });
        socket.emit('join_room', { username: currentUser, room: activeRoom });
        setUnreadCounts(prev => ({ ...prev, [activeRoom]: 0 }));

        const handleHistory = ({ room: r, messages: msgs }) => {
            const normalizedRoom = r.toLowerCase().trim();
            if (normalizedRoom === activeRoom.toLowerCase().trim()) {
                setMessagesByRoom(prev => ({ ...prev, [activeRoom]: msgs }));

                // Set last activity based on last message in history if available
                if (msgs.length > 0) {
                    const lastMsg = msgs[msgs.length - 1];
                    setLastActivity(prev => ({
                        ...prev,
                        [normalizedRoom]: new Date(lastMsg.timestamp).getTime()
                    }));
                }
            }
        };

        socket.on('room_messages', handleHistory);
        return () => {
            socket.off('room_messages', handleHistory);
        };
    }, [currentUser, activeRoom]);

    useEffect(() => {
        const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
        document.title = totalUnread > 0 ? `(${totalUnread}) SecureChat` : `SecureChat`;
    }, [unreadCounts]);

    const createRoom = (roomName, invitedUsers = []) => {
        const name = roomName.toLowerCase().trim();
        setUnreadCounts(prev => ({ ...prev, [name]: 0 }));
        if (!rooms.includes(name)) {
            setRooms(prev => [...prev, name]);
        }
        socket.emit('join_room', { username: currentUser, room: name });
        if (invitedUsers.length > 0) {
            socket.emit('invite_to_room', { room: name, invitedUsers });
        }
        setActiveRoom(name);
    };

    const startDM = (targetUsername) => {
        const name = targetUsername.toLowerCase().trim();
        const sorted = [currentUser, name].sort();
        const dmRoomName = `dm_${sorted[0]}_${sorted[1]}`;

        setUnreadCounts(prev => ({ ...prev, [dmRoomName]: 0 }));
        socket.emit('join_room', { username: currentUser, room: dmRoomName });

        // 🔥 CRITICAL: Invite the target user so they join the socket room automatically
        socket.emit('invite_to_room', { room: dmRoomName, invitedUsers: [name] });

        setRooms(prev => {
            if (prev.includes(dmRoomName)) return prev;
            return [...prev, dmRoomName];
        });
        setActiveRoom(dmRoomName);
    };

    const sendMessage = (messageText) => {
        if (!messageText.trim() || !currentUser || !activeRoom) return;
        socket.emit('send_message', {
            username: currentUser,
            message: messageText.trim(),
            room: activeRoom,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <ChatContext.Provider value={{
            currentUser,
            setCurrentUser: setAndNormalizeUser,
            activeRoom,
            setActiveRoom,
            rooms,
            createRoom,
            onlineUsers,
            messages: messagesByRoom[activeRoom] || [],
            unreadCounts,
            lastActivity, // Exposed for sorting
            startDM,
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
