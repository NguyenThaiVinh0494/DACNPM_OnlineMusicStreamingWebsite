import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlay, FiTrash2 } from "react-icons/fi";
import { FaPlay, FaPause } from "react-icons/fa";
import { useMusic } from "../../context/MusicContext";

export default function QueueDrawer() {
  const { 
    isQueueOpen, 
    toggleQueue, 
    queue, 
    currentSong, 
    isPlaying, 
    togglePlay,
    jumpToQueueIndex
  } = useMusic();

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>


          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-20 md:bottom-24 w-full md:w-[350px] lg:w-[400px] z-[70] bg-white dark:bg-[#181818] shadow-2xl flex flex-col border-l border-gray-200 dark:border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Danh sách phát</h2>
              <button 
                onClick={toggleQueue}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
              
              {/* Currently Playing */}
              {currentSong && (
                <div className="mb-6 px-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Đang phát</h3>
                  <div className="flex items-center gap-3 p-2.5 bg-nct-primary/10 dark:bg-nct-primary/20 rounded-xl">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={currentSong.image} 
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button 
                          onClick={togglePlay}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center backdrop-blur-sm transition-colors text-white"
                        >
                          {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3 ml-0.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-nct-primary truncate">
                        {currentSong.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
                        {currentSong.artist}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6">
                      {isPlaying && (
                        <div className="flex items-end justify-center gap-[2px] h-3 w-4">
                          <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-nct-primary rounded-t" />
                          <motion.div animate={{ height: ["8px", "4px", "10px", "8px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-nct-primary rounded-t" />
                          <motion.div animate={{ height: ["6px", "10px", "4px", "6px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-nct-primary rounded-t" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next in Queue */}
              {queue.length > 0 && (
                <div className="px-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiếp theo ({queue.length})</h3>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {queue.map((song, index) => {
                      const isCurrentInQueue = currentSong && song.id === currentSong.id;
                      
                      return (
                        <div 
                          key={`${song.id}-${index}`}
                          onClick={() => jumpToQueueIndex(index)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors group ${
                            isCurrentInQueue 
                              ? 'bg-gray-100 dark:bg-white/5' 
                              : 'hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={song.image} 
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            {!isCurrentInQueue && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <FiPlay className="w-4 h-4 text-white fill-white ml-0.5" />
                              </div>
                            )}
                            {isCurrentInQueue && isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                <FaPause className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isCurrentInQueue ? 'font-semibold text-nct-primary' : 'font-medium text-gray-900 dark:text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {queue.length === 0 && !currentSong && (
                <div className="h-40 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <FiTrash2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách phát đang trống</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
