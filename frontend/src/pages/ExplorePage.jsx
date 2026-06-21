import { useState, useEffect } from 'react';
import { Compass, TrendingUp, Users, Hash, UserPlus, UserCheck } from 'lucide-react';
import { postAPI, userAPI, connectionAPI } from '@/services/api';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import { PostSkeleton, UserCardSkeleton } from '@/components/common/SkeletonLoader';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'developers', label: 'Developers', icon: Users },
];

const SKILL_TAGS = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'React', 'Node.js', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'PostgreSQL'];

export default function ExplorePage() {
  const [tab, setTab] = useState('trending');
  const [posts, setPosts] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const [connectedMap, setConnectedMap] = useState({});

  useEffect(() => {
    if (tab === 'trending') fetchTrending();
    else fetchDevelopers();
  }, [tab, selectedSkill]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const params = selectedSkill ? { tags: selectedSkill } : {};
      const res = await postAPI.getExplore({ ...params, limit: 20 });
      setPosts(res.data.posts || []);
    } catch {
      toast.error('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connectionAPI.sendRequest({ userId });
      setConnectedMap(p => ({ ...p, [userId]: true }));
      toast.success('Connection request sent!');
    } catch {
      toast.error('Could not send request');
    }
  };

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getTrending();
      setDevelopers(res.data.users || []);
    } catch {
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      if (followingMap[userId]) {
        await import('@/services/api').then(m => m.followAPI.unfollow(userId));
        setFollowingMap(p => ({ ...p, [userId]: false }));
      } else {
        await import('@/services/api').then(m => m.followAPI.follow(userId));
        setFollowingMap(p => ({ ...p, [userId]: true }));
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <Compass size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Explore</h1>
          <p className="text-sm text-[#8892a4]">Discover trending content & engineers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#13151e] rounded-xl mb-6 border border-[#2a2d3d]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-primary-500 text-white'
                : 'text-[#8892a4] hover:text-[#e2e8f0]'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Skill filter (trending only) */}
      {tab === 'trending' && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              !selectedSkill
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-[#2a2d3d] text-[#8892a4] hover:border-primary-500/50'
            }`}
          >
            All
          </button>
          {SKILL_TAGS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedSkill === skill
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-[#2a2d3d] text-[#8892a4] hover:border-primary-500/50'
              }`}
            >
              <Hash size={10} className="inline mr-0.5" />
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        tab === 'trending' ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
        ) : (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <UserCardSkeleton key={i} />)}</div>
        )
      ) : tab === 'trending' ? (
        posts.length === 0 ? (
          <div className="text-center py-20 text-[#8892a4]">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No trending posts yet</p>
            <p className="text-sm mt-1">Be the first to post something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )
      ) : (
        developers.length === 0 ? (
          <div className="text-center py-20 text-[#8892a4]">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No developers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {developers.map((dev) => (
              <div key={dev._id} className="card p-4 rounded-xl flex items-center gap-4 hover:border-primary-500/30 transition-colors">
                <Link to={`/profile/${dev.username}`}>
                  <Avatar user={dev} size="md" showOnline />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${dev.username}`} className="font-semibold hover:text-primary-400 transition-colors">
                    {dev.name}
                  </Link>
                  <p className="text-sm text-[#8892a4]">@{dev.username}</p>
                  {dev.bio && <p className="text-sm text-[#c4cad6] mt-1 line-clamp-1">{dev.bio}</p>}
                  {dev.skills?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {dev.skills.slice(0, 3).map((s) => (
                        <span key={s.name} className="skill-tag text-xs">{s.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => handleConnect(dev._id)}
                    disabled={connectedMap[dev._id]}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      connectedMap[dev._id] ? 'btn-secondary opacity-60' : 'btn-secondary'
                    }`}
                    title="Send connection request"
                  >
                    {connectedMap[dev._id] ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  </button>
                  <button
                    onClick={() => handleFollow(dev._id)}
                    className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                      followingMap[dev._id] ? 'btn-secondary' : 'btn-primary'
                    }`}
                  >
                    {followingMap[dev._id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
