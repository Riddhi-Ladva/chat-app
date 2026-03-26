// @ts-nocheck
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginModal = () => {
    const [inputName, setInputName] = useState('');
    const { setCurrentUser } = useChat();

    const handleJoin = (e) => {
        e.preventDefault();
        if (inputName.trim()) {
            setCurrentUser(inputName.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md p-10 bg-white rounded-[32px] shadow-2xl border border-gray-100 mx-4"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                        <ShieldCheck size={44} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Join SecureChat</h1>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
                        Enter your name to start messaging with your team in a private, secure workspace.
                    </p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                        <div className="relative group">
                            <input
                                autoFocus
                                type="text"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                placeholder="e.g. Anuradha Patil"
                                className="w-full h-16 bg-gray-50 border-2 border-transparent rounded-2xl px-6 text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!inputName.trim()}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                    >
                        Join Secure Chat <ArrowRight size={20} />
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400">
                    By joining, you agree to our standard community protocols.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginModal;
