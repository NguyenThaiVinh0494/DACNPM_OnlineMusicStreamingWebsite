import { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [view, setView] = useState('login');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    const success = await login(username, password);
    if (success) {
      onClose();
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Vui lòng nhập email!');
      return;
    }
    toast.success('Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn!');
    setView('login');
    setForgotEmail('');
  };

  const resetModal = () => {
    setView('login');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[450px] bg-white dark:bg-[#222222] rounded-xl p-8 shadow-2xl relative border border-gray-200 dark:border-white/10 transition-colors duration-300">
        <button 
          onClick={resetModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {view === 'login' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('login')}</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Nhập email của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400"
            />
          </div>

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={t('enter_password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex justify-between items-center mt-4 mb-8 text-sm">
            <button 
              type="button" 
              onClick={() => setView('forgot')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('forgot_password')}
            </button>
            <span className="text-gray-500 dark:text-gray-400">
              {t('no_account')} <button type="button" onClick={onSwitchToRegister} className="text-green-500 dark:text-cyan-400 font-bold hover:text-green-600 dark:hover:text-cyan-300 transition-colors">{t('register')}</button>
            </span>
          </div>

          <button type="submit" className="w-full bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-bold py-3.5 rounded-full transition-colors text-lg mb-8 shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer">
            {t('login')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('or_login_with')}</span>
          <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
        </div>

        <button className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-[#333333] dark:hover:bg-[#444444] text-gray-900 dark:text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-3 transition-colors border border-gray-200 dark:border-white/5 cursor-pointer">
          <FcGoogle className="w-6 h-6" />
          <span className="text-[15px]">Google</span>
        </button>
        </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quên mật khẩu</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Vui lòng nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3.5 outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-cyan-400 transition-all border border-gray-200 dark:border-transparent focus:border-green-500 dark:focus:border-cyan-400"
                />
              </div>

              <button type="submit" className="w-full bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-bold py-3.5 rounded-full transition-colors text-lg mt-4 shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer">
                Gửi yêu cầu
              </button>

              <button 
                type="button" 
                onClick={() => setView('login')}
                className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-full transition-colors mt-2"
              >
                Quay lại đăng nhập
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
