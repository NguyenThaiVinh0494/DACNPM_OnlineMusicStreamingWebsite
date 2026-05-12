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
    DanhSachPhatViewSet,
    YeuThichViewSet,
    LichSuNgheViewSet,
)

# Router tự động tạo tất cả URL CRUD cho ViewSet
router = DefaultRouter()
router.register(r'songs',     BaiHatViewSet,      basename='bai-hat')
router.register(r'artists',   NgheSiViewSet,      basename='nghe-si')
router.register(r'genres',    TheLoaiViewSet,     basename='the-loai')
router.register(r'albums',    AlbumViewSet,       basename='album')
router.register(r'playlists', DanhSachPhatViewSet,basename='playlist')
router.register(r'favorites', YeuThichViewSet,    basename='yeu-thich')
router.register(r'history',   LichSuNgheViewSet,  basename='lich-su-nghe')

urlpatterns = [
    # Auth
    path('register/',      DangKyView.as_view(),           name='api_register'),
    path('login/',         TokenObtainPairView.as_view(),  name='api_login'),
    path('login/refresh/', TokenRefreshView.as_view(),     name='api_token_refresh'),

    # Tất cả API CRUD qua Router
    path('', include(router.urls)),
]
