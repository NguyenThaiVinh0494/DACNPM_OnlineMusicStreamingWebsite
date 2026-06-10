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
  { to: '/admin/topics', label: 'Thể loại', icon: FiTag },
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
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,170,237,0.18),transparent_32%),linear-gradient(135deg,#f8fafc,#eef7ff_48%,#f7fbff)] font-sans text-slate-900">
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-white/70 bg-white/85 text-slate-900 shadow-[18px_0_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-200/70 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
            <FiShield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">NCT Admin</p>
            <p className="text-xs font-medium text-slate-500">Music control room</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold outline-none transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-200/70 px-3 py-4">
          <button
            onClick={handleBackToUserApp}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <FiArrowLeft className="h-5 w-5" />
            Về trang người dùng
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <FiLogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/70 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950">Bảng điều khiển</h1>
            <p className="text-xs font-medium text-slate-400">Xin chào, {user?.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-black uppercase text-white shadow-sm">
              {user?.username?.[0] || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
