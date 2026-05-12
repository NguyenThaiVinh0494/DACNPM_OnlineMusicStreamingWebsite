import { useState, useEffect, useRef } from "react";
import { FiHeart, FiMoreHorizontal, FiArrowUp, FiArrowDown, FiMessageCircle, FiShare2, FiPlay, FiPause, FiDownload, FiPlus, FiFlag, FiChevronRight, FiFacebook, FiLink } from "react-icons/fi";
import OnboardingModal from "../components/layout/OnboardingModal";

// Mock data
const mockForYouData = [
  {
    id: 101,
    title: "Chạy Ngay Đi",
    artist: "Sơn Tùng M-TP",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    uploaderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    likes: "1.2M",
    comments: "45K",
    shares: "12K",
    isLiked: false,
    lyrics: [
      { time: 0, text: "Chạy ngay đi trước khi" },
      { time: 3, text: "Mọi điều dần tồi tệ hơn" },
      { time: 6, text: "Chạy ngay đi trước khi" },
      { time: 9, text: "Lòng hận thù cuộn tròn trong sương" },
      { time: 12, text: "Không còn ai, không còn ai" },
      { time: 15, text: "Sót thương, xót thương" },
      { time: 18, text: "Cho một kẻ ngu khờ" },
      { time: 21, text: "Nhắm mắt đâm đầu vào yêu thương" }
    ]
  },
  {
    id: 102,
    title: "Kẻ Cắp Gặp Bà Già",
    artist: "Hoàng Thùy Linh",
    cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5f529db?w=500&h=500&fit=crop",
    image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f529db?w=500&h=500&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    uploaderAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
    likes: "2.5M",
    comments: "89K",
    shares: "34K",
    isLiked: true,
    lyrics: [
      { time: 0, text: "Kẻ cắp gặp bà già" },
      { time: 3, text: "Tưởng rằng mình cao tay" },
      { time: 6, text: "Kẻ cắp gặp bà già" },
      { time: 10, text: "Lại gặp phải cô nương này" },
      { time: 13, text: "Ai là người chiến thắng" },
      { time: 16, text: "Sau bao nhiêu chiêu trò" },
      { time: 20, text: "Cuối cùng thì cũng biết" },
      { time: 22, text: "Tình yêu không đắn đo" }
    ]
  },
  {
    id: 103,
    title: "Nàng Thơ",
    artist: "Hoàng Dũng",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    uploaderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    likes: "800K",
    comments: "20K",
    shares: "5K",
    isLiked: false,
    lyrics: [
      { time: 0, text: "Em, ngày em đánh rơi nụ cười vào anh" },
      { time: 4, text: "Có nghĩ sau này em sẽ chờ" },
      { time: 8, text: "Và vô tư cho đi hết những ngây thơ" },
      { time: 12, text: "Anh, một người hát mãi những điều mong manh" },
      { time: 16, text: "Lang thang tìm niềm vui đã lỡ" },
      { time: 20, text: "Chẳng buồn dặn lòng quên hết những chơ vơ" }
    ]
  }
];

import { useMusic } from "../context/MusicContext";

export default function ForYou() {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const menuRef = useRef(null);

  // Derive current index from global song state
  let derivedIndex = mockForYouData.findIndex(s => s.id === currentSong?.id);
  if (derivedIndex === -1) derivedIndex = 0;
  
  const currentItem = mockForYouData[derivedIndex];
  const lyricContainerRef = useRef(null);
  const lyricRefs = useRef([]);

  // Auto-play the first song when opening ForYou if not already playing a ForYou song
  useEffect(() => {
    const isPlayingForYou = mockForYouData.some(s => s.id === currentSong?.id);
    if (!isPlayingForYou) {
      playSong(mockForYouData[0], mockForYouData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prevDerivedIndex, setPrevDerivedIndex] = useState(derivedIndex);

  if (derivedIndex !== prevDerivedIndex) {
    setPrevDerivedIndex(derivedIndex);
    setActiveLyricIndex(0);
  }

  // Giả lập lyric chạy theo thời gian
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveLyricIndex((prev) => {
          if (prev < currentItem.lyrics.length - 1) return prev + 1;
          return prev; // Giữ ở câu cuối nếu hết
        });
      }, 3000); // Đổi câu mỗi 3 giây (giả lập)
    }
    return () => clearInterval(interval);
  }, [isPlaying, derivedIndex, currentItem.lyrics.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check onboarding for new users
  useEffect(() => {
    const hasCompleted = localStorage.getItem("onboardingCompleted");
    if (!hasCompleted) {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingCompleted", "true");
  };

  // Cuộn đến lyric đang active
  useEffect(() => {
    if (lyricRefs.current[activeLyricIndex] && lyricContainerRef.current) {
      const lyricElement = lyricRefs.current[activeLyricIndex];
      const container = lyricContainerRef.current;
      
      // Tính toán vị trí cuộn để lyric đang hát nằm ở giữa
      const scrollPosition = lyricElement.offsetTop - container.offsetHeight / 2 + lyricElement.offsetHeight / 2;
      
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeLyricIndex]);

  const handleNext = () => {
    if (derivedIndex < mockForYouData.length - 1) {
      playSong(mockForYouData[derivedIndex + 1], mockForYouData);
    }
  };

  const handlePrev = () => {
    if (derivedIndex > 0) {
      playSong(mockForYouData[derivedIndex - 1], mockForYouData);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col w-full relative">
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 shrink-0 px-2">Dành Cho Bạn</h2>
      
      <div className="flex-1 flex gap-8 h-full relative overflow-hidden">
        
        {/* NỬA TRÁI: IMAGE & ACTIONS */}
        <div className="w-[520px] shrink-0 h-full flex flex-row items-center justify-center gap-6 relative bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/5">
          
          {/* Main Cover Card */}
          <div className="w-[320px] aspect-[4/5] rounded-2xl overflow-hidden relative shadow-2xl group shrink-0">
            <img 
              src={currentItem.cover} 
              alt={currentItem.title}
              className={`w-full h-full object-cover transition-transform duration-[20s] ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
            
            {/* Gradient Overlay for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Play/Pause Overlay Button */}
            <button 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                {isPlaying ? <FiPause className="w-8 h-8" /> : <FiPlay className="w-8 h-8 ml-1" />}
              </div>
            </button>

            {/* Song Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white text-2xl font-bold line-clamp-1">{currentItem.title}</h3>
              <p className="text-gray-300 text-lg">{currentItem.artist}</p>
            </div>
          </div>

          {/* Action & Navigation Group */}
          <div className="flex items-center gap-8 z-20 shrink-0 ml-2">
            {/* Action Buttons (Left column) */}
            <div className="flex flex-col gap-6 items-center">
              {/* Uploader Avatar */}
              <div className="relative group cursor-pointer mb-2">
                <img 
                  src={currentItem.uploaderAvatar} 
                  alt="Uploader" 
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md hover:scale-110 transition-transform"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-nct-primary rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-[#1e1e1e]">
                  +
                </div>
              </div>

              {/* Like */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors shadow-sm">
                  <FiHeart className={`w-6 h-6 ${currentItem.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-700 dark:text-white'}`} />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentItem.likes}</span>
              </button>

              {/* Comments */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors shadow-sm">
                  <FiMessageCircle className="w-6 h-6 text-gray-700 dark:text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentItem.comments}</span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors shadow-sm">
                  <FiShare2 className="w-6 h-6 text-gray-700 dark:text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentItem.shares}</span>
              </button>

              {/* More */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors shadow-sm">
                    <FiMoreHorizontal className="w-6 h-6 text-gray-700 dark:text-white" />
                  </div>
                </button>

                {/* Popup Menu */}
                {showMenu && (
                  <div className="absolute right-[120%] bottom-0 bg-white dark:bg-[#1a221f] border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] w-56 p-1.5 z-50 text-gray-800 dark:text-gray-200">
                    <div className="relative group">
                      <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <FiDownload className="w-4 h-4" /> Tải về
                        </div>
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                      {/* Submenu Download */}
                      <div className="absolute top-0 right-[100%] mr-1 hidden group-hover:block bg-white dark:bg-[#1a221f] border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] w-[250px] p-1.5">
                        <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                          Chất lượng tiêu chuẩn (~3.6MB)
                        </button>
                        <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                          Chất lượng cao (~9.1MB)
                        </button>
                      </div>
                    </div>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                      <FiPlus className="w-4 h-4" /> Thêm vào playlist
                    </button>
                    
                    <div className="relative group">
                      <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <FiShare2 className="w-4 h-4" /> Chia sẻ
                        </div>
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                      {/* Submenu Share */}
                      <div className="absolute top-0 right-[100%] mr-1 hidden group-hover:block bg-white dark:bg-[#1a221f] border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] w-48 p-1.5">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                          <FiFacebook className="w-4 h-4" /> Facebook
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                          <FiLink className="w-4 h-4" /> Sao chép đường dẫn
                        </button>
                      </div>
                    </div>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                      <FiFlag className="w-4 h-4" /> Báo cáo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Arrows (Right column) */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={handlePrev}
                disabled={derivedIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg border
                  ${derivedIndex === 0 
                    ? 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white/80 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 hover:scale-105'}`}
              >
                <FiArrowUp className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNext}
                disabled={derivedIndex === mockForYouData.length - 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg border
                  ${derivedIndex === mockForYouData.length - 1 
                    ? 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white/80 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 hover:scale-105'}`}
              >
                <FiArrowDown className="w-6 h-6" />
              </button>
            </div>
          </div>


        </div>

        {/* NỬA PHẢI: LYRICS */}
        <div className="flex-1 max-w-[600px] mx-auto h-full flex flex-col justify-center relative mask-image-vertical bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/5">
          <div 
            ref={lyricContainerRef}
            className="flex flex-col gap-8 items-center text-center overflow-y-auto hide-scrollbar scroll-smooth py-32 px-12 h-full"
          >
            {currentItem.lyrics.map((line, idx) => (
              <p 
                key={idx}
                ref={el => lyricRefs.current[idx] = el}
                className={`text-4xl leading-tight font-bold transition-all duration-500 cursor-pointer hover:text-nct-primary text-center
                  ${idx === activeLyricIndex 
                    ? 'text-gray-900 dark:text-white scale-105 opacity-100' 
                    : 'text-gray-400 dark:text-gray-600 opacity-30'}`}
                onClick={() => setActiveLyricIndex(idx)}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
