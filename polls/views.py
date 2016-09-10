from django.http import Http404
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone

from random import randint
# Create your views here.

from .models import Choice, Question

def index(request):
    template_name = 'polls/index.html'
    question = list(Question.objects.all().filter(public_poll=1).order_by('-pub_date'))[0]

    return render(request, template_name, {'question': question})


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
        for choice in question.choice_set.all():
            if count < question.choice_set.count():
                data += "%s (%d vote%s, %.1f%%)=%d;" % (choice.choice_text, choice.votes, pluralize(choice.votes), percentage(choice.votes, question.get_total_votes()), choice.votes)
            else:
                data += "%s (%d vote%s, %.1f%%)=%d" % (choice.choice_text, choice.votes, pluralize(choice.votes), percentage(choice.votes, question.get_total_votes()), choice.votes)
            count += 1

        return HttpResponse(data)
    else:
        return render(request, template, { 'question': question});

def pluralize(votes):
    if votes > 1:
        return 's'
    else:
        return ''

def percentage(votes, total_votes):
    return (float(votes) / total_votes) * 100

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

        # get all the filter data from the user
        keywords = request.POST.get('keywords').split(',')
        search = request.POST.get('search')
        sort = request.POST.get('sort')
        amount = request.POST.get('amount')
        out_data = ''

        # acquire all objects and remove all private polls right off the bat
        questions = Question.objects.all().filter(public_poll=1)

        # keywords have been found, so further filtering is required
        if keywords[0] != '':

            if search == 'match':

                '''
                if the user has specified that all the keywords they have provided
                are to be found in the question text, then a simple for loop on
                all keywords and filtering will do it.
                '''
                for keyword in keywords:
                    questions = questions.filter(question_text__contains=keyword)

                # if no polls have passsed all keywords, prematurely return
                # an empty HttpResponse
                if len(questions) == 0:
                    return HttpResponse('')

            elif search == 'any':
                '''
                The difference from a 'match' request is that all polls containing
                any keyword are to be collected. So as shown, an empty QuerySet
                is created and the filtered results will be added to it.
                '''
                temp = Question.objects.none()
                for keyword in keywords:
                    temp = temp | questions.filter(question_text__contains=keyword)

                # if no polls have passsed any keyword, prematurely return
                # an empty HttpResponse
                if len(temp) == 0:
                    return HttpResponse('')

                questions = temp


        questions = questions.order_by('-%s' % sort)[:int(amount)]

        for question in questions:
            out_data += '%d;%s;%d;%d;%s\n' % (question.id,
            question.question_text,
            question.get_total_votes(),
            question.views,
            question.pub_date.strftime('%m-%d-%Y %H:%M'))

        return HttpResponse(out_data)
    else:
        return render(request, template)

def submit(request):

    template = 'polls/submit.html'

    try:
        question_text = request.POST.get('question_text').strip()
    except (AttributeError):
        # this error results from having no POST data available
        # i.e the user loading /polls/new/submit/ without going through the
        # form
        return render(request, template, {
            'error_message' : 'illegal request'
        })
    else:
        if question_text == None or question_text == "":
            return render(request, template, {
                'error_message' : 'QUESTION NOT FOUND'
            })

        if not question_text.endswith('?'):
            question_text += '?'

        choices = []
        temp = None

        # polling all choice textboxes to collect valid input.
        for i in range(1, 5):
            temp = request.POST.get('choice%d_text' % i).strip()
            if temp != None and temp != "":
                choices.append(temp)

        # All polls should have a minimum of two choices.
        if len(choices) < 2:
            return render(request, template, {
                'error_message' : 'You have not provided a minimum of two choices.'
            })

        # register the question in the database
        question = Question(question_text = question_text, pub_date = timezone.now())

        if request.POST.get('privacy') == 'private':
            question.public_poll = 0

        question.save()

        # append all provided choices to the question
        for choice in choices:
            question.choice_set.create(choice_text=choice, votes=0)

        return render(request, template, {
            'question_id': question.id,
        })
