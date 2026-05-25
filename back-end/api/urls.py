from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    DangKyView,
    BaiHatViewSet,
    NgheSiViewSet,
    TheLoaiViewSet,
    AlbumViewSet,
    AdminUserViewSet,
    AdminStatsView,
    AdminSummaryView,
    DanhSachPhatViewSet,
    YeuThichViewSet,
    LichSuNgheViewSet,
    UserProfileView,
    UploadAnhView,
    CloudinaryUploadSignatureView,
    HomeView,
)

# Router tự động tạo tất cả URL CRUD cho ViewSet
router = DefaultRouter()
router.register(r'songs',     BaiHatViewSet,      basename='bai-hat')
router.register(r'artists',   NgheSiViewSet,      basename='nghe-si')
router.register(r'genres',    TheLoaiViewSet,     basename='the-loai')
router.register(r'albums',    AlbumViewSet,       basename='album')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'playlists', DanhSachPhatViewSet,basename='playlist')
router.register(r'favorites', YeuThichViewSet,    basename='yeu-thich')
router.register(r'history',   LichSuNgheViewSet,  basename='lich-su-nghe')

urlpatterns = [
    # Auth & Profile
    path('register/',      DangKyView.as_view(),           name='api_register'),
    path('login/',         TokenObtainPairView.as_view(),  name='api_login'),
    path('login/refresh/', TokenRefreshView.as_view(),     name='api_token_refresh'),
    path('users/me/',      UserProfileView.as_view(),      name='api_user_profile'),
    path('home/',          HomeView.as_view(),             name='api_home'),
    path('admin/stats/',   AdminStatsView.as_view(),       name='api_admin_stats'),
    path('admin/summary/', AdminSummaryView.as_view(),     name='api_admin_summary'),

    # Upload lên Cloudinary
    path('upload/image/', UploadAnhView.as_view(),  name='upload_image'),
    path('upload/signature/', CloudinaryUploadSignatureView.as_view(), name='upload_signature'),

    # Tất cả API CRUD qua Router
    path('', include(router.urls)),
]
