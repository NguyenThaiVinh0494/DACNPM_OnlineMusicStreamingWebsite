import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUpload, FiX } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ProfileModal from '../auth/ProfileModal';
import SettingsDropdown from '../setting/SettingsDropdown';
import { AuthContext } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { FiEdit3, FiLogOut } from "react-icons/fi";

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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/90 dark:!bg-nct-bg/90 backdrop-blur-md sticky top-0 z-10">
      {/* Left section: Navigation & Search */}
      <div className="flex items-center gap-4">
        
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-nct-text-dim group-focus-within:text-gray-900 dark:group-focus-within:text-white w-5 h-5 z-10" />
          <input
            id="topbar-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
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
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors" title={t('upload')}>
          <FiUpload className="w-5 h-5 cursor-pointer" />
        </button>

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
