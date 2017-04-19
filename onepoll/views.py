import json

from django.http import Http404
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.views import generic

from random import randint

from .models import Choice, Poll, Participant
from onepoll import submit, public, utils
from onepoll.accounts import *

def view_index(request, username='', authenticated=''):
    template_name = 'onepoll/index.html'

    if (request.POST.get("username") != None):
        username, authenticated = authenticate_login(request)

    if len(Poll.objects.all()) == 0:
        return render(request, template_name, {
            'statistics': utils.get_statistics(),
            'authenticated': authenticated,
            'username': username,
        })

    polls = Poll.objects.all().filter(public_poll=1)
    latest_poll = None
    if len(polls) != 0:
        latest_poll = list(Poll.objects.all().filter(public_poll=1).order_by('-pub_date'))[0]

    return render(request, template_name, {
        'poll': latest_poll,
        'statistics': utils.get_statistics(),
        'authenticated': authenticated,
        'username': username,
    })

def view_register(request):
    template_name = 'onepoll/register.html'
    if len(request.POST) > 0:
        status = register_account(request)
        if status == "registered":
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, template_name, {
                'status' : status,
            })

    return render(request, template_name)

def view_detail(request, pid):
    poll = get_object_or_404(Poll, pid=pid)
    template_name = 'onepoll/detail.html'
    return render(request, template_name, {
        'poll': poll,
        'participated': utils.user_has_voted(request, poll),
        'private': poll.public_poll == 0,
    })

def view_random(request):
    polls = Poll.objects.all().filter(public_poll=1)
    if len(polls) == 0:
        return HttpResponseRedirect(reverse('index'))

    random = randint(0, len(polls) - 1)
    pid = polls[random].pid

    return HttpResponseRedirect(reverse('detail', args=(pid,)))

def view_results(request, pid):
    poll = get_object_or_404(Poll, pid=pid)
    template = 'onepoll/results.html'

    if request.POST.get('request') == 'update':
        json_data = {}
        json_data["total_votes"] = poll.get_total_votes()

        choices = {}
        json_data["choices"] = choices
        count = 0

        for choice in poll.choice_set.all():
            choice_data = {}
            pluralize = utils.pluralize(choice.votes)
            percentage = utils.percentage(choice.votes, poll.get_total_votes())

            choice_data["id"] = count
            choice_data["votes"] = choice.votes
            choice_data["text"] = "%s (%d vote%s, %.1f%%)" % (choice.choice_text, choice.votes, pluralize, percentage)

            choices["choice%d" %(count)] = choice_data
            count += 1

        return HttpResponse(json.dumps(json_data))
    else:
        return render(request, template, { 'poll': poll});

def view_vote(request, pid):
    poll = get_object_or_404(Poll, pid=pid)
    if utils.user_has_voted(request, poll):
        return render(request, 'onepoll/detail.html', {
            'poll': poll,
            'participated': True,
        })

    try:
        selected_choice = poll.choice_set.get(pk=request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the poll voting form.
        return render(request, 'onepoll/detail.html', {
            'poll': poll,
            'error_message': "You didn't select a choice.",
        })
    else:
        selected_choice.votes += 1
        selected_choice.save()

        name = request.POST['name']
        if name == '':
            name = 'Anonymous'
        poll.participant_set.create(ip=utils.get_ip(request), name=name)

        return HttpResponseRedirect(reverse('results', args=(poll.pid,)))

def view_new(request):
    template = 'onepoll/new.html'
    return render(request, template)

def view_public(request):
    template = 'onepoll/public.html'

    if request.POST.get('request') == 'update':
        return HttpResponse(public.get_filtered_polls(request))
    else:
        return render(request, template)

def view_submit(request):
    template = 'onepoll/submit.html'
    response, question_text, choices, category, submitter, image_link = submit.validate_data(request)

    if response == "ok":
        pid = submit.register_poll(request, question_text, choices, category, submitter, image_link)
        return render(request, template, {'pid': pid})
    else:
        return render(request, template, {'error_message': response})
