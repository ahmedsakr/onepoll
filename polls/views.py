from django.http import Http404
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone

from random import randint
# Create your views here.

from .models import Choice, Question

class IndexView(generic.ListView):
    template_name = 'polls/index.html'
    context_object_name = 'latest_question_list'

    def get_queryset(self):
        """Return the last five published questions."""
        return Question.objects.order_by('-pub_date')[:5]


def detail(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    template_name = 'polls/detail.html'

    return render(request, template_name, {'question': question})

def random(request):
    questions = list(Question.objects.all())
    random = randint(0, len(questions) - 1)
    question_id = questions[random].id

    return HttpResponseRedirect(reverse('polls:detail', args=(question_id,)))

def results(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    template = 'polls/results.html'

    if request.POST.get('request') == 'update':
        count = 1
        data = ''
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
        return HttpResponseRedirect(reverse('polls:results', args=(question.id,)))

def new(request):
    template = 'polls/new.html'
    return render(request, template)

def public(request):
    return HttpResponse("Yep")

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
