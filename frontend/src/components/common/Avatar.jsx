export default function Avatar({ user, size = 'md', showOnline = false, className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user.name} className={`${sizeClass} avatar`} />
        : <div className={`${sizeClass} bg-primary-500/20 rounded-full flex items-center justify-center`}>
            <span className="text-primary-400 font-semibold">{user?.name?.[0]?.toUpperCase() || '?'}</span>
          </div>
      }
      {showOnline && user?.isOnline && (
        <span className={`${dotSizes[size]} absolute bottom-0 right-0 bg-green-400 rounded-full border-2 border-dark-bg`} />
      )}
    </div>
  );
}
