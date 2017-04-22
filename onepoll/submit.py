import string
import random

from django.utils import timezone
from .models import Poll

VALID_CATEGORIES = ["Science", "Mathematics", "Business", "History", "General Knowledge", "Other"]
VALID_TYPES = ["Factual", "Survey"]

def validate_data(request):
    try:
        question_text = request.POST.get('question_text').strip()
        category = request.POST.get('category').strip()
        poll_type = request.POST.get('poll-type').strip()
        privacy = request.POST.get('poll-privacy').strip()
        submitter = request.POST.get('submitter-tag').strip()
        image_link = request.POST.get("image-url").strip()
    except (AttributeError):
        return ('illegal request', None, None, None, None, None, None, None)
    else:
        if question_text == "":
            return ('QUESTION NOT FOUND', None, None, None, None, None, None, None)

        if not question_text.endswith('?'):
            question_text += '?'

        choices = []
        temp = None

        # polling all choice textboxes to collect valid input.
        for i in range(1, 11):
            if request.POST.get('choice%d_text' % i) == None:
                break
            else:
                temp = request.POST.get('choice%d_text' % i).strip()
                if temp != "":
                    choices.append(temp)

        # All polls should have a minimum of two choices.
        if len(choices) < 2:
            return ('You have not provided a minimum of two choices.', None, None, None, None, None, None, None)

        if submitter == "":
            submitter = "Anonymous"

        if category not in VALID_CATEGORIES:
            category = "Other"

        if poll_type not in VALID_TYPES:
            poll_type = "Survey"

        privacy = 1 if privacy == "public" else 0

        if image_link != "" and not (image_link.endswith("jpg") or image_link.endswith("png") or image_link.endswith("gif")):
            return ('You have provided an invalid question image link.', None, None, None, None, None, None, None)


        return ('ok', poll_type, privacy, question_text, choices, category, submitter, image_link)

def register_poll(request, poll_type, privacy, question_text, choices, category, submitter, image_link):

    # register the question in the database
    poll = Poll(pid=generate_id(), public_poll=privacy, poll_type=poll_type, question_text=question_text, pub_date=timezone.now(), category=category, submitter=submitter, image_link=image_link)
    poll.save()

    for choice in choices:
        poll.choice_set.create(choice_text=choice, votes=0)

    return poll.pid

def generate_id(size=4):
    chars =  string.ascii_uppercase + string.ascii_lowercase + string.digits
    return "".join(random.SystemRandom().choice(chars) for x in range(size))
