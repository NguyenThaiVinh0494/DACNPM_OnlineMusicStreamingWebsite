import ManageMusic from './ManageMusic';

export default function ManageTopics() {
  return (
    <ManageMusic
      initialEntity="genres"
      hideTabs
      pageTitle="Quản lý thể loại"
    />
  );
}
