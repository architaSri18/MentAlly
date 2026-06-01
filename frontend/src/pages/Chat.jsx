import React, { useState, useEffect, useRef } from 'react'
import { chatService } from '../services/apiService'
import { Send, Bot, User, Sparkles } from 'lucide-react'

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        loadHistory()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadHistory = async () => {
        const data = await chatService.getHistory()
        if (Array.isArray(data)) {
            const formatted = []
            data.forEach(chat => {
                formatted.push({ text: chat.message, sender: 'user', timestamp: chat.timestamp })
                formatted.push({ text: chat.response, sender: 'bot', timestamp: chat.timestamp, emotion: chat.emotion })
            })
            setMessages(formatted)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { text: userMsg, sender: 'user', timestamp: new Date() }])

        setLoading(true)
        try {
            const data = await chatService.sendMessage(userMsg)
            setMessages(prev => [...prev, {
                text: data.response,
                sender: 'bot',
                timestamp: data.timestamp,
                emotion: data.emotion
            }])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="chat-page">
            <div className="card chat-container">
                <div className="chat-header">
                    <h2>Your companion</h2>
                    <p>A safe space to share what’s on your mind — anytime.</p>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && !loading && (
                        <div className="chat-empty">
                            <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <strong>You don’t have to figure this out alone</strong>
                            <p>Share a thought, a worry, or how your day went. I’m listening.</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-row ${msg.sender}`}>
                            {msg.sender === 'bot' && (
                                <div className="chat-avatar bot"><Bot size={18} /></div>
                            )}
                            <div className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                                {msg.emotion && (
                                    <div className="emotion-tag">Sensing: {msg.emotion}</div>
                                )}
                            </div>
                            {msg.sender === 'user' && (
                                <div className="chat-avatar user"><User size={18} /></div>
                            )}
                        </div>
                    ))}
                    {loading && <p className="chat-typing">Taking a moment to respond thoughtfully…</p>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-bar">
                    <input
                        className="input"
                        placeholder="What’s on your mind today?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button className="btn btn-primary btn-icon" type="submit" disabled={loading} aria-label="Send message">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Chat
