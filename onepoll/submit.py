import string
import random

from django.utils import timezone
from .models import Poll

def validate_data(request):
    try:
        question_text = request.POST.get('question_text').strip()
    except (AttributeError):
        return ('illegal request', None, None, None, None, None)
    else:
        if question_text == None or question_text == "":
            return ('QUESTION NOT FOUND', None, None, None, None, None)

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
            return ('You have not provided a minimum of two choices.', None, None, None, None, None)

        category = request.POST.get('category')
        submitter = request.POST.get('submitter')
        image_link = request.POST.get("question-image")
        if submitter == "":
            submitter = "Anonymous"

        if image_link != "" and not (image_link.endswith("jpg") or image_link.endswith("png") or image_link.endswith("gif")):
            return ('You have provided an invalid question image link.', None, None, None, None, None)


        return ('ok', question_text, choices, category, submitter, image_link)

def register_poll(request, question_text, choices, category, submitter, image_link):

    # register the question in the database
    poll = Poll(pid=generate_id(), question_text = question_text, pub_date = timezone.now(), category = category, submitter = submitter, image_link = image_link)
    if request.POST.get('privacy') == 'private':
        poll.public_poll = 0

    poll.save()

    for choice in choices:
        poll.choice_set.create(choice_text=choice, votes=0)

    return poll.pid

def generate_id(size=4):
    chars =  string.ascii_uppercase + string.ascii_lowercase + string.digits
    return "".join(random.SystemRandom().choice(chars) for x in range(size))
