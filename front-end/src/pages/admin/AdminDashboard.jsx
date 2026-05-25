import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminStatsService } from '../../api/services';
import {
  FiDisc, FiHeadphones, FiMusic, FiTag, FiTrendingUp, FiUsers
} from 'react-icons/fi';

const DASHBOARD_CACHE_TTL_MS = 60_000;
const dashboardCache = {
  stats: null,
  fetchedAt: 0,
};

function isDashboardCacheFresh() {
  return Date.now() - dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS;
}

const ContentSummaryCard = ({ icon: Icon, label, value, accent, helper, className = '' }) => (
  <div className={`relative overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${className}`}>
    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value ?? 0}</p>
        <p className="mt-1 text-xs text-slate-400">{helper}</p>
      </div>
      <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(() => dashboardCache.stats);
  const [loading, setLoading] = useState(() => !isDashboardCacheFresh());

  useEffect(() => {
    if (isDashboardCacheFresh()) {
      return;
    }

    const fetchData = async () => {
      try {
        const data = await adminStatsService.getSummary();
        const nextStats = {
          songs: data.counts?.songs ?? 0,
          albums: data.counts?.albums ?? 0,
          artists: data.counts?.artists ?? 0,
          genres: data.counts?.genres ?? 0,
          users: data.counts?.users ?? 0,
          totalListens: data.totalListens ?? 0,
        };
        dashboardCache.stats = nextStats;
        dashboardCache.fetchedAt = Date.now();
        setStats(nextStats);
      } catch {
        const fallbackStats = { songs: 0, users: 0 };
        dashboardCache.stats = fallbackStats;
        dashboardCache.fetchedAt = Date.now();
        setStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi các chỉ số quan trọng trong thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-8">
        <ContentSummaryCard className="xl:col-span-2" icon={FiMusic} label="Bài hát" value={stats?.songs} helper="Có thể upload ảnh + audio trong cùng form" accent="from-cyan-500 to-blue-500" />
        <ContentSummaryCard className="xl:col-span-2" icon={FiDisc} label="Album" value={stats?.albums} helper="Ảnh bìa upload trực tiếp" accent="from-emerald-500 to-teal-500" />
        <ContentSummaryCard className="xl:col-span-2" icon={FiUsers} label="Nghệ sĩ" value={stats?.artists} helper="Ảnh nghệ sĩ + tiểu sử" accent="from-amber-500 to-orange-500" />
        <ContentSummaryCard className="xl:col-span-2" icon={FiTag} label="Thể loại" value={stats?.genres} helper="Ảnh, tên, mô tả cho thể loại" accent="from-fuchsia-500 to-pink-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-8">
        <ContentSummaryCard className="xl:col-span-2 xl:col-start-2" icon={FiUsers} label="Người dùng" value={stats?.users} helper="Tài khoản đã đăng ký trong hệ thống" accent="from-blue-500 to-indigo-500" />
        <ContentSummaryCard className="xl:col-span-2 xl:col-start-6" icon={FiHeadphones} label="Tổng lượt nghe" value={stats?.totalListens?.toLocaleString?.() ?? 0} helper="Tổng lượt phát của toàn bộ bài hát" accent="from-green-500 to-emerald-500" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-8">
        {[
          { to: '/admin/users', label: 'Quản lý Người dùng', icon: FiUsers, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { to: '/admin/songs', label: 'Quản lý Bài hát', icon: FiMusic, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { to: '/admin/albums', label: 'Quản lý Album', icon: FiDisc, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
          { to: '/admin/artists', label: 'Quản lý Nghệ sĩ', icon: FiUsers, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          { to: '/admin/topics', label: 'Quản lý Thể loại', icon: FiTag, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
          { to: '/admin/stats', label: 'Thống kê', icon: FiTrendingUp, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
        ].map(({ to, label, icon: Icon, color }, index) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-2 py-5 rounded-2xl font-medium text-sm transition-colors xl:col-span-2 ${index === 4 ? 'xl:col-start-2' : ''} ${index === 5 ? 'xl:col-start-6' : ''} ${color}`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
