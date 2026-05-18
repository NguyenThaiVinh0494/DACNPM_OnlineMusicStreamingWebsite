import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FiCheckCircle, FiXCircle, FiPlay, FiMusic } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSongArtistNames } from '../../utils/songArtists';

export default function PendingUploads() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/songs/?trang_thai=PENDING')
      .then(res => setSongs(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/songs/${id}/`, { trang_thai: 'PUBLIC' });
      setSongs(prev => prev.filter(s => s.id !== id));
      toast.success('Đã duyệt bài hát!');
    } catch {
      toast.error('Không thể duyệt. Thử lại sau.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (reason === null) return;
    try {
      await axios.delete(`/songs/${id}/`);
      setSongs(prev => prev.filter(s => s.id !== id));
      toast.success('Đã từ chối bài hát.');
    } catch {
      toast.error('Không thể từ chối. Thử lại sau.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Duyệt Upload</h2>
        <p className="text-sm text-gray-500">Kiểm duyệt các bài hát đang chờ phê duyệt từ người dùng.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : songs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-gray-400">
          <FiCheckCircle className="w-12 h-12 mb-3 text-green-400" />
          <p className="text-base font-semibold text-gray-600">Không còn bài hát nào cần duyệt!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map(song => (
            <div key={song.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              {song.duong_dan_hinh_anh ? (
                <img src={song.duong_dan_hinh_anh} alt={song.tieu_de} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FiMusic className="text-amber-400 w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{song.tieu_de}</p>
                <p className="text-sm text-gray-400">{getSongArtistNames(song, 'Nghệ sĩ không xác định')}</p>
                <p className="text-xs text-gray-300 mt-0.5">Upload bởi: {song.id_nguoi_dang?.username || '—'}</p>
              </div>

              {song.duong_dan_am_thanh && (
                <audio controls className="hidden" id={`audio-${song.id}`} src={song.duong_dan_am_thanh} />
              )}

              <div className="flex items-center gap-2">
                {song.duong_dan_am_thanh && (
                  <button
                    onClick={() => document.getElementById(`audio-${song.id}`)?.play()}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    <FiPlay className="w-4 h-4" /> Nghe thử
                  </button>
                )}
                <button
                  onClick={() => handleApprove(song.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  <FiCheckCircle className="w-4 h-4" /> Duyệt
                </button>
                <button
                  onClick={() => handleReject(song.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                >
                  <FiXCircle className="w-4 h-4" /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
