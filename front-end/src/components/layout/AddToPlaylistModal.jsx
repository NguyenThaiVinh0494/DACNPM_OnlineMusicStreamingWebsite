import { useMusic } from "../../context/MusicContext";
import { FiX, FiMusic, FiPlus, FiSearch } from "react-icons/fi";
import { useState } from "react";

export default function AddToPlaylistModal() {
  const { isAddPlaylistModalOpen, closeAddToPlaylistModal, myPlaylists, addSongToMyPlaylist, songToAdd, createNewPlaylist } = useMusic();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isAddPlaylistModalOpen) return null;

  const filteredPlaylists = myPlaylists.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeAddToPlaylistModal}
      ></div>
      
      <div className="relative bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 w-full max-w-[480px] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#282828]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thêm vào playlist</h3>
          <button 
            onClick={closeAddToPlaylistModal}
            className="p-2 text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Create */}
        <div className="p-4 space-y-4 bg-white dark:bg-[#1e1e1e]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-nct-text-dim w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#282828] text-gray-900 dark:text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none border border-gray-200 dark:border-white/5 focus:border-nct-primary/50 transition-all"
            />
          </div>
          
          <button 
            onClick={() => {
              const name = prompt("Nhập tên playlist mới:");
              if (name) createNewPlaylist(name, false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white hover:border-nct-primary hover:bg-gray-50 dark:hover:bg-nct-primary/5 transition-all font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" /> Tạo playlist mới
          </button>
        </div>

        {/* Playlist List */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-1 custom-scrollbar bg-white dark:bg-[#1e1e1e]">
          {filteredPlaylists.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-nct-text-dim flex flex-col items-center">
              <FiMusic className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">Không tìm thấy playlist nào</p>
            </div>
          ) : (
            filteredPlaylists.map(playlist => {
              const isAdded = playlist.songs.some(s => s.id === songToAdd?.id);
              
              return (
                <div key={playlist.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-[#282828] flex items-center justify-center shadow-inner">
                    {playlist.image ? (
                      <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <FiMusic className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 dark:text-white font-bold text-sm truncate">{playlist.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-nct-text-dim mt-0.5">{playlist.songs.length} bài hát</p>
                  </div>
                  <button
                    disabled={isAdded}
                    onClick={() => addSongToMyPlaylist(playlist.id, songToAdd)}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                      isAdded 
                        ? 'bg-transparent border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30 cursor-not-allowed' 
                        : 'bg-nct-primary border-nct-primary text-white hover:bg-[#2591c4] hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/10'
                    }`}
                  >
                    {isAdded ? "ĐÃ THÊM" : "THÊM"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
