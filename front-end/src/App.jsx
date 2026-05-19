import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AddToPlaylistModal from "./components/layout/AddToPlaylistModal";
import Home from "./pages/Home";
import ForYou from "./pages/ForYou";
import MyMusic from "./pages/mymusic/MyMusic";
import Favorites from "./pages/mymusic/Favorites";
import Recent from "./pages/mymusic/Recent";
import PlaylistDetail from "./pages/PlaylistDetail";
import MyPlaylistDetail from "./pages/mymusic/MyPlaylistDetail";
import SongDetail from "./pages/songs/SongDetail";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageSongs from "./pages/admin/ManageSongs";
import ManageAlbums from "./pages/admin/ManageAlbums";
import ManageArtists from "./pages/admin/ManageArtists";
import ManageTopics from "./pages/admin/ManageTopics";
import PendingUploads from "./pages/admin/PendingUploads";
import AdminStats from "./pages/admin/AdminStats";

import PopularPlaylists from "./pages/discover/PopularPlaylists";
import MoodPlaylists from "./pages/discover/MoodPlaylists";
import Top100 from "./pages/discover/Top100";
import MoodTopics from "./pages/discover/MoodTopics";
import VuTruNhacViet from "./pages/discover/VuTruNhacViet";
import NewReleases from "./pages/discover/NewReleases";
import SearchResults from "./pages/SearchResults";
import AlbumDetail from "./pages/albums/AlbumDetail";
import ArtistDetail from "./pages/artists/ArtistDetail";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-left" 
        toastOptions={{ 
          style: { background: '#333', color: '#fff' },
          className: 'dark:bg-nct-bg dark:text-white bg-white text-gray-900 border border-gray-200 dark:border-white/10'
        }} 
      />
      <AddToPlaylistModal />
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
          <Route path="pending" element={<PendingUploads />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
