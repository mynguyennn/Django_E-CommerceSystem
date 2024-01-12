# Generated by Django 5.0 on 2024-01-09 09:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0024_alter_store_account'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='product_order',
            field=models.ManyToManyField(null=True, related_name='product_order', through='eCommerce.OrderDetail', to='eCommerce.order'),
        ),
        migrations.AlterField(
            model_name='product',
            name='store',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='eCommerce.store'),
        ),
    ]
