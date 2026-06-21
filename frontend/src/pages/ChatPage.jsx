import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, Search } from 'lucide-react';
import { chatAPI } from '@/services/api';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Open conversation from navigation state (e.g. from Connections page)
  useEffect(() => {
    if (location.state?.userId && conversations.length) {
      const existing = conversations.find(c =>
        c.participants.some(p => p._id === location.state.userId)
      );
      if (existing) openConversation(existing);
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (socket) {
      socket.on('message:new', handleNewMessage);
      socket.on('chat:typing', ({ convId, userId }) => {
        if (convId === activeConv?._id && userId !== user?._id) setTyping(true);
      });
      socket.on('chat:stopTyping', ({ convId }) => {
        if (convId === activeConv?._id) setTyping(false);
      });
    }
    return () => {
      socket?.off('message:new', handleNewMessage);
      socket?.off('chat:typing');
      socket?.off('chat:stopTyping');
    };
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await chatAPI.getMessages(conv._id);
      setMessages(res.data.messages || []);
      socket?.emit('chat:join', conv._id);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleNewMessage = (msg) => {
    if (msg.conversation === activeConv?._id) {
      setMessages(p => [...p, msg]);
      setTyping(false);
    }
    // Update conversations last message preview
    setConversations(p => p.map(c =>
      c._id === msg.conversation ? { ...c, lastMessage: msg } : c
    ));
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    const content = text;
    setText('');
    try {
      await chatAPI.sendMessage(activeConv._id, content);
    } catch {
      setText(content);
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket && activeConv) {
      socket.emit('chat:typing', { convId: activeConv._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('chat:stopTyping', { convId: activeConv._id });
      }, 1500);
    }
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find(p => p._id !== user?._id);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="card rounded-xl overflow-hidden flex h-[calc(100vh-140px)] min-h-[500px]">
        {/* Sidebar */}
        <div className="w-72 border-r border-[#2a2d3d] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[#2a2d3d]">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary-400" /> Messages
            </h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]" />
              <input className="input w-full pl-8 py-2 text-sm" placeholder="Search chats…" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-[#2a2d3d] rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[#2a2d3d] rounded w-2/3" />
                      <div className="h-3 bg-[#2a2d3d] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-[#8892a4] text-sm">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                      isActive ? 'bg-primary-500/10 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <Avatar user={other} size="sm" showOnline />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{other?.name}</p>
                      {conv.lastMessage && (
                        <p className="text-xs text-[#8892a4] truncate">
                          {conv.lastMessage.sender === user?._id ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount?.[user?._id] > 0 && (
                      <span className="w-5 h-5 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center font-bold flex-shrink-0">
                        {conv.unreadCount[user._id]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="p-4 border-b border-[#2a2d3d] flex items-center gap-3">
              <Avatar user={getOtherParticipant(activeConv)} size="sm" showOnline />
              <div>
                <p className="font-semibold">{getOtherParticipant(activeConv)?.name}</p>
                <p className="text-xs text-[#8892a4]">@{getOtherParticipant(activeConv)?.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-sm'
                            : 'bg-[#13151e] text-[#e2e8f0] rounded-bl-sm border border-[#2a2d3d]'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs text-[#8892a4] mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex items-center gap-2 text-[#8892a4] text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#8892a4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#8892a4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#8892a4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2a2d3d]">
              <div className="flex gap-3">
                <input
                  className="input flex-1"
                  placeholder="Type a message…"
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  className="btn-primary w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-[#8892a4]">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-[#e2e8f0]">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
