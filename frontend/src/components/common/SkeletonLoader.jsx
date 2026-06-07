export function PostSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-dark-border rounded-full" />
        <div className="flex-1">
          <div className="h-3.5 bg-dark-border rounded w-32 mb-2" />
          <div className="h-3 bg-dark-border rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-dark-border rounded w-full" />
        <div className="h-3.5 bg-dark-border rounded w-5/6" />
        <div className="h-3.5 bg-dark-border rounded w-3/4" />
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-8 bg-dark-border rounded-xl w-20" />
        <div className="h-8 bg-dark-border rounded-xl w-20" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-dark-border rounded-full" />
        <div className="flex-1">
          <div className="h-3.5 bg-dark-border rounded w-28 mb-2" />
          <div className="h-3 bg-dark-border rounded w-20" />
        </div>
        <div className="h-8 bg-dark-border rounded-xl w-20" />
      </div>
    </div>
  );
}
