// @ts-nocheck
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { User, MessageSquare, ShieldCheck, PlusSquare } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';

const Sidebar = () => {
    const { onlineUsers, activeRoom, startDM, unreadCounts, currentUser, rooms, createRoom, setActiveRoom, lastActivity } = useChat();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateRoom = () => {
        setIsCreateModalOpen(true);
    };

    // Sort Rooms by most recent activity
    const sortedRooms = [...rooms]
        .filter(r => !r.startsWith('dm_'))
        .sort((a, b) => (lastActivity[b] || 0) - (lastActivity[a] || 0));

    // Sort Online Users by most recent message activity with them
    const sortedOnlineUsers = [...onlineUsers].sort((userA, userB) => {
        const roomA = `dm_${[currentUser, userA].sort().join('_')}`;
        const roomB = `dm_${[currentUser, userB].sort().join('_')}`;
        return (lastActivity[roomB] || 0) - (lastActivity[roomA] || 0);
    });

    return (
        <div className="w-80 bg-gray-50 h-screen border-r flex flex-col pt-4 pr-1 relative overflow-hidden">
            <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            <header className="mb-6 pl-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" /> SecureChat
                </h2>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6 pb-20">
                {/* Rooms Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 pl-2 pr-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider underline-offset-4">Rooms</h3>
                        <button onClick={handleCreateRoom} className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                            <PlusSquare size={18} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {sortedRooms.map(room => (
                            <div
                                key={room}
                                onClick={() => setActiveRoom(room)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeRoom === room ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={16} strokeWidth={2.5} />
                                    <span className="text-sm font-medium italic"># {room}</span>
                                </div>
                                {unreadCounts[room] > 0 && activeRoom !== room && (
                                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                                        {unreadCounts[room]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Messages Section */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-2">Direct Messages</h3>
                    <div id="dm-users-list" className="space-y-1">
                        {sortedOnlineUsers.length === 0 ? (
                            <p className="text-xs text-gray-400 italic pl-3">Everyone's busy offline...</p>
                        ) : sortedOnlineUsers.map((user) => {
                            const sortedArray = [currentUser, user].sort();
                            const roomName = `dm_${sortedArray[0]}_${sortedArray[1]}`;
                            const isActive = activeRoom === roomName;
                            const unreadCount = unreadCounts[roomName] || 0;

                            return (
                                <div
                                    key={user}
                                    onClick={() => startDM(user)}
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${isActive ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                                <User size={18} strokeWidth={2} />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <span className="text-sm font-medium">{user}</span>
                                    </div>
                                    {unreadCount > 0 && !isActive && (
                                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Current User Bar - Sticky at bottom */}
            <footer className="absolute bottom-4 left-4 right-4 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-default">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-blue-500/20">
                    {currentUser ? currentUser[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{currentUser}</div>
                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Online
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Sidebar;
