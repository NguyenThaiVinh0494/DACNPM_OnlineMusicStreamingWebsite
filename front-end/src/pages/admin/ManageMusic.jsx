import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FiSearch, FiEdit2, FiTrash2, FiMusic } from 'react-icons/fi';

export default function ManageMusic() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/songs/')
      .then(res => setSongs(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = songs.filter(s =>
    s.tieu_de?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài hát này?')) return;
    try {
      await axios.delete(`/songs/${id}/`);
      setSongs(prev => prev.filter(s => s.id !== id));
    } catch {
      // Handle error
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Quản lý Kho nhạc</h2>
        <p className="text-sm text-gray-500">Xem, chỉnh sửa hoặc xóa bài hát trong hệ thống.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên bài hát..."
          className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Bài hát</th>
                <th className="px-6 py-3 font-medium">Nghệ sĩ</th>
                <th className="px-6 py-3 font-medium">Lượt nghe</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Không tìm thấy bài hát.</td></tr>
              ) : filtered.map(song => (
                <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {song.duong_dan_hinh_anh ? (
                        <img src={song.duong_dan_hinh_anh} alt={song.tieu_de} className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                          <FiMusic className="text-purple-400 w-4 h-4" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 max-w-[180px] truncate">{song.tieu_de}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{song.id_nghe_si?.ten_nghe_si || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{(song.luot_nghe ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.trang_thai === 'PUBLIC' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {song.trang_thai === 'PUBLIC' ? 'Công khai' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
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
