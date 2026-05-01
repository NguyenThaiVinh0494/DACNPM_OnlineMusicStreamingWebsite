import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";

export default function Top100() {
  const sections = [
    {
      title: "Top 100 Nhạc Việt Nam",
      playlists: [
        { id: 101, title: "Top 100 Nhạc Trẻ", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop" },
        { id: 102, title: "Top 100 Nhạc Trữ Tình", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
        { id: 103, title: "Top 100 Nhạc Rap Việt", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=400&h=400&fit=crop" },
        { id: 104, title: "Top 100 Nhạc Rock Việt", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop" },
        { id: 105, title: "Top 100 Nhạc Dance Việt", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop" },
      ]
    },
    {
      title: "Top 100 Nhạc Âu Mỹ",
      playlists: [
        { id: 201, title: "Top 100 Pop Âu Mỹ", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
        { id: 202, title: "Top 100 Rock Âu Mỹ", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
        { id: 203, title: "Top 100 Rap Âu Mỹ", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop" },
      ]
    },
    {
      title: "Top 100 Nhạc Châu Á",
      playlists: [
        { id: 301, title: "Top 100 K-Pop", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
        { id: 302, title: "Top 100 J-Pop", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop" },
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-3 text-gray-500 dark:text-[#b3b3b3] text-sm uppercase font-bold tracking-widest">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Khám phá</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Top 100</span>
      </div>

      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center p-12 shadow-xl">
        <div className="z-10">
          <h2 className="text-5xl font-bold text-white mb-4">TOP 100</h2>
          <p className="text-xl text-white/80 max-w-lg">Bảng xếp hạng 100 bài hát hot nhất theo từng thể loại được cập nhật hàng tuần.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=800&h=800&fit=crop" className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-nct-primary pl-4">{section.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {section.playlists.map(playlist => (
              <div key={playlist.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-white/5">
                  <img 
                    src={playlist.image} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-nct-primary text-white flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      <FiPlay className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>
                  <Link to={`/playlist/${playlist.id}`} className="absolute inset-0 z-10"></Link>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate hover:text-nct-primary transition-colors">{playlist.title}</h4>
                <p className="text-sm text-gray-500 dark:text-[#b3b3b3] truncate">{playlist.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
