import { FiFlag } from "react-icons/fi";

export default function AlbumActionMenu() {
  return (
    <div className="absolute left-0 top-full mt-2 w-[180px] bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5 rounded-lg shadow-2xl z-[100] overflow-hidden py-1 text-gray-700 dark:text-[#b3b3b3]">
      <button 
        className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-nct-primary dark:hover:text-white text-[13px] text-left flex items-center gap-3 transition-colors"
      >
        <FiFlag className="w-4 h-4" />
        <span>Báo cáo</span>
      </button>
    </div>
  );
}
