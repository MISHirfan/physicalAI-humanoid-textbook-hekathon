import React from 'react';
import ChatWidget from '@site/src/components/ChatWidget';
import { AuthProvider } from './AuthContext';

// Default implementation, that you can customize
export default function Root({ children }) {
    return (
        <AuthProvider>
            {children}
            <ChatWidget />
        </AuthProvider>
    );
}
