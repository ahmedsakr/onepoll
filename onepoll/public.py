from .models import Poll
from django.core import serializers
def get_filtered_polls(request):
    # get all the filter data from the user
    keywords = request.POST.get('keywords').split(',')
    keyword_match = request.POST.get('keyword-match')
    sort = request.POST.get('sort')
    amount = request.POST.get('amount')
    category = request.POST.get('category')
    filtered_polls = ''

    # filter out all private posts and posts not in the specified category.
    polls = Poll.objects.all().filter(public_poll=1)
    if category != "All":
        polls = polls.filter(category=category)

    # keywords have been found, so further filtering is required
    if keywords[0] != '':

        if keyword_match == 'true':

            '''
            if the user has specified that all the keywords they have provided
            are to be found in the question text, then a simple for loop on
            all keywords and filtering will do it.
            '''
            for keyword in keywords:
                polls = polls.filter(question_text__contains=keyword)

            # if no polls have passed all keywords, prematurely return
            if len(polls) == 0:
                return ''

        elif keyword_match == 'false':
            '''
            The difference from a 'match' request is that all polls containing
            any keyword are to be collected. So as shown, an empty QuerySet
            is created and the filtered results will be added to it.
            '''
            temp = Poll.objects.none()
            for keyword in keywords:
                temp = temp | polls.filter(question_text__contains=keyword)

            # if no polls have passed any keyword, prematurely return
            if len(temp) == 0:
                return ''

            polls = temp


    polls = polls.order_by('-id')[:int(amount)]
    return serializers.serialize('json', polls.all(), fields=('pid', 'category', 'question_text', 'pub_date'))
