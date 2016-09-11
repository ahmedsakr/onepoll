from django.utils import timezone
from .models import Question

def validate_data(request):
    try:
        question_text = request.POST.get('question_text').strip()
    except (AttributeError):
        return ('illegal request', None, None)
    else:
        if question_text == None or question_text == "":
            return ('QUESTION NOT FOUND', None, None)

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
            return ('You have not provided a minimum of two choices.', None, None)

        return ('ok', question_text, choices)

def register_poll(request, question_text, choices):

    # register the question in the database
    question = Question(question_text = question_text, pub_date = timezone.now())

    if request.POST.get('privacy') == 'private':
        question.public_poll = 0

    question.save()

    # append all provided choices to the question
    for choice in choices:
        question.choice_set.create(choice_text=choice, votes=0)

    return question.id
