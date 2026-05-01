import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);

    return (
        <ChatContext.Provider value={{ activeChat, setActiveChat, messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
};
