import { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { usePostStore } from '../store/postStore';
import PostCard from '../components/post/PostCard';
import CreatePost from '../components/post/CreatePost';
import { PostSkeleton } from '../components/common/SkeletonLoader';

export default function FeedPage() {
  const { feedPosts, fetchFeed, hasMoreFeed, isLoadingFeed } = usePostStore();

  useEffect(() => { fetchFeed(true); }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="pt-4 pb-2">
        <h1 className="font-display text-xl font-bold text-dark-text mb-4">Feed</h1>
        <CreatePost />
      </div>

      {isLoadingFeed && feedPosts.length === 0 ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : feedPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="font-display font-semibold text-dark-text mb-2">Your feed is empty</h3>
          <p className="text-dark-muted text-sm">Follow developers to see their posts here</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={feedPosts.length}
          next={() => fetchFeed(false)}
          hasMore={hasMoreFeed}
          loader={<PostSkeleton />}
          className="space-y-4"
        >
          {feedPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </InfiniteScroll>
      )}
    </div>
  );
}
