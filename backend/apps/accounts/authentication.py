from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CustomJWTAuthentication(JWTAuthentication):
    """Validates JWT tokens against our custom User model (not Django auth.User)."""

    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        if user_id is None:
            raise InvalidToken('Token contains no user_id claim')

        try:
            from .models import User
            return User.objects.select_related('role').get(id=user_id, is_active=True)
        except User.DoesNotExist:
            raise InvalidToken('No active user for this token')
