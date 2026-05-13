import { useState, useContext } from 'react';
import { FiHeart, FiClock, FiUpload, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import ProfileModal from '../../components/auth/ProfileModal';

export default function MyMusic() {
  const { user } = useContext(AuthContext);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Dùng trực tiếp username theo yêu cầu
  const displayName = user?.username || 'User';

  return (
    <div className="w-full flex flex-col pt-6 pb-20">
      
      {/* 1. User Profile Header */}
      <div className="flex items-center gap-6 mb-12 px-2">
        {/* Avatar */}
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt="avatar" 
            className="w-[100px] h-[100px] rounded-full object-cover shadow-lg border border-gray-200 dark:border-white/10"
          />
        ) : (
          <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[42px] font-normal shrink-0 shadow-lg uppercase">
            {displayName?.[0] || 'U'}
          </div>
        )}
        
        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2.5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayName}
            </h2>
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500">|</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID: {user?.id || 'Unknown'}</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full ml-1">
              Miễn phí
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500 dark:text-gray-400">
            <span>Đang theo dõi <span className="text-gray-900 dark:text-white font-bold ml-1 text-sm">0</span></span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            <span>Người theo dõi <span className="text-gray-900 dark:text-white font-bold ml-1 text-sm">0</span></span>
          </div>
        </div>
      </div>

      {/* 2. Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-2">
        
        {/* Yêu Thích */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#2b332f] rounded-xl p-4 border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#343e39] transition-colors group shadow-sm">
          <div className="w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
            <FiHeart className="text-white text-2xl fill-white" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Yêu Thích</h3>
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">0 bài hát</span>
          </div>
        </div>

        {/* Nghe gần đây */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#2b332f] rounded-xl p-4 border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#343e39] transition-colors group shadow-sm">
          <div className="w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
            <FiClock className="text-white text-[26px]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Nghe gần đây</h3>
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">5 bài hát</span>
          </div>
        </div>

        {/* Đã tải lên */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#2b332f] rounded-xl p-4 border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#343e39] transition-colors group shadow-sm">
          <div className="w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
            <FiUpload className="text-white text-[22px] stroke-[2.5]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Đã tải lên</h3>
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">0 bài hát • 0 video</span>
          </div>
        </div>

      </div>

      {/* 3. Playlist đã tạo */}
      <div className="px-2">
        {/* Title */}
        <div className="flex items-center gap-3 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Playlist đã tạo (0)</h2>
          <button className="w-6 h-6 rounded-full border-[1.5px] border-gray-400 dark:border-gray-400 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-colors cursor-pointer group">
            <FiPlus className="text-sm group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center w-full mt-4">
          
          {/* 3D Glowing Box SVG */}
          <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-teal-400/20 dark:bg-teal-400/10 blur-[30px] rounded-full mix-blend-screen"></div>
            
            <svg width="100" height="100" viewBox="0 0 100 100" className="z-10 relative drop-shadow-[0_10px_20px_rgba(20,184,166,0.2)]">
              <defs>
                <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#99f6e4" />   {/* teal-200 */}
                  <stop offset="100%" stopColor="#14b8a6" /> {/* teal-500 */}
                </linearGradient>
                <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4" />   {/* teal-300 */}
                  <stop offset="100%" stopColor="#0f766e" /> {/* teal-700 */}
                </linearGradient>
                <linearGradient id="boxInside" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#115e59" />   {/* teal-800 */}
                  <stop offset="100%" stopColor="#042f2e" /> {/* teal-950 */}
                </linearGradient>
              </defs>
              
              {/* Back Inside Depth */}
              <polygon points="50,25 80,40 50,55 20,40" fill="url(#boxInside)"/>
              
              {/* Left Flap */}
              <polygon points="20,40 30,25 60,40 50,55" fill="#ccfbf1" opacity="0.9"/> {/* teal-50 */}
              
              {/* Right Flap */}
              <polygon points="80,40 70,25 40,40 50,55" fill="#f0fdfa" opacity="0.95"/> {/* teal-50 */}
              
              {/* Left Side Body */}
              <polygon points="20,40 50,55 50,85 20,70" fill="url(#boxFront)"/>
              
              {/* Right Side Body */}
              <polygon points="50,55 80,40 80,70 50,85" fill="url(#boxSide)"/>
            </svg>
          </div>
          
          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">Danh sách playlist chưa có</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Hãy tạo playlist đầu tiên của bạn.</p>
          
          <button className="px-6 py-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-semibold rounded-full transition-colors">
            Tạo playlist
          </button>

        </div>
      </div>

    </div>
  );
}
