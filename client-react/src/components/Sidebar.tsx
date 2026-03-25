// @ts-nocheck
import React from 'react';
import { useChat } from '../context/ChatContext';
import { User, MessageSquare, ShieldCheck, PlusSquare } from 'lucide-react';

const Sidebar = () => {
    const { onlineUsers, activeRoom, startDM, unreadCounts, currentUser, rooms, createRoom, setActiveRoom } = useChat();

    // Mock Data for Demo (Anuradha can remove this later)
    const demoUsers = onlineUsers.length > 0 ? onlineUsers : ['Shrey', 'Riddhi', 'Rahul'];

    const handleCreateRoom = () => {
        const name = window.prompt("Enter new group name:");
        if (name) createRoom(name.toLowerCase().replace(/\s+/g, '-'));
    };

    return (
        <div className="w-80 bg-gray-50 h-screen border-r flex flex-col p-4">
            <header className="mb-8 pl-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" /> SecureChat
                </h2>
            </header>

            {/* Rooms Section - New Groups logic */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2 pl-2 pr-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rooms</h3>
                    <button
                        onClick={handleCreateRoom}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Create New Group"
                    >
                        <PlusSquare size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    {rooms.map(room => (
                        <div
                            key={room}
                            onClick={() => setActiveRoom(room)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeRoom === room ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} />
                                <span># {room}</span>
                            </div>
                            {unreadCounts[room] > 0 && activeRoom !== room && (
                                <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCounts[room]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Direct Messages Section - Anuradha's Task #1 & #2 */}
            <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-2">Direct Messages</h3>
                <div id="dm-users-list" className="space-y-1">
                    {demoUsers.map((user) => {
                        const sortedArray = [currentUser, user].sort();
                        const roomName = `dm_${sortedArray[0]}_${sortedArray[1]}`;
                        const isActive = activeRoom === roomName;
                        const unreadCount = unreadCounts[roomName] || 0;

                        return (
                            <div
                                key={user}
                                onClick={() => startDM(user)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                                            <User size={20} />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <span>{user}</span>
                                </div>

                                {/* Unread Badge - Anuradha's Task #3 */}
                                {unreadCount > 0 && !isActive && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current User Bar */}
            <footer className="mt-auto p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser[0]}
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-800">{currentUser}</div>
                    <div className="text-[10px] text-green-500 font-medium">Online</div>
                </div>
            </footer>
        </div>
    );
};

export default Sidebar;
