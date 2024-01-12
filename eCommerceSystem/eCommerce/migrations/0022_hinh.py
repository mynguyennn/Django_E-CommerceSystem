# Generated by Django 5.0 on 2024-01-08 08:44

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0021_remove_account_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Hinh',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('hinh', cloudinary.models.CloudinaryField(max_length=255, null=True, verbose_name='hinh')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
