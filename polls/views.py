from django.http import Http404
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.views import generic

from random import randint

from .models import Choice, Question
import polls.submit, polls.public, polls.utils

def index(request):
    template_name = 'polls/index.html'
    question = Question.objects.all().filter(public_poll=1)
    question = list(question.order_by('-pub_date'))[0]

    return render(request, template_name, {
        'question': question,
        'total_polls': Question.objects.count(),
        'public_polls': Question.objects.all().filter(public_poll=1).count(),
        'votes_casted': polls.utils.get_total_votes()})


def detail(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    template_name = 'polls/detail.html'

    question.views += 1
    question.save()

    if question.public_poll == 1:
        return render(request, template_name, {'question': question})
    else:
        return render(request, template_name, {
            'question': question,
            'private': True
        })

def random(request):
    questions = list(Question.objects.all().filter(public_poll=1))
    random = randint(0, len(questions) - 1)
    question_id = questions[random].id

    return HttpResponseRedirect(reverse('detail', args=(question_id,)))

def results(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    template = 'polls/results.html'

    if request.POST.get('request') == 'update':
        count = 1
        data = 'total_votes=%d;' % question.get_total_votes()

        pluralize = None
        percentage = None
        for choice in question.choice_set.all():
            pluralize = polls.utils.pluralize(choice.votes)
            percentage = polls.utils.percentage(choice.votes, question.get_total_votes())

            if count < question.choice_set.count():
                data += "%s (%d vote%s, %.1f%%)=%d;" % (choice.choice_text, choice.votes, pluralize, percentage, choice.votes)
            else:
                data += "%s (%d vote%s, %.1f%%)=%d" % (choice.choice_text, choice.votes, pluralize, percentage, choice.votes)
            count += 1

        return HttpResponse(data)
    else:
        return render(request, template, { 'question': question});

def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(request, 'polls/detail.html', {
            'question': question,
            'error_message': "You didn't select a choice.",
        })
    else:
        selected_choice.votes += 1
        selected_choice.save()

        total_votes = 0

        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse('results', args=(question.id,)))

def new(request):
    template = 'polls/new.html'
    return render(request, template)

def public(request):
    template = 'polls/public.html'

    if request.POST.get('request') == 'update':
        filtered_polls = polls.public.refine_polls(request)
        return HttpResponse(filtered_polls)
    else:
        return render(request, template)

def submit(request):
    template = 'polls/submit.html'
    response, question_text, choices = polls.submit.validate_data(request)

    if response == "ok":
        question_id = polls.submit.register_poll(request, question_text, choices)
        return render(request, template, {'question_id': question_id})
    else:
        return render(request, template, {'error_message': response})
