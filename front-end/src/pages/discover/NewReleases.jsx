import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlay, FiHeart, FiMoreHorizontal, FiChevronRight, FiPause } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";

/* ─── DATA ─────────────────────────────────────────────── */
const releases = [
  // TODAY
  { id: 201, title: "Waiting For You",          artist: "MONO",                  genre: "V-Pop",    type: "Single", dateLabel: "Hôm nay",        image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop", duration: "3:45", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 202, title: "Anh Ơi Ở Lại",             artist: "Chi Pu",                genre: "V-Pop",    type: "Single", dateLabel: "Hôm nay",        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop", duration: "4:12", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 203, title: "Khoảnh Khắc",              artist: "Vũ.",                   genre: "Indie",    type: "Single", dateLabel: "Hôm nay",        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", duration: "4:01", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 204, title: "DANCING IN THE DARK",      artist: "HIEUTHUHAI",            genre: "Rap Việt", type: "Album",  dateLabel: "Hôm nay",        image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=400&h=400&fit=crop", duration: "–",    audioUrl: "" },
  // YESTERDAY
  { id: 205, title: "Thiên Lý Ơi",              artist: "Jack - J97",            genre: "V-Pop",    type: "Single", dateLabel: "Hôm qua",        image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop", duration: "4:30", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 206, title: "Người Lạ Ơi",              artist: "Karik ft. Orange",      genre: "Rap Việt", type: "Single", dateLabel: "Hôm qua",        image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop", duration: "4:05", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: 207, title: "Ngày Mai",                 artist: "Wren Evans",            genre: "Indie",    type: "EP",     dateLabel: "Hôm qua",        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", duration: "–",    audioUrl: "" },
  { id: 208, title: "Nâng Chén Tiêu Sầu",      artist: "Bích Phương",           genre: "V-Pop",    type: "Single", dateLabel: "Hôm qua",        image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop", duration: "3:30", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  // THIS WEEK
  { id: 209, title: "Yêu Đến Chết",             artist: "Justatee ft. Sơn Tùng", genre: "Rap Việt", type: "Single", dateLabel: "Tuần này",       image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop", duration: "3:58", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: 210, title: "Em Xinh",                  artist: "Tăng Duy Tân",          genre: "V-Pop",    type: "Single", dateLabel: "Tuần này",       image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop", duration: "3:40", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: 211, title: "Có Hẹn Với Thanh Xuân",   artist: "Hà Anh Tuấn",          genre: "Ballad",   type: "Album",  dateLabel: "Tuần này",       image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop", duration: "–",    audioUrl: "" },
  { id: 212, title: "Mất Kết Nối",              artist: "Pháo",                  genre: "Rap Việt", type: "Single", dateLabel: "Tuần này",       image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=400&fit=crop", duration: "3:28", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 213, title: "Độ Ta Không Độ Nàng",     artist: "Hoàng Duyên",           genre: "Indie",    type: "Single", dateLabel: "Tuần này",       image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop", duration: "4:15", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  // THIS MONTH
  { id: 214, title: "Chờ Người Nơi Ấy",        artist: "AMEE",                  genre: "V-Pop",    type: "Single", dateLabel: "Tháng này",      image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=400&h=400&fit=crop", duration: "3:50", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 215, title: "Sóng Gió",                 artist: "Jack & K-ICM",          genre: "V-Pop",    type: "Single", dateLabel: "Tháng này",      image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=400&h=400&fit=crop", duration: "4:20", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
];

const TYPE_TABS = ["Tất cả", "Single", "Album", "EP"];
const GENRE_TABS = ["Tất cả", "V-Pop", "Rap Việt", "Indie", "Ballad"];

const TYPE_STYLE = {
  Single: "bg-nct-primary/20 text-nct-primary",
  Album:  "bg-purple-500/20 text-purple-400",
  EP:     "bg-emerald-500/20 text-emerald-400",
};

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
  const isAlbum = song.type === "Album" || song.type === "EP";
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(isAlbum ? `/album/${song.id || 1}` : `/song/${song.id || 1}`)}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl group cursor-pointer transition-colors ${isCurrent ? "bg-nct-primary/10" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
    >
      {/* index / play */}
      <div className="w-6 text-center shrink-0">
        <span className={`text-sm font-medium text-gray-400 dark:text-[#b3b3b3] group-hover:hidden ${isCurrent ? "hidden" : ""}`}>{index + 1}</span>
        {isAlbum ? (
          <span className="hidden group-hover:inline text-gray-400">–</span>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onPlay(); }} 
            className={`hidden group-hover:inline ${isCurrent ? "!inline" : ""}`}
          >
            {isCurrent && isPlaying
              ? <FiPause className="w-4 h-4 text-nct-primary" />
              : <FiPlay className="w-4 h-4 text-gray-700 dark:text-white fill-current" />
            }
          </button>
        )}
      </div>

      {/* artwork */}
      <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
        {!isAlbum && (
          <div 
            className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
          >
            <FiPlay className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
        )}
        {/* type badge */}
        <span className={`absolute top-0.5 right-0.5 px-1 py-px rounded text-[8px] font-black uppercase ${TYPE_STYLE[song.type]}`}>
          {song.type}
        </span>
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
        {song.duration}
      </span>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function NewReleases() {
  const [typeTab,  setTypeTab]  = useState("Tất cả");
  const [genreTab, setGenreTab] = useState("Tất cả");
  const { playSong, currentSong, isPlaying, favorites, toggleFavorite, allSongs } = useMusic();
  const releaseSource = allSongs.length > 0
    ? allSongs.map((song) => ({
        ...song,
        genre: song.genreName || "Khác",
        type: "Single",
        dateLabel: "Hôm nay",
      }))
    : releases;

  const filtered = releaseSource.filter(s => {
    const okType  = typeTab  === "Tất cả" || s.type  === typeTab;
    const okGenre = genreTab === "Tất cả" || s.genre === genreTab;
    return okType && okGenre;
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Type tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-white/10">
          {TYPE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTypeTab(t)}
              className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                typeTab === t
                  ? "text-nct-primary"
                  : "text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t}
              {typeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-nct-primary rounded-t-full" />}
            </button>
          ))}
        </div>

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
