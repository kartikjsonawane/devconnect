import { create } from 'zustand';

// ─── Notification Store ────────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));

// ─── Online Users Store ────────────────────────────────────────────────────────
export const useOnlineStore = create((set) => ({
  onlineUsers: new Set(),
  setOnline: (userId) =>
    set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) })),
  setOffline: (userId) =>
    set((state) => {
      const s = new Set(state.onlineUsers);
      s.delete(userId);
      return { onlineUsers: s };
    }),
  isOnline: (userId) => {
    // Access current state from store directly
    return useOnlineStore.getState().onlineUsers.has(userId);
  },
}));

// ─── UI / Theme Store ──────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'system',
  sidebarOpen: false,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set({ theme });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  initTheme: () => {
    const theme = localStorage.getItem('theme') || 'system';
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    }
  },
}));

// ─── Chat Store ────────────────────────────────────────────────────────────────
export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) =>
    set((state) => ({ messages: { ...state.messages, [conversationId]: messages } })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping
          ? [...(state.typingUsers[conversationId] || []), userId]
          : (state.typingUsers[conversationId] || []).filter((id) => id !== userId),
      },
    })),
}));
