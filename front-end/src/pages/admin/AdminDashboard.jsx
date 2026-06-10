import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowUpRight,
  FiBarChart2,
  FiDisc,
  FiGrid,
  FiHeadphones,
  FiMic,
  FiMusic,
  FiTag,
  FiUsers,
} from 'react-icons/fi';

import { adminStatsService } from '../../api/services';

const DASHBOARD_CACHE_TTL_MS = 60_000;
const dashboardCache = {
  stats: null,
  fetchedAt: 0,
};

function isDashboardCacheFresh() {
  return Date.now() - dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function ContentSummaryCard({ icon: Icon, label, value, accent, helper, tone }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_42px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{formatNumber(value)}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">{helper}</p>
        </div>
        <div className={`rounded-2xl ${tone} p-3 shadow-sm transition group-hover:scale-105`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{formatNumber(value)}</p>
    </div>
  );
}

function QuickLinkCard({ to, label, icon: Icon, accent, helper }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-[26px] border border-white/70 bg-white/95 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">{label}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-400">{helper}</p>
        </div>
      </div>
      <FiArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-slate-900" />
    </Link>
  );
}

function CatalogMixRow({ icon: Icon, label, value, total, color, barClass }) {
  const percent = total ? Math.round((Number(value || 0) / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-black text-slate-900">{formatNumber(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

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
        const fallbackStats = {
          songs: 0,
          albums: 0,
          artists: 0,
          genres: 0,
          users: 0,
          totalListens: 0,
        };
        dashboardCache.stats = fallbackStats;
        dashboardCache.fetchedAt = Date.now();
        setStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const catalogTotal = useMemo(
    () => Number(stats?.songs || 0) + Number(stats?.albums || 0) + Number(stats?.artists || 0) + Number(stats?.genres || 0),
    [stats],
  );
  const averageListens = stats?.songs ? Math.round(Number(stats.totalListens || 0) / Number(stats.songs || 1)) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-[32px] bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(45,170,237,0.24),transparent_34%),linear-gradient(135deg,#ffffff,#eef7ff_48%,#f8fbff)] p-6 text-slate-950 shadow-[0_22px_70px_rgba(45,170,237,0.14)]">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[80px] bg-sky-100/70" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              <FiGrid className="h-3.5 w-3.5" />
              Admin Overview
            </div>
            <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
              Tổng quan hệ thống
            </h2>
            <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
              <HeroMetric label="Catalog" value={catalogTotal} />
              <HeroMetric label="Người dùng" value={stats?.users} />
              <HeroMetric label="Lượt nghe" value={stats?.totalListens} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[28px] border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur">
              <FiHeadphones className="h-6 w-6 text-emerald-500" />
              <p className="mt-4 text-3xl font-black">{formatNumber(averageListens)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Nghe trung bình / bài</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur">
              <FiMusic className="h-6 w-6 text-cyan-500" />
              <p className="mt-4 text-3xl font-black">{formatNumber(stats?.songs)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Bài hát đang quản lý</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ContentSummaryCard icon={FiMusic} label="Bài hát" value={stats?.songs} helper="Ảnh, audio, ca sĩ, album" accent="from-cyan-500 to-blue-500" tone="bg-cyan-50 text-cyan-700" />
        <ContentSummaryCard icon={FiDisc} label="Album" value={stats?.albums} helper="Bìa album và danh sách bài" accent="from-emerald-500 to-teal-500" tone="bg-emerald-50 text-emerald-700" />
        <ContentSummaryCard icon={FiMic} label="Nghệ sĩ" value={stats?.artists} helper="Hồ sơ nghệ sĩ và tiểu sử" accent="from-amber-500 to-orange-500" tone="bg-amber-50 text-amber-700" />
        <ContentSummaryCard icon={FiTag} label="Thể loại" value={stats?.genres} helper="Mood, thể loại và ảnh đại diện" accent="from-fuchsia-500 to-pink-500" tone="bg-fuchsia-50 text-fuchsia-700" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_42px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500">Catalog Mix</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">Cấu trúc nội dung</h3>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 ring-1 ring-sky-100">
              <FiBarChart2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <CatalogMixRow icon={FiMusic} label="Bài hát" value={stats?.songs} total={catalogTotal} color="text-cyan-500" barClass="bg-cyan-500" />
            <CatalogMixRow icon={FiDisc} label="Album" value={stats?.albums} total={catalogTotal} color="text-emerald-500" barClass="bg-emerald-500" />
            <CatalogMixRow icon={FiMic} label="Nghệ sĩ" value={stats?.artists} total={catalogTotal} color="text-amber-500" barClass="bg-amber-500" />
            <CatalogMixRow icon={FiTag} label="Thể loại" value={stats?.genres} total={catalogTotal} color="text-fuchsia-500" barClass="bg-fuchsia-500" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <QuickLinkCard to="/admin/users" label="Người dùng" helper="Tài khoản và quyền" icon={FiUsers} accent="from-blue-500 to-indigo-500" />
          <QuickLinkCard to="/admin/songs" label="Bài hát" helper="Upload và duyệt nội dung" icon={FiMusic} accent="from-cyan-500 to-blue-500" />
          <QuickLinkCard to="/admin/albums" label="Album" helper="Bìa và danh sách bài" icon={FiDisc} accent="from-emerald-500 to-teal-500" />
          <QuickLinkCard to="/admin/artists" label="Nghệ sĩ" helper="Hồ sơ và hình ảnh" icon={FiMic} accent="from-amber-500 to-orange-500" />
          <QuickLinkCard to="/admin/topics" label="Thể loại" helper="Mood và phân loại" icon={FiTag} accent="from-fuchsia-500 to-pink-500" />
          <QuickLinkCard to="/admin/stats" label="Thống kê" helper="Xu hướng và hiệu suất" icon={FiBarChart2} accent="from-sky-500 to-cyan-500" />
        </div>
      </section>
    </div>
  );
}
