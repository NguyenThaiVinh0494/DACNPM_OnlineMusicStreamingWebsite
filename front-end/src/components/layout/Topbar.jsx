import { FiSearch, FiChevronLeft, FiChevronRight, FiUpload, FiSettings } from "react-icons/fi";
import { BiCrown } from "react-icons/bi";
import { IoTicketOutline } from "react-icons/io5";

export default function Topbar() {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-nct-bg/90 backdrop-blur-md sticky top-0 z-10">
      {/* Left section: Navigation & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-nct-text-dim">
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-nct-text-dim group-focus-within:text-white w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
            className="bg-white/10 text-white placeholder-nct-text-dim rounded-full py-2.5 pl-12 pr-4 w-[400px] outline-none focus:bg-white/15 transition-all"
          />
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
          <FiUpload className="w-5 h-5" />
        </button>
        
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full text-sm font-medium transition-colors">
          <IoTicketOutline className="w-5 h-5 text-yellow-400" />
          Nhập code
        </button>
        
        <button className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-full text-sm font-bold transition-colors">
          <BiCrown className="w-5 h-5" />
          Trung tâm VIP
        </button>

        <button className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity">
          V
        </button>

        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
          <FiSettings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
