from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.core.exceptions import MultipleObjectsReturned

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)

        identifier = (username or '').strip()
        if not identifier or not password:
            return None

        try:
            user = User.objects.get(Q(username=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            return None
        except MultipleObjectsReturned:
            # Legacy duplicate identifiers must not turn a login request into a 500.
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
