import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  const [activeModal, setActiveModal] = useState(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Bạn chưa đăng nhập</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Đăng nhập ngay để khám phá thư viện âm nhạc của riêng bạn, tạo playlist và lưu lại những bài hát yêu thích.
        </p>
        <button 
          onClick={() => setActiveModal('login')}
          className="bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black px-8 py-3 rounded-full font-bold transition-colors shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          Đăng nhập ngay
        </button>

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
      </div>
    );
  }

  return <Outlet />;
}
