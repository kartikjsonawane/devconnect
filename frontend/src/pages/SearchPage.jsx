import { useState, useCallback } from 'react';
import { Search, Users, FileText } from 'lucide-react';
import { searchAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import Avatar from '@/components/common/Avatar';
import PostCard from '@/components/post/PostCard';
import { UserCardSkeleton, PostSkeleton } from '@/components/common/SkeletonLoader';
import debounce from 'lodash/debounce';

const TABS = [
  { id: 'users', label: 'People', icon: Users },
  { id: 'posts', label: 'Posts', icon: FileText },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    debounce(async (q, t) => {
      if (!q.trim()) { setUsers([]); setPosts([]); setSearched(false); return; }
      setLoading(true);
      setSearched(true);
      try {
        const res = await searchAPI.search({ q, type: t });
        if (t === 'users') {
          setUsers(res.data.users || []);
        } else {
          setPosts(res.data.posts || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    doSearch(val, tab);
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (query.trim()) doSearch(query, t);
  };

  const isEmpty = searched && !loading && (tab === 'users' ? users.length === 0 : posts.length === 0);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892a4]" />
        <input
          className="input w-full pl-11 py-3 text-base"
          placeholder="Search developers or posts…"
          value={query}
          onChange={handleInput}
          autoFocus
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#13151e] rounded-xl mb-6 border border-[#2a2d3d]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary-500 text-white' : 'text-[#8892a4] hover:text-[#e2e8f0]'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!query && (
        <div className="text-center py-20 text-[#8892a4]">
          <Search size={40} className="mx-auto mb-3 opacity-20" />
          <p>Start typing to search</p>
        </div>
      )}

      {loading && (
        tab === 'users'
          ? <div className="space-y-3">{[...Array(4)].map((_, i) => <UserCardSkeleton key={i} />)}</div>
          : <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      )}

      {isEmpty && (
        <div className="text-center py-20 text-[#8892a4]">
          <p className="font-medium text-[#e2e8f0]">No results for "{query}"</p>
          <p className="text-sm mt-1">Try different keywords or check spelling</p>
        </div>
      )}

      {!loading && tab === 'users' && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u.username}`}
              className="card p-4 rounded-xl flex items-center gap-4 hover:border-primary-500/30 transition-colors block"
            >
              <Avatar user={u} size="md" showOnline />
              <div className="flex-1 min-w-0">
                <p className="font-semibold hover:text-primary-400 transition-colors">{u.name}</p>
                <p className="text-sm text-[#8892a4]">@{u.username}</p>
                {u.headline && <p className="text-sm text-[#c4cad6] mt-0.5 truncate">{u.headline}</p>}
                {u.skills?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {u.skills.slice(0, 4).map((s) => (
                      <span key={s.name} className="skill-tag text-xs">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-[#8892a4] flex-shrink-0">
                {u.followersCount || 0} followers
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab === 'posts' && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p._id} post={p} />)}
        </div>
      )}
    </div>
  );
}
