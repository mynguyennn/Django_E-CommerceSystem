# Generated by Django 5.0 on 2023-12-24 16:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eCommerce', '0010_remove_product_product_at_remove_user_groups_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userrole',
            name='name_role123',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
