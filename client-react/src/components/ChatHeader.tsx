// @ts-nocheck
import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquare, User, MoreHorizontal, MessageCircle } from 'lucide-react';

const ChatHeader = () => {
    const { activeRoom, currentUser, roomUsers, addToGroup } = useChat();

    const handleAddUsers = () => {
        const memberStr = window.prompt(`Enter comma-separated usernames to add to ${formatRoomName(activeRoom)}:`);
        if (memberStr) {
            const invitees = memberStr.split(',').map(m => m.trim()).filter(Boolean);
            addToGroup(activeRoom, invitees);
        }
    };

    // Helper to format room display name
    const formatRoomName = (room) => {
        if (room === 'general') return 'general';
        const parts = room.split('_');
        if (parts[0] === 'dm') {
            return parts[1] === currentUser ? parts[2] : parts[1];
        }
        return room;
    };

    const isDM = activeRoom.startsWith('dm_');
    const roomName = formatRoomName(activeRoom);

    return (
        <header id="chat-title" className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    {isDM ? <MessageCircle size={22} /> : <MessageSquare size={22} />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isDM ? `${roomName}` : `# ${roomName}`}
                    </h2>
                    <div className="text-xs text-green-500 font-medium flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> 
                        {roomUsers[activeRoom] ? roomUsers[activeRoom].length : 0} Online
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={handleAddUsers} title="Add Users to Group" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <User size={20} />
                </button>
                <button onClick={() => alert('Room Settings modal coming soon!')} title="Settings" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;
