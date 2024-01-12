# Generated by Django 5.0 on 2023-12-25 08:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0016_remove_order_order_cart_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='paymentType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eCommerce.paymenttype'),
        ),
        migrations.AlterField(
            model_name='order',
            name='shippingType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eCommerce.shippingtype'),
        ),
    ]
