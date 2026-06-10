"""
Usage: python manage.py seed_roles [--admin-email EMAIL] [--admin-password PW]

Creates the three system roles (ADMIN, TANOD, RESIDENT) and a default admin
user. All credential values must come from .env or be passed explicitly —
no hardcoded defaults are used.
"""
import os
import sys
from django.core.management.base import BaseCommand, CommandError


def _require_env(key: str) -> str:
    value = os.environ.get(key, '').strip()
    if not value:
        raise CommandError(
            f'{key} is not set. Add it to your .env file or pass it as a flag.'
        )
    return value


class Command(BaseCommand):
    help = 'Seed roles and create the initial admin user'

    def add_arguments(self, parser):
        parser.add_argument('--admin-email',    default=None, help='Admin email (or set ADMIN_EMAIL in .env)')
        parser.add_argument('--admin-password', default=None, help='Admin password (or set ADMIN_PASSWORD in .env)')
        parser.add_argument('--admin-phone',    default=None, help='Admin phone (or set ADMIN_PHONE in .env)')
        parser.add_argument('--admin-first',    default=None, help='Admin first name (or set ADMIN_FIRST_NAME in .env)')
        parser.add_argument('--admin-last',     default=None, help='Admin last name (or set ADMIN_LAST_NAME in .env)')

    def handle(self, *args, **options):
        from apps.accounts.models import Role, User, UserCredential

        # ── Roles ─────────────────────────────────────────────────────────────
        for role_name, desc in [
            ('ADMIN',    'Command Center administrator'),
            ('TANOD',    'Field responder / Tanod'),
            ('RESIDENT', 'Community resident'),
        ]:
            role, created = Role.objects.get_or_create(name=role_name)
            if desc and not role.description:
                role.description = desc
                role.save(update_fields=['description'])
            self.stdout.write(
                self.style.SUCCESS(f'  {"Created" if created else "Exists "} role: {role_name}')
            )

        # ── Resolve admin credentials (env or explicit flags, never hardcoded) ─
        email    = options['admin_email']    or _require_env('ADMIN_EMAIL')
        password = options['admin_password'] or _require_env('ADMIN_PASSWORD')
        phone    = options['admin_phone']    or _require_env('ADMIN_PHONE')
        first    = options['admin_first']    or os.environ.get('ADMIN_FIRST_NAME', '').strip() or 'Admin'
        last     = options['admin_last']     or os.environ.get('ADMIN_LAST_NAME',  '').strip() or 'User'

        # ── Admin user ─────────────────────────────────────────────────────────
        admin_role = Role.objects.get(name='ADMIN')
        user, u_created = User.objects.get_or_create(
            phone_number=phone,
            defaults=dict(role=admin_role, first_name=first, last_name=last),
        )

        cred, c_created = UserCredential.objects.get_or_create(
            user=user,
            defaults=dict(email=email),
        )
        if c_created or not cred.password_hash:
            cred.email = email
            cred.set_password(password)
            cred.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'\n  {"Created" if u_created else "Exists "} admin: {email} / {phone}\n'
                f'  Password: {"set" if c_created else "unchanged (already hashed in DB)"}'
            )
        )
