import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiPlay, FiMoreHorizontal, FiArrowLeft, FiMusic, FiDownload, FiPlus, FiShare2, FiFlag, FiFacebook, FiLink, FiChevronDown } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { useMusic } from "../../context/MusicContext";
import { genreService, songService } from "../../api/services";
import { enrichSongsWithDuration } from "../../utils/duration";
import { getSongArtistNames } from "../../utils/songArtists";
import LazyImage from "../../components/common/LazyImage";

const mapSong = (s) => ({
  id: s.id,
  title: s.tieu_de,
  artist: getSongArtistNames(s, "Unknown Artist"),
  image: s.duong_dan_hinh_anh,
  audioUrl: s.duong_dan_am_thanh,
  duration: s.thoi_luong || null,
  lyrics: s.loi_bai_hat,
  plays: s.luot_nghe
});

// Gradient colors to assign to genres
const GRADIENT_COLORS = [
  "from-teal-400 to-emerald-500",
  "from-purple-500 to-indigo-600",
  "from-rose-400 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-600",
  "from-emerald-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-indigo-500 to-purple-600",
  "from-lime-400 to-green-500",
  "from-pink-400 to-rose-500",
];

export default function GenreDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { playSong, playAll, openAddToPlaylistModal } = useMusic();
  const [genre, setGenre] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePopup, setActivePopup] = useState(null);
  const popupRef = useRef(null);

  const gradientColor = GRADIENT_COLORS[(parseInt(id) || 0) % GRADIENT_COLORS.length];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch genre info
        const found = await genreService.getById(id);
        setGenre(found || null);

        // Fetch songs by genre
        const songsRes = await songService.getAll({ id_the_loai: id, trang_thai: 'PUBLIC' });
        const songList = songsRes.results || songsRes;
        const enriched = await enrichSongsWithDuration(songList, mapSong);
        setSongs(enriched);
      } catch (error) {
        console.error("Lỗi khi tải thể loại:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-nct-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500 dark:text-gray-400">
        <FiMusic className="w-12 h-12 opacity-30" />
        <p>Không tìm thấy thể loại.</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playAll(songs);
    }
  };

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className={`relative bg-gradient-to-br ${gradientColor} rounded-2xl overflow-hidden mb-10`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 px-10 py-12 flex items-end gap-8">
          {/* Genre Image or Gradient Icon */}
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            {genre.anh_the_loai ? (
              <LazyImage src={genre.anh_the_loai} alt={genre.ten_the_loai} className="w-full h-full object-cover" />
            ) : (
              <FiMusic className="w-20 h-20 text-white/60" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 pb-2">
            <span className="text-sm font-bold text-white/80 uppercase tracking-widest">Thể loại</span>
            <h1 className="text-5xl font-extrabold text-white leading-tight">{genre.ten_the_loai}</h1>
            {genre.mo_ta_the_loai && (
              <p className="text-white/80 text-lg max-w-xl line-clamp-2">{genre.mo_ta_the_loai}</p>
            )}
            <p className="text-white/70 text-sm font-medium mt-1">{songs.length} bài hát</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:opacity-90 hover:scale-105 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(0,242,254,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <FiPlay className="text-xl fill-white" />
          <span>{t('play_all', 'Phát tất cả')}</span>
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white font-bold rounded-full transition-all border border-gray-200 dark:border-white/10"
        >
          <FiArrowLeft className="text-lg" />
          <span>{t('back_to_home', 'Quay về')}</span>
        </Link>
      </div>

      {/* Song List */}
      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
          <FiMusic className="w-10 h-10 opacity-30" />
          <p className="font-medium">Chưa có bài hát nào trong thể loại này</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Table Header */}
          <div className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10">
            <span className="w-10 text-center">#</span>
            <span className="flex-1 ml-4">Bài hát</span>
            <span className="w-32 text-right pr-8 hidden sm:block">Thời lượng</span>
          </div>

          {songs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => playSong(song, songs)}
              className="group flex items-center p-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-100 dark:border-white/[0.03] last:border-b-0"
            >
              {/* Index */}
              <span className="w-10 text-center text-sm font-bold text-gray-400 dark:text-gray-500 group-hover:hidden">
                {index + 1}
              </span>
              <span className="w-10 text-center hidden group-hover:flex items-center justify-center">
                <FiPlay className="text-nct-primary fill-nct-primary w-4 h-4" />
              </span>

              {/* Song Info */}
              <div className="flex items-center gap-4 flex-1 ml-4 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <LazyImage src={song.image} alt={song.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <FiPlay className="text-white fill-white text-sm" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-nct-primary transition-colors truncate">
                    {song.title}
                  </h4>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate">
                    {song.artist}
                  </span>
                </div>
              </div>

              {/* Duration & Actions */}
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-bold w-12 text-right hidden sm:block">
                  {song.duration || '--:--'}
                </span>

                {/* More Options */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopup(activePopup === song.id ? null : song.id);
                    }}
                    className={`w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all ${activePopup === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <FiMoreHorizontal className="text-lg" />
                  </button>

                  {activePopup === song.id && (
                    <div
                      ref={popupRef}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 py-2"
                    >
                      {/* Download */}
                      <div className="relative group/download w-full">
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                          <div className="flex items-center gap-3">
                            <FiDownload className="text-lg" />
                            <span>Tải về</span>
                          </div>
                          <FiChevronDown className="text-sm opacity-50 -rotate-90" />
                        </button>
                        <div className="absolute right-full top-0 mr-1 hidden group-hover/download:block w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden py-2">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            Chất lượng tiêu chuẩn (~4.1MB)
                          </button>
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            Chất lượng cao (~10.2MB)
                          </button>
                        </div>
                      </div>

                      {/* Add to playlist */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylistModal(song);
                          setActivePopup(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors"
                      >
                        <FiPlus className="text-lg" />
                        <span>Thêm vào playlist</span>
                      </button>

                      {/* Share */}
                      <div className="relative group/share w-full">
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                          <div className="flex items-center gap-3">
                            <FiShare2 className="text-lg" />
                            <span>Chia sẻ</span>
                          </div>
                          <FiChevronDown className="text-sm opacity-50 -rotate-90" />
                        </button>
                        <div className="absolute right-full top-0 mr-1 hidden group-hover/share:block w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden py-2">
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            <FiFacebook className="text-lg" />
                            <span>Facebook</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            <FiLink className="text-lg" />
                            <span>Sao chép đường dẫn</span>
                          </button>
                        </div>
                      </div>

                      {/* Report */}
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                        <FiFlag className="text-lg" />
                        <span>Báo cáo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
