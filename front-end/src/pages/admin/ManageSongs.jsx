import ManageMusic from './ManageMusic';

export default function ManageSongs() {
  return (
    <ManageMusic
      initialEntity="songs"
      hideTabs
      pageTitle="Quản lý bài hát"
    />
  );
}
