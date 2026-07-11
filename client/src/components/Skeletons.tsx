export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
      <div className="divide-y divide-ink/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-ink/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-ink/5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      ))}
    </div>
  )
}
