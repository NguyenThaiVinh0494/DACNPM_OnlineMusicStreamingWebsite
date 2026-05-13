import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FiSearch, FiLock, FiUnlock, FiTrash2, FiUser } from 'react-icons/fi';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/users/')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleLock = async (userId, isActive) => {
    try {
      await axios.patch(`/admin/users/${userId}/`, { is_active: !isActive });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    } catch {
      // Handle error
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await axios.delete(`/admin/users/${userId}/`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      // Handle error
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Quản lý Người dùng</h2>
        <p className="text-sm text-gray-500">Xem, khóa hoặc xóa tài khoản thành viên.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo username hoặc email..."
          className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Người dùng</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Vai trò</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Không tìm thấy người dùng.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                        {u.username?.[0] || <FiUser />}
                      </div>
                      <span className="font-medium text-gray-900">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.vai_tro === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.vai_tro === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleLock(u.id, u.is_active)}
                        className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {u.is_active ? <FiLock className="w-4 h-4" /> : <FiUnlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa tài khoản"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
