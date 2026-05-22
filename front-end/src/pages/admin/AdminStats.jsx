import { useState, useEffect } from 'react';
import { adminStatsService } from '../../api/services';
import { optimizeCloudinaryImage } from '../../utils/media';
import { FiTrendingUp, FiMusic, FiUsers, FiHeadphones } from 'react-icons/fi';

export default function AdminStats() {
  const [topSongs, setTopSongs] = useState([]);
  const [summary, setSummary] = useState({ totalListens: 0, genreDistribution: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatsService.getOverview()
      .then(data => {
        setTopSongs(data.topSongs || []);
        setSummary({
          totalListens: data.totalListens || 0,
          genreDistribution: data.genreDistribution || [],
        });
      })
      .catch(() => {
        setTopSongs([]);
        setSummary({ totalListens: 0, genreDistribution: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const maxListens = topSongs[0]?.luot_nghe ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Thống kê hệ thống</h2>
        <p className="text-sm text-gray-500">Theo dõi xu hướng và hiệu suất nội dung.</p>
      </div>

      {/* Summary placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tổng lượt nghe', value: summary.totalListens.toLocaleString(), icon: FiHeadphones, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Bài hát nổi bật', value: topSongs[0]?.tieu_de ?? '—', icon: FiMusic, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Lượt nghe cao nhất', value: (topSongs[0]?.luot_nghe ?? 0).toLocaleString(), icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-base font-bold text-gray-900 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Songs Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <FiTrendingUp className="text-blue-500" />
          Top 10 bài hát được nghe nhiều nhất
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : topSongs.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Chưa có dữ liệu.</p>
        ) : (
          <div className="space-y-3">
            {topSongs.map((song, idx) => (
              <div key={song.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4 text-right">{idx + 1}</span>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {song.duong_dan_hinh_anh
                    ? <img src={optimizeCloudinaryImage(song.duong_dan_hinh_anh, { width: 80, height: 80 })} alt={song.tieu_de} className="w-full h-full object-cover" />
                    : <FiMusic className="w-4 h-4 text-gray-400 m-auto mt-2" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{song.tieu_de}</p>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.max(4, ((song.luot_nghe ?? 0) / maxListens) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium w-16 text-right flex-shrink-0">
                  {(song.luot_nghe ?? 0).toLocaleString()} nghe
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiUsers className="text-purple-500" />
          Phân bổ thể loại nhạc
        </h3>
        <div className="flex gap-3 flex-wrap">
          {(summary.genreDistribution.length ? summary.genreDistribution : []).map((genre, i) => {
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500'];
            return (
              <div key={genre.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                <span className="text-sm text-gray-700 font-medium">{genre.name}</span>
                <span className="text-xs text-gray-400">{genre.songCount} bài</span>
              </div>
            );
          })}
          {!summary.genreDistribution.length && <p className="text-sm text-gray-400">Chưa có dữ liệu thể loại.</p>}
        </div>
      </div>
    </div>
  );
}
