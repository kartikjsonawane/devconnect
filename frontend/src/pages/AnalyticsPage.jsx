import { useState, useEffect } from 'react';
import { BarChart2, Eye, Users, Heart, TrendingUp, Star } from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color = 'text-primary-400', bg = 'bg-primary-500/10' }) {
  return (
    <div className="card p-5 rounded-xl">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <p className="text-2xl font-display font-bold">{value ?? '—'}</p>
      <p className="text-sm text-[#8892a4] mt-0.5">{label}</p>
    </div>
  );
}

function BarRow({ label, value, max, color = 'bg-primary-500' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-[#8892a4] w-28 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-[#13151e] rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm font-mono w-8 text-right">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await userAPI.getAnalytics();
        setAnalytics(res.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 rounded-xl animate-pulse">
              <div className="w-10 h-10 bg-[#2a2d3d] rounded-xl mb-3" />
              <div className="h-7 bg-[#2a2d3d] rounded w-16 mb-2" />
              <div className="h-4 bg-[#2a2d3d] rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const skills = user?.skills || [];
  const maxEndorsements = skills.reduce((m, s) => Math.max(m, analytics?.endorsements?.[s.name] || 0), 1);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <BarChart2 size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Analytics</h1>
          <p className="text-sm text-[#8892a4]">Your profile and content performance</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Eye} label="Profile Views" value={analytics?.profileViews?.toLocaleString() ?? 0} />
        <StatCard icon={Users} label="Followers" value={user?.followersCount ?? 0} color="text-violet-400" bg="bg-violet-500/10" />
        <StatCard icon={Heart} label="Total Likes" value={analytics?.totalLikes ?? 0} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={TrendingUp} label="Posts Published" value={analytics?.postsCount ?? 0} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      {/* Profile views over time */}
      {analytics?.viewsOverTime?.length > 0 && (
        <div className="card p-5 rounded-xl">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Eye size={16} className="text-primary-400" /> Profile Views (Last 30 Days)
          </h2>
          <div className="flex items-end gap-1 h-24">
            {analytics.viewsOverTime.map((v, i) => {
              const max = Math.max(...analytics.viewsOverTime.map(x => x.count), 1);
              const h = Math.max(4, Math.round((v.count / max) * 96));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-primary-500/40 hover:bg-primary-500 rounded-t transition-colors"
                    style={{ height: `${h}px` }}
                  />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#13151e] border border-[#2a2d3d] text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {v.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#8892a4]">30 days ago</span>
            <span className="text-xs text-[#8892a4]">Today</span>
          </div>
        </div>
      )}

      {/* Skill endorsements */}
      {skills.length > 0 && (
        <div className="card p-5 rounded-xl">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Skill Endorsements
          </h2>
          <div className="space-y-3">
            {skills.map((s) => (
              <BarRow
                key={s.name}
                label={s.name}
                value={analytics?.endorsements?.[s.name] || 0}
                max={maxEndorsements}
                color="bg-yellow-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Top posts */}
      {analytics?.topPosts?.length > 0 && (
        <div className="card p-5 rounded-xl">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Heart size={16} className="text-red-400" /> Top Posts by Engagement
          </h2>
          <div className="space-y-3">
            {analytics.topPosts.map((post, i) => {
              const maxLikes = analytics.topPosts[0]?.likesCount || 1;
              return (
                <BarRow
                  key={post._id}
                  label={`${i + 1}. ${post.content?.slice(0, 30)}…`}
                  value={post.likesCount || 0}
                  max={maxLikes}
                  color="bg-red-500"
                />
              );
            })}
          </div>
        </div>
      )}

      {(!analytics?.profileViews && !analytics?.totalLikes) && (
        <div className="text-center py-10 text-[#8892a4]">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium text-[#e2e8f0]">No data yet</p>
          <p className="text-sm mt-1">Start posting and engaging to see your analytics</p>
        </div>
      )}
    </div>
  );
}
