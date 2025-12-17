import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../theme/AuthContext';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            // TODO: Replace with env variable
            const response = await axios.post('http://localhost:8000/rag/ask', {
                query: userMsg,
                background: user?.background || "Software Engineer" // Default to Software Engineer if not set
            });

            setMessages(prev => [...prev, { sender: 'bot', text: response.data.answer }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            const errMsg = error.response?.data?.detail || error.message || "Unknown error";
            setMessages(prev => [...prev, { sender: 'bot', text: `Error connnecting to brain: ${errMsg}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: isMobile ? '10px' : '20px', 
            right: isMobile ? '10px' : '20px', 
            zIndex: 9999 
        }}>
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    style={{
                        width: isMobile ? '60px' : '70px', 
                        height: isMobile ? '60px' : '70px', 
                        borderRadius: isMobile ? '30px' : '35px',
                        background: 'linear-gradient(135deg, #0b0f19 0%, #1a1f2e 100%)',
                        border: '2px solid #00e5ff',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                        padding: isMobile ? '10px' : '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <img src="img/chat_icon.svg" alt="Chat" style={{ width: '100%', height: '100%' }} />
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: isMobile ? '100vw' : '350px', 
                    height: isMobile ? '100vh' : '500px', 
                    backgroundColor: 'white',
                    borderRadius: isMobile ? '0' : '10px', 
                    boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden',
                    border: isMobile ? 'none' : '1px solid #ddd',
                    position: isMobile ? 'fixed' : 'absolute',
                    bottom: isMobile ? '0' : 'auto',
                    right: isMobile ? '0' : 'auto',
                    top: isMobile ? '0' : 'auto',
                    left: isMobile ? '0' : 'auto'
                }}>
                    <div style={{ padding: '15px', background: '#25c2a0', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>AI Assistant</span>
                        <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? '#e1f5fe' : '#f1f1f1',
                                padding: '8px 12px', borderRadius: '12px', maxWidth: '80%',
                                color: 'black'
                            }}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        ))}
                        {isLoading && <div style={{ color: '#888', fontStyle: 'italic' }}>Thinking...</div>}
                    </div>

                    <div style={{ padding: '15px', borderTop: '1px solid #ddd', display: 'flex' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '8px' }}
                            placeholder="Ask anything..."
                        />
                        <button onClick={sendMessage} style={{ background: '#25c2a0', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
