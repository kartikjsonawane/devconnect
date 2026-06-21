import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, Check, X, UserPlus, Search } from 'lucide-react';
import { connectionAPI, userAPI } from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { UserCardSkeleton } from '@/components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'connections', label: 'Connections', icon: UserCheck },
  { id: 'find', label: 'Find People', icon: Search },
];

export default function ConnectionsPage() {
  const { user: currentUser } = useAuthStore();
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Find people
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentMap, setSentMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendRes, connRes] = await Promise.all([
        connectionAPI.getPendingRequests(),
        connectionAPI.getConnections(),
      ]);
      setPending(pendRes.data.requests || []);
      setConnections(connRes.data.connections || []);
      // Pre-mark connected users
      const map = {};
      (connRes.data.connections || []).forEach(u => { map[u._id] = 'accepted'; });
      setSentMap(map);
    } catch {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, status) => {
    try {
      await connectionAPI.respondToRequest(id, status);
      setPending(p => p.filter(r => r._id !== id));
      if (status === 'accepted') {
        toast.success('Connection accepted!');
        fetchData();
      } else {
        toast.success('Request declined');
      }
    } catch {
      toast.error('Action failed');
    }
  };

  const doSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await userAPI.searchUsers({ q, limit: 20 });
      setSearchResults((res.data.users || []).filter(u => u._id !== currentUser?._id));
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connectionAPI.sendRequest({ receiverId: userId });
      setSentMap(p => ({ ...p, [userId]: 'pending' }));
      toast.success('Connection request sent!');
    } catch (err) {
      if (err?.statusCode === 409 || err?.message?.toLowerCase().includes('pending') || err?.message?.toLowerCase().includes('connected')) {
        setSentMap(p => ({ ...p, [userId]: 'pending' }));
        toast('Request already sent', { icon: '✓' });
      } else {
        toast.error(err?.message || 'Could not send request');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Connections</h1>
          <p className="text-sm text-[#8892a4]">Manage your professional network</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#13151e] rounded-xl mb-6 border border-[#2a2d3d]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary-500 text-white' : 'text-[#8892a4] hover:text-[#e2e8f0]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {t.id === 'pending' && pending.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Find People tab */}
      {tab === 'find' && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]" />
            <input
              className="input w-full pl-9"
              placeholder="Search by name, username, or skill…"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); doSearch(e.target.value); }}
              autoFocus
            />
          </div>
          {searching && <div className="space-y-3">{[...Array(3)].map((_, i) => <UserCardSkeleton key={i} />)}</div>}
          {!searching && searchResults.length === 0 && searchQ && (
            <p className="text-center text-[#8892a4] py-10">No users found for "{searchQ}"</p>
          )}
          {!searching && !searchQ && (
            <p className="text-center text-[#8892a4] py-10">Type a name or skill to find people</p>
          )}
          <div className="space-y-3">
            {searchResults.map(u => (
              <div key={u._id} className="card p-4 rounded-xl flex items-center gap-4">
                <Link to={`/profile/${u.username}`}><Avatar user={u} size="md" /></Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.username}`} className="font-semibold hover:text-primary-400">{u.name}</Link>
                  <p className="text-sm text-[#8892a4]">@{u.username}</p>
                  {u.headline && <p className="text-sm text-[#c4cad6] truncate">{u.headline}</p>}
                </div>
                <button
                  onClick={() => handleConnect(u._id)}
                  disabled={!!sentMap[u._id]}
                  className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60 flex-shrink-0"
                >
                  {sentMap[u._id] === 'accepted' ? <><UserCheck size={14} />Connected</> :
                   sentMap[u._id] === 'pending'   ? <><UserCheck size={14} />Requested</> :
                                                   <><UserPlus size={14} />Connect</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending / Connections tabs */}
      {tab !== 'find' && (
        loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <UserCardSkeleton key={i} />)}</div>
        ) : tab === 'pending' && pending.length === 0 ? (
          <div className="text-center py-24">
            <Clock size={48} className="mx-auto mb-4 text-[#2a2d3d]" />
            <p className="font-semibold text-[#e2e8f0] mb-1">No pending requests</p>
            <p className="text-sm text-[#8892a4]">When someone sends you a request, it'll appear here</p>
          </div>
        ) : tab === 'connections' && connections.length === 0 ? (
          <div className="text-center py-24">
            <Users size={48} className="mx-auto mb-4 text-[#2a2d3d]" />
            <p className="font-semibold text-[#e2e8f0] mb-1">No connections yet</p>
            <button onClick={() => setTab('find')} className="btn-primary mt-3 text-sm">Find People</button>
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === 'pending' ? pending : connections).map((item) => {
              const person = tab === 'pending' ? item.sender : item;
              return (
                <div key={item._id} className="card p-4 rounded-xl flex items-center gap-4 hover:border-primary-500/30 transition-colors">
                  <Link to={`/profile/${person?.username}`}><Avatar user={person} size="md" showOnline /></Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${person?.username}`} className="font-semibold hover:text-primary-400 transition-colors">{person?.name}</Link>
                    <p className="text-sm text-[#8892a4]">@{person?.username}</p>
                    {person?.headline && <p className="text-sm text-[#c4cad6] truncate mt-0.5">{person.headline}</p>}
                  </div>
                  {tab === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => respond(item._id, 'accepted')}
                        className="w-9 h-9 bg-green-500/10 hover:bg-green-500/20 rounded-xl flex items-center justify-center transition-colors" title="Accept">
                        <Check size={16} className="text-green-400" />
                      </button>
                      <button onClick={() => respond(item._id, 'rejected')}
                        className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-colors" title="Decline">
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                  )}
                  {tab === 'connections' && (
                    <Link to="/chat" state={{ userId: person?._id }}
                      className="btn-ghost text-sm px-3 py-1.5 flex-shrink-0">
                      Message
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
