from .models import Poll, Participant

def pluralize(num):
    if num != 1:
        return 's'
    else:
        return ''

def percentage(num, total):
    return (float(num) / total) * 100

def get_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    return ip
def get_total_votes():
    total_votes = 0
    for poll in Poll.objects.all():
        total_votes += poll.get_total_votes()

    return total_votes

def get_unique_voters():
    return len(set(Participant.objects.all()))

def user_has_voted(request, poll):
    ip = get_ip(request)
    return any(user.ip == ip for user in poll.participant_set.all())

def get_statistics():
    polls = Poll.objects.all()
    public_polls = polls.filter(public_poll=1)
    unique_voters = get_unique_voters()
    total_votes = get_total_votes()
    total_polls = len(polls)

    average_votes = 0
    if total_polls != 0:
        average_votes = float(total_votes) / total_polls

    return ([
        '%d Poll%s' % (total_polls, pluralize(total_polls)),
        'Public polls: %d' % (len(public_polls)),
        'Private polls: %d' % (total_polls - len(public_polls))
    ], [
        '%d voter%s' % (unique_voters, pluralize(unique_voters)),
        'Average votes per poll: %.1f' % (average_votes),
        'Votes casted: %d' % (total_votes)
    ])
