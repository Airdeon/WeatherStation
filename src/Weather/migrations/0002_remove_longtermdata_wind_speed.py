# Generated by Django 4.0.6 on 2022-08-11 12:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Weather', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='longtermdata',
            name='wind_speed',
        ),
    ]
