from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('voting', '0005_iprestriction_loginattempt_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='election',
            name='type',
            field=models.CharField(choices=[('general', 'General'), ('specific', 'Specific')], default='general', max_length=10),
        ),
    ]