import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import ForYou from "./pages/ForYou";
import MyMusic from "./pages/MyMusic";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="for-you" element={<ForYou />} />
          <Route path="my-music" element={<MyMusic />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;