import hashlib

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from datetime import timedelta
from django.db.models import Case, Count, Exists, F, IntegerField, OuterRef, Q, Sum, Value, When
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .cloudinary_utils import make_upload_signature, upload_image_file
from .models import Album, BaiHat, DanhSachPhat, LichSuNghe, NgheSi, NguoiDung, TheLoai, YeuThich
from .serializers import (
    AlbumSerializer,
    AdminNguoiDungSerializer,
    BaiHatSerializer,
    DangKySerializer,
    DanhSachPhatSerializer,
    LichSuNgheSerializer,
    NgheSiSerializer,
    TheLoaiSerializer,
    YeuThichSerializer,
)

HOME_CACHE_KEY = 'home:v1'
ADMIN_STATS_CACHE_KEY = 'admin:stats:v1'
ADMIN_SUMMARY_CACHE_KEY = 'admin:summary:v1'


def invalidate_admin_metrics_cache():
    cache.delete_many([ADMIN_STATS_CACHE_KEY, ADMIN_SUMMARY_CACHE_KEY])


def delete_user_account(user):
    user.delete()
    cache.delete(HOME_CACHE_KEY)
    invalidate_admin_metrics_cache()


class MultipartEnabledViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save()
        cache.delete(HOME_CACHE_KEY)
        invalidate_admin_metrics_cache()

    def perform_update(self, serializer):
        serializer.save()
        cache.delete(HOME_CACHE_KEY)
        invalidate_admin_metrics_cache()

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete(HOME_CACHE_KEY)
        invalidate_admin_metrics_cache()


def is_admin_user(user):
    return bool(user and user.is_authenticated and user.vai_tro == 'ADMIN')


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        return is_admin_user(request.user)


# ============================
# Upload lên Cloudinary
# ============================
class UploadAnhView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Không tìm thấy file. Hãy gửi file với key là "file".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            url = upload_image_file(file, 'music_streaming/images')
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'url': url}, status=status.HTTP_200_OK)


class CloudinaryUploadSignatureView(APIView):
    permission_classes = [IsAdminRole]

    FOLDERS = {
        'song_image': ('music_streaming/song_images', 'image'),
        'song_audio': ('music_streaming/audio', 'video'),
        'album_cover': ('music_streaming/albums', 'image'),
        'artist_image': ('music_streaming/artists', 'image'),
        'topic_image': ('music_streaming/topics', 'image'),
    }

    def post(self, request):
        upload_type = request.data.get('upload_type')
        if upload_type not in self.FOLDERS:
            return Response({'error': 'Loại upload không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        folder, resource_type = self.FOLDERS[upload_type]
        signature_data = make_upload_signature(folder, resource_type)
        if not signature_data.get('cloud_name') or not signature_data.get('api_key') or not signature_data.get('signature'):
            return Response({'error': 'Cloudinary chưa được cấu hình.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(signature_data, status=status.HTTP_200_OK)


# ============================
# Auth Views
# ============================
class DangKyView(generics.CreateAPIView):
    queryset = NguoiDung.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = DangKySerializer

    def perform_create(self, serializer):
        serializer.save()
        invalidate_admin_metrics_cache()


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'anh_dai_dien': user.anh_dai_dien,
            'vai_tro': user.vai_tro,
        })

    def put(self, request):
        user = request.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'anh_dai_dien' in request.data:
            user.anh_dai_dien = request.data['anh_dai_dien']

        user_model = get_user_model()

        if 'username' in request.data:
            new_username = str(request.data.get('username') or '').strip()
            if not new_username:
                return Response({'error': 'Tên tài khoản không được để trống.'}, status=status.HTTP_400_BAD_REQUEST)
            if new_username != user.username and user_model.objects.filter(username=new_username).exists():
                return Response({'error': 'Tên người dùng này đã tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        if 'email' in request.data:
            new_email = str(request.data.get('email') or '').strip().lower()
            try:
                validate_email(new_email)
            except DjangoValidationError:
                return Response({'error': 'Email không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

            if new_email != user.email and user_model.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
                return Response({'error': 'Email này đã được sử dụng.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if old_password or new_password:
            if not old_password or not new_password:
                return Response({'error': 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.'}, status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(old_password):
                return Response({'error': 'Mật khẩu cũ không chính xác.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()

        return Response({
            'message': 'Cập nhật thông tin thành công',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'anh_dai_dien': user.anh_dai_dien,
                'vai_tro': user.vai_tro,
            },
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        delete_user_account(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = NguoiDung.objects.all().order_by('-date_joined', '-id')
    serializer_class = AdminNguoiDungSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email', 'last_login', 'id']

    def perform_create(self, serializer):
        serializer.save()
        invalidate_admin_metrics_cache()

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.id == self.request.user.id:
            requested_role = serializer.validated_data.get('vai_tro')
            requested_active = serializer.validated_data.get('is_active')

            if requested_role and requested_role != 'ADMIN':
                raise ValidationError({'vai_tro': ['Bạn không thể tự gỡ quyền admin của chính mình.']})

            if requested_active is False:
                raise ValidationError({'is_active': ['Bạn không thể tự khóa tài khoản admin đang đăng nhập.']})

        serializer.save()
        invalidate_admin_metrics_cache()

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise PermissionDenied('Bạn không thể tự xóa tài khoản admin đang đăng nhập.')

        delete_user_account(instance)


class AdminStatsView(APIView):
    permission_classes = [IsAdminRole]
    CACHE_SECONDS = 60

    @staticmethod
    def _ranking_song_item(song):
        return {
            'id': song.id,
            'tieu_de': song.tieu_de,
            'duong_dan_hinh_anh': song.duong_dan_hinh_anh,
            'luot_nghe': song.luot_nghe,
            'so_luot_thich': song.so_luot_thich_annotated,
        }

    def get(self, request):
        cached_payload = cache.get(ADMIN_STATS_CACHE_KEY)
        if cached_payload is not None:
            return Response(cached_payload, status=status.HTTP_200_OK)

        today = timezone.localdate()
        trend_start_date = today - timedelta(days=13)
        new_user_start_date = today - timedelta(days=29)

        ranked_songs = BaiHat.objects.filter(trang_thai='PUBLIC').annotate(
            so_luot_thich_annotated=Count('duoc_yeu_thich', distinct=True),
        )
        top_songs = list(ranked_songs.order_by('-luot_nghe', '-id')[:10])
        top_liked_songs = list(
            ranked_songs.order_by('-so_luot_thich_annotated', '-luot_nghe', '-id')[:10]
        )
        song_summary = BaiHat.objects.aggregate(
            total_listens=Coalesce(Sum('luot_nghe'), Value(0), output_field=IntegerField()),
            public=Count('id', filter=Q(trang_thai='PUBLIC')),
            pending=Count('id', filter=Q(trang_thai='PENDING')),
        )
        album_summary = Album.objects.aggregate(
            public=Count('id', filter=Q(trang_thai='PUBLIC')),
            pending=Count('id', filter=Q(trang_thai='PENDING')),
        )
        total_listens = song_summary['total_listens']
        total_likes = YeuThich.objects.count()
        public_song_count = song_summary['public']
        pending_song_count = song_summary['pending']
        public_album_count = album_summary['public']
        pending_album_count = album_summary['pending']
        new_users_30_days = NguoiDung.objects.filter(date_joined__date__gte=new_user_start_date).count()
        average_listens_per_song = round((total_listens or 0) / public_song_count, 1) if public_song_count else 0
        like_rate = round((total_likes / total_listens) * 100, 2) if total_listens else 0

        listen_rows = (
            LichSuNghe.objects.filter(thoi_gian_nghe__date__gte=trend_start_date)
            .annotate(day=TruncDate('thoi_gian_nghe'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        listen_counts_by_day = {row['day']: row['count'] for row in listen_rows}
        listen_trend = [
            {
                'date': (trend_start_date + timedelta(days=offset)).isoformat(),
                'listens': listen_counts_by_day.get(trend_start_date + timedelta(days=offset), 0),
            }
            for offset in range(14)
        ]

        genre_rows = (
            TheLoai.objects.annotate(
                song_count=Count('bai_hats', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
                total_listens=Coalesce(Sum('bai_hats__luot_nghe', filter=Q(bai_hats__trang_thai='PUBLIC')), Value(0), output_field=IntegerField()),
            )
            .filter(song_count__gt=0)
            .order_by('-total_listens', '-song_count', 'ten_the_loai')[:6]
        )

        artist_rows = (
            NgheSi.objects.annotate(
                song_count=Count('bai_hats', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
                total_listens=Coalesce(Sum('bai_hats__luot_nghe', filter=Q(bai_hats__trang_thai='PUBLIC')), Value(0), output_field=IntegerField()),
                total_likes=Count('bai_hats__duoc_yeu_thich', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
            )
            .filter(song_count__gt=0)
            .order_by('-total_listens', '-total_likes', 'ten_nghe_si')[:5]
        )

        payload = {
                'totalListens': total_listens or 0,
                'totalLikes': total_likes,
                'averageListensPerSong': average_listens_per_song,
                'likeRate': like_rate,
                'newUsers30Days': new_users_30_days,
                'topSongs': [self._ranking_song_item(song) for song in top_songs],
                'topLikedSongs': [self._ranking_song_item(song) for song in top_liked_songs],
                'listenTrend': listen_trend,
                'genreDistribution': [
                    {
                        'id': genre.id,
                        'name': genre.ten_the_loai,
                        'songCount': genre.song_count,
                        'totalListens': genre.total_listens,
                    }
                    for genre in genre_rows
                ],
                'topArtists': [
                    {
                        'id': artist.id,
                        'name': artist.ten_nghe_si,
                        'image': artist.anh_nghe_si,
                        'songCount': artist.song_count,
                        'totalListens': artist.total_listens,
                        'totalLikes': artist.total_likes,
                    }
                    for artist in artist_rows
                ],
                'contentStatus': {
                    'songs': {
                        'public': public_song_count,
                        'pending': pending_song_count,
                    },
                    'albums': {
                        'public': public_album_count,
                        'pending': pending_album_count,
                    },
                },
            }
        cache.set(ADMIN_STATS_CACHE_KEY, payload, self.CACHE_SECONDS)
        return Response(payload, status=status.HTTP_200_OK)


class AdminSummaryView(APIView):
    permission_classes = [IsAdminRole]
    CACHE_SECONDS = 60

    def get(self, request):
        cached_payload = cache.get(ADMIN_SUMMARY_CACHE_KEY)
        if cached_payload is not None:
            return Response(cached_payload, status=status.HTTP_200_OK)

        song_summary = BaiHat.objects.aggregate(
            total=Count('id'),
            total_listens=Coalesce(Sum('luot_nghe'), Value(0), output_field=IntegerField()),
        )
        payload = {
            'counts': {
                'songs': song_summary['total'],
                'albums': Album.objects.count(),
                'artists': NgheSi.objects.count(),
                'genres': TheLoai.objects.count(),
                'users': NguoiDung.objects.count(),
            },
            'totalListens': song_summary['total_listens'],
        }
        cache.set(ADMIN_SUMMARY_CACHE_KEY, payload, self.CACHE_SECONDS)
        return Response(payload, status=status.HTTP_200_OK)


# ============================
# Nghệ sĩ, Thể loại, Album
# ============================
class NgheSiViewSet(MultipartEnabledViewSet):
    queryset = NgheSi.objects.all().order_by('ten_nghe_si')
    serializer_class = NgheSiSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_nghe_si']


class TheLoaiViewSet(MultipartEnabledViewSet):
    queryset = TheLoai.objects.all().order_by('ten_the_loai')
    serializer_class = TheLoaiSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_the_loai']


class AlbumViewSet(MultipartEnabledViewSet):
    serializer_class = AlbumSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'id_nghe_si__ten_nghe_si']
    ordering_fields = ['ngay_phat_hanh', 'id', 'tong_luot_nghe', 'tong_luot_thich', 'song_count']

    def _get_limit(self, request, maximum=100):
        try:
            limit = int(request.query_params.get('limit', 0))
        except (TypeError, ValueError):
            return None
        if limit <= 0:
            return None
        return min(limit, maximum)

    def get_queryset(self):
        queryset = Album.objects.select_related('id_nghe_si').all().order_by('-ngay_phat_hanh', '-id')
        is_admin = is_admin_user(self.request.user)
        metric_fields = {'tong_luot_nghe', 'tong_luot_thich', 'song_count'}
        ordering_value = self.request.query_params.get('ordering', '')
        needs_metrics = any(item.strip().lstrip('-') in metric_fields for item in ordering_value.split(','))

        if not is_admin:
            queryset = queryset.filter(trang_thai='PUBLIC')

        if needs_metrics:
            if is_admin:
                queryset = queryset.annotate(
                    tong_luot_nghe=Coalesce(Sum('bai_hats__luot_nghe'), Value(0), output_field=IntegerField()),
                    tong_luot_thich=Count('bai_hats__duoc_yeu_thich', distinct=True),
                    song_count=Count('bai_hats', distinct=True),
                )
            else:
                queryset = queryset.annotate(
                    tong_luot_nghe=Coalesce(
                        Sum('bai_hats__luot_nghe', filter=Q(bai_hats__trang_thai='PUBLIC')),
                        Value(0),
                        output_field=IntegerField(),
                    ),
                    tong_luot_thich=Count(
                        'bai_hats__duoc_yeu_thich',
                        filter=Q(bai_hats__trang_thai='PUBLIC'),
                        distinct=True,
                    ),
                    song_count=Count('bai_hats', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
                )
        elif self.action == 'list':
            if is_admin:
                queryset = queryset.annotate(song_count=Count('bai_hats', distinct=True))
            else:
                queryset = queryset.annotate(
                    song_count=Count('bai_hats', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
                )

        artist_id = self.request.query_params.get('id_nghe_si')
        status_value = self.request.query_params.get('trang_thai')
        country = self.request.query_params.get('quoc_gia')
        genre_id = self.request.query_params.get('id_the_loai')

        if artist_id:
            queryset = queryset.filter(id_nghe_si_id=artist_id)
        if status_value:
            queryset = queryset.filter(trang_thai=status_value)
        if country:
            queryset = queryset.filter(bai_hats__quoc_gia=country)
            if not is_admin:
                queryset = queryset.filter(bai_hats__trang_thai='PUBLIC')
        if genre_id:
            queryset = queryset.filter(bai_hats__the_loais__id=genre_id)
            if not is_admin:
                queryset = queryset.filter(bai_hats__trang_thai='PUBLIC')

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        limit = self._get_limit(request)
        if limit:
            queryset = queryset[:limit]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class HomeView(APIView):
    permission_classes = [AllowAny]
    CACHE_KEY = HOME_CACHE_KEY
    CACHE_SECONDS = 120

    def _album_queryset(self):
        return Album.objects.select_related('id_nghe_si').annotate(
            tong_luot_nghe=Coalesce(
                Sum('bai_hats__luot_nghe', filter=Q(bai_hats__trang_thai='PUBLIC')),
                Value(0),
                output_field=IntegerField(),
            ),
            tong_luot_thich=Count(
                'bai_hats__duoc_yeu_thich',
                filter=Q(bai_hats__trang_thai='PUBLIC'),
                distinct=True,
            ),
            song_count=Count('bai_hats', filter=Q(bai_hats__trang_thai='PUBLIC'), distinct=True),
        ).filter(trang_thai='PUBLIC')

    def _song_queryset(self):
        return BaiHat.objects.select_related('id_album', 'id_nguoi_dang').prefetch_related(
            'cac_nghe_si',
            'the_loais',
        ).filter(trang_thai='PUBLIC')

    def _album_item(self, album):
        return {
            'id': album.id,
            'title': album.tieu_de,
            'artist': album.id_nghe_si.ten_nghe_si if album.id_nghe_si_id else 'Nhiều nghệ sĩ',
            'image': album.anh_bia,
            'type': 'album',
            'songCount': getattr(album, 'song_count', 0),
            'totalPlays': getattr(album, 'tong_luot_nghe', 0) or 0,
            'totalLikes': getattr(album, 'tong_luot_thich', 0) or 0,
        }

    def _song_item(self, song):
        artist_names = ', '.join(artist.ten_nghe_si for artist in song.cac_nghe_si.all()) or 'Đang cập nhật'
        return {
            'id': song.id,
            'title': song.tieu_de,
            'ten': song.tieu_de,
            'artist': artist_names,
            'caSi': artist_names,
            'image': song.duong_dan_hinh_anh,
            'anh': song.duong_dan_hinh_anh,
            'audioUrl': song.duong_dan_am_thanh,
            'duration': song.thoi_luong,
            'lyrics': song.loi_bai_hat,
            'label': 'NCT OFFICIAL',
            'type': 'song',
        }

    def _topic_item(self, genre):
        return {
            'id': genre.id,
            'name': genre.ten_the_loai,
            'image': genre.anh_the_loai,
        }

    def get(self, request):
        cached_payload = cache.get(self.CACHE_KEY)
        if cached_payload:
            return Response(cached_payload, status=status.HTTP_200_OK)

        albums = self._album_queryset()
        songs = self._song_queryset()
        mood_genre_id = request.query_params.get('mood_genre_id', 4)

        payload = {
            'vuTruNhacViet': [
                self._album_item(album)
                for album in albums.filter(
                    bai_hats__trang_thai='PUBLIC',
                    bai_hats__quoc_gia='Việt Nam',
                ).distinct().order_by('-ngay_phat_hanh', '-id')[:5]
            ],
            'tamTrangHomNay': [
                self._album_item(album)
                for album in albums.filter(
                    bai_hats__trang_thai='PUBLIC',
                    bai_hats__the_loais__id=mood_genre_id,
                ).distinct().order_by('-tong_luot_nghe', '-id')[:5]
            ],
            'top100': [
                self._album_item(album)
                for album in albums.order_by('-tong_luot_nghe', '-id')[:5]
            ],
            'dangDuocYeuThich': [
                self._album_item(album)
                for album in albums.order_by('-tong_luot_thich', '-id')[:5]
            ],
            'newSongs': [
                self._album_item(album)
                for album in albums.order_by('-ngay_phat_hanh', '-id')[:5]
            ],
            'singleMoiPhatHanh': [
                self._song_item(song)
                for song in songs.order_by('-nam_phat_hanh', '-id')[:12]
            ],
            'topics': [
                self._topic_item(genre)
                for genre in TheLoai.objects.all().order_by('ten_the_loai')[:10]
            ],
        }
        cache.set(self.CACHE_KEY, payload, self.CACHE_SECONDS)
        return Response(payload, status=status.HTTP_200_OK)


# ============================
# Playlist & Yêu thích
# ============================
class DanhSachPhatViewSet(viewsets.ModelViewSet):
    serializer_class = DanhSachPhatSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = DanhSachPhat.objects.select_related('id_chu_so_huu').prefetch_related(
            'bai_hats',
            'bai_hats__cac_nghe_si',
        ).order_by('-ngay_tao')

        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return queryset

        return queryset.filter(id_chu_so_huu=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        playlists = DanhSachPhat.objects.filter(id_chu_so_huu=request.user).select_related(
            'id_chu_so_huu',
        ).prefetch_related(
            'bai_hats',
            'bai_hats__cac_nghe_si',
        ).order_by('-ngay_tao')
        serializer = self.get_serializer(playlists, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(id_chu_so_huu=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        songs = BaiHat.objects.all()
        if not is_admin_user(request.user):
            songs = songs.filter(trang_thai='PUBLIC')
        try:
            song = songs.get(id=song_id)
        except BaiHat.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

        playlist.bai_hats.add(song)
        return Response({'status': 'song added'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        try:
            song = BaiHat.objects.get(id=song_id)
        except BaiHat.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

        playlist.bai_hats.remove(song)
        return Response({'status': 'song removed'}, status=status.HTTP_200_OK)


class YeuThichViewSet(viewsets.ModelViewSet):
    serializer_class = YeuThichSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = YeuThich.objects.filter(id_nguoi_dung=self.request.user).order_by('-ngay_thich')
        if not is_admin_user(self.request.user):
            queryset = queryset.filter(id_bai_hat__trang_thai='PUBLIC')
        return queryset

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)
        invalidate_admin_metrics_cache()

    def perform_destroy(self, instance):
        instance.delete()
        invalidate_admin_metrics_cache()

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        song_id = request.data.get('id_bai_hat') or request.data.get('song_id')
        if not song_id:
            return Response({'error': 'Vui lòng chọn bài hát.'}, status=status.HTTP_400_BAD_REQUEST)

        songs = BaiHat.objects.all()
        if not is_admin_user(request.user):
            songs = songs.filter(trang_thai='PUBLIC')
        try:
            song = songs.get(id=song_id)
        except BaiHat.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

        favorite = YeuThich.objects.filter(id_nguoi_dung=request.user, id_bai_hat=song).first()
        if favorite:
            favorite.delete()
            is_favorite = False
        else:
            YeuThich.objects.create(id_nguoi_dung=request.user, id_bai_hat=song)
            is_favorite = True

        invalidate_admin_metrics_cache()
        return Response(
            {
                'id_bai_hat': song.id,
                'da_thich': is_favorite,
                'so_luot_thich': song.duoc_yeu_thich.count(),
            },
            status=status.HTTP_200_OK,
        )


# ============================
# Lịch sử nghe
# ============================
class LichSuNgheViewSet(viewsets.ModelViewSet):
    serializer_class = LichSuNgheSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = LichSuNghe.objects.filter(
            id_nguoi_dung=self.request.user,
        ).select_related(
            'id_bai_hat__id_album',
            'id_bai_hat__id_nguoi_dang',
        ).prefetch_related(
            'id_bai_hat__cac_nghe_si',
            'id_bai_hat__the_loais',
        ).order_by('-thoi_gian_nghe')
        if not is_admin_user(self.request.user):
            queryset = queryset.filter(id_bai_hat__trang_thai='PUBLIC')
        return queryset

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)
        invalidate_admin_metrics_cache()

    def perform_destroy(self, instance):
        instance.delete()
        invalidate_admin_metrics_cache()

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        LichSuNghe.objects.filter(id_nguoi_dung=request.user).delete()
        invalidate_admin_metrics_cache()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'])
    def remove_song(self, request):
        song_id = request.query_params.get('song_id', '')
        if not song_id.isdigit():
            return Response(
                {'error': 'song_id không hợp lệ.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        LichSuNghe.objects.filter(
            id_nguoi_dung=request.user,
            id_bai_hat_id=int(song_id),
        ).delete()
        invalidate_admin_metrics_cache()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================
# Bài hát
# ============================
class BaiHatViewSet(MultipartEnabledViewSet):
    LISTEN_COOLDOWN_SECONDS = 30
    serializer_class = BaiHatSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'cac_nghe_si__ten_nghe_si']
    ordering_fields = ['luot_nghe', 'nam_phat_hanh', 'id']

    def _base_queryset(self):
        queryset = BaiHat.objects.select_related(
            'id_album__id_nghe_si',
            'id_nguoi_dang',
        ).prefetch_related('cac_nghe_si', 'the_loais').annotate(
            so_luot_thich_annotated=Count('duoc_yeu_thich', distinct=True),
        ).all().order_by('-id')

        request = getattr(self, 'request', None)
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            queryset = queryset.annotate(
                da_thich_value=Exists(
                    YeuThich.objects.filter(id_nguoi_dung=user, id_bai_hat=OuterRef('pk'))
                )
            )

        return queryset
        

    def _get_limit(self, request, default=12, maximum=30):
        try:
            limit = int(request.query_params.get('limit', default))
        except (TypeError, ValueError):
            limit = default

        return max(1, min(limit, maximum))

    def _serialize_collection(self, queryset):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = self._base_queryset().all().order_by('-id')
        if not is_admin_user(self.request.user):
            queryset = queryset.filter(trang_thai='PUBLIC')

        status_value = self.request.query_params.get('trang_thai')
        artist_id = self.request.query_params.get('id_nghe_si')
        album_id = self.request.query_params.get('id_album')
        genre_id = self.request.query_params.get('id_the_loai')
        country = self.request.query_params.get('quoc_gia')

        if status_value:
            queryset = queryset.filter(trang_thai=status_value)
        if artist_id:
            queryset = queryset.filter(cac_nghe_si__id=artist_id)
        if album_id:
            queryset = queryset.filter(id_album_id=album_id)
        if genre_id:
            queryset = queryset.filter(the_loais__id=genre_id)
        if country:
            queryset = queryset.filter(quoc_gia=country)

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            limit = int(request.query_params.get('limit', 0))
        except (TypeError, ValueError):
            limit = 0
        if limit:
            queryset = queryset[:min(max(limit, 1), 100)]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _listen_identity(self, request):
        if request.user.is_authenticated:
            return f'user:{request.user.pk}'

        remote_address = request.META.get('REMOTE_ADDR', 'anonymous')
        address_hash = hashlib.sha256(remote_address.encode('utf-8')).hexdigest()[:24]
        return f'guest:{address_hash}'

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def listen(self, request, pk=None):
        song = self.get_object()
        cache_key = f'listen:{song.pk}:{self._listen_identity(request)}'
        counted = cache.add(cache_key, True, timeout=self.LISTEN_COOLDOWN_SECONDS)

        if counted:
            BaiHat.objects.filter(pk=song.pk).update(luot_nghe=F('luot_nghe') + 1)

            if request.user.is_authenticated:
                LichSuNghe.objects.create(id_nguoi_dung=request.user, id_bai_hat=song)

            song.refresh_from_db(fields=['luot_nghe'])
            invalidate_admin_metrics_cache()

        return Response(
            {'id': song.id, 'luot_nghe': song.luot_nghe, 'counted': counted},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def recommended(self, request):
        limit = self._get_limit(request)
        public_queryset = self._base_queryset().filter(trang_thai='PUBLIC').distinct()
        user = request.user

        if not user.is_authenticated:
            return self._serialize_collection(public_queryset.order_by('-luot_nghe', '-id')[:limit])

        history_song_ids = []
        favorite_song_ids = []
        if user.is_authenticated:
            history_song_ids = list(
                LichSuNghe.objects.filter(id_nguoi_dung=user)
                .order_by('-thoi_gian_nghe')
                .values_list('id_bai_hat_id', flat=True)[:20]
            )
            favorite_song_ids = list(
                YeuThich.objects.filter(id_nguoi_dung=user)
                .order_by('-ngay_thich')
                .values_list('id_bai_hat_id', flat=True)[:20]
            )
        signal_song_ids = list(dict.fromkeys(favorite_song_ids + history_song_ids))

        signal_songs = list(self._base_queryset().filter(id__in=signal_song_ids, trang_thai='PUBLIC'))
        signal_artist_ids = {
            artist.id
            for song in signal_songs
            for artist in song.cac_nghe_si.all()
            if artist.id
        }
        signal_genre_ids = {
            genre.id
            for song in signal_songs
            for genre in song.the_loais.all()
            if genre.id
        }
        album_ids = sorted({song.id_album_id for song in signal_songs if song.id_album_id})
        artist_ids = sorted(signal_artist_ids)
        genre_ids = sorted(signal_genre_ids)

        if not signal_song_ids:
            return self._serialize_collection(public_queryset.order_by('-luot_nghe', '-id')[:limit])

        recommendations = public_queryset.annotate(
            matched_artists=(
                Count('cac_nghe_si', filter=Q(cac_nghe_si__id__in=artist_ids), distinct=True)
                if artist_ids
                else Value(0, output_field=IntegerField())
            ),
            matched_genre=(
                Count('the_loais', filter=Q(the_loais__id__in=genre_ids), distinct=True)
                if genre_ids
                else Value(0, output_field=IntegerField())
            ),
            matched_album=(
                Case(
                    When(id_album_id__in=album_ids, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
                if album_ids
                else Value(0, output_field=IntegerField())
            ),
            is_favorite=Case(
                When(id__in=favorite_song_ids, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            ),
            is_recent=Case(
                When(id__in=history_song_ids, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            ),
        ).order_by(
            '-is_favorite',
            '-is_recent',
            '-matched_artists',
            '-matched_genre',
            '-matched_album',
            '-luot_nghe',
            '-id',
        )

        return self._serialize_collection(recommendations[:limit])
