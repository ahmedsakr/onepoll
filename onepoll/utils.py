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