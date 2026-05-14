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
    class Meta:
        model = DanhSachPhat
        fields = '__all__'

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
    class Meta:
        model = YeuThich
        fields = '__all__'
