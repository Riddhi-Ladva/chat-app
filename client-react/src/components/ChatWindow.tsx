// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Send, User } from 'lucide-react';

const ChatWindow = () => {
    const { messages, currentUser, activeRoom, sendMessage } = useChat();
    const [msgText, setMsgText] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (msgText.trim()) {
            sendMessage(msgText);
            setMsgText('');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                            <span className="text-4xl font-bold">#</span>
                        </div>
                        <p className="text-sm font-medium">Welcome to the beginning of this chat history!</p>
                    </div>
                ) : messages.map((msg, idx) => {
                    const isSelf = msg.username === currentUser;
                    return (
                        <div
                            key={idx}
                            className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${isSelf
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                {!isSelf && <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400">{msg.username}</div>}
                                <div className="leading-relaxed">{msg.message}</div>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-medium px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                className="p-6 bg-white border-t border-gray-100 flex items-center gap-4 relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]"
            >
                <input
                    type="text"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Type a secure message..."
                    className="flex-1 h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-6 outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
                />
                <button
                    type="submit"
                    disabled={!msgText.trim()}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                >
                    <Send size={20} className="transform rotate-12" />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
