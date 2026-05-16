from rest_framework import serializers
from .models import (
    NguoiDung, NgheSi, TheLoai, Album, BaiHat, 
    DanhSachPhat, BaoCao, LichSuNghe, TinNhan, YeuThich
)

class NguoiDungSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguoiDung
        # Không bao gồm 'password' để bảo mật khi trả về qua API
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'anh_dai_dien', 'vai_tro']

class DangKySerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = NguoiDung
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = NguoiDung.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class NgheSiSerializer(serializers.ModelSerializer):
    class Meta:
        model = NgheSi
        fields = '__all__'

class TheLoaiSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheLoai
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'

class BaiHatSerializer(serializers.ModelSerializer):
    # Nhúng thông tin nghệ sĩ vào response thay vì chỉ trả ID
    id_nghe_si = NgheSiSerializer(read_only=True)
    id_nghe_si_id = serializers.PrimaryKeyRelatedField(
        queryset=NgheSi.objects.all(), source='id_nghe_si', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = BaiHat
        fields = '__all__'

class DanhSachPhatSerializer(serializers.ModelSerializer):
    # Trả về chi tiết bài hát khi GET, nhưng cho phép truyền ID khi POST/PUT
    bai_hats_detail = BaiHatSerializer(source='bai_hats', many=True, read_only=True)
    so_luong_bai_hat = serializers.IntegerField(source='bai_hats.count', read_only=True)
    ten_chu_so_huu = serializers.CharField(source='id_chu_so_huu.username', read_only=True)
    bai_hats = serializers.PrimaryKeyRelatedField(many=True, queryset=BaiHat.objects.all(), required=False)

    class Meta:
        model = DanhSachPhat
        fields = ['id', 'tieu_de', 'id_chu_so_huu', 'ten_chu_so_huu', 'ngay_tao', 'bai_hats', 'bai_hats_detail', 'so_luong_bai_hat']
        read_only_fields = ['id_chu_so_huu', 'ngay_tao']

class BaoCaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaoCao
        fields = '__all__'

class LichSuNgheSerializer(serializers.ModelSerializer):
    class Meta:
        model = LichSuNghe
        fields = '__all__'

class TinNhanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TinNhan
        fields = '__all__'

class YeuThichSerializer(serializers.ModelSerializer):
    song_detail = BaiHatSerializer(source='id_bai_hat', read_only=True)
    class Meta:
        model = YeuThich
        fields = ['id', 'id_nguoi_dung', 'id_bai_hat', 'song_detail', 'ngay_thich']
        read_only_fields = ['id_nguoi_dung', 'ngay_thich']
