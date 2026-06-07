import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { postAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const { toggleLikeOptimistic, removePost } = usePostStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?._id === post.author._id;

  const handleLike = async () => {
    toggleLikeOptimistic(post._id, user._id);
    try {
      await postAPI.toggleLike(post._id);
    } catch {
      toggleLikeOptimistic(post._id, user._id); // revert
    }
  };

  const handleBookmark = async () => {
    try {
      await postAPI.bookmarkPost(post._id);
      toast.success(post.isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.deletePost(post._id);
      removePost(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    toast.success('Link copied!');
  };

  return (
    <article className="card p-5 hover:border-dark-border/80 transition-colors animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.username}`}>
            <Avatar user={post.author} size="md" showOnline />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.author.username}`}>
                <span className="font-semibold text-dark-text hover:text-primary-400 transition-colors text-sm">
                  {post.author.name}
                </span>
              </Link>
              {post.author.openToWork && (
                <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Open to Work</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-muted">
              <Link to={`/profile/${post.author.username}`} className="hover:text-primary-400">@{post.author.username}</Link>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {post.isEdited && <span className="text-dark-muted/60">· edited</span>}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-white/5 text-dark-muted hover:text-dark-text transition-colors">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-dark-card border border-dark-border rounded-xl shadow-xl z-10 py-1 w-40">
                <Link to={`/posts/${post._id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-dark-muted hover:text-dark-text hover:bg-white/5 transition-colors">
                  <Edit3 size={14} />Edit post
                </Link>
                <button onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/posts/${post._id}`}>
        <p className="text-dark-text text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
      </Link>

      {/* Code snippet */}
      {post.codeSnippet?.code && (
        <div className="code-block mb-3 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-dark-muted">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="ml-2 font-mono">{post.codeSnippet.language}</span>
          </div>
          <pre className="text-xs text-dark-text font-mono overflow-x-auto">{post.codeSnippet.code}</pre>
        </div>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, i) => (
            <img key={i} src={img.url} alt="" className="rounded-xl w-full object-cover max-h-64" />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-dark-border/50">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:scale-105 ${
            post.isLiked ? 'text-red-400 bg-red-500/10' : 'text-dark-muted hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
          <span>{post.likesCount}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-dark-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all">
          <MessageCircle size={16} />
          <span>{post.commentsCount}</span>
        </button>

        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-dark-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all">
          <Share2 size={16} />
        </button>

        <button onClick={handleBookmark}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
            post.isBookmarked ? 'text-primary-400' : 'text-dark-muted hover:text-primary-400 hover:bg-primary-500/10'
          }`}
        >
          <Bookmark size={16} fill={post.isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
