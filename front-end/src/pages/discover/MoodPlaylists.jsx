import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";

export default function MoodPlaylists() {
  const categories = [
    { name: "Chill", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
    { name: "Buồn", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop" },
    { name: "Hạnh Phúc", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop" },
    { name: "Tập Trung", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
    { name: "Tiệc Tùng", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop" },
  ];

  const playlists = [
    { id: 1, title: "Lofi Cho Ngày Mưa", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
    { id: 2, title: "Coffee & Books", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop" },
    { id: 3, title: "Deep Focus", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
    { id: 4, title: "Happy Vibes", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=400&h=400&fit=crop" },
    { id: 5, title: "Night Drive", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
    { id: 6, title: "Sad Melodies", artist: "Nhiều nghệ sĩ", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=400&h=400&fit=crop" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 text-gray-500 dark:text-[#b3b3b3] text-sm uppercase font-bold tracking-widest">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Khám phá</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Tâm trạng hôm nay</span>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tâm trạng hôm nay</h2>

      {/* Mood Categories Mini-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map(cat => (
          <div key={cat.name} className="relative h-20 rounded-xl overflow-hidden cursor-pointer group">
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white uppercase tracking-wider">
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map(playlist => (
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate hover:text-nct-primary transition-colors">{playlist.title}</h3>
            <p className="text-sm text-gray-500 dark:text-[#b3b3b3] truncate">{playlist.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
