import ManageMusic from './ManageMusic';

export default function ManageSongs() {
  return (
    <ManageMusic
      initialEntity="songs"
      hideTabs
      pageTitle="Quản lý bài hát"
      pageDescription="Tạo và cập nhật bài hát với upload trực tiếp, đồng thời cho phép gán nhiều ca sĩ cho một bài."
    />
  );
}
