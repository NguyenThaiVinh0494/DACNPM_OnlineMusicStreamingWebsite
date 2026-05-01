import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiPlay, FiPause, FiDownload, FiShare2, FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";
import SongItem from "../components/common/SongItem";

export default function PlaylistDetail() {
  const { id } = useParams();
  const { playAll, playSong, currentSong, isPlaying, openAddToPlaylistModal } = useMusic();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const playlist = {
    id: parseInt(id) || 1,
    title: "Hit Việt Quốc Dân",
    artist: "HIEUTHUHAI, Trọng Nhân, RPT MCK, tlinh",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    likes: "125K",
    songs: [
      { id: 1, title: "Chúng Ta Của Tương Lai", artist: "Sơn Tùng M-TP", duration: "03:45", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" },
      { id: 2, title: "Nâng Chén Tiêu Sầu", artist: "Bích Phương", duration: "03:22", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=100&h=100&fit=crop" },
      { id: 3, title: "Thiên Lý Ơi", artist: "Jack - J97", duration: "04:10", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=100&h=100&fit=crop" },
      { id: 4, title: "Sau Lời Từ Khước", artist: "Phan Mạnh Quỳnh", duration: "05:01", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop" },
    ]
  };

  const handlePlayAll = () => {
    playAll(playlist.songs);
  };

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
          <div className="flex text-gray-500 dark:text-nct-text-dim text-sm font-medium px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="w-12">#</div>
            <div className="flex-1">Title</div>
            <div className="w-1/4 hidden md:block">Artist</div>
            <div className="w-32 text-center">Duration</div>
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
