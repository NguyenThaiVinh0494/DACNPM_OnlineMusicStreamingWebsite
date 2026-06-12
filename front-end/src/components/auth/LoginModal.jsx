import { useState, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const inputClass = (hasError, extra = '') => `w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none transition-all border ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400'
  } ${extra}`;

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailAddress = email.trim();
    const errors = {};
    if (!emailAddress) errors.email = true;
    if (!password) errors.password = true;

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      if (errors.email) {
        emailRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    const loggedInUser = await login(emailAddress, password);

    if (loggedInUser?.vai_tro === 'ADMIN') {
      const adminDashboardTab = window.open('/admin', '_blank');
      if (adminDashboardTab) {
        adminDashboardTab.focus();
      } else {
        toast.error('Trình duyệt đã chặn tab admin mới. Hãy cho phép popup cho trang này rồi đăng nhập lại.');
      }
    }

    if (loggedInUser) {
      handleClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[450px] bg-white dark:bg-[#222222] rounded-xl p-8 shadow-2xl relative border border-gray-200 dark:border-white/10 transition-colors duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('login')}</h2>

        <form noValidate onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              ref={emailRef}
              type="email" 
              placeholder={t('enter_email')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              autoComplete="email"
              className={inputClass(fieldErrors.email)}
            />
          </div>

          <div className="relative">
            <input 
              ref={passwordRef}
              type={showPassword ? "text" : "password"} 
              placeholder={t('enter_password')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              autoComplete="current-password"
              className={inputClass(fieldErrors.password, 'pr-12')}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end items-center mt-4 mb-8 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {t('no_account')} <button type="button" onClick={onSwitchToRegister} className="text-green-500 dark:text-cyan-400 font-bold hover:text-green-600 dark:hover:text-cyan-300 transition-colors">{t('register')}</button>
            </span>
          </div>

          <button type="submit" className="w-full bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-bold py-3.5 rounded-full transition-colors text-lg shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer">
            {t('login')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
