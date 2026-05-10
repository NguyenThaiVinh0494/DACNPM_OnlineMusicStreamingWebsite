import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiPlay, FiHeart, FiShare2, FiMoreHorizontal,
  FiDownload, FiClock, FiCheck
} from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import AlbumActionMenu from "../../components/common/AlbumActionMenu";
import SongActionMenu from "../../components/common/SongActionMenu";
// ── Mock album data keyed by id ────────────────────────────────────────────
const ALBUMS_DATA = {
  1: {
    id: 1,
    title: "Yêu Em Thì Gật Đầu (Lofi Memories)",
    type: "Album",
    year: "2024",
    artistName: "Ngô Mạnh Thắng, Meme Media",
    artistId: 1,
    uploader: "Meme Media",
    uploadDate: "January 15, 2024",
    image:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
    songs: [
      {
        id: 101,
        title: "Yêu Em Thì Gật Đầu (Lofi Ver)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "03:45",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop",
      },
      {
        id: 102,
        title: "Yêu Em Thì Gật Đầu (Piano Lofi)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "04:02",
        image:
          "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=80&h=80&fit=crop",
      },
      {
        id: 103,
        title: "Yêu Em Thì Gật Đầu (Chill Mix)",
        artist: "Meme Media",
        uploader: "Meme Media",
        duration: "03:58",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop",
      },
    ],
  },
  2: {
    id: 2,
    title: "Yêu Em Thì Gật Đầu",
    type: "Single",
    year: "2024",
    artistName: "Lê Bảo Hân",
    artistId: 7,
    uploader: "Bảo Hân Music",
    uploadDate: "March 8, 2024",
    image:
      "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop",
    songs: [
      {
        id: 201,
        title: "Yêu Em Thì Gật Đầu",
        artist: "Lê Bảo Hân",
        uploader: "Bảo Hân Music",
        duration: "04:15",
        image:
          "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=80&h=80&fit=crop",
      },
    ],
  },
  3: {
    id: 3,
    title: "Nếu Yêu Em Thì Gật Đầu",
    type: "Single",
    year: "2024",
    artistName: "Thanh Thơ",
    artistId: 3,
    uploader: "VietStar",
    uploadDate: "February 20, 2024",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    songs: [
      {
        id: 301,
        title: "Nếu Yêu Em Thì Gật Đầu",
        artist: "Thanh Thơ",
        uploader: "VietStar",
        duration: "04:20",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop",
      },
    ],
  },
  4: {
    id: 4,
    title: "Yêu Em Thì Gật Đầu (Tú Remix)",
    type: "Single",
    year: "2024",
    artistName: "Ngô Mạnh Thắng, Meme Media",
    artistId: 1,
    uploader: "Meme Media",
    uploadDate: "April 5, 2024",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    songs: [
      {
        id: 401,
        title: "Yêu Em Thì Gật Đầu (Tú Remix)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "03:58",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop",
      },
    ],
  },
  5: {
    id: 5,
    title: "Yêu Em Thì Gật Đầu (ZoneH Remix)",
    type: "Single",
    year: "2024",
    artistName: "Ngô Mạnh Thắng, Meme Media",
    artistId: 1,
    uploader: "Meme Media",
    uploadDate: "May 1, 2024",
    image:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
    songs: [
      {
        id: 501,
        title: "Yêu Em Thì Gật Đầu (ZoneH Remix)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "04:15",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop",
      },
    ],
  },
};

const FALLBACK = {
  id: 99,
  title: "Album không tìm thấy",
  type: "Album",
  year: "2024",
  artistName: "Unknown Artist",
  artistId: 1,
  uploader: "NCT Music",
  uploadDate: "January 1, 2024",
  image:
    "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop",
  songs: [],
};

export default function AlbumDetail() {
  const { id } = useParams();
  const album = ALBUMS_DATA[parseInt(id)] || FALLBACK;
  const { playSong, playAll, currentSong, isPlaying, toggleFavorite, favorites } = useMusic();

  const [liked, setLiked] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const [activeSongMenu, setActiveSongMenu] = useState(null);
  const albumMenuRef = useRef(null);
  const songMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (albumMenuRef.current && !albumMenuRef.current.contains(event.target)) {
        setShowAlbumMenu(false);
      }
      if (songMenuRef.current && !songMenuRef.current.contains(event.target)) {
        setActiveSongMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlayAll = () => playAll(album.songs);

  return (
    <div className="pb-24 space-y-8">
      {/* ── Header ── */}
      <div className="flex gap-8 items-start">
        {/* Cover Image */}
        <div className="w-[230px] h-[230px] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl group relative">
          <img
            src={album.image}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-xl transition-colors"
            >
              <FiPlay className="w-7 h-7 text-white fill-current ml-1" />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col justify-center pt-2 flex-1 min-w-0">
          {/* Type / Year / Count */}
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {album.type} &bull; {album.year} &bull; {album.songs.length} Bài hát
          </p>

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            {album.title}
          </h1>

          {/* Artist */}
          <Link
            to={`/artist/${album.artistId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors w-fit mb-5"
          >
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {album.artistName.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-semibold">{album.artistName}</span>
          </Link>

          {/* Like / Share / More */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setLiked((l) => !l)}
              className={`flex flex-col items-center gap-0.5 group/btn`}
            >
              <div className={`p-2.5 rounded-full transition-colors ${liked ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                <FiHeart className={`w-5 h-5 transition-colors ${liked ? "text-red-500 fill-current" : "text-gray-700 dark:text-white"}`} />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{liked ? 1 : 0}</span>
            </button>

            <button className="flex flex-col items-center gap-0.5">
              <div className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <FiShare2 className="w-5 h-5 text-gray-700 dark:text-white" />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">0</span>
            </button>

            <div className="relative" ref={albumMenuRef}>
              <button 
                onClick={() => setShowAlbumMenu(!showAlbumMenu)}
                className="flex flex-col items-center gap-0.5"
              >
                <div className={`p-2.5 rounded-full transition-colors ${showAlbumMenu ? "bg-gray-200 dark:bg-white/10" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                  <FiMoreHorizontal className="w-5 h-5 text-gray-700 dark:text-white" />
                </div>
              </button>
              {showAlbumMenu && <AlbumActionMenu onClose={() => setShowAlbumMenu(false)} />}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-nct-primary hover:bg-[#2591c4] text-white px-7 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <FiPlay className="w-4 h-4 fill-current" />
              Phát tất cả
            </button>
            <button className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-7 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 border border-gray-200 dark:border-white/10">
              <FiDownload className="w-4 h-4" />
              Tải về
            </button>
          </div>
        </div>
      </div>

      {/* ── Song Table ── */}
      <div className="mt-4">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_60px_40px] gap-4 px-4 py-3 border-b border-gray-200 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <span className="text-center">#</span>
          <span>Tiêu đề</span>
          <span>Nghệ sĩ</span>
          <span className="flex items-center justify-center">
            <FiClock className="w-3.5 h-3.5" />
          </span>
          <span></span>
        </div>

        {/* Rows */}
        {album.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-nct-text-dim">
            <p className="text-base font-medium">Chưa có bài hát nào</p>
          </div>
        ) : (
          album.songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isFav = favorites.some((f) => f.id === song.id);
            const isHovered = hoveredRow === song.id;
            const isMenuOpen = activeSongMenu === song.id;

            return (
              <div
                key={song.id}
                onMouseEnter={() => setHoveredRow(song.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => playSong(song, album.songs)}
                className={`grid grid-cols-[40px_1fr_1fr_60px_40px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors items-center group
                  ${isCurrent ? "bg-nct-primary/5 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
              >
                {/* Index / Play */}
                <div className="text-center text-sm text-nct-text-dim font-medium">
                  {isHovered || isCurrent ? (
                    <button
                      onClick={e => { e.stopPropagation(); playSong(song, album.songs); }}
                      className="text-teal-500"
                    >
                      {isCurrent && isPlaying ? "▐▐" : "▶"}
                    </button>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    {isHovered && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-semibold truncate ${isCurrent ? "text-teal-500" : "text-gray-900 dark:text-white"}`}>
                    {song.title}
                  </span>
                </div>

                {/* Artist */}
                <span className="text-sm text-nct-text-dim truncate hover:text-nct-primary transition-colors cursor-pointer">
                  {song.artist}
                </span>

                {/* Duration */}
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center">{song.duration}</span>

                {/* More options */}
                <div className="flex items-center justify-center relative" ref={isMenuOpen ? songMenuRef : null}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(song); }}
                    className={`p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100
                      ${isFav ? "text-red-500 opacity-100" : "text-gray-400 dark:text-gray-500 hover:text-red-500"}`}
                  >
                    <FiHeart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                  {isMenuOpen && (
                    <SongActionMenu 
                      song={song} 
                      onClose={() => setActiveSongMenu(null)} 
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Upload info ── */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <FiCheck className="w-4 h-4 text-teal-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Uploaded by
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {album.uploader} &bull; {album.uploadDate}
          </p>
        </div>
      </div>
    </div>
  );
}
