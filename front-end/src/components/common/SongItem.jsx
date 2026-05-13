import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiPause, FiHeart, FiMoreHorizontal, FiCheck } from "react-icons/fi";
import SongActionMenu from "./SongActionMenu";

export default function SongItem({ 
  song, 
  index,
  isCurrent, 
  isPlaying, 
  isFavorite,
  isSelected,
  showCheckbox = false,
  onPlay, 
  onToggleFavorite, 
  onToggleSelect,
  onMore,
  openDropdown,
  dropdownContent
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const isThisSongPlaying = isCurrent && isPlaying;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    if (onMore) {
      onMore(song.id);
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div 
      className={`flex items-center gap-4 px-3 py-2 transition-all group rounded relative cursor-pointer h-[56px] border-b border-transparent ${
        isCurrent 
          ? 'bg-nct-primary/10 dark:bg-white/10' 
          : isSelected 
            ? 'bg-gray-200 dark:bg-[#323232]' 
            : 'hover:bg-gray-100 dark:hover:bg-[#2b2b2b]'
      }`}
      onClick={() => navigate(`/song/${song.id || 1}`)}
    >
      {/* Index or Checkbox */}
      <div className="w-10 flex items-center justify-center shrink-0">
        {showCheckbox ? (
          <div className="relative w-[18px] h-[18px]">
             {/* Show index normally, hidden on hover or if selected */}
            {!isSelected && (
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-nct-text-dim group-hover:hidden">
                {index !== undefined ? index + 1 : ''}
              </span>
            )}
            
            {/* Checkbox: shown on hover or if selected */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(song.id);
              }}
              className={`w-[18px] h-[18px] rounded border transition-all flex items-center justify-center ${
                isSelected 
                  ? 'bg-white border-white' 
                  : 'border-gray-400 dark:border-white/20 bg-transparent hidden group-hover:flex'
              }`}
            >
              {isSelected && <FiCheck className="w-3.5 h-3.5 text-black font-bold" strokeWidth={4} />}
            </button>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-500 dark:text-nct-text-dim">
            {index !== undefined ? index + 1 : ''}
          </div>
        )}
      </div>

      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 shadow-md">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(song);
          }}
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {isThisSongPlaying ? <FiPause className="w-5 h-5 text-white fill-current" /> : <FiPlay className="w-5 h-5 text-white fill-current" />}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <span className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-nct-primary' : 'text-gray-900 dark:text-white'}`}>
          {song.title}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
           <span className="text-[12px] text-gray-500 dark:text-nct-text-dim truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {song.artist}
          </span>
        </div>
      </div>

      {/* Duration - hidden on hover to show buttons if needed, but NhacCuaTui usually keeps it */}
      <div className={`w-16 text-right text-sm text-gray-500 dark:text-nct-text-dim ${isCurrent ? 'text-nct-primary' : ''}`}>
        {song.duration}
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(song);
          }}
          className="p-2 text-gray-400 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors"
          title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <FiHeart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
        </button>
        
        <div className="relative dropdown-container" ref={menuRef}>
          <button 
            onClick={handleDropdownClick}
            className={`p-2 rounded-full transition-colors ${showMenu || openDropdown === song.id ? 'bg-nct-primary/20 text-nct-primary' : 'text-gray-400 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}
          >
            <FiMoreHorizontal className="w-5 h-5" />
          </button>

          {(showMenu || openDropdown === song.id) && (
            dropdownContent || (
              <SongActionMenu 
                song={song} 
                onClose={() => setShowMenu(false)} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
