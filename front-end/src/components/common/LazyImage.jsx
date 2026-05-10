import { useState } from 'react';
import { FiImage } from 'react-icons/fi';

export default function LazyImage({ src, alt, className = "", fallbackIcon = <FiImage className="w-8 h-8 text-gray-400" /> }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-white/5 flex items-center justify-center ${className}`}>
      {/* Skeleton while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-white/10" />
      )}
      
      {/* Fallback on error */}
      {error ? (
        <div className="flex items-center justify-center w-full h-full">
          {fallbackIcon}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className.includes('absolute') ? '' : 'absolute inset-0'}`}
        />
      )}
    </div>
  );
}
