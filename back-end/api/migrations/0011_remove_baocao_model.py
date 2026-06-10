from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_preserve_songs_when_user_deleted'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='DROP TABLE IF EXISTS tbl_bao_cao',
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.DeleteModel(
                    name='BaoCao',
                ),
            ],
        ),
    ]
