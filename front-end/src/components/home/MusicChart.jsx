import { useMemo } from 'react';
import { FaRandom } from 'react-icons/fa';
import { MdPlayArrow } from 'react-icons/md';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMusic } from '../../context/MusicContext';
import { optimizeCloudinaryImage } from '../../utils/media';

// Medal icons cho top 3
const getMedalIcon = (index) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return null;
};

// Format số lượt nghe
const formatPlays = (plays) => {
  if (!plays) return '0';
  if (plays >= 1000000) return (plays / 1000000).toFixed(1) + 'M';
  if (plays >= 1000) return (plays / 1000).toFixed(1) + 'K';
  return plays.toString();
};

function SongCard({ song, index, onSongPlay }) {
  const medal = getMedalIcon(index);
  const isTopThree = index < 3;

  return (
    <Link
      to={`/song/${song.id}`}
      onClick={(e) => {
        if (song.audioUrl) {
          e.preventDefault();
          onSongPlay(song);
        }
      }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 overflow-hidden ${
        isTopThree
          ? 'bg-gradient-to-r from-nct-primary/20 via-nct-primary/10 to-transparent dark:from-nct-primary/30 dark:via-nct-primary/15 dark:to-transparent border border-nct-primary/30 dark:border-nct-primary/40'
          : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
      }`}
    >
      {/* Background glow effect for top 3 */}
      {isTopThree && (
        <div className="absolute inset-0 bg-gradient-to-r from-nct-primary/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Rank Badge */}
      <div className="relative flex-shrink-0">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg transition-transform duration-300 group-hover:scale-110 ${
          isTopThree
            ? 'bg-gradient-to-br from-nct-primary/40 to-nct-primary/20 dark:from-nct-primary/50 dark:to-nct-primary/30 text-nct-primary dark:text-white'
            : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-400'
        }`}>
          {medal || `#${index + 1}`}
        </div>
      </div>

      {/* Album Art */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 flex-shrink-0 shadow-lg">
        <img
          src={optimizeCloudinaryImage(song.image, { width: 240, height: 240 })}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSongPlay(song);
            }}
            className="w-10 h-10 bg-nct-primary/90 hover:bg-nct-primary rounded-full flex items-center justify-center text-black transition-all duration-200 transform hover:scale-110"
          >
            <MdPlayArrow className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div className="min-w-0 flex-1 z-10">
        <p className="text-base font-semibold text-gray-900 dark:text-white truncate leading-tight">{song.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{song.artist}</p>
        {song.plays && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
            <span>♫</span>
            <span className="font-medium">{formatPlays(song.plays)}</span>
            <span className="text-gray-400">lượt nghe</span>
          </p>
        )}
      </div>

      {/* Ranking indicator bar */}
      {isTopThree && (
        <div className="hidden sm:flex ml-auto flex-shrink-0 items-center gap-2">
          <div className={`text-sm font-bold ${
            index === 0 ? 'text-yellow-500' :
            index === 1 ? 'text-gray-400' :
            'text-amber-700'
          }`}>
            {['🔥 HOT', '⚡ TRENDING', '✨ TOP'][index]}
          </div>
        </div>
      )}
    </Link>
  );
}

export default function BangXepHang({ isLoading = false }) {
  const { t } = useTranslation();
  const { playSong, allSongs } = useMusic();

  const topSongs = useMemo(() => {
    if (!Array.isArray(allSongs) || allSongs.length === 0) return [];
    return [...allSongs]
      .filter((song) => song.audioUrl)
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 10);
  }, [allSongs]);

  const handleShufflePlay = () => {
    const shuffled = [...topSongs].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    if (first) playSong(first, shuffled);
  };

  const handlePlaySong = (song) => {
    playSong(song, topSongs);
  };

  // Nếu không loading và không có songs thì không render
  if (!isLoading && !topSongs.length) return null;

  return (
    <div className="mb-10 px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-8">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎵</div>
          <div>
            <h3 className="text-3xl font-bold text-black dark:text-white">Top 10</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bài hát nghe nhiều nhất</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShufflePlay}
          disabled={isLoading || !topSongs.length}
          className="flex items-center gap-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('shuffle', 'Nghe ngẫu nhiên')}
          <FaRandom size={12} className="text-green-600 dark:text-teal-400" />
        </button>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          // Skeleton loading
          Array(10).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-white/10 flex-shrink-0" />
              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : topSongs.length > 0 ? (
          topSongs.map((song, index) => (
            <div key={song.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
              <SongCard song={song} index={index} onSongPlay={handlePlaySong} />
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
