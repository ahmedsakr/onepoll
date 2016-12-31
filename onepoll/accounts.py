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
        if person.email != "" and not is_valid_email(person.email):
            return False

    return True

def authenticate_login(request):
    person = Person(request)
    
    try:
        db_entry = Account.objects.get(username=person.username)
    except Account.DoesNotExist:
        db_entry = None

    if db_entry == None:
        return 'username', False

    if person.hashed_password == db_entry.last_access_token:
        return 'illegal', False

    db_entry.last_access_token = person.hashed_password
    db_entry.save()

    user_salt_size = int(person.hashed_password[0])
    user_jump = (user_salt_size * 2) + 1
    stored_salt_size = int(db_entry.password[0])
    stored_jump = (stored_salt_size * 2) + 1

    return 'none', person.hashed_password[user_jump:] == db_entry.password[stored_jump:]

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
    if person.email != "" and is_email_taken(person):
        return "email"

    account = Account(username=person.username, password=person.hashed_password, last_access_token=person.hashed_password, email=person.email, registration_date=timezone.now())
    account.save()

    return "registered"
