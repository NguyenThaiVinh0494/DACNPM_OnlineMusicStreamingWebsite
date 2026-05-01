import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AddToPlaylistModal from "./components/layout/AddToPlaylistModal";
import Home from "./pages/Home";
import ForYou from "./pages/ForYou";
import MyMusic from "./pages/mymusic/MyMusic";
import Favorites from "./pages/mymusic/Favorites";
import Recent from "./pages/mymusic/Recent";
import PlaylistDetail from "./pages/PlaylistDetail";
import MyPlaylistDetail from "./pages/mymusic/MyPlaylistDetail";

import PopularPlaylists from "./pages/discover/PopularPlaylists";
import MoodPlaylists from "./pages/discover/MoodPlaylists";
import Top100 from "./pages/discover/Top100";
import MoodTopics from "./pages/discover/MoodTopics";

function App() {
  return (
    <BrowserRouter>
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

          <Route path="my-music" element={<Outlet />}>
            <Route index element={<MyMusic />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="recent" element={<Recent />} />
            <Route path="playlist/:id" element={<MyPlaylistDetail />} />
          </Route>
          <Route path="playlist/:id" element={<PlaylistDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;