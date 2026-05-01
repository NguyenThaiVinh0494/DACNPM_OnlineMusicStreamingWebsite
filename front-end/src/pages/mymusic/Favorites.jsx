import { useState, useEffect } from "react";
import { FiPlay, FiPause, FiDownload, FiShare2, FiHeart, FiMoreHorizontal, FiClock, FiPlus, FiList, FiCheck, FiX, FiSearch, FiMusic } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";
import SongItem from "../../components/common/SongItem";

export default function Favorites() {
  const { 
    favorites, 
    playAll, 
    playSong, 
    toggleFavorite, 
    currentSong, 
    isPlaying, 
    openAddToPlaylistModal, 
    addToQueue, 
    playNextInQueue, 
    allSongs 
  } = useMusic();
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addSourceTab, setAddSourceTab] = useState("all");

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playAll(favorites);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const toggleSelectSong = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSongs.length === favorites.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(favorites.map(s => s.id));
    }
  };

  const filteredSongs = allSongs.filter(song => 
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
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start gap-8">
          <div className="w-[240px] h-[240px] shadow-2xl rounded-xl overflow-hidden group relative bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center">
            {favorites.length > 0 ? (
              <>
                <img 
                  src={favorites[0].image} 
                  alt="Favorites" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handlePlayAll}
                    className="w-16 h-16 rounded-full bg-nct-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                  >
                    <FiPlay className="w-8 h-8 fill-current ml-1" />
                  </button>
                </div>
              </>
            ) : (
              <FiMusic className="w-20 h-20 text-gray-400 dark:text-white/10" />
            )}
          </div>

          <div className="flex-1 flex flex-col justify-end h-[240px] pb-2">
            <h4 className="text-sm font-bold text-gray-500 dark:text-[#b3b3b3] uppercase tracking-wider mb-2">Thư viện</h4>
            <h1 className="text-[64px] font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tighter uppercase">Bài hát yêu thích</h1>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-gray-900 dark:text-white font-bold">Nguyễn Thái Vinh</span>
              <span className="text-gray-500 dark:text-[#b3b3b3]">• {favorites.length} bài hát</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePlayAll}
            disabled={favorites.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-base font-bold transition-all shadow-lg ${
              favorites.length > 0 
                ? 'bg-nct-primary hover:bg-[#2591c4] text-white hover:scale-105 shadow-cyan-500/20' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <FiPlay className="w-5 h-5 fill-current" /> PHÁT TẤT CẢ
          </button>
          <button 
            disabled={favorites.length === 0}
            className={`p-2.5 rounded-full transition-colors ${
              favorites.length > 0 ? 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'
            }`}
            title="Tải nhạc"
          >
            <FiDownload className="w-5 h-5" />
          </button>
          <button 
            className="p-2.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white transition-colors"
            title="Chia sẻ"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
          <div className="relative dropdown-container">
            <button 
              onClick={() => setOpenDropdown(openDropdown === 'header-menu' ? null : 'header-menu')}
              className={`p-2.5 rounded-full transition-colors ${
                openDropdown === 'header-menu' ? 'bg-nct-primary text-white' : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white'
              }`}
              title="Khác"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>

            {openDropdown === 'header-menu' && (
              <div className="absolute top-12 left-0 w-56 bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                <button 
                  onClick={() => { setOpenDropdown(null); setIsAddModalOpen(true); }}
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                >
                  <FiPlus className="w-4 h-4" /> Thêm bài hát
                </button>
                <button 
                  onClick={() => setOpenDropdown(null)}
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                >
                  <FiShare2 className="w-4 h-4" /> Chia sẻ
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-transparent mt-4">
          {selectedSongs.length > 0 ? (
            <div className="flex items-center text-gray-900 dark:text-white text-sm font-medium px-4 py-0 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#282828] h-[56px] rounded-t-md">
              <div className="w-12 flex justify-center">
                <button 
                  onClick={handleSelectAll}
                  className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors shadow-sm ${
                    selectedSongs.length === favorites.length && favorites.length > 0
                      ? 'bg-gray-900 dark:bg-white' 
                      : 'border border-gray-400 dark:border-[#666666] bg-transparent'
                  }`}
                >
                  {selectedSongs.length === favorites.length && favorites.length > 0 && (
                    <FiCheck className="w-3.5 h-3.5 text-white dark:text-[#282828] font-bold" strokeWidth={3} />
                  )}
                </button>
              </div>
              <div className="flex-1 flex items-center gap-5 pl-2">
                <span className="text-gray-900 dark:text-white text-sm">{selectedSongs.length} bài hát được chọn</span>
                <div className="flex items-center gap-5 border-l border-gray-200 dark:border-white/10 pl-5">
                  <button 
                    className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors"
                    onClick={() => {
                      if (selectedSongs.length > 0) {
                        const firstSong = favorites.find(s => s.id === selectedSongs[0]);
                        openAddToPlaylistModal(firstSong);
                      }
                    }}
                  >
                    <FiPlus className="w-5 h-5" />
                    <span className="text-sm font-bold">Thêm vào playlist</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors">
                    <FiHeart className="w-5 h-5" strokeWidth={2.5} />
                    <span className="text-sm font-bold">Thêm vào yêu thích</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-nct-primary transition-colors">
                    <FiDownload className="w-5 h-5" />
                    <span className="text-sm font-bold">Tải nhạc</span>
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
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-[#b3b3b3] border-t border-gray-200 dark:border-white/5 mt-4">
                <FiMusic className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Chưa có bài hát yêu thích nào</p>
                <p className="text-sm opacity-60">Hãy thêm bài hát bạn yêu thích vào danh sách này.</p>
              </div>
            ) : (
              favorites.map((song, index) => (
                <SongItem 
                  key={song.id}
                  song={song}
                  index={index}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  isFavorite={true}
                  isSelected={selectedSongs.includes(song.id)}
                  showCheckbox={true}
                  onPlay={(s) => playSong(s, favorites)}
                  onToggleFavorite={toggleFavorite}
                  onToggleSelect={toggleSelectSong}
                  onMore={toggleDropdown}
                  openDropdown={openDropdown}
                  dropdownContent={
                    <div className="absolute right-0 mt-10 w-56 bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-1">
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
                      <div className="h-px bg-gray-200 dark:bg-white/10 my-1"></div>
                      <button 
                        onClick={() => { toggleFavorite(song); setOpenDropdown(null); }}
                        className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-red-500 hover:text-red-600 text-sm text-left flex items-center gap-3 transition-colors"
                      >
                        <FiHeart className="w-4 h-4" /> Xóa khỏi yêu thích
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Add Songs Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 w-full max-w-4xl h-[75vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thêm bài hát vào Yêu thích</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#121212] p-4">
                <button 
                  onClick={() => setAddSourceTab("all")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${addSourceTab === "all" ? 'bg-black/5 dark:bg-white/10 text-nct-primary shadow-sm' : 'text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'}`}
                >
                  Kho nhạc hệ thống
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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {filteredSongs.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-[#b3b3b3]">Không tìm thấy bài hát nào.</div>
                  ) : (
                    filteredSongs.map(song => {
                      const isAdded = favorites.some(s => s.id === song.id);
                      return (
                        <div key={song.id} className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg group transition-colors">
                          <img src={song.image} alt={song.title} className="w-12 h-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white font-medium truncate">{song.title}</p>
                            <p className="text-sm text-gray-500 dark:text-[#b3b3b3] truncate">{song.artist}</p>
                          </div>
                          {isAdded ? (
                            <span className="text-gray-500 dark:text-[#b3b3b3] text-sm font-medium px-3">Đã yêu thích</span>
                          ) : (
                            <button 
                              onClick={() => toggleFavorite(song)}
                              className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:border-nct-primary hover:text-nct-primary text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Thêm
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
