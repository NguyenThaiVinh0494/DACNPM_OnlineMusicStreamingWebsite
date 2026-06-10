from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_remove_baocao_model'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='DROP TABLE IF EXISTS tbl_tin_nhan',
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.DeleteModel(
                    name='TinNhan',
                ),
            ],
        ),
    ]
