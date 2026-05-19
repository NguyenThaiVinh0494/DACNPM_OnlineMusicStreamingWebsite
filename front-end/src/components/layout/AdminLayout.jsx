import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiMusic,
  FiBarChart2, FiLogOut, FiArrowLeft, FiShield, FiDisc, FiMic, FiTag
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: FiUsers },
  { to: '/admin/songs', label: 'Bài hát', icon: FiMusic },
  { to: '/admin/albums', label: 'Album', icon: FiDisc },
  { to: '/admin/artists', label: 'Nghệ sĩ', icon: FiMic },
  { to: '/admin/topics', label: 'Chủ đề', icon: FiTag },
  { to: '/admin/stats', label: 'Thống kê', icon: FiBarChart2 },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToUserApp = () => {
    const canCloseWindow = typeof window !== 'undefined' && window.opener && !window.opener.closed;

    if (canCloseWindow) {
      window.close();
      window.setTimeout(() => {
        navigate('/');
      }, 150);
      return;
    }

    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Admin Panel</p>
            <p className="text-xs text-gray-400">NCT Music</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={handleBackToUserApp}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Về trang người dùng
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Bảng điều khiển</h1>
            <p className="text-xs text-gray-400">Xin chào, {user?.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm uppercase">
              {user?.username?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
