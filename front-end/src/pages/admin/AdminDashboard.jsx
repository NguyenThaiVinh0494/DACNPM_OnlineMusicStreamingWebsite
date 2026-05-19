import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import {
  FiUsers, FiMusic, FiHeadphones, FiTrendingUp
} from 'react-icons/fi';

const DASHBOARD_CACHE_TTL_MS = 60_000;
const dashboardCache = {
  stats: null,
  fetchedAt: 0,
};

function isDashboardCacheFresh() {
  return Date.now() - dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS;
}

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(() => dashboardCache.stats);
  const [loading, setLoading] = useState(() => !isDashboardCacheFresh());

  useEffect(() => {
    if (isDashboardCacheFresh()) {
      setStats(dashboardCache.stats);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [songRes, userRes] = await Promise.all([
          axios.get('/songs/'),
          axios.get('/admin/users/'),
        ]);
        const nextStats = {
          songs: songRes.data?.count ?? songRes.data?.length ?? 0,
          users: userRes.data?.count ?? userRes.data?.length ?? 0,
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={FiUsers} label="Người dùng" value={stats?.users} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={FiMusic} label="Bài hát công khai" value={stats?.songs} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon={FiHeadphones} label="Tổng lượt nghe" value="—" color="text-green-600" bgColor="bg-green-50" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: '/admin/users', label: 'Quản lý Users', icon: FiUsers, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { to: '/admin/songs', label: 'Quản lý Bài hát', icon: FiMusic, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { to: '/admin/stats', label: 'Thống kê', icon: FiTrendingUp, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-2 py-5 rounded-2xl font-medium text-sm transition-colors ${color}`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
