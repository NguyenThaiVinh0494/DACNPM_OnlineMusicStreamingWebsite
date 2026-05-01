import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { FiPlay, FiPause, FiDownload, FiShare2, FiHeart, FiMoreHorizontal, FiTrash2, FiClock, FiPlus, FiList, FiX, FiMusic, FiSearch, FiCheck } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import SongItem from "../../components/common/SongItem";

export default function MyPlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    myPlaylists, 
    playAll, 
    playSong, 
    currentSong, 
    isPlaying, 
    removeSongFromMyPlaylist, 
    deleteMyPlaylist, 
    allSongs, 
    favorites, 
    addSongToMyPlaylist, 
    updateMyPlaylist, 
    toggleFavorite, 
    addToQueue, 
    playNextInQueue,
    openAddToPlaylistModal
  } = useMusic();
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [addSourceTab, setAddSourceTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);

  const playlist = myPlaylists.find(pl => pl.id === parseInt(id));

  if (!playlist) {
    return <Navigate to="/" replace />;
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playAll(playlist.songs);
    }
  };

  const toggleDropdown = (songId) => {
    setOpenDropdown(openDropdown === songId ? null : songId);
  };

  const toggleSelectSong = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSongs.length === playlist.songs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(playlist.songs.map(s => s.id));
    }
  };

  const handleDeletePlaylist = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa playlist này không?")) {
      deleteMyPlaylist(playlist.id);
      navigate("/my-music");
    }
  };

  const handleSavePlaylist = () => {
    if (editTitle.trim()) {
      updateMyPlaylist(playlist.id, { 
        title: editTitle.trim(),
        isPrivate: editIsPrivate
      });
    }
    setIsEditModalOpen(false);
  };

  const filteredSongs = (addSourceTab === "favorites" ? favorites : allSongs).filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="pb-20">
      <div className="flex gap-8 mb-10 items-end">
        <div className="w-[230px] h-[230px] shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#2a2a2a] relative group flex items-center justify-center shadow-lg border border-gray-200 dark:border-white/5">
          {playlist.songs.length > 0 ? (
            <>
              <img 
                src={playlist.image} 
                alt={playlist.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  className="w-14 h-14 rounded-full bg-nct-primary text-white flex items-center justify-center hover:scale-105 transition-transform"
                  onClick={handlePlayAll}
                >
                  <FiPlay className="w-6 h-6 fill-current ml-1" />
                </button>
              </div>
            </>
          ) : (
            <FiMusic className="w-20 h-20 text-gray-400 dark:text-white/20" />
          )}
        </div>

        <div className="flex flex-col justify-end flex-1 pb-2">
          <p className="text-sm font-medium text-gray-500 dark:text-[#b3b3b3] mb-2 uppercase tracking-wider">Playlist cá nhân · {playlist.songs.length} Bài hát</p>
          
          <div className="flex items-center gap-4 mb-6 group/title">
            <h2 className="text-[40px] font-bold text-gray-900 dark:text-white leading-tight uppercase">{playlist.title}</h2>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={handlePlayAll}
              disabled={playlist.songs.length === 0}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-bold transition-all ${
                playlist.songs.length > 0 
                  ? 'bg-nct-primary hover:bg-[#2591c4] text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <FiPlay className="w-5 h-5 fill-current" /> Phát tất cả
            </button>
            <button 
              disabled={playlist.songs.length === 0}
              className={`p-2.5 rounded-full transition-colors ${
                playlist.songs.length > 0 ? 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'
              }`}
              title="Tải xuống"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 rounded-full transition-colors bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white"
              title="Chia sẻ"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
            <div className="relative dropdown-container">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'playlist-menu' ? null : 'playlist-menu')}
                className={`p-2.5 rounded-full transition-colors ${
                  openDropdown === 'playlist-menu' ? 'bg-nct-primary text-white' : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white'
                }`}
                title="Khác"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>

              {openDropdown === 'playlist-menu' && (
                <div className="absolute top-12 left-0 w-56 bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-1 text-left">
                  <button 
                    onClick={() => {
                      setOpenDropdown(null);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" /> Thêm bài hát
                  </button>
                  <button 
                    onClick={() => {
                      setOpenDropdown(null);
                      setEditTitle(playlist.title);
                      setEditIsPrivate(playlist.isPrivate || false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                  >
                    <FiMoreHorizontal className="w-4 h-4" /> Chỉnh sửa Playlist
                  </button>
                  <button 
                    onClick={() => setOpenDropdown(null)}
                    className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                  >
                    <FiShare2 className="w-4 h-4" /> Chia sẻ
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-white/5 my-1"></div>
                  <button 
                    onClick={() => {
                      setOpenDropdown(null);
                      handleDeletePlaylist();
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-500 hover:text-red-600 text-sm text-left flex items-center gap-3 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" /> Xóa Playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {playlist.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 mt-10 border-t border-gray-200 dark:border-white/5 text-center">
            <FiMusic className="w-16 h-16 text-gray-400 dark:text-[#b3b3b3]/30 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Playlist này đang trống</h3>
            <p className="text-gray-500 dark:text-[#b3b3b3] mb-8">Hãy tìm và thêm những bài hát bạn yêu thích vào đây</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-8 py-2.5 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold transition-colors"
            >
              Thêm bài hát
            </button>
          </div>
        ) : (
          <div className="bg-transparent">
            {selectedSongs.length > 0 ? (
              <div className="flex items-center text-gray-900 dark:text-white text-sm font-medium px-4 py-0 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#282828] h-[56px] rounded-t-md">
                <div className="w-12 flex justify-center">
                  <button 
                    onClick={handleSelectAll}
                    className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors shadow-sm ${
                      selectedSongs.length === playlist.songs.length && playlist.songs.length > 0
                        ? 'bg-gray-900 dark:bg-white' 
                        : 'border border-gray-400 dark:border-[#666666] bg-transparent'
                    }`}
                  >
                    {selectedSongs.length === playlist.songs.length && playlist.songs.length > 0 && (
                      <FiCheck className="w-3.5 h-3.5 text-white dark:text-[#282828] font-bold" strokeWidth={3} />
                    )}
                  </button>
                </div>
                <div className="flex-1 flex items-center gap-5 pl-2">
                  <span className="text-gray-900 dark:text-white text-sm">{selectedSongs.length} bài hát được chọn</span>
                  <div className="flex items-center gap-5 border-l border-gray-200 dark:border-white/10 pl-5">
                    <button className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors" title="Thêm vào playlist">
                      <FiPlus className="w-5 h-5" />
                      <span className="text-sm font-bold">Thêm vào playlist</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors" title="Thêm vào yêu thích">
                      <FiHeart className="w-5 h-5" />
                      <span className="text-sm font-bold">Thêm vào yêu thích</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors" title="Tải nhạc">
                      <FiDownload className="w-5 h-5" />
                      <span className="text-sm font-bold">Tải nhạc</span>
                    </button>
                    <button 
                      className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-red-500 transition-colors" 
                      title="Xóa khỏi playlist"
                      onClick={() => {
                        selectedSongs.forEach(songId => removeSongFromMyPlaylist(playlist.id, songId));
                        setSelectedSongs([]);
                      }}
                    >
                      <FiTrash2 className="w-5 h-5" />
                      <span className="text-sm font-bold">Xóa</span>
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
              {playlist.songs.map((song, index) => (
                <SongItem 
                  key={song.id}
                  song={song}
                  index={index}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  isFavorite={favorites.some(f => f.id === song.id)}
                  isSelected={selectedSongs.includes(song.id)}
                  showCheckbox={true}
                  onPlay={(s) => playSong(s, playlist.songs)}
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
                        onClick={() => { 
                          setOpenDropdown(null); 
                          if (window.confirm("Xóa bài hát này khỏi playlist?")) {
                            removeSongFromMyPlaylist(playlist.id, song.id);
                          }
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-500 hover:text-red-600 text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" /> Xóa khỏi playlist
                      </button>
                      <button 
                        onClick={() => { setOpenDropdown(null); openAddToPlaylistModal(song); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" /> Thêm vào playlist khác
                      </button>
                      <button 
                        onClick={() => { setOpenDropdown(null); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiShare2 className="w-4 h-4" /> Chia sẻ
                      </button>
                      <button 
                        onClick={() => { setOpenDropdown(null); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiDownload className="w-4 h-4" /> Tải xuống
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Songs Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 w-full max-w-4xl h-[75vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thêm bài hát vào "{playlist.title}"</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#121212] p-4 flex flex-col gap-2">
                <button onClick={() => setAddSourceTab("all")} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${addSourceTab === "all" ? 'bg-black/5 dark:bg-white/10 text-nct-primary shadow-sm' : 'text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'}`}>
                  Kho nhạc hệ thống
                </button>
                <button onClick={() => setAddSourceTab("favorites")} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${addSourceTab === "favorites" ? 'bg-black/5 dark:bg-white/10 text-nct-primary shadow-sm' : 'text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'}`}>
                  Nhạc yêu thích
                </button>
              </div>
              <div className="w-2/3 flex flex-col bg-white dark:bg-[#1e1e1e]">
                <div className="p-4 border-b border-gray-200 dark:border-white/5">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#b3b3b3] w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm bài hát..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#b3b3b3] rounded-lg py-2.5 pl-10 pr-4 outline-none focus:bg-gray-200 dark:focus:bg-[#333] transition-colors border border-gray-200 dark:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredSongs.map(song => {
                    const isAdded = playlist.songs.some(s => s.id === song.id);
                    return (
                      <div key={song.id} className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg group transition-colors">
                        <img src={song.image} alt={song.title} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium truncate">{song.title}</p>
                          <p className="text-sm text-gray-500 dark:text-[#b3b3b3] truncate">{song.artist}</p>
                        </div>
                        {isAdded ? (
                          <span className="text-gray-500 dark:text-[#b3b3b3] text-sm font-medium px-3">Đã thêm</span>
                        ) : (
                          <button 
                            onClick={() => addSongToMyPlaylist(playlist.id, song)}
                            className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:border-nct-primary hover:text-nct-primary text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Thêm
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-[#b3b3b3] mb-2 block">Tên Playlist</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-nct-primary transition-colors"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white font-medium">Công khai</span>
                <button onClick={() => setEditIsPrivate(!editIsPrivate)} className={`w-12 h-6 rounded-full transition-colors relative ${!editIsPrivate ? 'bg-nct-primary' : 'bg-gray-300 dark:bg-[#1e1e1e]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!editIsPrivate ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white transition-colors">Hủy</button>
              <button onClick={handleSavePlaylist} className="px-8 py-2 bg-nct-primary text-white font-bold rounded-full hover:bg-emerald-500 transition-colors">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
