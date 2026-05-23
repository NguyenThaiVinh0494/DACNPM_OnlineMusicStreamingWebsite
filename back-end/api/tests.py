from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Album, BaiHat, LichSuNghe, NgheSi, TheLoai, YeuThich


class RecommendedSongsApiTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username='listener', password='secret123')
        self.uploader = self.user_model.objects.create_user(username='uploader', password='secret123')
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

    def test_recommended_uses_preferred_artist_and_genre_query_params(self):
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
        self.assertEqual(ordered_ids[0], preferred_song.id)
        self.assertIn(other_song.id, ordered_ids)

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
        song.refresh_from_db()
        self.assertEqual(song.luot_nghe, 4)
        self.assertEqual(LichSuNghe.objects.filter(id_nguoi_dung=self.user, id_bai_hat=song).count(), 1)

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
        self.admin = self.user_model.objects.create_user(username='admin', password='secret123', vai_tro='ADMIN')
        self.uploader = self.user_model.objects.create_user(username='uploader2', password='secret123')
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
            user = self.user_model.objects.create_user(username=f'liker-{song.id}-{index}', password='secret123')
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
