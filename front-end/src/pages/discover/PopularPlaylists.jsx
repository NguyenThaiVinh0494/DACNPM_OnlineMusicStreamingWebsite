import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { albumService } from "../../api/services";
import { optimizeCloudinaryImage } from "../../utils/media";

const mapAlbumItem = (album) => ({
  id: album.id,
  title: album.tieu_de || album.title,
  artist: album.id_nghe_si_detail?.ten_nghe_si || "Nhiều nghệ sĩ",
  image: album.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
  totalLikes: album.tong_luot_thich ?? 0,
});

function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="group cursor-pointer">
      <div className="relative aspect-square rounded-3xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 shadow-sm">
        <img
          src={optimizeCloudinaryImage(album.image, { width: 400, height: 400 })}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{album.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{album.artist}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{album.totalLikes ?? 0} lượt thích</p>
      </div>
    </Link>
  );
}

export default function PopularPlaylists() {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchPopular = async () => {
      setLoading(true);
      try {
        const data = await albumService.getAll({ trang_thai: 'PUBLIC', ordering: '-tong_luot_thich', limit: 50 });
        if (!active) return;
        const rawAlbums = data.results || data || [];
        setAlbums(rawAlbums.map(mapAlbumItem));
      } catch (error) {
        console.error("Lỗi khi tải Đang được yêu thích:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPopular();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('popular_albums', 'Đang được yêu thích')}</h2>

      {loading ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-100 dark:bg-white/5">
          <span className="text-gray-500">{t('loading_content', 'Đang tải nội dung...')}</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
          {t('no_albums_found', 'Không tìm thấy album nào.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
