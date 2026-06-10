from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    NguoiDung, NgheSi, TheLoai, Album, BaiHat, 
    DanhSachPhat, LichSuNghe, YeuThich
)

# Đăng ký NguoiDung với UserAdmin (vì nó kế thừa AbstractUser)
admin.site.register(NguoiDung, UserAdmin)

# Đăng ký các model khác
admin.site.register(NgheSi)
admin.site.register(TheLoai)
admin.site.register(Album)
admin.site.register(BaiHat)
admin.site.register(DanhSachPhat)
admin.site.register(LichSuNghe)
admin.site.register(YeuThich)
