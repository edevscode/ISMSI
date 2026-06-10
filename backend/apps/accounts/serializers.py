from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Role, UserCredential


# ── Token helpers ─────────────────────────────────────────────────────────────

def _tokens_for_user(user: User) -> dict:
    refresh = RefreshToken()
    refresh['user_id'] = user.id
    refresh['role'] = user.role.name
    refresh['full_name'] = user.full_name
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ── Auth serializers ──────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text='Email or phone number')
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data['identifier'].strip()
        password = data['password']

        cred = (
            UserCredential.objects
            .select_related('user__role')
            .filter(email=identifier)
            .first()
        ) or (
            UserCredential.objects
            .select_related('user__role')
            .filter(user__phone_number=identifier)
            .first()
        )

        if cred is None or not cred.verify_password(password):
            raise AuthenticationFailed('Invalid credentials.')

        if not cred.user.is_active:
            raise AuthenticationFailed('Account is deactivated. Contact your administrator.')

        return {'user': cred.user, 'credential': cred}


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100)
    suffix = serializers.CharField(max_length=20, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError('Phone number already registered.')
        return value

    def validate_email(self, value):
        if value and UserCredential.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        try:
            resident_role = Role.objects.get(name='RESIDENT')
        except Role.DoesNotExist:
            raise serializers.ValidationError('System not initialized. Contact administrator.')

        user = User.objects.create(
            role=resident_role,
            first_name=validated_data['first_name'],
            middle_name=validated_data.get('middle_name') or None,
            last_name=validated_data['last_name'],
            suffix=validated_data.get('suffix') or None,
            phone_number=validated_data['phone_number'],
            address=validated_data.get('address') or None,
        )

        cred = UserCredential(
            user=user,
            email=validated_data.get('email') or None,
        )
        cred.set_password(validated_data['password'])
        cred.save()

        return user


# ── User serializers ──────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'middle_name', 'last_name', 'suffix',
            'phone_number', 'address', 'role_name', 'full_name', 'email',
            'is_active', 'created_at',
        ]

    def get_email(self, obj):
        try:
            return obj.credential.email
        except UserCredential.DoesNotExist:
            return None


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)


class AdminCreateAccountSerializer(serializers.Serializer):
    """Admin creates a TANOD or RESIDENT account."""
    role         = serializers.ChoiceField(choices=['TANOD', 'RESIDENT'])
    first_name   = serializers.CharField(max_length=100)
    middle_name  = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name    = serializers.CharField(max_length=100)
    suffix       = serializers.CharField(max_length=20, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20)
    email        = serializers.EmailField(required=False, allow_blank=True)
    address      = serializers.CharField(required=False, allow_blank=True)
    password     = serializers.CharField(min_length=8, write_only=True)

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError('Phone number already registered.')
        return value

    def validate_email(self, value):
        if value and UserCredential.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        role_name = validated_data['role']
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            raise serializers.ValidationError(f'{role_name} role not found. Run seed_roles first.')

        user = User.objects.create(
            role=role,
            first_name=validated_data['first_name'],
            middle_name=validated_data.get('middle_name') or None,
            last_name=validated_data['last_name'],
            suffix=validated_data.get('suffix') or None,
            phone_number=validated_data['phone_number'],
            address=validated_data.get('address') or None,
        )

        cred = UserCredential(
            user=user,
            email=validated_data.get('email') or None,
        )
        cred.set_password(validated_data['password'])
        cred.save()
        return user
