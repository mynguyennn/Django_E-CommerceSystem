# Generated by Django 5.0 on 2023-12-24 16:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0013_alter_account_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attribute',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='attribute', to='eCommerce.product'),
        ),
    ]
