from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name


class User(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, db_column='role_id')
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=20, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    address = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name, self.suffix]
        return ' '.join(p for p in parts if p)

    # ── DRF compatibility ────────────────────────────────────────────────────
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    # ── Role checks ──────────────────────────────────────────────────────────
    def is_role(self, role_name: str) -> bool:
        return self.role.name == role_name


class UserCredential(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        related_name='credential', db_column='user_id',
    )
    email = models.CharField(max_length=255, unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_credentials'

    def set_password(self, raw_password: str) -> None:
        self.password_hash = make_password(raw_password)

    def verify_password(self, raw_password: str) -> bool:
        return django_check_password(raw_password, self.password_hash)
