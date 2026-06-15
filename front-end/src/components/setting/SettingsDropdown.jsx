import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiMoon, FiBarChart2 } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../../hooks/useClickOutside';
import { AuthContext } from '../../context/AuthContext';
export default function SettingsDropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    const dark = savedMode !== null ? savedMode === 'dark' : true;
    // Apply class immediately on first render (before useEffect runs)
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return dark;
  });
  const settingsRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('themeMode', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useClickOutside(settingsRef, () => setIsSettingsOpen(false));

  return (
    <div className="relative" ref={settingsRef}>
      <button 
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors" 
        title={t('settings')}
      >
        <FiSettings className="w-5 h-5 cursor-pointer" />
      </button>

      {/* Settings Dropdown */}
      {isSettingsOpen && (
        <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:!bg-[#222222] rounded-xl shadow-xl dark:shadow-2xl py-2 border border-gray-200 dark:border-white/10 z-50">


          {/* Dark Mode Toggle */}
          <button 
            onClick={handleThemeToggle}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FiMoon className="w-4 h-4" />
              <span>{t('dark_mode')}</span>
            </div>
            
            {/* Toggle Switch */}
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-green-500 dark:bg-cyan-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </button>

          {user?.vai_tro === 'ADMIN' && (
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                navigate('/admin');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Quản lý & thống kê</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
