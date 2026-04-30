import { useState, useRef, useEffect } from 'react';
import { FiSettings, FiGlobe, FiChevronRight, FiCheck, FiLifeBuoy, FiMessageSquare, FiMoon } from "react-icons/fi";
import { useTranslation } from 'react-i18next';

export default function SettingsDropdown() {
  const { t, i18n } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'vi');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode !== null ? savedMode === 'dark' : true;
  });
  const settingsRef = useRef(null);

  const handleThemeToggle = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('themeMode', newMode ? 'dark' : 'light');
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newMode;
    });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          {/* Language Item (group) */}
          <div className="relative group">
            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
              <div className="flex items-center gap-3">
                <FiGlobe className="w-4 h-4" />
                <span>{t('language')}</span>
              </div>
              <FiChevronRight className="w-4 h-4" />
            </button>

            {/* Sub Menu */}
            <div className="absolute right-full top-0 mr-2 w-48 bg-white dark:!bg-[#222222] rounded-xl shadow-xl dark:shadow-2xl py-2 border border-gray-200 dark:border-white/10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50">
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm ${language === 'en' ? 'text-black dark:text-white font-medium' : 'text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'}`}
              >
                <span>English</span>
                {language === 'en' && <FiCheck className="w-4 h-4 text-green-500 dark:text-cyan-400" />}
              </button>
              <button 
                onClick={() => handleLanguageChange('vi')}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm ${language === 'vi' ? 'text-black dark:text-white font-medium' : 'text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white'}`}
              >
                <span>Tiếng Việt</span>
                {language === 'vi' && <FiCheck className="w-4 h-4 text-green-500 dark:text-cyan-400" />}
              </button>
            </div>
          </div>

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

          {/* Hướng dẫn và hỗ trợ */}
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
            <FiLifeBuoy className="w-4 h-4" />
            <span>{t('help_support')}</span>
          </button>

          {/* Góp ý */}
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
            <FiMessageSquare className="w-4 h-4" />
            <span>{t('feedback')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
