import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, UserPlus } from 'lucide-react';
import { userAPI, followAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RightPanel() {
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    userAPI.getTrending().then((d) => setTrending(d.data.users)).catch(() => {});
    if (isAuthenticated) {
      userAPI.getRecommended().then((d) => setRecommended(d.data.users)).catch(() => {});
    }
  }, []);

  const handleFollow = async (userId) => {
    try {
      await followAPI.followUser(userId);
      setRecommended((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Following!');
    } catch {}
  };

  return (
    <div className="h-full overflow-y-auto py-6 px-4 space-y-6">
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary-400" />
          <h3 className="font-display font-semibold">Trending Developers</h3>
        </div>
        <div className="space-y-3">
          {trending.slice(0, 5).map((user) => (
            <Link key={user._id} to={`/profile/${user.username}`} className="flex items-center gap-3 group">
              <div className="relative shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-9 h-9 avatar" />
                  : <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center"><span className="text-primary-400 text-sm font-semibold">{user.name?.[0]}</span></div>
                }
                {user.isOnline && <span className="online-dot" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary-400 transition-colors truncate">{user.name}</p>
                <p className="text-xs text-dark-muted truncate">{user.headline || `@${user.username}`}</p>
              </div>
              <span className="text-xs text-dark-muted shrink-0">{user.followersCount}</span>
            </Link>
          ))}
        </div>
        <Link to="/search" className="text-primary-400 text-sm mt-4 block hover:underline">View all →</Link>
      </div>
      {isAuthenticated && recommended.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-primary-400" />
            <h3 className="font-display font-semibold">Who to Follow</h3>
          </div>
          <div className="space-y-3">
            {recommended.slice(0, 4).map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <Link to={`/profile/${user.username}`} className="shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-9 h-9 avatar" />
                    : <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center"><span className="text-primary-400 text-sm font-semibold">{user.name?.[0]}</span></div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${user.username}`}>
                    <p className="text-sm font-medium hover:text-primary-400 transition-colors truncate">{user.name}</p>
                  </Link>
                  <div className="flex gap-1">{user.skills?.slice(0, 2).map((s) => <span key={s} className="text-xs text-dark-muted">{s}</span>)}</div>
                </div>
                <button onClick={() => handleFollow(user._id)} className="shrink-0 text-xs btn-primary py-1 px-3">Follow</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-dark-muted px-2">© 2024 DevConnect</p>
    </div>
  );
}
