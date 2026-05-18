import ManageMusic from './ManageMusic';

export default function ManageAlbums() {
  return (
    <ManageMusic
      initialEntity="albums"
      hideTabs
      pageTitle="Quản lý album"
      pageDescription="Mỗi album vẫn thuộc về một nghệ sĩ chính, với form upload ảnh bìa và metadata riêng."
    />
  );
}
