from .models import Question

def refine_polls(request):
    # get all the filter data from the user
    keywords = request.POST.get('keywords').split(',')
    search = request.POST.get('search')
    sort = request.POST.get('sort')
    amount = request.POST.get('amount')
    filtered_polls = ''

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
                return ''

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
                return ''

            questions = temp


    questions = questions.order_by('-%s' % sort)[:int(amount)]

    for question in questions:
        filtered_polls += '%d;%s;%d;%s\n' % (question.id,
        question.question_text,
        question.get_total_votes(),
        question.pub_date.strftime('%m-%d-%Y %H:%M'))

    return filtered_polls
