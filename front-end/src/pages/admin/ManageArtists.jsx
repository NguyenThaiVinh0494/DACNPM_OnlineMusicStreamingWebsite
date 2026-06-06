import ManageMusic from './ManageMusic';

export default function ManageArtists() {
  return (
    <ManageMusic
      initialEntity="artists"
      hideTabs
      pageTitle="Quản lý nghệ sĩ"
    />
  );
}
