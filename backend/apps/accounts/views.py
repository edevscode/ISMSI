from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserCredential
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, ChangePasswordSerializer, AdminCreateAccountSerializer, _tokens_for_user
from .permissions import IsAuthenticated, IsAdmin


class LoginView(APIView):
    """Single login endpoint for all roles (ADMIN, TANOD, RESIDENT)."""

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        user = ser.validated_data['user']
        cred = ser.validated_data['credential']

        cred.last_login_at = timezone.now()
        cred.save(update_fields=['last_login_at'])

        tokens = _tokens_for_user(user)
        return Response({
            **tokens,
            'user_id': user.id,
            'role': user.role.name,
            'full_name': user.full_name,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
        })


class TokenRefreshView(APIView):
    """Refresh an access token using a valid refresh token."""

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh token required.'}, status=400)
        try:
            token = RefreshToken(refresh_token)
            return Response({'access': str(token.access_token)})
        except TokenError as e:
            return Response({'error': str(e)}, status=401)


class RegisterView(APIView):
    """Self-service registration — creates RESIDENT accounts only."""

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        tokens = _tokens_for_user(user)
        return Response({
            **tokens,
            'user_id': user.id,
            'role': user.role.name,
            'full_name': user.full_name,
        }, status=201)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        allowed = ['first_name', 'middle_name', 'last_name', 'suffix', 'address']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        try:
            cred = request.user.credential
        except UserCredential.DoesNotExist:
            return Response({'error': 'No credentials found.'}, status=400)

        if not cred.verify_password(ser.validated_data['current_password']):
            raise AuthenticationFailed('Current password is incorrect.')

        cred.set_password(ser.validated_data['new_password'])
        cred.save(update_fields=['password_hash', 'updated_at'])
        return Response({'message': 'Password updated successfully.'})


class AdminCreateAccountView(APIView):
    """
    Admin-only: create TANOD or RESIDENT accounts.
    POST body must include `role` = 'TANOD' | 'RESIDENT'.
    GET ?role=TANOD|RESIDENT lists active accounts of that role.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminCreateAccountSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response({
            'user_id':      user.id,
            'full_name':    user.full_name,
            'phone_number': user.phone_number,
            'role':         user.role.name,
            'email':        getattr(user.credential, 'email', None),
        }, status=201)

    def get(self, request):
        from .models import User
        role_name = request.query_params.get('role', '').upper()
        if role_name and role_name not in ('TANOD', 'RESIDENT'):
            return Response({'error': 'role must be TANOD or RESIDENT'}, status=400)

        users_qs = User.objects.filter(is_active=True, role__name__in=['TANOD', 'RESIDENT'])
        if role_name:
            users_qs = users_qs.filter(role__name=role_name)

        users = (
            users_qs
            .select_related('credential', 'role')
            .prefetch_related('verifications')
            .order_by('last_name', 'first_name')
        )

        data = []
        for user in users:
            latest_verif = max(
                user.verifications.all(),
                key=lambda v: v.created_at,
                default=None,
            )
            data.append({
                'id':                  user.id,
                'full_name':           user.full_name,
                'first_name':          user.first_name,
                'last_name':           user.last_name,
                'phone_number':        user.phone_number,
                'email':               getattr(getattr(user, 'credential', None), 'email', None),
                'address':             user.address,
                'verification_status': latest_verif.status if latest_verif else 'NONE',
                'created_at':          user.created_at.isoformat() if user.created_at else None,
                'role':                user.role.name,
            })
        return Response(data)
