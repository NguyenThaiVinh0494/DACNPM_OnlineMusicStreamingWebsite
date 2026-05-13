import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import {
  FiUsers, FiMusic, FiUploadCloud, FiHeadphones,
  FiTrendingUp, FiCheckCircle, FiXCircle, FiClock
} from 'react-icons/fi';

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
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songRes, userRes, pendingRes] = await Promise.all([
          axios.get('/songs/'),
          axios.get('/admin/users/'),
          axios.get('/songs/?trang_thai=PENDING'),
        ]);
        setStats({
          songs: songRes.data?.count ?? songRes.data?.length ?? 0,
          users: userRes.data?.count ?? userRes.data?.length ?? 0,
          pending: pendingRes.data?.count ?? pendingRes.data?.length ?? 0,
        });
        const pendingList = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : pendingRes.data?.results ?? [];
        setPending(pendingList.slice(0, 5));
      } catch {
        // Mock data nếu API chưa có
        setStats({ songs: 0, users: 0, pending: 0 });
        setPending([]);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Người dùng" value={stats?.users} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={FiMusic} label="Bài hát công khai" value={stats?.songs} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon={FiUploadCloud} label="Chờ duyệt" value={stats?.pending} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon={FiHeadphones} label="Tổng lượt nghe" value="—" color="text-green-600" bgColor="bg-green-50" />
      </div>

      {/* Pending Uploads Quick Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiClock className="text-amber-500 w-5 h-5" />
            <h3 className="font-semibold text-gray-900">Bài hát chờ duyệt gần đây</h3>
          </div>
          <Link to="/admin/pending" className="text-sm text-blue-600 hover:underline font-medium">
            Xem tất cả →
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-gray-400">
            <FiCheckCircle className="w-10 h-10 mb-2 text-green-400" />
            <p className="font-medium text-gray-500">Không có bài hát nào cần duyệt!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map(song => (
              <div key={song.id} className="flex items-center gap-4 px-6 py-3">
                <img
                  src={song.duong_dan_hinh_anh || 'https://via.placeholder.com/40'}
                  alt={song.tieu_de}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{song.tieu_de}</p>
                  <p className="text-xs text-gray-400">{song.id_nghe_si?.ten_nghe_si || 'Nghệ sĩ'}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
                  <FiClock className="w-3 h-3" /> Chờ duyệt
                </span>
                <div className="flex gap-2">
                  <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Duyệt">
                    <FiCheckCircle className="w-4.5 h-4.5" />
                  </button>
                  <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Từ chối">
                    <FiXCircle className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/admin/users', label: 'Quản lý Users', icon: FiUsers, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { to: '/admin/music', label: 'Quản lý Nhạc', icon: FiMusic, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { to: '/admin/pending', label: 'Duyệt Upload', icon: FiUploadCloud, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
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
