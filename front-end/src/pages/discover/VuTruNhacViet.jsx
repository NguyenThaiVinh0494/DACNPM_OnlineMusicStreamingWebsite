import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiChevronRight } from "react-icons/fi";

/* ─── DATA ─────────────────────────────────────────────── */
const categories = [
  { name: "V-Pop", color: "from-cyan-500 to-teal-600",    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
  { name: "Rap Việt", color: "from-violet-600 to-purple-800", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=200&h=200&fit=crop" },
  { name: "Indie Việt", color: "from-rose-500 to-orange-500", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
  { name: "Ballad", color: "from-blue-500 to-indigo-600",  image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop" },
  { name: "Nhạc Trẻ", color: "from-emerald-500 to-teal-600", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
  { name: "Bolero", color: "from-amber-600 to-orange-700", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&h=200&fit=crop" },
  { name: "Remix", color: "from-fuchsia-500 to-pink-600",  image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=200&h=200&fit=crop" },
  { name: "Acoustic", color: "from-lime-600 to-green-700", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&h=200&fit=crop" },
];

const sections = [
  {
    title: "🔥 Đang Thịnh Hành",
    playlists: [
      { id: 1,  title: "Hit Việt Quốc Dân",      desc: "HIEUTHUHAI, Trọng Nhân, Wren Evans...",  image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
      { id: 2,  title: "TikTok Remix Việt",       desc: "Inso, Ness Remix, Masew...",            image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=400&fit=crop" },
      { id: 3,  title: "V-Pop Thịnh Hành",        desc: "GREY D, Đặng Thanh Tuyền...",          image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop" },
      { id: 4,  title: "Gen Gì Gen Z",             desc: "HIEUTHUHAI, Ogenus, Seachains...",     image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop" },
      { id: 5,  title: "Ballad Việt Hay Nhất",    desc: "Lyly, Đỗ Hoàng Long, Vũ...",          image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
    ],
  },
  {
    title: "🎤 Rap Việt Underground",
    playlists: [
      { id: 6,  title: "Rap Việt Cực Chất",       desc: "Đen Vâu, RPT Odin, MCK...",           image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=400&h=400&fit=crop" },
      { id: 7,  title: "Underground Rap VN",       desc: "Gill, Dương Domic, Trung Ryan...",    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop" },
      { id: 8,  title: "Hip-Hop Việt Đỉnh Cao",   desc: "Karik, B Ray, Wowy...",               image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop" },
      { id: 9,  title: "Rap For Life",             desc: "RPT MCK, Trung Ryan, Pháo...",       image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=400&fit=crop" },
      { id: 10, title: "Mất Kết Nối Playlist",    desc: "Pháo, Dế Choắt, MCK...",             image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=400&h=400&fit=crop" },
    ],
  },
  {
    title: "🌿 Indie & Acoustic Việt",
    playlists: [
      { id: 11, title: "Indie Việt Underground",  desc: "Bùi Lan Hương, Hà Myo, Kiên Trần...", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop" },
      { id: 12, title: "Acoustic Việt Nam",        desc: "Hà Anh Tuấn, Trung Quân, Mỹ Tâm...", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop" },
      { id: 13, title: "Có Hẹn Với Thanh Xuân",  desc: "Hà Anh Tuấn – Acoustic Collection",  image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop" },
      { id: 14, title: "Cà Phê & Nhạc Nhẹ",      desc: "Thư giãn buổi sáng cùng indie nhạc", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop" },
      { id: 15, title: "Indie Đêm Khuya",         desc: "Nhạc indie cho đêm dài suy nghĩ",    image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=400&h=400&fit=crop" },
    ],
  },
  {
    title: "🎵 Nhạc Truyền Thống & Bolero",
    playlists: [
      { id: 16, title: "Bolero Trữ Tình",          desc: "Phi Nhung, Mạnh Quỳnh, Hương Lan...", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop" },
      { id: 17, title: "Nhạc Vàng Bất Hủ",        desc: "Chế Linh, Tuấn Vũ, Hương Lan...",    image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=400&h=400&fit=crop" },
      { id: 18, title: "Sơn Tùng Best Hits",       desc: "Sơn Tùng M-TP – Tuyển Tập",          image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop" },
      { id: 19, title: "Làn Sóng Xanh 2024",      desc: "Top bài hát được yêu thích nhất",    image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
      { id: 20, title: "EDM Việt",                 desc: "DJ Oristar, Hoaprox, Masew...",       image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=400&fit=crop" },
    ],
  },
];

/* ─── PLAYLIST CARD ─────────────────────────────────────── */
function PlaylistCard({ item }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 shadow-sm">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-11 h-11 rounded-full bg-nct-primary text-white flex items-center justify-center translate-y-3 group-hover:translate-y-0 transition-transform duration-300 shadow-lg shadow-cyan-500/30 hover:scale-110">
            <FiPlay className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
        <Link to={`/playlist/${item.id}`} className="absolute inset-0 z-10" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate mb-1 group-hover:text-nct-primary transition-colors">
        {item.title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-[#b3b3b3] truncate">{item.desc}</p>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function VuTruNhacViet() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filteredSections = activeCategory === "Tất cả"
    ? sections
    : sections.map(s => ({
        ...s,
        playlists: s.playlists.filter(() => true), // show all sections but could filter by tag
      }));

  return (
    <div className="pb-24 space-y-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#b3b3b3]">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trang chủ</Link>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-gray-900 dark:text-white">Vũ Trụ Nhạc Việt</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-56">
        {/* bg image */}
        <img
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&h=400&fit=crop"
          alt="Vũ Trụ Nhạc Việt"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d2d2]/70 via-[#0f1311]/60 to-[#0f1311]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1311] via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-7">
          <p className="text-nct-primary text-xs font-bold uppercase tracking-[0.2em] mb-1">Bộ sưu tập đặc biệt</p>
          <h1 className="text-4xl font-black text-white leading-tight mb-2">🎵 Vũ Trụ Nhạc Việt</h1>
          <p className="text-white/70 text-sm max-w-lg">
            Khám phá toàn bộ vũ trụ âm nhạc Việt Nam — từ V-Pop, Rap Việt, Indie cho đến Bolero truyền thống
          </p>
        </div>
      </div>

      {/* Category Chips */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thể loại</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {/* "Tất cả" chip */}
          <button
            onClick={() => setActiveCategory("Tất cả")}
            className={`col-span-1 h-16 rounded-xl font-bold text-sm transition-all ${
              activeCategory === "Tất cả"
                ? "bg-nct-primary text-white shadow-lg shadow-cyan-500/30 scale-105"
                : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            Tất cả
          </button>

          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`relative col-span-1 h-16 rounded-xl overflow-hidden font-bold text-sm transition-all ${
                activeCategory === cat.name ? "ring-2 ring-nct-primary scale-105" : "opacity-90 hover:opacity-100"
              }`}
            >
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-70`} />
              <span className="relative z-10 text-white text-xs font-black drop-shadow">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {filteredSections.map(section => (
        <div key={section.title}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{section.title}</h2>
            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#b3b3b3] hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
              Tất cả <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {section.playlists.map(item => (
              <PlaylistCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
