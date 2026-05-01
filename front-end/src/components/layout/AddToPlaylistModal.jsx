import { useMusic } from "../../context/MusicContext";
import { FiX, FiPlus, FiMusic } from "react-icons/fi";

export default function AddToPlaylistModal() {
  const { isAddPlaylistModalOpen, closeAddToPlaylistModal, myPlaylists, addSongToMyPlaylist, songToAdd } = useMusic();

  if (!isAddPlaylistModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeAddToPlaylistModal}
      ></div>
      
      <div className="relative bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh]">
        <button 
          onClick={closeAddToPlaylistModal}
          className="absolute top-4 right-4 p-2 text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add to playlists</h3>

        <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
          {myPlaylists.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-nct-text-dim flex flex-col items-center">
              <FiMusic className="w-12 h-12 mb-3 opacity-20" />
              <p>You haven't created any playlists yet.</p>
              <p className="text-sm mt-1">Create one from the sidebar first!</p>
            </div>
          ) : (
            myPlaylists.map(playlist => {
              const isAdded = playlist.songs.some(s => s.id === songToAdd?.id);
              
              return (
                <div key={playlist.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                    {playlist.image ? (
                      <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
                    ) : (
                      <FiMusic className="w-5 h-5 text-gray-400 dark:text-white/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 dark:text-white font-medium truncate">{playlist.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-nct-text-dim">{playlist.songs.length} songs</p>
                  </div>
                  <button
                    disabled={isAdded}
                    onClick={() => addSongToMyPlaylist(playlist.id, songToAdd)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 border ${
                      isAdded 
                        ? 'bg-transparent border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/50 cursor-not-allowed' 
                        : 'bg-transparent border-gray-300 dark:border-white/30 text-gray-700 dark:text-white hover:border-nct-primary hover:text-nct-primary'
                    }`}
                  >
                    {isAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
