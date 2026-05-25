import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiHeart, FiMoreHorizontal, FiPause } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import { formatSongDuration } from "../../utils/duration";

const GENRE_TABS = ["Tất cả", "V-Pop", "Rap Việt", "Indie", "Ballad"];

/* ─── GROUP HELPER ──────────────────────────────────────── */
function groupByDate(songs) {
  const order = ["Hôm nay", "Hôm qua", "Tuần này", "Tháng này"];
  const map = {};
  songs.forEach(s => {
    if (!map[s.dateLabel]) map[s.dateLabel] = [];
    map[s.dateLabel].push(s);
  });
  return order.filter(k => map[k]).map(k => ({ label: k, items: map[k] }));
}

/* ─── SONG ROW ──────────────────────────────────────────── */
function SongRow({ song, index, onPlay, isCurrent, isPlaying, isFav, onFav }) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/song/${song.id || 1}`)}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl group cursor-pointer transition-colors ${isCurrent ? "bg-nct-primary/10" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
    >
      {/* index / play */}
      <div className="w-6 text-center shrink-0">
        <span className={`text-sm font-medium text-gray-400 dark:text-[#b3b3b3] group-hover:hidden ${isCurrent ? "hidden" : ""}`}>{index + 1}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className={`hidden group-hover:inline ${isCurrent ? "!inline" : ""}`}
        >
          {isCurrent && isPlaying
            ? <FiPause className="w-4 h-4 text-nct-primary" />
            : <FiPlay className="w-4 h-4 text-gray-700 dark:text-white fill-current" />
          }
        </button>
      </div>

      {/* artwork */}
      <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
        >
          <FiPlay className="w-4 h-4 text-white fill-current ml-0.5" />
        </div>
      </div>

      {/* title / artist */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isCurrent ? "text-nct-primary" : "text-gray-900 dark:text-white"}`}>
          {song.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-[#b3b3b3] truncate">{song.artist}</p>
      </div>

      {/* genre */}
      <span className="hidden md:block text-xs text-gray-400 dark:text-[#b3b3b3] w-20 truncate">{song.genre}</span>

      {/* actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onFav(); }} 
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <FiHeart className={`w-3.5 h-3.5 ${isFav ? "text-nct-primary fill-current" : "text-gray-400 dark:text-[#b3b3b3]"}`} />
        </button>
        <button 
          onClick={(e) => e.stopPropagation()} 
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <FiMoreHorizontal className="w-3.5 h-3.5 text-gray-400 dark:text-[#b3b3b3]" />
        </button>
      </div>

      {/* duration */}
      <span className="w-10 text-right text-xs text-gray-400 dark:text-[#b3b3b3] shrink-0">
        {formatSongDuration(song.duration)}
      </span>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function NewReleases() {
  const [genreTab, setGenreTab] = useState("Tất cả");
  const { playSong, currentSong, isPlaying, favorites, toggleFavorite, allSongs } = useMusic();
  const releaseSource = allSongs.map((song) => ({
    ...song,
    genre: song.genreName || "Khác",
    dateLabel: "Hôm nay",
  }));

  const filtered = releaseSource.filter(s => {
    const okGenre = genreTab === "Tất cả" || s.genre === genreTab;
    return okGenre;
  });

  const groups = groupByDate(filtered);

  return (
    <div className="pb-24 space-y-8">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-56">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=1400&h=400&fit=crop"
          alt="Mới Phát Hành"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-[#0f1311]/60 to-[#0f1311]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1311] via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-7">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Cập nhật hàng ngày</p>
          <h1 className="text-4xl font-black text-white leading-tight mb-2">🔥 Mới Phát Hành</h1>
          <p className="text-white/70 text-sm">Single, Album và EP mới nhất từ các nghệ sĩ Việt Nam & quốc tế</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-start justify-end gap-4 flex-wrap">
        {/* Genre chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {GENRE_TABS.map(g => (
            <button
              key={g}
              onClick={() => setGenreTab(g)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                genreTab === g
                  ? "bg-nct-primary text-white shadow-sm shadow-cyan-500/20"
                  : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-[#b3b3b3] hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {groups.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-[#b3b3b3]">
          <p className="text-lg font-bold mb-2">Không tìm thấy kết quả</p>
          <p className="text-sm">Thử thay đổi bộ lọc</p>
        </div>
      ) : (
        groups.map(group => (
          <div key={group.label}>
            {/* Date group header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white">{group.label}</h3>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-xs text-gray-400 dark:text-[#b3b3b3]">{group.items.length} bản phát hành</span>
            </div>

            {/* Song rows */}
            <div className="space-y-0.5">
              {group.items.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  isFav={favorites.some(f => f.id === song.id)}
                  onPlay={() => {
                    if (song.audioUrl) playSong({ ...song }, releaseSource.filter(r => r.audioUrl));
                  }}
                  onFav={() => toggleFavorite(song)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
