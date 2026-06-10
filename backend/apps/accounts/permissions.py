from rest_framework.permissions import BasePermission


def _authenticated_role(request) -> str | None:
    """Return the role name if the request is authenticated, else None."""
    u = request.user
    if not u or not getattr(u, 'is_authenticated', False):
        return None
    try:
        return u.role.name
    except Exception:
        return None


class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _authenticated_role(request) == 'ADMIN'


class IsTanod(BasePermission):
    def has_permission(self, request, view):
        return _authenticated_role(request) == 'TANOD'


class IsResident(BasePermission):
    def has_permission(self, request, view):
        return _authenticated_role(request) == 'RESIDENT'


class IsAdminOrTanod(BasePermission):
    def has_permission(self, request, view):
        return _authenticated_role(request) in ('ADMIN', 'TANOD')


class IsAdminOrOwner(BasePermission):
    """Admin sees all; owner sees only their own. Views must set self.owner_field."""
    def has_object_permission(self, request, view, obj):
        if _authenticated_role(request) == 'ADMIN':
            return True
        owner_field = getattr(view, 'owner_field', 'user')
        owner = getattr(obj, owner_field, None)
        return owner and owner.id == request.user.id
