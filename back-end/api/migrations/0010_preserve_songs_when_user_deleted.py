from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_normalize_unique_nguoidung_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='baihat',
            name='id_nguoi_dang',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='bai_hats_da_dang',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
