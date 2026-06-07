import { create } from 'zustand';
import { postAPI } from '../services/api';

export const usePostStore = create((set, get) => ({
  feedPosts: [],
  explorePosts: [],
  isLoadingFeed: false,
  feedPage: 1,
  hasMoreFeed: true,

  fetchFeed: async (reset = false) => {
    const page = reset ? 1 : get().feedPage;
    if (!reset && !get().hasMoreFeed) return;

    set({ isLoadingFeed: true });
    try {
      const data = await postAPI.getFeed({ page, limit: 10 });
      const newPosts = data.data.posts;

      set((state) => ({
        feedPosts: reset ? newPosts : [...state.feedPosts, ...newPosts],
        feedPage: page + 1,
        hasMoreFeed: data.data.pagination.hasMore,
        isLoadingFeed: false,
      }));
    } catch {
      set({ isLoadingFeed: false });
    }
  },

  prependPost: (post) => set((state) => ({ feedPosts: [post, ...state.feedPosts] })),

  updatePost: (postId, updates) => set((state) => ({
    feedPosts: state.feedPosts.map((p) => p._id === postId ? { ...p, ...updates } : p),
  })),

  removePost: (postId) => set((state) => ({
    feedPosts: state.feedPosts.filter((p) => p._id !== postId),
  })),

  toggleLikeOptimistic: (postId, userId) => set((state) => ({
    feedPosts: state.feedPosts.map((p) => {
      if (p._id !== postId) return p;
      const isLiked = p.isLiked;
      return {
        ...p,
        isLiked: !isLiked,
        likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
      };
    }),
  })),
}));
