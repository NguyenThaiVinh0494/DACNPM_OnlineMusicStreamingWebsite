import ManageMusic from './ManageMusic';

export default function ManageTopics() {
  return (
    <ManageMusic
      initialEntity="genres"
      hideTabs
      pageTitle="Quản lý thể loại"
      pageDescription="Quản lý thể loại với ảnh đại diện, tên, mô tả và các bài hát liên quan."
    />
  );
}
