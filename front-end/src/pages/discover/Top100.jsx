import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { albumService } from "../../api/services";
import { optimizeCloudinaryImage } from "../../utils/media";

const mapAlbumItem = (album) => ({
  id: album.id,
  title: album.tieu_de || album.title,
  artist: album.id_nghe_si_detail?.ten_nghe_si || "Nhiều nghệ sĩ",
  image: album.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
  totalPlays: album.tong_luot_nghe ?? 0,
});

function AlbumCard({ album, rank }) {
  return (
    <Link to={`/album/${album.id}`} className="group cursor-pointer">
      <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 bg-gray-100 dark:bg-white/5 shadow-sm">
        <img
          src={optimizeCloudinaryImage(album.image, { width: 400, height: 400 })}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 text-xs font-bold text-gray-900 px-3 py-1 shadow-sm">
          #{rank}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{album.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{album.artist}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{album.totalPlays ?? 0} lượt nghe</p>
      </div>
    </Link>
  );
}

export default function Top100() {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTopAlbums = async () => {
      setLoading(true);
      try {
        const data = await albumService.getAll({ trang_thai: 'PUBLIC', ordering: '-tong_luot_nghe', limit: 100 });
        if (!active) return;
        const rawAlbums = data.results || data || [];
        setAlbums(rawAlbums.map(mapAlbumItem));
      } catch (error) {
        console.error("Lỗi khi tải Top 100:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTopAlbums();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pb-24 space-y-10">
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center p-12 shadow-xl">
        <div className="z-10 max-w-2xl">
          <h2 className="text-5xl font-bold text-white mb-4">TOP 100</h2>
          <p className="text-xl text-white/80 max-w-lg">{t('top_100_description', 'Bảng xếp hạng 100 album và tuyển tập được nghe nhiều nhất theo lượt nghe thực tế.')}</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=800&h=800&fit=crop" className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-100 dark:bg-white/5">
          <span className="text-gray-500">{t('loading_content', 'Đang tải nội dung...')}</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
          {t('no_albums_found', 'Không tìm thấy album nào.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <AlbumCard key={album.id} album={album} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
