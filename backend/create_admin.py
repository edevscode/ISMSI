"""
Seed script — creates roles and the initial admin account.

Credentials are read (in priority order) from:
  1. CLI flags:      --email, --password, --phone, --first, --last
  2. Environment:    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE, ADMIN_FIRST_NAME, ADMIN_LAST_NAME
  3. Interactive:    prompts the user if still missing

Usage:
    python create_admin.py
    python create_admin.py --email admin@example.com --phone 09171234567
"""
import os
import sys
import getpass
import argparse

# Bootstrap Django before any model imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from apps.accounts.models import Role, User, UserCredential


def _get_value(flag_value, env_key, prompt_label, is_secret=False):
    """Return the first non-empty value from: flag → env → interactive prompt."""
    value = (flag_value or os.environ.get(env_key, '')).strip()
    if not value:
        try:
            if is_secret:
                value = getpass.getpass(f'  {prompt_label}: ').strip()
            else:
                value = input(f'  {prompt_label}: ').strip()
        except (KeyboardInterrupt, EOFError):
            print('\nAborted.')
            sys.exit(1)
    if not value:
        print(f'\nError: {prompt_label} is required.')
        sys.exit(1)
    return value


def seed_roles():
    for name, desc in [
        ('ADMIN',    'Command Center administrator'),
        ('TANOD',    'Field responder / Tanod'),
        ('RESIDENT', 'Community resident'),
    ]:
        role, created = Role.objects.get_or_create(name=name)
        if not role.description:
            role.description = desc
            role.save(update_fields=['description'])
        print(f'  Role [{name}] - {"created" if created else "already exists"}')
    return {r.name: r for r in Role.objects.all()}


def create_admin(roles, email, password, phone, first_name, last_name):
    admin_role = roles['ADMIN']

    user, u_created = User.objects.get_or_create(
        phone_number=phone,
        defaults=dict(role=admin_role, first_name=first_name, last_name=last_name),
    )

    if not u_created and user.role != admin_role:
        user.role = admin_role
        user.save(update_fields=['role'])

    cred, c_created = UserCredential.objects.get_or_create(
        user=user,
        defaults=dict(email=email),
    )

    cred.email = email
    cred.set_password(password)
    cred.save(update_fields=['email', 'password_hash', 'updated_at'])

    action = 'created' if c_created else 'updated (password reset)'
    print(f'\n  Admin account {action}:')
    print(f'    Name  : {user.full_name}')
    print(f'    Email : {email}')
    print(f'    Phone : {phone}')
    print(f'    Role  : ADMIN')
    print(f'    Pass  : [set — not shown for security]')


def main():
    parser = argparse.ArgumentParser(description='Seed roles and create the initial admin account.')
    parser.add_argument('--email',    default=None, help='Admin email  (or set ADMIN_EMAIL in .env)')
    parser.add_argument('--password', default=None, help='Admin password (or set ADMIN_PASSWORD in .env)')
    parser.add_argument('--phone',    default=None, help='Admin phone  (or set ADMIN_PHONE in .env)')
    parser.add_argument('--first',    default=None, help='First name   (or set ADMIN_FIRST_NAME in .env)')
    parser.add_argument('--last',     default=None, help='Last name    (or set ADMIN_LAST_NAME in .env)')
    args = parser.parse_args()

    print('\n== ISMSI Seed Script ==================================')
    print('\nSeeding roles...')
    roles = seed_roles()

    print('\nAdmin account setup (leave blank to use .env value):')
    email     = _get_value(args.email,    'ADMIN_EMAIL',      'Email')
    password  = _get_value(args.password, 'ADMIN_PASSWORD',   'Password', is_secret=True)
    phone     = _get_value(args.phone,    'ADMIN_PHONE',      'Phone number')
    first     = _get_value(args.first,    'ADMIN_FIRST_NAME', 'First name')
    last      = _get_value(args.last,     'ADMIN_LAST_NAME',  'Last name')

    create_admin(roles=roles, email=email, password=password,
                 phone=phone, first_name=first, last_name=last)

    print('\n== Done ===============================================\n')


if __name__ == '__main__':
    main()
