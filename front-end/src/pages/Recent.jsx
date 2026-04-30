import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiPause, FiMoreHorizontal, FiHeart, FiShare2, FiDownload, FiClock, FiTrash2, FiPlus, FiList, FiCheck } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";

export default function Recent() {
  const [activeTab, setActiveTab] = useState("song");
  const { 
    playSong, 
    playPlaylist, 
    playAll,
    clearRecentSongs,
    currentSong, 
    isPlaying, 
    openAddToPlaylistModal, 
    recentSongs, 
    recentPlaylists, 
    removeFromRecent, 
    toggleFavorite, 
    favorites, 
    addToQueue, 
    playNextInQueue 
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
    { id: "playlist", label: "Playlist" },
    { id: "album", label: "Album" },
    { id: "artist", label: "Nghệ sĩ" },
    { id: "radio", label: "Radio" },
    { id: "video", label: "Video" },
  ];

  return (
    <>
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-[32px] font-bold text-white tracking-tight">Bài hát đã nghe</h2>
            <span className="text-xl text-[#b3b3b3] font-medium">({recentSongs.length})</span>
            <button 
              onClick={() => playAll(recentSongs)}
              disabled={recentSongs.length === 0}
              className="w-10 h-10 rounded-full bg-nct-primary text-white flex items-center justify-center hover:scale-105 transition-transform disabled:bg-white/5 disabled:text-white/30"
            >
              <FiPlay className="w-5 h-5 fill-current ml-1" />
            </button>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm("Xóa tất cả. Các bài hát vừa nghe sẽ bị xóa khỏi danh sách. Bạn có chắc chắn không?")) {
                clearRecentSongs();
              }
            }}
            disabled={recentSongs.length === 0}
            className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
            title="Xóa lịch sử"
          >
            <FiTrash2 className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex gap-6 border-b border-white/5">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-bold tracking-wider uppercase transition-colors relative pb-4 ${
                activeTab === tab.id ? "text-nct-primary" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-nct-primary"></div>}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "song" && (
            <div className="overflow-visible">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#b3b3b3] text-sm">Bài hát đã nghe ({recentSongs.length})</span>
              </div>

              {selectedSongs.length > 0 ? (
                <div className="flex items-center text-white text-sm font-medium px-4 py-0 border-b border-white/5 bg-[#282828] h-[56px] rounded-t-md">
                  <div className="w-12 flex justify-center">
                    <button 
                      onClick={handleSelectAll}
                      className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${
                        selectedSongs.length === recentSongs.length && recentSongs.length > 0
                          ? 'bg-white' 
                          : 'border border-[#666666] bg-transparent'
                      }`}
                    >
                      {selectedSongs.length === recentSongs.length && recentSongs.length > 0 && (
                        <FiCheck className="w-3.5 h-3.5 text-[#282828] font-bold" strokeWidth={3} />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 flex items-center gap-5 pl-2">
                    <span className="text-white text-sm">{selectedSongs.length} bài hát được chọn</span>
                    <div className="flex items-center gap-5 border-l border-white/10 pl-5">
                      <button 
                        className="flex items-center gap-2 text-white hover:text-red-500 transition-colors" 
                        onClick={() => {
                          selectedSongs.forEach(id => removeFromRecent(id));
                          setSelectedSongs([]);
                        }}
                      >
                        <FiTrash2 className="w-5 h-5" />
                        <span className="text-sm">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex text-[#b3b3b3] text-xs font-bold uppercase tracking-wider px-4 py-0 items-center border-b border-white/5 h-[56px]">
                  <div className="w-12 flex justify-center">
                    <button 
                      className="w-[18px] h-[18px] rounded border border-[#666666] bg-transparent opacity-0 cursor-default"
                      disabled
                    />
                  </div>
                  <div className="flex-1">Bài hát</div>
                  <div className="w-1/4">Nghệ sĩ</div>
                  <div className="w-24 flex justify-center"><FiClock className="w-4 h-4" /></div>
                </div>
              )}

              <div className="flex flex-col mt-2">
                {recentSongs.length === 0 ? (
                  <div className="py-20 text-center text-[#b3b3b3]">
                    Bạn chưa nghe bài hát nào gần đây.
                  </div>
                ) : (
                  recentSongs.map((song, index) => {
                    const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
                    const isSelected = selectedSongs.includes(song.id);
                    const isFav = favorites.some(s => s.id === song.id);

                    return (
                      <div key={song.id} className={`flex items-center px-4 py-2 transition-colors group rounded-md relative ${isSelected ? 'bg-[#323232]' : 'hover:bg-[#2b2b2b]'}`}>
                        <div className="w-12 flex items-center justify-center text-[#b3b3b3] font-medium text-sm">
                          <span className={`group-hover:hidden ${isSelected ? 'hidden' : ''}`}>{index + 1}</span>
                          <button 
                            onClick={() => toggleSelectSong(song.id)}
                            className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${
                              isSelected 
                                ? 'bg-white block' 
                                : 'border border-[#666666] bg-transparent hidden group-hover:flex'
                            }`}
                          >
                            {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#282828] font-bold" strokeWidth={3} />}
                          </button>
                        </div>

                        <div className="flex-1 flex items-center gap-3 pr-4">
                          <div 
                            className="relative w-10 h-10 rounded object-cover cursor-pointer group/play"
                            onClick={() => playSong(song, recentSongs)}
                          >
                            <img src={song.image} alt={song.title} className="w-full h-full rounded object-cover" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100'}`}>
                              {isThisSongPlaying ? <FiPause className="w-4 h-4 text-white fill-current" /> : <FiPlay className="w-4 h-4 text-white fill-current" />}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span 
                              className={`font-medium truncate cursor-pointer transition-colors ${currentSong?.id === song.id ? 'text-nct-primary' : 'text-white'}`}
                              onClick={() => playSong(song, recentSongs)}
                            >
                              {song.title}
                            </span>
                          </div>
                        </div>

                        <div className="w-1/4 text-[#b3b3b3] text-sm hover:underline hover:text-nct-primary cursor-pointer truncate pr-4">
                          {song.artist}
                        </div>

                        <div className="w-24 flex items-center justify-end relative text-[#b3b3b3] text-sm group-hover:opacity-0">
                          {song.duration}
                        </div>

                        <div className={`absolute right-4 flex items-center justify-end gap-2 pr-4 transition-opacity dropdown-container ${openDropdown === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button 
                            onClick={() => toggleFavorite(song)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Thêm vào yêu thích"
                          >
                            <FiHeart className={`w-4 h-4 transition-colors ${isFav ? 'text-nct-primary fill-[#2daaed]' : 'text-[#b3b3b3] hover:text-white'}`} />
                          </button>
                          <button 
                            onClick={() => toggleDropdown(song.id)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                            title="Thêm"
                          >
                            <FiMoreHorizontal className="w-4 h-4 text-[#b3b3b3] hover:text-white" />
                          </button>

                          {openDropdown === song.id && (
                            <div className="absolute right-0 mt-10 w-56 bg-[#2d2f32] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                              <button 
                                onClick={() => { setOpenDropdown(null); playNextInQueue(song); }}
                                className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                              >
                                <FiPlay className="w-4 h-4" /> Phát tiếp theo
                              </button>
                              <button 
                                onClick={() => { setOpenDropdown(null); addToQueue(song); }}
                                className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                              >
                                <FiList className="w-4 h-4" /> Thêm vào danh sách chờ
                              </button>
                              <div className="h-px bg-white/10 my-1"></div>
                              <button 
                                onClick={() => { setOpenDropdown(null); openAddToPlaylistModal(song); }}
                                className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                              >
                                <FiPlus className="w-4 h-4" /> Thêm vào playlist
                              </button>
                              <button 
                                onClick={() => { toggleFavorite(song); setOpenDropdown(null); }}
                                className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors"
                              >
                                <FiHeart className={`w-4 h-4 ${favorites.some(s => s.id === song.id) ? 'text-nct-primary fill-[#2daaed]' : ''}`} /> {favorites.some(s => s.id === song.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                              </button>
                              <div className="h-px bg-white/10 my-1"></div>
                              <button className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors">
                                <FiShare2 className="w-4 h-4" /> Chia sẻ
                              </button>
                              <button className="w-full px-4 py-2 hover:bg-white/10 text-[#b3b3b3] hover:text-white text-sm text-left flex items-center gap-3 transition-colors">
                                <FiDownload className="w-4 h-4" /> Tải xuống
                              </button>
                              <div className="h-px bg-white/10 my-1"></div>
                              <button 
                                onClick={() => { removeFromRecent(song.id); setOpenDropdown(null); }}
                                className="w-full px-4 py-2 hover:bg-white/10 text-red-400 hover:text-red-300 text-sm text-left flex items-center gap-3 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" /> Xóa khỏi lịch sử
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "playlist" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
              {recentPlaylists.length === 0 ? (
                <div className="col-span-full py-20 text-center text-[#b3b3b3]">
                  Bạn chưa nghe playlist nào gần đây.
                </div>
              ) : (
                recentPlaylists.map((playlist) => (
                  <div key={playlist.id} className="group flex flex-col gap-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                      <Link to={`/playlist/${playlist.id}`} className="absolute inset-0 z-10"></Link>
                      <img 
                        src={playlist.image} 
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            playPlaylist(playlist);
                          }}
                          className="w-12 h-12 rounded-full bg-nct-primary text-white flex items-center justify-center hover:scale-105 transition-transform pointer-events-auto z-20 shadow-lg shadow-cyan-500/30"
                        >
                          <FiPlay className="w-5 h-5 fill-current ml-1" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Link to={`/playlist/${playlist.id}`}>
                        <h4 className="font-bold text-white hover:text-nct-primary transition-colors truncate">{playlist.title}</h4>
                      </Link>
                      <p className="text-sm text-[#b3b3b3] truncate">{playlist.artist || "Nhiều nghệ sĩ"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {["album", "artist", "radio", "video"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-[#b3b3b3]">
              <p className="mb-6">Tính năng đang được phát triển.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
