# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-04-22 19:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('onepoll', '0008_poll_image_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='poll',
            name='poll_type',
            field=models.CharField(default='Survey', max_length=30),
        ),
    ]
