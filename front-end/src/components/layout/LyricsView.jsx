import { useEffect, useState, useRef } from "react";
import { FiChevronDown, FiHeart, FiShare2, FiMoreHorizontal, FiMusic } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../../context/MusicContext";

// Parse lời bài hát: hỗ trợ cả LRC ([00:12.00]Lời...) và plain text
function parseLyrics(lyricsText) {
  if (!lyricsText) return [];
  const lines = lyricsText.split('\n');
  const lrcPattern = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  const parsed = [];

  for (const line of lines) {
    const match = line.match(lrcPattern);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3]);
      const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
      if (match[4].trim()) parsed.push({ time, text: match[4].trim() });
    } else if (line.trim()) {
      parsed.push({ time: -1, text: line.trim() });
    }
  }
  return parsed;
}

// Tính opacity dựa trên khoảng cách so với dòng đang hát
function getLineOpacity(index, activeIndex, isPassed) {
  if (index === activeIndex) return 1;
  const distance = Math.abs(index - activeIndex);
  if (isPassed) {
    // Dòng đã qua: mờ dần dựa trên khoảng cách
    return Math.max(0.12, 0.45 - distance * 0.08);
  }
  // Dòng chưa đến: mờ đều
  return Math.max(0.15, 0.45 - distance * 0.06);
}

export default function LyricsView() {
  const { currentSong, isLyricsOpen, toggleLyrics, audioRef } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const lineRefs = useRef([]);
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

  const lyrics = parseLyrics(currentSong?.lyrics);
  const isLRC = lyrics.length > 0 && lyrics[0].time !== -1;

  // Find active line index
  const activeLineIndex = isLRC
    ? lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
      })
    : -1;

  // Auto-scroll: cuộn câu đang hát về giữa màn hình
  useEffect(() => {
    if (activeLineIndex !== -1 && lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
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
          className="fixed inset-0 z-[55] text-white flex flex-col pb-20 md:pb-24 overflow-hidden"
        >
          {/* ── Blurred Background ─────────────────────────────────────── */}
          {/* Base: màu tối */}
          <div className="absolute inset-0 bg-[#0a0a0f]" />

          {/* Ảnh bìa blur ra background với 2 lớp để tạo chiều sâu */}
          {currentSong?.image && (
            <>
              {/* Lớp 1: blur lớn, opacity thấp — tạo màu sắc nền */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-150 opacity-40 transition-all duration-1000"
                style={{
                  backgroundImage: `url(${currentSong.image})`,
                  filter: 'blur(60px) saturate(180%)',
                }}
              />
              {/* Lớp 2: blur nhỏ hơn, opacity thấp hơn — tạo vignette effect */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 opacity-20"
                style={{
                  backgroundImage: `url(${currentSong.image})`,
                  filter: 'blur(20px) saturate(200%) brightness(0.7)',
                }}
              />
              {/* Overlay gradient để chữ dễ đọc */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </>
          )}

          {/* Nút đóng */}
          <button
            onClick={toggleLyrics}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all z-20 border border-white/10"
          >
            <FiChevronDown className="w-6 h-6" />
          </button>

          {/* ── Main Content ───────────────────────────────────────────── */}
          <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full h-full p-8 md:p-12 gap-8 md:gap-20 overflow-hidden">

            {/* Left: Cover Art & Info */}
            <div className="w-full md:w-5/12 flex flex-col justify-center items-center md:items-end gap-6 h-full">
              {/* Album art với hiệu ứng glow */}
              <div className="relative w-full max-w-[380px]">
                {/* Glow effect dưới ảnh bìa */}
                {currentSong?.image && (
                  <div
                    className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl"
                    style={{
                      backgroundImage: `url(${currentSong.image})`,
                      backgroundSize: 'cover',
                      filter: 'blur(30px) saturate(200%)',
                    }}
                  />
                )}
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/5 flex items-center justify-center group border border-white/10">
                  {currentSong ? (
                    <img
                      src={currentSong.image}
                      alt={currentSong.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <FiMusic className="w-32 h-32 text-white/20" />
                  )}
                </div>
              </div>

              {/* Song info */}
              <div className="w-full max-w-[380px] text-center md:text-right">
                <h2 className="text-3xl font-bold mb-1 truncate drop-shadow-lg">
                  {currentSong?.title || "Chưa có bài hát"}
                </h2>
                <p className="text-lg text-white/60 mb-5 truncate">
                  {currentSong?.artist || "-"}
                </p>
                <div className="flex items-center gap-4 text-white/50">
                  <button className="hover:text-white hover:scale-110 transition-all p-2 rounded-full hover:bg-white/10">
                    <FiHeart className="w-5 h-5" />
                  </button>
                  <button className="hover:text-white hover:scale-110 transition-all p-2 rounded-full hover:bg-white/10">
                    <FiShare2 className="w-5 h-5" />
                  </button>
                  <button className="hover:text-white hover:scale-110 transition-all p-2 rounded-full hover:bg-white/10 ml-auto">
                    <FiMoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Lyrics ─────────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="w-full md:w-7/12 h-full overflow-y-auto hide-scrollbar pl-4 pr-8 relative"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
              }}
            >
              {lyrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                  <FiMusic className="w-16 h-16" />
                  <p className="text-lg font-medium">Chưa có lời bài hát</p>
                </div>
              ) : (
                <div className="py-[40vh] lyrics-container flex flex-col">
                  {lyrics.map((line, index) => {
                    const isActive = isLRC && index === activeLineIndex;
                    const isPassed = isLRC && index < activeLineIndex;
                    const opacity = isLRC ? getLineOpacity(index, activeLineIndex, isPassed) : 0.8;

                    return (
                      <motion.p
                        key={`${currentSong?.id}-${index}`}
                        ref={el => lineRefs.current[index] = el}
                        animate={{
                          scale: isActive ? 1.07 : 1,
                          opacity: opacity,
                          // Blur: dòng cách xa thì bị blur, dòng active thì rõ nhất
                          filter: isActive
                            ? 'blur(0px) brightness(1.3)'
                            : isPassed
                              ? `blur(${Math.min(2, (activeLineIndex - index) * 0.5)}px) brightness(0.9)`
                              : `blur(${Math.min(1.5, (index - activeLineIndex) * 0.4)}px)`,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className={`font-bold mb-7 cursor-default origin-center leading-snug select-none
                          ${isActive
                            ? 'text-white text-3xl md:text-4xl'
                            : 'text-white/80 text-2xl md:text-3xl'
                          }
                        `}
                        onClick={() => {
                          // Click vào dòng bất kỳ để nhảy đến đoạn đó
                          if (isLRC && audioRef.current) {
                            audioRef.current.currentTime = line.time;
                          }
                        }}
                        style={{ cursor: isLRC ? 'pointer' : 'default' }}
                        whileHover={isLRC ? { opacity: 1, scale: isActive ? 1.07 : 1.02 } : {}}
                      >
                        {/* Gradient text cho dòng active */}
                        {isActive ? (
                          <span
                            style={{
                              background: 'linear-gradient(90deg, #ffffff 0%, #e0e0ff 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {line.text}
                          </span>
                        ) : line.text}
                      </motion.p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
