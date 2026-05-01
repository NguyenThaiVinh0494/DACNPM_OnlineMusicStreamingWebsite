import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiPause, FiMoreHorizontal, FiHeart, FiShare2, FiDownload, FiClock, FiTrash2, FiPlus, FiList, FiCheck } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import SongItem from "../../components/common/SongItem";

export default function Recent() {
  const [activeTab, setActiveTab] = useState("song");
  const { 
    recentSongs, 
    playSong, 
    currentSong, 
    isPlaying, 
    toggleFavorite, 
    favorites, 
    openAddToPlaylistModal,
    addToQueue,
    playNextInQueue,
    clearRecentSongs,
    recentPlaylists,
    playPlaylist,
    removeFromRecent
  } = useMusic();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const toggleSelectSong = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSongs.length === recentSongs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(recentSongs.map(s => s.id));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const tabs = [
    { id: "song", label: "Bài hát" },
    { id: "playlist", label: "Playlist" }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-[32px] font-bold text-gray-900 dark:text-white tracking-tight">Nghe gần đây</h2>
          <span className="text-xl text-gray-400 dark:text-[#b3b3b3] font-medium">({recentSongs.length})</span>
        </div>
        
        <button 
          onClick={() => {
            if (window.confirm("Xóa tất cả lịch sử nghe nhạc?")) {
              clearRecentSongs();
            }
          }}
          disabled={recentSongs.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-[#b3b3b3] hover:text-red-500 transition-colors"
        >
          <FiTrash2 className="w-5 h-5" /> Xóa lịch sử
        </button>
      </div>

      <div className="flex gap-8 border-b border-gray-200 dark:border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === tab.id ? "text-nct-primary" : "text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nct-primary"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === "song" && (
        <div className="mt-4">
          {selectedSongs.length > 0 ? (
            <div className="flex items-center text-gray-900 dark:text-white text-sm font-medium px-4 py-0 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#282828] h-[56px] rounded-t-md">
              <div className="w-12 flex justify-center">
                <button 
                  onClick={handleSelectAll}
                  className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors shadow-sm ${
                    selectedSongs.length === recentSongs.length && recentSongs.length > 0
                      ? 'bg-gray-900 dark:bg-white' 
                      : 'border border-gray-400 dark:border-[#666666] bg-transparent'
                  }`}
                >
                  {selectedSongs.length === recentSongs.length && recentSongs.length > 0 && (
                    <FiCheck className="w-3.5 h-3.5 text-white dark:text-[#282828] font-bold" strokeWidth={3} />
                  )}
                </button>
              </div>
              <div className="flex-1 flex items-center gap-5 pl-2">
                <span className="text-gray-900 dark:text-white text-sm">{selectedSongs.length} bài hát được chọn</span>
                <div className="flex items-center gap-5 border-l border-gray-200 dark:border-white/10 pl-5">
                  <button 
                    className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-red-500 transition-colors"
                    onClick={() => {
                      selectedSongs.forEach(id => removeFromRecent(id));
                      setSelectedSongs([]);
                    }}
                  >
                    <FiTrash2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Xóa khỏi lịch sử</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex text-gray-500 dark:text-[#b3b3b3] text-xs font-bold uppercase tracking-wider px-4 py-0 items-center border-b border-gray-200 dark:border-white/5 h-[56px]">
              <div className="w-12 flex justify-center text-sm font-medium">#</div>
              <div className="flex-1">Bài hát</div>
              <div className="w-1/4">Nghệ sĩ</div>
              <div className="w-24 flex justify-center"><FiClock className="w-4 h-4" /></div>
            </div>
          )}

          <div className="flex flex-col mt-2">
            {recentSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-[#b3b3b3]">
                <FiClock className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-gray-900 dark:text-white">Chưa có lịch sử nghe nhạc</p>
              </div>
            ) : (
              recentSongs.map((song, index) => (
                <SongItem 
                  key={`${song.id}-${index}`}
                  song={song}
                  index={index}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  isFavorite={favorites.some(f => f.id === song.id)}
                  isSelected={selectedSongs.includes(song.id)}
                  showCheckbox={true}
                  onPlay={(s) => playSong(s, recentSongs)}
                  onToggleFavorite={toggleFavorite}
                  onToggleSelect={toggleSelectSong}
                  onMore={toggleDropdown}
                  openDropdown={openDropdown}
                  dropdownContent={
                    <div className="absolute right-0 mt-10 w-56 bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-1 text-left">
                      <button 
                        onClick={() => { setOpenDropdown(null); playNextInQueue(song); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiPlay className="w-4 h-4" /> Phát tiếp theo
                      </button>
                      <button 
                        onClick={() => { setOpenDropdown(null); addToQueue(song); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiList className="w-4 h-4" /> Thêm vào danh sách chờ
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-white/10 my-1"></div>
                      <button 
                        onClick={() => { setOpenDropdown(null); openAddToPlaylistModal(song); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" /> Thêm vào playlist
                      </button>
                      <button 
                        onClick={() => { removeFromRecent(song.id); setOpenDropdown(null); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-500 hover:text-red-600 text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" /> Xóa khỏi lịch sử
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "playlist" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
          {recentPlaylists.length > 0 ? (
            recentPlaylists.map(playlist => (
              <div key={playlist.id} className="group flex flex-col gap-3">
                <div className="relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-white/5">
                  <Link to={`/playlist/${playlist.id}`} className="absolute inset-0 z-10"></Link>
                  <img 
                    src={playlist.image} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        playPlaylist(playlist);
                      }}
                      className="w-12 h-12 rounded-full bg-nct-primary text-white flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                    >
                      <FiPlay className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Link to={`/playlist/${playlist.id}`}>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate hover:text-nct-primary transition-colors">{playlist.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-[#b3b3b3] truncate">{playlist.artist}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 dark:text-[#b3b3b3]">
              <FiPlay className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-gray-900 dark:text-white">Chưa có lịch sử nghe playlist</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
