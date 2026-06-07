import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { postAPI, commentAPI } from '@/services/api';
import { useSocketStore } from '@/store/socketStore';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { PostSkeleton } from '@/components/common/SkeletonLoader';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function CommentItem({ comment, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuthStore();

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar user={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-[#13151e] rounded-2xl rounded-tl-sm px-4 py-3 border border-[#2a2d3d]">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${comment.author?.username}`} className="font-semibold text-sm hover:text-primary-400 transition-colors">
                {comment.author?.name}
              </Link>
              <span className="text-xs text-[#8892a4]">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-[#c4cad6]">{comment.content}</p>
          </div>
          <div className="flex gap-4 mt-1 ml-2">
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-[#8892a4] hover:text-primary-400 transition-colors"
            >
              Reply
            </button>
          </div>
          {showReply && (
            <div className="flex gap-2 mt-2">
              <Avatar user={user} size="xs" />
              <div className="flex-1 flex gap-2">
                <input
                  className="input flex-1 text-sm py-1.5"
                  placeholder={`Reply to ${comment.author?.name}…`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="btn-primary w-8 h-8 p-0 flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-12 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex gap-3">
              <Avatar user={reply.author} size="xs" />
              <div className="flex-1">
                <div className="bg-[#13151e] rounded-2xl rounded-tl-sm px-3 py-2.5 border border-[#2a2d3d]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/profile/${reply.author?.username}`} className="font-semibold text-sm hover:text-primary-400 transition-colors">
                      {reply.author?.name}
                    </Link>
                    <span className="text-xs text-[#8892a4]">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-[#c4cad6]">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { joinPost, leavePost } = useSocketStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
    joinPost(id);
    return () => leavePost(id);
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getPost(id),
        commentAPI.getComments(id),
      ]);
      setPost(postRes.data.data.post);
      setComments(commentsRes.data.data.comments || []);
    } catch {
      toast.error('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const content = commentText;
    setCommentText('');
    try {
      const res = await commentAPI.createComment(id, { content });
      setComments(p => [res.data.data.comment, ...p]);
    } catch {
      setCommentText(content);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const res = await commentAPI.createComment(id, { content, parentComment: parentId });
      const newReply = res.data.data.comment;
      setComments(p => p.map(c =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      ));
    } catch {
      toast.error('Failed to post reply');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PostSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 text-center py-24">
        <p className="text-[#8892a4]">Post not found</p>
        <Link to="/feed" className="btn-primary mt-4 inline-block">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <Link to="/feed" className="flex items-center gap-2 text-[#8892a4] hover:text-[#e2e8f0] transition-colors mb-4 text-sm">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <PostCard post={post} />

      {/* Comment input */}
      <div className="card p-4 rounded-xl mt-4">
        <div className="flex gap-3">
          <Avatar user={user} size="sm" />
          <div className="flex-1 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
              className="btn-primary w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-[#8892a4]" />
          <span className="text-sm font-medium text-[#8892a4]">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-10 text-[#8892a4]">
            <p className="text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} onReply={handleReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
