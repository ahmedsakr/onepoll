from .models import Account
from django.utils import timezone

class Person:
    def __init__(self, username, hashed_password, email=""):
        self.username = username
        self.hashed_password = hashed_password
        self.email = email
    def __init__(self, request):
        self.username = request.POST.get("username")
        self.hashed_password = request.POST.get("password")
        self.email = request.POST.get("email")

def is_valid_data(request, request_type="login"):
    person = Person(request)

    if len(person.username) < 3 or len(person.username) > 16:
        return False
    if len(person.hashed_password) < 8:
        return False

    if request_type == "register":
        if person.hashed_password != request.POST.get("password1"):
            return False
        if person.email != None and not is_valid_email(person.email):
            return False

    return True

def is_username_taken(person):
    return len(Account.objects.all().filter(username=person.username)) > 0
def is_email_taken(person):
    return len(Account.objects.all().filter(email=person.email)) > 0

def is_valid_email(email):
    if email == "":
        return True

    at_symbol = email.find('@')
    max_index = len(email) - 1
    if at_symbol > 0 and at_symbol < max_index:
         double_at = email.find('@', at_symbol + 1)
         dot = email.find('.', at_symbol + 1)
         if double_at == -1 and dot > 0 and dot < max_index:
             return email[-1] != "."

    return False

def register_account(person):
    if is_username_taken(person):
        return "username"
    if is_email_taken(person):
        return "email"

    account = Account(username=person.username, password=person.hashed_password, email=person.email, registration_date= timezone.now())
    account.save()

    return "registered"
