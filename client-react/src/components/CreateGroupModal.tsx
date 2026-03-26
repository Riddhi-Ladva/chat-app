// @ts-nocheck
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { onlineUsers, createRoom } = useChat();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toggleUser = (user) => {
        if (selectedUsers.includes(user)) {
            setSelectedUsers(selectedUsers.filter(u => u !== user));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (groupName.trim()) {
            createRoom(groupName.trim().toLowerCase().replace(/\s+/g, '-'), selectedUsers);
            onClose();
            setGroupName('');
            setSelectedUsers([]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        <header className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <h2 className="font-bold text-gray-800">New Group Chat</h2>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Group Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g. Project Alpha"
                                    className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Invite Members ({selectedUsers.length})</label>
                                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {onlineUsers.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic py-2 pl-1">No online users to invite...</p>
                                    ) : (
                                        onlineUsers.map(user => (
                                            <div
                                                key={user}
                                                onClick={() => toggleUser(user)}
                                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedUsers.includes(user) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                                        {user[0]}
                                                    </div>
                                                    <span className="text-sm font-medium">{user}</span>
                                                </div>
                                                {selectedUsers.includes(user) && <Check size={16} className="text-blue-600" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!groupName.trim()}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
                            >
                                Create Group
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateGroupModal;
