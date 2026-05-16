from rest_framework import generics, viewsets, filters, status
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from .models import NguoiDung, BaiHat, NgheSi, TheLoai, Album, DanhSachPhat, YeuThich, LichSuNghe
from .serializers import (
    DangKySerializer, BaiHatSerializer, NgheSiSerializer,
    TheLoaiSerializer, AlbumSerializer, DanhSachPhatSerializer,
    YeuThichSerializer, LichSuNgheSerializer
)


# ============================
# Upload lên Cloudinary
# ============================
class UploadAnhView(APIView):
    """
    Upload ảnh (avatar, ảnh bìa, ảnh nghệ sĩ) lên Cloudinary.
    POST /api/upload/image/
    - Body: form-data, key = "file", value = file ảnh
    - Trả về: URL ảnh trên Cloudinary
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Không tìm thấy file. Hãy gửi file với key là "file".'}, status=status.HTTP_400_BAD_REQUEST)

        # Upload lên Cloudinary folder "images"
        result = cloudinary.uploader.upload(
            file,
            folder='music_streaming/images',
            resource_type='image'
        )
        return Response({'url': result['secure_url']}, status=status.HTTP_200_OK)


class UploadNhacView(APIView):
    """
    Upload file nhạc (mp3, wav,...) lên Cloudinary.
    POST /api/upload/audio/
    - Body: form-data, key = "file", value = file nhạc
    - Trả về: URL nhạc trên Cloudinary
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Không tìm thấy file. Hãy gửi file với key là "file".'}, status=status.HTTP_400_BAD_REQUEST)

        # Upload lên Cloudinary folder "audio" với resource_type="video" (Cloudinary dùng "video" cho cả audio)
        result = cloudinary.uploader.upload(
            file,
            folder='music_streaming/audio',
            resource_type='video'
        )
        return Response({'url': result['secure_url']}, status=status.HTTP_200_OK)

# ============================
# Auth Views
# ============================
class DangKyView(generics.CreateAPIView):
    queryset = NguoiDung.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = DangKySerializer

class UserProfileView(APIView):
    """
    API Quản lý tài khoản cá nhân:
    - PUT /api/users/me/ : Cập nhật thông tin (first_name, last_name, anh_dai_dien)
    - DELETE /api/users/me/ : Xóa tài khoản
    """
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
        # Cập nhật thông tin cơ bản
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'anh_dai_dien' in request.data:
            user.anh_dai_dien = request.data['anh_dai_dien']
            
        User = get_user_model()

        # Xử lý cập nhật Username
        new_username = request.data.get('username')
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({'error': 'Tên người dùng này đã tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        # Xử lý cập nhật Email
        new_email = request.data.get('email')
        if new_email and new_email != user.email:
            if User.objects.filter(email=new_email).exists():
                return Response({'error': 'Email này đã được sử dụng.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        # Xử lý cập nhật Password
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
            }
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'Tài khoản đã được xóa vĩnh viễn'}, status=status.HTTP_204_NO_CONTENT)


# ============================
# A. Nghệ Sĩ, Thể Loại, Album
# ============================
class NgheSiViewSet(viewsets.ModelViewSet):
    """
    CRUD cho Nghệ Sĩ:
    - GET    /api/artists/        → Danh sách nghệ sĩ
    - POST   /api/artists/        → Thêm nghệ sĩ mới (cần đăng nhập)
    - GET    /api/artists/{id}/   → Chi tiết một nghệ sĩ
    - PUT    /api/artists/{id}/   → Cập nhật nghệ sĩ
    - DELETE /api/artists/{id}/   → Xóa nghệ sĩ
    """
    queryset = NgheSi.objects.all().order_by('ten_nghe_si')
    serializer_class = NgheSiSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_nghe_si']


class TheLoaiViewSet(viewsets.ModelViewSet):
    """
    CRUD cho Thể Loại:
    - GET    /api/genres/        → Danh sách thể loại
    - POST   /api/genres/        → Thêm thể loại mới (cần đăng nhập)
    - GET    /api/genres/{id}/   → Chi tiết một thể loại
    - PUT    /api/genres/{id}/   → Cập nhật thể loại
    - DELETE /api/genres/{id}/   → Xóa thể loại
    """
    queryset = TheLoai.objects.all().order_by('ten_the_loai')
    serializer_class = TheLoaiSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ten_the_loai']


class AlbumViewSet(viewsets.ModelViewSet):
    """
    CRUD cho Album:
    - GET    /api/albums/        → Danh sách album
    - POST   /api/albums/        → Thêm album mới (cần đăng nhập)
    - GET    /api/albums/{id}/   → Chi tiết một album
    - PUT    /api/albums/{id}/   → Cập nhật album
    - DELETE /api/albums/{id}/   → Xóa album
    """
    queryset = Album.objects.all().order_by('-ngay_phat_hanh')
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'id_nghe_si__ten_nghe_si']
    ordering_fields = ['ngay_phat_hanh']


# ============================
# B. Playlist & Yêu Thích
# ============================
class DanhSachPhatViewSet(viewsets.ModelViewSet):
    """
    CRUD cho Playlist (chỉ xem/quản lý playlist của chính mình):
    - GET    /api/playlists/        → Danh sách playlist của tôi
    - POST   /api/playlists/        → Tạo playlist mới
    - GET    /api/playlists/{id}/   → Chi tiết playlist
    - PUT    /api/playlists/{id}/   → Cập nhật playlist
    - DELETE /api/playlists/{id}/   → Xóa playlist
    """
    serializer_class = DanhSachPhatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Chỉ trả về playlist của người dùng đang đăng nhập
        return DanhSachPhat.objects.filter(id_chu_so_huu=self.request.user).order_by('-ngay_tao')

    def perform_create(self, serializer):
        # Tự động gán người tạo là người dùng đang đăng nhập
        serializer.save(id_chu_so_huu=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        try:
            song = BaiHat.objects.get(id=song_id)
            playlist.bai_hats.add(song)
            return Response({'status': 'song added'}, status=status.HTTP_200_OK)
        except BaiHat.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        try:
            song = BaiHat.objects.get(id=song_id)
            playlist.bai_hats.remove(song)
            return Response({'status': 'song removed'}, status=status.HTTP_200_OK)
        except BaiHat.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)


class YeuThichViewSet(viewsets.ModelViewSet):
    """
    Quản lý Yêu Thích:
    - GET    /api/favorites/        → Danh sách bài hát đã thích
    - POST   /api/favorites/        → Thêm bài hát vào yêu thích
    - DELETE /api/favorites/{id}/   → Bỏ yêu thích
    """
    serializer_class = YeuThichSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Chỉ trả về yêu thích của người dùng đang đăng nhập
        return YeuThich.objects.filter(id_nguoi_dung=self.request.user).order_by('-ngay_thich')

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)


# ============================
# C. Lịch Sử Nghe
# ============================
class LichSuNgheViewSet(viewsets.ModelViewSet):
    """
    Lịch Sử Nghe:
    - GET    /api/history/   → Lịch sử nghe nhạc của tôi (mới nhất trước)
    - POST   /api/history/   → Ghi nhận một bài hát vừa nghe
    - DELETE /api/history/{id}/ → Xóa một mục trong lịch sử
    """
    serializer_class = LichSuNgheSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']  # Không cho PUT/PATCH vì lịch sử không cần sửa

    def get_queryset(self):
        return LichSuNghe.objects.filter(id_nguoi_dung=self.request.user).order_by('-thoi_gian_nghe')

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)


# ============================
# Bài Hát (Song) Views
# ============================
class BaiHatViewSet(viewsets.ModelViewSet):
    """
    CRUD đầy đủ cho Bài Hát:
    - GET    /api/songs/        → Lấy danh sách tất cả bài hát
    - POST   /api/songs/        → Thêm bài hát mới (cần đăng nhập)
    - GET    /api/songs/{id}/   → Xem chi tiết một bài hát
    - PUT    /api/songs/{id}/   → Cập nhật toàn bộ thông tin bài hát
    - PATCH  /api/songs/{id}/   → Cập nhật một phần thông tin bài hát
    - DELETE /api/songs/{id}/   → Xóa bài hát
    """
    queryset = BaiHat.objects.all().order_by('-id')
    serializer_class = BaiHatSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tieu_de', 'id_nghe_si__ten_nghe_si', 'quoc_gia']
    ordering_fields = ['luot_nghe', 'nam_phat_hanh', 'id']

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
