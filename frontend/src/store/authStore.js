import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAccessToken: (token) => set({ accessToken: token }),

      login: async (credentials) => {
        const data = await authAPI.login(credentials);
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        });
        return data.data.user;
      },

      register: async (credentials) => {
        const data = await authAPI.register(credentials);
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        });
        return data.data.user;
      },

      logout: async () => {
        try { await authAPI.logout(); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const data = await authAPI.getMe();
          set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'devconnect-auth',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
