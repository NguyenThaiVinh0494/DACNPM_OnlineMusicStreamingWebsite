from datetime import timedelta
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .backends import EmailOrUsernameModelBackend
from .models import Album, BaiHat, DanhSachPhat, LichSuNghe, NgheSi, TheLoai, YeuThich


class BackfillSongDurationsCommandTests(TestCase):
    def setUp(self):
        uploader = get_user_model().objects.create_user(
            username='duration-admin',
            email='duration-admin@example.com',
            password='secret123',
        )
        self.song = BaiHat.objects.create(
            tieu_de='Legacy audio',
            duong_dan_am_thanh='https://res.cloudinary.com/demo/video/upload/v123/music_streaming/audio/legacy.mp3',
            duong_dan_hinh_anh='https://example.com/song.jpg',
            trang_thai='PUBLIC',
            id_nguoi_dang=uploader,
        )

    @patch('api.management.commands.backfill_song_durations.cloudinary.api.resource')
    def test_command_fills_duration_from_cloudinary_metadata(self, mocked_resource):
        mocked_resource.return_value = {'duration': 276.2}

        call_command('backfill_song_durations', stdout=StringIO())

        self.song.refresh_from_db()
        self.assertEqual(self.song.thoi_luong, 276)
        mocked_resource.assert_called_once_with(
            'music_streaming/audio/legacy',
            resource_type='video',
            image_metadata=True,
            pages=True,
        )


class RecommendedSongsApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username='listener', email='listener@example.com', password='secret123')
        self.uploader = self.user_model.objects.create_user(username='uploader', email='uploader@example.com', password='secret123')
        self.artist_a = NgheSi.objects.create(ten_nghe_si='Artist A', anh_nghe_si='https://example.com/a.jpg')
        self.artist_b = NgheSi.objects.create(ten_nghe_si='Artist B', anh_nghe_si='https://example.com/b.jpg')
        self.genre_a = TheLoai.objects.create(ten_the_loai='Pop')
        self.genre_b = TheLoai.objects.create(ten_the_loai='Rock')
        self.url = reverse('bai-hat-recommended')

    def create_song(self, title, artist, plays, status_value='PUBLIC', genre=None):
        song = BaiHat.objects.create(
            tieu_de=title,
            duong_dan_am_thanh=f'https://example.com/{title}.mp3',
            duong_dan_hinh_anh=f'https://example.com/{title}.jpg',
            luot_nghe=plays,
            trang_thai=status_value,
            id_nguoi_dang=self.uploader,
        )
        song.cac_nghe_si.add(artist)
        if genre:
            song.the_loais.add(genre)
        return song

    def test_recommended_returns_public_songs_sorted_by_popularity_for_guest(self):
        top_song = self.create_song('top-song', self.artist_b, 900, genre=self.genre_b)
        mid_song = self.create_song('mid-song', self.artist_a, 500, genre=self.genre_a)
        self.create_song('hidden-song', self.artist_a, 5000, status_value='PENDING', genre=self.genre_a)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data[:2]], [top_song.id, mid_song.id])
        self.assertNotIn('hidden-song', [item['tieu_de'] for item in response.data])

    def test_recommended_prioritizes_user_signals_when_authenticated(self):
        favorite_song = self.create_song('favorite-song', self.artist_a, 50, genre=self.genre_a)
        same_artist_song = self.create_song('same-artist-song', self.artist_a, 40, genre=self.genre_a)
        popular_other_song = self.create_song('popular-other-song', self.artist_b, 1000, genre=self.genre_b)

        YeuThich.objects.create(id_nguoi_dung=self.user, id_bai_hat=favorite_song)
        LichSuNghe.objects.create(id_nguoi_dung=self.user, id_bai_hat=favorite_song)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ordered_ids = [item['id'] for item in response.data[:3]]
        self.assertEqual(ordered_ids[0], favorite_song.id)
        self.assertIn(same_artist_song.id, ordered_ids[:2])
        self.assertIn(popular_other_song.id, ordered_ids)

    def test_recommended_ignores_removed_manual_preference_query_params(self):
        preferred_song = self.create_song('preferred-song', self.artist_a, 10, genre=self.genre_a)
        other_song = self.create_song('other-song', self.artist_b, 900, genre=self.genre_b)

        response = self.client.get(
            self.url,
            {
                'preferred_artist_ids': str(self.artist_a.id),
                'preferred_genre_ids': str(self.genre_a.id),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ordered_ids = [item['id'] for item in response.data[:2]]
        self.assertEqual(ordered_ids, [other_song.id, preferred_song.id])

    def test_song_detail_includes_favorite_count_and_user_state(self):
        song = self.create_song('liked-song', self.artist_a, 10, genre=self.genre_a)
        YeuThich.objects.create(id_nguoi_dung=self.user, id_bai_hat=song)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse('bai-hat-detail', kwargs={'pk': song.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['so_luot_thich'], 1)
        self.assertTrue(response.data['da_thich'])

    def test_listen_action_increments_play_count_and_records_history_for_user(self):
        song = self.create_song('listen-song', self.artist_a, 3, genre=self.genre_a)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse('bai-hat-listen', kwargs={'pk': song.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['luot_nghe'], 4)
        self.assertTrue(response.data['counted'])
        song.refresh_from_db()
        self.assertEqual(song.luot_nghe, 4)
        self.assertEqual(LichSuNghe.objects.filter(id_nguoi_dung=self.user, id_bai_hat=song).count(), 1)

        history_response = self.client.get(reverse('lich-su-nghe-list'))
        self.assertEqual(history_response.status_code, status.HTTP_200_OK)
        self.assertEqual(history_response.data[0]['song_detail']['id'], song.id)

    def test_listen_cooldown_prevents_duplicate_counts_and_history(self):
        song = self.create_song('repeat-listen-song', self.artist_a, 3, genre=self.genre_a)
        self.client.force_authenticate(user=self.user)
        url = reverse('bai-hat-listen', kwargs={'pk': song.id})

        first_response = self.client.post(url)
        second_response = self.client.post(url)

        self.assertTrue(first_response.data['counted'])
        self.assertFalse(second_response.data['counted'])
        self.assertEqual(second_response.data['luot_nghe'], 4)
        self.assertEqual(LichSuNghe.objects.filter(id_nguoi_dung=self.user, id_bai_hat=song).count(), 1)

    def test_guest_listen_cooldown_prevents_refresh_spam_from_same_address(self):
        song = self.create_song('guest-listen-song', self.artist_a, 3, genre=self.genre_a)
        url = reverse('bai-hat-listen', kwargs={'pk': song.id})

        first_response = self.client.post(url, REMOTE_ADDR='127.0.0.1')
        second_response = self.client.post(url, REMOTE_ADDR='127.0.0.1')

        self.assertTrue(first_response.data['counted'])
        self.assertFalse(second_response.data['counted'])
        self.assertEqual(second_response.data['luot_nghe'], 4)
        self.assertFalse(LichSuNghe.objects.filter(id_bai_hat=song).exists())

    def test_history_remove_song_and_clear_delete_persisted_entries(self):
        first_song = self.create_song('first-history-song', self.artist_a, 3, genre=self.genre_a)
        second_song = self.create_song('second-history-song', self.artist_a, 4, genre=self.genre_a)
        LichSuNghe.objects.create(id_nguoi_dung=self.user, id_bai_hat=first_song)
        LichSuNghe.objects.create(id_nguoi_dung=self.user, id_bai_hat=second_song)
        self.client.force_authenticate(user=self.user)

        remove_response = self.client.delete(
            f"{reverse('lich-su-nghe-remove-song')}?song_id={first_song.id}",
        )

        self.assertEqual(remove_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(LichSuNghe.objects.filter(id_nguoi_dung=self.user, id_bai_hat=first_song).exists())
        self.assertTrue(LichSuNghe.objects.filter(id_nguoi_dung=self.user, id_bai_hat=second_song).exists())

        clear_response = self.client.delete(reverse('lich-su-nghe-clear'))

        self.assertEqual(clear_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(LichSuNghe.objects.filter(id_nguoi_dung=self.user).exists())

    def test_favorite_toggle_adds_and_removes_favorite_idempotently(self):
        song = self.create_song('toggle-song', self.artist_a, 3, genre=self.genre_a)
        self.client.force_authenticate(user=self.user)
        url = reverse('yeu-thich-toggle')

        add_response = self.client.post(url, {'id_bai_hat': song.id}, format='json')
        remove_response = self.client.post(url, {'id_bai_hat': song.id}, format='json')

        self.assertEqual(add_response.status_code, status.HTTP_200_OK)
        self.assertTrue(add_response.data['da_thich'])
        self.assertEqual(add_response.data['so_luot_thich'], 1)
        self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
        self.assertFalse(remove_response.data['da_thich'])
        self.assertEqual(remove_response.data['so_luot_thich'], 0)
        self.assertFalse(YeuThich.objects.filter(id_nguoi_dung=self.user, id_bai_hat=song).exists())


class AdminStatsApiTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.admin = self.user_model.objects.create_user(username='admin', email='admin@example.com', password='secret123', vai_tro='ADMIN')
        self.uploader = self.user_model.objects.create_user(username='uploader2', email='uploader2@example.com', password='secret123')
        self.artist = NgheSi.objects.create(ten_nghe_si='Stats Artist', anh_nghe_si='https://example.com/stats.jpg')
        self.genre_pop = TheLoai.objects.create(ten_the_loai='Pop')
        self.genre_rock = TheLoai.objects.create(ten_the_loai='Rock')
        self.url = reverse('api_admin_stats')

    def create_song(self, title, plays, status_value='PUBLIC', genres=None):
        song = BaiHat.objects.create(
            tieu_de=title,
            duong_dan_am_thanh=f'https://example.com/{title}.mp3',
            duong_dan_hinh_anh=f'https://example.com/{title}.jpg',
            luot_nghe=plays,
            trang_thai=status_value,
            id_nguoi_dang=self.uploader,
        )
        song.cac_nghe_si.add(self.artist)
        if genres:
            song.the_loais.add(*genres)
        return song

    def add_likes(self, song, count):
        for index in range(count):
            user = self.user_model.objects.create_user(
                username=f'liker-{song.id}-{index}',
                email=f'liker-{song.id}-{index}@example.com',
                password='secret123',
            )
            YeuThich.objects.create(id_nguoi_dung=user, id_bai_hat=song)

    def test_admin_stats_returns_top_ten_lists_and_public_genre_distribution(self):
        public_songs = [
            self.create_song(f'public-{index}', plays=index * 10, genres=[self.genre_pop])
            for index in range(1, 7)
        ]
        liked_song = self.create_song('most-liked', plays=1, genres=[self.genre_rock])
        pending_song = self.create_song('pending-song', plays=999, status_value='PENDING', genres=[self.genre_rock])
        self.add_likes(liked_song, 3)
        self.add_likes(public_songs[0], 1)
        Album.objects.create(tieu_de='Public Album', anh_bia='https://example.com/public-album.jpg', id_nghe_si=self.artist, trang_thai='PUBLIC')
        Album.objects.create(tieu_de='Pending Album', anh_bia='https://example.com/pending-album.jpg', id_nghe_si=self.artist, trang_thai='PENDING')
        LichSuNghe.objects.create(id_nguoi_dung=self.uploader, id_bai_hat=liked_song)
        old_history = LichSuNghe.objects.create(id_nguoi_dung=self.uploader, id_bai_hat=public_songs[0])
        old_history.thoi_gian_nghe = timezone.now() - timedelta(days=20)
        old_history.save(update_fields=['thoi_gian_nghe'])
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['topSongs']), 7)
        self.assertNotIn(pending_song.id, [item['id'] for item in response.data['topSongs']])
        self.assertEqual(response.data['topLikedSongs'][0]['id'], liked_song.id)
        self.assertEqual(response.data['topLikedSongs'][0]['so_luot_thich'], 3)
        self.assertEqual(response.data['totalLikes'], 4)
        self.assertEqual(response.data['contentStatus']['songs']['public'], 7)
        self.assertEqual(response.data['contentStatus']['songs']['pending'], 1)
        self.assertEqual(response.data['contentStatus']['albums']['public'], 1)
        self.assertEqual(response.data['contentStatus']['albums']['pending'], 1)
        self.assertEqual(len(response.data['listenTrend']), 14)
        self.assertEqual(response.data['listenTrend'][-1]['listens'], 1)
        self.assertEqual(response.data['topArtists'][0]['name'], self.artist.ten_nghe_si)

        genre_counts = {item['name']: item['songCount'] for item in response.data['genreDistribution']}
        self.assertEqual(genre_counts['Pop'], 6)
        self.assertEqual(genre_counts['Rock'], 1)
        genre_listens = {item['name']: item['totalListens'] for item in response.data['genreDistribution']}
        self.assertEqual(genre_listens['Rock'], 1)

        summary_response = self.client.get(reverse('api_admin_summary'))
        self.assertEqual(summary_response.status_code, status.HTTP_200_OK)
        self.assertEqual(summary_response.data['counts']['songs'], 8)
        self.assertEqual(summary_response.data['counts']['albums'], 2)
        self.assertEqual(summary_response.data['totalListens'], sum(song.luot_nghe for song in public_songs) + 1 + 999)


class ContentAccessControlApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(username='member', email='member@example.com', password='secret123')
        self.admin = user_model.objects.create_user(
            username='content-admin',
            email='content-admin@example.com',
            password='secret123',
            vai_tro='ADMIN',
        )
        self.artist = NgheSi.objects.create(ten_nghe_si='Catalog Artist', anh_nghe_si='https://example.com/artist.jpg')
        self.genre = TheLoai.objects.create(ten_the_loai='Catalog Genre', anh_the_loai='https://example.com/genre.jpg')
        self.public_album = Album.objects.create(
            tieu_de='Public Album',
            anh_bia='https://example.com/public-album.jpg',
            id_nghe_si=self.artist,
            trang_thai='PUBLIC',
        )
        self.pending_album = Album.objects.create(
            tieu_de='Pending Album',
            anh_bia='https://example.com/pending-album.jpg',
            id_nghe_si=self.artist,
            trang_thai='PENDING',
        )
        self.public_song = self.create_song('public-song', 'PUBLIC', self.public_album)
        self.hidden_track_in_public_album = self.create_song('hidden-track', 'PENDING', self.public_album)
        self.pending_song = self.create_song('pending-song', 'PENDING', self.pending_album)
        self.playlist = DanhSachPhat.objects.create(tieu_de='Mixed Playlist', id_chu_so_huu=self.user)
        self.playlist.bai_hats.add(self.public_song, self.pending_song)

    def create_song(self, title, status_value, album):
        song = BaiHat.objects.create(
            tieu_de=title,
            duong_dan_am_thanh=f'https://example.com/{title}.mp3',
            duong_dan_hinh_anh=f'https://example.com/{title}.jpg',
            trang_thai=status_value,
            id_album=album,
            id_nguoi_dang=self.admin,
        )
        song.cac_nghe_si.add(self.artist)
        song.the_loais.add(self.genre)
        return song

    def test_regular_user_cannot_modify_shared_catalog(self):
        self.client.force_authenticate(user=self.user)

        responses = [
            self.client.patch(reverse('nghe-si-detail', kwargs={'pk': self.artist.id}), {'ten_nghe_si': 'Changed'}, format='json'),
            self.client.patch(reverse('the-loai-detail', kwargs={'pk': self.genre.id}), {'ten_the_loai': 'Changed'}, format='json'),
            self.client.patch(reverse('album-detail', kwargs={'pk': self.public_album.id}), {'tieu_de': 'Changed'}, format='json'),
            self.client.post(
                reverse('album-list'),
                {
                    'tieu_de': 'New Album',
                    'anh_bia': 'https://example.com/new-album.jpg',
                    'id_nghe_si': self.artist.id,
                    'trang_thai': 'PUBLIC',
                },
                format='json',
            ),
            self.client.delete(reverse('album-detail', kwargs={'pk': self.public_album.id})),
        ]

        self.assertTrue(all(response.status_code == status.HTTP_403_FORBIDDEN for response in responses))
        self.public_album.refresh_from_db()
        self.assertEqual(self.public_album.tieu_de, 'Public Album')

    def test_admin_can_manage_and_view_pending_catalog_content(self):
        self.client.force_authenticate(user=self.admin)

        update_response = self.client.patch(
            reverse('album-detail', kwargs={'pk': self.pending_album.id}),
            {'tieu_de': 'Reviewed Pending Album'},
            format='json',
        )
        song_list_response = self.client.get(reverse('bai-hat-list'), {'trang_thai': 'PENDING'})
        album_list_response = self.client.get(reverse('album-list'), {'trang_thai': 'PENDING'})

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertIn(self.pending_song.id, [item['id'] for item in song_list_response.data])
        self.assertIn(self.pending_album.id, [item['id'] for item in album_list_response.data])

    def test_public_api_hides_pending_song_and_album_content(self):
        song_list_response = self.client.get(reverse('bai-hat-list'))
        album_list_response = self.client.get(reverse('album-list'))
        pending_song_response = self.client.get(reverse('bai-hat-detail', kwargs={'pk': self.pending_song.id}))
        pending_album_response = self.client.get(reverse('album-detail', kwargs={'pk': self.pending_album.id}))
        listen_response = self.client.post(reverse('bai-hat-listen', kwargs={'pk': self.pending_song.id}))

        self.assertEqual([item['id'] for item in song_list_response.data], [self.public_song.id])
        self.assertEqual([item['id'] for item in album_list_response.data], [self.public_album.id])
        self.assertEqual(album_list_response.data[0]['song_count'], 1)
        self.assertEqual(pending_song_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(pending_album_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(listen_response.status_code, status.HTTP_404_NOT_FOUND)
        self.pending_song.refresh_from_db()
        self.assertEqual(self.pending_song.luot_nghe, 0)

        self.client.force_authenticate(user=self.admin)
        admin_album_response = self.client.get(reverse('album-detail', kwargs={'pk': self.public_album.id}))
        self.assertEqual(admin_album_response.data['song_count'], 2)

    def test_regular_user_cannot_request_or_interact_with_pending_song(self):
        self.client.force_authenticate(user=self.user)

        filtered_response = self.client.get(reverse('bai-hat-list'), {'trang_thai': 'PENDING'})
        favorite_response = self.client.post(reverse('yeu-thich-toggle'), {'id_bai_hat': self.pending_song.id}, format='json')
        add_to_playlist_response = self.client.post(
            reverse('playlist-add-song', kwargs={'pk': self.playlist.id}),
            {'song_id': self.pending_song.id},
            format='json',
        )
        replace_playlist_songs_response = self.client.patch(
            reverse('playlist-detail', kwargs={'pk': self.playlist.id}),
            {'bai_hats': [self.pending_song.id]},
            format='json',
        )
        history_response = self.client.post(
            reverse('lich-su-nghe-list'),
            {'id_nguoi_dung': self.user.id, 'id_bai_hat': self.pending_song.id},
            format='json',
        )

        self.assertEqual(filtered_response.data, [])
        self.assertEqual(favorite_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(add_to_playlist_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(replace_playlist_songs_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(history_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_playlist_and_user_library_omit_preexisting_pending_songs(self):
        YeuThich.objects.create(id_nguoi_dung=self.user, id_bai_hat=self.pending_song)
        LichSuNghe.objects.create(id_nguoi_dung=self.user, id_bai_hat=self.pending_song)

        playlist_response = self.client.get(reverse('playlist-detail', kwargs={'pk': self.playlist.id}))
        self.assertEqual(playlist_response.data['bai_hats'], [self.public_song.id])
        self.assertEqual([item['id'] for item in playlist_response.data['bai_hats_detail']], [self.public_song.id])
        self.assertEqual(playlist_response.data['so_luong_bai_hat'], 1)

        self.client.force_authenticate(user=self.user)
        favorites_response = self.client.get(reverse('yeu-thich-list'))
        history_response = self.client.get(reverse('lich-su-nghe-list'))
        self.assertEqual(favorites_response.data, [])
        self.assertEqual(history_response.data, [])

    def test_public_song_does_not_disclose_pending_album_relation(self):
        self.public_song.id_album = self.pending_album
        self.public_song.save(update_fields=['id_album'])

        public_response = self.client.get(reverse('bai-hat-detail', kwargs={'pk': self.public_song.id}))
        self.client.force_authenticate(user=self.admin)
        admin_response = self.client.get(reverse('bai-hat-detail', kwargs={'pk': self.public_song.id}))

        self.assertIsNone(public_response.data['id_album'])
        self.assertEqual(admin_response.data['id_album']['id'], self.pending_album.id)

    def test_home_cache_does_not_expose_song_after_admin_marks_it_pending(self):
        cache.clear()
        initial_response = self.client.get(reverse('api_home'))
        self.assertIn(self.public_song.id, [item['id'] for item in initial_response.data['singleMoiPhatHanh']])

        self.client.force_authenticate(user=self.admin)
        update_response = self.client.patch(
            reverse('bai-hat-detail', kwargs={'pk': self.public_song.id}),
            {'trang_thai': 'PENDING'},
            format='json',
        )
        self.client.force_authenticate(user=None)
        refreshed_response = self.client.get(reverse('api_home'))

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertNotIn(self.public_song.id, [item['id'] for item in refreshed_response.data['singleMoiPhatHanh']])

    def test_home_cache_does_not_expose_album_after_admin_marks_it_pending(self):
        cache.clear()
        initial_response = self.client.get(reverse('api_home'))
        self.assertIn(self.public_album.id, [item['id'] for item in initial_response.data['top100']])

        self.client.force_authenticate(user=self.admin)
        update_response = self.client.patch(
            reverse('album-detail', kwargs={'pk': self.public_album.id}),
            {'trang_thai': 'PENDING'},
            format='json',
        )
        self.client.force_authenticate(user=None)
        refreshed_response = self.client.get(reverse('api_home'))

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertNotIn(self.public_album.id, [item['id'] for item in refreshed_response.data['top100']])


class PlaylistAndUploadApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='playlist-owner',
            email='playlist-owner@example.com',
            password='secret123',
        )
        self.other_user = user_model.objects.create_user(
            username='playlist-other',
            email='playlist-other@example.com',
            password='secret123',
        )
        self.admin = user_model.objects.create_user(
            username='upload-admin',
            email='upload-admin@example.com',
            password='secret123',
            vai_tro='ADMIN',
        )
        self.artist = NgheSi.objects.create(
            ten_nghe_si='Playlist Artist',
            anh_nghe_si='https://example.com/artist.jpg',
        )
        self.song = BaiHat.objects.create(
            tieu_de='Playlist Song',
            duong_dan_am_thanh='https://example.com/song.mp3',
            duong_dan_hinh_anh='https://example.com/song.jpg',
            trang_thai='PUBLIC',
            id_nguoi_dang=self.admin,
        )
        self.song.cac_nghe_si.add(self.artist)
        self.playlist = DanhSachPhat.objects.create(tieu_de='Owner Playlist', id_chu_so_huu=self.owner)

    def test_only_playlist_owner_can_add_and_remove_public_songs(self):
        add_url = reverse('playlist-add-song', kwargs={'pk': self.playlist.id})
        remove_url = reverse('playlist-remove-song', kwargs={'pk': self.playlist.id})

        self.client.force_authenticate(user=self.other_user)
        denied_response = self.client.post(add_url, {'song_id': self.song.id}, format='json')

        self.assertEqual(denied_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(self.playlist.bai_hats.filter(pk=self.song.pk).exists())

        self.client.force_authenticate(user=self.owner)
        add_response = self.client.post(add_url, {'song_id': self.song.id}, format='json')
        remove_response = self.client.post(remove_url, {'song_id': self.song.id}, format='json')

        self.assertEqual(add_response.status_code, status.HTTP_200_OK)
        self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.playlist.bai_hats.filter(pk=self.song.pk).exists())

    @patch('api.views.upload_image_file', return_value='https://cdn.example.com/profile.jpg')
    def test_image_upload_requires_login_and_returns_uploaded_url(self, mocked_upload):
        file = SimpleUploadedFile('profile.jpg', b'image-bytes', content_type='image/jpeg')
        guest_response = self.client.post(reverse('upload_image'), {'file': file}, format='multipart')

        self.client.force_authenticate(user=self.owner)
        authenticated_response = self.client.post(
            reverse('upload_image'),
            {'file': SimpleUploadedFile('profile.jpg', b'image-bytes', content_type='image/jpeg')},
            format='multipart',
        )

        self.assertEqual(guest_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(authenticated_response.status_code, status.HTTP_200_OK)
        self.assertEqual(authenticated_response.data['url'], 'https://cdn.example.com/profile.jpg')
        mocked_upload.assert_called_once()

    @patch('api.views.make_upload_signature')
    def test_only_admin_can_request_upload_signature(self, mocked_signature):
        mocked_signature.return_value = {
            'cloud_name': 'media-cloud',
            'api_key': 'public-key',
            'timestamp': 123,
            'folder': 'music_streaming/audio',
            'resource_type': 'video',
            'signature': 'signed-request',
        }
        url = reverse('upload_signature')

        self.client.force_authenticate(user=self.owner)
        denied_response = self.client.post(url, {'upload_type': 'song_audio'}, format='json')

        self.client.force_authenticate(user=self.admin)
        allowed_response = self.client.post(url, {'upload_type': 'song_audio'}, format='json')

        self.assertEqual(denied_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(allowed_response.status_code, status.HTTP_200_OK)
        self.assertEqual(allowed_response.data['signature'], 'signed-request')
        mocked_signature.assert_called_once_with('music_streaming/audio', 'video')


class EmailAuthenticationApiTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(
            username='account-owner',
            email='owner@example.com',
            password='secret123',
        )

    def test_registration_requires_email_and_normalizes_it(self):
        missing_email_response = self.client.post(
            reverse('api_register'),
            {'username': 'without-email', 'password': 'secret123'},
            format='json',
        )
        register_response = self.client.post(
            reverse('api_register'),
            {'username': 'new-member', 'email': '  New.Member@Example.COM ', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(missing_email_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.user_model.objects.get(username='new-member').email, 'new.member@example.com')

    def test_registration_rejects_duplicate_email_case_insensitively(self):
        response = self.client.post(
            reverse('api_register'),
            {'username': 'duplicate-member', 'email': 'OWNER@EXAMPLE.COM', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_accepts_normalized_email(self):
        response = self.client.post(
            reverse('api_login'),
            {'username': ' Owner@Example.COM ', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_rejects_username_identifier(self):
        response = self.client.post(
            reverse('api_login'),
            {'username': 'account-owner', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_rejects_duplicate_email_and_normalizes_new_email(self):
        other_user = self.user_model.objects.create_user(
            username='other-member',
            email='other@example.com',
            password='secret123',
        )
        self.client.force_authenticate(user=other_user)

        duplicate_response = self.client.put(
            reverse('api_user_profile'),
            {'email': ' OWNER@EXAMPLE.COM '},
            format='json',
        )
        update_response = self.client.put(
            reverse('api_user_profile'),
            {'email': ' Other.New@Example.COM '},
            format='json',
        )

        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        other_user.refresh_from_db()
        self.assertEqual(other_user.email, 'other.new@example.com')

    def test_profile_rejects_incomplete_password_change(self):
        self.client.force_authenticate(user=self.user)

        old_password_only_response = self.client.put(
            reverse('api_user_profile'),
            {'old_password': 'secret123'},
            format='json',
        )
        new_password_only_response = self.client.put(
            reverse('api_user_profile'),
            {'new_password': 'changed123'},
            format='json',
        )

        self.assertEqual(old_password_only_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(new_password_only_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('secret123'))

    def test_profile_changes_password_with_current_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.put(
            reverse('api_user_profile'),
            {'old_password': 'secret123', 'new_password': 'changed123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('changed123'))

    def test_profile_delete_removes_user_without_deleting_uploaded_songs(self):
        artist = NgheSi.objects.create(ten_nghe_si='Account Artist')
        uploaded_song = BaiHat.objects.create(
            tieu_de='Account Song',
            duong_dan_am_thanh='https://example.com/account-song.mp3',
            duong_dan_hinh_anh='https://example.com/account-song.jpg',
            trang_thai='PUBLIC',
            id_nguoi_dang=self.user,
        )
        uploaded_song.cac_nghe_si.add(artist)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(reverse('api_user_profile'))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user_model.objects.filter(pk=self.user.pk).exists())
        uploaded_song.refresh_from_db()
        self.assertIsNone(uploaded_song.id_nguoi_dang_id)

    def test_admin_delete_user_removes_user_without_deleting_uploaded_songs(self):
        admin = self.user_model.objects.create_user(
            username='account-admin',
            email='account-admin@example.com',
            password='secret123',
            vai_tro='ADMIN',
        )
        target_user = self.user_model.objects.create_user(
            username='delete-target',
            email='delete-target@example.com',
            password='secret123',
        )
        artist = NgheSi.objects.create(ten_nghe_si='Admin Delete Artist')
        uploaded_song = BaiHat.objects.create(
            tieu_de='Admin Delete Song',
            duong_dan_am_thanh='https://example.com/admin-delete-song.mp3',
            duong_dan_hinh_anh='https://example.com/admin-delete-song.jpg',
            trang_thai='PUBLIC',
            id_nguoi_dang=target_user,
        )
        uploaded_song.cac_nghe_si.add(artist)
        self.client.force_authenticate(user=admin)

        response = self.client.delete(reverse('admin-users-detail', kwargs={'pk': target_user.pk}))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user_model.objects.filter(pk=target_user.pk).exists())
        uploaded_song.refresh_from_db()
        self.assertIsNone(uploaded_song.id_nguoi_dang_id)

    def test_legacy_ambiguous_identifier_returns_authentication_failure(self):
        backend = EmailOrUsernameModelBackend()

        with patch.object(
            self.user_model.objects,
            'get',
            side_effect=self.user_model.MultipleObjectsReturned,
        ):
            authenticated_user = backend.authenticate(
                request=None,
                username='owner@example.com',
                password='secret123',
            )

        self.assertIsNone(authenticated_user)
