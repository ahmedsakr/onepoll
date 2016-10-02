from django.http import Http404
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.views import generic

from random import randint

from .models import Choice, Poll, Participant
import onepoll.submit, onepoll.public, onepoll.utils

def index(request):
    template_name = 'onepoll/index.html'
    if len(Poll.objects.all()) == 0:
        return render(request, template_name)

    polls = Poll.objects.all().filter(public_poll=1)
    latest_poll = None
    if len(polls) != 0:
        latest_poll = list(Poll.objects.all().filter(public_poll=1).order_by('-pub_date'))[0]

    return render(request, template_name, {
        'poll': latest_poll,
        'total_polls': Poll.objects.count(),
        'public_polls': Poll.objects.all().filter(public_poll=1).count(),
        'votes_casted': onepoll.utils.get_total_votes(),
        'unique_voters': onepoll.utils.get_unique_voters(),
    })

def register(request):
    template_name = 'onepoll/register.html'
    return render(request, template_name)

def detail(request, poll_id):
    poll = get_object_or_404(Poll, id=poll_id)
    template_name = 'onepoll/detail.html'

    if poll.public_poll == 1:
        return render(request, template_name, {
        'poll': poll,
        'already_participated': onepoll.utils.user_has_voted(request, poll),
        })
    else:
        return render(request, template_name, {
            'poll': poll,
            'already_participated': onepoll.utils.user_has_voted(request, poll),
            'private': True
        })

def random(request):
    polls = list(Poll.objects.all().filter(public_poll=1))
    if len(polls) == 0:
        return HttpResponseRedirect(reverse('index'))

    random = randint(0, len(polls) - 1)
    poll_id = polls[random].id

    return HttpResponseRedirect(reverse('detail', args=(poll_id,)))

def results(request, poll_id):
    poll = get_object_or_404(Poll, id=poll_id)
    template = 'onepoll/results.html'

    if request.POST.get('request') == 'update':
        count = 1
        data = 'total_votes=%d;' % poll.get_total_votes()

        pluralize = None
        percentage = None
        for choice in poll.choice_set.all():
            pluralize = onepoll.utils.pluralize(choice.votes)
            percentage = onepoll.utils.percentage(choice.votes, poll.get_total_votes())

            if count < poll.choice_set.count():
                data += "%s (%d vote%s, %.1f%%)=%d;" % (choice.choice_text, choice.votes, pluralize, percentage, choice.votes)
            else:
                data += "%s (%d vote%s, %.1f%%)=%d" % (choice.choice_text, choice.votes, pluralize, percentage, choice.votes)
            count += 1

        return HttpResponse(data)
    else:
        return render(request, template, { 'poll': poll});

def vote(request, poll_id):
    poll = get_object_or_404(Poll, pk=poll_id)
    if onepoll.utils.user_has_voted(request, poll):
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
        poll.participant_set.create(ip=onepoll.utils.get_ip(request))

        return HttpResponseRedirect(reverse('results', args=(poll.id,)))

def new(request):
    template = 'onepoll/new.html'
    return render(request, template)

def public(request):
    template = 'onepoll/public.html'

    if request.POST.get('request') == 'update':
        return HttpResponse(onepoll.public.refine_polls(request))
    else:
        return render(request, template)

def submit(request):
    template = 'onepoll/submit.html'
    response, question_text, choices, category = onepoll.submit.validate_data(request)

    if response == "ok":
        poll_id = onepoll.submit.register_poll(request, question_text, choices, category)
        return render(request, template, {'poll_id': poll_id})
    else:
        return render(request, template, {'error_message': response})
