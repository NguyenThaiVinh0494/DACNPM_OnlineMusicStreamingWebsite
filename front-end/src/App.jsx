import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AddToPlaylistModal from "./components/layout/AddToPlaylistModal";
import Home from "./pages/Home";
import ForYou from "./pages/ForYou";
import MyMusic from "./pages/MyMusic";
import Favorites from "./pages/Favorites";
import Recent from "./pages/Recent";
import PlaylistDetail from "./pages/PlaylistDetail";
import MyPlaylistDetail from "./pages/MyPlaylistDetail";

function App() {
  return (
    <BrowserRouter>
      <AddToPlaylistModal />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="for-you" element={<ForYou />} />
          <Route path="my-music" element={<MyMusic />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="recent" element={<Recent />} />
          <Route path="playlist/:id" element={<PlaylistDetail />} />
          <Route path="my-playlist/:id" element={<MyPlaylistDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;