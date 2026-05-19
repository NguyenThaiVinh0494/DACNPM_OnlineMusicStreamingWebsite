import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiPlay, FiDownload, FiShare2, FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";
import SongItem from "../components/common/SongItem";
import { playlistService } from "../api/services";
import { enrichSongsWithDuration } from "../utils/duration";



export default function PlaylistDetail() {
  const { id } = useParams();
  const { playAll, playSong, currentSong, isPlaying, openAddToPlaylistModal } = useMusic();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  useEffect(() => {
    const fetchPlaylistDetail = async () => {
      setLoading(true);
      try {
        const data = await playlistService.getById(id);
        const songsDetail = data.bai_hats_detail || [];
        const mappedSongs = await enrichSongsWithDuration(songsDetail, (s) => ({
          id: s.id,
          title: s.tieu_de,
          artist: s.id_nghe_si?.ten_nghe_si || "Không rõ",
          image: s.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
          duration: s.thoi_luong || null,
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat
        }));
        
        setPlaylist({
          id: data.id,
          title: data.tieu_de,
          creator: data.ten_chu_so_huu || "User",
          image: songsDetail[0]?.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
          songs: mappedSongs
        });
      } catch (error) {
        console.error("Lỗi lấy chi tiết playlist thật:", error);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylistDetail();
  }, [id]);

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playAll(playlist.songs);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-nct-primary border-t-transparent" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-48 text-nct-text-dim">
        <p className="text-lg font-medium">Không tìm thấy playlist</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex gap-8 mb-12">
        <div className="w-[230px] h-[230px] shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-white/5 relative group flex items-center justify-center">
          <img 
            src={playlist.image} 
            alt={playlist.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              className="w-14 h-14 rounded-full border border-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={handlePlayAll}
            >
              <FiPlay className="w-6 h-6 text-white fill-current ml-1" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-nct-text-dim mb-2">Playlist • {playlist.songs.length} Songs</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">{playlist.title}</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <button className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <FiHeart className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
            <button className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <FiShare2 className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
            <button className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <FiMoreHorizontal className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-nct-primary hover:bg-emerald-500 text-white px-8 py-2.5 rounded-full font-bold transition-all"
            >
              <FiPlay className="w-5 h-5 fill-current" /> Play all
            </button>
            <button 
              className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-2.5 rounded-full font-bold transition-all"
            >
              <FiDownload className="w-5 h-5" /> Download
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-transparent">
          <div className="grid grid-cols-[40px_40px_minmax(0,1fr)_96px] md:grid-cols-[40px_40px_minmax(0,1fr)_minmax(180px,28%)_96px] items-center gap-x-4 px-3 py-4 pr-24 text-sm font-medium text-gray-500 dark:text-nct-text-dim border-b border-gray-200 dark:border-white/5">
            <div className="text-center">#</div>
            <div />
            <div>Title</div>
            <div className="hidden md:block">Artist</div>
            <div className="text-center">Duration</div>
          </div>

          <div className="flex flex-col mt-2">
            {playlist.songs.map((song, index) => (
              <SongItem 
                key={song.id}
                song={song}
                index={index}
                isCurrent={currentSong?.id === song.id}
                isPlaying={isPlaying}
                isFavorite={false} // Would normally check global state
                onPlay={(s) => playSong(s, playlist.songs)}
                onToggleFavorite={() => {}} // Handle favorite toggle
                onMore={toggleDropdown}
                openDropdown={openDropdown}
                layout="table"
                artistColumnClass=""
                durationColumnClass="w-24"
                dropdownContent={
                  <div className="absolute top-10 right-0 w-48 bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden text-left">
                    <button 
                      onClick={() => {
                        setOpenDropdown(null);
                        openAddToPlaylistModal(song);
                      }}
                      className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white text-sm text-left"
                    >
                      Thêm vào playlist
                    </button>
                    <button className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white text-sm text-left">
                      Tải xuống
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
