# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-19 15:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0002_question_public_poll'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='public_poll',
            field=models.IntegerField(default=1),
        ),
    ]
