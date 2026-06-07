import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Bell, Users, Bookmark, MessageSquare, Settings, LogOut, Code2, BarChart2, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useEffect } from 'react';

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/connections', icon: Users, label: 'Connections' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
          <Code2 className="text-white" size={20} />
        </div>
        <span className="font-display text-xl font-bold gradient-text">DevConnect</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-primary-500/10 text-primary-400' : 'text-dark-muted hover:text-dark-text hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            {label}
            {badge && unreadCount > 0 && (
              <span className="ml-auto bg-primary-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-dark-border">
        <NavLink to={`/profile/${user?.username}`}
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="relative shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-9 h-9 avatar" />
              : <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center"><span className="text-primary-400 font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span></div>
            }
            <span className="online-dot" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-text truncate">{user?.name}</p>
            <p className="text-xs text-dark-muted truncate">@{user?.username}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut size={18} />Sign Out
        </button>
      </div>
    </div>
  );
}
