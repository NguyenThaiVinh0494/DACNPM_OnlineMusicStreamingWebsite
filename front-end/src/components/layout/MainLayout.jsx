import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PlayerBar from "./PlayerBar";
import LyricsView from "./LyricsView";
import QueueDrawer from "./QueueDrawer";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-white to-nct-primary/40 dark:!bg-gradient-to-b dark:!from-[#004d4d] dark:!to-nct-bg text-gray-900 dark:!text-nct-text transition-colors duration-300">
      {/* Top section: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      {/* Bottom section: PlayerBar & Overlay */}
      <LyricsView />
      <QueueDrawer />
      <PlayerBar />
    </div>
  );
}
