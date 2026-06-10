import { useEffect, useState } from 'react';
import { adminStatsService } from '../../api/services';
import { optimizeCloudinaryImage } from '../../utils/media';
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiHeart,
  FiMusic,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

const EMPTY_STATS = {
  totalListens: 0,
  totalLikes: 0,
  averageListensPerSong: 0,
  likeRate: 0,
  newUsers30Days: 0,
  topSongs: [],
  topLikedSongs: [],
  listenTrend: [],
  genreDistribution: [],
  topArtists: [],
  contentStatus: {
    songs: { public: 0, pending: 0 },
    albums: { public: 0, pending: 0 },
  },
};

function formatNumber(value) {
  return (value || 0).toLocaleString('vi-VN');
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
}

function getLikeCount(song) {
  return song?.so_luot_thich ?? 0;
}

function StatCard({ icon: Icon, label, value, helper, color, bg }) {
  return (
    <div className="group rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_42px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 truncate text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">{helper}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} transition group-hover:scale-105`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function TrendChart({ data, loading }) {
  const maxListens = Math.max(1, ...data.map((item) => item.listens || 0));
  const points = data.map((item, index) => {
    const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = 88 - ((item.listens || 0) / maxListens) * 72;
    return `${x},${y}`;
  });
  const areaPoints = points.length ? `0,100 ${points.join(' ')} 100,100` : '';

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-black text-slate-950">
            <FiActivity className="text-blue-500" />
            Xu hướng lượt nghe 14 ngày
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">Dựa trên lịch sử phát nhạc được ghi nhận.</p>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
          Tổng {formatNumber(data.reduce((sum, item) => sum + (item.listens || 0), 0))}
        </span>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">Chưa có dữ liệu xu hướng.</p>
      ) : (
        <div className="space-y-4">
          <div className="h-64 rounded-[26px] bg-gradient-to-b from-cyan-50 to-white px-2 py-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <polygon points={areaPoints} className="fill-cyan-200/45" />
              <polyline points={points.join(' ')} className="fill-none stroke-cyan-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-gray-400">
            {data.filter((_, index) => index % 2 === 0).map((item) => (
              <span key={item.date}>{new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, publicCount, pendingCount }) {
  const total = publicCount + pendingCount;
  const publicWidth = total ? (publicCount / total) * 100 : 0;
  const pendingWidth = total ? (pendingCount / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{formatNumber(total)} mục</p>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="bg-emerald-500" style={{ width: `${publicWidth}%` }} />
        <div className="bg-amber-400" style={{ width: `${pendingWidth}%` }} />
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Public {formatNumber(publicCount)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Pending {formatNumber(pendingCount)}
        </span>
      </div>
    </div>
  );
}

function ContentStatusPanel({ status }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
      <h3 className="mb-5 flex items-center gap-2 font-black text-slate-950">
        <FiCheckCircle className="text-emerald-500" />
        Trạng thái nội dung
      </h3>
      <div className="space-y-5">
        <StatusRow label="Bài hát" publicCount={status.songs.public} pendingCount={status.songs.pending} />
        <StatusRow label="Album" publicCount={status.albums.public} pendingCount={status.albums.pending} />
      </div>
    </div>
  );
}

function ArtistPanel({ artists, loading }) {
  const maxListens = Math.max(1, ...artists.map((artist) => artist.totalListens || 0));

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
      <h3 className="mb-5 flex items-center gap-2 font-black text-slate-950">
        <FiUsers className="text-violet-500" />
        Top nghệ sĩ theo lượt nghe
      </h3>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : artists.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Chưa có dữ liệu nghệ sĩ.</p>
      ) : (
        <div className="space-y-4">
          {artists.map((artist, index) => (
            <div key={artist.id} className="flex items-center gap-3">
              <span className="w-5 text-right text-xs font-bold text-gray-400">{index + 1}</span>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {artist.image ? (
                  <img src={optimizeCloudinaryImage(artist.image, { width: 80, height: 80 })} alt={artist.name} className="h-full w-full object-cover" />
                ) : (
                  <FiUsers className="m-auto mt-3 h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-gray-800">{artist.name}</p>
                  <span className="shrink-0 text-xs font-medium text-gray-400">{formatNumber(artist.totalListens)} nghe</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500" style={{ width: `${Math.max(4, ((artist.totalListens || 0) / maxListens) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">{artist.songCount} bài, {formatNumber(artist.totalLikes)} tym</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenrePanel({ genres, loading }) {
  const maxListens = Math.max(1, ...genres.map((genre) => genre.totalListens || 0));

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
      <h3 className="mb-5 flex items-center gap-2 font-black text-slate-950">
        <FiBarChart2 className="text-purple-500" />
        Thể loại thịnh hành
      </h3>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : genres.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Chưa có dữ liệu thể loại.</p>
      ) : (
        <div className="space-y-4">
          {genres.map((genre) => (
            <div key={genre.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-gray-800">{genre.name}</p>
                <span className="shrink-0 text-xs text-gray-400">{formatNumber(genre.totalListens)} nghe</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500" style={{ width: `${Math.max(4, ((genre.totalListens || 0) / maxListens) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">{genre.songCount} bài công khai</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SongRankingPanel({
  title,
  icon: Icon,
  iconColor,
  songs,
  loading,
  maxValue,
  valueGetter,
  valueLabel,
  barClassName,
  expanded,
  onToggleExpanded,
}) {
  const safeMaxValue = maxValue > 0 ? maxValue : 1;
  const visibleSongs = expanded ? songs.slice(0, 10) : songs.slice(0, 5);
  const canToggle = songs.length > 5;

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-black text-slate-950">
          <Icon className={iconColor} />
          {title}
        </h3>
        {canToggle && (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : songs.length === 0 ? (
        <p className="py-10 text-center text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="space-y-3">
          {visibleSongs.map((song, idx) => {
            const value = valueGetter(song);

            return (
              <div key={song.id} className="flex items-center gap-3">
                <span className="w-4 text-right text-xs font-bold text-gray-400">{idx + 1}</span>
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {song.duong_dan_hinh_anh
                    ? <img src={optimizeCloudinaryImage(song.duong_dan_hinh_anh, { width: 80, height: 80 })} alt={song.tieu_de} className="h-full w-full object-cover" />
                    : <FiMusic className="m-auto mt-2 h-4 w-4 text-gray-400" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{song.tieu_de}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${barClassName}`}
                      style={{ width: `${Math.max(4, (value / safeMaxValue) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 shrink-0 text-right text-xs font-medium text-gray-400">
                  {formatNumber(value)} {valueLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [expandedRankings, setExpandedRankings] = useState({
    listens: false,
    likes: false,
  });

  useEffect(() => {
    adminStatsService.getOverview()
      .then((data) => {
        setStats({
          ...EMPTY_STATS,
          ...data,
          contentStatus: {
            ...EMPTY_STATS.contentStatus,
            ...(data.contentStatus || {}),
            songs: {
              ...EMPTY_STATS.contentStatus.songs,
              ...(data.contentStatus?.songs || {}),
            },
            albums: {
              ...EMPTY_STATS.contentStatus.albums,
              ...(data.contentStatus?.albums || {}),
            },
          },
        });
      })
      .catch(() => {
        setStats(EMPTY_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  const topSongs = stats.topSongs || [];
  const topLikedSongs = stats.topLikedSongs || [];
  const maxListens = topSongs[0]?.luot_nghe || 1;
  const maxLikes = getLikeCount(topLikedSongs[0]) || 1;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(45,170,237,0.24),transparent_34%),linear-gradient(135deg,#ffffff,#eef7ff_48%,#f8fbff)] p-6 text-slate-950 shadow-[0_22px_70px_rgba(45,170,237,0.14)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              <FiBarChart2 className="h-3.5 w-3.5" />
              Admin Studio
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Thống kê hệ thống</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-bold text-sky-600">Lượt nghe</p>
              <p className="text-xl font-black">{formatNumber(stats.totalListens)}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-bold text-sky-600">Lượt tym</p>
              <p className="text-xl font-black">{formatNumber(stats.totalLikes)}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-bold text-sky-600">User mới</p>
              <p className="text-xl font-black">{formatNumber(stats.newUsers30Days)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={FiHeadphones} label="Tổng lượt nghe" value={formatNumber(stats.totalListens)} helper="Tổng lượt phát toàn hệ thống" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={FiHeart} label="Tổng lượt tym" value={formatNumber(stats.totalLikes)} helper="Tất cả bài hát được yêu thích" color="text-rose-600" bg="bg-rose-50" />
        <StatCard icon={FiTrendingUp} label="Nghe TB / bài" value={formatNumber(stats.averageListensPerSong)} helper="Tính trên bài công khai" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FiActivity} label="Tỷ lệ tym / nghe" value={formatPercent(stats.likeRate)} helper="Đo mức hấp dẫn nội dung" color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={FiClock} label="User mới 30 ngày" value={formatNumber(stats.newUsers30Days)} helper="Tài khoản đăng ký gần đây" color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TrendChart data={stats.listenTrend || []} loading={loading} />
        <ContentStatusPanel status={stats.contentStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ArtistPanel artists={stats.topArtists || []} loading={loading} />
        <GenrePanel genres={stats.genreDistribution || []} loading={loading} />
      </div>

      <div className="space-y-6">
        <SongRankingPanel
          title={`${expandedRankings.listens ? 'Top 10' : 'Top 5'} bài hát được nghe nhiều nhất`}
          icon={FiTrendingUp}
          iconColor="text-blue-500"
          songs={topSongs}
          loading={loading}
          maxValue={maxListens}
          valueGetter={(song) => song.luot_nghe ?? 0}
          valueLabel="nghe"
          barClassName="bg-gradient-to-r from-blue-400 to-blue-600"
          expanded={expandedRankings.listens}
          onToggleExpanded={() => setExpandedRankings((current) => ({ ...current, listens: !current.listens }))}
        />

        <SongRankingPanel
          title={`${expandedRankings.likes ? 'Top 10' : 'Top 5'} bài hát được yêu thích nhất`}
          icon={FiHeart}
          iconColor="text-rose-500"
          songs={topLikedSongs}
          loading={loading}
          maxValue={maxLikes}
          valueGetter={getLikeCount}
          valueLabel="tym"
          barClassName="bg-gradient-to-r from-rose-400 to-pink-600"
          expanded={expandedRankings.likes}
          onToggleExpanded={() => setExpandedRankings((current) => ({ ...current, likes: !current.likes }))}
        />
      </div>
    </div>
  );
}
