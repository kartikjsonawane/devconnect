import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, Check, X } from 'lucide-react';
import { connectionAPI } from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { UserCardSkeleton } from '@/components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'connections', label: 'Connections', icon: UserCheck },
];

export default function ConnectionsPage() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setPending(pendRes.data.data.requests || []);
      setConnections(connRes.data.data.connections || []);
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
        fetchData(); // reload connections list
      } else {
        toast.success('Request declined');
      }
    } catch {
      toast.error('Action failed');
    }
  };

  const currentList = tab === 'pending' ? pending : connections;

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
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary-500 text-white' : 'text-[#8892a4] hover:text-[#e2e8f0]'
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {t.id === 'pending' && pending.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <UserCardSkeleton key={i} />)}</div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-24">
          <Users size={48} className="mx-auto mb-4 text-[#2a2d3d]" />
          <p className="font-semibold text-[#e2e8f0] mb-1">
            {tab === 'pending' ? 'No pending requests' : 'No connections yet'}
          </p>
          <p className="text-sm text-[#8892a4]">
            {tab === 'pending'
              ? 'When engineers send you connection requests, they\'ll appear here'
              : 'Start connecting with developers on the Explore page'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((item) => {
            const person = tab === 'pending' ? item.sender : item;
            return (
              <div key={item._id} className="card p-4 rounded-xl flex items-center gap-4 hover:border-primary-500/30 transition-colors">
                <Link to={`/profile/${person?.username}`}>
                  <Avatar user={person} size="md" showOnline />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${person?.username}`} className="font-semibold hover:text-primary-400 transition-colors">
                    {person?.name}
                  </Link>
                  <p className="text-sm text-[#8892a4]">@{person?.username}</p>
                  {person?.headline && <p className="text-sm text-[#c4cad6] truncate mt-0.5">{person.headline}</p>}
                  {person?.skills?.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {person.skills.slice(0, 3).map((s) => (
                        <span key={s.name} className="skill-tag text-xs">{s.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                {tab === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => respond(item._id, 'accepted')}
                      className="w-9 h-9 bg-green-500/10 hover:bg-green-500/20 rounded-xl flex items-center justify-center transition-colors"
                      title="Accept"
                    >
                      <Check size={16} className="text-green-400" />
                    </button>
                    <button
                      onClick={() => respond(item._id, 'rejected')}
                      className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-colors"
                      title="Decline"
                    >
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                )}
                {tab === 'connections' && (
                  <Link
                    to={`/chat`}
                    state={{ userId: person?._id }}
                    className="btn-ghost text-sm px-3 py-1.5 flex-shrink-0"
                  >
                    Message
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
