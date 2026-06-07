import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, UserPlus, MessageSquare, Star, Check } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP = {
  like: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
  follow: { icon: UserPlus, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  comment: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  connection_request: { icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  connection_accepted: { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' },
  endorsement: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

const TYPE_MESSAGES = {
  like: 'liked your post',
  follow: 'started following you',
  comment: 'commented on your post',
  connection_request: 'sent you a connection request',
  connection_accepted: 'accepted your connection request',
  endorsement: 'endorsed your skill',
};

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 rounded-xl flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-[#2a2d3d] rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#2a2d3d] rounded w-3/4" />
                <div className="h-3 bg-[#2a2d3d] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center relative">
            <Bell size={20} className="text-primary-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-[#8892a4]">{unreadCount} unread</p>}
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-24">
          <Bell size={48} className="mx-auto mb-4 text-[#2a2d3d]" />
          <p className="font-semibold text-[#e2e8f0] mb-1">All caught up!</p>
          <p className="text-sm text-[#8892a4]">New notifications will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => {
            const meta = ICON_MAP[notif.type] || ICON_MAP.like;
            const Icon = meta.icon;
            return (
              <div
                key={notif._id}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors hover:bg-white/5 ${
                  !notif.read ? 'bg-primary-500/5 border border-primary-500/10' : 'card'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar user={notif.sender} size="sm" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${meta.bg} flex items-center justify-center border-2 border-[#0f1117]`}>
                    <Icon size={10} className={meta.color} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link to={`/profile/${notif.sender?.username}`} className="font-semibold hover:text-primary-400 transition-colors">
                      {notif.sender?.name}
                    </Link>{' '}
                    <span className="text-[#c4cad6]">{TYPE_MESSAGES[notif.type] || 'interacted with you'}</span>
                    {notif.metadata?.skillName && (
                      <span className="ml-1 skill-tag text-xs">{notif.metadata.skillName}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#8892a4] mt-0.5">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
