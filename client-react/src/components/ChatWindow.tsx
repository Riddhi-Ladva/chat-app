// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Send, Hash, UserCircle } from 'lucide-react';

const ChatWindow = () => {
    const { messages, currentUser } = useChat();
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <main className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Message Area - Task #3 Integration */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-10 py-8 space-y-6"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Hash size={32} />
                        </div>
                        <p className="font-medium">Welcome to the beginning of this chat history!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.username === currentUser;
                        return (
                            <div
                                key={idx}
                                className={`flex items-end gap-3 transition-opacity duration-300 animate-in fade-in slide-in-from-bottom-2 ${isMe ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full border border-white flex items-center justify-center text-white shrink-0 shadow-sm ${isMe ? 'bg-indigo-500' : 'bg-blue-500'
                                    }`}>
                                    {msg.username[0]}
                                </div>
                                <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-center gap-2 px-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                            {isMe ? 'You' : msg.username}
                                        </span>
                                        <span className="text-[9px] text-gray-400">12:34 PM</span>
                                    </div>
                                    <div className={`p-4 text-sm font-medium shadow-sm leading-relaxed ${isMe
                                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Message Input area (Simplified for now) */}
            <div className="h-24 px-10 border-t bg-white flex items-center gap-4 shrink-0 shadow-sm">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl h-14 flex items-center px-4 gap-3 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                        placeholder="Type a secure message..."
                    />
                    <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ChatWindow;
