import ManageMusic from './ManageMusic';

export default function ManageTopics() {
  return (
    <ManageMusic
      initialEntity="genres"
      hideTabs
      pageTitle="Quản lý chủ đề"
      pageDescription="Quản lý topic/TheLoai với ảnh đại diện, tên, mô tả và các bài hát liên quan."
    />
  );
}
