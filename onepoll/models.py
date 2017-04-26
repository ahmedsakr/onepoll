import datetime

from django.db import models
from django.utils import timezone

class Account(models.Model):
    username = models.CharField(max_length=16)
    password = models.CharField(max_length=60)
    last_access_token = models.CharField(max_length=60, default='')
    email = models.CharField(max_length=50, default='')
    registration_date = models.DateField('registration date')


class Poll(models.Model):
    pid = models.CharField(max_length=4, default='AbcD')
    category = models.CharField(max_length=50, default='Other')
    question_text = models.CharField(max_length=200)
    pub_date = models.DateField('date published')
    public_poll = models.IntegerField(default=1)
    poll_type = models.CharField(max_length=30, default="Survey")
    submitter = models.CharField(max_length=20, default="Anonymous")
    image_link = models.CharField(max_length=300, default="")

    def __str__(self):
        return self.question_text
    def get_total_votes(self):
        votes = 0
        for choice in self.choice_set.all():
            votes += choice.votes

        return votes

class Choice(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    def __str__(self):
        return self.choice_text

class Participant(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    ip = models.CharField(max_length=30)
    name = models.CharField(max_length=30, default="Anonymous")
