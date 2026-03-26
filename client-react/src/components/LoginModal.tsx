// @ts-nocheck
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { ShieldCheck } from 'lucide-react';

const LoginModal = () => {
    const [name, setName] = useState('');
    const { login } = useChat();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            login(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="text-blue-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to SecureChat</h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">Please enter your name to connect instantly with your team.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input 
                            type="text" 
                            id="username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Anuradha"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!name.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Chat
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
