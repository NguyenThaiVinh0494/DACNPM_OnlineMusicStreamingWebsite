import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMoreHorizontal, FiPlus, FiShuffle, FiRepeat, FiVolume2, FiVolumeX, FiList, FiMusic, FiMic } from "react-icons/fi";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import { useMusic } from "../../context/MusicContext";
import { useClickOutside } from "../../hooks/useClickOutside";

// Utility to format time (seconds to mm:ss)
const formatTime = (time) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function PlayerBar() {
  const { 
    currentSong, isPlaying, togglePlay, playNext, playPrev, 
    toggleFavorite, favorites, recordSongListen, playbackSessionId,
    isShuffle, repeatMode, toggleShuffle, toggleRepeat,
    audioRef, isLyricsOpen, toggleLyrics, isQueueOpen, toggleQueue,
    openAddToPlaylistModal
  } = useMusic();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const listenProgressRef = useRef({
    songId: null,
    sessionId: null,
    recorded: false,
    accumulated: 0,
    lastTime: 0,
  });

  useClickOutside(moreMenuRef, () => setIsMoreMenuOpen(false));

  const resetListenProgress = useCallback(() => {
    listenProgressRef.current = {
      songId: currentSong?.id || null,
      sessionId: playbackSessionId,
      recorded: false,
      accumulated: 0,
      lastTime: audioRef.current?.currentTime || 0,
    };
  }, [audioRef, currentSong?.id, playbackSessionId]);

  // Sync audio play/pause with Context
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Auto-play prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, audioRef]);

  useEffect(() => {
    resetListenProgress();
  }, [resetListenProgress]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const nextTime = audioRef.current.currentTime;
      setCurrentTime(nextTime);

      if (!currentSong || listenProgressRef.current.recorded) {
        listenProgressRef.current.lastTime = nextTime;
        return;
      }

      if (listenProgressRef.current.songId !== currentSong.id || listenProgressRef.current.sessionId !== playbackSessionId) {
        resetListenProgress();
      }

      const delta = nextTime - listenProgressRef.current.lastTime;
      if (isPlaying && delta > 0 && delta <= 5) {
        listenProgressRef.current.accumulated += delta;
      }
      listenProgressRef.current.lastTime = nextTime;

      if (listenProgressRef.current.accumulated >= 10) {
        listenProgressRef.current.recorded = true;
        recordSongListen(currentSong);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    // If repeat one, just replay
    if (repeatMode === 2) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        resetListenProgress();
        audioRef.current.play();
      }
    } else {
      playNext(true); // Pass true to indicate autoPlay
    }
  };

  const handleSeek = (e) => {
    if (!currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    if (!currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
    setIsMuted(false);
  };

  const isFav = currentSong && favorites.some(s => s.id === currentSong.id);

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Repeat button icon logic
  const getRepeatIcon = () => {
    if (repeatMode === 2) {
      return (
        <div className="relative text-nct-primary flex items-center justify-center">
          <FiRepeat className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-white dark:bg-[#1e1e1e] rounded-full w-3 h-3 flex items-center justify-center border border-nct-primary/30">1</span>
        </div>
      );
    }
    return <FiRepeat className={`w-4 h-4 ${repeatMode === 1 ? 'text-nct-primary' : ''}`} />;
  };

  return (
    <div className={`h-20 md:h-24 px-4 md:px-6 flex items-center justify-between transition-colors duration-300 z-[60] relative ${isLyricsOpen ? 'bg-transparent border-t-0 dark' : !currentSong ? 'bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-white/5' : 'bg-white dark:!bg-nct-player border-t border-gray-200 dark:border-white/5'}`}>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={currentSong?.audioUrl || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Left: Song Info */}
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-[30%]">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center transition-all ${currentSong ? 'bg-gray-100 dark:bg-white/10' : 'bg-gray-200 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10'}`}>
          {currentSong ? (
            <img 
              src={currentSong.image} 
              alt={currentSong.title} 
              className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <FiMusic className="w-5 h-5 md:w-6 md:h-6 text-gray-400 dark:text-white/20" />
          )}
        </div>
        <div className="flex flex-col truncate flex-1 md:flex-none">
          {currentSong ? (
            <Link to={`/song/${currentSong.id}`} className="font-medium text-sm truncate text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
              {currentSong.title}
            </Link>
          ) : (
            <h4 className="font-medium text-sm truncate text-gray-400 dark:text-nct-text-dim/50 select-none">Chưa chọn bài hát</h4>
          )}
          <p className={`text-xs truncate transition-colors ${currentSong ? 'text-gray-500 dark:text-nct-text-dim hover:text-nct-primary dark:hover:text-nct-primary cursor-pointer hover:underline mt-0.5' : 'text-gray-400 dark:text-nct-text-dim/30 select-none mt-0.5'}`}>
            {currentSong ? currentSong.artist : "-"}
          </p>
        </div>
        {currentSong && (
          <div className="hidden md:flex items-center gap-3 ml-2 text-gray-500 dark:text-nct-text-dim">
            <button type="button" onClick={() => toggleFavorite(currentSong)} aria-label="Thêm vào yêu thích" className={`${isFav ? 'text-nct-primary' : 'hover:text-red-500'} transition-colors`}>
              <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                aria-label="Thêm tùy chọn"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiMoreHorizontal className="w-4 h-4" />
              </button>
              {isMoreMenuOpen ? (
                <div className="absolute bottom-8 left-0 z-[80] w-48 rounded-xl border border-gray-200 bg-white p-1.5 text-gray-700 shadow-2xl dark:border-white/10 dark:bg-[#242424] dark:text-white">
                  <button
                    type="button"
                    onClick={() => {
                      openAddToPlaylistModal(currentSong);
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <FiPlus className="h-4 w-4" />
                    Thêm vào playlist
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Mobile quick controls (hidden on desktop) */}
        {currentSong && (
          <div className="flex md:hidden items-center gap-4 text-gray-900 dark:text-white ml-auto">
            <button aria-label="Phát nhạc" onClick={togglePlay} className="p-2 bg-nct-primary text-white rounded-full shadow-lg">
              {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3 ml-0.5" />}
            </button>
            <button aria-label="Tiếp theo" onClick={() => playNext()} className="p-2">
              <FaStepForward className="w-4 h-4 text-gray-700 dark:text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Controls (Hidden on Mobile) */}
      <div className={`hidden md:flex flex-col items-center justify-center gap-2 w-[40%] max-w-[500px] transition-opacity duration-300 ${!currentSong ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
        <div className="flex items-center gap-6">
          <button aria-label="Phát ngẫu nhiên" onClick={toggleShuffle} className={`transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 ${isShuffle ? 'text-nct-primary' : 'text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white'}`}>
            <FiShuffle className="w-4 h-4" />
          </button>
          <button aria-label="Bài trước" onClick={playPrev} className="text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
            <FaStepBackward className="w-4 h-4" />
          </button>
          <button aria-label="Phát nhạc" onClick={togglePlay} className="w-10 h-10 rounded-full bg-nct-primary dark:bg-white flex items-center justify-center text-white dark:text-black hover:scale-105 transition-transform shadow-lg shadow-nct-primary/20 dark:shadow-white/10 active:scale-95">
            {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4 ml-0.5" />}
          </button>
          <button aria-label="Bài tiếp" onClick={() => playNext()} className="text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
            <FaStepForward className="w-4 h-4" />
          </button>
          <button aria-label="Lặp lại" onClick={toggleRepeat} className={`transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 ${repeatMode !== 0 ? 'text-nct-primary' : 'text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white'}`}>
            {getRepeatIcon()}
          </button>
        </div>
        <div className="w-full flex items-center gap-3 text-[11px] text-gray-500 dark:text-nct-text-dim font-medium tracking-wider">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10 rounded-full cursor-pointer group relative overflow-hidden md:overflow-visible" onClick={handleSeek}>
            {/* Progress Track */}
            <div className="h-full bg-nct-primary dark:bg-nct-primary rounded-full group-hover:bg-[#2591c4] dark:group-hover:bg-nct-primary/80 relative transition-all duration-100" style={{ width: `${progressPercent}%` }}>
              {/* Thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white dark:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-transparent z-10"></div>
            </div>
          </div>
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Actions (Hidden on Mobile) */}
      <div className={`hidden md:flex items-center justify-end gap-4 w-[30%] text-gray-500 dark:text-nct-text-dim transition-opacity duration-300 ${!currentSong ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 group w-24">
          <button aria-label="Âm lượng" onClick={() => setIsMuted(!isMuted)} className="hover:text-gray-900 dark:hover:text-white transition-colors p-1.5">
            {isMuted || volume === 0 ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
          </button>
          <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10 rounded-full cursor-pointer relative" onClick={handleVolumeChange}>
            <div className="h-full bg-gray-900 dark:bg-white rounded-full group-hover:bg-nct-primary dark:group-hover:bg-nct-primary transition-all duration-100" style={{ width: `${volumePercent}%` }}>
               <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-transparent"></div>
            </div>
          </div>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-1"></div>
        <button 
          aria-label="Lời bài hát" 
          onClick={toggleLyrics}
          className={`transition-colors p-2 rounded-lg ${isLyricsOpen ? 'bg-nct-primary/10 dark:bg-nct-primary/20 text-nct-primary' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-nct-primary dark:hover:text-nct-primary'}`}
        >
          <FiMic className="w-4 h-4" />
        </button>
        <button 
          aria-label="Danh sách phát" 
          onClick={toggleQueue}
          className={`transition-colors p-2 rounded-lg ${isQueueOpen ? 'bg-nct-primary/10 dark:bg-nct-primary/20 text-nct-primary' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-nct-primary dark:hover:text-nct-primary'}`}
        >
          <FiList className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
