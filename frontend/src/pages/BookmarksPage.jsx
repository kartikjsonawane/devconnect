import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { postAPI } from '@/services/api';
import PostCard from '@/components/post/PostCard';
import { PostSkeleton } from '@/components/common/SkeletonLoader';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await postAPI.getBookmarks();
        setPosts(res.data.data.posts || []);
      } catch {
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <Bookmark size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Bookmarks</h1>
          <p className="text-sm text-[#8892a4]">Posts you've saved for later</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <Bookmark size={48} className="mx-auto mb-4 text-[#2a2d3d]" />
          <p className="font-semibold text-[#e2e8f0] mb-1">No bookmarks yet</p>
          <p className="text-sm text-[#8892a4]">Tap the bookmark icon on any post to save it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  );
}
