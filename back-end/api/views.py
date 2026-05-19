from django.contrib.auth import get_user_model
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .cloudinary_utils import upload_audio_file, upload_image_file
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


class MultipartEnabledViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.vai_tro == 'ADMIN')


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


class UploadNhacView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Không tìm thấy file. Hãy gửi file với key là "file".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            url = upload_audio_file(file, 'music_streaming/audio')
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'url': url}, status=status.HTTP_200_OK)


# ============================
# Auth Views
# ============================
class DangKyView(generics.CreateAPIView):
    queryset = NguoiDung.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = DangKySerializer


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

        new_username = request.data.get('username')
        if new_username and new_username != user.username:
            if user_model.objects.filter(username=new_username).exists():
                return Response({'error': 'Tên người dùng này đã tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        new_email = request.data.get('email')
        if new_email and new_email != user.email:
            if user_model.objects.filter(email=new_email).exists():
                return Response({'error': 'Email này đã được sử dụng.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if old_password and new_password:
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
            },
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        request.user.delete()
        return Response({'message': 'Tài khoản đã được xóa vĩnh viễn'}, status=status.HTTP_204_NO_CONTENT)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = NguoiDung.objects.all().order_by('-date_joined', '-id')
    serializer_class = AdminNguoiDungSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email', 'last_login', 'id']

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

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise PermissionDenied('Bạn không thể tự xóa tài khoản admin đang đăng nhập.')

        instance.delete()


# ============================
# Nghệ sĩ, Thể loại, Album
# ============================
class NgheSiViewSet(MultipartEnabledViewSet):
    queryset = NgheSi.objects.all().order_by('ten_nghe_si')
    serializer_class = NgheSiSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_nghe_si']


class TheLoaiViewSet(MultipartEnabledViewSet):
    queryset = TheLoai.objects.all().order_by('ten_the_loai')
    serializer_class = TheLoaiSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_the_loai']


class AlbumViewSet(MultipartEnabledViewSet):
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'id_nghe_si__ten_nghe_si']
    ordering_fields = ['ngay_phat_hanh', 'id']

    def get_queryset(self):
        queryset = Album.objects.select_related('id_nghe_si').all().order_by('-ngay_phat_hanh', '-id')

        artist_id = self.request.query_params.get('id_nghe_si')
        status_value = self.request.query_params.get('trang_thai')

        if artist_id:
            queryset = queryset.filter(id_nghe_si_id=artist_id)
        if status_value:
            queryset = queryset.filter(trang_thai=status_value)

        return queryset


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
        try:
            song = BaiHat.objects.get(id=song_id)
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
        return YeuThich.objects.filter(id_nguoi_dung=self.request.user).order_by('-ngay_thich')

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)


# ============================
# Lịch sử nghe
# ============================
class LichSuNgheViewSet(viewsets.ModelViewSet):
    serializer_class = LichSuNgheSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return LichSuNghe.objects.filter(id_nguoi_dung=self.request.user).order_by('-thoi_gian_nghe')

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)


# ============================
# Bài hát
# ============================
class BaiHatViewSet(MultipartEnabledViewSet):
    serializer_class = BaiHatSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'cac_nghe_si__ten_nghe_si', 'quoc_gia']
    ordering_fields = ['luot_nghe', 'nam_phat_hanh', 'id']

    def get_queryset(self):
        queryset = BaiHat.objects.select_related(
            'id_album',
            'id_nguoi_dang',
        ).prefetch_related('cac_nghe_si', 'the_loais').all().order_by('-id')

        status_value = self.request.query_params.get('trang_thai')
        artist_id = self.request.query_params.get('id_nghe_si')
        album_id = self.request.query_params.get('id_album')
        genre_id = self.request.query_params.get('id_the_loai')

        if status_value:
            queryset = queryset.filter(trang_thai=status_value)
        if artist_id:
            queryset = queryset.filter(cac_nghe_si__id=artist_id)
        if album_id:
            queryset = queryset.filter(id_album_id=album_id)
        if genre_id:
            queryset = queryset.filter(the_loais__id=genre_id)

        return queryset.distinct()
