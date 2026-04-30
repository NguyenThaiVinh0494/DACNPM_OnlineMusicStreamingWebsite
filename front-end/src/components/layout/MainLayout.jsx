import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PlayerBar from "./PlayerBar";

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-gray-900 dark:!bg-nct-bg dark:!text-nct-text transition-colors duration-300">
      {/* Top section: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Bottom section: PlayerBar */}
      <PlayerBar />
    </div>
  );
}
