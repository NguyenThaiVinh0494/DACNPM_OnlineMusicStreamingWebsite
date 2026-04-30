import { NavLink } from "react-router-dom";
import { FiStar, FiUser, FiHeart, FiClock } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbVinyl } from "react-icons/tb";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t } = useTranslation();
  const mainLinks = [
    { name: t("discover"), path: "/", icon: <HiOutlineSparkles className="w-6 h-6" /> },
    { name: t("for_you"), path: "/for-you", icon: <FiStar className="w-6 h-6" /> },
    { name: t("my_library"), path: "/my-music", icon: <FiUser className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 bg-gray-50 dark:bg-nct-surface flex flex-col h-full border-r border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-green-500 dark:bg-nct-primary rounded-full flex items-center justify-center">
             <TbVinyl className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight text-black dark:text-white">NCT</span>
            <span className="text-[10px] text-gray-500 dark:text-nct-text-dim uppercase tracking-wider">Clone Streaming</span>
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
                  ? "bg-green-100 dark:bg-white/10 text-green-600 dark:text-nct-primary"
                  : "text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5"
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 border-t border-gray-200 dark:border-white/5 mx-4"></div>

        <div className="px-4 text-xs font-bold text-gray-500 dark:text-nct-text-dim uppercase tracking-wider mb-4">
          {t('library')}
        </div>
        <div className="space-y-1">
          <a href="#" className="flex items-center gap-4 px-4 py-2 rounded-lg text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5 font-medium transition-colors">
            <FiHeart className="w-5 h-5" />
            {t('liked_songs')}
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-2 rounded-lg text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-nct-text hover:bg-gray-200 dark:hover:bg-white/5 font-medium transition-colors">
            <FiClock className="w-5 h-5" />
            {t('recently_played')}
          </a>
        </div>
      </nav>
    </aside>
  );
}
