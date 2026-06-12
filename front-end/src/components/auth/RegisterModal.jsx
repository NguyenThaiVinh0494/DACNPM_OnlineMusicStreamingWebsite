import { useState, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const submissionInProgress = useRef(false);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  const focusFirstInvalidField = (errors) => {
    if (errors.username) usernameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (submissionInProgress.current) {
      return;
    }
    const errors = {};
    if (!username.trim()) errors.username = true;
    if (!email.trim()) errors.email = true;
    if (!password) errors.password = true;
    if (!confirmPassword) errors.confirmPassword = true;

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      focusFirstInvalidField(errors);
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: true });
      toast.error('Mật khẩu xác nhận không khớp!');
      confirmPasswordRef.current?.focus();
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    try {
      const success = await register({ username: username.trim(), email: email.trim(), password });
      if (success) {
        handleClose();
      }
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
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

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('register')}</h2>

        <form noValidate onSubmit={handleRegister} className="space-y-4">
          <div>
            <input 
              ref={usernameRef}
              type="text" 
              placeholder={t('enter_username')}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearFieldError('username');
              }}
              className={inputClass(fieldErrors.username)}
            />
          </div>

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

          <div className="relative">
            <input 
              ref={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"} 
              placeholder={t('confirm_password')}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError('confirmPassword');
              }}
              className={inputClass(fieldErrors.confirmPassword, 'pr-12')}
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-center items-center mt-4 mb-8 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-full text-center">
              {t('has_account')} <button type="button" onClick={onSwitchToLogin} className="text-green-500 dark:text-cyan-400 font-bold hover:text-green-600 dark:hover:text-cyan-300 transition-colors">{t('login')}</button>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white dark:text-black font-bold py-3.5 rounded-full transition-colors text-lg shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer"
          >
            {isSubmitting ? 'Đang đăng ký...' : t('register')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
