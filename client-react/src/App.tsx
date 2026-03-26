// @ts-nocheck
import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatWindow from './components/ChatWindow';
import LoginModal from './components/LoginModal';

const MainLayout = () => {
    const { currentUser } = useChat();

    if (!currentUser) return <LoginModal />;

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden antialiased">
            {/* Sidebar - Anuradha's Component #1 */}
            <Sidebar aria-label="Messaging Sidebar" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl relative z-10">
                <ChatHeader />
                <ChatWindow />
            </div>
        </div>
    );
};

function App() {
    return (
        <ChatProvider>
            <MainLayout />
        </ChatProvider>
    )
}

export default App;
