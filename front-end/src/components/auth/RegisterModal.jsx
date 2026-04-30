import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[450px] bg-white dark:bg-[#222222] rounded-xl p-8 shadow-2xl relative border border-gray-200 dark:border-white/10 transition-colors duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('register')}</h2>

        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder={t('enter_username')}
              className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400"
            />
          </div>

          <div>
            <input 
              type="text" 
              placeholder={t('enter_email')}
              className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400"
            />
          </div>

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={t('enter_password')}
              className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400 pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder={t('confirm_password')}
              className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400 pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center mt-4 mb-8 text-sm">
          <span className="text-gray-500 dark:text-gray-400 w-full text-center">
            {t('has_account')} <button onClick={onSwitchToLogin} className="text-green-500 dark:text-cyan-400 font-bold hover:text-green-600 dark:hover:text-cyan-300 transition-colors">{t('login')}</button>
          </span>
        </div>

        <button className="w-full bg-green-500 hover:bg-green-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-bold py-3.5 rounded-full transition-colors text-lg mb-8 shadow-[0_0_15px_rgba(34,197,94,0.2)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer">
          {t('register')}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('or_register_with')}</span>
          <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
        </div>

        <button className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-[#333333] dark:hover:bg-[#444444] text-gray-900 dark:text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-3 transition-colors border border-gray-200 dark:border-white/5 cursor-pointer">
          <FcGoogle className="w-6 h-6" />
          <span className="text-[15px]">Google</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
