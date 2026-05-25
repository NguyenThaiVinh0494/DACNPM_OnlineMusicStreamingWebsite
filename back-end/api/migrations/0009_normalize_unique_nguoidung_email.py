from django.db import migrations, models


def normalize_unique_emails(apps, schema_editor):
    user_model = apps.get_model('api', 'NguoiDung')
    used_emails = set()

    for user in user_model.objects.order_by('id').iterator():
        normalized_email = (user.email or '').strip().lower()

        if not normalized_email or normalized_email in used_emails:
            normalized_email = f'migration-placeholder-{user.pk}@invalid.local'
            suffix = 1
            while normalized_email in used_emails:
                normalized_email = f'migration-placeholder-{user.pk}-{suffix}@invalid.local'
                suffix += 1

        used_emails.add(normalized_email)
        if user.email != normalized_email:
            user_model.objects.filter(pk=user.pk).update(email=normalized_email)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_baihat_thoi_luong_album_tbl_album_trang_t_42048a_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(normalize_unique_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='nguoidung',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
