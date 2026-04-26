import { NavLink } from "react-router-dom";
import { FiStar, FiUser, FiHeart, FiClock } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbVinyl } from "react-icons/tb";

export default function Sidebar() {
  const mainLinks = [
    { name: "Khám Phá", path: "/", icon: <HiOutlineSparkles className="w-6 h-6" /> },
    { name: "Dành Cho Bạn", path: "/for-you", icon: <FiStar className="w-6 h-6" /> },
    { name: "Của Tui", path: "/my-music", icon: <FiUser className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 bg-nct-surface flex flex-col h-full border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-nct-primary rounded-full flex items-center justify-center">
             <TbVinyl className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight">NCT</span>
            <span className="text-[10px] text-nct-text-dim uppercase tracking-wider">Clone Streaming</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {mainLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-white/10 text-nct-primary"
                  : "text-nct-text-dim hover:text-nct-text hover:bg-white/5"
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 border-t border-white/5 mx-4"></div>

        <div className="px-4 text-xs font-bold text-nct-text-dim uppercase tracking-wider mb-4">
          Thư Viện
        </div>
        <div className="space-y-1">
          <a href="#" className="flex items-center gap-4 px-4 py-2 rounded-lg text-nct-text-dim hover:text-nct-text hover:bg-white/5 font-medium">
            <FiHeart className="w-5 h-5" />
            Bài hát Yêu thích
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-2 rounded-lg text-nct-text-dim hover:text-nct-text hover:bg-white/5 font-medium">
            <FiClock className="w-5 h-5" />
            Nghe gần đây
          </a>
        </div>
      </nav>
    </aside>
  );
}
