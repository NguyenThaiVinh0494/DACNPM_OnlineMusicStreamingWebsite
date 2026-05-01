import { FiPlay, FiPause, FiHeart, FiMoreHorizontal, FiCheck } from "react-icons/fi";

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
  const isThisSongPlaying = isCurrent && isPlaying;

  return (
    <div 
      className={`flex items-center px-4 py-2 transition-colors group rounded-md relative ${
        isSelected 
          ? 'bg-nct-primary/10 dark:bg-[#323232] border border-nct-primary/20 dark:border-transparent' 
          : 'hover:bg-gray-100 dark:hover:bg-[#2b2b2b]'
      } ${isCurrent ? 'bg-nct-primary/5 dark:bg-white/5' : ''}`}
    >
      <div className="w-12 flex items-center justify-center text-gray-500 dark:text-[#b3b3b3] font-medium text-sm">
        {!isSelected && (
          <span className={`group-hover:hidden ${isCurrent ? 'hidden' : ''}`}>
            {index + 1}
          </span>
        )}
        
        {showCheckbox ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(song.id);
            }}
            className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-gray-900 dark:bg-white block shadow-sm' 
                : 'border border-gray-300 dark:border-[#666666] bg-transparent hidden group-hover:flex'
            }`}
          >
            {isSelected && <FiCheck className="w-3.5 h-3.5 text-white dark:text-[#282828] font-bold" strokeWidth={3} />}
          </button>
        ) : (
          <button 
            className={`hidden group-hover:block text-gray-900 dark:text-white ${isCurrent ? '!block text-nct-primary' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(song);
            }}
          >
            {isThisSongPlaying ? <FiPause className="w-4 h-4 fill-current" /> : <FiPlay className="w-4 h-4 fill-current" />}
          </button>
        )}
      </div>
      
      <div className="flex-1 flex items-center gap-3 pr-4 min-w-0">
        <div 
          className="relative w-10 h-10 rounded object-cover cursor-pointer shrink-0 group/play shadow-sm"
          onClick={() => onPlay?.(song)}
        >
          <img src={song.image} alt={song.title} className="w-full h-full rounded object-cover" />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100'}`}>
            {isThisSongPlaying ? <FiPause className="w-4 h-4 text-white fill-current" /> : <FiPlay className="w-4 h-4 text-white fill-current" />}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span 
            className={`font-medium truncate cursor-pointer transition-colors ${isCurrent ? 'text-nct-primary' : 'text-gray-900 dark:text-white'}`}
            onClick={() => onPlay?.(song)}
          >
            {song.title}
          </span>
        </div>
      </div>
      
      <div className="w-1/4 text-gray-500 dark:text-[#b3b3b3] text-sm hover:underline hover:text-nct-primary cursor-pointer truncate pr-4 hidden sm:block">
        {song.artist}
      </div>

      <div className="w-24 flex items-center justify-end relative text-gray-500 dark:text-[#b3b3b3] text-sm group-hover:opacity-0">
        {song.duration}
      </div>

      {/* Hover Actions */}
      <div className={`absolute right-4 flex items-center justify-end gap-2 pr-4 transition-opacity dropdown-container ${openDropdown === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(song);
          }}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white"
          title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <FiHeart className={`w-4 h-4 ${isFavorite ? 'text-nct-primary fill-nct-primary' : ''}`} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMore?.(song.id);
          }}
          className={`p-2 rounded-full transition-colors relative ${openDropdown === song.id ? 'bg-nct-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-[#b3b3b3] hover:text-gray-900 dark:hover:text-white'}`}
          title="Thêm"
        >
          <FiMoreHorizontal className="w-4 h-4" />
        </button>

        {openDropdown === song.id && dropdownContent}
      </div>
    </div>
  );
}
