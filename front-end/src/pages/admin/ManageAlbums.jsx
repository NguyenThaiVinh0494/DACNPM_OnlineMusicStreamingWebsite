import ManageMusic from './ManageMusic';

export default function ManageAlbums() {
  return (
    <ManageMusic
      initialEntity="albums"
      hideTabs
      pageTitle="Quản lý album"
    />
  );
}
