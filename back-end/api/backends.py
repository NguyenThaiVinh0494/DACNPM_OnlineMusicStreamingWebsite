from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.core.exceptions import MultipleObjectsReturned, ValidationError
from django.core.validators import validate_email

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)

        identifier = (username or '').strip()
        if not identifier or not password:
            return None

        try:
            validate_email(identifier)
        except ValidationError:
            return None

        try:
            user = User.objects.get(email__iexact=identifier)
        except User.DoesNotExist:
            return None
        except MultipleObjectsReturned:
            # Legacy duplicate identifiers must not turn a login request into a 500.
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
