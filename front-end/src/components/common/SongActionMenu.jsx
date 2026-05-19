import { FiPlusSquare, FiFlag } from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";

export default function SongActionMenu({ 
  song, 
  onClose
}) {
  const { 
    openAddToPlaylistModal
  } = useMusic();

  const handleAction = (action) => {
    action();
    onClose?.();
  };

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 mt-0 w-[220px] bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-white/5 rounded-lg shadow-2xl z-[100] overflow-hidden py-1.5 text-gray-700 dark:text-white animate-in fade-in zoom-in duration-200">

      <button 
        onClick={() => handleAction(() => openAddToPlaylistModal(song))}
        className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-[13px] text-left flex items-center gap-3 transition-colors"
      >
        <FiPlusSquare className="w-4 h-4" />
        <span>Thêm vào playlist</span>
      </button>

      <div className="h-px bg-gray-200 dark:bg-white/5 my-1.5"></div>

      <button 
        className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-[13px] text-left flex items-center gap-3 transition-colors text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
      >
        <FiFlag className="w-4 h-4" />
        <span>Báo cáo</span>
      </button>
    </div>
  );
}
