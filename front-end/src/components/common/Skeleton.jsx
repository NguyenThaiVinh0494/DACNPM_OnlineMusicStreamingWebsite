export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded-lg ${className}`} />
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse ${i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}
