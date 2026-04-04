import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../utils/socket';

const ChatWindow = ({ currentUser, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    socket.emit('join', { userId: currentUser._id });
    socket.emit('join_chat', { userId: currentUser._id, otherUserId: otherUser._id });

    socket.on('chat_history', (history) => setMessages(history));
    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        // avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, [otherUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit('send_message', {
      fromId: currentUser._id,
      fromName: currentUser.name,
      toId: otherUser._id,
      text: text.trim()
    });
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 340, height: 480,
      background: 'white', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column', zIndex: 1000,
      border: '1px solid var(--purple-100)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple-600), var(--purple-800))',
        borderRadius: '16px 16px 0 0', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: 'white', fontSize: '1rem'
          }}>
            {otherUser.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{otherUser.name}</div>
            {otherUser.favoriteGenre && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>📚 {otherUser.favoriteGenre}</div>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
          borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
          fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 60 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👋</div>
            Say hello to {otherUser.name}!
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.from?.toString() === currentUser._id?.toString();
          return (
            <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '8px 12px',
                borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: isMe
                  ? 'linear-gradient(135deg, var(--purple-600), var(--purple-800))'
                  : 'var(--purple-50)',
                color: isMe ? 'white' : 'var(--dark)',
                fontSize: '0.875rem', lineHeight: 1.4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                {!isMe && (
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 3, color: 'var(--purple-600)' }}>
                    {msg.fromName}
                  </div>
                )}
                {msg.text}
                <div style={{ fontSize: '0.68rem', marginTop: 4, opacity: 0.65, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                  {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <span>{msg.read ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--purple-100)', display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: '0.875rem',
            border: '1.5px solid var(--purple-200)', outline: 'none',
            fontFamily: 'DM Sans, sans-serif'
          }}
        />
        <button onClick={sendMessage} disabled={!text.trim()} style={{
          background: 'linear-gradient(135deg, var(--purple-600), var(--purple-800))',
          border: 'none', borderRadius: 10, color: 'white', padding: '8px 14px',
          cursor: text.trim() ? 'pointer' : 'not-allowed',
          opacity: text.trim() ? 1 : 0.5, fontSize: '1rem'
        }}>➤</button>
      </div>
    </div>
  );
};

export default ChatWindow;