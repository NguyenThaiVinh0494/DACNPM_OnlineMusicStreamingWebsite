import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiStar, FiUser, FiHeart, FiClock, FiPlus, FiX } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbVinyl } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { useMusic } from "../../context/MusicContext";

export default function Sidebar() {
  const { t } = useTranslation();
  const { myPlaylists, createNewPlaylist } = useMusic();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const mainLinks = [
    { name: t("discover"), path: "/", icon: <HiOutlineSparkles className="w-6 h-6" /> },
    { name: t("for_you"), path: "/for-you", icon: <FiStar className="w-6 h-6" /> },
    { name: t("my_library"), path: "/my-music", icon: <FiUser className="w-6 h-6" /> },
  ];

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createNewPlaylist(newPlaylistName.trim(), isPrivate);
      setNewPlaylistName("");
      setIsPrivate(false);
      setIsCreateModalOpen(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-gray-50 dark:bg-nct-surface flex flex-col h-full border-r border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-nct-primary rounded-full flex items-center justify-center">
               <TbVinyl className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight text-black dark:text-white">NCT</span>
              <span className="text-[10px] text-gray-500 dark:text-nct-text-dim uppercase tracking-wider">Clone Streaming</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {mainLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 text-nct-primary"
                    : "text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}

          <div className="mt-8 mb-4 border-t border-gray-200 dark:border-white/5 mx-4"></div>

          <div className="px-4 text-xs font-bold text-gray-500 dark:text-nct-text-dim uppercase tracking-wider mb-4">
            {t('library')}
          </div>
          <div className="space-y-1">
            <NavLink 
              to="/favorites" 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? "bg-black/5 dark:bg-white/10 text-nct-primary" : "text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5"}`}
            >
              <FiHeart className="w-5 h-5" />
              {t('liked_songs')}
            </NavLink>
            <NavLink 
              to="/recent" 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? "bg-black/5 dark:bg-white/10 text-nct-primary" : "text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5"}`}
            >
              <FiClock className="w-5 h-5" />
              {t('recently_played')}
            </NavLink>
          </div>

          <div className="mt-8 mb-4 border-t border-gray-200 dark:border-white/5 mx-4"></div>

          <div className="px-4 flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 dark:text-nct-text-dim uppercase tracking-wider">
              {t('my_playlists')}
            </span>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-white"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 pb-6">
            {myPlaylists.map(playlist => (
              <NavLink 
                key={playlist.id}
                to={`/my-playlist/${playlist.id}`} 
                className={({ isActive }) => `block px-4 py-2 rounded-lg font-medium truncate transition-colors ${isActive ? "bg-black/5 dark:bg-white/10 text-nct-primary" : "text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"}`}
              >
                {playlist.title}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-black dark:text-white mb-6">{t('create_new_playlist')}</h3>

            <div className="mb-6 relative">
              <input 
                type="text" 
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder={t('enter_playlist_name')}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-nct-primary transition-colors"
                maxLength={100}
                autoFocus
              />
              <span className="absolute -bottom-6 right-2 text-xs text-gray-500 dark:text-nct-text-dim">{newPlaylistName.length}/100</span>
            </div>

            <div className="flex gap-6 mb-8 mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-black dark:text-white">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={!isPrivate} 
                  onChange={() => setIsPrivate(false)}
                  className="w-4 h-4 text-nct-primary bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 focus:ring-nct-primary"
                />
                <span className="text-sm font-medium">{t('public')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-black dark:text-white">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={isPrivate} 
                  onChange={() => setIsPrivate(true)}
                  className="w-4 h-4 text-nct-primary bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 focus:ring-nct-primary"
                />
                <span className="text-sm font-medium">{t('private')}</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-3 rounded-full font-medium text-black dark:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className={`flex-1 py-3 rounded-full font-bold transition-colors ${
                  newPlaylistName.trim() 
                    ? 'bg-nct-primary hover:bg-emerald-500 text-white shadow-lg shadow-nct-primary/20' 
                    : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-white/50 cursor-not-allowed'
                }`}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

