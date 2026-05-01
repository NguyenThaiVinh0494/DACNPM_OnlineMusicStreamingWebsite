import { useState } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiUpload } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import SettingsDropdown from '../setting/SettingsDropdown';

export default function Topbar() {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null); // 'login' | 'register' | null

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/90 dark:!bg-nct-bg/90 backdrop-blur-md sticky top-0 z-10">
      {/* Left section: Navigation & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-nct-text-dim">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors">
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-nct-text-dim group-focus-within:text-gray-900 dark:group-focus-within:text-white w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-nct-text-dim rounded-full py-2.5 pl-12 pr-4 w-[480px] outline-none focus:bg-gray-200 dark:focus:bg-white/15 transition-all"
          />
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors" title={t('upload')}>
          <FiUpload className="w-5 h-5 cursor-pointer" />
        </button>

        <button 
          onClick={() => setActiveModal('login')}
          className="bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {t('login')}
        </button>

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
    </header>
  );
}
