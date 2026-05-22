# pyrefly: ignore [missing-import]
from rest_framework import serializers

from .cloudinary_utils import upload_audio_asset, upload_image_file
from .models import (
    Album,
    BaiHat,
    BaoCao,
    DanhSachPhat,
    LichSuNghe,
    NgheSi,
    NguoiDung,
    TheLoai,
    TinNhan,
    YeuThich,
)


class NguoiDungSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguoiDung
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'anh_dai_dien', 'vai_tro']


class NguoiDungSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = NguoiDung
        fields = ['id', 'username', 'anh_dai_dien', 'vai_tro']


class DangKySerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = NguoiDung
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = NguoiDung.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class AdminNguoiDungSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False, style={'input_type': 'password'})

    class Meta:
        model = NguoiDung
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'anh_dai_dien',
            'vai_tro',
            'is_active',
            'date_joined',
            'last_login',
            'password',
        ]
        read_only_fields = ['date_joined', 'last_login']
        extra_kwargs = {
            'anh_dai_dien': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': ['Vui lòng nhập mật khẩu cho tài khoản mới.']})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        return NguoiDung.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class CloudinaryUploadSerializerMixin:
    def _upload_image_into(self, validated_data, input_field, target_field, folder):
        image_file = validated_data.pop(input_field, None)
        if not image_file:
            return

        try:
            validated_data[target_field] = upload_image_file(image_file, folder)
        except ValueError as exc:
            raise serializers.ValidationError({input_field: [str(exc)]}) from exc

    def _upload_audio_into(self, validated_data, input_field, target_field, folder):
        audio_file = validated_data.pop(input_field, None)
        if not audio_file:
            return

        try:
            result = upload_audio_asset(audio_file, folder)
            validated_data[target_field] = result['secure_url']
            if not validated_data.get('thoi_luong') and result.get('duration'):
                validated_data['thoi_luong'] = round(result['duration'])
        except ValueError as exc:
            raise serializers.ValidationError({input_field: [str(exc)]}) from exc


class NullablePrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if data in ('', None, 'null'):
            if self.allow_null:
                return None
        return super().to_internal_value(data)


class NgheSiSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = NgheSi
        fields = ['id', 'ten_nghe_si', 'anh_nghe_si']


class TheLoaiSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TheLoai
        fields = ['id', 'ten_the_loai', 'anh_the_loai']


class AlbumSummarySerializer(serializers.ModelSerializer):
    ten_nghe_si = serializers.CharField(source='id_nghe_si.ten_nghe_si', read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'tieu_de', 'anh_bia', 'ngay_phat_hanh', 'trang_thai', 'ten_nghe_si']


class NgheSiSerializer(CloudinaryUploadSerializerMixin, serializers.ModelSerializer):
    artist_image_file = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = NgheSi
        fields = ['id', 'ten_nghe_si', 'tieu_su', 'anh_nghe_si', 'artist_image_file']
        extra_kwargs = {
            'anh_nghe_si': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.instance is None and not (attrs.get('anh_nghe_si') or attrs.get('artist_image_file')):
            raise serializers.ValidationError({'artist_image_file': ['Vui lòng chọn ảnh nghệ sĩ hoặc nhập URL ảnh.']})
        return attrs

    def create(self, validated_data):
        self._upload_image_into(validated_data, 'artist_image_file', 'anh_nghe_si', 'music_streaming/artists')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._upload_image_into(validated_data, 'artist_image_file', 'anh_nghe_si', 'music_streaming/artists')
        return super().update(instance, validated_data)


class TheLoaiSerializer(CloudinaryUploadSerializerMixin, serializers.ModelSerializer):
    topic_image_file = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = TheLoai
        fields = ['id', 'ten_the_loai', 'mo_ta_the_loai', 'anh_the_loai', 'topic_image_file']
        extra_kwargs = {
            'anh_the_loai': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.instance is None and not (attrs.get('anh_the_loai') or attrs.get('topic_image_file')):
            raise serializers.ValidationError({'topic_image_file': ['Vui lòng chọn ảnh thể loại hoặc nhập URL ảnh.']})
        return attrs

    def create(self, validated_data):
        self._upload_image_into(validated_data, 'topic_image_file', 'anh_the_loai', 'music_streaming/topics')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._upload_image_into(validated_data, 'topic_image_file', 'anh_the_loai', 'music_streaming/topics')
        return super().update(instance, validated_data)


class AlbumSerializer(CloudinaryUploadSerializerMixin, serializers.ModelSerializer):
    cover_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    id_nghe_si_detail = NgheSiSummarySerializer(source='id_nghe_si', read_only=True)
    song_ids = serializers.PrimaryKeyRelatedField(queryset=BaiHat.objects.all(), many=True, write_only=True, required=False)
    song_count = serializers.IntegerField(source='bai_hats.count', read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'tieu_de', 'anh_bia', 'id_nghe_si', 'id_nghe_si_detail', 'trang_thai', 'ngay_phat_hanh', 'cover_file', 'song_ids', 'song_count']
        extra_kwargs = {
            'anh_bia': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.instance is None and not (attrs.get('anh_bia') or attrs.get('cover_file')):
            raise serializers.ValidationError({'cover_file': ['Vui lòng chọn ảnh bìa hoặc nhập URL ảnh.']})
        return attrs

    def create(self, validated_data):
        song_ids = validated_data.pop('song_ids', [])
        self._upload_image_into(validated_data, 'cover_file', 'anh_bia', 'music_streaming/albums')
        album = super().create(validated_data)
        if song_ids:
            BaiHat.objects.filter(id_album=album).exclude(id__in=[song.id for song in song_ids]).update(id_album=None)
            BaiHat.objects.filter(id__in=[song.id for song in song_ids]).update(id_album=album)
        return album

    def update(self, instance, validated_data):
        song_ids = validated_data.pop('song_ids', None)
        self._upload_image_into(validated_data, 'cover_file', 'anh_bia', 'music_streaming/albums')
        album = super().update(instance, validated_data)
        if song_ids is not None:
            selected_song_ids = [song.id for song in song_ids]
            BaiHat.objects.filter(id_album=album).exclude(id__in=selected_song_ids).update(id_album=None)
            if selected_song_ids:
                BaiHat.objects.filter(id__in=selected_song_ids).update(id_album=album)
        return album


class BaiHatSerializer(CloudinaryUploadSerializerMixin, serializers.ModelSerializer):
    nghe_sis = NgheSiSummarySerializer(source='cac_nghe_si', many=True, read_only=True)
    so_luot_thich = serializers.SerializerMethodField()
    da_thich = serializers.SerializerMethodField()
    id_nghe_si = serializers.SerializerMethodField()
    id_nghe_si_ids = serializers.PrimaryKeyRelatedField(
        queryset=NgheSi.objects.all(),
        source='cac_nghe_si',
        many=True,
        write_only=True,
        required=False,
    )
    id_album = AlbumSummarySerializer(read_only=True)
    id_album_id = NullablePrimaryKeyRelatedField(
        queryset=Album.objects.all(),
        source='id_album',
        write_only=True,
        required=False,
        allow_null=True,
    )
    the_loais = TheLoaiSummarySerializer(many=True, read_only=True)
    the_loai_ids = serializers.PrimaryKeyRelatedField(
        queryset=TheLoai.objects.all(),
        source='the_loais',
        many=True,
        write_only=True,
        required=False,
    )
    id_nguoi_dang = NguoiDungSummarySerializer(read_only=True)
    image_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    audio_file = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = BaiHat
        fields = [
            'id',
            'tieu_de',
            'duong_dan_am_thanh',
            'duong_dan_hinh_anh',
            'loi_bai_hat',
            'thoi_luong',
            'luot_nghe',
            'so_luot_thich',
            'da_thich',
            'quoc_gia',
            'nam_phat_hanh',
            'trang_thai',
            'nghe_sis',
            'id_nghe_si',
            'id_nghe_si_ids',
            'id_album',
            'id_album_id',
            'the_loais',
            'the_loai_ids',
            'id_nguoi_dang',
            'image_file',
            'audio_file',
        ]
        read_only_fields = ['luot_nghe', 'so_luot_thich', 'da_thich', 'id_nguoi_dang']
        extra_kwargs = {
            'duong_dan_am_thanh': {'required': False, 'allow_blank': True},
            'duong_dan_hinh_anh': {'required': False, 'allow_blank': True},
            'loi_bai_hat': {'required': False, 'allow_null': True, 'allow_blank': True},
            'thoi_luong': {'required': False, 'allow_null': True},
            'quoc_gia': {'required': False, 'allow_null': True, 'allow_blank': True},
            'nam_phat_hanh': {'required': False, 'allow_null': True},
        }

    def get_id_nghe_si(self, obj):
        first_artist = obj.cac_nghe_si.first()
        if not first_artist:
            return None
        return NgheSiSummarySerializer(first_artist).data

    def get_so_luot_thich(self, obj):
        annotated_count = getattr(obj, 'so_luot_thich_annotated', None)
        if annotated_count is not None:
            return annotated_count

        return obj.duoc_yeu_thich.count()

    def get_da_thich(self, obj):
        annotated_value = getattr(obj, 'da_thich_value', None)
        if annotated_value is not None:
            return bool(annotated_value)

        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False

        return obj.duoc_yeu_thich.filter(id_nguoi_dung=request.user).exists()

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if self.instance is None:
            if not attrs.get('cac_nghe_si'):
                raise serializers.ValidationError({'id_nghe_si_ids': ['Vui lòng chọn ít nhất một nghệ sĩ.']})

            if not (attrs.get('duong_dan_hinh_anh') or attrs.get('image_file')):
                raise serializers.ValidationError({'image_file': ['Vui lòng chọn ảnh bài hát hoặc nhập URL ảnh.']})

            if not (attrs.get('duong_dan_am_thanh') or attrs.get('audio_file')):
                raise serializers.ValidationError({'audio_file': ['Vui lòng chọn file audio hoặc nhập URL audio.']})
        elif 'cac_nghe_si' in attrs and not attrs.get('cac_nghe_si'):
            raise serializers.ValidationError({'id_nghe_si_ids': ['Bài hát phải có ít nhất một nghệ sĩ.']})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['id_nguoi_dang'] = request.user

        self._upload_image_into(validated_data, 'image_file', 'duong_dan_hinh_anh', 'music_streaming/song_images')
        self._upload_audio_into(validated_data, 'audio_file', 'duong_dan_am_thanh', 'music_streaming/audio')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._upload_image_into(validated_data, 'image_file', 'duong_dan_hinh_anh', 'music_streaming/song_images')
        self._upload_audio_into(validated_data, 'audio_file', 'duong_dan_am_thanh', 'music_streaming/audio')
        return super().update(instance, validated_data)


class DanhSachPhatSerializer(serializers.ModelSerializer):
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
