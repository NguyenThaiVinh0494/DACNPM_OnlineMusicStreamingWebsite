import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiEdit3, FiLogOut } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ProfileModal from '../auth/ProfileModal';
import SettingsDropdown from '../setting/SettingsDropdown';
import { AuthContext } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { songService, artistService, albumService } from '../../api/services';
import { getSongArtistNames } from '../../utils/songArtists';

export default function Topbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeModal, setActiveModal] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileRef = useRef(null);
  
  useClickOutside(profileRef, () => setIsProfileDropdownOpen(false));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Suggestion states
  const [suggestions, setSuggestions] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useClickOutside(searchContainerRef, () => setIsDropdownOpen(false));

  // Debounced search suggestion fetch
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions({ songs: [], artists: [], albums: [] });
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(true);
    setLoading(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const [songsData, artistsData, albumsData] = await Promise.all([
          songService.getAll({ search: trimmed, limit: 5 }),
          artistService.getAll({ search: trimmed, limit: 3 }),
          albumService.getAll({ search: trimmed, limit: 3 }),
        ]);

        const songsRes = songsData.results || songsData || [];
        const artistsRes = artistsData.results || artistsData || [];
        const albumsRes = albumsData.results || albumsData || [];

        const mappedSongs = songsRes.map(s => ({
          id: s.id,
          title: s.tieu_de,
          artist: getSongArtistNames(s, "Không rõ"),
          image: s.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop",
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat,
          duration: s.thoi_luong || "04:00"
        }));

        const mappedArtists = artistsRes.map(a => ({
          id: a.id,
          name: a.ten_nghe_si,
          image: a.anh_nghe_si || null,
        }));

        const mappedAlbums = albumsRes.map(a => ({
          id: a.id,
          title: a.tieu_de,
          artist: a.ten_nghe_si || "Nghệ sĩ",
          image: a.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop"
        }));

        setSuggestions({
          songs: mappedSongs,
          artists: mappedArtists,
          albums: mappedAlbums
        });
      } catch (error) {
        console.error("Lỗi lấy dữ liệu gợi ý:", error);
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce is highly responsive

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsDropdownOpen(false);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/90 dark:!bg-nct-bg/90 backdrop-blur-md sticky top-0 z-10">
      {/* Left section: Navigation & Search */}
      <div className="flex items-center gap-4">
        
        <div className="relative" ref={searchContainerRef}>
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-nct-text-dim group-focus-within:text-gray-900 dark:group-focus-within:text-white w-5 h-5 z-10" />
            <input
              id="topbar-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsDropdownOpen(true);
                }
              }}
              placeholder={t('search_placeholder', 'Tìm kiếm bài hát, nghệ sĩ...')}
              className="bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-nct-text-dim rounded-full py-2.5 pl-12 pr-10 w-[480px] outline-none focus:bg-gray-200 dark:focus:bg-white/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggestion Dropdown */}
          {isDropdownOpen && searchQuery.trim() && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-[480px] bg-white/95 dark:bg-nct-surface/95 backdrop-blur-md border border-gray-150 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {loading ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2.5 text-sm text-gray-500 dark:text-nct-text-dim">
                  <div className="w-6 h-6 border-2 border-nct-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Đang tìm kiếm gợi ý...</span>
                </div>
              ) : (suggestions.songs.length === 0 && suggestions.artists.length === 0 && suggestions.albums.length === 0) ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-nct-text-dim flex flex-col items-center gap-1">
                  <span className="font-semibold text-gray-700 dark:text-white/80">Không tìm thấy kết quả gợi ý</span>
                  <span>Hãy thử nhập từ khóa khác xem sao nhé!</span>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto hide-scrollbar py-2 px-2">
                  <div className="space-y-0.5">
                    {suggestions.songs.map((song) => (
                      <div
                        key={`song-${song.id}`}
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(song.title)}`);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer group/item transition-colors"
                      >
                        <FiSearch className="w-4 h-4 text-gray-400 group-hover/item:text-nct-primary transition-colors flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/item:text-nct-primary dark:group-hover/item:text-white truncate font-medium">
                          {song.title}
                        </span>
                      </div>
                    ))}
                    {suggestions.artists.map((artist) => (
                      <div
                        key={`artist-${artist.id}`}
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(artist.name)}`);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer group/item transition-colors"
                      >
                        <FiSearch className="w-4 h-4 text-gray-400 group-hover/item:text-nct-primary transition-colors flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/item:text-nct-primary dark:group-hover/item:text-white truncate font-medium">
                          {artist.name}
                        </span>
                      </div>
                    ))}
                    {suggestions.albums.map((album) => (
                      <div
                        key={`album-${album.id}`}
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(album.title)}`);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer group/item transition-colors"
                      >
                        <FiSearch className="w-4 h-4 text-gray-400 group-hover/item:text-nct-primary transition-colors flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/item:text-nct-primary dark:group-hover/item:text-white truncate font-medium">
                          {album.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-6">
        {user ? (
          <div className="relative" ref={profileRef}>
            <div 
              className="relative group cursor-pointer" 
              title="Cá nhân"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} 
                alt="avatar" 
                className="w-10 h-10 rounded-full border-2 border-nct-primary dark:border-cyan-400 object-cover" 
              />
            </div>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:!bg-[#222222] rounded-xl shadow-xl dark:shadow-2xl py-2 border border-gray-200 dark:border-white/10 z-50">
                <button 
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>
                <div className="border-t border-gray-200 dark:border-white/5 my-1"></div>
                <button 
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm text-red-600 dark:text-red-400 font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setActiveModal('login')}
            className="bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            {t('login')}
          </button>
        )}

        <SettingsDropdown />
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={activeModal === 'login'} 
        onClose={() => setActiveModal(null)} 
        onSwitchToRegister={() => setActiveModal('register')}
      />
      <RegisterModal 
        isOpen={activeModal === 'register'} 
        onClose={() => setActiveModal(null)} 
        onSwitchToLogin={() => setActiveModal('login')}
      />
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
