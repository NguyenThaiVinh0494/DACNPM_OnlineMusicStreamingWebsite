import { useEffect, useState, useRef } from "react";
import { FiChevronDown, FiHeart, FiShare2, FiMoreHorizontal, FiMusic } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../../context/MusicContext";
import { MOCK_LYRICS } from "../../data/mockLyrics";

export default function LyricsView() {
  const { currentSong, isLyricsOpen, toggleLyrics, audioRef } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const scrollRef = useRef(null);

  // Sync currentTime using requestAnimationFrame for smooth updates
  useEffect(() => {
    let animationFrameId;
    const updateTime = () => {
      if (audioRef.current && isLyricsOpen) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };
    if (isLyricsOpen) {
      animationFrameId = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLyricsOpen, audioRef]);

  // Find active line index for highlighting
  const activeLineIndex = MOCK_LYRICS.findIndex((line, index) => {
    const nextLine = MOCK_LYRICS[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current && activeLineIndex !== -1) {
      const activeElement = scrollRef.current.children[0].children[activeLineIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex]);

  return (
    <AnimatePresence>
      {isLyricsOpen && (
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[55] bg-nct-bg text-white flex flex-col pb-20 md:pb-24 overflow-hidden"
        >
          {/* Blurred Background */}
          {currentSong && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-125"
                style={{ backgroundImage: `url(${currentSong.image})`, filter: 'blur(80px)' }}
              />
              {/* Dark overlay to ensure text readability */}
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}

          {/* Top right close button */}
          <button 
            onClick={toggleLyrics}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
          >
            <FiChevronDown className="w-6 h-6" />
          </button>

          <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full h-full p-8 md:p-12 gap-12 overflow-hidden">
            {/* Left Side: Cover Art & Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-center gap-6 h-full">
              <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0 bg-white/5 flex items-center justify-center relative group">
                {currentSong ? (
                  <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <FiMusic className="w-32 h-32 text-white/20" />
                )}
              </div>
              <div className="w-full max-w-[400px] mx-auto md:mx-0">
                <h2 className="text-3xl font-bold mb-1 truncate">{currentSong?.title || "Chưa có bài hát"}</h2>
                <p className="text-lg text-white/70 mb-4 truncate">{currentSong?.artist || "-"}</p>
                <div className="flex items-center gap-4 text-white/70">
                  <button className="hover:text-white transition-colors flex items-center gap-2">
                    <FiHeart className="w-5 h-5" />
                    <span className="text-sm font-medium">19764</span>
                  </button>
                  <button className="hover:text-white transition-colors flex items-center gap-2">
                    <FiShare2 className="w-5 h-5" />
                    <span className="text-sm font-medium">430</span>
                  </button>
                  <button className="hover:text-white transition-colors ml-auto">
                    <FiMoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Lyrics */}
            <div 
              className="w-full md:w-1/2 h-full overflow-y-auto overflow-x-hidden hide-scrollbar pr-4 relative"
              ref={scrollRef}
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
              }}
            >
              <div className="py-[40vh]">
                {MOCK_LYRICS.map((line, index) => {
                  const isActive = index === activeLineIndex;
                  const isPassed = index < activeLineIndex;
                  return (
                    <p 
                      key={index}
                      className={`text-2xl md:text-3xl font-bold mb-8 transition-all duration-500 ease-out cursor-default ${
                        isActive 
                          ? 'text-white scale-105 origin-left shadow-white/20 drop-shadow-lg' 
                          : isPassed 
                            ? 'text-white/40' 
                            : 'text-white/40'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
