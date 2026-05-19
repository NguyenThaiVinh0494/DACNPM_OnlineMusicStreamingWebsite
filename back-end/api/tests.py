from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import BaiHat, LichSuNghe, NgheSi, TheLoai, YeuThich


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
