import Footer from "../components/layout/Footer";

export default function Home() {
  const topics = [
    { name: "Pop", color: "from-purple-500 to-indigo-500", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop" },
    { name: "Buồn", color: "from-orange-700 to-orange-900", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { name: "Pop Ballad", color: "from-rose-400 to-orange-300", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop" },
    { name: "Nhạc Trẻ", color: "from-teal-400 to-teal-600", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { name: "Bolero", color: "from-indigo-800 to-purple-800", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { name: "Rap Việt", color: "from-violet-600 to-purple-900", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=200&h=200&fit=crop" },
    { name: "Nhạc Hàn", color: "from-slate-700 to-slate-900", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop" },
    { name: "TikTok", color: "from-black to-gray-900", image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=200&fit=crop" },
    { name: "Remix", color: "from-blue-600 to-purple-600", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
    { name: "Nhạc Hoa", color: "from-amber-600 to-orange-800", image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=200&h=200&fit=crop" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Chào buổi chiều</h2>
      
      {/* Banners */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-48 relative group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=800&h=300&fit=crop" 
            alt="Banner 1" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <h3 className="text-2xl font-bold text-white">Daydream on Sofa</h3>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden h-48 relative group cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center p-8">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Nghe nhạc, hát hò</h3>
            <p className="text-white/90 mb-4">giải trí đỉnh cao cùng NCT TV</p>
            <button className="bg-white text-emerald-600 px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Chủ Đề</h3>
          <button className="text-sm text-nct-text-dim hover:text-white uppercase font-medium tracking-wider">Thêm</button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {topics.map((topic, index) => (
            <div 
              key={index} 
              className={`h-24 rounded-lg bg-gradient-to-br ${topic.color} relative overflow-hidden group cursor-pointer`}
            >
              <h4 className="absolute top-3 left-3 text-white font-bold text-lg z-10">{topic.name}</h4>
              <img 
                src={topic.image} 
                alt={topic.name} 
                className="absolute -right-4 -bottom-2 w-16 h-16 object-cover rounded-md rotate-[25deg] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
