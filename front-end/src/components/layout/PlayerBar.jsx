import { FiHeart, FiMoreHorizontal, FiShuffle, FiRepeat, FiVolume2, FiList } from "react-icons/fi";
import { FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";

export default function PlayerBar() {
  return (
    <div className="h-24 bg-white dark:!bg-nct-player border-t border-gray-200 dark:border-white/5 px-6 flex items-center justify-between transition-colors duration-300">
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop" 
            alt="Song Cover" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col truncate">
          <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate hover:text-nct-primary dark:hover:text-nct-primary cursor-pointer">NGÁO NGƠ</h4>
          <p className="text-gray-500 dark:text-nct-text-dim text-xs truncate hover:text-nct-primary dark:hover:text-nct-primary cursor-pointer hover:underline">
            HIEUTHUHAI, ERIK, Anh Tú Atus
          </p>
        </div>
        <div className="flex items-center gap-3 ml-2 text-gray-500 dark:text-nct-text-dim">
          <button className="hover:text-gray-900 dark:hover:text-white transition-colors"><FiHeart className="w-4 h-4" /></button>
          <button className="hover:text-gray-900 dark:hover:text-white transition-colors"><FiMoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center gap-2 w-[40%] max-w-[500px]">
        <div className="flex items-center gap-6">
          <button className="text-gray-500 dark:text-nct-text-dim hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
            <FiShuffle className="w-4 h-4" />
          </button>
          <button className="text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
            <FaStepBackward className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-nct-primary dark:bg-white flex items-center justify-center text-white dark:text-black hover:scale-105 transition-transform">
            <FaPlay className="w-4 h-4 ml-0.5" />
          </button>
          <button className="text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
            <FaStepForward className="w-4 h-4" />
          </button>
          <button className="text-gray-500 dark:text-nct-text-dim hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
            <FiRepeat className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-[10px] text-gray-500 dark:text-nct-text-dim font-medium">
          <span>00:00</span>
          <div className="h-1 flex-1 bg-gray-200 dark:bg-white/10 rounded-full cursor-pointer group">
            <div className="h-full w-1/3 bg-nct-primary dark:bg-nct-primary rounded-full group-hover:bg-[#2591c4] dark:group-hover:bg-nct-primary/80 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-transparent"></div>
            </div>
          </div>
          <span>03:45</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-4 w-[30%] text-gray-500 dark:text-nct-text-dim">
        <div className="text-[10px] font-bold border border-gray-300 dark:border-white/20 px-1.5 py-0.5 rounded cursor-pointer hover:border-gray-500 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
          128 kbps
        </div>
        <div className="flex items-center gap-2 group">
          <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
            <FiVolume2 className="w-5 h-5" />
          </button>
          <div className="w-20 h-1 bg-gray-200 dark:bg-white/10 rounded-full cursor-pointer hidden md:block">
            <div className="h-full w-2/3 bg-gray-900 dark:bg-white rounded-full group-hover:bg-nct-primary dark:group-hover:bg-nct-primary"></div>
          </div>
        </div>
        <button className="hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-white/5 rounded">
          <FiList className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}