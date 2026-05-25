import { lazy, Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AddToPlaylistModal from "./components/layout/AddToPlaylistModal";
import LoginModal from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import { Toaster } from "react-hot-toast";

const Home = lazy(() => import("./pages/Home"));
const ForYou = lazy(() => import("./pages/ForYou"));
const MyMusic = lazy(() => import("./pages/mymusic/MyMusic"));
const Favorites = lazy(() => import("./pages/mymusic/Favorites"));
const Recent = lazy(() => import("./pages/mymusic/Recent"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail"));
const MyPlaylistDetail = lazy(() => import("./pages/mymusic/MyPlaylistDetail"));
const SongDetail = lazy(() => import("./pages/songs/SongDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageSongs = lazy(() => import("./pages/admin/ManageSongs"));
const ManageAlbums = lazy(() => import("./pages/admin/ManageAlbums"));
const ManageArtists = lazy(() => import("./pages/admin/ManageArtists"));
const ManageTopics = lazy(() => import("./pages/admin/ManageTopics"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const PopularPlaylists = lazy(() => import("./pages/discover/PopularPlaylists"));
const MoodPlaylists = lazy(() => import("./pages/discover/MoodPlaylists"));
const Top100 = lazy(() => import("./pages/discover/Top100"));
const MoodTopics = lazy(() => import("./pages/discover/MoodTopics"));
const VuTruNhacViet = lazy(() => import("./pages/discover/VuTruNhacViet"));
const NewReleases = lazy(() => import("./pages/discover/NewReleases"));
const GenreDetail = lazy(() => import("./pages/discover/GenreDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AlbumDetail = lazy(() => import("./pages/albums/AlbumDetail"));
const ArtistDetail = lazy(() => import("./pages/artists/ArtistDetail"));

const pageFallback = (
  <div className="flex min-h-48 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
    Đang tải nội dung...
  </div>
);

function App() {
  const { authModal, closeAuthModal, openLoginModal, openRegisterModal } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-left" 
        toastOptions={{ 
          style: { background: '#333', color: '#fff' },
          className: 'dark:bg-nct-bg dark:text-white bg-white text-gray-900 border border-gray-200 dark:border-white/10'
        }} 
      />
      <LoginModal
        isOpen={authModal === 'login'}
        onClose={closeAuthModal}
        onSwitchToRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={authModal === 'register'}
        onClose={closeAuthModal}
        onSwitchToLogin={openLoginModal}
      />
      <AddToPlaylistModal />
      <Suspense fallback={pageFallback}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="for-you" element={<ForYou />} />

            {/* Discover Routes */}
            <Route path="discover/popular" element={<PopularPlaylists />} />
            <Route path="discover/mood" element={<MoodPlaylists />} />
            <Route path="discover/topics" element={<MoodTopics />} />
            <Route path="top-100" element={<Top100 />} />
            <Route path="discover/vu-tru-nhac-viet" element={<VuTruNhacViet />} />
            <Route path="discover/new-releases" element={<NewReleases />} />
            <Route path="genre/:id" element={<GenreDetail />} />

            <Route path="my-music" element={<ProtectedRoute />}>
              <Route index element={<MyMusic />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="recent" element={<Recent />} />
              <Route path="playlist/:id" element={<MyPlaylistDetail />} />
            </Route>
            <Route path="playlist/:id" element={<PlaylistDetail />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="album/:id" element={<AlbumDetail />} />
            <Route path="artist/:id" element={<ArtistDetail />} />
            <Route path="song/:id" element={<SongDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="songs" element={<ManageSongs />} />
            <Route path="albums" element={<ManageAlbums />} />
            <Route path="artists" element={<ManageArtists />} />
            <Route path="topics" element={<ManageTopics />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="pending" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
