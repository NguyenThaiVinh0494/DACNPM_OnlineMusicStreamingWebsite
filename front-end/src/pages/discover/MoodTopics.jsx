import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMusic } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { genreService } from "../../api/services";

// Gradient colors to assign to genres
const GRADIENT_COLORS = [
  "from-teal-400 to-emerald-500",
  "from-purple-500 to-indigo-600",
  "from-rose-400 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-600",
  "from-emerald-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-indigo-500 to-purple-600",
  "from-lime-400 to-green-500",
  "from-pink-400 to-rose-500",
  "from-yellow-500 to-amber-500",
  "from-slate-600 to-gray-700",
  "from-emerald-600 to-teal-700",
  "from-blue-600 to-indigo-700",
  "from-red-600 to-rose-700",
];

// Fallback images for genres without cover images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop",
];

const TopicCard = ({ item }) => (
  <Link
    to={`/genre/${item.id}`}
    className={`h-28 rounded-lg bg-gradient-to-br ${item.color} relative overflow-hidden group cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] transition-all`}
  >
    <h4 className="absolute top-3 left-4 text-white font-bold text-lg z-10 drop-shadow-md">{item.name}</h4>
    <img
      src={item.image}
      alt={item.name}
      className="absolute -right-4 -bottom-2 w-20 h-20 object-cover rounded-md rotate-[25deg] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg"
    />
  </Link>
);

export default function MoodTopics() {
  const { t } = useTranslation();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const data = await genreService.getAll();
        const genreList = data.results || data;
        // Map genres to topic card format
        const mapped = genreList.map((genre, index) => ({
          id: genre.id,
          name: genre.ten_the_loai,
          color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
          image: genre.anh_the_loai || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        }));
        setGenres(mapped);
      } catch (error) {
        console.error("Lỗi khi tải thể loại:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-nct-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (genres.length === 0) {
    return (
      <div className="space-y-10 pb-20 mt-2">
        <h2 className="text-3xl font-bold text-black dark:text-white mb-6">{t('topics_page_title', 'Tất cả thể loại')}</h2>
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
          <FiMusic className="w-10 h-10 opacity-30" />
          <p className="font-medium">Chưa có thể loại nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 mt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black dark:text-white">{t('topics_page_title', 'Tất cả thể loại')}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {genres.length} {t('genres', 'thể loại')}
        </span>
      </div>

      {/* All Genres Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {genres.map(item => <TopicCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
