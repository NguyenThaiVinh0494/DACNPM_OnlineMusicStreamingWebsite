from django.db import models
from django.contrib.auth.models import AbstractUser

class NguoiDung(AbstractUser):
    anh_dai_dien = models.URLField(default='def.jpg', max_length=500)
    vai_tro = models.CharField(max_length=10, choices=[('USER', 'User'), ('ADMIN', 'Admin')], default='USER')
    class Meta:
        db_table = 'tbl_nguoi_dung'
# 4. Bảng tbl_nghe_si
class NgheSi(models.Model):
    ten_nghe_si = models.CharField(max_length=150)
    tieu_su = models.TextField(blank=True, null=True)
    anh_nghe_si = models.URLField(max_length=500, blank=True, null=True)
    class Meta:
        db_table = 'tbl_nghe_si'
# 6. Bảng tbl_the_loai
class TheLoai(models.Model):
    ten_the_loai = models.CharField(max_length=100)
    mo_ta_the_loai = models.TextField(blank=True, null=True)
    anh_the_loai = models.URLField(max_length=500, blank=True, null=True)
    class Meta:
        db_table = 'tbl_the_loai'
# 3. Bảng tbl_album
class Album(models.Model):
    tieu_de = models.CharField(max_length=255)
    anh_bia = models.URLField(max_length=500)
    id_nghe_si = models.ForeignKey(NgheSi, on_delete=models.CASCADE, related_name='albums')
    trang_thai = models.CharField(max_length=10, choices=[('PENDING', 'Pending'), ('PUBLIC', 'Public')], default='PENDING')
    ngay_phat_hanh = models.DateField(blank=True, null=True)
    class Meta:
        db_table = 'tbl_album'
# 2. Bảng tbl_bai_hat
class BaiHat(models.Model):
    tieu_de = models.CharField(max_length=255)
    duong_dan_am_thanh = models.URLField(max_length=500)
    duong_dan_hinh_anh = models.URLField(max_length=500)
    loi_bai_hat = models.TextField(blank=True, null=True)  # Lời bài hát (có thể để trống)
    luot_nghe = models.IntegerField(default=0)
    quoc_gia = models.CharField(max_length=50, blank=True, null=True)
    nam_phat_hanh = models.IntegerField(blank=True, null=True)
    trang_thai = models.CharField(max_length=10, choices=[('PENDING', 'Pending'), ('PUBLIC', 'Public')], default='PENDING')
    cac_nghe_si = models.ManyToManyField(NgheSi, related_name='bai_hats', db_table='tbl_bai_hat_nghe_si')
    id_album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='bai_hats')
    the_loais = models.ManyToManyField(TheLoai, related_name='bai_hats', db_table='tbl_bai_hat_the_loai', blank=True)
    id_nguoi_dang = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='bai_hats_da_dang')
    class Meta:
        db_table = 'tbl_bai_hat'
# 5. Bảng tbl_danh_sach_phat
class DanhSachPhat(models.Model):
    tieu_de = models.CharField(max_length=255)
    id_chu_so_huu = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='playlists')
    ngay_tao = models.DateTimeField(auto_now_add=True)
    
    bai_hats = models.ManyToManyField(BaiHat, related_name='playlists', db_table='tbl_chi_tiet_playlist')
    class Meta:
        db_table = 'tbl_danh_sach_phat'
# 7. Bảng tbl_bao_cao
class BaoCao(models.Model):
    id_nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='bao_caos')
    id_bai_hat = models.ForeignKey(BaiHat, on_delete=models.CASCADE, related_name='bi_bao_caos')
    ly_do = models.TextField()
    trang_thai_xu_ly = models.CharField(max_length=10, choices=[('WAITING', 'Waiting'), ('DONE', 'Done')], default='WAITING')
    ngay_bao_cao = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'tbl_bao_cao'
# 8. Bảng tbl_lich_su_nghe
class LichSuNghe(models.Model):
    id_nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='lich_su_nghe')
    id_bai_hat = models.ForeignKey(BaiHat, on_delete=models.CASCADE, related_name='lich_su_nghe')
    thoi_gian_nghe = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'tbl_lich_su_nghe'
# 9. Bảng tbl_tin_nhan
class TinNhan(models.Model):
    id_nguoi_gui = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='tin_nhan_gui')
    id_nguoi_nhan = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='tin_nhan_nhan')
    noi_dung = models.TextField()
    thoi_gian_gui = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'tbl_tin_nhan'
# 11. Bảng tbl_yeu_thich
class YeuThich(models.Model):
    id_nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='yeu_thich')
    id_bai_hat = models.ForeignKey(BaiHat, on_delete=models.CASCADE, related_name='duoc_yeu_thich')
    ngay_thich = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'tbl_yeu_thich'
        unique_together = ('id_nguoi_dung', 'id_bai_hat')
