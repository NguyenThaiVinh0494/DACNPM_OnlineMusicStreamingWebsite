import { useContext, useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiPlay, FiHeart, FiMoreHorizontal, FiClock, FiCheck
} from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import { AuthContext } from "../../context/AuthContext";
import AlbumActionMenu from "../../components/common/AlbumActionMenu";
import SongActionMenu from "../../components/common/SongActionMenu";
import LazyImage from "../../components/common/LazyImage";
import { albumService, songService } from "../../api/services";
import { enrichSongsWithDuration } from "../../utils/duration";



export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playSong, playAll, currentSong, isPlaying, toggleFavorite, favorites } = useMusic();
  const { user, openLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const [activeSongMenu, setActiveSongMenu] = useState(null);
  const albumMenuRef = useRef(null);
  const songMenuRef = useRef(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      setLoading(true);
      try {
        const albumData = await albumService.getById(id);
        const songsData = await songService.getAll({ id_album: id });
        const songsRes = songsData.results || songsData;
        const albumArtistName = albumData.id_nghe_si_detail?.ten_nghe_si || "Nghệ sĩ";

        const mappedSongs = await enrichSongsWithDuration(songsRes, (s) => ({
          id: s.id,
          title: s.tieu_de,
          artist: s.id_nghe_si?.ten_nghe_si || albumArtistName,
          duration: s.thoi_luong || null,
          image: s.duong_dan_hinh_anh || albumData.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop",
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat,
          uploader: s.id_nguoi_dang?.username || "Admin",
          uploadDate: albumData.ngay_phat_hanh ? new Date(albumData.ngay_phat_hanh).toLocaleDateString("vi-VN") : "18/05/2026"
        }));

        setAlbum({
          id: albumData.id,
          title: albumData.tieu_de,
          type: "Album",
          year: albumData.ngay_phat_hanh ? new Date(albumData.ngay_phat_hanh).getFullYear() : "2026",
          artistName: albumArtistName,
          artistId: albumData.id_nghe_si,
          uploader: "Admin",
          uploadDate: albumData.ngay_phat_hanh ? new Date(albumData.ngay_phat_hanh).toLocaleDateString("vi-VN") : "18/05/2026",
          image: albumData.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
          songs: mappedSongs
        });
      } catch (error) {
        console.error("Lỗi lấy thông tin album thật:", error);
        setAlbum(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [id]);

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

  const handlePlayAll = () => album && playAll(album.songs);
  const handleToggleAlbumLike = () => {
    if (!user) {
      openLoginModal?.();
      return;
    }

    setLiked((l) => !l);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-nct-primary border-t-transparent" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center py-48 text-nct-text-dim">
        <p className="text-lg font-medium">Không tìm thấy album</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#b3b3b3]">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{album.title}</span>
      </nav>

      {/* ── Header ── */}
      <div className="flex gap-8 items-start">
        {/* Cover Image */}
        <div className="w-[230px] h-[230px] shadow-2xl rounded-xl overflow-hidden group relative bg-gray-200 dark:bg-white/5">
          <LazyImage
            src={album.image}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-nct-primary hover:bg-[#00b8b8] flex items-center justify-center shadow-xl transition-colors"
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
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-nct-primary transition-colors w-fit mb-5"
          >
            <div className="w-6 h-6 rounded-full bg-nct-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {album.artistName.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-semibold">{album.artistName}</span>
          </Link>

          {/* Like / More */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleToggleAlbumLike}
              className={`flex flex-col items-center gap-0.5 group/btn`}
            >
              <div className={`p-2.5 rounded-full transition-colors ${liked ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                <FiHeart className={`w-5 h-5 transition-colors ${liked ? "text-red-500 fill-current" : "text-gray-700 dark:text-white"}`} />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{liked ? 1 : 0}</span>
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
                onClick={() => navigate(`/song/${song.id}`)}
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
                  <div 
                    className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-shadow"
                    onClick={(e) => { e.stopPropagation(); playSong(song, album.songs); }}
                  >
                    <LazyImage
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
                    type="button"
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
        <div className="w-8 h-8 rounded-full bg-nct-primary/20 flex items-center justify-center flex-shrink-0">
          <FiCheck className="w-4 h-4 text-nct-primary" />
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
