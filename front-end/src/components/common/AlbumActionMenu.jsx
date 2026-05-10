import { FiShare2, FiFlag, FiChevronRight } from "react-icons/fi";

export default function AlbumActionMenu({ 
  onClose, 
}) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[180px] bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5 rounded-lg shadow-2xl z-[100] overflow-hidden py-1 text-gray-700 dark:text-[#b3b3b3]">
      <button 
        className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-nct-primary dark:hover:text-white text-[13px] text-left flex items-center justify-between transition-colors group"
      >
        <div className="flex items-center gap-3">
          <FiShare2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </div>
        <FiChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
      </button>
      
      <button 
        className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-nct-primary dark:hover:text-white text-[13px] text-left flex items-center gap-3 transition-colors"
      >
        <FiFlag className="w-4 h-4" />
        <span>Báo cáo</span>
      </button>
    </div>
  );
}
