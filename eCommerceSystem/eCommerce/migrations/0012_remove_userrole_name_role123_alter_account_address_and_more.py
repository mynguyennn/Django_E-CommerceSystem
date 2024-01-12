# Generated by Django 5.0 on 2023-12-24 16:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0011_userrole_name_role123'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userrole',
            name='name_role123',
        ),
        migrations.AlterField(
            model_name='account',
            name='address',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='date_of_birth',
            field=models.DateField(null=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='email',
            field=models.EmailField(max_length=254, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='full_name',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='gender',
            field=models.BooleanField(null=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='phone',
            field=models.CharField(max_length=15, null=True),
        ),
    ]
