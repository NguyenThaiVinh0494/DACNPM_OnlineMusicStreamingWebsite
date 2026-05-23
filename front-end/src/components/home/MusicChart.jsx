import { useMemo } from 'react';
import { FaRandom } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMusic } from '../../context/MusicContext';
import { optimizeCloudinaryImage } from '../../utils/media';

function SongCard({ song, index, onSongPlay }) {
  return (
    <Link
      to={`/song/${song.id}`}
      onClick={(e) => {
        if (song.audioUrl) {
          e.preventDefault();
          onSongPlay(song);
        }
      }}
      className="group flex items-center gap-4 p-4 rounded-3xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300"
    >
      <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-gray-200 dark:bg-white/10">
        <img
          src={optimizeCloudinaryImage(song.image, { width: 240, height: 240 })}
          alt={song.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
      </div>
    </Link>
  );
}

export default function BangXepHang() {
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

  if (!topSongs.length) return null;

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 mt-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">Top 10 Bài Hát Nghe Nhiều Nhất</h3>
        <button
          type="button"
          onClick={handleShufflePlay}
          className="flex items-center gap-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <FaRandom className="w-3.5 h-3.5" />
          {t('shuffle', 'Nghe ngẫu nhiên')}
        </button>
      </div>

      <div className="space-y-4">
        {topSongs.map((song, index) => (
          <SongCard key={song.id} song={song} index={index} onSongPlay={handlePlaySong} />
        ))}
      </div>
    </div>
  );
}
