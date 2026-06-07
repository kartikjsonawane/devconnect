import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, Users, MessageSquare } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

const items = [
  { to: '/feed', icon: Home },
  { to: '/explore', icon: Compass },
  { to: '/notifications', icon: Bell, badge: true },
  { to: '/connections', icon: Users },
  { to: '/chat', icon: MessageSquare },
];

export default function MobileNav() {
  const { unreadCount } = useNotificationStore();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50">
      <div className="flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `relative p-3 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-dark-muted'}`}
          >
            <Icon size={22} />
            {badge && unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full text-xs flex items-center justify-center text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
