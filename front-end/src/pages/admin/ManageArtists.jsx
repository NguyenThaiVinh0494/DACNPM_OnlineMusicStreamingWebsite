import ManageMusic from './ManageMusic';

export default function ManageArtists() {
  return (
    <ManageMusic
      initialEntity="artists"
      hideTabs
      pageTitle="Quản lý nghệ sĩ"
      pageDescription="Quản lý hồ sơ nghệ sĩ riêng biệt, gồm ảnh đại diện, tiểu sử và liên kết dữ liệu bài hát/album."
    />
  );
}
